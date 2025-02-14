import { render, screen } from '@testing-library/react';
import { ChatInterface } from '@/components/chat/ChatInterface';

describe('ChatInterface', () => {
  it('renders chat interface', () => {
    render(<ChatInterface />);
    // Add a simple check for something we know exists in the component
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
}); 