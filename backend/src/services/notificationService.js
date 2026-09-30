const { pool } = require('../config/db');
const notificationModel = require('../models/notificationModel');

// Notifies every student enrolled in a subject - used when a teacher
// uploads a note, publishes a quiz/assignment, or posts an announcement.
async function notifySubjectStudents(subjectId, { type, title, message, link }) {
  const [rows] = await pool.query(
    'SELECT student_id FROM subject_enrollments WHERE subject_id = ?',
    [subjectId]
  );
  const studentIds = rows.map((r) => r.student_id);
  await notificationModel.createForMany(studentIds, { type, title, message, link });
}

async function notifyUser(userId, { type, title, message, link }) {
  await notificationModel.create({ userId, type, title, message, link });
}

module.exports = { notifySubjectStudents, notifyUser };
