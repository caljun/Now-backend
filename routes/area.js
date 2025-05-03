const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const User = require('../models/user');
const auth = require('../middleware/auth');

// エリア作成
router.post('/create', auth, async (req, res) => {
  const { name, coords } = req.body;
  if (!name || !coords || coords.length < 3) {
    return res.status(400).json({ error: '正しいエリア情報を入力してください' });
  }

  const area = new Area({
    name,
    creator: req.user._id,
    coords,
    members: [req.user._id]
  });

  await area.save();
  res.status(201).json(area);
});

// 自分の所属エリア一覧取得
router.get('/my', auth, async (req, res) => {
  const areas = await Area.find({ members: req.user._id }).select('name _id');
  res.json(areas);
});

// エリアに友達を追加
router.post('/:areaId/add-friend', auth, async (req, res) => {
  const { friendNowId } = req.body;
  const area = await Area.findById(req.params.areaId);
  if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

  const friend = await User.findOne({ nowId: friendNowId });
  if (!friend) return res.status(404).json({ error: '友達が見つかりません' });

  if (!area.members.includes(friend._id)) {
    area.members.push(friend._id);
    await area.save();
  }

  res.json({ message: '友達をエリアに追加しました' });
});

// エリア内の友達を取得
router.get('/:areaId/friends-in', auth, async (req, res) => {
  const area = await Area.findById(req.params.areaId).populate('members', 'name email profilePhoto location');
  if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

  const friends = area.members.filter(m => m._id.toString() !== req.user._id.toString());
  res.json(friends);
});

// エリア削除
router.delete('/:areaId', auth, async (req, res) => {
  try {
    const area = await Area.findById(req.params.areaId);
    if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

    // 自分が作成者、または参加者であれば削除可能（必要に応じて制限）
    if (area.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '削除権限がありません' });
    }

    await area.deleteOne();
    res.json({ message: 'エリアを削除しました' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラーで削除できませんでした' });
  }
});

module.exports = router;
