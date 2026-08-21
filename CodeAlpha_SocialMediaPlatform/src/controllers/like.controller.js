const { pool } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

/**
 * POST /api/posts/:id/like
 */
async function likePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);

    // Verify post exists
    const [postRows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      throw new AppError('Post not found.', 404);
    }

    // Insert like, ignore duplicates
    await pool.execute(
      'INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, req.user.id]
    );

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: { liked: true, like_count: count }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/posts/:id/like
 */
async function unlikePost(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);

    // Verify post exists
    const [postRows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      throw new AppError('Post not found.', 404);
    }

    await pool.execute(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, req.user.id]
    );

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) AS count FROM likes WHERE post_id = ?',
      [postId]
    );

    res.status(200).json({
      success: true,
      message: 'Post unliked successfully',
      data: { liked: false, like_count: count }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { likePost, unlikePost };