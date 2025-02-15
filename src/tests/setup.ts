/**
 * @ai-context: Test environment setup and configuration
 * @ai-dependencies: jest-dom, dotenv, util
 * @ai-critical-points: 
 * - Environment variables must be loaded before any tests
 * - TextEncoder/Decoder must be set up for database tests
 * - Environment variables should never be modified in code
 *
 * LEARNING POINTS:
 * 1. Environment variables should be set before process starts
 * 2. Use cross-env for environment variable setting
 * 3. Keep setup minimal and focused
 */

import '@testing-library/jest-dom';
import { TextEncoder as NodeTextEncoder, TextDecoder as NodeTextDecoder } from 'util';
import dotenv from 'dotenv';
import { server } from './mocks/server';

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
  server.resetHandlers();
});

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Clean up after the tests are finished.
afterAll(() => server.close());

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: Function, options: Object) {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return [] }
} as any;

// Mock window.fetch
global.fetch = jest.fn(); 