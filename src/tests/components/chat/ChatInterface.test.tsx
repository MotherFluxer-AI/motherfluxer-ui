import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../../../components/chat/ChatInterface'
import { act } from 'react'

describe('ChatInterface', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: 'Response message' }),
      })
    ) as jest.Mock
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('handles message input and submission', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    // Type message
    await act(async () => {
      await user.type(input, 'Test message')
    })

    // Submit form
    await act(async () => {
      await user.click(submitButton)
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Check that the message appears
    expect(screen.getByText('Test message')).toBeInTheDocument()

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Response message')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('shows loading state while sending message', async () => {
    let resolveResponse: Function
    global.fetch = jest.fn(
      () => new Promise(resolve => { resolveResponse = resolve })
    ) as jest.Mock

    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    // Resolve the pending fetch
    await act(async () => {
      resolveResponse({
        ok: true,
        json: () => Promise.resolve({ response: 'Response message' })
      })
    })

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  it('maintains chat history', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    // Send first message
    await act(async () => {
      await user.type(input, 'First message')
      await user.click(submitButton)
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByText('First message')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Response message')).toBeInTheDocument()
    })

    // Send second message
    await act(async () => {
      await user.type(input, 'Second message')
      await user.click(submitButton)
      // Wait for state updates
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(screen.getByText('Second message')).toBeInTheDocument()
    
    // Both messages and responses should be visible
    await waitFor(() => {
      const messages = screen.getAllByText('Response message')
      expect(messages).toHaveLength(2)
    })
  })
}) 