-- CodeAlpha Social Media Platform - Seed Data
-- Run after schema.sql
-- Passwords are bcrypt-hashed (NOT plain text)

USE codealpha_social;

-- ============================================
-- SAMPLE USERS
-- Passwords:
--   alice   -> password123
--   bob     -> securepass456
--   carol   -> mypassword789
--   dave    -> testpass123
--   erin    -> demo12345
-- ============================================
INSERT INTO users (username, email, password_hash, bio, profile_image) VALUES
('alice', 'alice@example.com', '$2a$10$./MPsMOlthzrVbd2unEOBeYXkJWcUYvBxW.8yHShajo199kiKWfJK', 'Frontend developer who loves React and coffee.', 'https://i.pravatar.cc/150?img=47'),
('bob', 'bob@example.com', '$2a$10$OJDCgOtx75mBnIOiqGBtLuIW5ineTHEQytuTNF.sJ.ofPUPgpX9sy', 'Backend engineer. Node.js enthusiast.', 'https://i.pravatar.cc/150?img=12'),
('carol', 'carol@example.com', '$2a$10$G5yrOM7gIdii9mq7gBs.hu8zkfcan8RI2j1yZLITHbPzIote.CyOO', 'UI/UX designer crafting beautiful interfaces.', 'https://i.pravatar.cc/150?img=32'),
('dave', 'dave@example.com', '$2a$10$RK1Ni330Txro10IdfptBT.B2Wj.qrQBmQp2Dt7iTkewDtdiCfOvlW', 'Full-stack developer. Always learning.', 'https://i.pravatar.cc/150?img=68'),
('erin', 'erin@example.com', '$2a$10$LDPNlfoAvel4/A.Jl8Gy.Ohb4Bh7NZX6Z99AoDI6PCEN3aJAz1gFC', 'DevOps engineer and cloud architect.', 'https://i.pravatar.cc/150?img=5');

-- ============================================
-- SAMPLE POSTS
-- ============================================
INSERT INTO posts (user_id, content, image_url) VALUES
(1, 'Just finished building my first full-stack application! 🚀 The journey from idea to deployment is incredibly rewarding.', 'https://picsum.photos/seed/post1/800/500'),
(1, 'Coffee + coding = the perfect morning. ☕💻 What''s your favorite productivity hack?', NULL),
(2, 'Node.js streams are a game changer for handling large files. Highly recommend diving into them!', 'https://picsum.photos/seed/post2/800/500'),
(2, 'Just deployed a new microservice to production. Zero downtime! 🎉', NULL),
(3, 'Designing a new color palette for an upcoming project. Teal and coral are looking amazing together!', 'https://picsum.photos/seed/post3/800/500'),
(3, 'Accessibility is not a feature, it''s a requirement. Let''s build for everyone. ♿', NULL),
(4, 'Learning TypeScript has completely changed how I write JavaScript. The type safety is worth it!', 'https://picsum.photos/seed/post4/800/500'),
(4, 'Weekend project: building a CLI tool to automate my daily workflow. What tools do you use?', NULL),
(5, 'Kubernetes clusters are like onions - they have layers. 🧅 Just spent the day debugging a networking issue.', 'https://picsum.photos/seed/post5/800/500'),
(5, 'Automation is the key to scaling. If you do it twice, automate it!', NULL);

-- ============================================
-- SAMPLE COMMENTS
-- ============================================
INSERT INTO comments (post_id, user_id, content) VALUES
(1, 2, 'Congrats! That''s a huge milestone. 🎉'),
(1, 3, 'Amazing work! What stack did you use?'),
(2, 4, 'Definitely! My hack is the Pomodoro technique. 🍅'),
(2, 5, 'Coffee is essential. Great post!'),
(3, 1, 'Streams are so powerful. Great tip!'),
(3, 5, 'Thanks for sharing, I''ll check this out.'),
(4, 1, 'Congrats on the deployment! 🚀'),
(5, 2, 'Teal and coral is a beautiful combo!'),
(5, 4, 'Would love to see the final result!'),
(6, 1, '100% agree. Accessibility matters!'),
(7, 2, 'TypeScript is the way to go!'),
(7, 5, 'Same here, it changed my workflow too.'),
(8, 3, 'Sounds fun! Let me know how it goes.'),
(9, 4, 'Debugging networking is always fun... not. 😅'),
(10, 2, 'Great advice. Automation saves so much time!');

-- ============================================
-- SAMPLE LIKES
-- ============================================
INSERT INTO likes (post_id, user_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 3), (2, 5),
(3, 1), (3, 4), (3, 5),
(4, 1), (4, 3),
(5, 2), (5, 4),
(6, 1), (6, 2), (6, 5),
(7, 2), (7, 3),
(8, 1), (8, 5),
(9, 2), (9, 3), (9, 4),
(10, 1), (10, 3), (10, 5);

-- ============================================
-- SAMPLE FOLLOWS
-- ============================================
INSERT INTO followers (follower_id, following_id) VALUES
(1, 2), (1, 3), (1, 4),
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 5),
(5, 1), (5, 2), (5, 3), (5, 4);