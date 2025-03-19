import React, { useState, useEffect } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { wsService } from '@/lib/services/websocket.service';
import { modelService, ModelInstance } from '@/lib/services/model.service';
import { ChatMessage } from '@/lib/api/types';
import { MessageDisplay } from './MessageDisplay';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<ModelInstance[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelInstance | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch available models on component mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await modelService.getAvailableModels();
        if (response.error) {
          throw new Error(response.error);
        }
        // Get the instances array from the response, with a fallback to empty array
        const models = response.data?.instances || [];
        setAvailableModels(models);
      } catch (err) {
        setError('Failed to fetch available models');
        console.error('Error fetching models:', err);
        setAvailableModels([]); // Set empty array on error
      }
    };

    fetchModels();
  }, []);

  // Handle model selection
  const handleModelSelect = async (model: ModelInstance) => {
    if (selectedModel?.id === model.id) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Disconnect from current model if any
      if (wsService.isConnected()) {
        wsService.disconnect();
      }

      // Connect to new model through the service backend proxy
      await wsService.connect(model, (data) => {
        if (data.type === 'response' && data.content) {
          setMessages((prev: ChatMessage[]) => [...prev, {
            id: Date.now().toString(),
            content: data.content,
            sender: 'assistant',
            timestamp: new Date()
          }]);
          setIsLoading(false);
        } else if (data.type === 'error') {
          setError(data.message);
          setIsLoading(false);
        }
      });

      setSelectedModel(model);
    } catch (err) {
      setError('Failed to connect to selected model');
      console.error('Error connecting to model:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !selectedModel) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      wsService.sendMessage(userMessage.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Model Selection */}
      <div className="mb-4 p-4 bg-white border-b">
        <h2 className="text-lg font-semibold mb-2">Select Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.isArray(availableModels) && availableModels.map((model: ModelInstance) => (
            <div
              key={model.id}
              className={`p-4 border rounded-lg transition-colors ${
                selectedModel?.id === model.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              } ${isConnecting && selectedModel?.id === model.id ? 'opacity-50' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{model.instance_name}</h3>
                  <p className="text-sm text-gray-600">Provider: {model.model_provider || 'Unknown'}</p>
                  <p className="text-sm text-gray-600">Version: {model.container_version || 'latest'}</p>
                </div>
                {isConnecting && selectedModel?.id === model.id && (
                  <div className="w-4 h-4">
                    <LoadingIndicator />
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  model.is_active ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {model.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Health Score: {model.health_score}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Last Health Check: {model.last_health_check ? new Date(model.last_health_check).toLocaleString() : 'Never'}
              </p>
              <button
                onClick={() => !isConnecting && handleModelSelect(model)}
                disabled={isConnecting || !model.is_active}
                className={`mt-4 w-full px-4 py-2 text-sm font-medium rounded-md ${
                  selectedModel?.id === model.id
                    ? 'bg-blue-100 text-blue-700'
                    : model.is_active
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedModel?.id === model.id ? 'Selected' : 'Select Model'}
              </button>
            </div>
          ))}
          {(!Array.isArray(availableModels) || availableModels.length === 0) && (
            <div className="col-span-full text-center text-gray-500 py-4">
              No models available. Please try again later.
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {error && <ErrorMessage message={error} />}
        <MessageDisplay messages={messages} />
        {isLoading && <LoadingIndicator />}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={selectedModel ? "Type your message..." : "Select a model to start chatting"}
            className="flex-1 p-2 border rounded"
            disabled={!selectedModel || isConnecting}
          />
          <button
            type="submit"
            disabled={!selectedModel || !inputMessage.trim() || isLoading || isConnecting}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}; 