const { pool } = require('../config/db');

async function create({ userId, type, title, message, link }) {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, link) VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, message, link || null]
  );
  return result.insertId;
}

// Insert the same notification for many users in one query - used when
// notifying every student enrolled in a subject about a new note/quiz/etc.
async function createForMany(userIds, { type, title, message, link }) {
  if (!userIds.length) return;
  const values = userIds.map((id) => [id, type, title, message, link || null]);
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, message, link) VALUES ?`,
    [values]
  );
}

async function findForUser(userId, { unreadOnly, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = ['user_id = ?'];
  const params = [userId];
  if (unreadOnly === 'true' || unreadOnly === true) {
    conditions.push('is_read = 0');
  }
  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(
    `SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM notifications ${where}`, params);
  const [[{ unread }]] = await pool.query(
    'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0',
    [userId]
  );
  return { rows, total, unread };
}

async function markAsRead(id, userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, userId]);
}

async function markAllAsRead(userId) {
  await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
}

module.exports = { create, createForMany, findForUser, markAsRead, markAllAsRead };
