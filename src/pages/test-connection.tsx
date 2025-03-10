// src/pages/test-connection.tsx
import { useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { ApiClient } from '@/lib/api/client';

export const config = {
  auth: false  // Disable authentication for this page
};

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testConnection = async () => {
    setStatus('Testing connection to admin.motherfluxer.ai...');
    setError(null);
    try {
      const response = await fetch('https://admin.motherfluxer.ai/api/health');
      const data = await response.json();
      setStatus(`Connection test: ${data.status || 'OK'}`);
    } catch (err) {
      setError(`Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('Connection failed');
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setStatus('Testing login...');
    setError(null);
    try {
      await authService.login(email, password);
      setStatus('Login successful');
    } catch (err) {
      setError(`Login failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('Login failed');
    }
  };

  const testAPI = async () => {
    setStatus('Testing API connection...');
    setError(null);
    try {
      const response = await ApiClient.sendMessage('test message');
      if (response.error) {
        throw new Error(response.error);
      }
      setStatus('API connection successful');
    } catch (err) {
      setError(`API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('API test failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Connection Test</h1>
      
      <div className="mb-4">
        <p>Status: {status}</p>
        {error && <p className="text-red-500">{error}</p>}
      </div>

      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter password"
          />
        </div>
      </div>

      <div className="space-x-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Test Connection
        </button>
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Login
        </button>
        <button
          onClick={testAPI}
          className="px-4 py-2 bg-green-500 text-white rounded"
          disabled={!authService.isAuthenticated()}
        >
          Test API
        </button>
      </div>
    </div>
  );
}