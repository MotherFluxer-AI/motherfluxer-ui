// src/config/routes.config.js

/**
 * @ai-context: Route configuration and protection
 * @ai-dependencies: middleware.config.js
 * @ai-critical-points:
 * - Defines all application routes
 * - Associates routes with middleware chains
 * - Maintains public/private separation
 * 
 * LEARNING POINTS:
 * 1. Route Protection:
 *    Each route explicitly defines its middleware chain
 */

const middlewareChains = require('./middleware.config');

const routes = {
  auth: {
    public: {
      login: {
        path: '/login',
        method: 'post',
        middleware: middlewareChains.public
      },
      register: {
        path: '/register',
        method: 'post',
        middleware: middlewareChains.public
      }
    },
    protected: {
      me: {
        path: '/me',
        method: 'get',
        middleware: middlewareChains.protected
      },
      instanceRegister: {
        path: '/instance/register',
        method: 'post',
        middleware: middlewareChains.instance
      }
    }
  }
};

module.exports = routes; 