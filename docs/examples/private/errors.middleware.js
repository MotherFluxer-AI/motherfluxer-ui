// src/middleware/errors.middleware.js

/**
 * @ai-context: Global error handling and transformation
 * @ai-dependencies: Custom error utils
 * @ai-critical-points:
 * - Must be last middleware
 * - Different handling for dev/prod
 * - Transforms all errors for security
 * 
 * LEARNING POINTS:
 * 1. Error Order:
 *    Must be registered after all other middleware
 * 
 * 2. Security:
 *    Never expose internal errors in production
 */

const { AppError } = require('../utils/errors.utils');

const handleJWTError = () => 
  new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');

const handleJWTExpiredError = () => 
  new AppError('Your token has expired. Please log in again.', 401, 'EXPIRED_TOKEN');

const handleSequelizeValidationError = err => 
  new AppError(err.message, 400, 'VALIDATION_ERROR');

const handleSequelizeUniqueConstraintError = err => 
  new AppError('Duplicate field value entered.', 400, 'DUPLICATE_FIELD');

const handleRedisError = err =>
  new AppError('Cache service unavailable.', 503, 'CACHE_ERROR');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: {
      code: err.errorCode,
      message: err.message
    },
    stack: err.stack,
    isOperational: err.isOperational
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      error: {
        code: err.errorCode,
        message: err.message
      }
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    console.error('ERROR 💥', err);
    
    // Send generic message
    res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong'
      }
    });
  }
};

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (err.name === 'SequelizeValidationError') error = handleSequelizeValidationError(err);
    if (err.name === 'SequelizeUniqueConstraintError') error = handleSequelizeUniqueConstraintError(err);
    if (err.name === 'RedisError') error = handleRedisError(err);

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;
