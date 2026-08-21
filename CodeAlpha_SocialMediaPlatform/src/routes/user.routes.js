const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * PUT /api/users/me
 * NOTE: Must be defined before /:id routes
 */
router.put(
  '/me',
  authenticate,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Bio must be at most 500 characters'),
    body('profile_image')
      .optional()
      .trim()
      .isURL()
      .withMessage('Profile image must be a valid URL')
  ],
  validate,
  userController.updateMe
);

/**
 * GET /api/users/:id
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  userController.getProfile
);

/**
 * GET /api/users/:id/posts
 */
router.get(
  '/:id/posts',
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  userController.getUserPosts
);

/**
 * GET /api/users/:id/followers
 */
router.get(
  '/:id/followers',
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  userController.getFollowers
);

/**
 * GET /api/users/:id/following
 */
router.get(
  '/:id/following',
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  userController.getFollowing
);

module.exports = router;