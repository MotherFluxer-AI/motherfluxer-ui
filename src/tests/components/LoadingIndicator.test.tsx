import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders without crashing', () => {
    render(<LoadingIndicator />);
    const loadingElement = screen.getByTestId('loading-spinner');
    expect(loadingElement).toBeInTheDocument();
  });
}); 