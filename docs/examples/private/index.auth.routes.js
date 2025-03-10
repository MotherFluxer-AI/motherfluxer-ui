// src/routes/auth/index.auth.routes.js

/**
 * @ai-context: Main authentication router combining public and protected routes
 * @ai-dependencies: public.auth.routes.js, protected.auth.routes.js
 * @ai-critical-points:
 * - Route organization by authentication requirement
 * - Middleware order must be maintained
 * 
 * LEARNING POINTS:
 * 1. Route Organization:
 *    Separate public and protected routes for clarity
 * 
 * 2. Middleware Chain:
 *    Each route type has specific middleware requirements
 */

const express = require('express');
const publicRoutes = require('./public.auth.routes');
const protectedRoutes = require('./protected.auth.routes');

const router = express.Router();

// Mount public routes
router.use('/', publicRoutes);

// Mount protected routes
router.use('/', protectedRoutes);

module.exports = router;
