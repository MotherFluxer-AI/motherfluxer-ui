import React from 'react';

interface LoadingIndicatorProps {
  size?: 'small' | 'medium';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 'medium' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-[var(--primary)] ${
          size === 'small' ? 'h-4 w-4' : 'h-8 w-8'
        }`}
      />
    </div>
  );
}; 