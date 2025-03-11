// src/pages/test-connection.tsx
import { useState } from 'react';
import { authService } from '@/lib/services/auth.service';

export const config = {
  auth: false  // Disable authentication for this page
};

// Add type for ChangeEvent
import type { ChangeEvent } from 'react';

interface ApiResponse {
  status: string;
  data?: any;
  error?: string;
}

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Not tested');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [detailedError, setDetailedError] = useState<string | null>(null);

  const handleError = (err: unknown, context: string) => {
    console.error(`${context} Error:`, err);
    let errorMessage = 'Unknown error';
    let detailedMessage = '';

    if (err instanceof Error) {
      errorMessage = err.message;
      detailedMessage = `${err.name}: ${err.message}\n${err.stack || ''}`;
    } else if (err && typeof err === 'object') {
      errorMessage = JSON.stringify(err);
      detailedMessage = JSON.stringify(err, null, 2);
    } else if (err) {
      errorMessage = String(err);
      detailedMessage = String(err);
    }

    setError(`${context} failed: ${errorMessage}`);
    setDetailedError(detailedMessage);
    setStatus(`${context} failed`);
  };

  const testConnection = async () => {
    setStatus('Testing connection to admin.motherfluxer.ai...');
    setError(null);
    setDetailedError(null);
    try {
      // Use the health check endpoint
      console.log('Testing connection to:', 'https://admin.motherfluxer.ai/health');
      const response = await fetch('https://admin.motherfluxer.ai/health');
      console.log('Connection response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Connection error response:', errorText);
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Connection response data:', data);
      setStatus(`Connection test: ${data.status === 'success' ? 'OK' : 'Failed'}`);
    } catch (err) {
      handleError(err, 'Connection');
    }
  };

  const testLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setStatus('Testing login...');
    setError(null);
    setDetailedError(null);
    try {
      console.log('Attempting login to:', 'https://admin.motherfluxer.ai/auth/login');
      const result = await authService.login(email, password);
      console.log('Login response:', result);
      setStatus('Login successful');
    } catch (err) {
      handleError(err, 'Login');
    }
  };

  const testAPI = async () => {
    setStatus('Testing API connection...');
    setError(null);
    setDetailedError(null);
    try {
      const token = authService.getToken();
      console.log('Testing API with token:', token ? 'Token present' : 'No token');
      
      // Use the admin dashboard endpoint
      const response = await fetch('https://admin.motherfluxer.ai/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        }
      });
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API responded with status ${response.status}: ${errorText}`);
      }
      
      const data: ApiResponse = await response.json();
      console.log('API response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setStatus('API connection successful');
    } catch (err) {
      handleError(err, 'API test');
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
        {detailedError && (
          <pre className="mt-4 p-4 bg-gray-100 rounded text-sm overflow-auto whitespace-pre-wrap">
            {detailedError}
          </pre>
        )}
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