// src/middleware/chains/protected.chains.middleware.js

/**
 * Protected Route Middleware
 * 
 * Defines middleware specifically for protected routes.
 * These routes require authentication and additional security measures.
 */


const config = require('../../config/index.config');
const { AuthorizationError } = require('../../utils/errors.utils');

const requireAdmin = (req, res, next) => {
  console.log('Admin Check Debug - User:', req.user);
  
  if (!req.user || req.user.role !== 'admin') {
    const error = new AuthorizationError('Only admins can register instances');
    error.statusCode = 403;
    next(error);
    return;
  }
  
  console.log('Admin Check Debug - Access granted');
  next();
};

const validateInstance = (req, res, next) => {
  const { instance_name } = req.body;
  if (!instance_name) {
    throw new ValidationError('Instance name is required');
  }
  next();
};

module.exports = {
  requireAdmin,
  validateInstance
}; 