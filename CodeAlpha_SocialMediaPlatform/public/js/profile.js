/**
 * SocialSphere - Profile Page Logic
 */

let profileUserId = null;
let profilePage = 1;
const PROFILE_POSTS_PER_PAGE = 10;

/**
 * Get the profile user ID from URL or use current user.
 */
function getProfileUserId() {
  const urlId = getUrlParam('id');
  if (urlId) {
    return parseInt(urlId, 10);
  }
  return currentUser ? currentUser.id : null;
}

/**
 * Load the profile data.
 */
async function loadProfile() {
  profileUserId = getProfileUserId();

  if (!profileUserId) {
    showToast('User not found', 'error');
    setTimeout(() => window.location.href = '/index.html', 1000);
    return;
  }

  try {
    const response = await usersApi.getProfile(profileUserId);
    const { profile, is_following } = response.data;

    // Update profile header
    document.getElementById('profile-username').textContent = profile.username;
    document.getElementById('profile-bio').textContent = profile.bio || 'No bio yet';
    document.getElementById('profile-image').src = profile.profile_image || 'https://i.pravatar.cc/150?img=1';
    document.getElementById('stat-posts').textContent = profile.posts_count;
    document.getElementById('stat-followers').textContent = profile.followers_count;
    document.getElementById('stat-following').textContent = profile.following_count;

    // Setup actions
    const isOwnProfile = currentUser && profile.id === currentUser.id;
    const followBtn = document.getElementById('follow-btn');
    const editBtn = document.getElementById('edit-profile-btn');

    if (isOwnProfile) {
      editBtn.hidden = false;
      followBtn.hidden = true;
    } else {
      followBtn.hidden = false;
      editBtn.hidden = true;
      updateFollowButton(is_following);
    }

    // Load user's posts
    await loadProfilePosts();
  } catch (err) {
    showToast(err.message || 'Failed to load profile', 'error');
    setTimeout(() => window.location.href = '/index.html', 1000);
  }
}

/**
 * Update the follow button state.
 * @param {boolean} isFollowing - Whether the current user follows this profile
 */
function updateFollowButton(isFollowing) {
  const followBtn = document.getElementById('follow-btn');
  if (!followBtn) return;

  followBtn.textContent = isFollowing ? 'Unfollow' : 'Follow';
  followBtn.classList.toggle('btn-outline', isFollowing);
  followBtn.classList.toggle('btn-primary', !isFollowing);
  followBtn.dataset.following = isFollowing ? 'true' : 'false';
}

/**
 * Load the profile user's posts.
 */
async function loadProfilePosts() {
  const container = document.getElementById('profile-posts-container');
  if (!container) return;

  showLoading(container, 'Loading posts...');

  try {
    const response = await usersApi.getUserPosts(profileUserId, profilePage, PROFILE_POSTS_PER_PAGE);
    const { posts, pagination } = response.data;

    if (posts.length === 0) {
      showEmptyState(container, '📝', 'No posts yet', 'This user hasn\'t posted anything yet.');
    } else {
      container.innerHTML = posts.map(renderPost).join('');
      setupPostEventListeners();
    }

    updatePagination(pagination);
  } catch (err) {
    container.innerHTML = '';
    showEmptyState(container, '⚠️', 'Failed to load posts', err.message || 'Please try again later.');
  }
}

/**
 * Handle follow/unfollow.
 */
async function handleFollow() {
  const followBtn = document.getElementById('follow-btn');
  if (!followBtn) return;

  const isFollowing = followBtn.dataset.following === 'true';

  followBtn.disabled = true;
  try {
    if (isFollowing) {
      const response = await usersApi.unfollow(profileUserId);
      updateFollowButton(false);
      document.getElementById('stat-followers').textContent = response.data.followers_count;
      showToast('Unfollowed', 'info');
    } else {
      const response = await usersApi.follow(profileUserId);
      updateFollowButton(true);
      document.getElementById('stat-followers').textContent = response.data.followers_count;
      showToast('Following!', 'success');
    }
  } catch (err) {
    showToast(err.message || 'Failed to update follow status', 'error');
  } finally {
    followBtn.disabled = false;
  }
}

/**
 * Toggle the edit profile form.
 */
function toggleEditProfile() {
  const editCard = document.getElementById('edit-profile-card');
  if (!editCard) return;

  if (editCard.hidden) {
    // Populate form with current data
    document.getElementById('edit-username').value = currentUser.username || '';
    document.getElementById('edit-bio').value = currentUser.bio || '';
    document.getElementById('edit-profile-image').value = currentUser.profile_image || '';
    editCard.hidden = false;
    editCard.scrollIntoView({ behavior: 'smooth' });
  } else {
    editCard.hidden = true;
  }
}

/**
 * Handle edit profile form submission.
 */
async function handleEditProfile() {
  const form = document.getElementById('edit-profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('edit-username').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const profileImage = document.getElementById('edit-profile-image').value.trim();
    const formError = document.getElementById('edit-form-error');
    const saveBtn = document.getElementById('save-profile-btn');

    // Clear errors
    document.getElementById('edit-username-error').textContent = '';
    document.getElementById('edit-bio-error').textContent = '';
    document.getElementById('edit-profile-image-error').textContent = '';
    formError.hidden = true;

    // Validate
    let valid = true;
    if (!username) {
      document.getElementById('edit-username-error').textContent = 'Username is required';
      valid = false;
    } else if (username.length < 3) {
      document.getElementById('edit-username-error').textContent = 'Username must be at least 3 characters';
      valid = false;
    }

    if (profileImage && !/^https?:\/\/.+/.test(profileImage)) {
      document.getElementById('edit-profile-image-error').textContent = 'Enter a valid URL';
      valid = false;
    }

    if (!valid) return;

    // Submit
    setButtonLoading(saveBtn, 'Saving...');
    try {
      const response = await usersApi.updateMe({
        username,
        ...(bio ? { bio } : {}),
        ...(profileImage ? { profile_image: profileImage } : {})
      });

      currentUser = response.data.user;
      document.getElementById('profile-username').textContent = currentUser.username;
      document.getElementById('profile-bio').textContent = currentUser.bio || 'No bio yet';
      document.getElementById('profile-image').src = currentUser.profile_image || 'https://i.pravatar.cc/150?img=1';

      document.getElementById('edit-profile-card').hidden = true;
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      resetButtonLoading(saveBtn);
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for auth to initialize
  const checkAuth = setInterval(() => {
    if (isAuthenticated()) {
      clearInterval(checkAuth);
      loadProfile();
      handleEditProfile();

      // Follow button
      document.getElementById('follow-btn')?.addEventListener('click', handleFollow);

      // Edit profile button
      document.getElementById('edit-profile-btn')?.addEventListener('click', toggleEditProfile);

      // Cancel edit button
      document.getElementById('cancel-edit-btn')?.addEventListener('click', () => {
        document.getElementById('edit-profile-card').hidden = true;
      });

      // Pagination
      document.getElementById('prev-page')?.addEventListener('click', () => {
        if (profilePage > 1) {
          profilePage--;
          loadProfilePosts();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

      document.getElementById('next-page')?.addEventListener('click', () => {
        profilePage++;
        loadProfilePosts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }, 100);

  // Timeout after 5 seconds
  setTimeout(() => clearInterval(checkAuth), 5000);
});