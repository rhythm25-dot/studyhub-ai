const { pool } = require('../config/db');

async function create({ subjectId, teacherId, title, description, fileUrl, fileType, fileSizeKb }) {
  const [result] = await pool.query(
    `INSERT INTO notes (subject_id, teacher_id, title, description, file_url, file_type, file_size_kb)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subjectId, teacherId, title, description, fileUrl, fileType, fileSizeKb]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT n.*, s.name AS subject_name, u.name AS teacher_name
     FROM notes n
     JOIN subjects s ON s.id = n.subject_id
     JOIN users u ON u.id = n.teacher_id
     WHERE n.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Notes list, scoped by role and optionally filtered by subject or free-text search.
async function findForUser(user, { subjectId, search, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (user.role === 'teacher') {
    conditions.push('n.teacher_id = ?');
    params.push(user.id);
  } else if (user.role === 'student') {
    conditions.push('n.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?)');
    params.push(user.id);
  }

  if (subjectId) {
    conditions.push('n.subject_id = ?');
    params.push(subjectId);
  }

  if (search) {
    conditions.push('MATCH(n.title, n.description) AGAINST (? IN NATURAL LANGUAGE MODE)');
    params.push(search);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT n.*, s.name AS subject_name, u.name AS teacher_name
     FROM notes n
     JOIN subjects s ON s.id = n.subject_id
     JOIN users u ON u.id = n.teacher_id
     ${where}
     ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM notes n ${where}`,
    params
  );
  return { rows, total };
}

async function update(id, { title, description }) {
  await pool.query(
    'UPDATE notes SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?',
    [title, description, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM notes WHERE id = ?', [id]);
}

async function incrementViews(id) {
  await pool.query('UPDATE notes SET views_count = views_count + 1 WHERE id = ?', [id]);
}

// --- Bookmarks ---

async function addBookmark(noteId, studentId) {
  await pool.query(
    'INSERT IGNORE INTO note_bookmarks (note_id, student_id) VALUES (?, ?)',
    [noteId, studentId]
  );
}

async function removeBookmark(noteId, studentId) {
  await pool.query(
    'DELETE FROM note_bookmarks WHERE note_id = ? AND student_id = ?',
    [noteId, studentId]
  );
}

async function listBookmarked(studentId, { page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(
    `SELECT n.*, s.name AS subject_name, u.name AS teacher_name, b.created_at AS bookmarked_at
     FROM note_bookmarks b
     JOIN notes n ON n.id = b.note_id
     JOIN subjects s ON s.id = n.subject_id
     JOIN users u ON u.id = n.teacher_id
     WHERE b.student_id = ?
     ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [studentId, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM note_bookmarks WHERE student_id = ?',
    [studentId]
  );
  return { rows, total };
}

async function isBookmarked(noteId, studentId) {
  const [rows] = await pool.query(
    'SELECT id FROM note_bookmarks WHERE note_id = ? AND student_id = ?',
    [noteId, studentId]
  );
  return rows.length > 0;
}

module.exports = {
  create,
  findById,
  findForUser,
  update,
  remove,
  incrementViews,
  addBookmark,
  removeBookmark,
  listBookmarked,
  isBookmarked,
};
