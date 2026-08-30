const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/database');

async function startServer() {
  try {
    // Test database connection
    await testConnection();

    const server = app.listen(env.port, '0.0.0.0', () => {
      console.log(`Server running on port ${env.port}`);
      console.log(`Environment: ${env.nodeEnv}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Shutting down server...');

      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

startServer();