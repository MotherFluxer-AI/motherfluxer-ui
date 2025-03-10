// src/config/index.config.js

/**
 * @ai-context: Central configuration management singleton
 * @ai-dependencies: config-loader.config.js
 * @ai-critical-points:
 * - Single source of truth for application configuration
 * - Must initialize before server startup
 * - Manages authentication, rate limiting, and instance settings
 * 
 * @ai-rate-limit-config:
 * - windowMs: 900000 (15 minutes in milliseconds)
 * - defaultLimit: 100 requests per window
 * - adminLimit: 1000 requests per window
 * - Implementation: PostgreSQL-based with user-specific limits
 * 
 * LEARNING POINTS:
 * 1. Initialization Order:
 *    Must complete before any middleware or routes are registered
 * 
 * 2. Configuration Access:
 *    Always use getConfig() to ensure initialization
 * 
 * 3. Rate Limiting:
 *    - Uses auth_service.rate_limits table
 *    - Tracks per-user windows and counts
 *    - Differentiates between admin and regular user limits
 */

const configLoader = require('./config-loader.config');

class AppConfig {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Load environment-specific configuration
    const config = await configLoader.loadConfig();

    // Authentication configuration
    this.auth = {
      publicRoutes: ['/auth/login', '/auth/register'],
      protectedRoutes: ['/auth/me', '/auth/instance/*'],
      tokenExpiry: '24h',
      instanceTokenExpiry: '30d'
    };

    // Rate limiting configuration
    this.rateLimit = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    };

    // Instance configuration
    this.instance = {
      healthCheckInterval: 60000, // 1 minute
      healthScoreThreshold: 80
    };

    this.initialized = true;
    return this;
  }

  getConfig() {
    if (!this.initialized) {
      throw new Error('Configuration not initialized');
    }
    return this;
  }
}

// Export a singleton instance
module.exports = new AppConfig(); 