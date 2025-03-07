import { render, screen, waitFor } from '../../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../../../components/chat/ChatInterface'
import { act } from 'react'
import { useStore } from '@/lib/store'

describe('ChatInterface', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    // Reset store state
    useStore.setState({ messages: [], selectedModel: null, selectedInstance: null })
    
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

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
    await waitFor(() => {
      const responseMessages = screen.getAllByText('Response message')
      expect(responseMessages.length).toBeGreaterThan(0)
    })
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
    })

    // Check first message pair
    expect(screen.getByText('First message')).toBeInTheDocument()
    await waitFor(() => {
      const responseMessages = screen.getAllByText('Response message')
      expect(responseMessages).toHaveLength(1)
    })

    // Send second message
    await act(async () => {
      await user.type(input, 'Second message')
      await user.click(submitButton)
    })

    // Check both message pairs
    expect(screen.getByText('Second message')).toBeInTheDocument()
    await waitFor(() => {
      const responseMessages = screen.getAllByText('Response message')
      expect(responseMessages).toHaveLength(2)
    })
  })
}) 