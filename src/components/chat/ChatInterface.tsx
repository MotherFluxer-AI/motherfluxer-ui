import React, { useState, useEffect, useRef } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { useStore } from '@/lib/store';

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addMessage, messages } = useStore();
  const wsRef = useRef<WebSocket | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  // Hardcode the token for now to rule out environment variable issues
  const AUTH_TOKEN = "Xf8e8WNtQ7c9FUODstaS_RsY81gy7Bg83R5P6ro5Nf0";
  
  useEffect(() => {
    if (!AUTH_TOKEN) {
      setError('Authentication token not found');
      return;
    }

    console.log('Attempting to connect to WebSocket...');
    
    try {
      // Initialize WebSocket connection
      const ws = new WebSocket('wss://beeef73badbe-8000.proxy.runpod.net/ws');
      
      ws.onopen = () => {
        console.log('WebSocket connected, sending auth message');
        // Send authentication message
        const authMessage = {
          type: 'system',
          message: 'auth',
          token: AUTH_TOKEN
        };
        ws.send(JSON.stringify(authMessage));
      };
      
      ws.onmessage = (event) => {
        try {
          console.log('Raw message received:', event.data);
          const response = JSON.parse(event.data);
          console.log('Parsed message:', response);
          
          if (response.type === 'system') {
            if (response.status === 'authenticated') {
              console.log('Successfully authenticated');
              setIsAuthenticated(true);
              setError(null);
            } else if (response.status === 'error') {
              setError(response.message || 'Authentication failed');
              ws.close();
            }
          }
        } catch (err) {
          console.error('Error parsing message:', event.data, err);
          setError(`Failed to parse server response: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Failed to connect to model service');
      };
      
      ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
        setIsAuthenticated(false);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && connectionAttempts < 3) {
          setConnectionAttempts(prev => prev + 1);
          setTimeout(() => {
            console.log(`Attempting to reconnect (${connectionAttempts + 1}/3)...`);
          }, 3000);
        }
      };
      
      wsRef.current = ws;
      
      // Cleanup on unmount
      return () => {
        console.log('Cleaning up WebSocket connection');
        ws.close();
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError(`Failed to create WebSocket: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [connectionAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current || !isAuthenticated) return;

    setIsLoading(true);
    setError(null);

    try {
      const messageData = {
        type: 'chat',
        message: message.trim(),
        parameters: {
          temperature: 0.7,
          max_length: 100
        }
      };

      console.log('Sending message:', messageData);
      wsRef.current.send(JSON.stringify(messageData));

      // Set up one-time message handler
      const originalOnMessage = wsRef.current.onmessage;
      wsRef.current.onmessage = (event) => {
        try {
          console.log('Response received:', event.data);
          const response = JSON.parse(event.data);
          addMessage(message, response.response || response);
          setMessage('');
          setIsLoading(false);
          
          // Restore the original message handler
          if (wsRef.current) {
            wsRef.current.onmessage = originalOnMessage;
          }
        } catch (err) {
          console.error('Error handling response:', err, event.data);
          setError(`Failed to parse response: ${err instanceof Error ? err.message : 'Unknown error'}`);
          setIsLoading(false);
          
          // Restore the original message handler
          if (wsRef.current) {
            wsRef.current.onmessage = originalOnMessage;
          }
        }
      };
    } catch (err) {
      console.error('Error sending message:', err);
      setError(`Error sending message: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {!isAuthenticated && !error && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Connecting to model service... {connectionAttempts > 0 ? `(Attempt ${connectionAttempts + 1}/4)` : ''}
        </div>
      )}
      {isAuthenticated && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
          Connected to model service
        </div>
      )}
      <div className="mb-4 space-y-4" data-testid="message-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`p-2 rounded ${
              msg.sender === 'user' ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            {msg.content}
          </div>
        ))}
      </div>
      {isLoading && <LoadingIndicator />}
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
          <button 
            onClick={() => setConnectionAttempts(prev => prev + 1)} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="w-full p-2 border rounded-lg resize-none"
          disabled={!isAuthenticated || isLoading}
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading || !isAuthenticated}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}; 