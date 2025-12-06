import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { username, key } = req.body;
    if (!username || !key) {
      return res.status(400).json({ message: 'Username and Access Key are required' });
    }

    const { db } = await connectToDatabase();
    const foundKey = await db.collection('keys').findOne({ username: username, value: key });

    if (foundKey) {
      // Check if the key is expired
      if (foundKey.expiresAt && new Date(foundKey.expiresAt) < new Date()) {
        // Log the failed login attempt to history
        const historyLog = {
          username: foundKey.username,
          action: 'Expired Key Login Attempt',
          details: `User '${foundKey.username}' attempted to log in, but their key has expired.`,
          timestamp: new Date(),
        };
        await db.collection('history').insertOne(historyLog);
        
        return res.status(403).json({ message: 'Access Key has expired.' });
      }

      const { _id, ...keyData } = foundKey;
      return res.status(200).json({ id: _id.toHexString(), ...keyData });
    } else {
      return res.status(401).json({ message: 'Invalid username or key' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return res.status(500).json({ message });
  }
}
