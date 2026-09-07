
/**
 * SocialSphere - API Client
 * Supports JSON requests, FormData requests, and image uploads.
 */

const API_BASE = '/api';


/* =====================================================
   GENERIC API REQUEST
   ===================================================== */

async function apiRequest(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {})
  };

  // Do not set Content-Type for FormData.
  // The browser sets multipart/form-data automatically.
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method: options.method || 'GET',
    headers: headers,
    credentials: 'include'
  };

  if (options.body !== undefined) {
    if (isFormData) {
      config.body = options.body;
    } else {
      config.body = JSON.stringify(options.body);
    }
  }

  // Use normal string concatenation instead of template literals.
  const response = await fetch(
    API_BASE + endpoint,
    config
  );

  let data;

  try {
    data = await response.json();
  } catch (error) {
    data = {
      success: false,
      message: 'Invalid response from server'
    };
  }

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


/* =====================================================
   AUTH API
   ===================================================== */

const authApi = {

  register: function (userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  login: function (credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  logout: function () {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  me: function () {
    return apiRequest('/auth/me');
  }

};


/* =====================================================
   USERS API
   ===================================================== */

const usersApi = {

  getProfile: function (userId) {
    return apiRequest(
      '/users/' + userId
    );
  },

  updateMe: function (userData) {
    return apiRequest('/users/me', {
      method: 'PUT',
      body: userData
    });
  },

  /*
   * Upload profile picture from local computer.
   *
   * Expected FormData field:
   * profile_image
   */

  uploadProfileImage: function (formData) {
    return apiRequest(
      '/users/me/profile-image',
      {
        method: 'POST',
        body: formData
      }
    );
  },

  getUserPosts: function (
    userId,
    page,
    limit
  ) {
    page = page || 1;
    limit = limit || 10;

    return apiRequest(
      '/users/' +
      userId +
      '/posts?page=' +
      page +
      '&limit=' +
      limit
    );
  },

  getFollowers: function (userId) {
    return apiRequest(
      '/users/' + userId + '/followers'
    );
  },

  getFollowing: function (userId) {
    return apiRequest(
      '/users/' + userId + '/following'
    );
  },

  follow: function (userId) {
    return apiRequest(
      '/users/' + userId + '/follow',
      {
        method: 'POST'
      }
    );
  },

  unfollow: function (userId) {
    return apiRequest(
      '/users/' + userId + '/follow',
      {
        method: 'DELETE'
      }
    );
  }

};


/* =====================================================
   POSTS API
   ===================================================== */

const postsApi = {

  getFeed: function (
    page,
    limit
  ) {
    page = page || 1;
    limit = limit || 10;

    return apiRequest(
      '/posts?page=' +
      page +
      '&limit=' +
      limit
    );
  },

  getPost: function (postId) {
    return apiRequest(
      '/posts/' + postId
    );
  },

  create: function (postData) {
    return apiRequest(
      '/posts',
      {
        method: 'POST',
        body: postData
      }
    );
  },

  update: function (
    postId,
    postData
  ) {
    return apiRequest(
      '/posts/' + postId,
      {
        method: 'PUT',
        body: postData
      }
    );
  },

  delete: function (postId) {
    return apiRequest(
      '/posts/' + postId,
      {
        method: 'DELETE'
      }
    );
  },

  getComments: function (postId) {
    return apiRequest(
      '/posts/' +
      postId +
      '/comments'
    );
  },

  addComment: function (
    postId,
    content
  ) {
    return apiRequest(
      '/posts/' +
      postId +
      '/comments',
      {
        method: 'POST',
        body: {
          content: content
        }
      }
    );
  },

  like: function (postId) {
    return apiRequest(
      '/posts/' +
      postId +
      '/like',
      {
        method: 'POST'
      }
    );
  },

  unlike: function (postId) {
    return apiRequest(
      '/posts/' +
      postId +
      '/like',
      {
        method: 'DELETE'
      }
    );
  }

};


/* =====================================================
   COMMENTS API
   ===================================================== */

const commentsApi = {

  delete: function (commentId) {
    return apiRequest(
      '/comments/' + commentId,
      {
        method: 'DELETE'
      }
    );
  }

};

