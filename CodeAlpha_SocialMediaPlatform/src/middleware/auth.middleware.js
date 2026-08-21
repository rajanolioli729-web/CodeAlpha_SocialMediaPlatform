const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { pool } = require('../config/database');
const { AppError } = require('./error.middleware');

/**
 * Authentication middleware.
 * Verifies the JWT from the HTTP-only cookie and loads the user.
 */
async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.jwt.secret);
    } catch (err) {
      return next(new AppError('Invalid or expired token. Please log in again.', 401));
    }

    const [rows] = await pool.execute(
      'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };