// ═══════════════════════════════════════════════
//  controllers/attemptController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// POST /api/attempts — submit a completed quiz
const submitAttempt = async (req, res) => {
  const { quiz_id, answers, time_taken } = req.body;
  // answers = [{ question_id, selected_answer }]

  if (!quiz_id || !Array.isArray(answers))
    return res.status(400).json({ success: false, message: 'quiz_id and answers[] are required.' });

  try {
    // Fetch quiz questions with correct answers
    const [questions] = await pool.query(`
      SELECT q.id, q.correct_answer, q.type
      FROM quiz_questions qq
      JOIN questions q ON q.id = qq.question_id
      WHERE qq.quiz_id = ?
    `, [quiz_id]);

    if (!questions.length)
      return res.status(404).json({ success: false, message: 'Quiz not found or has no questions.' });

    // Grade answers
    let correct = 0;
    const gradedAnswers = answers.map(a => {
      const q = questions.find(x => x.id === a.question_id);
      if (!q) return { ...a, is_correct: false };
      let isCorrect = false;
      if (q.type === 'fill') {
        isCorrect = String(a.selected_answer).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase();
      } else {
        isCorrect = String(a.selected_answer) === String(q.correct_answer);
      }
      if (isCorrect) correct++;
      return { ...a, is_correct: isCorrect, correct_answer: q.correct_answer };
    });

    const total  = questions.length;
    const wrong  = total - correct;
    const score  = Math.round((correct / total) * 100);

    const [result] = await pool.query(
      'INSERT INTO attempts (user_id, quiz_id, score, correct, wrong, total, time_taken, answers) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id, quiz_id, score, correct, wrong, total, time_taken || 0, JSON.stringify(gradedAnswers)]
    );

    // Check and award achievements
    const unlocked = await checkAchievements(req.user.id, score, time_taken || 0);

    res.status(201).json({
      success:  true,
      message:  'Attempt submitted.',
      data: {
        id: result.insertId,
        score, correct, wrong, total,
        time_taken: time_taken || 0,
        answers: gradedAnswers,
        new_achievements: unlocked
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attempts/history — current user's history
const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(`
      SELECT a.id, a.score, a.correct, a.wrong, a.total, a.time_taken, a.completed_at,
             qz.id AS quiz_id, qz.title AS quiz_title, qz.difficulty,
             c.name AS category_name, c.icon AS category_icon
      FROM   attempts a
      JOIN   quizzes    qz ON qz.id = a.quiz_id
      JOIN   categories c  ON c.id  = qz.category_id
      WHERE  a.user_id = ?
      ORDER BY a.completed_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, parseInt(limit), offset]);

    const [countRow] = await pool.query(
      'SELECT COUNT(*) AS total FROM attempts WHERE user_id = ?', [req.user.id]
    );

    res.json({
      success: true,
      data: rows,
      pagination: { total: countRow[0].total, page: parseInt(page), limit: parseInt(limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attempts/:id — single attempt detail
const getAttempt = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, qz.title AS quiz_title, qz.category_id,
             c.name AS category_name
      FROM   attempts a
      JOIN   quizzes qz ON qz.id = a.quiz_id
      JOIN   categories c ON c.id = qz.category_id
      WHERE  a.id = ? AND a.user_id = ?
    `, [req.params.id, req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attempts/stats — user performance stats
const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [summary] = await pool.query(`
      SELECT
        COUNT(*)                                    AS total_attempts,
        COALESCE(ROUND(AVG(score)),0)               AS avg_score,
        COALESCE(MAX(score),0)                      AS best_score,
        COALESCE(MIN(score),0)                      AS worst_score,
        COALESCE(SUM(correct),0)                    AS total_correct,
        COALESCE(SUM(wrong),0)                      AS total_wrong,
        COALESCE(SUM(time_taken),0)                 AS total_time
      FROM attempts WHERE user_id = ?
    `, [userId]);

    // Per-category breakdown
    const [byCat] = await pool.query(`
      SELECT c.name AS category, c.icon,
             COUNT(*)                    AS attempts,
             ROUND(AVG(a.score))         AS avg_score
      FROM   attempts a
      JOIN   quizzes qz    ON qz.id = a.quiz_id
      JOIN   categories c  ON c.id  = qz.category_id
      WHERE  a.user_id = ?
      GROUP BY c.id
      ORDER BY avg_score DESC
    `, [userId]);

    // Score over time (last 10)
    const [trend] = await pool.query(`
      SELECT a.score, a.completed_at, qz.title AS quiz_title
      FROM   attempts a
      JOIN   quizzes qz ON qz.id = a.quiz_id
      WHERE  a.user_id = ?
      ORDER BY a.completed_at DESC
      LIMIT 10
    `, [userId]);

    res.json({ success: true, data: { summary: summary[0], by_category: byCat, trend: trend.reverse() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Internal: check & award achievements ──────────────────
async function checkAchievements(userId, score, timeTaken) {
  const unlocked = [];

  const [allAttempts] = await pool.query(
    'SELECT score, time_taken FROM attempts WHERE user_id = ?', [userId]
  );
  const [userRow] = await pool.query(
    'SELECT achievements FROM users WHERE id = ?', [userId]
  );
  const existing = JSON.parse(userRow[0]?.achievements || '[]');

  const [achievementDefs] = await pool.query('SELECT * FROM achievements');
  const total      = allAttempts.length;
  const highScores = allAttempts.filter(a => a.score >= 90).length;

  const checks = {
    first:     total >= 1,
    perfect:   score === 100,
    streak3:   total >= 3,
    speedster: timeTaken > 0 && timeTaken < 60,
    scholar:   total >= 5,
    master:    highScores >= 5,
  };

  const newIds = [];
  for (const [slug, met] of Object.entries(checks)) {
    if (met && !existing.includes(slug)) {
      const ach = achievementDefs.find(a => a.slug === slug);
      if (ach) {
        unlocked.push(ach);
        newIds.push(slug);
      }
    }
  }

  if (newIds.length) {
    const merged = JSON.stringify([...existing, ...newIds]);
    await pool.query('UPDATE users SET achievements = ? WHERE id = ?', [merged, userId]);
    // Also insert into user_achievements
    for (const slug of newIds) {
      const ach = achievementDefs.find(a => a.slug === slug);
      if (ach) {
        await pool.query(
          'INSERT IGNORE INTO user_achievements (user_id, achievement_id) VALUES (?,?)',
          [userId, ach.id]
        );
      }
    }
  }

  return unlocked;
}

module.exports = { submitAttempt, getHistory, getAttempt, getStats };