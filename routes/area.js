const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const User = require('../models/user');
const auth = require('../middleware/auth');
const turf = require('@turf/turf'); // ← 追加（npm install @turf/turf）
const Location = require('../models/Location');

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

router.get('/:areaId/friends-in', auth, async (req, res) => {
  try {
    const area = await Area.findById(req.params.areaId).populate('members', 'name nowId profilePhoto');
    if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

    // === 修正点：座標を閉じる処理 ===
    const rawCoords = area.coords.map(coord => [coord.lng, coord.lat]);
    if (rawCoords.length > 0 && JSON.stringify(rawCoords[0]) !== JSON.stringify(rawCoords[rawCoords.length - 1])) {
      rawCoords.push(rawCoords[0]); // 閉じる
    }
    const polygon = turf.polygon([rawCoords]);

    const locations = await Location.find({
      user: { $in: area.members.map(m => m._id) }
    });

    const result = area.members.map(member => {
      const loc = locations.find(l => l.user.toString() === member._id.toString());
      if (!loc) return null;

      const point = turf.point([loc.longitude, loc.latitude]);
      const isInArea = turf.booleanPointInPolygon(point, polygon);
      if (!isInArea) return null;

      return {
        id: member._id,
        name: member.name,
        nowId: member.nowId,
        profilePhoto: member.profilePhoto,
        latitude: loc.latitude,
        longitude: loc.longitude,
        updatedAt: loc.updatedAt
      };
    }).filter(Boolean);

    res.json({ friends: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'エリア内友達取得に失敗しました' });
  }
});

module.exports = router;