import { 
  formatDate, 
  truncateText,
  formatBytes,
  parseModelResponse 
} from '@/lib/utils/formatting'
import { 
  isValidEmail, 
  isValidHostAddress,
  isValidModelInstance,
  validateRequestPayload 
} from '@/lib/utils/validation'

describe('Utility Functions', () => {
  describe('formatting', () => {
    test('formatDate formats dates correctly', () => {
      const testDate = new Date('2024-01-01')
      expect(formatDate(testDate, 'short')).toBe('Jan 1, 2024')
      expect(formatDate(testDate, 'iso')).toBe('2024-01-01')
    })

    test('truncateText handles edge cases', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
      expect(truncateText('Hi', 5)).toBe('Hi')
      expect(truncateText('', 5)).toBe('')
      expect(truncateText('Hello World', 0)).toBe('...')
    })

    test('formatBytes converts sizes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1024 * 1024)).toBe('1 MB')
      expect(formatBytes(0)).toBe('0 Bytes')
    })
  })

  describe('validation', () => {
    test('isValidEmail handles edge cases', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('test.name+filter@example.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })

    test('isValidHostAddress validates various formats', () => {
      expect(isValidHostAddress('https://example.com')).toBe(true)
      expect(isValidHostAddress('http://localhost:3000')).toBe(true)
      expect(isValidHostAddress('invalid-host')).toBe(false)
    })

    test('validateRequestPayload checks required fields', () => {
      const validPayload = {
        message: 'test',
        modelId: '123',
        timestamp: Date.now()
      }
      expect(validateRequestPayload(validPayload)).toBe(true)
      expect(validateRequestPayload({ ...validPayload, message: '' })).toBe(false)
      expect(validateRequestPayload({})).toBe(false)
    })
  })
}) 