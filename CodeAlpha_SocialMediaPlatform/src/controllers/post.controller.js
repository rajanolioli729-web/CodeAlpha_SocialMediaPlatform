const postService = require('../services/post.service');

/**
 * GET /api/posts
 */
async function getFeed(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const result = await postService.getFeed({
      page,
      limit,
      currentUserId: req.user ? req.user.id : null
    });

    res.status(200).json({
      success: true,
      message: 'Feed retrieved successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/posts/:id
 */
async function getPost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);

    const post = await postService.getPostById(
      postId,
      req.user ? req.user.id : null
    );

    res.status(200).json({
      success: true,
      message: 'Post retrieved successfully',
      data: { post }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/posts
 *
 * Supports:
 * - Text/caption
 * - Existing image URL
 * - New uploaded image through Multer
 */
async function createPost(req, res, next) {
  try {
    const { content } = req.body;

    // Start with an existing image URL if one was provided.
    let image_url = req.body.image_url || null;

    // If the user selected a file, Multer stores it in public/uploads.
    // Save the public URL/path into the existing image_url column.
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const post = await postService.createPost(req.user.id, {
      content,
      image_url
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/posts/:id
 *
 * Currently keeps the existing image URL editing functionality.
 */
async function updatePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    const { content, image_url } = req.body;

    const post = await postService.updatePost(
      postId,
      req.user.id,
      {
        content,
        image_url
      }
    );

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/posts/:id
 */
async function deletePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);

    await postService.deletePost(
      postId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost
};
