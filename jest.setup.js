// Import jest-dom
import '@testing-library/jest-dom'

// Silence specific React warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    // Check if first argument is a string before trying to use includes
    if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) {
      return
    }
    // Don't suppress error boundary errors during tests
    if (typeof args[0] === 'string' && args[0].includes('The above error occurred')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Add TextEncoder for DB tests
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder 