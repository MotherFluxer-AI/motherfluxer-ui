// Import jest-dom
import '@testing-library/jest-dom'

// Silence specific React warnings
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})