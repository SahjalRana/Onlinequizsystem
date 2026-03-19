// ═══════════════════════════════════════════════
//  QuizMaster Pro — server.js  (Entry Point)
// ═══════════════════════════════════════════════

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const dotenv   = require('dotenv');

// Load environment variables
dotenv.config();

// Route imports
const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const categoryRoutes    = require('./routes/categoryRoutes');
const questionRoutes    = require('./routes/questionRoutes');
const quizRoutes        = require('./routes/quizRoutes');
const attemptRoutes     = require('./routes/attemptRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const uploadRoutes      = require('./routes/uploadRoutes');

// DB connection test
const { testConnection } = require('./config/db');

const app = express();

// ── Middleware ──
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ──
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/questions',   questionRoutes);
app.use('/api/quizzes',     quizRoutes);
app.use('/api/attempts',    attemptRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/upload',      uploadRoutes);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'QuizMaster Pro API is running', timestamp: new Date() });
});

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ── Start Server ──
const PORT = process.env.PORT || 5000;

async function startServer() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 QuizMaster Pro API running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}@${process.env.DB_HOST}\n`);
  });
}

startServer();