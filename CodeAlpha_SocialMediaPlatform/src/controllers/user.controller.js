const userService = require('../services/user.service');
const postService = require('../services/post.service');

/**
 * GET /api/users/:id
 */
async function getProfile(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    const profile = await userService.getUserProfile(userId);

    let isFollowing = false;
    if (req.user && req.user.id !== userId) {
      isFollowing = await userService.isFollowing(req.user.id, userId);
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: { profile, is_following: isFollowing }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/me
 */
async function updateMe(req, res, next) {
  try {
    const { username, bio, profile_image } = req.body;
    const user = await userService.updateUserProfile(req.user.id, {
      username,
      bio,
      profile_image
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id/posts
 */
async function getUserPosts(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    // Verify user exists
    await userService.getUserProfile(userId);

    const result = await postService.getPostsByUser(userId, {
      page,
      limit,
      currentUserId: req.user ? req.user.id : null
    });

    res.status(200).json({
      success: true,
      message: 'User posts retrieved successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id/followers
 */
async function getFollowers(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    await userService.getUserProfile(userId);
    const followers = await userService.getFollowers(userId);

    res.status(200).json({
      success: true,
      message: 'Followers retrieved successfully',
      data: { followers }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/users/:id/following
 */
async function getFollowing(req, res, next) {
  try {
    const userId = parseInt(req.params.id, 10);
    await userService.getUserProfile(userId);
    const following = await userService.getFollowing(userId);

    res.status(200).json({
      success: true,
      message: 'Following retrieved successfully',
      data: { following }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateMe,
  getUserPosts,
  getFollowers,
  getFollowing
};