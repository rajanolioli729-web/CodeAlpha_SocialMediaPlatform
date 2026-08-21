# SocialSphere - Social Media Platform

A full-stack social media platform built for the **CodeAlpha Full Stack Development Internship - Task 2**.

## 📋 Project Description

SocialSphere is a complete social media application with user profiles, posts, comments, likes, and follow/unfollow functionality. It features a modern responsive UI, secure authentication with JWT and HTTP-only cookies, and a robust MySQL database with parameterized queries.

## ✨ Features

- **User Authentication**
  - Register with username, email, and password
  - Login with email and password
  - Logout
  - JWT-based authentication stored in HTTP-only cookies
  - Password hashing with bcrypt

- **User Profiles**
  - View profile with bio, profile image, follower/following counts
  - Edit own profile (username, bio, profile image)
  - View user's posts

- **Posts**
  - Create posts with text and optional image URL
  - View feed with pagination
  - Edit and delete own posts
  - Like/unlike posts
  - Comment on posts

- **Comments**
  - View comments on posts
  - Add comments
  - Delete own comments

- **Follow System**
  - Follow/unfollow users
  - View followers and following lists
  - Prevent self-following
  - Prevent duplicate follows

- **Security**
  - Helmet for security headers
  - Rate limiting
  - CORS configuration
  - Input validation with express-validator
  - Parameterized SQL queries
  - Centralized error handling
  - No plain-text passwords

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Responsive design

### Backend
- Node.js
- Express.js

### Database
- MySQL
- mysql2 connection pool

### Security
- bcryptjs
- jsonwebtoken
- HTTP-only cookies
- Helmet
- CORS
- express-rate-limit
- express-validator

## 📁 Project Architecture

```
CodeAlpha_SocialMediaPlatform/
│
├── public/
│   ├── index.html          # Home feed page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── profile.html        # User profile page
│   ├── create-post.html    # Create post page
│   │
│   ├── css/
│   │   ├── style.css       # Main styles
│   │   ├── auth.css        # Auth page styles
│   │   └── profile.css     # Profile page styles
│   │
│   └── js/
│       ├── api.js          # API client
│       ├── auth.js         # Auth state management
│       ├── feed.js         # Feed and post rendering
│       ├── profile.js      # Profile page logic
│       └── utils.js        # Utility functions
│
├── src/
│   ├── config/
│   │   ├── database.js     # MySQL connection pool
│   │   └── env.js          # Environment configuration
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
├── database/
│   ├── schema.sql          # Database schema
│   └── seed.sql            # Sample data
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| username | VARCHAR(50) UNIQUE | User's username |
| email | VARCHAR(255) UNIQUE | User's email |
| password_hash | VARCHAR(255) | bcrypt-hashed password |
| bio | TEXT | User's bio |
| profile_image | VARCHAR(500) | Profile image URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### posts
| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| user_id | INT UNSIGNED | Foreign key to users |
| content | TEXT | Post content |
| image_url | VARCHAR(500) | Optional image URL |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### comments
| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| post_id | INT UNSIGNED | Foreign key to posts |
| user_id | INT UNSIGNED | Foreign key to users |
| content | TEXT | Comment content |
| created_at | TIMESTAMP | Creation timestamp |

### likes
| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| post_id | INT UNSIGNED | Foreign key to posts |
| user_id | INT UNSIGNED | Foreign key to users |
| created_at | TIMESTAMP | Creation timestamp |

Unique constraint on (post_id, user_id) prevents duplicate likes.

### followers
| Column | Type | Description |
|--------|------|-------------|
| id | INT UNSIGNED AUTO_INCREMENT | Primary key |
| follower_id | INT UNSIGNED | Foreign key to users |
| following_id | INT UNSIGNED | Foreign key to users |
| created_at | TIMESTAMP | Creation timestamp |

Unique constraint on (follower_id, following_id) prevents duplicate follows.
Check constraint prevents self-following.

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get JWT cookie |
| POST | /api/auth/logout | Logout and clear cookie |
| GET | /api/auth/me | Get current authenticated user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/:id | Get user profile |
| PUT | /api/users/me | Update own profile |
| GET | /api/users/:id/posts | Get user's posts |
| GET | /api/users/:id/followers | Get user's followers |
| GET | /api/users/:id/following | Get users the user follows |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts | Get paginated feed |
| GET | /api/posts/:id | Get single post |
| POST | /api/posts | Create a post |
| PUT | /api/posts/:id | Update own post |
| DELETE | /api/posts/:id | Delete own post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/posts/:id/comments | Get comments for a post |
| POST | /api/posts/:id/comments | Add a comment |
| DELETE | /api/comments/:id | Delete own comment |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/posts/:id/like | Like a post |
| DELETE | /api/posts/:id/like | Unlike a post |

### Follows
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/:id/follow | Follow a user |
| DELETE | /api/users/:id/follow | Unfollow a user |

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CodeAlpha_SocialMediaPlatform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update:
   - `DB_PASSWORD` with your MySQL password
   - `JWT_SECRET` with a secure random string

4. **Set up the database**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```

5. **Run the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

6. **Access the application**
   Open http://localhost:3000 in your browser

### Sample Users (from seed data)
| Username | Email | Password |
|----------|-------|----------|
| alice | alice@example.com | password123 |
| bob | bob@example.com | securepass456 |
| carol | carol@example.com | mypassword789 |
| dave | dave@example.com | testpass123 |
| erin | erin@example.com | demo12345 |

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register a new user
- [ ] Try registering with duplicate email/username
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Verify authentication persists across page reloads

**Profiles:**
- [ ] View any user's profile
- [ ] Edit own profile
- [ ] Verify cannot edit another user's profile

**Posts:**
- [ ] Create a post
- [ ] View feed with pagination
- [ ] Edit own post
- [ ] Delete own post
- [ ] Verify cannot edit/delete another user's post

**Likes:**
- [ ] Like a post
- [ ] Unlike a post
- [ ] Verify duplicate likes are prevented

**Comments:**
- [ ] Add a comment
- [ ] View comments
- [ ] Delete own comment
- [ ] Verify cannot delete another user's comment

**Follows:**
- [ ] Follow a user
- [ ] Unfollow a user
- [ ] Verify duplicate follows are prevented
- [ ] Verify cannot follow yourself
- [ ] View followers and following lists

**Security:**
- [ ] Access protected routes without authentication
- [ ] Test with invalid JWT
- [ ] Verify SQL injection is prevented
- [ ] Test input validation
- [ ] Verify rate limiting works

## 📸 Screenshots

*Screenshots to be added*

## 🔮 Future Improvements

- [ ] Image upload with multer instead of URL-only
- [ ] Real-time notifications with WebSockets
- [ ] Direct messaging between users
- [ ] Search functionality for users and posts
- [ ] Hashtags and mentions
- [ ] Dark mode
- [ ] Email verification
- [ ] Password reset
- [ ] Infinite scroll instead of pagination
- [ ] Post sharing
- [ ] Saved posts/bookmarks
- [ ] User blocking
- [ ] Content moderation tools
- [ ] Mobile app with React Native

## 📄 License

This project was created for the **CodeAlpha Full Stack Development Internship - Task 2**.