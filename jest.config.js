/**
 * @ai-context: Jest test runner configuration
 * @ai-dependencies: ts-jest, test environment setup
 * @ai-critical-points:
 * - Must configure TypeScript properly
 * - Environment variables handled through cross-env
 * - Proper timeout settings for infrastructure tests
 *
 * LEARNING POINTS:
 * 1. Use cross-env for environment variables
 * 2. Configure proper TypeScript transformation
 * 3. Set appropriate timeouts for infrastructure tests
 */

/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testTimeout: 30000,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};

module.exports = config; 