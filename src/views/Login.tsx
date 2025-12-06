import React, { useState, FormEvent, useEffect } from 'react';
import { Key } from '../types';

interface LoginProps {
  onLogin: (keyData: Key) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const wakeUpUrl = 'https://international-gianna-gxyenn-e6ff159c.koyeb.app/';

    const sendWakeUpRequest = async () => {
      try {
        await fetch(wakeUpUrl);
        console.log('Wake-up request sent to Koyeb bot.');
      } catch (err) {
        console.error('Could not send wake-up request:', err);
      }
    };

    sendWakeUpRequest();
  }, []);
  
  useEffect(() => {
    if (!isLoggingIn) {
      inputRef.current?.focus();
    }
  }, [isLoggingIn]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !key) {
      setError('Username and Access Key cannot be empty.');
      return;
    }

    setIsLoggingIn(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, key }),
      });

      if (response.ok) {
        const keyData: Key = await response.json();
         setTimeout(() => {
            onLogin(keyData);
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Invalid username or key');
        setIsLoggingIn(false);
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'key') {
      setKey(value);
    }
    if (error) {
      setError('');
    }
  };
  
  const renderLoadingScreen = () => (
    <div className="flex flex-col items-center justify-center text-center h-[356px]">
       <div className="relative flex items-center justify-center w-32 h-32">
          <div className="absolute inset-0 border-4 border-t-transparent border-violet-500 rounded-full animate-spin"></div>
          <img 
            src="https://files.catbox.moe/46iz0p.gif" 
            alt="Vely Logo" 
            className="w-20 h-20 rounded-xl object-cover" 
          />
        </div>
        <p className="text-lg font-semibold text-gray-200 mt-6">Authenticating...</p>
        <p className="text-sm font-medium text-gray-400 mt-2 tracking-widest uppercase">By LSAG</p>
    </div>
  );

  const renderLoginForm = () => (
    <div className="h-[356px] flex flex-col justify-center">
      <div className="flex flex-col items-center text-center mb-8">
          <img 
            src="https://files.catbox.moe/46iz0p.gif" 
            alt="Vely Logo" 
            className="w-24 h-24 rounded-2xl object-cover logo-animated-aura mb-6" 
          />
          <h1 className="text-3xl font-bold text-gray-100">Vely Bug</h1>
          <p className="text-gray-400 mt-1">Enter your credentials to continue</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-300 text-sm font-medium mb-2 sr-only">
            Username
          </label>
          <input
            ref={inputRef}
            id="username"
            name="username"
            type="text"
            value={username}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition duration-200"
            placeholder="Enter your username"
          />
        </div>
        <div>
          <label htmlFor="key" className="block text-gray-300 text-sm font-medium mb-2 sr-only">
            Access Key
          </label>
          <input
            id="key"
            name="key"
            type="password"
            value={key}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8A2BE2] transition duration-200"
            placeholder="Enter your access key"
          />
        </div>
        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-200 transform hover:scale-105"
        >
          Submit
        </button>
      </form>
    </div>
  );

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="bg-gray-900 shadow-2xl rounded-2xl p-8 border border-gray-700">
        {isLoggingIn ? renderLoadingScreen() : renderLoginForm()}
      </div>
    </div>
  );
};

export default Login;