const { pool } = require('./src/config/database');

async function test() {
  try {
    await pool.query('SELECT 1');
    console.log('DB_CONNECTION_OK');
    process.exit(0);
  } catch (e) {
    console.error('DB_CONNECTION_FAILED:', e.message);
    process.exit(1);
  }
}

test();