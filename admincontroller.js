// ═══════════════════════════════════════════════
//  controllers/adminController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/admin/dashboard — overview stats
const getDashboard = async (req, res) => {
  try {
    const [[users]]    = await pool.query('SELECT COUNT(*) AS total FROM users');
    const [[quizzes]]  = await pool.query('SELECT COUNT(*) AS total FROM quizzes WHERE is_active=1');
    const [[questions]]= await pool.query('SELECT COUNT(*) AS total FROM questions WHERE is_active=1');
    const [[attempts]] = await pool.query('SELECT COUNT(*) AS total, ROUND(AVG(score)) AS avg_score FROM attempts');

    // Attempts per quiz (top 10)
    const [quizAttempts] = await pool.query(`
      SELECT qz.title, COUNT(a.id) AS count
      FROM quizzes qz LEFT JOIN attempts a ON a.quiz_id = qz.id
      GROUP BY qz.id ORDER BY count DESC LIMIT 10
    `);

    // Score distribution
    const [scoreDistrib] = await pool.query(`
      SELECT
        SUM(score BETWEEN 0  AND 20)  AS s0_20,
        SUM(score BETWEEN 21 AND 40)  AS s21_40,
        SUM(score BETWEEN 41 AND 60)  AS s41_60,
        SUM(score BETWEEN 61 AND 80)  AS s61_80,
        SUM(score BETWEEN 81 AND 100) AS s81_100
      FROM attempts
    `);

    // Recent registrations (last 7 days)
    const [newUsers] = await pool.query(`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at) ORDER BY date ASC
    `);

    res.json({
      success: true,
      data: {
        totals: {
          users:     users.total,
          quizzes:   quizzes.total,
          questions: questions.total,
          attempts:  attempts.total,
          avg_score: attempts.avg_score || 0
        },
        quiz_attempts:    quizAttempts,
        score_distribution: scoreDistrib[0],
        new_users_trend:  newUsers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users — all users with stats
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const like   = `%${search}%`;

    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.achievements,
             COUNT(a.id)          AS total_attempts,
             COALESCE(ROUND(AVG(a.score)),0) AS avg_score
      FROM users u
      LEFT JOIN attempts a ON a.user_id = u.id
      WHERE u.name LIKE ? OR u.email LIKE ?
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [like, like, parseInt(limit), offset]);

    const [[countRow]] = await pool.query(
      'SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ?', [like, like]
    );

    res.json({ success: true, data: rows, pagination: { total: countRow.total, page: parseInt(page) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id — toggle active / change role
const updateUser = async (req, res) => {
  const { is_active, role } = req.body;
  try {
    const updates = [], params = [];
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active); }
    if (role)                    { updates.push('role = ?');      params.push(role); }
    if (!updates.length) return res.status(400).json({ success: false, message: 'Nothing to update.' });

    params.push(req.params.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ success: true, message: 'User updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  if (String(req.params.id) === String(req.user.id))
    return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/attempts — all attempts across all users
const getAllAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await pool.query(`
      SELECT a.id, a.score, a.correct, a.total, a.time_taken, a.completed_at,
             u.name AS user_name, u.email,
             qz.title AS quiz_title, c.name AS category
      FROM   attempts a
      JOIN   users      u  ON u.id  = a.user_id
      JOIN   quizzes    qz ON qz.id = a.quiz_id
      JOIN   categories c  ON c.id  = qz.category_id
      ORDER BY a.completed_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard, getAllUsers, updateUser, deleteUser, getAllAttempts };