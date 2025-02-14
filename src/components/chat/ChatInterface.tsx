import React, { useState } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { useStore } from '@/lib/store';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedModel, messages, addMessage } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading || !selectedModel) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add user message to store
      addMessage({
        content: message.trim(),
        sender: 'user',
      });

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: message.trim(),
          modelId: selectedModel 
        }),
      });
      
      setMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Messages Display */}
      <div className="mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] ml-8'
                : 'bg-[var(--background)] border border-gray-200 mr-8'
            }`}
          >
            <div className={`text-sm ${msg.sender === 'user' ? 'text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'} opacity-70 mb-1`}>
              {msg.sender === 'user' ? 'You' : 'AI'}
            </div>
            <div className={msg.sender === 'user' ? 'text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'}>
              {msg.content}
            </div>
            <div className={`text-xs ${msg.sender === 'user' ? 'text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'} opacity-50 mt-1`}>
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {error && <ErrorMessage error={error} />}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded-lg resize-none bg-[var(--background)] text-[var(--foreground)]"
          rows={4}
          placeholder="Type your message here..."
          disabled={isLoading || !selectedModel}
        />
        <button
          type="submit"
          disabled={isLoading || !message.trim() || !selectedModel}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? <LoadingIndicator /> : 'Send'}
        </button>
      </form>
    </div>
  );
} 