const { pool } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get a user's public profile with follower/following counts.
 */
async function getUserProfile(userId) {
  const [rows] = await pool.execute(
    `SELECT id, username, email, bio, profile_image, created_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = rows[0];

  const [[followerCount]] = await pool.execute(
    'SELECT COUNT(*) AS count FROM followers WHERE following_id = ?',
    [userId]
  );

  const [[followingCount]] = await pool.execute(
    'SELECT COUNT(*) AS count FROM followers WHERE follower_id = ?',
    [userId]
  );

  const [[postCount]] = await pool.execute(
    'SELECT COUNT(*) AS count FROM posts WHERE user_id = ?',
    [userId]
  );

  return {
    ...user,
    followers_count: followerCount.count,
    following_count: followingCount.count,
    posts_count: postCount.count
  };
}

/**
 * Update a user's own profile.
 */
async function updateUserProfile(userId, { username, bio, profile_image }) {
  const [result] = await pool.execute(
    `UPDATE users
     SET username = COALESCE(?, username),
         bio = COALESCE(?, bio),
         profile_image = COALESCE(?, profile_image)
     WHERE id = ?`,
    [username || null, bio || null, profile_image || null, userId]
  );

  if (result.affectedRows === 0) {
    throw new AppError('User not found.', 404);
  }

  const [rows] = await pool.execute(
    'SELECT id, username, email, bio, profile_image, created_at FROM users WHERE id = ?',
    [userId]
  );

  return rows[0];
}

/**
 * Check if a user is following another user.
 */
async function isFollowing(followerId, followingId) {
  const [rows] = await pool.execute(
    'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
    [followerId, followingId]
  );
  return rows.length > 0;
}

/**
 * Get followers list for a user.
 */
async function getFollowers(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.profile_image, u.bio, f.created_at AS followed_at
     FROM followers f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

/**
 * Get following list for a user.
 */
async function getFollowing(userId) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.username, u.profile_image, u.bio, f.created_at AS followed_at
     FROM followers f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = {
  getUserProfile,
  updateUserProfile,
  isFollowing,
  getFollowers,
  getFollowing
};