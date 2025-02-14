import { useState, useEffect, useCallback } from 'react';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { useStore } from '@/lib/store';
import { Model } from '@/lib/types';

export function ModelSelector() {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { selectedModel, setSelectedModel } = useStore();

  const loadModels = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/models');
      const data = await response.json();
      setModels(data);
      
      if (data.length && !selectedModel) {
        setSelectedModel(data[0].id);
      }
    } catch (error) {
      setError(error as Error);
      console.error('Failed to load models:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedModel, setSelectedModel]);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  if (isLoading) {
    return <LoadingIndicator message="Loading models..." />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={loadModels} />;
  }

  if (!models.length) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <p className="text-gray-500">No models available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Select Model</h2>
      <div className="grid gap-4">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            disabled={!model.isAvailable}
            className={`p-4 rounded-lg border ${
              selectedModel === model.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            } ${!model.isAvailable && 'opacity-50'}`}
          >
            <h3 className="font-medium">{model.name}</h3>
            <p className="text-sm text-gray-600">{model.description}</p>
            {!model.isAvailable && (
              <p className="text-sm text-red-500 mt-1">Currently unavailable</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
} 