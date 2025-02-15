import { render, screen, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { ChatInterface } from '../../../components/chat/ChatInterface'
import { act } from 'react'

describe('ChatInterface', () => {
  const user = userEvent.setup()

  beforeEach(() => {
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
    await render(<ChatInterface />)
    const input = screen.getByPlaceholderText('Type your message here...')
    const submitButton = screen.getByText('Send')

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(submitButton)
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Response message')).toBeInTheDocument()
    })
  })

  // ... rest of the tests ...
}) 