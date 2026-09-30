/**
 * StudyHub AI - Database Initializer
 *
 * Run with: npm run init-db
 *
 * What it does:
 *   1. Connects to MySQL using the credentials in .env (no database
 *      selected yet, since the database itself may not exist).
 *   2. Executes database/studyhub_ai.sql, which creates the database
 *      and every table with `CREATE TABLE IF NOT EXISTS` - so this is
 *      always safe to re-run and will never drop or overwrite data.
 *   3. Seeds the three required demo accounts (admin/teacher/student)
 *      with bcrypt-hashed passwords, skipping any that already exist.
 *
 * After this completes, `npm run dev` will work immediately - no manual
 * SQL editing required.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const SQL_FILE = path.join(__dirname, 'studyhub_ai.sql');

const DEMO_ACCOUNTS = [
  { name: 'Admin', email: 'admin@studyhub.com', password: 'Admin@123', role: 'admin' },
  { name: 'Teacher', email: 'teacher@studyhub.com', password: 'Teacher@123', role: 'teacher' },
  { name: 'Student', email: 'student@studyhub.com', password: 'Student@123', role: 'student' },
];

async function runSchema(connection) {
  const sql = fs.readFileSync(SQL_FILE, 'utf8');
  console.log(`Running ${path.basename(SQL_FILE)} ...`);
  await connection.query(sql);
  console.log('Schema is up to date (all tables created if they did not already exist).\n');
}

async function seedDemoAccounts(connection) {
  console.log('Ensuring demo accounts exist...');
  for (const account of DEMO_ACCOUNTS) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [account.email]);
    if (existing.length > 0) {
      console.log(`  Skipped (already exists): ${account.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(account.password, 10);
    await connection.query(
      `INSERT INTO users (name, email, password, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, 1, 1)`,
      [account.name, account.email, hashedPassword, account.role]
    );
    console.log(`  Created: ${account.email} (${account.role})`);
  }
  console.log();
}

async function main() {
  const required = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required .env values: ${missing.join(', ')}`);
    console.error('Copy .env.example to .env and fill in your MySQL credentials first.');
    process.exit(1);
  }

  // No `database` option here on purpose - the SQL file itself creates
  // the database with CREATE DATABASE IF NOT EXISTS, so this connection
  // must be allowed to run before that database necessarily exists.
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  try {
    await runSchema(connection);

    // Now that the database is guaranteed to exist, switch this
    // connection onto it for the seeding step.
    await connection.changeUser({ database: process.env.DB_NAME || 'studyhub_ai' });

    await seedDemoAccounts(connection);

    console.log('Database initialization complete. You can now run: npm run dev');
    console.log('\nDemo accounts:');
    for (const a of DEMO_ACCOUNTS) {
      console.log(`  ${a.role.padEnd(8)} ${a.email} / ${a.password}`);
    }
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('\nDatabase initialization failed:');
  console.error(err.message);
  process.exit(1);
});
