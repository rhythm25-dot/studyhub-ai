const { pool } = require('../config/db');

async function create({ subjectId, authorId, title, content }) {
  const [result] = await pool.query(
    'INSERT INTO announcements (subject_id, author_id, title, content) VALUES (?, ?, ?, ?)',
    [subjectId || null, authorId, title, content]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT a.*, u.name AS author_name, u.role AS author_role, s.name AS subject_name
     FROM announcements a
     JOIN users u ON u.id = a.author_id
     LEFT JOIN subjects s ON s.id = a.subject_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// admin -> platform-wide (subject_id IS NULL); teacher -> own subjects' announcements + platform-wide;
// student -> announcements for enrolled subjects + platform-wide.
async function findForUser(user, { search, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (user.role === 'admin') {
    conditions.push('a.subject_id IS NULL');
  } else if (user.role === 'teacher') {
    conditions.push('(a.subject_id IS NULL OR a.subject_id IN (SELECT id FROM subjects WHERE teacher_id = ?))');
    params.push(user.id);
  } else {
    conditions.push('(a.subject_id IS NULL OR a.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?))');
    params.push(user.id);
  }

  if (search) {
    conditions.push('MATCH(a.title, a.content) AGAINST (? IN NATURAL LANGUAGE MODE)');
    params.push(search);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(
    `SELECT a.*, u.name AS author_name, u.role AS author_role, s.name AS subject_name
     FROM announcements a
     JOIN users u ON u.id = a.author_id
     LEFT JOIN subjects s ON s.id = a.subject_id
     ${where}
     ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM announcements a ${where}`, params);
  return { rows, total };
}

async function remove(id) {
  await pool.query('DELETE FROM announcements WHERE id = ?', [id]);
}

module.exports = { create, findById, findForUser, remove };
