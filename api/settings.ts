import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';

const SETTINGS_ID = 'global_settings'; // Use a fixed identifier for the single settings document

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { db } = await connectToDatabase();
  const settingsCollection = db.collection('settings');

  try {
    switch (req.method) {
      case 'GET': {
        let settings = await settingsCollection.findOne({ settingsId: SETTINGS_ID });
        // Optional: Create default settings if they don't exist
        if (!settings) {
          const defaultSettings = {
            settingsId: SETTINGS_ID,
            botToken: process.env.BOT_TOKEN || '',
            chatId: process.env.CHAT_ID || '',
            mongoURI: '' // This shouldn't be exposed to client
          };
          await settingsCollection.insertOne(defaultSettings);
          settings = await settingsCollection.findOne({ settingsId: SETTINGS_ID });
        }
        
        if (!settings) {
            return res.status(500).json({ message: "Failed to load settings." });
        }

        const { _id, mongoURI, ...clientSettings } = settings;
        return res.status(200).json(clientSettings);
      }
      case 'POST': {
        const newSettings = req.body;
        // Don't save mongoURI from client
        delete newSettings.mongoURI;
        await settingsCollection.updateOne(
          { settingsId: SETTINGS_ID },
          { $set: newSettings },
          { upsert: true }
        );
        return res.status(200).json({ message: 'Settings updated successfully' });
      }
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Settings API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return res.status(500).json({ message });
  }
}
