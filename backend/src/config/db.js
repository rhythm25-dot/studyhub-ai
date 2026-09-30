const mysql = require('mysql2/promise');
require('dotenv').config();

// A single shared connection pool used across the whole app.
// Using a pool (instead of one connection) lets multiple requests
// query the database concurrently without blocking each other.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

// Quick sanity check used on server startup so a bad DB config
// fails fast with a clear message instead of failing on the first request.
async function testConnection() {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
}

module.exports = { pool, testConnection };
