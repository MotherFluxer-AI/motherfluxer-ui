// src/routes/auth/protected.auth.routes.js

/**
 * @ai-context: Protected authentication routes requiring user authentication
 * @ai-dependencies: auth middleware, rate limiting, user model
 * @ai-critical-points:
 * - Complete user object required
 * - Admin-only instance registration
 * - Rate limiting enforcement
 * 
 * LEARNING POINTS:
 * 1. User Object:
 *    Must be complete for auth decisions
 * 
 * 2. Instance Registration:
 *    Admin role verification required
 * 
 * 3. Middleware Order:
 *    authenticate -> rateLimit -> handler
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { ValidationError, AuthenticationError, AuthorizationError } = require('../../utils/errors.utils');
const { generateInstanceToken } = require('../../utils/jwt.utils');
const asyncHandler = require('../../middleware/asyncHandler.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const { rateLimit } = require('../../middleware/rateLimit.middleware');
const config = require('../../config/index.config');
const router = express.Router();

const getMeHandler = asyncHandler(async (req, res) => {
  const { User } = req.models;
  const user = await User.findByPk(req.user.id);

  if (!user || !user.is_active) {
    throw new AuthenticationError('User not found or inactive');
  }

  res.json({
    status: 'success',
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        last_login: user.last_login,
        is_active: user.is_active,
        request_limit: user.request_limit
      }
    }
  });
});

const registerInstanceHandler = asyncHandler(async (req, res) => {
  const { ModelInstance } = req.models;
  const { instance_name } = req.body;

  if (!instance_name) {
    throw new ValidationError('Instance name is required');
  }

  if (req.user.role !== 'admin') {
    throw new AuthorizationError('Only admins can register instances');
  }

  const instance = await ModelInstance.create({
    id: uuidv4(),
    instance_name,
    admin_id: req.user.id,
    host_address: req.ip,
    is_active: true,
    health_score: 100
  });

  const token = generateInstanceToken(instance);
  
  res.status(201).json({
    status: 'success',
    data: { token, instance }
  });
});

// Apply middleware from configuration
router.get('/me', authenticate, rateLimit, getMeHandler);
router.post('/instance/register', authenticate, rateLimit, registerInstanceHandler);

module.exports = router; 