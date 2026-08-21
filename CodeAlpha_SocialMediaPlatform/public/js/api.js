/**
 * SocialSphere - API Client
 * Reusable fetch wrapper for all API calls.
 */

const API_BASE = '/api';

/**
 * Generic API request function.
 * @param {string} endpoint - API endpoint (e.g. '/auth/login')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include',
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { success: false, message: 'Invalid response from server' };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

/**
 * Auth API
 */
const authApi = {
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  me: () => apiRequest('/auth/me')
};

/**
 * Users API
 */
const usersApi = {
  getProfile: (userId) => apiRequest(`/users/${userId}`),
  updateMe: (userData) => apiRequest('/users/me', { method: 'PUT', body: userData }),
  getUserPosts: (userId, page = 1, limit = 10) =>
    apiRequest(`/users/${userId}/posts?page=${page}&limit=${limit}`),
  getFollowers: (userId) => apiRequest(`/users/${userId}/followers`),
  getFollowing: (userId) => apiRequest(`/users/${userId}/following`),
  follow: (userId) => apiRequest(`/users/${userId}/follow`, { method: 'POST' }),
  unfollow: (userId) => apiRequest(`/users/${userId}/follow`, { method: 'DELETE' })
};

/**
 * Posts API
 */
const postsApi = {
  getFeed: (page = 1, limit = 10) => apiRequest(`/posts?page=${page}&limit=${limit}`),
  getPost: (postId) => apiRequest(`/posts/${postId}`),
  create: (postData) => apiRequest('/posts', { method: 'POST', body: postData }),
  update: (postId, postData) => apiRequest(`/posts/${postId}`, { method: 'PUT', body: postData }),
  delete: (postId) => apiRequest(`/posts/${postId}`, { method: 'DELETE' }),
  getComments: (postId) => apiRequest(`/posts/${postId}/comments`),
  addComment: (postId, content) =>
    apiRequest(`/posts/${postId}/comments`, { method: 'POST', body: { content } }),
  like: (postId) => apiRequest(`/posts/${postId}/like`, { method: 'POST' }),
  unlike: (postId) => apiRequest(`/posts/${postId}/like`, { method: 'DELETE' })
};

/**
 * Comments API
 */
const commentsApi = {
  delete: (commentId) => apiRequest(`/comments/${commentId}`, { method: 'DELETE' })
};