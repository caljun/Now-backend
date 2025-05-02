const express = require('express');
const router = express.Router();
const Area = require('../models/Area');
const auth = require('../middleware/auth'); // トークン認証用ミドルウェア

// エリア作成
router.post('/create', auth, async (req, res) => {
  try {
    const { name, coords } = req.body;

    if (!name || !coords || coords.length < 3) {
      return res.status(400).json({ error: '正しいエリア情報を入力してください' });
    }

    const area = new Area({
      name,
      creator: req.user._id,
      coords,
      members: [req.user._id] // 作成者自身を初期メンバーに含める
    });

    await area.save();
    res.status(201).json({ message: 'エリアを作成しました', area });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

// 自分が所属しているエリア一覧を取得
router.get('/my', auth, async (req, res) => {
    try {
      const areas = await Area.find({ members: req.user._id }).select('name _id');
      res.json(areas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'エリア取得に失敗しました' });
    }
  });
  

module.exports = router;
