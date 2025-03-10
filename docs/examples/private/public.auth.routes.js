// src/routes/auth/public.auth.routes.js

/**
 * @ai-context: Public authentication routes for registration and login
 * @ai-dependencies: user model, bcrypt, JWT utils
 * @ai-critical-points:
 * - No auth middleware
 * - Email uniqueness required
 * - Role validation critical
 * 
 * LEARNING POINTS:
 * 1. Password Hashing:
 *    BCrypt with 12 rounds required
 * 
 * 2. Role Assignment:
 *    Only admin/user roles allowed
 * 
 * 3. Request Limits:
 *    Set based on user role
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { ValidationError, AuthenticationError } = require('../../utils/errors.utils');
const { generateToken } = require('../../utils/jwt.utils');
const asyncHandler = require('../../middleware/asyncHandler.middleware');
const router = express.Router();

const registerHandler = asyncHandler(async (req, res) => {
  const { User } = req.models;
  const { email, password, role } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  if (!role || !['admin', 'user'].includes(role)) {
    throw new ValidationError('Valid role is required');
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ValidationError('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    id: uuidv4(),
    email,
    hashed_password: hashedPassword,
    role,
    is_active: true,
    request_limit: role === 'admin' ? 1000 : 100
  });

  const token = generateToken(user);
  
  res.status(201).json({
    status: 'success',
    data: { token }
  });
});

const loginHandler = asyncHandler(async (req, res) => {
  const { User } = req.models;
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !user.is_active) {
    throw new AuthenticationError('Invalid credentials or inactive user');
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid credentials');
  }

  const token = generateToken(user);
  
  // Return both token and user data (excluding sensitive fields)
  const userData = {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    last_login: user.last_login,
    is_active: user.is_active,
    request_limit: user.request_limit
  };
  
  res.json({
    status: 'success',
    data: { 
      token,
      user: userData
    }
  });
});

router.post('/register', registerHandler);
router.post('/login', loginHandler);

module.exports = router; 