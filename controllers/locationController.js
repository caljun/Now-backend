const Location = require('../models/Location');

exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id; // JWTミドルウェアでセットされたユーザーID

  try {
    // すでにある位置情報を更新 or 新規作成
    const location = await Location.findOneAndUpdate(
      { user: userId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: '位置情報を更新しました', location });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '位置情報の更新に失敗しました' });
  }
};
