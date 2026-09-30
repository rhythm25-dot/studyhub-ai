/**
 * StudyHub AI - Seed Script
 * Populates the database with sample users, subjects, and enrollments so
 * you can log in and explore the app immediately after setup.
 *
 * Usage:  npm run seed   (from the backend/ directory, after running schema.sql)
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('../src/config/db');

const DEMO_PASSWORD = 'Password123!';

async function seed() {
  console.log('Seeding StudyHub AI database...\n');
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- Users ---
  const users = [
    { name: 'Alex Morgan', email: 'admin@studyhub.ai', role: 'admin' },
    { name: 'Dr. Priya Sharma', email: 'teacher1@studyhub.ai', role: 'teacher' },
    { name: 'James Whitfield', email: 'teacher2@studyhub.ai', role: 'teacher' },
    { name: 'Sofia Reyes', email: 'student1@studyhub.ai', role: 'student' },
    { name: 'Liam Chen', email: 'student2@studyhub.ai', role: 'student' },
    { name: 'Emma Novak', email: 'student3@studyhub.ai', role: 'student' },
  ];

  const userIds = {};
  for (const u of users) {
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, is_verified, is_active)
       VALUES (?, ?, ?, ?, 1, 1)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [u.name, u.email, hashedPassword, u.role]
    );
    const id = result.insertId || (await pool.query('SELECT id FROM users WHERE email = ?', [u.email]))[0][0].id;
    userIds[u.email] = id;
    console.log(`  User ready: ${u.email} (${u.role})`);
  }

  // --- Subjects ---
  const subjects = [
    { name: 'Data Structures & Algorithms', code: 'CS201', teacher: 'teacher1@studyhub.ai', color: '#4F46E5', description: 'Core data structures, algorithm design, and complexity analysis.' },
    { name: 'Database Management Systems', code: 'CS301', teacher: 'teacher1@studyhub.ai', color: '#059669', description: 'Relational design, SQL, normalization, and transactions.' },
    { name: 'Web Development', code: 'CS250', teacher: 'teacher2@studyhub.ai', color: '#D97706', description: 'Full-stack web development with modern JavaScript frameworks.' },
  ];

  const subjectIds = {};
  for (const s of subjects) {
    const [result] = await pool.query(
      `INSERT INTO subjects (name, code, description, cover_color, teacher_id)
       VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [s.name, s.code, s.description, s.color, userIds[s.teacher]]
    );
    const id = result.insertId || (await pool.query('SELECT id FROM subjects WHERE code = ?', [s.code]))[0][0].id;
    subjectIds[s.code] = id;
    console.log(`  Subject ready: ${s.code} - ${s.name}`);
  }

  // --- Enrollments (all students in all subjects, for easy demoing) ---
  const students = ['student1@studyhub.ai', 'student2@studyhub.ai', 'student3@studyhub.ai'];
  for (const code of Object.keys(subjectIds)) {
    for (const email of students) {
      await pool.query(
        'INSERT IGNORE INTO subject_enrollments (subject_id, student_id) VALUES (?, ?)',
        [subjectIds[code], userIds[email]]
      );
    }
  }
  console.log('  Enrolled all demo students in all demo subjects');

  // --- A platform-wide announcement from the admin ---
  await pool.query(
    `INSERT INTO announcements (subject_id, author_id, title, content)
     VALUES (NULL, ?, ?, ?)`,
    [userIds['admin@studyhub.ai'], 'Welcome to StudyHub AI', 'This is a demo announcement visible to everyone on the platform.']
  );
  console.log('  Added a platform-wide announcement');

  console.log('\nSeed complete! You can log in with any of the emails above.');
  console.log(`Password for every seeded account: ${DEMO_PASSWORD}`);
  console.log('\nNote: Notes, assignments, and quizzes are not seeded because they');
  console.log('require real uploaded files. Log in as a teacher and upload/create');
  console.log('them through the UI to try the AI features end-to-end.');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
