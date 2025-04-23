const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ユーザー登録処理
exports.register = async (req, res) => {
  const { name, email, password, profilePhoto } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'すでに登録されています' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      profilePhoto
    });
    await newUser.save();

    res.status(201).json({ message: '登録完了' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '登録に失敗しました' });
  }
};

// ログイン処理
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'メールが見つかりません' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'パスワードが違います' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
};
