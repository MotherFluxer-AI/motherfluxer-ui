interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message, 
  size = 'medium' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        data-testid="loading-spinner"
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-[var(--primary)] ${
          size === 'small' ? 'h-4 w-4' : 'h-8 w-8'
        }`}
      />
      {message && (
        <p className="mt-2 text-gray-600">{message}</p>
      )}
    </div>
  );
}; 