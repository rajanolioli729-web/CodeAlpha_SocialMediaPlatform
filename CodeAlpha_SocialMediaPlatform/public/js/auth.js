/**
 * =========================================================
 * SocialSphere - Authentication State Management
 * =========================================================
 */

let currentUser = null;

/**
 * =========================================================
 * AUTH STATE
 * =========================================================
 */

function isAuthenticated() {
  return currentUser !== null;
}

function getCurrentUser() {
  return currentUser;
}

function setCurrentUser(user) {
  currentUser = user;
}

/**
 * =========================================================
 * DEFAULT PROFILE IMAGE
 * =========================================================
 */

const AUTH_DEFAULT_PROFILE_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg"
         width="150"
         height="150"
         viewBox="0 0 150 150">

      <rect width="150" height="150" fill="#e5e7eb"/>

      <circle
        cx="75"
        cy="58"
        r="28"
        fill="#9ca3af"
      />

      <path
        d="M25 135c5-30 25-45 50-45s45 15 50 45"
        fill="#9ca3af"
      />

    </svg>
  `);

/**
 * =========================================================
 * PROFILE IMAGE URL
 * =========================================================
 */

function getAuthProfileImageUrl(image) {
  if (!image) {
    return AUTH_DEFAULT_PROFILE_IMAGE;
  }

  const value = String(image).trim();

  if (!value) {
    return AUTH_DEFAULT_PROFILE_IMAGE;
  }

  // Base64 / SVG data URL
  if (value.startsWith('data:')) {
    return value;
  }

  // External URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Already an absolute local path
  if (value.startsWith('/')) {
    return value;
  }

  // Example:
  // uploads/profile-123.png
  return '/' + value;
}

/**
 * =========================================================
 * LOAD CURRENT USER
 * =========================================================
 */

async function loadCurrentUser() {
  try {
    const response = await authApi.me();

    if (
      !response ||
      !response.success ||
      !response.data ||
      !response.data.user
    ) {
      throw new Error('Unable to retrieve authenticated user.');
    }

    currentUser = response.data.user;

    return currentUser;

  } catch (err) {
    console.error('loadCurrentUser error:', err);

    currentUser = null;

    return null;
  }
}

/**
 * =========================================================
 * RENDER HOME SIDEBAR PROFILE
 * =========================================================
 */

function renderCurrentUserCard() {
  const container =
    document.getElementById('current-user-info');

  if (!container) {
    return;
  }

  /*
   * If authentication failed, remove the skeleton.
   */
  if (!currentUser) {
    container.innerHTML = `
      <div class="profile-card-empty">
        <p>Unable to load profile.</p>
      </div>
    `;

    return;
  }

  const username =
    currentUser.username || 'User';

  const bio =
    currentUser.bio || 'No bio yet';

  const imageUrl =
    getAuthProfileImageUrl(
      currentUser.profile_image
    );

  const profileUrl =
    `/profile.html?id=${encodeURIComponent(
      currentUser.id
    )}`;

  container.innerHTML = `
    <a
      href="${profileUrl}"
      class="profile-card-link"
      aria-label="View profile"
    >

      <img
        class="profile-card-avatar"
        src="${imageUrl}"
        alt="${escapeAuthHtml(username)}"
      >

      <div class="profile-card-name">
        ${escapeAuthHtml(username)}
      </div>

      <div class="profile-card-bio">
        ${escapeAuthHtml(bio)}
      </div>

    </a>
  `;

  /*
   * If image cannot be loaded,
   * show the built-in fallback.
   */
  const image =
    container.querySelector(
      '.profile-card-avatar'
    );

  if (image) {
    image.onerror = function () {
      this.onerror = null;
      this.src =
        AUTH_DEFAULT_PROFILE_IMAGE;
    };
  }
}

/**
 * =========================================================
 * ESCAPE HTML
 * =========================================================
 */

function escapeAuthHtml(value) {
  const div =
    document.createElement('div');

  div.textContent =
    value == null
      ? ''
      : String(value);

  return div.innerHTML;
}

/**
 * =========================================================
 * AUTH INITIALIZATION
 * =========================================================
 */

async function initAuth(
  requireAuth = true
) {
  const user =
    await loadCurrentUser();

  /*
   * Protected page without authentication.
   */
  if (requireAuth && !user) {
    window.location.href =
      '/login.html';

    return null;
  }

  /*
   * Login/register page while already logged in.
   */
  if (!requireAuth && user) {
    window.location.href =
      '/index.html';

    return user;
  }

  /*
   * Navbar.
   */
  setupNavbar();

  /*
   * Home sidebar.
   *
   * This is the important fix.
   */
  renderCurrentUserCard();

  return user;
}

/**
 * =========================================================
 * NAVBAR
 * =========================================================
 */

function setupNavbar() {
  const profileLink =
    document.getElementById(
      'nav-profile'
    );

  const logoutBtn =
    document.getElementById(
      'nav-logout'
    );

  /*
   * Profile link.
   */
  if (
    profileLink &&
    currentUser
  ) {
    profileLink.href =
      `/profile.html?id=${encodeURIComponent(
        currentUser.id
      )}`;
  }

  /*
   * Logout.
   */
  if (
    logoutBtn &&
    !logoutBtn.dataset.listenerAttached
  ) {
    logoutBtn.dataset.listenerAttached =
      'true';

    logoutBtn.addEventListener(
      'click',
      async function (event) {
        event.preventDefault();

        try {
          await authApi.logout();

          currentUser = null;

          window.location.href =
            '/login.html';

        } catch (err) {
          console.error(
            'Logout error:',
            err
          );

          showToast(
            err.message ||
              'Logout failed',
            'error'
          );
        }
      }
    );
  }
}

/**
 * =========================================================
 * LOGIN
 * =========================================================
 */

async function handleLogin() {
  const form =
    document.getElementById(
      'login-form'
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    'submit',
    async function (event) {
      event.preventDefault();

      const email =
        document
          .getElementById('email')
          .value
          .trim();

      const password =
        document
          .getElementById('password')
          .value;

      const formError =
        document.getElementById(
          'form-error'
        );

      const loginBtn =
        document.getElementById(
          'login-btn'
        );

      document.getElementById(
        'email-error'
      ).textContent = '';

      document.getElementById(
        'password-error'
      ).textContent = '';

      formError.hidden = true;

      let valid = true;

      if (!email) {
        document.getElementById(
          'email-error'
        ).textContent =
          'Email is required';

        valid = false;

      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(email)
      ) {
        document.getElementById(
          'email-error'
        ).textContent =
          'Enter a valid email';

        valid = false;
      }

      if (!password) {
        document.getElementById(
          'password-error'
        ).textContent =
          'Password is required';

        valid = false;
      }

      if (!valid) {
        return;
      }

      setButtonLoading(
        loginBtn,
        'Logging in...'
      );

      try {
        const response =
          await authApi.login({
            email,
            password
          });

        if (
          !response ||
          !response.success ||
          !response.data ||
          !response.data.user
        ) {
          throw new Error(
            response?.message ||
              'Login failed.'
          );
        }

        currentUser =
          response.data.user;

        showToast(
          'Login successful!',
          'success'
        );

        window.location.href =
          '/index.html';

      } catch (err) {
        console.error(
          'Login error:',
          err
        );

        formError.textContent =
          err.message ||
          'Login failed.';

        formError.hidden = false;

        resetButtonLoading(
          loginBtn
        );
      }
    }
  );
}

/**
 * =========================================================
 * REGISTER
 * =========================================================
 */

async function handleRegister() {
  const form =
    document.getElementById(
      'register-form'
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    'submit',
    async function (event) {
      event.preventDefault();

      const username =
        document
          .getElementById('username')
          .value
          .trim();

      const email =
        document
          .getElementById('email')
          .value
          .trim();

      const password =
        document
          .getElementById('password')
          .value;

      const confirmPassword =
        document
          .getElementById(
            'confirm-password'
          )
          .value;

      const formError =
        document.getElementById(
          'form-error'
        );

      const registerBtn =
        document.getElementById(
          'register-btn'
        );

      let valid = true;

      formError.hidden = true;

      document.querySelectorAll(
        '.error-message'
      ).forEach(function (element) {
        element.textContent = '';
      });

      if (!username) {
        document.getElementById(
          'username-error'
        ).textContent =
          'Username is required';

        valid = false;

      } else if (
        username.length < 3
      ) {
        document.getElementById(
          'username-error'
        ).textContent =
          'Username must be at least 3 characters';

        valid = false;
      }

      if (!email) {
        document.getElementById(
          'email-error'
        ).textContent =
          'Email is required';

        valid = false;

      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
          .test(email)
      ) {
        document.getElementById(
          'email-error'
        ).textContent =
          'Enter a valid email';

        valid = false;
      }

      if (!password) {
        document.getElementById(
          'password-error'
        ).textContent =
          'Password is required';

        valid = false;

      } else if (
        password.length < 8
      ) {
        document.getElementById(
          'password-error'
        ).textContent =
          'Password must be at least 8 characters';

        valid = false;

      } else if (
        !/[a-zA-Z]/.test(password) ||
        !/[0-9]/.test(password)
      ) {
        document.getElementById(
          'password-error'
        ).textContent =
          'Password must contain letters and numbers';

        valid = false;
      }

      if (!confirmPassword) {
        document.getElementById(
          'confirm-password-error'
        ).textContent =
          'Please confirm your password';

        valid = false;

      } else if (
        password !== confirmPassword
      ) {
        document.getElementById(
          'confirm-password-error'
        ).textContent =
          'Passwords do not match';

        valid = false;
      }

      if (!valid) {
        return;
      }

      setButtonLoading(
        registerBtn,
        'Creating account...'
      );

      try {
        const response =
          await authApi.register({
            username,
            email,
            password
          });

        if (
          !response ||
          !response.success ||
          !response.data ||
          !response.data.user
        ) {
          throw new Error(
            response?.message ||
              'Registration failed.'
          );
        }

        currentUser =
          response.data.user;

        showToast(
          'Account created successfully!',
          'success'
        );

        setTimeout(
          function () {
            window.location.href =
              '/index.html';
          },
          500
        );

      } catch (err) {
        console.error(
          'Registration error:',
          err
        );

        formError.textContent =
          err.message ||
          'Registration failed.';

        formError.hidden = false;

        resetButtonLoading(
          registerBtn
        );
      }
    }
  );
}

/**
 * =========================================================
 * PAGE INITIALIZATION
 * =========================================================
 */

document.addEventListener(
  'DOMContentLoaded',
  function () {
    const isLoginPage =
      document.getElementById(
        'login-form'
      );

    const isRegisterPage =
      document.getElementById(
        'register-form'
      );

    if (isLoginPage) {
      initAuth(false)
        .then(function () {
          handleLogin();
        });

    } else if (isRegisterPage) {
      initAuth(false)
        .then(function () {
          handleRegister();
        });

    } else {
      initAuth(true);
    }
  }
);