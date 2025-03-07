import React, { useState } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { useStore } from '@/lib/store';

export const ChatInterface: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedModel, addMessage, messages } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.trim(),
          model: selectedModel 
        })
      });

      const data = await response.json();
      
      addMessage(message, data.response);
      setMessage('');
    } catch (err) {
      setError('Error sending message');
    } finally {
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