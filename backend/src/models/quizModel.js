const { pool } = require('../config/db');

// --- Quizzes ---

async function create({ subjectId, teacherId, title, description, durationMinutes, isAiGenerated }) {
  const [result] = await pool.query(
    `INSERT INTO quizzes (subject_id, teacher_id, title, description, duration_minutes, is_ai_generated)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [subjectId, teacherId, title, description || null, durationMinutes || 30, isAiGenerated ? 1 : 0]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT q.*, s.name AS subject_name, u.name AS teacher_name,
       (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count,
       (SELECT COALESCE(SUM(marks),0) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS total_marks
     FROM quizzes q
     JOIN subjects s ON s.id = q.subject_id
     JOIN users u ON u.id = q.teacher_id
     WHERE q.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findForUser(user, { subjectId, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (user.role === 'teacher') {
    conditions.push('q.teacher_id = ?');
    params.push(user.id);
  } else if (user.role === 'student') {
    conditions.push('q.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?) AND q.is_published = 1');
    params.push(user.id);
  }
  if (subjectId) {
    conditions.push('q.subject_id = ?');
    params.push(subjectId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT q.*, s.name AS subject_name, u.name AS teacher_name,
       (SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id) AS question_count
     FROM quizzes q
     JOIN subjects s ON s.id = q.subject_id
     JOIN users u ON u.id = q.teacher_id
     ${where}
     ORDER BY q.created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM quizzes q ${where}`, params);
  return { rows, total };
}

async function publish(id, isPublished) {
  await pool.query('UPDATE quizzes SET is_published = ? WHERE id = ?', [isPublished ? 1 : 0, id]);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM quizzes WHERE id = ?', [id]);
}

// --- Questions ---

async function addQuestion(quizId, { questionText, questionType, options, correctAnswer, marks, orderIndex }) {
  const [result] = await pool.query(
    `INSERT INTO quiz_questions (quiz_id, question_text, question_type, options_json, correct_answer, marks, order_index)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [quizId, questionText, questionType, options ? JSON.stringify(options) : null, correctAnswer, marks || 1, orderIndex || 0]
  );
  return result.insertId;
}

async function addQuestionsBulk(quizId, questions) {
  const ids = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const id = await addQuestion(quizId, { ...q, orderIndex: i });
    ids.push(id);
  }
  return ids;
}

async function listQuestions(quizId, { includeAnswers = false } = {}) {
  const [rows] = await pool.query(
    `SELECT id, quiz_id, question_text, question_type, options_json, marks, order_index
     ${includeAnswers ? ', correct_answer' : ''}
     FROM quiz_questions WHERE quiz_id = ? ORDER BY order_index ASC`,
    [quizId]
  );
  return rows.map((r) => ({
    ...r,
    options_json: r.options_json ? (typeof r.options_json === 'string' ? JSON.parse(r.options_json) : r.options_json) : null,
  }));
}

async function updateQuestion(id, { questionText, options, correctAnswer, marks }) {
  await pool.query(
    `UPDATE quiz_questions SET
       question_text = COALESCE(?, question_text),
       options_json = COALESCE(?, options_json),
       correct_answer = COALESCE(?, correct_answer),
       marks = COALESCE(?, marks)
     WHERE id = ?`,
    [questionText, options ? JSON.stringify(options) : null, correctAnswer, marks, id]
  );
}

async function removeQuestion(id) {
  await pool.query('DELETE FROM quiz_questions WHERE id = ?', [id]);
}

// --- Attempts ---

async function findActiveAttempt(quizId, studentId) {
  const [rows] = await pool.query(
    `SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? AND status = 'in_progress'`,
    [quizId, studentId]
  );
  return rows[0] || null;
}

async function startAttempt(quizId, studentId) {
  const [result] = await pool.query(
    'INSERT INTO quiz_attempts (quiz_id, student_id) VALUES (?, ?)',
    [quizId, studentId]
  );
  return findAttemptById(result.insertId);
}

async function findAttemptById(id) {
  const [rows] = await pool.query('SELECT * FROM quiz_attempts WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findMyAttempts(quizId, studentId) {
  const [rows] = await pool.query(
    `SELECT * FROM quiz_attempts WHERE quiz_id = ? AND student_id = ? ORDER BY started_at DESC`,
    [quizId, studentId]
  );
  return rows;
}

async function saveAnswer(attemptId, questionId, { studentAnswer, isCorrect, marksAwarded }) {
  await pool.query(
    `INSERT INTO quiz_answers (attempt_id, question_id, student_answer, is_correct, marks_awarded)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE student_answer = VALUES(student_answer),
       is_correct = VALUES(is_correct), marks_awarded = VALUES(marks_awarded)`,
    [attemptId, questionId, studentAnswer, isCorrect, marksAwarded]
  );
}

async function listAnswers(attemptId) {
  const [rows] = await pool.query(
    `SELECT qa.*, qq.question_text, qq.question_type, qq.correct_answer, qq.marks AS max_marks
     FROM quiz_answers qa JOIN quiz_questions qq ON qq.id = qa.question_id
     WHERE qa.attempt_id = ? ORDER BY qq.order_index ASC`,
    [attemptId]
  );
  return rows;
}

async function submitAttempt(attemptId, { score, totalMarks, status }) {
  await pool.query(
    `UPDATE quiz_attempts SET score = ?, total_marks = ?, status = ?, submitted_at = NOW() WHERE id = ?`,
    [score, totalMarks, status, attemptId]
  );
  return findAttemptById(attemptId);
}

async function listAttemptsForQuiz(quizId) {
  const [rows] = await pool.query(
    `SELECT qat.*, u.name AS student_name, u.email AS student_email
     FROM quiz_attempts qat JOIN users u ON u.id = qat.student_id
     WHERE qat.quiz_id = ? AND qat.status != 'in_progress'
     ORDER BY qat.submitted_at DESC`,
    [quizId]
  );
  return rows;
}

// Used to authorize a teacher grading a single subjective answer, and to
// know which attempt it belongs to for the auto-finalize step below.
async function findAnswerWithOwner(answerId) {
  const [rows] = await pool.query(
    `SELECT qa.*, qat.quiz_id, qat.student_id, qat.id AS attempt_id, q.teacher_id
     FROM quiz_answers qa
     JOIN quiz_attempts qat ON qat.id = qa.attempt_id
     JOIN quizzes q ON q.id = qat.quiz_id
     WHERE qa.id = ?`,
    [answerId]
  );
  return rows[0] || null;
}

// A teacher manually scores one short/long answer. Objective answers
// (mcq/true_false) are never touched by this - they're already graded
// automatically at submission time.
async function gradeAnswer(answerId, marksAwarded) {
  await pool.query(
    `UPDATE quiz_answers SET marks_awarded = ?, is_correct = NULL WHERE id = ?`,
    [marksAwarded, answerId]
  );
}

// Once every answer in an attempt has a non-null marks_awarded (all
// objective answers are scored automatically at submit time, so this
// effectively means "every subjective answer has now been graded"),
// sum the scores, mark the attempt evaluated, and return it - otherwise
// return null so the caller knows grading isn't complete yet.
async function finalizeAttemptIfComplete(attemptId) {
  const [rows] = await pool.query(
    'SELECT marks_awarded FROM quiz_answers WHERE attempt_id = ?',
    [attemptId]
  );
  const allGraded = rows.length > 0 && rows.every((r) => r.marks_awarded !== null);
  if (!allGraded) return null;

  const totalScore = rows.reduce((sum, r) => sum + Number(r.marks_awarded), 0);
  await pool.query(
    `UPDATE quiz_attempts SET score = ?, status = 'evaluated' WHERE id = ?`,
    [totalScore, attemptId]
  );
  return findAttemptById(attemptId);
}

module.exports = {
  create,
  findById,
  findForUser,
  publish,
  remove,
  addQuestion,
  addQuestionsBulk,
  listQuestions,
  updateQuestion,
  removeQuestion,
  findActiveAttempt,
  startAttempt,
  findAttemptById,
  findMyAttempts,
  saveAnswer,
  listAnswers,
  submitAttempt,
  listAttemptsForQuiz,
  findAnswerWithOwner,
  gradeAnswer,
  finalizeAttemptIfComplete,
};
