import { formatDate, truncateText } from '@/lib/utils/formatting';
import { isValidEmail, isValidHostAddress } from '@/lib/utils/validation';

describe('Utility Functions', () => {
  describe('formatting', () => {
    test('formatDate formats date correctly', () => {
      const date = new Date('2024-01-01T12:00:00');
      expect(formatDate(date)).toMatch(/January 1, 2024/);
    });

    test('truncateText truncates long text', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
    });
  });

  describe('validation', () => {
    test('isValidEmail validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    test('isValidHostAddress validates host addresses', () => {
      expect(isValidHostAddress('https://example.com')).toBe(true);
      expect(isValidHostAddress('invalid-host')).toBe(false);
    });
  });
}); 