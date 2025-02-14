import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as jest.Mock;

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 