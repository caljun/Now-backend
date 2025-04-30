const Location = require('../models/Location');

// 関学構内判定（長方形エリア）
const isInsideCampus = (lat, lng) => {
  return (
    lat <= 34.7713160 && lat >= 34.7651447 &&
    lng >= 135.3433948 && lng <= 135.3501509
  );
};

exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id; // JWTミドルウェアでセットされたユーザーID

  try {
    // 位置情報の保存 or 更新
    const location = await Location.findOneAndUpdate(
      { user: userId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    const insideCampus = isInsideCampus(latitude, longitude);

    res.status(200).json({
      message: '位置情報を更新しました',
      insideCampus,
      location
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '位置情報の更新に失敗しました' });
  }
};

