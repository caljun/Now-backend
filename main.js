const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// MongoDB接続
connectDB();

// ミドルウェア
app.use(cors());
app.use(express.json());

// 🔽 ← これを追加
app.use('/uploads', express.static('uploads'));

// ルート定義
app.use('/api/auth', require('./routes/auth'));
app.use('/api/location', require('./routes/location'));
app.use('/api/friends', require('./routes/friend'));
app.use('/api/areas', require('./routes/area'));

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

