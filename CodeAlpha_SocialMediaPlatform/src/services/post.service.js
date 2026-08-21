const { pool } = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get a paginated feed of posts.
 */
async function getFeed({ page = 1, limit = 10, currentUserId = null }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.content,
       p.image_url,
       p.created_at,
       p.updated_at,
       u.id AS author_id,
       u.username AS author_username,
       u.profile_image AS author_profile_image,
       (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
       EXISTS(
         SELECT 1 FROM likes l2
         WHERE l2.post_id = p.id AND l2.user_id = ?
       ) AS liked_by_current_user
     FROM posts p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [currentUserId, limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM posts'
  );

  return {
    posts: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get a single post by ID.
 */
async function getPostById(postId, currentUserId = null) {
  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.content,
       p.image_url,
       p.created_at,
       p.updated_at,
       u.id AS author_id,
       u.username AS author_username,
       u.profile_image AS author_profile_image,
       (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
       EXISTS(
         SELECT 1 FROM likes l2
         WHERE l2.post_id = p.id AND l2.user_id = ?
       ) AS liked_by_current_user
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = ?`,
    [currentUserId, postId]
  );

  if (rows.length === 0) {
    throw new AppError('Post not found.', 404);
  }

  return rows[0];
}

/**
 * Create a new post.
 */
async function createPost(userId, { content, image_url }) {
  const [result] = await pool.execute(
    'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
    [userId, content, image_url || null]
  );

  return getPostById(result.insertId, userId);
}

/**
 * Update a post (author only).
 */
async function updatePost(postId, userId, { content, image_url }) {
  const [rows] = await pool.execute(
    'SELECT id, user_id FROM posts WHERE id = ?',
    [postId]
  );

  if (rows.length === 0) {
    throw new AppError('Post not found.', 404);
  }

  if (rows[0].user_id !== userId) {
    throw new AppError('You are not authorized to edit this post.', 403);
  }

  await pool.execute(
    `UPDATE posts
     SET content = COALESCE(?, content),
         image_url = COALESCE(?, image_url)
     WHERE id = ?`,
    [content || null, image_url || null, postId]
  );

  return getPostById(postId, userId);
}

/**
 * Delete a post (author only).
 */
async function deletePost(postId, userId) {
  const [rows] = await pool.execute(
    'SELECT id, user_id FROM posts WHERE id = ?',
    [postId]
  );

  if (rows.length === 0) {
    throw new AppError('Post not found.', 404);
  }

  if (rows[0].user_id !== userId) {
    throw new AppError('You are not authorized to delete this post.', 403);
  }

  await pool.execute('DELETE FROM posts WHERE id = ?', [postId]);
}

/**
 * Get posts by a specific user.
 */
async function getPostsByUser(userId, { page = 1, limit = 10, currentUserId = null }) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT
       p.id,
       p.content,
       p.image_url,
       p.created_at,
       p.updated_at,
       u.id AS author_id,
       u.username AS author_username,
       u.profile_image AS author_profile_image,
       (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
       EXISTS(
         SELECT 1 FROM likes l2
         WHERE l2.post_id = p.id AND l2.user_id = ?
       ) AS liked_by_current_user
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [currentUserId, userId, limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM posts WHERE user_id = ?',
    [userId]
  );

  return {
    posts: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}

module.exports = {
  getFeed,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getPostsByUser
};