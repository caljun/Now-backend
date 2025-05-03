const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, me, updateProfile } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// アップロード先とファイル名の指定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const upload = multer({ storage });

// --- ルート定義 ---
router.post('/register', upload.single('profilePhoto'), register);
router.post('/login', login);
router.get('/me', auth, me);

// ✅ プロフィール編集（名前・写真）
router.put('/update', auth, upload.single('profilePhoto'), updateProfile);

module.exports = router;

