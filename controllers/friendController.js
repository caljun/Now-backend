const User = require('../models/user');
const Location = require('../models/Location');

// 関学構内の範囲定義
const isInsideCampus = (lat, lng) => {
  return (
    lat >= 34.788500 && lat <= 34.792500 &&
    lng >= 135.351000 && lng <= 135.357500
  );
};

// ① 友達を追加する処理
exports.addFriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ error: '自分自身を友達に追加することはできません' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: '友達が見つかりません' });

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'すでに友達です' });
    }

    user.friends.push(friendId);
    await user.save();

    res.status(200).json({ message: '友達を追加しました', friendId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達の追加に失敗しました' });
  }
};

// ② 構内にいる友達を返す処理
exports.getFriendsInCampus = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('friends');
    const friendIds = user.friends.map(friend => friend._id);

    const locations = await Location.find({ user: { $in: friendIds } });

    const inCampusFriends = locations
      .filter(loc => isInsideCampus(loc.latitude, loc.longitude))
      .map(loc => loc.user);

    const inCampusUsers = await User.find({ _id: { $in: inCampusFriends } });

    res.json(inCampusUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達の構内確認に失敗しました' });
  }
};

// ③ 友達一覧を返す処理
exports.getFriendsList = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('friends');
    const friends = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name // もしUserモデルに名前フィールドがあれば
    }));

    res.json({ friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達一覧の取得に失敗しました' });
  }
};
