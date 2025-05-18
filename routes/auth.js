const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, me, updateProfile, getUserByNowId } = require('../controllers/authController');

// --- ルート定義 ---
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);
router.put('/update', auth, updateProfile);
router.get('/user-by-nowid/:nowId', getUserByNowId);

module.exports = router;

