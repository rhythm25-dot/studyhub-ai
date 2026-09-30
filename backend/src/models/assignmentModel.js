const { pool } = require('../config/db');

// --- Assignments ---

async function create({ subjectId, teacherId, title, description, rubricUrl, maxMarks, dueDate }) {
  const [result] = await pool.query(
    `INSERT INTO assignments (subject_id, teacher_id, title, description, rubric_url, max_marks, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subjectId, teacherId, title, description, rubricUrl || null, maxMarks || 100, dueDate]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT a.*, s.name AS subject_name, u.name AS teacher_name
     FROM assignments a
     JOIN subjects s ON s.id = a.subject_id
     JOIN users u ON u.id = a.teacher_id
     WHERE a.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findForUser(user, { subjectId, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (user.role === 'teacher') {
    conditions.push('a.teacher_id = ?');
    params.push(user.id);
  } else if (user.role === 'student') {
    conditions.push('a.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?)');
    params.push(user.id);
  }
  if (subjectId) {
    conditions.push('a.subject_id = ?');
    params.push(subjectId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let selectExtra = '';
  if (user.role === 'student') {
    selectExtra = `,
      (SELECT status FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.student_id = ?) AS my_status,
      (SELECT marks_obtained FROM assignment_submissions sub WHERE sub.assignment_id = a.id AND sub.student_id = ?) AS my_marks`;
    params.unshift(user.id, user.id);
  }

  const [rows] = await pool.query(
    `SELECT a.*, s.name AS subject_name, u.name AS teacher_name ${selectExtra}
     FROM assignments a
     JOIN subjects s ON s.id = a.subject_id
     JOIN users u ON u.id = a.teacher_id
     ${where}
     ORDER BY a.due_date ASC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );

  const countParams = user.role === 'student' ? params.slice(2) : params;
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM assignments a ${where}`, countParams);
  return { rows, total };
}

async function remove(id) {
  await pool.query('DELETE FROM assignments WHERE id = ?', [id]);
}

// --- Submissions ---

async function upsertSubmission({ assignmentId, studentId, fileUrl, status }) {
  await pool.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, status)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), status = VALUES(status),
       submitted_at = CURRENT_TIMESTAMP, marks_obtained = NULL, teacher_feedback = NULL,
       ai_grammar_score = NULL, ai_content_score = NULL, ai_feedback = NULL, graded_at = NULL`,
    [assignmentId, studentId, fileUrl, status]
  );
  return findSubmission(assignmentId, studentId);
}

async function findSubmission(assignmentId, studentId) {
  const [rows] = await pool.query(
    `SELECT sub.*, u.name AS student_name, u.email AS student_email
     FROM assignment_submissions sub JOIN users u ON u.id = sub.student_id
     WHERE sub.assignment_id = ? AND sub.student_id = ?`,
    [assignmentId, studentId]
  );
  return rows[0] || null;
}

async function findSubmissionById(id) {
  const [rows] = await pool.query(
    `SELECT sub.*, u.name AS student_name, u.email AS student_email, a.teacher_id, a.max_marks, a.title AS assignment_title
     FROM assignment_submissions sub
     JOIN users u ON u.id = sub.student_id
     JOIN assignments a ON a.id = sub.assignment_id
     WHERE sub.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function listSubmissions(assignmentId) {
  const [rows] = await pool.query(
    `SELECT sub.*, u.name AS student_name, u.email AS student_email, u.avatar_url
     FROM assignment_submissions sub JOIN users u ON u.id = sub.student_id
     WHERE sub.assignment_id = ? ORDER BY sub.submitted_at DESC`,
    [assignmentId]
  );
  return rows;
}

async function gradeSubmission(id, { marksObtained, teacherFeedback }) {
  await pool.query(
    `UPDATE assignment_submissions
     SET marks_obtained = ?, teacher_feedback = ?, status = 'graded', graded_at = NOW()
     WHERE id = ?`,
    [marksObtained, teacherFeedback, id]
  );
  return findSubmissionById(id);
}

async function saveAiFeedback(id, { grammarScore, contentScore, feedback }) {
  await pool.query(
    `UPDATE assignment_submissions
     SET ai_grammar_score = ?, ai_content_score = ?, ai_feedback = ? WHERE id = ?`,
    [grammarScore, contentScore, feedback, id]
  );
  return findSubmissionById(id);
}

// Pending evaluations for a teacher's dashboard - submissions awaiting grading.
async function findPendingForTeacher(teacherId, limit = 10) {
  const [rows] = await pool.query(
    `SELECT sub.*, u.name AS student_name, a.title AS assignment_title, a.id AS assignment_id
     FROM assignment_submissions sub
     JOIN assignments a ON a.id = sub.assignment_id
     JOIN users u ON u.id = sub.student_id
     WHERE a.teacher_id = ? AND sub.status != 'graded'
     ORDER BY sub.submitted_at ASC LIMIT ?`,
    [teacherId, Number(limit)]
  );
  return rows;
}

module.exports = {
  create,
  findById,
  findForUser,
  remove,
  upsertSubmission,
  findSubmission,
  findSubmissionById,
  listSubmissions,
  gradeSubmission,
  saveAiFeedback,
  findPendingForTeacher,
};
