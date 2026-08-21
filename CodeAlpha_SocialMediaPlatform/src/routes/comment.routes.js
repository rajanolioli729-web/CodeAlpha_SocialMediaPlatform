const express = require('express');
const { param } = require('express-validator');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * DELETE /api/comments/:id
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isInt().withMessage('Comment ID must be an integer')],
  validate,
  commentController.deleteComment
);

module.exports = router;