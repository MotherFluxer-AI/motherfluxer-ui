import { isValidEmail, isValidHostAddress } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });

  describe('isValidHostAddress', () => {
    it('validates correct host addresses', () => {
      expect(isValidHostAddress('https://example.com')).toBe(true);
      expect(isValidHostAddress('invalid-host')).toBe(false);
    });
  });
}); 