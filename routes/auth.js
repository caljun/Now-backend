const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// 新規登録
router.post('/register', register);

// ログイン
router.post('/login', login);

module.exports = router;
