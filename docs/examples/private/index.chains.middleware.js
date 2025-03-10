// src/middleware/chains/index.chains.middleware.js

/**
 * @ai-context: Middleware chain management and organization
 * @ai-dependencies: auth, rateLimit middlewares
 * @ai-critical-points:
 * - Maintains correct middleware order
 * - Separates public/protected routes
 * - Flexible chain creation
 * 
 * LEARNING POINTS:
 * 1. Chain Order:
 *    Always maintain models -> auth -> routes -> errors
 * 
 * 2. Route Protection:
 *    Apply auth at route level, not globally
 */

const { authenticate } = require('../auth.middleware');
const { rateLimit } = require('../rateLimit.middleware');
const config = require('../../config/index.config');

// Helper function to create middleware chains
const createChain = (...middlewares) => {
  return middlewares.filter(Boolean);
};

// Public routes middleware chain
const publicChain = createChain(
  // Add any middleware that should run on all public routes
);

// Protected routes middleware chain
const protectedChain = createChain(
  authenticate,
  rateLimit
);

// Instance routes middleware chain (for model instance management)
const instanceChain = createChain(
  authenticate,
  rateLimit,
  requireAdmin
);

module.exports = {
  publicChain,
  protectedChain,
  instanceChain,
  createChain
}; 