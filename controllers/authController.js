const User = require('../models/user');
const Area = require('../models/Area');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // NowID生成用

// ユーザー登録
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'すでに登録されています' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nowId = uuidv4().slice(0, 8); // 8文字のユニークID生成

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      nowId,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : ''
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profilePhoto: newUser.profilePhoto,
        nowId: newUser.nowId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '登録に失敗しました' });
  }
};

// ログイン
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'メールが見つかりません' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'パスワードが違います' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        nowId: user.nowId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
};

// ログイン中ユーザー情報取得
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('name nowId profilePhoto');
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    const areas = await Area.find({ members: req.user._id }).select('_id name members');
    const areaSummaries = areas.map(area => ({
      _id: area._id,  // ← id → _id に変更
      name: area.name,
      count: area.members.length
    }));

    res.json({ ...user.toObject(), areas: areaSummaries });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
};

// プロフィール更新（名前・画像）
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });

    if (req.body.name) user.name = req.body.name;

    if (req.file) {
      const baseUrl = process.env.BASE_URL || 'https://now-backend-wah5.onrender.com';
      user.profilePhoto = `${baseUrl}/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      message: 'プロフィールを更新しました',
      user: {
        id: user._id,
        name: user.name,
        profilePhoto: user.profilePhoto,
        nowId: user.nowId
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'プロフィール更新に失敗しました' });
  }
};

// Now ID からユーザーIDを取得
exports.getUserByNowId = async (req, res) => {
  const { nowId } = req.params;

  try {
    const user = await User.findOne({ nowId }).select('_id');
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }
    res.json({ id: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ユーザー検索に失敗しました' });
  }
};

