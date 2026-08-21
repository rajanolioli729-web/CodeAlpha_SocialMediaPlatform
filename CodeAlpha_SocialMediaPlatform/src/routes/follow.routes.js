const express = require('express');
const { param } = require('express-validator');
const followController = require('../controllers/follow.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * POST /api/users/:id/follow
 */
router.post(
  '/:id/follow',
  authenticate,
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  followController.followUser
);

/**
 * DELETE /api/users/:id/follow
 */
router.delete(
  '/:id/follow',
  authenticate,
  [param('id').isInt().withMessage('User ID must be an integer')],
  validate,
  followController.unfollowUser
);

module.exports = router;