// Import jest-dom
import '@testing-library/jest-dom'

// Silence specific React warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (args[0]?.includes('ReactDOMTestUtils.act')) {
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