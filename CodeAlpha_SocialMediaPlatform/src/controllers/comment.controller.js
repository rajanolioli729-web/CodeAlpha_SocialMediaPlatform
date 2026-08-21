const { pool } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

/**
 * GET /api/posts/:id/comments
 */
async function getComments(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);

    // Verify post exists
    const [postRows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      throw new AppError('Post not found.', 404);
    }

    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.content,
         c.created_at,
         u.id AS user_id,
         u.username AS username,
         u.profile_image AS profile_image
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: { comments: rows }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/posts/:id/comments
 */
async function createComment(req, res, next) {
  try {
    const postId = parseInt(req.params.id, 10);
    const { content } = req.body;

    // Verify post exists
    const [postRows] = await pool.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (postRows.length === 0) {
      throw new AppError('Post not found.', 404);
    }

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content]
    );

    const [rows] = await pool.execute(
      `SELECT
         c.id,
         c.content,
         c.created_at,
         u.id AS user_id,
         u.username AS username,
         u.profile_image AS profile_image
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: rows[0] }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/comments/:id
 */
async function deleteComment(req, res, next) {
  try {
    const commentId = parseInt(req.params.id, 10);

    const [rows] = await pool.execute(
      'SELECT id, user_id FROM comments WHERE id = ?',
      [commentId]
    );

    if (rows.length === 0) {
      throw new AppError('Comment not found.', 404);
    }

    if (rows[0].user_id !== req.user.id) {
      throw new AppError('You are not authorized to delete this comment.', 403);
    }

    await pool.execute('DELETE FROM comments WHERE id = ?', [commentId]);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {}
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getComments, createComment, deleteComment };