const { pool } = require('../config/db');

// --- Teacher dashboard / analytics ---

async function teacherOverview(teacherId) {
  const [[subjectCount]] = await pool.query(
    'SELECT COUNT(*) AS count FROM subjects WHERE teacher_id = ? AND is_active = 1', [teacherId]
  );
  const [[studentCount]] = await pool.query(
    `SELECT COUNT(DISTINCT e.student_id) AS count
     FROM subject_enrollments e JOIN subjects s ON s.id = e.subject_id
     WHERE s.teacher_id = ?`, [teacherId]
  );
  const [[noteCount]] = await pool.query(
    'SELECT COUNT(*) AS count FROM notes WHERE teacher_id = ?', [teacherId]
  );
  const [[pendingGrading]] = await pool.query(
    `SELECT COUNT(*) AS count FROM assignment_submissions sub
     JOIN assignments a ON a.id = sub.assignment_id
     WHERE a.teacher_id = ? AND sub.status != 'graded'`, [teacherId]
  );

  return {
    subjectCount: subjectCount.count,
    studentCount: studentCount.count,
    noteCount: noteCount.count,
    pendingGrading: pendingGrading.count,
  };
}

// Average assignment score per subject, for a teacher's performance chart.
async function teacherPerformanceBySubject(teacherId) {
  const [rows] = await pool.query(
    `SELECT s.id AS subject_id, s.name AS subject_name,
       ROUND(AVG(sub.marks_obtained / a.max_marks * 100), 1) AS avg_score_percent,
       COUNT(sub.id) AS graded_submissions
     FROM subjects s
     JOIN assignments a ON a.subject_id = s.id
     JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.status = 'graded'
     WHERE s.teacher_id = ?
     GROUP BY s.id, s.name`,
    [teacherId]
  );
  return rows;
}

async function recentStudentActivity(teacherId, limit = 10) {
  const [rows] = await pool.query(
    `(SELECT 'submission' AS activity_type, sub.submitted_at AS occurred_at,
        u.name AS student_name, a.title AS item_title, s.name AS subject_name
      FROM assignment_submissions sub
      JOIN assignments a ON a.id = sub.assignment_id
      JOIN subjects s ON s.id = a.subject_id
      JOIN users u ON u.id = sub.student_id
      WHERE a.teacher_id = ?)
     UNION ALL
     (SELECT 'quiz_attempt' AS activity_type, qat.submitted_at AS occurred_at,
        u.name AS student_name, q.title AS item_title, s.name AS subject_name
      FROM quiz_attempts qat
      JOIN quizzes q ON q.id = qat.quiz_id
      JOIN subjects s ON s.id = q.subject_id
      JOIN users u ON u.id = qat.student_id
      WHERE q.teacher_id = ? AND qat.submitted_at IS NOT NULL)
     ORDER BY occurred_at DESC LIMIT ?`,
    [teacherId, teacherId, Number(limit)]
  );
  return rows;
}

// Per-student breakdown for a specific subject - used on the teacher's
// "Student Analytics" page.
async function studentAnalyticsForSubject(subjectId) {
  const [rows] = await pool.query(
    `SELECT u.id AS student_id, u.name, u.email, u.avatar_url,
       ROUND(AVG(sub.marks_obtained / a.max_marks * 100), 1) AS avg_assignment_percent,
       (SELECT ROUND(AVG(qat.score / qat.total_marks * 100), 1)
          FROM quiz_attempts qat JOIN quizzes q ON q.id = qat.quiz_id
          WHERE q.subject_id = ? AND qat.student_id = u.id AND qat.status = 'evaluated') AS avg_quiz_percent
     FROM subject_enrollments e
     JOIN users u ON u.id = e.student_id
     LEFT JOIN assignment_submissions sub ON sub.student_id = u.id AND sub.status = 'graded'
       AND sub.assignment_id IN (SELECT id FROM assignments WHERE subject_id = ?)
     LEFT JOIN assignments a ON a.id = sub.assignment_id
     WHERE e.subject_id = ?
     GROUP BY u.id, u.name, u.email, u.avatar_url`,
    [subjectId, subjectId, subjectId]
  );
  return rows;
}

// --- Student dashboard ---

async function studentOverview(studentId) {
  const [[assignmentsDue]] = await pool.query(
    `SELECT COUNT(*) AS count FROM assignments a
     WHERE a.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?)
       AND a.due_date > NOW()
       AND a.id NOT IN (SELECT assignment_id FROM assignment_submissions WHERE student_id = ?)`,
    [studentId, studentId]
  );
  const [[upcomingQuizzes]] = await pool.query(
    `SELECT COUNT(*) AS count FROM quizzes q
     WHERE q.subject_id IN (SELECT subject_id FROM subject_enrollments WHERE student_id = ?)
       AND q.is_published = 1
       AND q.id NOT IN (SELECT quiz_id FROM quiz_attempts WHERE student_id = ? AND status != 'in_progress')`,
    [studentId, studentId]
  );
  const [[bookmarkCount]] = await pool.query(
    'SELECT COUNT(*) AS count FROM note_bookmarks WHERE student_id = ?', [studentId]
  );
  const [[avgScore]] = await pool.query(
    `SELECT ROUND(AVG(marks_obtained / max_marks * 100), 1) AS avg
     FROM assignment_submissions sub JOIN assignments a ON a.id = sub.assignment_id
     WHERE sub.student_id = ? AND sub.status = 'graded'`,
    [studentId]
  );

  return {
    assignmentsDue: assignmentsDue.count,
    upcomingQuizzes: upcomingQuizzes.count,
    bookmarkCount: bookmarkCount.count,
    avgAssignmentScore: avgScore.avg,
  };
}

// Score trend over time for the student's performance chart.
async function studentPerformanceTrend(studentId) {
  const [rows] = await pool.query(
    `SELECT a.title, sub.graded_at AS date, ROUND(sub.marks_obtained / a.max_marks * 100, 1) AS score_percent
     FROM assignment_submissions sub JOIN assignments a ON a.id = sub.assignment_id
     WHERE sub.student_id = ? AND sub.status = 'graded'
     ORDER BY sub.graded_at ASC`,
    [studentId]
  );
  return rows;
}

async function studentRecentActivity(studentId, limit = 10) {
  const [rows] = await pool.query(
    `(SELECT 'submission' AS activity_type, sub.submitted_at AS occurred_at, a.title AS item_title
      FROM assignment_submissions sub JOIN assignments a ON a.id = sub.assignment_id
      WHERE sub.student_id = ?)
     UNION ALL
     (SELECT 'quiz_attempt' AS activity_type, qat.submitted_at AS occurred_at, q.title AS item_title
      FROM quiz_attempts qat JOIN quizzes q ON q.id = qat.quiz_id
      WHERE qat.student_id = ? AND qat.submitted_at IS NOT NULL)
     ORDER BY occurred_at DESC LIMIT ?`,
    [studentId, studentId, Number(limit)]
  );
  return rows;
}

module.exports = {
  teacherOverview,
  teacherPerformanceBySubject,
  recentStudentActivity,
  studentAnalyticsForSubject,
  studentOverview,
  studentPerformanceTrend,
  studentRecentActivity,
};
