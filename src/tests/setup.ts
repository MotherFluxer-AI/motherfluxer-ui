import '@testing-library/jest-dom';
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Set up text encoder/decoder
global.TextEncoder = NodeTextEncoder as typeof global.TextEncoder;
global.TextDecoder = NodeTextDecoder as typeof global.TextDecoder;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
  })
) as jest.Mock;

// Verify we're in test mode
if (process.env.NODE_ENV !== 'test') {
  console.warn('Tests should be run with NODE_ENV=test');
}

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 