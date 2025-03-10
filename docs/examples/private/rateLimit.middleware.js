// src/middleware/rateLimit.middleware.js

/**
 * @ai-context: Rate limiting middleware implementation
 * @ai-flow:
 * 1. Extracts user info from req.user (set by auth middleware)
 * 2. Calculates current time window based on windowMs config
 * 3. Queries/creates rate limit record for user+window
 * 4. Increments request count and updates last_request
 * 5. Enforces user's request_limit
 * @ai-dependencies:
 *   - RateLimitModel for PostgreSQL operations
 *   - RateLimitError for limit exceeded cases
 *   - config.rateLimit.windowMs for window size
 * @ai-schema-dependency: auth_service.rate_limits
 */

const { RateLimitError } = require('../utils/errors.utils');
const config = require('../config/index.config');

// Remove Redis initialization since we're using the database
const initializeRedis = async () => {
  // No-op function to maintain compatibility
  return Promise.resolve();
};

const rateLimit = async (req, res, next) => {
  try {
    const { RateLimit } = req.models;
    const { id, request_limit } = req.user;
    
    console.log('Rate Debug - User:', { id, request_limit });
    
    const windowMs = config.getConfig().rateLimit.windowMs;
    const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
    
    console.log('Rate Debug - Window:', { 
      windowMs, 
      windowStart, 
      currentTime: new Date() 
    });

    // Get or create rate limit record
    let rateLimit = await RateLimit.findOne({
      where: { 
        user_id: id,
        window_start: windowStart
      }
    });

    console.log('Rate Debug - Existing Rate Limit:', rateLimit);

    if (!rateLimit) {
      rateLimit = await RateLimit.create({
        user_id: id,
        window_start: windowStart,
        request_count: 1,
        last_request: new Date()
      });
      console.log('Rate Debug - Created New Rate Limit:', rateLimit);
    } else {
      // Update existing rate limit
      const newCount = rateLimit.request_count + 1;
      rateLimit = await RateLimit.update(
        { 
          user_id: id, 
          window_start: windowStart 
        },
        { 
          request_count: newCount,
          last_request: new Date()
        }
      );

      console.log('Rate Debug - Updated Rate Limit:', {
        previousCount: newCount - 1,
        newCount: newCount,
        limit: request_limit
      });
    }

    if (rateLimit.request_count > request_limit) {
      console.log('Rate Debug - Limit Exceeded:', {
        count: rateLimit.request_count,
        limit: request_limit
      });
      throw new RateLimitError('Rate limit exceeded');
    }
    
    next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      next(error);
    } else {
      console.error('Rate Debug - Error:', error);
      next(new Error('Rate limiting failed'));
    }
  }
};

module.exports = {
  initializeRedis,
  rateLimit
};
