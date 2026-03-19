// ═══════════════════════════════════════════════
//  controllers/categoryController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/categories — all active categories with quiz count
const getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*,
             COUNT(DISTINCT q.id)  AS quiz_count,
             COUNT(DISTINCT qu.id) AS question_count
      FROM   categories c
      LEFT JOIN quizzes   q  ON q.category_id  = c.id AND q.is_active = 1
      LEFT JOIN questions qu ON qu.category_id = c.id AND qu.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/categories/:id
const getCategory = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Category not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/categories — admin only
const createCategory = async (req, res) => {
  const { name, icon, color, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Name is required.' });
  try {
    const [result] = await pool.query(
      'INSERT INTO categories (name, icon, color, description) VALUES (?, ?, ?, ?)',
      [name.trim(), icon || '📚', color || '#4f8ef7', description || '']
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Category created.', data: rows[0] });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Category name already exists.' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/categories/:id — admin only
const updateCategory = async (req, res) => {
  const { name, icon, color, description, is_active } = req.body;
  try {
    await pool.query(
      'UPDATE categories SET name=COALESCE(?,name), icon=COALESCE(?,icon), color=COALESCE(?,color), description=COALESCE(?,description), is_active=COALESCE(?,is_active) WHERE id=?',
      [name, icon, color, description, is_active, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category updated.', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/categories/:id — admin only
const deleteCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory };