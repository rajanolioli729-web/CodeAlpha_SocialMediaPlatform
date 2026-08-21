const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });

    const token = jwt.sign({ id: user.id }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginUser({ email, password });

    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(req, res, next) {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      message: 'Authenticated user retrieved',
      data: { user: req.user }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };