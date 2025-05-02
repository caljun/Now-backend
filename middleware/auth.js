const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ← これ追加

module.exports = async function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'トークンがありません' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id); // ← 本物のユーザーを取得

    if (!user) {
      return res.status(401).json({ error: 'ユーザーが見つかりません' });
    }

    req.user = user; // ← ここが重要。MongoDBのUserモデルが入る
    next();
  } catch (err) {
    console.error('認証エラー:', err);
    return res.status(401).json({ error: 'トークンが無効です' });
  }
};
