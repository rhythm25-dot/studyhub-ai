require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testConnection();
    console.log('MySQL connected successfully');

    app.listen(PORT, () => {
      console.log(`StudyHub AI API running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    console.error('Check your database credentials in .env and make sure MySQL is running.');
    process.exit(1);
  }
}

startServer();
