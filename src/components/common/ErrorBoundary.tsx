import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Use errorInfo or remove if not needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-[var(--foreground)] rounded-lg">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <button 
            className="mt-2 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 rounded"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 