const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addFriend, getFriendsInCampus, getFriendsList } = require('../controllers/friendController');
const {
  addFriend,
  getFriendsInCampus
} = require('../controllers/friendController');

// 友達を追加（認証必要）
router.post('/add', auth, addFriend);

// 構内にいる友達を取得（認証必要）
router.get('/in-campus', auth, getFriendsInCampus);

module.exports = router;
// 新しいルート
router.get('/list', auth, getFriendsList);
