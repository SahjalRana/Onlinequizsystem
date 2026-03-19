// ═══════════════════════════════════════════════
//  controllers/authController.js
// ═══════════════════════════════════════════════

const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const { pool }  = require('../config/db');
const { validationResult } = require('express-validator');

// Helper — generate signed JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── POST /api/auth/register ──────────────────
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    // Check duplicate email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length)
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashed]
    );

    const token = signToken(result.insertId);
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: result.insertId, name: name.trim(), email: email.toLowerCase(), role: 'user' }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ─────────────────────
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, avatar, achievements, is_active FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (!rows.length || !(await bcrypt.compare(password, rows[0].password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    if (!rows[0].is_active)
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact admin.' });

    const { password: _, ...user } = rows[0];
    const token = signToken(user.id);

    res.json({ success: true, message: 'Login successful.', token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ─────────────────────────
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.achievements, u.created_at,
              COUNT(DISTINCT a.id) AS total_attempts,
              COALESCE(ROUND(AVG(a.score)), 0) AS avg_score,
              COALESCE(MAX(a.score), 0) AS best_score
       FROM users u
       LEFT JOIN attempts a ON a.user_id = u.id
       WHERE u.id = ?
       GROUP BY u.id`,
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/update-profile ─────────────
const updateProfile = async (req, res) => {
  const { name, password } = req.body;

  try {
    const updates = [];
    const params  = [];

    if (name && name.trim()) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    if (password) {
      if (password.length < 6)
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
      updates.push('password = ?');
      params.push(await bcrypt.hash(password, 10));
    }

    if (!updates.length)
      return res.status(400).json({ success: false, message: 'Nothing to update.' });

    params.push(req.user.id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [rows] = await pool.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'Profile updated.', user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };