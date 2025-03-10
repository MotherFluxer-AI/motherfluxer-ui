// src/middleware/chains/public.chains.middleware.js

/**
 * Public Route Middleware
 * 
 * Defines middleware specifically for public routes.
 * These are routes that don't require authentication.
 */

const express = require('express');
const config = require('../../config/index.config');

const basicValidation = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      status: 'error',
      message: 'No request body provided'
    });
  }
  next();
};

const sanitizeInput = (req, res, next) => {
  // Add any input sanitization logic here
  next();
};

module.exports = {
  basicValidation,
  sanitizeInput
}; 