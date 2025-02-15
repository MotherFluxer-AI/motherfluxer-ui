import { render, screen, waitFor } from '@/tests/utils/test-utils' // Updated import to use our custom render
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { server } from '@/tests/mocks/server'
import { rest } from 'msw'

describe('ChatInterface', () => {
  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers()
  })

  it('renders chat interface with all required elements', () => {
    render(<ChatInterface />)
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
    expect(screen.getByTestId('message-container')).toBeInTheDocument()
  })

  it('handles message input and submission', async () => {
    const user = userEvent.setup()
    render(<ChatInterface />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test message')
    expect(input).toHaveValue('Test message')

    await user.click(sendButton)
    
    // Wait for the response from our MSW handler
    await waitFor(() => {
      expect(input).toHaveValue('') // Input should clear after sending
      expect(screen.getByText('Response message')).toBeInTheDocument()
    })
  })

  it('displays error message when API call fails', async () => {
    // Override the default handler for this specific test
    server.use(
      rest.post('/api/chat', (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    const user = userEvent.setup()
    render(<ChatInterface />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test message')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/error sending message/i)).toBeInTheDocument()
    })
  })

  it('handles model instance selection', async () => {
    const user = userEvent.setup()
    render(<ChatInterface />)
    
    // Wait for model instances to load from MSW handler
    const modelSelector = await screen.findByRole('combobox')
    await user.selectOptions(modelSelector, 'instance-2')
    
    expect(modelSelector).toHaveValue('instance-2')
  })

  it('shows loading state while sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInterface />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Test message')
    await user.click(sendButton)

    // Loading state should show immediately
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument()
    
    // Loading state should disappear after response
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument()
    })
  })

  it('maintains chat history after sending multiple messages', async () => {
    const user = userEvent.setup()
    render(<ChatInterface />)
    
    const input = screen.getByRole('textbox')
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Send first message
    await user.type(input, 'First message')
    await user.click(sendButton)
    
    // Send second message
    await user.type(input, 'Second message')
    await user.click(sendButton)

    // Both messages should be visible
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })
  })
}) 