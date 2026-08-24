const { pool } = require('./src/config/database');

async function test() {
  try {
    // Check tables exist
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log('TABLES:', tableNames.join(', '));

    const required = ['users', 'posts', 'comments', 'likes', 'followers'];
    const missing = required.filter((t) => !tableNames.includes(t));
    if (missing.length > 0) {
      console.error('MISSING_TABLES:', missing.join(', '));
      process.exit(1);
    }

    // Check seed data
    const [[{ count: userCount }]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    const [[{ count: postCount }]] = await pool.query('SELECT COUNT(*) AS count FROM posts');
    console.log(`SEED_DATA: ${userCount} users, ${postCount} posts`);

    console.log('APP_READY_OK');
    process.exit(0);
  } catch (e) {
    console.error('APP_READY_FAILED:', e.message);
    process.exit(1);
  }
}

test();