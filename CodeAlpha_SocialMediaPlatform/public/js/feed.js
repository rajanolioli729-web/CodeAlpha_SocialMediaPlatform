/**
 * SocialSphere - Feed and Post Creation
 */

document.addEventListener('DOMContentLoaded', () => {
  const feedContainer = document.getElementById('feed-container');

  if (feedContainer) {
    loadFeed(1);
  }

  const createPostForm = document.getElementById('create-post-form');

  if (createPostForm) {
    setupCreatePostForm(createPostForm);
  }

  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        loadFeed(currentPage - 1);
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        loadFeed(currentPage + 1);
      }
    });
  }
});


let currentPage = 1;
let totalPages = 1;
const postsPerPage = 10;


/**
 * Load posts from API
 */
async function loadFeed(page = 1) {
  const feedContainer = document.getElementById('feed-container');
  const loading = document.getElementById('feed-loading');

  if (!feedContainer) {
    return;
  }

  try {
    if (loading) {
      loading.style.display = 'block';
    }

    const response = await postsApi.getFeed(page, postsPerPage);

    console.log('Feed response:', response);

    if (!response || !response.success) {
      throw new Error(
        response && response.message
          ? response.message
          : 'Failed to load posts.'
      );
    }

    const data = response.data || {};
    const posts = data.posts || [];
    const pagination = data.pagination || {};

    currentPage = pagination.page || page;
    totalPages = pagination.totalPages || 1;

    renderPosts(posts);
    updatePagination();

  } catch (error) {
    console.error('Load feed error:', error);

    feedContainer.innerHTML = `
      <div class="card">
        <div class="error-message">
          Failed to load posts: ${escapeHtml(error.message)}
        </div>
      </div>
    `;

  } finally {
    if (loading) {
      loading.style.display = 'none';
    }
  }
}


/**
 * Render posts
 */
function renderPosts(posts) {
  const feedContainer = document.getElementById('feed-container');

  if (!feedContainer) {
    return;
  }

  if (!posts.length) {
    feedContainer.innerHTML = `
      <div class="card">
        <p>No posts found.</p>
      </div>
    `;
    return;
  }

  feedContainer.innerHTML = posts.map(post => {
    const username = post.author_username || 'Unknown user';

    const profileImage =
      post.author_profile_image ||
      'https://via.placeholder.com/50';

    let imageHtml = '';

    if (post.image_url) {
      imageHtml = `
        <img
          src="${escapeHtml(post.image_url)}"
          alt="Post image"
          class="post-image"
          onerror="this.style.display='none'"
        >
      `;
    }

    return `
      <article class="card post-card">

        <div class="post-header">

          <img
            src="${escapeHtml(profileImage)}"
            alt="${escapeHtml(username)}"
            class="avatar"
            onerror="this.src='https://via.placeholder.com/50'"
          >

          <div class="post-author">

            <a
              href="profile.html?id=${post.author_id}"
              class="post-author-name"
            >
              ${escapeHtml(username)}
            </a>

            <div class="post-date">
              ${formatDate(post.created_at)}
            </div>

          </div>

        </div>

        <div class="post-content">
          ${escapeHtml(post.content || '')}
        </div>

        ${imageHtml}

        <div class="post-actions">

          <button
            type="button"
            class="btn btn-outline btn-sm"
            onclick="handleLike(${post.id})"
          >
            ❤️ ${post.like_count || 0}
          </button>

          <button
            type="button"
            class="btn btn-outline btn-sm"
            onclick="showComments(${post.id})"
          >
            💬 ${post.comment_count || 0}
          </button>

        </div>

      </article>
    `;
  }).join('');
}


/**
 * Update pagination controls
 */
function updatePagination() {
  const pageInfo = document.getElementById('page-info');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  if (pageInfo) {
    pageInfo.textContent =
      'Page ' + currentPage;
  }

  if (prevButton) {
    prevButton.disabled =
      currentPage <= 1;
  }

  if (nextButton) {
    nextButton.disabled =
      currentPage >= totalPages;
  }
}


/**
 * Create post form
 */
function setupCreatePostForm(form) {
  const contentInput =
    document.getElementById('content');

  const imageInput =
    document.getElementById('image');

  const imageUrlInput =
    document.getElementById('image-url');

  const previewContainer =
    document.getElementById('image-preview-container');

  const preview =
    document.getElementById('image-preview');

  const removeImageButton =
    document.getElementById('remove-image-btn');

  const submitButton =
    document.getElementById('submit-post-btn');

  const imageError =
    document.getElementById('image-error');

  const contentError =
    document.getElementById('content-error');

  const formError =
    document.getElementById('form-error');

  const charCount =
    document.getElementById('char-count');


  function clearErrors() {
    if (imageError) {
      imageError.textContent = '';
    }

    if (contentError) {
      contentError.textContent = '';
    }

    if (formError) {
      formError.textContent = '';
    }
  }


  function updateCharacterCount() {
    if (contentInput && charCount) {
      charCount.textContent =
        contentInput.value.length;
    }
  }


  function removeImage() {
    if (imageInput) {
      imageInput.value = '';
    }

    if (preview) {
      preview.src = '';
    }

    if (previewContainer) {
      previewContainer.hidden = true;
    }
  }


  function showPreview(file) {
    if (!preview || !previewContainer) {
      return;
    }

    const reader = new FileReader();

    reader.onload = event => {
      preview.src = event.target.result;
      previewContainer.hidden = false;
    };

    reader.readAsDataURL(file);
  }


  if (contentInput) {
    contentInput.addEventListener(
      'input',
      updateCharacterCount
    );

    updateCharacterCount();
  }


  if (imageInput) {
    imageInput.addEventListener(
      'change',
      () => {
        clearErrors();

        const file =
          imageInput.files &&
          imageInput.files[0];

        if (!file) {
          removeImage();
          return;
        }

        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ];

        if (!allowedTypes.includes(file.type)) {
          if (imageError) {
            imageError.textContent =
              'Only JPG, PNG, GIF, and WEBP images are allowed.';
          }

          removeImage();
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          if (imageError) {
            imageError.textContent =
              'Image must be smaller than 5 MB.';
          }

          removeImage();
          return;
        }

        showPreview(file);
      }
    );
  }


  if (removeImageButton) {
    removeImageButton.addEventListener(
      'click',
      removeImage
    );
  }


  form.addEventListener(
    'submit',
    async event => {
      event.preventDefault();

      clearErrors();

      const content =
        contentInput
          ? contentInput.value.trim()
          : '';

      const imageFile =
        imageInput &&
        imageInput.files
          ? imageInput.files[0]
          : null;

      const imageUrl =
        imageUrlInput
          ? imageUrlInput.value.trim()
          : '';


      if (!content) {
        if (contentError) {
          contentError.textContent =
            'Post content is required.';
        }

        return;
      }


      if (content.length > 5000) {
        if (contentError) {
          contentError.textContent =
            'Post content must be 5000 characters or less.';
        }

        return;
      }


      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent =
          'Creating post...';
      }


      try {
        let response;

        if (imageFile) {
          const formData =
            new FormData();

          formData.append(
            'content',
            content
          );

          formData.append(
            'image',
            imageFile
          );

          if (imageUrl) {
            formData.append(
              'image_url',
              imageUrl
            );
          }

          response =
            await postsApi.create(
              formData
            );

        } else {
          response =
            await postsApi.create({
              content,
              ...(imageUrl
                ? { image_url: imageUrl }
                : {})
            });
        }


        if (
          response &&
          response.success === false
        ) {
          throw new Error(
            response.message ||
            'Failed to create post.'
          );
        }


        window.location.href =
          '/index.html';

      } catch (error) {
        console.error(
          'Create post error:',
          error
        );

        if (formError) {
          formError.textContent =
            error.message ||
            'Failed to create post.';
        }

      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent =
            'Create Post';
        }
      }
    }
  );
}


/**
 * Escape HTML
 */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) {
    return '';
  }

  const date =
    new Date(
      String(dateString).replace(' ', 'T')
    );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString();
}


/**
 * Temporary like handler
 */
function handleLike(postId) {
  console.log(
    'Like clicked:',
    postId
  );
}


/**
 * Temporary comments handler
 */
function showComments(postId) {
  console.log(
    'Comments clicked:',
    postId
  );
}
