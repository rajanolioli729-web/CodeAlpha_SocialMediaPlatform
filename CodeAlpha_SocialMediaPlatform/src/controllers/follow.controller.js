const { pool } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

/**
 * POST /api/users/:id/follow
 */
async function followUser(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (targetUserId === req.user.id) {
      throw new AppError('You cannot follow yourself.', 422);
    }

    // Verify target user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (userRows.length === 0) {
      throw new AppError('User not found.', 404);
    }

    // Insert follow, ignore duplicates
    await pool.execute(
      'INSERT IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)',
      [req.user.id, targetUserId]
    );

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) AS count FROM followers WHERE following_id = ?',
      [targetUserId]
    );

    res.status(200).json({
      success: true,
      message: 'User followed successfully',
      data: { following: true, followers_count: count }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/users/:id/follow
 */
async function unfollowUser(req, res, next) {
  try {
    const targetUserId = parseInt(req.params.id, 10);

    if (targetUserId === req.user.id) {
      throw new AppError('You cannot unfollow yourself.', 422);
    }

    // Verify target user exists
    const [userRows] = await pool.execute('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (userRows.length === 0) {
      throw new AppError('User not found.', 404);
    }

    await pool.execute(
      'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.user.id, targetUserId]
    );

    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) AS count FROM followers WHERE following_id = ?',
      [targetUserId]
    );

    res.status(200).json({
      success: true,
      message: 'User unfollowed successfully',
      data: { following: false, followers_count: count }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { followUser, unfollowUser };