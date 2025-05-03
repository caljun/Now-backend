const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const User = require('../models/user');
const auth = require('../middleware/auth');
const turf = require('@turf/turf'); // ← 追加（npm install @turf/turf）

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

// ✅ エリア内に“今いる”友達のみを返す
router.get('/:areaId/friends-in', auth, async (req, res) => {
  try {
    const area = await Area.findById(req.params.areaId).populate('members', 'name email profilePhoto location');
    if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

    // turf.js用ポリゴン生成（[lng, lat]順）
    const polygon = turf.polygon([
      area.coords.map(coord => [coord.lng, coord.lat])
    ]);

    const friendsInArea = area.members.filter(member => {
      if (!member.location) return false;
      const point = turf.point([member.location.longitude, member.location.latitude]);
      return turf.booleanPointInPolygon(point, polygon);
    });

    // 自分以外を返す
    const filtered = friendsInArea.filter(m => m._id.toString() !== req.user._id.toString());
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'エリア内友達取得に失敗しました' });
  }
});

// エリア削除
router.delete('/:areaId', auth, async (req, res) => {
  try {
    const area = await Area.findById(req.params.areaId);
    if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

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
