// src/config/middleware.config.js

/**
 * @ai-context: Middleware chain configuration
 * @ai-dependencies: auth.middleware.js, rateLimit.middleware.js
 * @ai-critical-points:
 * - Defines middleware combinations for different route types
 * - Maintains correct middleware order
 * - Separates public and protected routes
 * 
 * LEARNING POINTS:
 * 1. Chain Order:
 *    Authentication must precede rate limiting
 */

const { authenticate } = require('../middleware/auth.middleware');
const { rateLimit } = require('../middleware/rateLimit.middleware');
const { requireAdmin } = require('../middleware/chains/protected.chains.middleware');

const createMiddlewareChain = (...middlewares) => {
  return middlewares;
};

const middlewareChains = {
  public: createMiddlewareChain(),
  
  protected: createMiddlewareChain(
    authenticate,
    rateLimit
  ),
  
  instance: createMiddlewareChain(
    authenticate,
    rateLimit,
    requireAdmin
  )
};

module.exports = middlewareChains; 