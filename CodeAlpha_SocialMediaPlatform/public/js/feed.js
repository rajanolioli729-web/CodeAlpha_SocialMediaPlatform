
/**
 * SocialSphere - Feed and Post Creation
 *
 * CSP-SAFE VERSION
 *
 * Features:
 * - Load posts
 * - Like / Unlike posts
 * - View comments
 * - Add comments
 * - Pagination
 * - Create posts
 * - Image upload
 * - Image preview
 * - Safe image URLs
 *
 * Important:
 * - No inline onclick
 * - No inline onsubmit
 * - No inline onerror
 * - Uses addEventListener / event delegation
 * - Only renders same-origin or data:image images
 */

'use strict';

/* =========================================================
 * FEED STATE
 * ========================================================= */

let currentPage = 1;
let totalPages = 1;

const postsPerPage = 10;

/* =========================================================
 * DOM READY
 * ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');

    /*
     * =====================================================
     * FEED EVENT DELEGATION
     * =====================================================
     */

    if (feedContainer) {
        /*
         * Handle Like and Comment buttons.
         */
        feedContainer.addEventListener('click', async (event) => {
            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            /*
             * LIKE BUTTON
             */
            const likeButton = target.closest('.like-button');

            if (likeButton) {
                const postId = Number(likeButton.dataset.postId);

                if (!Number.isInteger(postId) || postId <= 0) {
                    console.error(
                        'Invalid post ID for like button:',
                        likeButton.dataset.postId
                    );
                    return;
                }

                await handleLike(postId);
                return;
            }

            /*
             * COMMENT BUTTON
             */
            const commentButton = target.closest('.comment-button');

            if (commentButton) {
                const postId = Number(commentButton.dataset.postId);

                if (!Number.isInteger(postId) || postId <= 0) {
                    console.error(
                        'Invalid post ID for comment button:',
                        commentButton.dataset.postId
                    );
                    return;
                }

                await showComments(postId);
            }
        });

        /*
         * Handle dynamically-created comment forms.
         */
        feedContainer.addEventListener('submit', async (event) => {
            const target = event.target;

            if (!(target instanceof HTMLFormElement)) {
                return;
            }

            if (!target.matches('.comment-form')) {
                return;
            }

            event.preventDefault();

            const postId = Number(target.dataset.postId);

            if (!Number.isInteger(postId) || postId <= 0) {
                console.error(
                    'Invalid post ID for comment form:',
                    target.dataset.postId
                );
                return;
            }

            await submitComment(event, postId);
        });

        /*
         * Handle image errors without inline onerror.
         *
         * Error events do not bubble normally,
         * so capture mode is enabled.
         */
        feedContainer.addEventListener(
            'error',
            (event) => {
                const image = event.target;

                if (
                    image instanceof HTMLImageElement
                ) {
                    image.style.display = 'none';
                }
            },
            true
        );

        /*
         * Load initial feed.
         */
        loadFeed(1);
    }

    /*
     * =====================================================
     * CREATE POST
     * =====================================================
     */

    const createPostForm =
        document.getElementById('create-post-form');

    if (createPostForm instanceof HTMLFormElement) {
        setupCreatePostForm(createPostForm);
    }

    /*
     * =====================================================
     * PAGINATION
     * =====================================================
     */

    const prevButton =
        document.getElementById('prev-page');

    const nextButton =
        document.getElementById('next-page');

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

/* =========================================================
 * SAFE IMAGE URL
 * ========================================================= */

/**
 * Allows:
 * - data:image/...
 * - /uploads/image.jpg
 * - uploads/image.jpg
 * - same-origin absolute URLs
 *
 * Blocks:
 * - external http/https URLs
 * - javascript:
 * - protocol-relative external URLs
 */
function getSafeImageUrl(value) {
    if (!value) {
        return '';
    }

    const imageUrl = String(value).trim();

    if (!imageUrl) {
        return '';
    }

    /*
     * Allow data:image URLs.
     */
    if (imageUrl.startsWith('data:image/')) {
        return imageUrl;
    }

    /*
     * Block protocol-relative external URLs.
     */
    if (imageUrl.startsWith('//')) {
        console.warn(
            'Blocked external image URL:',
            imageUrl
        );

        return '';
    }

    /*
     * Allow root-relative URLs.
     */
    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    /*
     * Allow relative URLs such as:
     * uploads/image.jpg
     */
    if (
        !imageUrl.includes('://') &&
        !imageUrl.startsWith('javascript:')
    ) {
        return imageUrl;
    }

    /*
     * Handle absolute URLs.
     */
    try {
        const url = new URL(
            imageUrl,
            window.location.origin
        );

        if (
            url.origin ===
            window.location.origin
        ) {
            return (
                url.pathname +
                url.search +
                url.hash
            );
        }
    } catch (error) {
        console.warn(
            'Invalid image URL:',
            imageUrl
        );
    }

    /*
     * External image blocked.
     */
    console.warn(
        'Blocked external image URL by CSP:',
        imageUrl
    );

    return '';
}

/* =========================================================
 * LOAD FEED
 * ========================================================= */

async function loadFeed(page = 1) {
    const feedContainer =
        document.getElementById('feed-container');

    const loading =
        document.getElementById('feed-loading');

    if (!feedContainer) {
        return;
    }

    try {
        /*
         * Show loading indicator.
         */
        if (loading) {
            loading.style.display = 'block';
        }

        /*
         * Get posts from API.
         */
        const response =
            await postsApi.getFeed(
                page,
                postsPerPage
            );

        console.log(
            'Feed response:',
            response
        );

        /*
         * Validate response.
         */
        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response &&
                response.message
                    ? response.message
                    : 'Failed to load posts.'
            );
        }

        const data =
            response.data || {};

        const posts =
            Array.isArray(data.posts)
                ? data.posts
                : [];

        const pagination =
            data.pagination || {};

        currentPage =
            Number(
                pagination.page || page
            );

        totalPages =
            Number(
                pagination.totalPages || 1
            );

        /*
         * Make sure pagination values are valid.
         */
        if (
            !Number.isInteger(currentPage) ||
            currentPage < 1
        ) {
            currentPage = 1;
        }

        if (
            !Number.isInteger(totalPages) ||
            totalPages < 1
        ) {
            totalPages = 1;
        }

        /*
         * Render posts.
         */
        renderPosts(posts);

        /*
         * Update pagination.
         */
        updatePagination();
    } catch (error) {
        console.error(
            'Load feed error:',
            error
        );

        feedContainer.innerHTML = `
            <div class="card">
                <div class="error-message">
                    Failed to load posts:
                    ${escapeHtml(
                        error && error.message
                            ? error.message
                            : 'Unknown error'
                    )}
                </div>
            </div>
        `;
    } finally {
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

/* =========================================================
 * RENDER POSTS
 * ========================================================= */

function renderPosts(posts) {
    const feedContainer =
        document.getElementById('feed-container');

    if (!feedContainer) {
        return;
    }

    /*
     * No posts.
     */
    if (!Array.isArray(posts) || posts.length === 0) {
        feedContainer.innerHTML = `
            <div class="card">
                <p>No posts found.</p>
            </div>
        `;

        return;
    }

    /*
     * Build post HTML.
     */
    feedContainer.innerHTML =
        posts.map((post) => {
            const postId =
                Number(post.id);

            const safePostId =
                Number.isInteger(postId) &&
                postId > 0
                    ? String(postId)
                    : '';

            const username =
                post.author_username ||
                'Unknown user';

            /*
             * PROFILE IMAGE
             */
            const profileImage =
                getSafeImageUrl(
                    post.author_profile_image
                );

            /*
             * Local SVG fallback.
             */
            const safeProfileImage =
                profileImage ||
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23dddddd"/%3E%3Ccircle cx="25" cy="20" r="10" fill="%23999999"/%3E%3Cpath d="M8 45c3-10 11-15 17-15s14 5 17 15" fill="%23999999"/%3E%3C/svg%3E';

            /*
             * Detect whether current user has liked.
             */
            const isLiked =
                post.liked === true ||
                post.is_liked === true ||
                post.user_liked === true;

            /*
             * Like count.
             */
            const likeCount =
                Number(post.like_count || 0);

            /*
             * Comment count.
             */
            const commentCount =
                Number(post.comment_count || 0);

            /*
             * POST IMAGE
             */
            let imageHtml = '';

            const safePostImage =
                getSafeImageUrl(
                    post.image_url
                );

            if (safePostImage) {
                imageHtml = `
                    <img
                        src="${escapeHtml(safePostImage)}"
                        alt="Post image"
                        class="post-image"
                    >
                `;
            }

            /*
             * AUTHOR ID
             */
            const authorId =
                post.author_id !== undefined &&
                post.author_id !== null
                    ? String(post.author_id)
                    : '';

            /*
             * Return complete post.
             */
            return `
                <article
                    class="card post-card"
                    id="post-${escapeHtml(safePostId)}"
                >

                    <div class="post-header">

                        <img
                            src="${escapeHtml(safeProfileImage)}"
                            alt="${escapeHtml(username)}"
                            class="avatar"
                        >

                        <div class="post-author">

                            <a
                                href="profile.html?id=${encodeURIComponent(authorId)}"
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
                        ${escapeHtml(
                            post.content || ''
                        )}
                    </div>

                    ${imageHtml}

                    <div class="post-actions">

                        <button
                            type="button"
                            class="btn btn-outline btn-sm like-button"
                            id="like-button-${escapeHtml(safePostId)}"
                            data-post-id="${escapeHtml(safePostId)}"
                            data-liked="${isLiked ? 'true' : 'false'}"
                            aria-label="${isLiked ? 'Unlike post' : 'Like post'}"
                        >
                            ${isLiked ? 'Unlike' : 'Like'}
                            ${likeCount}
                        </button>

                        <button
                            type="button"
                            class="btn btn-outline btn-sm comment-button"
                            data-post-id="${escapeHtml(safePostId)}"
                            aria-label="View comments"
                        >
                            Comments
                            ${commentCount}
                        </button>

                    </div>

                    <div
                        id="comments-${escapeHtml(safePostId)}"
                        class="comments-section"
                        style="display: none;"
                    ></div>

                </article>
            `;
        })
        .join('');
}

/* =========================================================
 * LIKE / UNLIKE
 * ========================================================= */

async function handleLike(postId) {
    const button =
        document.getElementById(
            `like-button-${postId}`
        );

    if (!button) {
        console.error(
            'Like button not found:',
            postId
        );

        return;
    }

    /*
     * Prevent double-click requests.
     */
    if (button.disabled) {
        return;
    }

    try {
        button.disabled = true;

        /*
         * Read current state.
         */
        const isLiked =
            button.dataset.liked === 'true';

        let response;

        /*
         * Unlike if already liked.
         */
        if (isLiked) {
            response =
                await postsApi.unlike(
                    postId
                );
        }

        /*
         * Otherwise like.
         */
        else {
            response =
                await postsApi.like(
                    postId
                );
        }

        console.log(
            'Like response:',
            response
        );

        /*
         * Validate response.
         */
        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response &&
                response.message
                    ? response.message
                    : 'Unable to update like.'
            );
        }

        const data =
            response.data || {};

        /*
         * New like state.
         */
        const liked =
            data.liked === true;

        /*
         * New like count.
         */
        const likeCount =
            Number(
                data.like_count || 0
            );

        /*
         * Update button state.
         */
        button.dataset.liked =
            liked
                ? 'true'
                : 'false';

        /*
         * Update button text.
         */
        button.textContent =
            `${liked ? 'Unlike' : 'Like'} ${likeCount}`;

        /*
         * Update accessibility label.
         */
        button.setAttribute(
            'aria-label',
            liked
                ? 'Unlike post'
                : 'Like post'
        );
    } catch (error) {
        console.error(
            'Like error:',
            error
        );

        showToast(
            error && error.message
                ? error.message
                : 'Unable to update like.',
            'error'
        );
    } finally {
        button.disabled = false;
    }
}

/* =========================================================
 * SHOW COMMENTS
 * ========================================================= */

async function showComments(postId) {
    const container =
        document.getElementById(
            `comments-${postId}`
        );

    if (!container) {
        console.error(
            'Comments container not found:',
            postId
        );

        return;
    }

    /*
     * Toggle comments.
     */
    if (
        container.style.display ===
        'block'
    ) {
        container.style.display = 'none';
        return;
    }

    /*
     * Show comments section.
     */
    container.style.display = 'block';

    /*
     * Loading message.
     */
    container.innerHTML = `
        <div class="card">
            <p>Loading comments...</p>
        </div>
    `;

    try {
        /*
         * Get comments.
         */
        const response =
            await postsApi.getComments(
                postId
            );

        console.log(
            'Comments response:',
            response
        );

        /*
         * Validate response.
         */
        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response &&
                response.message
                    ? response.message
                    : 'Failed to load comments.'
            );
        }

        const data =
            response.data || {};

        const comments =
            Array.isArray(data.comments)
                ? data.comments
                : [];

        /*
         * Render comments.
         */
        renderComments(
            postId,
            comments
        );
    } catch (error) {
        console.error(
            'Load comments error:',
            error
        );

        container.innerHTML = `
            <div class="card">
                <div class="error-message">
                    ${escapeHtml(
                        error && error.message
                            ? error.message
                            : 'Failed to load comments.'
                    )}
                </div>
            </div>
        `;
    }
}

/* =========================================================
 * RENDER COMMENTS
 * ========================================================= */

function renderComments(postId, comments) {
    const container =
        document.getElementById(
            `comments-${postId}`
        );

    if (!container) {
        return;
    }

    let commentsHtml = '';

    /*
     * No comments.
     */
    if (
        !Array.isArray(comments) ||
        comments.length === 0
    ) {
        commentsHtml = `
            <p class="no-comments">
                No comments yet.
            </p>
        `;
    }

    /*
     * Render comments.
     */
    else {
        commentsHtml =
            comments
                .map((comment) => {
                    const username =
                        comment.username ||
                        'Unknown user';

                    /*
                     * Get safe profile image.
                     */
                    const commentProfileImage =
                        getSafeImageUrl(
                            comment.profile_image
                        );

                    /*
                     * Local SVG fallback.
                     */
                    const safeCommentProfileImage =
                        commentProfileImage ||
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23dddddd"/%3E%3Ccircle cx="20" cy="16" r="8" fill="%23999999"/%3E%3Cpath d="M6 36c3-8 9-12 14-12s11 4 14 12" fill="%23999999"/%3E%3C/svg%3E';

                    return `
                        <div class="comment">

                            <img
                                src="${escapeHtml(safeCommentProfileImage)}"
                                alt="${escapeHtml(username)}"
                                class="avatar"
                            >

                            <div class="comment-content">

                                <strong>
                                    ${escapeHtml(username)}
                                </strong>

                                <p>
                                    ${escapeHtml(
                                        comment.content || ''
                                    )}
                                </p>

                                <small>
                                    ${formatDate(
                                        comment.created_at
                                    )}
                                </small>

                            </div>

                        </div>
                    `;
                })
                .join('');
    }

    /*
     * Comment form.
     */
    container.innerHTML = `
        <div class="comments-list">
            ${commentsHtml}
        </div>

        <form
            class="comment-form"
            data-post-id="${escapeHtml(postId)}"
        >

            <input
                type="text"
                id="comment-input-${escapeHtml(postId)}"
                placeholder="Write a comment..."
                maxlength="1000"
                autocomplete="off"
                required
            >

            <button
                type="submit"
                class="btn btn-primary btn-sm"
            >
                Comment
            </button>

        </form>
    `;
}

/* =========================================================
 * SUBMIT COMMENT
 * ========================================================= */

async function submitComment(event, postId) {
    event.preventDefault();

    const form =
        event.target instanceof HTMLFormElement
            ? event.target
            : document.querySelector(
                `.comment-form[data-post-id="${postId}"]`
            );

    if (!form) {
        console.error(
            'Comment form not found:',
            postId
        );

        return;
    }

    const input =
        form.querySelector(
            `#comment-input-${postId}`
        );

    if (!(input instanceof HTMLInputElement)) {
        console.error(
            'Comment input not found:',
            postId
        );

        return;
    }

    /*
     * Get comment text.
     */
    const content =
        input.value.trim();

    if (!content) {
        showToast(
            'Please write a comment.',
            'error'
        );

        return;
    }

    /*
     * Maximum length.
     */
    if (content.length > 1000) {
        showToast(
            'Comment must be 1000 characters or less.',
            'error'
        );

        return;
    }

    /*
     * Get submit button.
     */
    const button =
        form.querySelector(
            'button[type="submit"]'
        );

    try {
        /*
         * Disable input.
         */
        input.disabled = true;

        if (button instanceof HTMLButtonElement) {
            button.disabled = true;
            button.textContent = 'Posting...';
        }

        /*
         * Send comment to API.
         */
        const response =
            await postsApi.addComment(
                postId,
                content
            );

        console.log(
            'Add comment response:',
            response
        );

        /*
         * Validate response.
         */
        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response &&
                response.message
                    ? response.message
                    : 'Failed to add comment.'
            );
        }

        /*
         * Reload feed first so comment count
         * is updated.
         */
        await loadFeed(currentPage);

        /*
         * Re-open comments section.
         */
        const refreshedContainer =
            document.getElementById(
                `comments-${postId}`
            );

        if (refreshedContainer) {
            refreshedContainer.style.display =
                'block';

            refreshedContainer.innerHTML = `
                <div class="card">
                    <p>Loading comments...</p>
                </div>
            `;

            /*
             * Reload comments.
             */
            const commentsResponse =
                await postsApi.getComments(
                    postId
                );

            if (
                commentsResponse &&
                commentsResponse.success === true
            ) {
                const commentsData =
                    commentsResponse.data || {};

                renderComments(
                    postId,
                    Array.isArray(
                        commentsData.comments
                    )
                        ? commentsData.comments
                        : []
                );
            } else {
                renderComments(
                    postId,
                    []
                );
            }
        }

        /*
         * Success message.
         */
        showToast(
            'Comment added successfully.',
            'success'
        );
    } catch (error) {
        console.error(
            'Add comment error:',
            error
        );

        showToast(
            error && error.message
                ? error.message
                : 'Failed to add comment.',
            'error'
        );
    } finally {
        /*
         * Re-enable input.
         */
        input.disabled = false;

        if (button instanceof HTMLButtonElement) {
            button.disabled = false;
            button.textContent = 'Comment';
        }
    }
}

/* =========================================================
 * PAGINATION
 * ========================================================= */

function updatePagination() {
    const pageInfo =
        document.getElementById('page-info');

    const prevButton =
        document.getElementById('prev-page');

    const nextButton =
        document.getElementById('next-page');

    if (pageInfo) {
        pageInfo.textContent =
            `Page ${currentPage} of ${totalPages}`;
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

/* =========================================================
 * CREATE POST FORM
 * ========================================================= */

function setupCreatePostForm(form) {
    const contentInput =
        document.getElementById('content');

    const imageInput =
        document.getElementById('image');

    const imageUrlInput =
        document.getElementById('image-url');

    const previewContainer =
        document.getElementById(
            'image-preview-container'
        );

    const preview =
        document.getElementById('image-preview');

    const removeImageButton =
        document.getElementById(
            'remove-image-btn'
        );

    const submitButton =
        document.getElementById(
            'submit-post-btn'
        );

    const imageError =
        document.getElementById(
            'image-error'
        );

    const contentError =
        document.getElementById(
            'content-error'
        );

    const formError =
        document.getElementById(
            'form-error'
        );

    const charCount =
        document.getElementById(
            'char-count'
        );

    /*
     * Clear validation errors.
     */
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

    /*
     * Character counter.
     */
    function updateCharacterCount() {
        if (
            contentInput instanceof HTMLTextAreaElement &&
            charCount
        ) {
            charCount.textContent =
                String(contentInput.value.length);
        }
    }

    /*
     * Remove selected image.
     */
    function removeImage() {
        if (
            imageInput instanceof HTMLInputElement
        ) {
            imageInput.value = '';
        }

        if (
            preview instanceof HTMLImageElement
        ) {
            preview.removeAttribute('src');
        }

        if (previewContainer) {
            previewContainer.hidden = true;
        }
    }

    /*
     * Show selected image preview.
     */
    function showPreview(file) {
        if (
            !(preview instanceof HTMLImageElement) ||
            !previewContainer
        ) {
            return;
        }

        const reader =
            new FileReader();

        reader.addEventListener(
            'load',
            (event) => {
                const result =
                    event.target &&
                    event.target.result;

                if (
                    typeof result !== 'string'
                ) {
                    return;
                }

                /*
                 * FileReader data URLs are allowed
                 * by the current CSP.
                 */
                preview.src = result;

                previewContainer.hidden = false;
            }
        );

        reader.addEventListener(
            'error',
            () => {
                if (imageError) {
                    imageError.textContent =
                        'Unable to preview this image.';
                }

                removeImage();
            }
        );

        reader.readAsDataURL(file);
    }

    /*
     * Character input listener.
     */
    if (
        contentInput instanceof HTMLTextAreaElement
    ) {
        contentInput.addEventListener(
            'input',
            updateCharacterCount
        );

        updateCharacterCount();
    }

    /*
     * Image input listener.
     */
    if (
        imageInput instanceof HTMLInputElement
    ) {
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

                /*
                 * Allowed image types.
                 */
                const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/gif',
                    'image/webp'
                ];

                if (
                    !allowedTypes.includes(
                        file.type
                    )
                ) {
                    if (imageError) {
                        imageError.textContent =
                            'Only JPG, PNG, GIF, and WEBP images are allowed.';
                    }

                    removeImage();
                    return;
                }

                /*
                 * Maximum file size: 5 MB.
                 */
                if (
                    file.size >
                    5 * 1024 * 1024
                ) {
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

    /*
     * Remove image button.
     */
    if (removeImageButton) {
        removeImageButton.addEventListener(
            'click',
            (event) => {
                event.preventDefault();
                removeImage();
            }
        );
    }

    /*
     * =====================================================
     * CREATE POST SUBMIT
     * =====================================================
     */

    form.addEventListener(
        'submit',
        async (event) => {
            event.preventDefault();

            clearErrors();

            /*
             * Get post content.
             */
            const content =
                contentInput instanceof HTMLTextAreaElement
                    ? contentInput.value.trim()
                    : '';

            /*
             * Get image file.
             */
            const imageFile =
                imageInput instanceof HTMLInputElement &&
                imageInput.files
                    ? imageInput.files[0]
                    : null;

            /*
             * Get image URL.
             */
            const imageUrl =
                imageUrlInput instanceof HTMLInputElement
                    ? imageUrlInput.value.trim()
                    : '';

            /*
             * Validate content.
             */
            if (!content) {
                if (contentError) {
                    contentError.textContent =
                        'Post content is required.';
                }

                return;
            }

            /*
             * Validate content length.
             */
            if (content.length > 5000) {
                if (contentError) {
                    contentError.textContent =
                        'Post content must be 5000 characters or less.';
                }

                return;
            }

            /*
             * Validate image URL.
             */
            let safeImageUrl = '';

            if (imageUrl) {
                safeImageUrl =
                    getSafeImageUrl(
                        imageUrl
                    );

                if (!safeImageUrl) {
                    if (imageError) {
                        imageError.textContent =
                            'External image URLs are not allowed. Upload an image file or use a same-origin image URL.';
                    }

                    return;
                }
            }

            /*
             * Disable submit button.
             */
            if (
                submitButton instanceof HTMLButtonElement
            ) {
                submitButton.disabled = true;
                submitButton.textContent =
                    'Creating post...';
            }

            try {
                let response;

                /*
                 * FILE UPLOAD
                 */
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

                    /*
                     * Add image URL only if supplied
                     * and CSP-safe.
                     */
                    if (safeImageUrl) {
                        formData.append(
                            'image_url',
                            safeImageUrl
                        );
                    }

                    response =
                        await postsApi.create(
                            formData
                        );
                }

                /*
                 * NORMAL JSON POST
                 */
                else {
                    const postData = {
                        content: content
                    };

                    if (safeImageUrl) {
                        postData.image_url =
                            safeImageUrl;
                    }

                    response =
                        await postsApi.create(
                            postData
                        );
                }

                /*
                 * Validate response.
                 */
                if (
                    !response ||
                    response.success !== true
                ) {
                    throw new Error(
                        response &&
                        response.message
                            ? response.message
                            : 'Failed to create post.'
                    );
                }

                /*
                 * Return to homepage.
                 */
                window.location.href =
                    '/index.html';
            } catch (error) {
                console.error(
                    'Create post error:',
                    error
                );

                if (formError) {
                    formError.textContent =
                        error && error.message
                            ? error.message
                            : 'Failed to create post.';
                }
            } finally {
                if (
                    submitButton instanceof HTMLButtonElement
                ) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        'Create Post';
                }
            }
        }
    );
}

/* =========================================================
 * TOAST
 * ========================================================= */

function showToast(
    message,
    type = 'error'
) {
    const container =
        document.getElementById(
            'toast-container'
        );

    /*
     * If toast container does not exist,
     * use browser alert.
     */
    if (!container) {
        window.alert(message);
        return;
    }

    const toast =
        document.createElement('div');

    toast.className =
        `toast ${type}`;

    toast.textContent =
        String(message);

    container.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 3000);
}

/* =========================================================
 * ESCAPE HTML
 * ========================================================= */

function escapeHtml(value) {
    return String(value ?? '')
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );
}

/* =========================================================
 * FORMAT DATE
 * ========================================================= */

function formatDate(dateString) {
    if (!dateString) {
        return '';
    }

    const normalized =
        String(dateString)
            .replace(' ', 'T');

    const date =
        new Date(normalized);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(dateString);
    }

    return date.toLocaleString();
}

