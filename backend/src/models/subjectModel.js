const { pool } = require('../config/db');

async function create({ name, code, description, coverColor, teacherId }) {
  const [result] = await pool.query(
    `INSERT INTO subjects (name, code, description, cover_color, teacher_id)
     VALUES (?, ?, ?, ?, ?)`,
    [name, code, description, coverColor || '#4F46E5', teacherId]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, u.name AS teacher_name,
       (SELECT COUNT(*) FROM subject_enrollments e WHERE e.subject_id = s.id) AS student_count,
       (SELECT COUNT(*) FROM notes n WHERE n.subject_id = s.id) AS notes_count
     FROM subjects s
     JOIN users u ON u.id = s.teacher_id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Subjects visible to a given user, scoped by role:
// admin -> all, teacher -> owned, student -> enrolled only.
async function findForUser(user, { search, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = ['s.is_active = 1'];
  const params = [];

  if (user.role === 'teacher') {
    conditions.push('s.teacher_id = ?');
    params.push(user.id);
  } else if (user.role === 'student') {
    conditions.push('s.id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?)');
    params.push(user.id);
  }

  if (search) {
    conditions.push('(s.name LIKE ? OR s.code LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.query(
    `SELECT s.*, u.name AS teacher_name,
       (SELECT COUNT(*) FROM subject_enrollments e WHERE e.subject_id = s.id) AS student_count,
       (SELECT COUNT(*) FROM notes n WHERE n.subject_id = s.id) AS notes_count
     FROM subjects s
     JOIN users u ON u.id = s.teacher_id
     ${where}
     ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM subjects s ${where}`,
    params
  );
  return { rows, total };
}

async function update(id, { name, description, coverColor }) {
  await pool.query(
    `UPDATE subjects SET name = COALESCE(?, name), description = COALESCE(?, description),
     cover_color = COALESCE(?, cover_color) WHERE id = ?`,
    [name, description, coverColor, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('UPDATE subjects SET is_active = 0 WHERE id = ?', [id]);
}

async function enrollStudent(subjectId, studentId) {
  await pool.query(
    'INSERT IGNORE INTO subject_enrollments (subject_id, student_id) VALUES (?, ?)',
    [subjectId, studentId]
  );
}

async function unenrollStudent(subjectId, studentId) {
  await pool.query(
    'DELETE FROM subject_enrollments WHERE subject_id = ? AND student_id = ?',
    [subjectId, studentId]
  );
}

async function listEnrolledStudents(subjectId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.avatar_url, e.enrolled_at
     FROM subject_enrollments e JOIN users u ON u.id = e.student_id
     WHERE e.subject_id = ? ORDER BY e.enrolled_at DESC`,
    [subjectId]
  );
  return rows;
}

async function isTeacherOwner(subjectId, teacherId) {
  const [rows] = await pool.query(
    'SELECT id FROM subjects WHERE id = ? AND teacher_id = ?',
    [subjectId, teacherId]
  );
  return rows.length > 0;
}

async function isStudentEnrolled(subjectId, studentId) {
  const [rows] = await pool.query(
    'SELECT id FROM subject_enrollments WHERE subject_id = ? AND student_id = ?',
    [subjectId, studentId]
  );
  return rows.length > 0;
}

module.exports = {
  create,
  findById,
  findForUser,
  update,
  remove,
  enrollStudent,
  unenrollStudent,
  listEnrolledStudents,
  isTeacherOwner,
  isStudentEnrolled,
};
