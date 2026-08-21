/**
 * SocialSphere - Authentication State Management
 */

let currentUser = null;

/**
 * Check if the user is authenticated.
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  return currentUser !== null;
}

/**
 * Get the current authenticated user.
 * @returns {Object|null} Current user or null
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Set the current user.
 * @param {Object} user - User object
 */
function setCurrentUser(user) {
  currentUser = user;
}

/**
 * Load the current user from the API.
 * @returns {Promise<Object|null>} User object or null
 */
async function loadCurrentUser() {
  try {
    const response = await authApi.me();
    currentUser = response.data.user;
    return currentUser;
  } catch (err) {
    currentUser = null;
    return null;
  }
}

/**
 * Initialize authentication state on page load.
 * Redirects to login if not authenticated (for protected pages).
 * @param {boolean} requireAuth - Whether the page requires authentication
 */
async function initAuth(requireAuth = true) {
  const user = await loadCurrentUser();

  if (requireAuth && !user) {
    window.location.href = '/login.html';
    return null;
  }

  if (!requireAuth && user) {
    window.location.href = '/index.html';
    return user;
  }

  setupNavbar();
  return user;
}

/**
 * Setup the navbar with user info and logout.
 */
function setupNavbar() {
  const profileLink = document.getElementById('nav-profile');
  const logoutBtn = document.getElementById('nav-logout');

  if (profileLink && currentUser) {
    profileLink.href = `/profile.html?id=${currentUser.id}`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await authApi.logout();
        currentUser = null;
        window.location.href = '/login.html';
      } catch (err) {
        showToast(err.message || 'Logout failed', 'error');
      }
    });
  }
}

/**
 * Handle login form submission.
 */
async function handleLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const formError = document.getElementById('form-error');
    const loginBtn = document.getElementById('login-btn');

    // Clear previous errors
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    formError.hidden = true;

    // Validate
    let valid = true;
    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = 'Enter a valid email';
      valid = false;
    }
    if (!password) {
      document.getElementById('password-error').textContent = 'Password is required';
      valid = false;
    }

    if (!valid) return;

    // Submit
    setButtonLoading(loginBtn, 'Logging in...');
    try {
      const response = await authApi.login({ email, password });
      currentUser = response.data.user;
      showToast('Login successful!', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      resetButtonLoading(loginBtn);
    }
  });
}

/**
 * Handle register form submission.
 */
async function handleRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const formError = document.getElementById('form-error');
    const registerBtn = document.getElementById('register-btn');

    // Clear previous errors
    document.getElementById('username-error').textContent = '';
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    document.getElementById('confirm-password-error').textContent = '';
    formError.hidden = true;

    // Validate
    let valid = true;
    if (!username) {
      document.getElementById('username-error').textContent = 'Username is required';
      valid = false;
    } else if (username.length < 3) {
      document.getElementById('username-error').textContent = 'Username must be at least 3 characters';
      valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      document.getElementById('username-error').textContent = 'Only letters, numbers, and underscores allowed';
      valid = false;
    }

    if (!email) {
      document.getElementById('email-error').textContent = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      document.getElementById('email-error').textContent = 'Enter a valid email';
      valid = false;
    }

    if (!password) {
      document.getElementById('password-error').textContent = 'Password is required';
      valid = false;
    } else if (password.length < 8) {
      document.getElementById('password-error').textContent = 'Password must be at least 8 characters';
      valid = false;
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      document.getElementById('password-error').textContent = 'Password must contain letters and numbers';
      valid = false;
    }

    if (!confirmPassword) {
      document.getElementById('confirm-password-error').textContent = 'Please confirm your password';
      valid = false;
    } else if (password !== confirmPassword) {
      document.getElementById('confirm-password-error').textContent = 'Passwords do not match';
      valid = false;
    }

    if (!valid) return;

    // Submit
    setButtonLoading(registerBtn, 'Creating account...');
    try {
      const response = await authApi.register({ username, email, password });
      currentUser = response.data.user;
      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      resetButtonLoading(registerBtn);
    }
  });
}

// Initialize based on page
document.addEventListener('DOMContentLoaded', () => {
  const isLoginPage = document.getElementById('login-form');
  const isRegisterPage = document.getElementById('register-form');

  if (isLoginPage) {
    initAuth(false).then(() => handleLogin());
  } else if (isRegisterPage) {
    initAuth(false).then(() => handleRegister());
  } else {
    initAuth(true);
  }
});