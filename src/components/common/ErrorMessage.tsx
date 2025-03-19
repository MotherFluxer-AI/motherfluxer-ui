import React from 'react';

export interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
      <div>{message}</div>
    </div>
  );
}; 