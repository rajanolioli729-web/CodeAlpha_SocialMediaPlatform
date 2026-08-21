const env = require('../config/env');

/**
 * Custom application error class.
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 handler for unknown routes.
 */
function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Centralized error handler.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Handle invalid JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  // Handle MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry. Resource already exists.';
  }

  // Handle MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 404;
    message = 'Referenced resource does not exist.';
  }

  // Handle MySQL data too long
  if (err.code === 'ER_DATA_TOO_LONG') {
    statusCode = 422;
    message = 'Input exceeds maximum allowed length.';
  }

  // Handle MySQL check constraint violation
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    statusCode = 422;
    message = 'Input violates a database constraint.';
  }

  // Handle MySQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    statusCode = 500;
    message = 'Database connection failed. Please try again later.';
  }

  // Log the error
  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (!err.isOperational) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction ? {} : { stack: err.stack })
  });
}

module.exports = { AppError, notFoundHandler, errorHandler };