const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const commentRoutes = require('./routes/comment.routes');
const likeRoutes = require('./routes/like.routes');
const followRoutes = require('./routes/follow.routes');

const {
  notFoundHandler,
  errorHandler
} = require('./middleware/error.middleware');

const app = express();

// =====================================================
// Security
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

// =====================================================
// CORS
// =====================================================

const allowedOrigins = env.isProduction
  ? (process.env.CLIENT_URL || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : true;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// =====================================================
// Body parsing
// =====================================================

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
);

// =====================================================
// Cookies
// =====================================================

app.use(cookieParser());

// =====================================================
// Rate limiting
// =====================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// =====================================================
// Static files
// =====================================================

app.use(
  express.static(
    path.join(__dirname, '..', 'public')
  )
);

// =====================================================
// API routes
// =====================================================

app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/users', apiLimiter, userRoutes);

app.use('/api/users', apiLimiter, followRoutes);

app.use('/api/posts', apiLimiter, postRoutes);

app.use('/api/posts', apiLimiter, likeRoutes);

app.use('/api/comments', apiLimiter, commentRoutes);

// =====================================================
// Health check
// =====================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      uptime: process.uptime(),
      environment: env.nodeEnv
    }
  });
});

// =====================================================
// 404 handler
// =====================================================

app.use(notFoundHandler);

// =====================================================
// Centralized error handler
// =====================================================

app.use(errorHandler);

module.exports = app;