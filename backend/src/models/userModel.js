const { pool } = require('../config/db');

// All queries here use parameterized placeholders (?) to prevent SQL injection.

async function create({ name, email, password, role, verificationToken }) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password, role, verification_token)
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, password, role, verificationToken]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function findByVerificationToken(token) {
  const [rows] = await pool.query('SELECT * FROM users WHERE verification_token = ?', [token]);
  return rows[0] || null;
}

async function findByResetToken(token) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
    [token]
  );
  return rows[0] || null;
}

async function markVerified(id) {
  await pool.query(
    'UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?',
    [id]
  );
}

async function setResetToken(id, token, expiresAt) {
  await pool.query(
    'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
    [token, expiresAt, id]
  );
}

async function updatePassword(id, hashedPassword) {
  await pool.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
    [hashedPassword, id]
  );
}

async function updateProfile(id, { name, bio, avatarUrl }) {
  await pool.query(
    'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
    [name, bio, avatarUrl, id]
  );
  return findById(id);
}

async function findAll({ role, search, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }
  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT id, name, email, role, avatar_url, is_verified, is_active, created_at
     FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${where}`,
    params
  );
  return { rows, total };
}

async function setActive(id, isActive) {
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
}

async function remove(id) {
  await pool.query('DELETE FROM users WHERE id = ?', [id]);
}

module.exports = {
  create,
  findById,
  findByEmail,
  findByVerificationToken,
  findByResetToken,
  markVerified,
  setResetToken,
  updatePassword,
  updateProfile,
  findAll,
  setActive,
  remove,
};
