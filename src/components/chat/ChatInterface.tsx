import React, { useState } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { ApiClient } from '@/lib/api/client';
import { ChatMessage, ApiResponse } from '@/lib/api/types';
import { MessageDisplay } from './MessageDisplay';

// Use the imported ChatMessage type instead of local interface
type Message = ChatMessage;

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await ApiClient.sendMessage(userMessage.content);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: response.data.content,
          sender: 'assistant',
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4">
        <MessageDisplay messages={messages} />
      </div>
      
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message here..."
          rows={4}
          className="w-full p-2 border rounded-lg resize-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      
      {isLoading && <LoadingIndicator />}
    </div>
  );
}; 