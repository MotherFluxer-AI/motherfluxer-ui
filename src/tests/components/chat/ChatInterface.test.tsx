import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../../../components/chat/ChatInterface'
import { act } from 'react'

describe('ChatInterface', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Mock fetch before each test
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Response message' }),
      })
    ) as jest.Mock
  })

  it('handles message input and submission', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
    })

    await act(async () => {
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Response message')).toBeInTheDocument()
    })
  })

  it('shows loading state while sending message', async () => {
    // Mock a delayed response
    global.fetch = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    ) as jest.Mock

    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('maintains chat history', async () => {
    let messageCount = 0
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
          message: `Response ${++messageCount}` 
        }),
      })
    ) as jest.Mock

    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    // Send first message
    await act(async () => {
      await user.type(input, 'First message')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Response 1')).toBeInTheDocument()
    })

    // Send second message
    await act(async () => {
      await user.type(input, 'Second message')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Second message')).toBeInTheDocument()
      expect(screen.getByText('Response 2')).toBeInTheDocument()
    })
  })
}) 