# SocialSphere - Social Media Platform

A full-stack social media platform built for the **CodeAlpha Full Stack Development Internship - Task 2**.

## 📋 Project Description

SocialSphere is a complete social media application with user profiles, posts, comments, likes, and follow/unfollow functionality.

The application features:

* Modern and responsive user interface
* Secure authentication using JWT and HTTP-only cookies
* Password hashing with bcrypt
* MySQL database with parameterized queries
* Local image upload functionality
* User profiles with profile pictures
* Posts with locally uploaded images
* Comments, likes, and follow/unfollow functionality

## ✨ Features

### 🔐 User Authentication

* Register with username, email, and password
* Login with email and password
* Logout functionality
* JWT-based authentication stored in HTTP-only cookies
* Password hashing with bcrypt
* Protected API routes

### 👤 User Profiles

* View user profiles
* Upload and update profile picture locally
* Edit username and bio
* View follower/following counts
* View user's posts

### 📝 Posts

* Create posts with text
* Upload images directly from the device
* Store uploaded images locally on the server
* View feed with pagination
* Edit own posts
* Delete own posts
* Like/unlike posts
* Comment on posts

### 🖼️ Local Image Upload

Images are uploaded directly from the user's device instead of requiring an external image URL.

The application uses **Multer** to handle multipart/form-data file uploads.

Uploaded files are stored locally in:

```text
uploads/
├── profiles/
└── posts/
```

Supported image formats:

* JPG / JPEG
* PNG
* GIF
* WEBP

Basic upload validation is applied to prevent unsupported file types and excessively large files.

### 💬 Comments

* View comments on posts
* Add comments
* Delete own comments
* Prevent unauthorized comment deletion

### ❤️ Likes

* Like posts
* Unlike posts
* Prevent duplicate likes
* Display like counts

### 👥 Follow System

* Follow users
* Unfollow users
* View followers
* View following users
* Prevent self-following
* Prevent duplicate follows

### 🛡️ Security

* Helmet for security headers
* Rate limiting
* CORS configuration
* Input validation with express-validator
* Parameterized SQL queries
* Centralized error handling
* Password hashing with bcrypt
* HTTP-only authentication cookies
* File upload validation

---

## 🛠️ Technology Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript
* Fetch API
* Responsive design
* FormData API for image uploads

### Backend

* Node.js
* Express.js
* Multer for local file uploads

### Database

* MySQL
* mysql2 connection pool

### Security

* bcryptjs
* jsonwebtoken
* HTTP-only cookies
* Helmet
* CORS
* express-rate-limit
* express-validator

---

## 📁 Project Architecture

```text
CodeAlpha_SocialMediaPlatform/
│
├── public/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── create-post.html
│   │
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   └── profile.css
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── feed.js
│       ├── profile.js
│       └── utils.js
│
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   └── follow.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   └── follow.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   └── post.service.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│   ├── profiles/
│   └── posts/
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

> **Note:** The `uploads/` directory is used for locally stored user images. Add it to `.gitignore` if uploaded files should not be committed to GitHub.

---

## 🗄️ Database Schema

### users

| Column        | Type                        | Description                 |
| ------------- | --------------------------- | --------------------------- |
| id            | INT UNSIGNED AUTO_INCREMENT | Primary key                 |
| username      | VARCHAR(50) UNIQUE          | User's username             |
| email         | VARCHAR(255) UNIQUE         | User's email                |
| password_hash | VARCHAR(255)                | bcrypt-hashed password      |
| bio           | TEXT                        | User's bio                  |
| profile_image | VARCHAR(500)                | Local path of profile image |
| created_at    | TIMESTAMP                   | Creation timestamp          |
| updated_at    | TIMESTAMP                   | Last update timestamp       |

### posts

| Column     | Type                        | Description                  |
| ---------- | --------------------------- | ---------------------------- |
| id         | INT UNSIGNED AUTO_INCREMENT | Primary key                  |
| user_id    | INT UNSIGNED                | Foreign key to users         |
| content    | TEXT                        | Post content                 |
| image_path | VARCHAR(500)                | Local path of uploaded image |
| created_at | TIMESTAMP                   | Creation timestamp           |
| updated_at | TIMESTAMP                   | Last update timestamp        |

### comments

| Column     | Type                        | Description          |
| ---------- | --------------------------- | -------------------- |
| id         | INT UNSIGNED AUTO_INCREMENT | Primary key          |
| post_id    | INT UNSIGNED                | Foreign key to posts |
| user_id    | INT UNSIGNED                | Foreign key to users |
| content    | TEXT                        | Comment content      |
| created_at | TIMESTAMP                   | Creation timestamp   |

### likes

| Column     | Type                        | Description          |
| ---------- | --------------------------- | -------------------- |
| id         | INT UNSIGNED AUTO_INCREMENT | Primary key          |
| post_id    | INT UNSIGNED                | Foreign key to posts |
| user_id    | INT UNSIGNED                | Foreign key to users |
| created_at | TIMESTAMP                   | Creation timestamp   |

Unique constraint on `(post_id, user_id)` prevents duplicate likes.

### followers

| Column       | Type                        | Description          |
| ------------ | --------------------------- | -------------------- |
| id           | INT UNSIGNED AUTO_INCREMENT | Primary key          |
| follower_id  | INT UNSIGNED                | Foreign key to users |
| following_id | INT UNSIGNED                | Foreign key to users |
| created_at   | TIMESTAMP                   | Creation timestamp   |

Unique constraint on `(follower_id, following_id)` prevents duplicate follows.

A check constraint prevents users from following themselves.

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | `/api/auth/register` | Register a new user            |
| POST   | `/api/auth/login`    | Login and get JWT cookie       |
| POST   | `/api/auth/logout`   | Logout and clear cookie        |
| GET    | `/api/auth/me`       | Get current authenticated user |

### Users

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| GET    | `/api/users/:id`              | Get user profile           |
| PUT    | `/api/users/me`               | Update own profile         |
| POST   | `/api/users/me/profile-image` | Upload profile image       |
| GET    | `/api/users/:id/posts`        | Get user's posts           |
| GET    | `/api/users/:id/followers`    | Get user's followers       |
| GET    | `/api/users/:id/following`    | Get users the user follows |

### Posts

| Method | Endpoint         | Description                       |
| ------ | ---------------- | --------------------------------- |
| GET    | `/api/posts`     | Get paginated feed                |
| GET    | `/api/posts/:id` | Get single post                   |
| POST   | `/api/posts`     | Create a post with optional image |
| PUT    | `/api/posts/:id` | Update own post                   |
| DELETE | `/api/posts/:id` | Delete own post                   |

### Comments

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/posts/:id/comments` | Get comments for a post |
| POST   | `/api/posts/:id/comments` | Add a comment           |
| DELETE | `/api/comments/:id`       | Delete own comment      |

### Likes

| Method | Endpoint              | Description   |
| ------ | --------------------- | ------------- |
| POST   | `/api/posts/:id/like` | Like a post   |
| DELETE | `/api/posts/:id/like` | Unlike a post |

### Follows

| Method | Endpoint                | Description     |
| ------ | ----------------------- | --------------- |
| POST   | `/api/users/:id/follow` | Follow a user   |
| DELETE | `/api/users/:id/follow` | Unfollow a user |

---

## 🚀 Installation

### Prerequisites

Make sure the following are installed:

* Node.js v14 or higher
* MySQL v5.7 or higher
* npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CodeAlpha_SocialMediaPlatform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update the following values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=socialsphere
JWT_SECRET=your_secure_jwt_secret
PORT=3000
```

### 4. Set Up the Database

Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```

Optional sample data:

```bash
mysql -u root -p < database/seed.sql
```

### 5. Create Upload Directories

Create the directories used for local images:

```bash
mkdir -p uploads/profiles
mkdir -p uploads/posts
```

On Windows, you can create them manually:

```text
uploads/
├── profiles/
└── posts/
```

### 6. Start the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

### 7. Open the Application

Open your browser and visit:

```text
http://localhost:3000
```

---

## 🖼️ How Image Upload Works

Unlike an image-URL system, SocialSphere allows users to select an image directly from their device.

### Post Image Upload

```text
User selects image
        ↓
Frontend creates FormData
        ↓
POST /api/posts
        ↓
Multer receives the file
        ↓
File validation
        ↓
Image saved to uploads/posts/
        ↓
File path stored in MySQL
        ↓
Image displayed in the post
```

### Profile Image Upload

```text
User selects profile picture
        ↓
Frontend sends multipart/form-data
        ↓
Multer processes the image
        ↓
Image saved to uploads/profiles/
        ↓
File path stored in MySQL
        ↓
Profile displays the uploaded image
```

---

## 🔒 File Upload Security

The upload system should validate:

* Allowed file extensions
* MIME type
* Maximum file size
* Uploaded file names
* User authentication
* Upload destination

Example configuration:

```text
Allowed:
.jpg
.jpeg
.png
.gif
.webp
```

Recommended maximum file size:

```text
5 MB
```

Never allow executable files to be uploaded as images.

---

## 👥 Sample Users

| Username | Email                                         | Password      |
| -------- | --------------------------------------------- | ------------- |
| alice    | [alice@example.com](mailto:alice@example.com) | password123   |
| bob      | [bob@example.com](mailto:bob@example.com)     | securepass456 |
| carol    | [carol@example.com](mailto:carol@example.com) | mypassword789 |
| dave     | [dave@example.com](mailto:dave@example.com)   | testpass123   |
| erin     | [erin@example.com](mailto:erin@example.com)   | demo12345     |

> **Important:** These credentials are intended only for local/demo testing. Do not use these passwords in a production environment.

---

## 🧪 Testing

### Authentication

* [ ] Register a new user
* [ ] Try registering with duplicate email/username
* [ ] Login with valid credentials
* [ ] Login with invalid credentials
* [ ] Logout
* [ ] Verify authentication persists after page reload

### Profiles

* [ ] View any user's profile
* [ ] Upload a profile image
* [ ] Replace an existing profile image
* [ ] Edit own profile
* [ ] Verify another user's profile cannot be edited

### Posts

* [ ] Create a text-only post
* [ ] Create a post with an image
* [ ] Upload an image from the local device
* [ ] Verify unsupported file types are rejected
* [ ] Verify oversized files are rejected
* [ ] View feed with pagination
* [ ] Edit own post
* [ ] Delete own post
* [ ] Verify another user's post cannot be edited/deleted

### Likes

* [ ] Like a post
* [ ] Unlike a post
* [ ] Verify duplicate likes are prevented

### Comments

* [ ] Add a comment
* [ ] View comments
* [ ] Delete own comment
* [ ] Verify another user's comment cannot be deleted

### Follows

* [ ] Follow a user
* [ ] Unfollow a user
* [ ] Verify duplicate follows are prevented
* [ ] Verify self-following is prevented
* [ ] View followers
* [ ] View following list

### Image Upload

* [ ] Upload JPG image
* [ ] Upload PNG image
* [ ] Upload WEBP image
* [ ] Reject unsupported file type
* [ ] Reject files larger than the configured limit
* [ ] Verify uploaded images are displayed correctly
* [ ] Verify unauthorized users cannot upload to another user's profile

### Security

* [ ] Access protected routes without authentication
* [ ] Test invalid JWT
* [ ] Verify SQL injection protection
* [ ] Test input validation
* [ ] Verify rate limiting
* [ ] Test file upload validation

---

## 📸 Screenshots

Add screenshots of the application here to demonstrate the main functionality.

Recommended screenshots:

1. Login page
2. Registration page
3. Home/feed page
4. Create post page
5. Post with uploaded local image
6. User profile
7. Profile with uploaded profile picture
8. Comments and likes
9. Followers/following section

Example:

```markdown
## 📸 Screenshots

### Home Feed
![Home Feed](screenshots/home-feed.png)

### Create Post
![Create Post](screenshots/create-post.png)

### User Profile
![User Profile](screenshots/profile.png)
```

---

## 🔮 Future Improvements

* [ ] Cloud image storage
* [ ] Image compression and resizing
* [ ] Real-time notifications with WebSockets
* [ ] Direct messaging between users
* [ ] Search functionality for users and posts
* [ ] Hashtags and mentions
* [ ] Dark mode
* [ ] Email verification
* [ ] Password reset
* [ ] Infinite scroll instead of pagination
* [ ] Post sharing
* [ ] Saved posts/bookmarks
* [ ] User blocking
* [ ] Content moderation tools
* [ ] Mobile application with React Native

---

## 📌 Important Notes

### Local Images

Uploaded images are stored on the local server inside:

```text
uploads/
```

If the project is deployed to a hosting service, local uploaded files may not persist permanently depending on the hosting provider.

For production deployment, a cloud storage service can be used later.

### GitHub

Do **not** commit:

```text
.env
uploads/
node_modules/
```

Add them to `.gitignore`:

```gitignore
node_modules/
.env
uploads/
```

---

## 📄 License

This project was created for the **CodeAlpha Full Stack Development Internship - Task 2**.
