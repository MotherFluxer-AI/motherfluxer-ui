import { render, screen } from '../utils/test-utils';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders without crashing', async () => {
    await render(<LoadingIndicator />);
    const loadingElement = screen.getByTestId('loading-spinner');
    expect(loadingElement).toBeInTheDocument();
  });
}); 