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
  const AUTH_TOKEN = process.env.NEXT_PUBLIC_AUTH_TOKEN;

  useEffect(() => {
    if (!AUTH_TOKEN) {
      setError('Authentication token not found');
      return;
    }

    // Initialize WebSocket connection with auth header
    const ws = new WebSocket('wss://beeef73badbe-8000.proxy.runpod.net/ws', {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

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
      const response = JSON.parse(event.data);
      console.log('Received message:', response);

      if (response.type === 'system') {
        if (response.status === 'authenticated') {
          console.log('Successfully authenticated');
          // Now the connection is ready for chat messages
        } else if (response.status === 'error') {
          setError(response.message || 'Authentication failed');
          ws.close();
        }
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Failed to connect to model service');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    wsRef.current = ws;

    // Cleanup on unmount
    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !wsRef.current) return;

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

      wsRef.current.send(JSON.stringify(messageData));

      // Set up one-time message handler
      wsRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        addMessage(message, response);
        setMessage('');
        setIsLoading(false);
        // Remove the message handler after receiving response
        wsRef.current!.onmessage = null;
      };
    } catch (err) {
      setError('Error sending message');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
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
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="w-full p-2 border rounded-lg resize-none"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}; 