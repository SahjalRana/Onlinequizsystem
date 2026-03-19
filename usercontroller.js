// ═══════════════════════════════════════════════
//  controllers/userController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.avatar, u.achievements, u.created_at,
             COUNT(DISTINCT a.id)          AS total_attempts,
             COALESCE(ROUND(AVG(a.score))) AS avg_score,
             COALESCE(MAX(a.score),0)      AS best_score
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.user.id]);

    if (!rows.length) return res.status(404).json({ success: false, message: 'User not found.' });

    // Achievements details
    const [achRows] = await pool.query(`
      SELECT ac.*, ua.unlocked_at
      FROM achievements ac
      LEFT JOIN user_achievements ua ON ua.achievement_id = ac.id AND ua.user_id = ?
    `, [req.user.id]);

    res.json({ success: true, data: { ...rows[0], achievement_details: achRows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/achievements
const getAchievements = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ac.*, IF(ua.user_id IS NOT NULL, TRUE, FALSE) AS unlocked, ua.unlocked_at
      FROM achievements ac
      LEFT JOIN user_achievements ua ON ua.achievement_id = ac.id AND ua.user_id = ?
      ORDER BY ac.id
    `, [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, getAchievements };