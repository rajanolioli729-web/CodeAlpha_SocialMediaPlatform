/**
 * SocialSphere - API Client
 * Reusable fetch wrapper for all API calls.
 *
 * Supports:
 * - JSON requests
 * - FormData requests
 * - Image/file uploads
 */

const API_BASE = '/api';


/**
 * Generic API request function.
 *
 * IMPORTANT:
 * When sending FormData, we must NOT set
 * Content-Type to application/json.
 *
 * The browser automatically sets:
 * multipart/form-data; boundary=...
 *
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {

  /*
   * Check whether the request body is FormData.
   *
   * FormData is used when uploading files.
   */
  const isFormData = options.body instanceof FormData;


  /*
   * Start with any custom headers supplied
   * by the caller.
   */
  const headers = {
    ...(options.headers || {})
  };


  /*
   * Only set JSON Content-Type for normal
   * JavaScript object requests.
   *
   * DO NOT set it for FormData.
   */
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }


  /*
   * Build fetch configuration.
   */
  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include'
  };


  /*
   * Add request body.
   *
   * FormData:
   *     Send directly.
   *
   * Normal object:
   *     Convert to JSON.
   */
  if (options.body !== undefined) {

    if (isFormData) {

      config.body = options.body;

    } else {

      config.body = JSON.stringify(options.body);

    }
  }


  /*
   * Send request.
   */
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    config
  );


  /*
   * Parse server response.
   */
  let data;

  try {

    data = await response.json();

  } catch (err) {

    data = {
      success: false,
      message: 'Invalid response from server'
    };

  }


  /*
   * Handle HTTP errors.
   */
  if (!response.ok) {

    const error = new Error(
      data.message || 'Request failed'
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }


  return data;
}


/**
 * ============================================
 * AUTH API
 * ============================================
 */

const authApi = {

  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: userData
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST'
    }),

  me: () =>
    apiRequest('/auth/me')

};


/**
 * ============================================
 * USERS API
 * ============================================
 */

const usersApi = {

  getProfile: (userId) =>
    apiRequest(`/users/${userId}`),

  updateMe: (userData) =>
    apiRequest('/users/me', {
      method: 'PUT',
      body: userData
    }),

  getUserPosts: (
    userId,
    page = 1,
    limit = 10
  ) =>
    apiRequest(
      `/users/${userId}/posts?page=${page}&limit=${limit}`
    ),

  getFollowers: (userId) =>
    apiRequest(`/users/${userId}/followers`),

  getFollowing: (userId) =>
    apiRequest(`/users/${userId}/following`),

  follow: (userId) =>
    apiRequest(
      `/users/${userId}/follow`,
      {
        method: 'POST'
      }
    ),

  unfollow: (userId) =>
    apiRequest(
      `/users/${userId}/follow`,
      {
        method: 'DELETE'
      }
    )

};


/**
 * ============================================
 * POSTS API
 * ============================================
 */

const postsApi = {

  /*
   * Get feed.
   */
  getFeed: (
    page = 1,
    limit = 10
  ) =>
    apiRequest(
      `/posts?page=${page}&limit=${limit}`
    ),


  /*
   * Get single post.
   */
  getPost: (postId) =>
    apiRequest(`/posts/${postId}`),


  /*
   * Create post.
   *
   * postData can be either:
   *
   * 1. Normal object
   *
   * {
   *   content: "Hello",
   *   image_url: "https://..."
   * }
   *
   * OR
   *
   * 2. FormData
   *
   * const formData = new FormData();
   * formData.append('content', 'Hello');
   * formData.append('image', file);
   */
  create: (postData) =>
    apiRequest(
      '/posts',
      {
        method: 'POST',
        body: postData
      }
    ),


  /*
   * Update post.
   */
  update: (
    postId,
    postData
  ) =>
    apiRequest(
      `/posts/${postId}`,
      {
        method: 'PUT',
        body: postData
      }
    ),


  /*
   * Delete post.
   */
  delete: (postId) =>
    apiRequest(
      `/posts/${postId}`,
      {
        method: 'DELETE'
      }
    ),


  /*
   * Get comments.
   */
  getComments: (postId) =>
    apiRequest(
      `/posts/${postId}/comments`
    ),


  /*
   * Add comment.
   */
  addComment: (
    postId,
    content
  ) =>
    apiRequest(
      `/posts/${postId}/comments`,
      {
        method: 'POST',
        body: {
          content
        }
      }
    ),


  /*
   * Like post.
   */
  like: (postId) =>
    apiRequest(
      `/posts/${postId}/like`,
      {
        method: 'POST'
      }
    ),


  /*
   * Unlike post.
   */
  unlike: (postId) =>
    apiRequest(
      `/posts/${postId}/like`,
      {
        method: 'DELETE'
      }
    )

};


/**
 * ============================================
 * COMMENTS API
 * ============================================
 */

const commentsApi = {

  delete: (commentId) =>
    apiRequest(
      `/comments/${commentId}`,
      {
        method: 'DELETE'
      }
    )

};
