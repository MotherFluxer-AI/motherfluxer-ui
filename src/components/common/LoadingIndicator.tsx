interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'medium';
}

export function LoadingIndicator({ 
  message,
  size = 'medium' 
}: LoadingIndicatorProps) {
  const sizeClass = size === 'small' ? 'h-4 w-4' : 'h-8 w-8';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-[var(--primary)] ${sizeClass}`} />
      {message && (
        <p className="mt-2 text-[var(--foreground)] text-sm opacity-70">{message}</p>
      )}
    </div>
  );
} 