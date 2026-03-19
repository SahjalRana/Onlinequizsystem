// ═══════════════════════════════════════════════
//  controllers/leaderboardController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/leaderboard  (?quiz_id=&category=&limit=20)
const getLeaderboard = async (req, res) => {
  try {
    const { quiz_id, category, limit = 20 } = req.query;
    let conditions = [];
    const params   = [];

    if (quiz_id)  { conditions.push('a.quiz_id = ?');  params.push(quiz_id); }
    if (category) { conditions.push('c.name = ?');      params.push(category); }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Best score per user per quiz
    const [rows] = await pool.query(`
      SELECT
        u.id           AS user_id,
        u.name         AS player_name,
        u.avatar,
        qz.id          AS quiz_id,
        qz.title       AS quiz_title,
        c.name         AS category,
        MAX(a.score)   AS best_score,
        MIN(a.time_taken) AS best_time,
        COUNT(a.id)    AS attempts,
        MAX(a.correct) AS correct,
        MAX(a.total)   AS total
      FROM   attempts a
      JOIN   users      u  ON u.id  = a.user_id
      JOIN   quizzes    qz ON qz.id = a.quiz_id
      JOIN   categories c  ON c.id  = qz.category_id
      ${whereClause}
      GROUP BY u.id, qz.id
      ORDER BY best_score DESC, best_time ASC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leaderboard/global — overall top players by avg score
const getGlobalLeaderboard = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.avatar,
        COUNT(a.id)           AS total_attempts,
        ROUND(AVG(a.score))   AS avg_score,
        MAX(a.score)          AS best_score,
        SUM(a.correct)        AS total_correct,
        SUM(a.total)          AS total_questions
      FROM   users u
      JOIN   attempts a ON a.user_id = u.id
      GROUP BY u.id
      HAVING total_attempts >= 1
      ORDER BY avg_score DESC, best_score DESC
      LIMIT 50
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getLeaderboard, getGlobalLeaderboard };