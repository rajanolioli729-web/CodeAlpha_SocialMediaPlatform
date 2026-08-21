const express = require('express');
const { param } = require('express-validator');
const likeController = require('../controllers/like.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * POST /api/posts/:id/like
 */
router.post(
  '/:id/like',
  authenticate,
  [param('id').isInt().withMessage('Post ID must be an integer')],
  validate,
  likeController.likePost
);

/**
 * DELETE /api/posts/:id/like
 */
router.delete(
  '/:id/like',
  authenticate,
  [param('id').isInt().withMessage('Post ID must be an integer')],
  validate,
  likeController.unlikePost
);

module.exports = router;