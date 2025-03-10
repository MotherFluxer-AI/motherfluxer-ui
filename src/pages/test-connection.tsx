// src/pages/test-connection.tsx
import { useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { ApiClient } from '@/lib/api/client';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [error, setError] = useState<string | null>(null);

  const testLogin = async () => {
    setStatus('Testing login...');
    setError(null);
    try {
      await authService.login('test@example.com', 'password');
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

      <div className="space-x-4">
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Login
        </button>
        <button
          onClick={testAPI}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test API
        </button>
      </div>
    </div>
  );
}