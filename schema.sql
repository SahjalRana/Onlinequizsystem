-- ═══════════════════════════════════════════════════════════
--  QuizMaster Pro — Database Schema
--  Run this file in MySQL to create all tables
--  Command: mysql -u root -p < schema.sql
-- ═══════════════════════════════════════════════════════════

-- Create and use database
CREATE DATABASE IF NOT EXISTS quizmaster_pro
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quizmaster_pro;

-- ─── USERS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('user','admin') DEFAULT 'user',
  avatar       VARCHAR(255) DEFAULT NULL,
  is_active    BOOLEAN      DEFAULT TRUE,
  achievements JSON         DEFAULT '[]',
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role  (role)
);

-- ─── CATEGORIES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(10)  DEFAULT '📚',
  color       VARCHAR(20)  DEFAULT '#4f8ef7',
  description VARCHAR(255) DEFAULT NULL,
  is_active   BOOLEAN      DEFAULT TRUE,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── QUESTIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  category_id  INT          NOT NULL,
  type         ENUM('mcq','truefalse','fill','image') NOT NULL DEFAULT 'mcq',
  difficulty   ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  question_text TEXT        NOT NULL,
  option_a     VARCHAR(500) DEFAULT NULL,
  option_b     VARCHAR(500) DEFAULT NULL,
  option_c     VARCHAR(500) DEFAULT NULL,
  option_d     VARCHAR(500) DEFAULT NULL,
  correct_answer VARCHAR(500) NOT NULL,   -- index (0-3) for mcq/tf, text for fill
  explanation  TEXT         DEFAULT NULL,
  image_url    VARCHAR(500) DEFAULT NULL,
  is_active    BOOLEAN      DEFAULT TRUE,
  created_by   INT          DEFAULT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category   (category_id),
  INDEX idx_difficulty (difficulty),
  INDEX idx_type       (type)
);

-- ─── QUIZZES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
  id            INT          AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         DEFAULT NULL,
  category_id   INT          NOT NULL,
  difficulty    ENUM('Easy','Medium','Hard') DEFAULT 'Medium',
  time_per_q    INT          DEFAULT 20,   -- seconds per question
  is_active     BOOLEAN      DEFAULT TRUE,
  created_by    INT          DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by)  REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category   (category_id),
  INDEX idx_difficulty (difficulty)
);

-- ─── QUIZ_QUESTIONS (junction) ───────────────────────────
CREATE TABLE IF NOT EXISTS quiz_questions (
  quiz_id     INT NOT NULL,
  question_id INT NOT NULL,
  sort_order  INT DEFAULT 0,
  PRIMARY KEY (quiz_id, question_id),
  FOREIGN KEY (quiz_id)     REFERENCES quizzes(id)   ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- ─── ATTEMPTS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attempts (
  id           INT  AUTO_INCREMENT PRIMARY KEY,
  user_id      INT  NOT NULL,
  quiz_id      INT  NOT NULL,
  score        INT  DEFAULT 0,          -- percentage 0-100
  correct      INT  DEFAULT 0,
  wrong        INT  DEFAULT 0,
  total        INT  DEFAULT 0,
  time_taken   INT  DEFAULT 0,          -- total seconds
  answers      JSON DEFAULT '[]',       -- [{question_id, selected, is_correct}]
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  INDEX idx_user    (user_id),
  INDEX idx_quiz    (quiz_id),
  INDEX idx_score   (score),
  INDEX idx_completed (completed_at)
);

-- ─── ACHIEVEMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  id          INT          AUTO_INCREMENT PRIMARY KEY,
  slug        VARCHAR(50)  NOT NULL UNIQUE,
  name        VARCHAR(100) NOT NULL,
  icon        VARCHAR(10)  DEFAULT '🏅',
  description VARCHAR(255) DEFAULT NULL
);

-- ─── USER_ACHIEVEMENTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id        INT NOT NULL,
  achievement_id INT NOT NULL,
  unlocked_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id)        REFERENCES users(id)        ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- ─── SEED: Default Categories ────────────────────────────
INSERT IGNORE INTO categories (name, icon, color, description) VALUES
  ('General Knowledge', '🌍', '#4f8ef7', 'Facts about the world'),
  ('Science',           '🔬', '#3ecfb2', 'Explore science and nature'),
  ('History',           '🏛️', '#e05c8a', 'Journey through time'),
  ('Current Affairs',   '📰', '#f5a623', 'What is happening now'),
  ('Mathematics',       '📐', '#48c78e', 'Numbers and logic');

-- ─── SEED: Default Achievements ──────────────────────────
INSERT IGNORE INTO achievements (slug, name, icon, description) VALUES
  ('first',      'First Quiz',    '🎯', 'Complete your first quiz'),
  ('perfect',    'Perfect Score', '💯', 'Score 100% on a quiz'),
  ('streak3',    'On a Roll',     '🔥', 'Complete 3 quizzes'),
  ('speedster',  'Speedster',     '⚡', 'Finish a quiz under 60 seconds'),
  ('scholar',    'Scholar',       '📚', 'Complete 5 quizzes'),
  ('master',     'Quiz Master',   '👑', 'Score 90%+ five times');

-- ─── SEED: Admin User (password: admin123) ───────────────
-- bcrypt hash of "admin123"
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Admin', 'admin@quiz.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
   'admin');

-- ─── SEED: Demo User (password: user123) ─────────────────
INSERT IGNORE INTO users (name, email, password, role) VALUES
  ('Demo User', 'user@quiz.com',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   'user');