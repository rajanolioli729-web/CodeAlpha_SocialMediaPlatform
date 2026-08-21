/**
 * SocialSphere - Feed and Post Rendering
 */

let currentPage = 1;
const POSTS_PER_PAGE = 10;

/**
 * Render a single post into the feed.
 * @param {Object} post - Post object from API
 * @returns {string} HTML string
 */
function renderPost(post) {
  const isOwner = currentUser && post.author_id === currentUser.id;
  const likedClass = post.liked_by_current_user ? 'liked' : '';

  return `
    <article class="post" data-post-id="${post.id}">
      <div class="post-header">
        <img class="post-avatar" src="${escapeHtml(post.author_profile_image || 'https://i.pravatar.cc/150?img=1')}" alt="${escapeHtml(post.author_username)}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
        <div class="post-author">
          <a href="/profile.html?id=${post.author_id}" class="post-author-name">${escapeHtml(post.author_username)}</a>
          <div class="post-date">${formatDate(post.created_at)}</div>
        </div>
        ${isOwner ? `
          <div class="post-owner-actions">
            <button class="action-btn edit-post-btn" data-post-id="${post.id}" data-content="${escapeHtml(post.content)}" data-image="${escapeHtml(post.image_url || '')}">
              <span class="icon">✏️</span> Edit
            </button>
            <button class="action-btn delete-post-btn" data-post-id="${post.id}">
              <span class="icon">🗑️</span> Delete
            </button>
          </div>
        ` : ''}
      </div>

      <div class="post-content">${escapeHtml(post.content)}</div>

      ${post.image_url ? `<img class="post-image" src="${escapeHtml(post.image_url)}" alt="Post image" onerror="this.style.display='none'">` : ''}

      <div class="post-actions">
        <button class="action-btn like-btn ${likedClass}" data-post-id="${post.id}">
          <span class="icon">${post.liked_by_current_user ? '❤️' : '🤍'}</span>
          <span class="like-count">${post.like_count}</span> Likes
        </button>
        <button class="action-btn toggle-comments-btn" data-post-id="${post.id}">
          <span class="icon">💬</span>
          <span class="comment-count">${post.comment_count}</span> Comments
        </button>
      </div>

      <div class="comments-section" data-post-id="${post.id}" hidden>
        <div class="comments-list" data-comments-list="${post.id}">
          <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading comments...</p>
          </div>
        </div>
        <form class="comment-form" data-comment-form="${post.id}">
          <input type="text" placeholder="Write a comment..." maxlength="1000" required>
          <button type="submit">Post</button>
        </form>
      </div>
    </article>
  `;
}

/**
 * Render a comment.
 * @param {Object} comment - Comment object
 * @returns {string} HTML string
 */
function renderComment(comment) {
  const isOwner = currentUser && comment.user_id === currentUser.id;
  return `
    <div class="comment" data-comment-id="${comment.id}">
      <img class="comment-avatar" src="${escapeHtml(comment.profile_image || 'https://i.pravatar.cc/150?img=1')}" alt="${escapeHtml(comment.username)}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
      <div class="comment-body">
        <div class="comment-header">
          <a href="/profile.html?id=${comment.user_id}" class="comment-author">${escapeHtml(comment.username)}</a>
          <span class="comment-date">${formatDate(comment.created_at)}</span>
          ${isOwner ? `<button class="comment-delete" data-comment-id="${comment.id}">Delete</button>` : ''}
        </div>
        <div class="comment-content">${escapeHtml(comment.content)}</div>
      </div>
    </div>
  `;
}

/**
 * Load the feed from the API.
 */
async function loadFeed() {
  const container = document.getElementById('feed-container');
  if (!container) return;

  showLoading(container, 'Loading posts...');

  try {
    const response = await postsApi.getFeed(currentPage, POSTS_PER_PAGE);
    const { posts, pagination } = response.data;

    if (posts.length === 0) {
      showEmptyState(container, '📭', 'No posts yet', 'Be the first to share something with the community!');
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
 * Update pagination controls.
 * @param {Object} pagination - Pagination info
 */
function updatePagination(pagination) {
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');

  if (!prevBtn || !nextBtn || !pageInfo) return;

  prevBtn.disabled = pagination.page <= 1;
  nextBtn.disabled = pagination.page >= pagination.totalPages;
  pageInfo.textContent = `Page ${pagination.page} of ${pagination.totalPages || 1}`;
}

/**
 * Setup event listeners for post interactions.
 */
function setupPostEventListeners() {
  // Like buttons
  document.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', handleLike);
  });

  // Toggle comments
  document.querySelectorAll('.toggle-comments-btn').forEach((btn) => {
    btn.addEventListener('click', handleToggleComments);
  });

  // Comment forms
  document.querySelectorAll('.comment-form').forEach((form) => {
    form.addEventListener('submit', handleCommentSubmit);
  });

  // Delete post buttons
  document.querySelectorAll('.delete-post-btn').forEach((btn) => {
    btn.addEventListener('click', handleDeletePost);
  });

  // Edit post buttons
  document.querySelectorAll('.edit-post-btn').forEach((btn) => {
    btn.addEventListener('click', handleEditPost);
  });

  // Delete comment buttons
  document.querySelectorAll('.comment-delete').forEach((btn) => {
    btn.addEventListener('click', handleDeleteComment);
  });
}

/**
 * Handle like/unlike.
 */
async function handleLike(e) {
  const btn = e.currentTarget;
  const postId = btn.dataset.postId;
  const isLiked = btn.classList.contains('liked');

  btn.disabled = true;
  try {
    if (isLiked) {
      const response = await postsApi.unlike(postId);
      btn.classList.remove('liked');
      btn.querySelector('.icon').textContent = '🤍';
      btn.querySelector('.like-count').textContent = response.data.like_count;
    } else {
      const response = await postsApi.like(postId);
      btn.classList.add('liked');
      btn.querySelector('.icon').textContent = '❤️';
      btn.querySelector('.like-count').textContent = response.data.like_count;
    }
  } catch (err) {
    showToast(err.message || 'Failed to update like', 'error');
  } finally {
    btn.disabled = false;
  }
}

/**
 * Handle toggling comments section.
 */
async function handleToggleComments(e) {
  const btn = e.currentTarget;
  const postId = btn.dataset.postId;
  const commentsSection = document.querySelector(`.comments-section[data-post-id="${postId}"]`);

  if (!commentsSection) return;

  if (commentsSection.hidden) {
    commentsSection.hidden = false;
    await loadComments(postId);
  } else {
    commentsSection.hidden = true;
  }
}

/**
 * Load comments for a post.
 * @param {number} postId - Post ID
 */
async function loadComments(postId) {
  const commentsList = document.querySelector(`[data-comments-list="${postId}"]`);
  if (!commentsList) return;

  try {
    const response = await postsApi.getComments(postId);
    const { comments } = response.data;

    if (comments.length === 0) {
      commentsList.innerHTML = '<p class="empty-comments">No comments yet. Be the first to comment!</p>';
    } else {
      commentsList.innerHTML = comments.map(renderComment).join('');
      // Re-attach delete handlers
      commentsList.querySelectorAll('.comment-delete').forEach((btn) => {
        btn.addEventListener('click', handleDeleteComment);
      });
    }
  } catch (err) {
    commentsList.innerHTML = `<p class="empty-comments">${escapeHtml(err.message || 'Failed to load comments')}</p>`;
  }
}

/**
 * Handle comment submission.
 */
async function handleCommentSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const postId = form.dataset.commentForm;
  const input = form.querySelector('input');
  const content = input.value.trim();

  if (!content) {
    showToast('Comment cannot be empty', 'error');
    return;
  }

  const submitBtn = form.querySelector('button');
  submitBtn.disabled = true;

  try {
    const response = await postsApi.addComment(postId, content);
    input.value = '';

    // Update comment count
    const countEl = document.querySelector(`.toggle-comments-btn[data-post-id="${postId}"] .comment-count`);
    if (countEl) {
      countEl.textContent = parseInt(countEl.textContent, 10) + 1;
    }

    // Reload comments
    await loadComments(postId);
    showToast('Comment added!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to add comment', 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

/**
 * Handle post deletion.
 */
async function handleDeletePost(e) {
  const btn = e.currentTarget;
  const postId = btn.dataset.postId;

  if (!confirmAction('Are you sure you want to delete this post? This action cannot be undone.')) {
    return;
  }

  btn.disabled = true;
  try {
    await postsApi.delete(postId);
    const post = document.querySelector(`.post[data-post-id="${postId}"]`);
    if (post) post.remove();
    showToast('Post deleted successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete post', 'error');
    btn.disabled = false;
  }
}

/**
 * Handle post editing.
 */
async function handleEditPost(e) {
  const btn = e.currentTarget;
  const postId = btn.dataset.postId;
  const content = btn.dataset.content;
  const imageUrl = btn.dataset.image;

  const newContent = window.prompt('Edit your post:', content);
  if (newContent === null) return;

  const trimmed = newContent.trim();
  if (!trimmed) {
    showToast('Post content cannot be empty', 'error');
    return;
  }

  btn.disabled = true;
  try {
    const response = await postsApi.update(postId, {
      content: trimmed,
      image_url: imageUrl || undefined
    });

    // Update the post content in DOM
    const post = document.querySelector(`.post[data-post-id="${postId}"]`);
    if (post) {
      const contentEl = post.querySelector('.post-content');
      if (contentEl) contentEl.textContent = trimmed;
      btn.dataset.content = trimmed;
    }

    showToast('Post updated successfully', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to update post', 'error');
  } finally {
    btn.disabled = false;
  }
}

/**
 * Handle comment deletion.
 */
async function handleDeleteComment(e) {
  const btn = e.currentTarget;
  const commentId = btn.dataset.commentId;

  if (!confirmAction('Are you sure you want to delete this comment?')) {
    return;
  }

  btn.disabled = true;
  try {
    await commentsApi.delete(commentId);
    const comment = document.querySelector(`.comment[data-comment-id="${commentId}"]`);
    if (comment) comment.remove();

    // Update comment count
    const post = comment ? comment.closest('.post') : null;
    if (post) {
      const postId = post.dataset.postId;
      const countEl = document.querySelector(`.toggle-comments-btn[data-post-id="${postId}"] .comment-count`);
      if (countEl) {
        countEl.textContent = Math.max(0, parseInt(countEl.textContent, 10) - 1);
      }
    }

    showToast('Comment deleted', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to delete comment', 'error');
    btn.disabled = false;
  }
}

/**
 * Handle create post form submission.
 */
async function handleCreatePost() {
  const form = document.getElementById('create-post-form');
  if (!form) return;

  const contentInput = document.getElementById('content');
  const imageInput = document.getElementById('image-url');
  const charCount = document.getElementById('char-count');
  const formError = document.getElementById('form-error');
  const submitBtn = document.getElementById('submit-post-btn');

  // Character counter
  if (contentInput && charCount) {
    contentInput.addEventListener('input', () => {
      charCount.textContent = contentInput.value.length;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = contentInput.value.trim();
    const imageUrl = imageInput.value.trim();
    formError.hidden = true;

    // Clear errors
    document.getElementById('content-error').textContent = '';
    document.getElementById('image-url-error').textContent = '';

    // Validate
    let valid = true;
    if (!content) {
      document.getElementById('content-error').textContent = 'Post content is required';
      valid = false;
    }

    if (imageUrl && !/^https?:\/\/.+/.test(imageUrl)) {
      document.getElementById('image-url-error').textContent = 'Enter a valid URL';
      valid = false;
    }

    if (!valid) return;

    // Submit
    setButtonLoading(submitBtn, 'Posting...');
    try {
      await postsApi.create({
        content,
        ...(imageUrl ? { image_url: imageUrl } : {})
      });
      showToast('Post created successfully!', 'success');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 500);
    } catch (err) {
      formError.textContent = err.message;
      formError.hidden = false;
      resetButtonLoading(submitBtn);
    }
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const isCreatePostPage = document.getElementById('create-post-form');
  const isFeedPage = document.getElementById('feed-container');

  if (isCreatePostPage) {
    handleCreatePost();
  } else if (isFeedPage) {
    // Wait for auth to initialize, then load feed
    const checkAuth = setInterval(() => {
      if (isAuthenticated()) {
        clearInterval(checkAuth);
        loadFeed();

        // Setup pagination
        document.getElementById('prev-page')?.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            loadFeed();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });

        document.getElementById('next-page')?.addEventListener('click', () => {
          currentPage++;
          loadFeed();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Load current user info in sidebar
        const userInfo = document.getElementById('current-user-info');
        if (userInfo && currentUser) {
          userInfo.innerHTML = `
            <img src="${escapeHtml(currentUser.profile_image || 'https://i.pravatar.cc/150?img=1')}" alt="${escapeHtml(currentUser.username)}" onerror="this.src='https://i.pravatar.cc/150?img=1'">
            <h3>${escapeHtml(currentUser.username)}</h3>
            <p>${escapeHtml(currentUser.bio || 'No bio yet')}</p>
            <a href="/profile.html?id=${currentUser.id}" class="btn btn-outline btn-sm">View Profile</a>
          `;
        }
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => clearInterval(checkAuth), 5000);
  }
});
