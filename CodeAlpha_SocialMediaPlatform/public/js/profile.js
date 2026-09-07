/**
 * SocialSphere - Profile Page Logic
 */

let profileUserId = null;
let profilePage = 1;

const PROFILE_POSTS_PER_PAGE = 10;

/**
 * Local-safe default profile image.
 * Uses data: because your CSP allows data images.
 */
const DEFAULT_PROFILE_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">' +
    '<rect width="150" height="150" fill="#e5e7eb"/>' +
    '<circle cx="75" cy="58" r="28" fill="#9ca3af"/>' +
    '<path d="M25 135c5-30 25-45 50-45s45 15 50 45" fill="#9ca3af"/>' +
    '</svg>'
  );

/**
 * Get usable profile image URL.
 */
function getProfileImageUrl(image) {
  if (!image) {
    return DEFAULT_PROFILE_IMAGE;
  }

  const value = String(image).trim();

  if (!value) {
    return DEFAULT_PROFILE_IMAGE;
  }

  if (value.startsWith('data:')) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith('/')) {
    return value;
  }

  return '/' + value;
}

/**
 * Get profile user ID from URL.
 */
function getProfileUserId() {
  const urlId = getUrlParam('id');

  if (urlId) {
    const id = parseInt(urlId, 10);

    if (!Number.isNaN(id)) {
      return id;
    }
  }

  return currentUser ? currentUser.id : null;
}

/**
 * Load profile.
 */
async function loadProfile() {
  profileUserId = getProfileUserId();

  if (!profileUserId) {
    showToast('User not found', 'error');

    setTimeout(function () {
      window.location.href = '/index.html';
    }, 1000);

    return;
  }

  try {
    const response =
      await usersApi.getProfile(profileUserId);

    const data =
      response.data || {};

    const profile =
      data.profile || {};

    const isFollowing =
      Boolean(data.is_following);

    const usernameElement =
      document.getElementById(
        'profile-username'
      );

    const bioElement =
      document.getElementById(
        'profile-bio'
      );

    const imageElement =
      document.getElementById(
        'profile-image'
      );

    const postsElement =
      document.getElementById(
        'stat-posts'
      );

    const followersElement =
      document.getElementById(
        'stat-followers'
      );

    const followingElement =
      document.getElementById(
        'stat-following'
      );

    if (usernameElement) {
      usernameElement.textContent =
        profile.username || 'Unknown User';
    }

    if (bioElement) {
      bioElement.textContent =
        profile.bio || 'No bio yet';
    }

    if (imageElement) {
      imageElement.src =
        getProfileImageUrl(
          profile.profile_image
        );

      imageElement.onerror =
        function () {
          this.onerror = null;
          this.src = DEFAULT_PROFILE_IMAGE;
        };
    }

    if (postsElement) {
      postsElement.textContent =
        profile.posts_count || 0;
    }

    if (followersElement) {
      followersElement.textContent =
        profile.followers_count || 0;
    }

    if (followingElement) {
      followingElement.textContent =
        profile.following_count || 0;
    }

    const followBtn =
      document.getElementById(
        'follow-btn'
      );

    const editBtn =
      document.getElementById(
        'edit-profile-btn'
      );

    const isOwnProfile =
      currentUser &&
      Number(profile.id) ===
        Number(currentUser.id);

    if (isOwnProfile) {
      if (editBtn) {
        editBtn.hidden = false;
      }

      if (followBtn) {
        followBtn.hidden = true;
      }
    } else {
      if (editBtn) {
        editBtn.hidden = true;
      }

      if (followBtn) {
        followBtn.hidden = false;

        updateFollowButton(
          isFollowing
        );
      }
    }

    await loadProfilePosts();

  } catch (error) {
    console.error(
      'Load profile error:',
      error
    );

    showToast(
      error.message ||
      'Failed to load profile',
      'error'
    );
  }
}

/**
 * Update follow button.
 */
function updateFollowButton(
  isFollowing
) {
  const followBtn =
    document.getElementById(
      'follow-btn'
    );

  if (!followBtn) {
    return;
  }

  followBtn.textContent =
    isFollowing
      ? 'Unfollow'
      : 'Follow';

  followBtn.dataset.following =
    isFollowing
      ? 'true'
      : 'false';

  followBtn.classList.toggle(
    'btn-outline',
    isFollowing
  );

  followBtn.classList.toggle(
    'btn-primary',
    !isFollowing
  );
}

/**
 * Handle follow / unfollow.
 */
async function handleFollow() {
  const followBtn =
    document.getElementById(
      'follow-btn'
    );

  if (!followBtn) {
    return;
  }

  const isFollowing =
    followBtn.dataset.following ===
    'true';

  followBtn.disabled = true;

  try {
    let response;

    if (isFollowing) {
      response =
        await usersApi.unfollow(
          profileUserId
        );

      updateFollowButton(false);

      showToast(
        'Unfollowed',
        'info'
      );

    } else {
      response =
        await usersApi.follow(
          profileUserId
        );

      updateFollowButton(true);

      showToast(
        'Following!',
        'success'
      );
    }

    if (
      response &&
      response.data &&
      response.data.followers_count !==
        undefined
    ) {
      const followersElement =
        document.getElementById(
          'stat-followers'
        );

      if (followersElement) {
        followersElement.textContent =
          response.data.followers_count;
      }
    }

  } catch (error) {
    console.error(
      'Follow error:',
      error
    );

    showToast(
      error.message ||
      'Failed to update follow status',
      'error'
    );

  } finally {
    followBtn.disabled = false;
  }
}

/**
 * Load profile posts.
 */
async function loadProfilePosts() {
  const container =
    document.getElementById(
      'profile-posts-container'
    );

  if (!container) {
    return;
  }

  showLoading(
    container,
    'Loading posts...'
  );

  try {
    const response =
      await usersApi.getUserPosts(
        profileUserId,
        profilePage,
        PROFILE_POSTS_PER_PAGE
      );

    const data =
      response.data || {};

    const posts =
      Array.isArray(data.posts)
        ? data.posts
        : [];

    const pagination =
      data.pagination || {};

    console.log(
      'Profile posts response:',
      data
    );

    if (posts.length === 0) {
      showEmptyState(
        container,
        '📝',
        'No posts yet',
        "This user hasn't posted anything yet."
      );

      updatePagination(
        pagination
      );

      return;
    }

    /*
     * Use existing renderPost if available.
     */
    if (
      typeof renderPost ===
      'function'
    ) {
      container.innerHTML =
        posts
          .map(function (post) {
            return renderPost(post);
          })
          .join('');

      if (
        typeof setupPostEventListeners ===
        'function'
      ) {
        setupPostEventListeners();
      }

    } else {
      /*
       * Fallback renderer.
       */
      container.innerHTML =
        posts
          .map(function (post) {
            return renderSimpleProfilePost(
              post
            );
          })
          .join('');
    }

    updatePagination(
      pagination
    );

  } catch (error) {
    console.error(
      'Load profile posts error:',
      error
    );

    container.innerHTML = '';

    showEmptyState(
      container,
      '⚠️',
      'Failed to load posts',
      error.message ||
      'Please try again later.'
    );
  }
}

/**
 * Simple fallback post renderer.
 */
function renderSimpleProfilePost(
  post
) {
  const username =
    post.username ||
    post.author_username ||
    'User';

  const content =
    post.content || '';

  const image =
    post.image_url ||
    post.image ||
    '';

  const profileImage =
    post.author_profile_image ||
    post.profile_image ||
    '';

  const likes =
    post.likes_count ||
    0;

  const comments =
    post.comments_count ||
    0;

  const avatar =
    getProfileImageUrl(
      profileImage
    );

  const postImage =
    image
      ? '<div class="post-image-container">' +
        '<img class="post-image" src="' +
        getProfileImageUrl(image) +
        '" alt="Post image">' +
        '</div>'
      : '';

  return (
    '<article class="card post-card">' +

    '<div class="post-author">' +

    '<img class="post-author-avatar" src="' +
    avatar +
    '" alt="Profile">' +

    '<div class="post-author-info">' +
    '<strong>' +
    escapeHtmlSafe(username) +
    '</strong>' +
    '</div>' +

    '</div>' +

    (
      content
        ? '<div class="post-content">' +
          escapeHtmlSafe(content) +
          '</div>'
        : ''
    ) +

    postImage +

    '<div class="post-actions">' +

    '<span class="btn btn-sm btn-outline">' +
    '♡ Like ' +
    likes +
    '</span>' +

    '<span class="btn btn-sm btn-outline">' +
    '💬 Comments ' +
    comments +
    '</span>' +

    '</div>' +

    '</article>'
  );
}

/**
 * Safe HTML helper.
 */
function escapeHtmlSafe(
  value
) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Update pagination.
 */
function updatePagination(
  pagination
) {
  const previous =
    document.getElementById(
      'prev-page'
    );

  const next =
    document.getElementById(
      'next-page'
    );

  const pageInfo =
    document.getElementById(
      'page-info'
    );

  const current =
    Number(
      pagination.current_page ??
      pagination.currentPage ??
      pagination.page ??
      profilePage
    );

  const total =
    Number(
      pagination.total_pages ??
      pagination.totalPages ??
      pagination.pages ??
      1
    );

  if (pageInfo) {
    pageInfo.textContent =
      'Page ' +
      current +
      ' of ' +
      total;
  }

  if (previous) {
    previous.disabled =
      current <= 1;
  }

  if (next) {
    next.disabled =
      current >= total;
  }
}

/**
 * Toggle edit profile.
 *
 * IMPORTANT:
 * File inputs cannot be assigned an existing
 * filename for security reasons.
 */
function toggleEditProfile() {
  const editCard =
    document.getElementById(
      'edit-profile-card'
    );

  if (!editCard) {
    return;
  }

  if (editCard.hidden) {
    if (!currentUser) {
      showToast(
        'User information is not available',
        'error'
      );

      return;
    }

    const usernameInput =
      document.getElementById(
        'edit-username'
      );

    const bioInput =
      document.getElementById(
        'edit-bio'
      );

    const imageInput =
      document.getElementById(
        'edit-profile-image'
      );

    if (usernameInput) {
      usernameInput.value =
        currentUser.username || '';
    }

    if (bioInput) {
      bioInput.value =
        currentUser.bio || '';
    }

    /*
     * DO NOT set imageInput.value.
     *
     * Browsers do not allow JavaScript
     * to set a file input's filename.
     *
     * Clear it instead.
     */
    if (imageInput) {
      imageInput.value = '';
    }

    editCard.hidden = false;

    editCard.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

  } else {
    editCard.hidden = true;
  }
}

/**
 * Handle edit profile form.
 *
 * Uses FormData so the profile picture
 * can be uploaded from the local computer.
 */
function handleEditProfile() {
  const form =
    document.getElementById(
      'edit-profile-form'
    );

  if (!form) {
    return;
  }

  form.addEventListener(
    'submit',
    async function (event) {
      event.preventDefault();

      const usernameInput =
        document.getElementById(
          'edit-username'
        );

      const bioInput =
        document.getElementById(
          'edit-bio'
        );

      const imageInput =
        document.getElementById(
          'edit-profile-image'
        );

      const usernameError =
        document.getElementById(
          'edit-username-error'
        );

      const bioError =
        document.getElementById(
          'edit-bio-error'
        );

      const imageError =
        document.getElementById(
          'edit-profile-image-error'
        );

      const formError =
        document.getElementById(
          'edit-form-error'
        );

      const saveBtn =
        document.getElementById(
          'save-profile-btn'
        );

      const username =
        usernameInput
          ? usernameInput.value.trim()
          : '';

      const bio =
        bioInput
          ? bioInput.value.trim()
          : '';

      /*
       * Get selected local image.
       *
       * IMPORTANT:
       * Do NOT use .value.trim().
       */
      const selectedFile =
        imageInput &&
        imageInput.files &&
        imageInput.files.length > 0
          ? imageInput.files[0]
          : null;

      if (usernameError) {
        usernameError.textContent = '';
      }

      if (bioError) {
        bioError.textContent = '';
      }

      if (imageError) {
        imageError.textContent = '';
      }

      if (formError) {
        formError.textContent = '';
        formError.hidden = true;
      }

      let valid = true;

      if (!username) {
        if (usernameError) {
          usernameError.textContent =
            'Username is required';
        }

        valid = false;

      } else if (username.length < 3) {
        if (usernameError) {
          usernameError.textContent =
            'Username must be at least 3 characters';
        }

        valid = false;
      }

      /*
       * Validate local image.
       */
      if (selectedFile) {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ];

        if (
          !allowedTypes.includes(
            selectedFile.type
          )
        ) {
          if (imageError) {
            imageError.textContent =
              'Only JPG, PNG, GIF or WEBP images are allowed';
          }

          valid = false;
        }

        /*
         * Maximum 5 MB.
         */
        if (
          selectedFile.size >
          5 * 1024 * 1024
        ) {
          if (imageError) {
            imageError.textContent =
              'Image must be smaller than 5 MB';
          }

          valid = false;
        }
      }

      if (!valid) {
        return;
      }

      if (saveBtn) {
        setButtonLoading(
          saveBtn,
          'Saving...'
        );
      }

      try {
        /*
         * Create multipart/form-data.
         */
        const formData =
          new FormData();

        formData.append(
          'username',
          username
        );

        formData.append(
          'bio',
          bio
        );

        /*
         * Add image only when the user
         * selected a new image.
         */
        if (selectedFile) {
          formData.append(
            'profile_image',
            selectedFile
          );
        }

        /*
         * api.js already detects FormData
         * and will NOT set application/json.
         */
        const response =
          await usersApi.updateMe(
            formData
          );

        if (
          response &&
          response.data &&
          response.data.user
        ) {
          currentUser =
            response.data.user;
        }

        const profileUsername =
          document.getElementById(
            'profile-username'
          );

        const profileBio =
          document.getElementById(
            'profile-bio'
          );

        const profileImageElement =
          document.getElementById(
            'profile-image'
          );

        if (profileUsername) {
          profileUsername.textContent =
            currentUser.username ||
            username;
        }

        if (profileBio) {
          profileBio.textContent =
            currentUser.bio ||
            'No bio yet';
        }

        if (profileImageElement) {
          profileImageElement.src =
            getProfileImageUrl(
              currentUser.profile_image
            );

          profileImageElement.onerror =
            function () {
              this.onerror = null;
              this.src =
                DEFAULT_PROFILE_IMAGE;
            };
        }

        /*
         * Clear file input after successful upload.
         */
        if (imageInput) {
          imageInput.value = '';
        }

        const editCard =
          document.getElementById(
            'edit-profile-card'
          );

        if (editCard) {
          editCard.hidden = true;
        }

        showToast(
          'Profile updated successfully!',
          'success'
        );

      } catch (error) {
        console.error(
          'Update profile error:',
          error
        );

        if (formError) {
          formError.textContent =
            error.message ||
            'Failed to update profile';

          formError.hidden = false;
        }

      } finally {
        if (saveBtn) {
          resetButtonLoading(
            saveBtn
          );
        }
      }
    }
  );
}

/**
 * Initialize profile page.
 */
document.addEventListener(
  'DOMContentLoaded',
  async function () {
    try {
      /*
       * Wait for authentication.
       */
      const user =
        await loadCurrentUser();

      if (!user) {
        window.location.href =
          '/login.html';

        return;
      }

      /*
       * Setup navbar.
       */
      if (
        typeof setupNavbar ===
        'function'
      ) {
        setupNavbar();
      }

      /*
       * Load profile.
       */
      await loadProfile();

      /*
       * Setup edit form.
       */
      handleEditProfile();

      /*
       * Follow button.
       */
      const followButton =
        document.getElementById(
          'follow-btn'
        );

      if (followButton) {
        followButton.addEventListener(
          'click',
          handleFollow
        );
      }

      /*
       * Edit profile button.
       */
      const editButton =
        document.getElementById(
          'edit-profile-btn'
        );

      if (editButton) {
        editButton.addEventListener(
          'click',
          toggleEditProfile
        );
      }

      /*
       * Cancel edit.
       */
      const cancelButton =
        document.getElementById(
          'cancel-edit-btn'
        );

      if (cancelButton) {
        cancelButton.addEventListener(
          'click',
          function () {
            const editCard =
              document.getElementById(
                'edit-profile-card'
              );

            if (editCard) {
              editCard.hidden = true;
            }
          }
        );
      }

      /*
       * Previous page.
       */
      const previousButton =
        document.getElementById(
          'prev-page'
        );

      if (previousButton) {
        previousButton.addEventListener(
          'click',
          function () {
            if (profilePage <= 1) {
              return;
            }

            profilePage--;

            loadProfilePosts();

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        );
      }

      /*
       * Next page.
       */
      const nextButton =
        document.getElementById(
          'next-page'
        );

      if (nextButton) {
        nextButton.addEventListener(
          'click',
          function () {
            profilePage++;

            loadProfilePosts();

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
        );
      }

    } catch (error) {
      console.error(
        'Profile initialization error:',
        error
      );

      showToast(
        error.message ||
        'Failed to initialize profile',
        'error'
      );
    }
  }
);