// src/middleware/auth.middleware.js

/**
 * @ai-context: Authentication middleware for user and instance verification
 * @ai-dependencies: JWT utils, database models
 * @ai-critical-points:
 * - Requires models middleware first
 * - Must store complete user object
 * - Extensive debug logging required
 * 
 * LEARNING POINTS:
 * 1. Database Access:
 *    Requires req.models from models middleware
 * 
 * 2. User Object:
 *    Must store complete user object, not just token data
 * 
 * 3. Debug Logging:
 *    Critical for tracking auth flow issues
 */

const { verifyToken } = require('../utils/jwt.utils');
const { AuthenticationError } = require('../utils/errors.utils');
const config = require('../config/index.config');
const authenticate = async (req, res, next) => {
  try {
    const { User } = req.models;
    const authHeader = req.headers.authorization;
    
    console.log('Auth Debug - Authorization Header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided or invalid format');
    }

    const token = authHeader.split(' ')[1];
    console.log('Auth Debug - Extracted Token:', token?.substring(0, 20) + '...');

    try {
      const decoded = verifyToken(token, 'user');
      console.log('Auth Debug - Decoded Token:', decoded);

      if (!decoded.id) {
        throw new AuthenticationError('Invalid token payload');
      }

      const user = await User.findByPk(decoded.id);
      console.log('Auth Debug - Found User:', user);

      if (!user || !user.is_active) {
        console.log('Auth Debug - User Invalid:', { exists: !!user, active: user?.is_active });
        throw new AuthenticationError('Invalid or inactive user');
      }

      // Set the complete user object on the request
      req.user = user;
      console.log('Auth Debug - Set req.user:', req.user);
      
      next();
    } catch (tokenError) {
      console.error('Auth Debug - Token Verification Error:', tokenError);
      throw new AuthenticationError('Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

const authenticateInstance = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = verifyToken(token, 'instance');
    req.instance = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  authenticateInstance
};
