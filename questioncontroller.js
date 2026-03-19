// ═══════════════════════════════════════════════
//  controllers/questionController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/questions  (with optional ?category=&type=&difficulty=)
const getAllQuestions = async (req, res) => {
  try {
    const { category, type, difficulty, page = 1, limit = 50 } = req.query;
    const conditions = ['q.is_active = 1'];
    const params     = [];

    if (category)   { conditions.push('c.name = ?');          params.push(category); }
    if (type)       { conditions.push('q.type = ?');          params.push(type); }
    if (difficulty) { conditions.push('q.difficulty = ?');    params.push(difficulty); }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    params.push(parseInt(limit), offset);

    const [rows] = await pool.query(`
      SELECT q.*, c.name AS category_name, c.icon AS category_icon,
             u.name AS created_by_name
      FROM   questions q
      JOIN   categories c ON c.id = q.category_id
      LEFT JOIN users u   ON u.id = q.created_by
      WHERE  ${conditions.join(' AND ')}
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, params);

    // Count total for pagination
    const countParams = params.slice(0, -2);
    const [countRows] = await pool.query(`
      SELECT COUNT(*) AS total FROM questions q
      JOIN categories c ON c.id = q.category_id
      WHERE ${conditions.join(' AND ')}
    `, countParams);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRows[0].total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/questions/:id
const getQuestion = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT q.*, c.name AS category_name FROM questions q
      JOIN categories c ON c.id = q.category_id
      WHERE q.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Question not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/questions — admin only
const createQuestion = async (req, res) => {
  const { category_id, type, difficulty, question_text,
          option_a, option_b, option_c, option_d,
          correct_answer, explanation, image_url } = req.body;

  if (!category_id || !type || !question_text || correct_answer === undefined)
    return res.status(400).json({ success: false, message: 'category_id, type, question_text, correct_answer are required.' });

  try {
    const [result] = await pool.query(`
      INSERT INTO questions
        (category_id, type, difficulty, question_text,
         option_a, option_b, option_c, option_d,
         correct_answer, explanation, image_url, created_by)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [category_id, type, difficulty || 'Medium', question_text,
        option_a || null, option_b || null, option_c || null, option_d || null,
        String(correct_answer), explanation || null, image_url || null,
        req.user.id]);

    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Question created.', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/questions/:id — admin only
const updateQuestion = async (req, res) => {
  const fields = ['category_id','type','difficulty','question_text',
                  'option_a','option_b','option_c','option_d',
                  'correct_answer','explanation','image_url','is_active'];
  try {
    const setClauses = fields.filter(f => req.body[f] !== undefined).map(f => `${f} = ?`);
    const values     = fields.filter(f => req.body[f] !== undefined).map(f => req.body[f]);
    if (!setClauses.length) return res.status(400).json({ success: false, message: 'Nothing to update.' });

    values.push(req.params.id);
    await pool.query(`UPDATE questions SET ${setClauses.join(', ')} WHERE id = ?`, values);
    const [rows] = await pool.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Question updated.', data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/questions/:id — admin only
const deleteQuestion = async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion };