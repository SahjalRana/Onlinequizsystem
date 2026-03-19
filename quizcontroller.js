// ═══════════════════════════════════════════════
//  controllers/quizController.js
// ═══════════════════════════════════════════════

const { pool } = require('../config/db');

// GET /api/quizzes  (with optional ?category=&difficulty=)
const getAllQuizzes = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const conditions = ['qz.is_active = 1'];
    const params     = [];

    if (category)   { conditions.push('c.name = ?');        params.push(category); }
    if (difficulty) { conditions.push('qz.difficulty = ?'); params.push(difficulty); }

    const [rows] = await pool.query(`
      SELECT qz.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color,
             COUNT(qq.question_id) AS question_count,
             u.name AS created_by_name
      FROM   quizzes qz
      JOIN   categories c   ON c.id  = qz.category_id
      LEFT JOIN quiz_questions qq ON qq.quiz_id = qz.id
      LEFT JOIN users u     ON u.id  = qz.created_by
      WHERE  ${conditions.join(' AND ')}
      GROUP BY qz.id
      ORDER BY qz.created_at DESC
    `, params);

    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/quizzes/:id  — returns quiz + shuffled questions
const getQuiz = async (req, res) => {
  try {
    const [qzRows] = await pool.query(`
      SELECT qz.*, c.name AS category_name, c.icon AS category_icon
      FROM quizzes qz
      JOIN categories c ON c.id = qz.category_id
      WHERE qz.id = ? AND qz.is_active = 1
    `, [req.params.id]);

    if (!qzRows.length)
      return res.status(404).json({ success: false, message: 'Quiz not found.' });

    const [questions] = await pool.query(`
      SELECT q.id, q.type, q.difficulty, q.question_text,
             q.option_a, q.option_b, q.option_c, q.option_d,
             q.correct_answer, q.explanation, q.image_url
      FROM   quiz_questions qq
      JOIN   questions q ON q.id = qq.question_id AND q.is_active = 1
      WHERE  qq.quiz_id = ?
      ORDER BY RAND()
    `, [req.params.id]);

    // For the player, hide the correct answer (send it but note frontend can strip)
    const quiz = { ...qzRows[0], questions };
    res.json({ success: true, data: quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/quizzes — admin only
const createQuiz = async (req, res) => {
  const { title, description, category_id, difficulty, time_per_q, question_ids } = req.body;
  if (!title || !category_id)
    return res.status(400).json({ success: false, message: 'title and category_id are required.' });
  if (!Array.isArray(question_ids) || !question_ids.length)
    return res.status(400).json({ success: false, message: 'At least one question_id required.' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO quizzes (title, description, category_id, difficulty, time_per_q, created_by) VALUES (?,?,?,?,?,?)',
      [title.trim(), description || '', category_id, difficulty || 'Medium', time_per_q || 20, req.user.id]
    );
    const quizId = result.insertId;
    const vals   = question_ids.map((qid, i) => [quizId, qid, i]);
    await conn.query('INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES ?', [vals]);
    await conn.commit();
    const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    res.status(201).json({ success: true, message: 'Quiz created.', data: rows[0] });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// PUT /api/quizzes/:id — admin only
const updateQuiz = async (req, res) => {
  const { title, description, category_id, difficulty, time_per_q, is_active, question_ids } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `UPDATE quizzes SET
        title       = COALESCE(?,title),
        description = COALESCE(?,description),
        category_id = COALESCE(?,category_id),
        difficulty  = COALESCE(?,difficulty),
        time_per_q  = COALESCE(?,time_per_q),
        is_active   = COALESCE(?,is_active)
       WHERE id = ?`,
      [title, description, category_id, difficulty, time_per_q, is_active, req.params.id]
    );
    if (Array.isArray(question_ids) && question_ids.length) {
      await conn.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [req.params.id]);
      const vals = question_ids.map((qid, i) => [req.params.id, qid, i]);
      await conn.query('INSERT INTO quiz_questions (quiz_id, question_id, sort_order) VALUES ?', [vals]);
    }
    await conn.commit();
    const [rows] = await pool.query('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Quiz updated.', data: rows[0] });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
};

// DELETE /api/quizzes/:id — admin only
const deleteQuiz = async (req, res) => {
  try {
    await pool.query('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Quiz deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz };