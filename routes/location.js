const express = require('express');
const router = express.Router();
const { updateLocation } = require('../controllers/locationController');
const auth = require('../middleware/auth');

// POST /api/location に現在地を送信（認証必要）
router.post('/', auth, updateLocation);

module.exports = router;
