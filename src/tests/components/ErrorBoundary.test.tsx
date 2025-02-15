import { render, screen } from '../utils/test-utils';
import { ErrorBoundary } from '../../components/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when there is no error', async () => {
    await render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error message when there is an error', async () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    await render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
}); 