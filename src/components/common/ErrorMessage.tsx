import React from 'react';

export interface ErrorMessageProps {
  message?: string;
  error?: Error;
  onRetry?: () => Promise<void>;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, error, onRetry }) => {
  const errorMessage = message || error?.message;
  
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
      <div>{errorMessage}</div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}; 