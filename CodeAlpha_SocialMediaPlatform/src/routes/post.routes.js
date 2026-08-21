const express = require('express');
const { body, param } = require('express-validator');
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

/**
 * GET /api/posts
 */
router.get('/', postController.getFeed);

/**
 * GET /api/posts/:id
 */
router.get(
  '/:id',
  [param('id').isInt().withMessage('Post ID must be an integer')],
  validate,
  postController.getPost
);

/**
 * POST /api/posts
 */
router.post(
  '/',
  authenticate,
  [
    body('content')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Post content must be between 1 and 5000 characters'),
    body('image_url')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image URL must be a valid URL')
  ],
  validate,
  postController.createPost
);

/**
 * PUT /api/posts/:id
 */
router.put(
  '/:id',
  authenticate,
  [
    param('id').isInt().withMessage('Post ID must be an integer'),
    body('content')
      .optional()
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Post content must be between 1 and 5000 characters'),
    body('image_url')
      .optional()
      .trim()
      .isURL()
      .withMessage('Image URL must be a valid URL')
  ],
  validate,
  postController.updatePost
);

/**
 * DELETE /api/posts/:id
 */
router.delete(
  '/:id',
  authenticate,
  [param('id').isInt().withMessage('Post ID must be an integer')],
  validate,
  postController.deletePost
);

/**
 * GET /api/posts/:id/comments
 */
router.get(
  '/:id/comments',
  [param('id').isInt().withMessage('Post ID must be an integer')],
  validate,
  commentController.getComments
);

/**
 * POST /api/posts/:id/comments
 */
router.post(
  '/:id/comments',
  authenticate,
  [
    param('id').isInt().withMessage('Post ID must be an integer'),
    body('content')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Comment must be between 1 and 1000 characters')
  ],
  validate,
  commentController.createComment
);

module.exports = router;
