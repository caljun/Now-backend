const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addFriend, getFriendsInCampus, getFriendsList, requestFriend, getFriendRequests } = require('../controllers/friendController');

// 友達を追加（認証必要）
router.post('/add', auth, addFriend);

// 構内にいる友達を取得（認証必要）
router.get('/in-campus', auth, getFriendsInCampus);

// 友達一覧を取得（認証確認）
router.get('/list', auth, getFriendsList);

router.post('/request', auth, requestFriend);

router.get('/requests', auth, getFriendRequests);

module.exports = router;
