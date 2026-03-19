// ═══════════════════════════════════════════════
//  controllers/uploadController.js
// ═══════════════════════════════════════════════

const path   = require('path');
const multer = require('multer');
const fs     = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter — images only
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extOk   = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk  = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
  else cb(new Error('Only image files are allowed (jpg, png, gif, webp).'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 }
});

// POST /api/upload/image  (multipart form-data, field: "image")
const uploadImage = [
  upload.single('image'),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ success: true, message: 'Image uploaded.', url, filename: req.file.filename });
  }
];

module.exports = { uploadImage };