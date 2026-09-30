-- =====================================================================
-- StudyHub AI - MySQL Database Schema
-- =====================================================================
-- Run this file against an empty database:
--   mysql -u root -p studyhub_ai < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS studyhub_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyhub_ai;

-- ---------------------------------------------------------------------
-- USERS
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(120)      NOT NULL,
  email             VARCHAR(191)      NOT NULL UNIQUE,
  password          VARCHAR(255)      NOT NULL,
  role              ENUM('admin','teacher','student') NOT NULL DEFAULT 'student',
  avatar_url        VARCHAR(500)      NULL,
  bio               VARCHAR(500)      NULL,
  is_verified       TINYINT(1)        NOT NULL DEFAULT 0,
  verification_token VARCHAR(255)     NULL,
  reset_token       VARCHAR(255)      NULL,
  reset_token_expires DATETIME        NULL,
  is_active         TINYINT(1)        NOT NULL DEFAULT 1,
  created_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- SUBJECTS
-- ---------------------------------------------------------------------
CREATE TABLE subjects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150)  NOT NULL,
  code          VARCHAR(30)   NOT NULL UNIQUE,
  description   VARCHAR(500)  NULL,
  cover_color   VARCHAR(20)   DEFAULT '#4F46E5',
  teacher_id    INT           NOT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Students enrolled in a subject
CREATE TABLE subject_enrollments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT NOT NULL,
  student_id    INT NOT NULL,
  enrolled_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_enrollment (subject_id, student_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NOTES
-- ---------------------------------------------------------------------
CREATE TABLE notes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT NOT NULL,
  teacher_id    INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   VARCHAR(500) NULL,
  file_url      VARCHAR(500) NOT NULL,
  file_type     VARCHAR(20)  NOT NULL,       -- pdf, docx, pptx, image
  file_size_kb  INT          NULL,
  views_count   INT          NOT NULL DEFAULT 0,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  FULLTEXT idx_notes_search (title, description)
) ENGINE=InnoDB;

CREATE TABLE note_bookmarks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  note_id       INT NOT NULL,
  student_id    INT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_bookmark (note_id, student_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ASSIGNMENTS
-- ---------------------------------------------------------------------
CREATE TABLE assignments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT NOT NULL,
  teacher_id    INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NULL,
  rubric_url    VARCHAR(500) NULL,
  max_marks     INT NOT NULL DEFAULT 100,
  due_date      DATETIME NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assignment_submissions (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id     INT NOT NULL,
  student_id        INT NOT NULL,
  file_url          VARCHAR(500) NOT NULL,
  status            ENUM('submitted','late','graded') NOT NULL DEFAULT 'submitted',
  marks_obtained    DECIMAL(5,2) NULL,
  teacher_feedback  TEXT NULL,
  ai_grammar_score  DECIMAL(5,2) NULL,
  ai_content_score  DECIMAL(5,2) NULL,
  ai_feedback       TEXT NULL,
  submitted_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graded_at         DATETIME NULL,
  UNIQUE KEY uniq_submission (assignment_id, student_id),
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- QUIZZES
-- ---------------------------------------------------------------------
CREATE TABLE quizzes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  subject_id      INT NOT NULL,
  teacher_id      INT NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     VARCHAR(500) NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_ai_generated TINYINT(1) NOT NULL DEFAULT 0,
  is_published    TINYINT(1) NOT NULL DEFAULT 0,
  available_from  DATETIME NULL,
  available_until DATETIME NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_questions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id         INT NOT NULL,
  question_text   TEXT NOT NULL,
  question_type   ENUM('mcq','true_false','short','long') NOT NULL,
  options_json    JSON NULL,          -- for mcq: ["opt1","opt2","opt3","opt4"]
  correct_answer  TEXT NOT NULL,
  marks           INT NOT NULL DEFAULT 1,
  order_index     INT NOT NULL DEFAULT 0,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_attempts (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id         INT NOT NULL,
  student_id      INT NOT NULL,
  score           DECIMAL(6,2) NULL,
  total_marks     DECIMAL(6,2) NULL,
  started_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at    DATETIME NULL,
  status          ENUM('in_progress','submitted','evaluated') NOT NULL DEFAULT 'in_progress',
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE quiz_answers (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  attempt_id      INT NOT NULL,
  question_id     INT NOT NULL,
  student_answer  TEXT NULL,
  is_correct      TINYINT(1) NULL,
  marks_awarded   DECIMAL(5,2) NULL,
  UNIQUE KEY uniq_attempt_question (attempt_id, question_id),
  FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- ANNOUNCEMENTS
-- ---------------------------------------------------------------------
CREATE TABLE announcements (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT NULL,             -- NULL = platform-wide (admin)
  author_id     INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  content       TEXT NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FULLTEXT idx_announce_search (title, content)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  type          VARCHAR(50) NOT NULL,   -- assignment_due, quiz_available, graded, announcement, etc.
  title         VARCHAR(200) NOT NULL,
  message       VARCHAR(500) NOT NULL,
  link          VARCHAR(300) NULL,
  is_read       TINYINT(1) NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- AI FEATURE TABLES
-- ---------------------------------------------------------------------
CREATE TABLE ai_summaries (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  note_id       INT NOT NULL,
  student_id    INT NOT NULL,
  summary       TEXT NOT NULL,
  key_concepts  JSON NULL,
  definitions   JSON NULL,
  formulas      JSON NULL,
  exam_tips     JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ai_chat_sessions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  note_id       INT NOT NULL,
  student_id    INT NOT NULL,
  title         VARCHAR(200) NOT NULL DEFAULT 'New Chat',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ai_chat_messages (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  session_id    INT NOT NULL,
  role          ENUM('user','assistant') NOT NULL,
  content       TEXT NOT NULL,
  sources       JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE ai_doubts (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  student_id          INT NOT NULL,
  question             TEXT NOT NULL,
  simple_explanation   TEXT NULL,
  detailed_explanation TEXT NULL,
  examples             JSON NULL,
  related_topics       JSON NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================================
-- End of schema
-- =====================================================================
