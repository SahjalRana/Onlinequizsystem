// ═══════════════════════════════════════════════
//  middleware/auth.js — JWT Verification
// ═══════════════════════════════════════════════

const jwt       = require('jsonwebtoken');
const { pool }  = require('../config/db');

// Verify JWT token — protects private routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows]  = await pool.query(
      'SELECT id, name, email, role, avatar, achievements FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Admin-only route guard
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
};

// Optional auth — attaches user if token present, doesn't fail if absent
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows]  = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [decoded.id]);
    if (rows.length) req.user = rows[0];
  } catch (_) {}
  next();
};

module.exports = { protect, adminOnly, optionalAuth };