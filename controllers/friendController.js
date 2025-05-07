const User = require('../models/user');
const Location = require('../models/Location');

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

// ③ 友達一覧を返す処理
exports.getFriendsList = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('friends');
    const friends = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      nowId: friend.nowId
    }));

    res.json({ friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達一覧の取得に失敗しました' });
  }
};

// ④ 友達リクエストを送る処理
exports.requestFriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  if (userId === friendId) {
    return res.status(400).json({ error: '自分自身にリクエストは送れません' });
  }

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: '友達が見つかりません' });

    // すでにリクエスト済み or 既に友達なら
    if (friend.friendRequests.includes(userId)) {
      return res.status(400).json({ error: 'すでにリクエスト済みです' });
    }
    if (friend.friends.includes(userId)) {
      return res.status(400).json({ error: 'すでに友達です' });
    }

    // 相手のfriendRequestsに自分を追加
    friend.friendRequests.push(userId);
    await friend.save();

    res.status(200).json({ message: '友達リクエストを送りました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達リクエスト送信に失敗しました' });
  }
};

// ⑤ リクエスト一覧を返す処理
exports.getFriendRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).populate('friendRequests', 'name'); 
    const requests = user.friendRequests.map(request => ({
      id: request._id,
      name: request.name
    }));

    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '友達リクエスト一覧の取得に失敗しました' });
  }
};

exports.acceptFriend = async (req, res) => {
  const userId = req.user.id;
  const { friendId } = req.body;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!friend) return res.status(404).json({ error: '相手が見つかりません' });

    // 申請が来ていない相手なら拒否
    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ error: 'そのユーザーからのリクエストは存在しません' });
    }

    // 双方向にfriends追加（まだ追加されていない場合のみ）
    if (!user.friends.includes(friendId)) user.friends.push(friendId);
    if (!friend.friends.includes(userId)) friend.friends.push(userId);

    // リクエストから削除
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId);

    await user.save();
    await friend.save();

    res.status(200).json({ 
      message: '友達リクエストを承認しました' ,
      friendNowId: friend.nowId
  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '承認に失敗しました' });
  }
};

