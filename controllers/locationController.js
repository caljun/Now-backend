exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    const location = await Location.findOneAndUpdate(
      { user: userId },
      { latitude, longitude, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: '位置情報を更新しました',
      location
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '位置情報の更新に失敗しました' });
  }
};

