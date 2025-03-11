// src/pages/test-connection.tsx
import { useState } from 'react';
import { authService } from '@/lib/services/auth.service';
import { ApiClient } from '@/lib/api/client';

export const config = {
  auth: false  // Disable authentication for this page
};

// Add type for ChangeEvent
import type { ChangeEvent } from 'react';

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testConnection = async () => {
    setStatus('Testing connection to admin.motherfluxer.ai...');
    setError(null);
    try {
      // Use the existing health endpoint
      const response = await fetch('https://admin.motherfluxer.ai/health');
      const data = await response.json();
      setStatus(`Connection test: ${data.status === 'success' ? 'OK' : 'Failed'}`);
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
      console.log('Attempting login to:', 'https://admin.motherfluxer.ai/auth/login');
      const result = await authService.login(email, password);
      console.log('Login response:', result);
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
      // Test the admin endpoint since it requires authentication
      const response = await fetch('https://admin.motherfluxer.ai/admin/instance/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStatus('API connection successful');
      console.log('API test response:', data);
    } catch (err) {
      setError(`API test failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setStatus('API test failed');
      console.error('API test error:', err);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

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
            onChange={handleEmailChange}
            className="w-full p-2 border rounded"
            placeholder="Enter email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
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