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
    test('formatDate handles various date formats', () => {
      const date = new Date('2024-01-01T12:00:00')
      expect(formatDate(date)).toMatch(/January 1, 2024/)
      expect(formatDate(date, 'short')).toMatch(/Jan 1, 2024/)
      expect(formatDate(date, 'iso')).toBe('2024-01-01')
    })

    test('truncateText handles edge cases', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...')
      expect(truncateText('Hi', 5)).toBe('Hi')
      expect(truncateText('', 5)).toBe('')
      expect(truncateText('Hello World', 0)).toBe('...')
    })

    test('formatBytes converts sizes correctly', () => {
      expect(formatBytes(1024)).toBe('1.0 KB')
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
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
      expect(isValidHostAddress('ftp://example.com')).toBe(false)
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