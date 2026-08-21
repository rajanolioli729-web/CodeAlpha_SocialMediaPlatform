const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');

/**
 * Register a new user.
 */
async function registerUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await pool.execute(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );

  const [rows] = await pool.execute(
    'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
    [result.insertId]
  );

  return rows[0];
}

/**
 * Login a user and return the user + JWT.
 */
async function loginUser({ email, password }) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, password_hash, bio, profile_image, created_at FROM users WHERE email = ?',
    [email]
  );

  if (rows.length === 0) {
    throw new AppError('Invalid email or password.', 401);
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign({ id: user.id }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn
  });

  delete user.password_hash;

  return { user, token };
}

/**
 * Get user by ID (safe fields only).
 */
async function getUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

module.exports = { registerUser, loginUser, getUserById };