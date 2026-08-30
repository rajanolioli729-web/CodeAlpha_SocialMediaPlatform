const env = require('../config/env');
const multer = require('multer');

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
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404
    )
  );
}

/**
 * Centralized error handler.
 */
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Invalid JSON body
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON payload';
  }

  // Multer upload errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        statusCode = 413;
        message = 'Image is too large. Maximum allowed size is 5 MB.';
        break;

      case 'LIMIT_FILE_COUNT':
        statusCode = 400;
        message = 'Only one image can be uploaded.';
        break;

      case 'LIMIT_UNEXPECTED_FILE':
        statusCode = 400;
        message = 'Unexpected image field.';
        break;

      default:
        statusCode = 400;
        message = 'Image upload failed.';
        break;
    }
  }

  // Custom image type validation error
  if (
    err.message ===
    'Only JPG, PNG, GIF, and WEBP images are allowed.'
  ) {
    statusCode = 400;
    message = err.message;
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry. Resource already exists.';
  }

  // MySQL foreign key constraint
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 404;
    message = 'Referenced resource does not exist.';
  }

  // MySQL data too long
  if (err.code === 'ER_DATA_TOO_LONG') {
    statusCode = 422;
    message = 'Input exceeds maximum allowed length.';
  }

  // MySQL check constraint violation
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    statusCode = 422;
    message = 'Input violates a database constraint.';
  }

  // MySQL connection errors
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'PROTOCOL_CONNECTION_LOST'
  ) {
    statusCode = 500;
    message = 'Database connection failed. Please try again later.';
  }

  // Log error
  console.error(
    `[ERROR] ${statusCode} - ${message}`
  );

  if (!err.isOperational) {
    console.error(err.stack);
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isProduction
      ? {}
      : {
          stack: err.stack
        })
  });
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler
};
