const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  addFriend,
  getFriendsList,
  requestFriend,
  getFriendRequests,
  acceptFriend
} = require('../controllers/friendController');

// 友達を追加（認証必要）
router.post('/add', auth, addFriend);

// 友達一覧を取得
router.get('/list', auth, getFriendsList);

// リクエスト送信・取得・承認
router.post('/request', auth, requestFriend);
router.get('/requests', auth, getFriendRequests);
router.post('/accept', auth, acceptFriend);

module.exports = router;
