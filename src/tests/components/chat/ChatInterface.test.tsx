import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../../../components/chat/ChatInterface'
import { act } from 'react-dom/test-utils'

describe('ChatInterface', () => {
  const user = userEvent.setup()

  it('handles message input and submission', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(input).toHaveValue('')
      expect(screen.getByText('Response message')).toBeInTheDocument()
    })
  })

  it('shows loading state while sending message', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })

  it('maintains chat history after sending multiple messages', async () => {
    render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    // Send first message
    await act(async () => {
      await user.type(input, 'First message')
      await user.click(submitButton)
    })

    // Send second message
    await act(async () => {
      await user.type(input, 'Second message')
      await user.click(submitButton)
    })

    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument()
      expect(screen.getByText('Second message')).toBeInTheDocument()
    })
  })
}) 