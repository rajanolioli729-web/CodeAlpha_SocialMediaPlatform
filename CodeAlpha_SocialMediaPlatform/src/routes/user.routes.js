const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { body, param } = require('express-validator');

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// =====================================================
// Multer configuration for profile images
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(
      null,
      path.join(__dirname, '../../public/uploads')
    );
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `profile-${Date.now()}-${crypto
        .randomBytes(8)
        .toString('hex')}${extension}`;

    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Only JPG, PNG, GIF, and WEBP images are allowed.'
      )
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// =====================================================
// PUT /api/users/me
// Update username, bio and profile image
// =====================================================

router.put(
  '/me',
  authenticate,

  // IMPORTANT:
  // The frontend sends multipart/form-data with
  // the field name "profile_image".
  upload.single('profile_image'),

  [
    body('username')
      .optional()
      .trim()
      .isLength({
        min: 3,
        max: 50
      })
      .withMessage(
        'Username must be between 3 and 50 characters'
      )
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        'Username can only contain letters, numbers, and underscores'
      ),

    body('bio')
      .optional()
      .trim()
      .isLength({
        max: 500
      })
      .withMessage(
        'Bio must be at most 500 characters'
      )
  ],

  validate,

  userController.updateMe
);

// =====================================================
// GET /api/users/:id
// =====================================================

router.get(
  '/:id',
  [
    param('id')
      .isInt()
      .withMessage(
        'User ID must be an integer'
      )
  ],
  validate,
  userController.getProfile
);

// =====================================================
// GET /api/users/:id/posts
// =====================================================

router.get(
  '/:id/posts',
  [
    param('id')
      .isInt()
      .withMessage(
        'User ID must be an integer'
      )
  ],
  validate,
  userController.getUserPosts
);

// =====================================================
// GET /api/users/:id/followers
// =====================================================

router.get(
  '/:id/followers',
  [
    param('id')
      .isInt()
      .withMessage(
        'User ID must be an integer'
      )
  ],
  validate,
  userController.getFollowers
);

// =====================================================
// GET /api/users/:id/following
// =====================================================

router.get(
  '/:id/following',
  [
    param('id')
      .isInt()
      .withMessage(
        'User ID must be an integer'
      )
  ],
  validate,
  userController.getFollowing
);

module.exports = router;