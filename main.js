const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
const app = express();

// MongoDB接続
connectDB();

// uploadsフォルダが存在しない場合は作成
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ミドルウェア
app.use(cors());
app.use(express.json());

// アップロードされた画像の静的ファイル提供
app.use('/uploads', express.static('uploads'));

// ルート定義
app.use('/api/auth', require('./routes/auth'));
app.use('/api/location', require('./routes/location'));
app.use('/api/friends', require('./routes/friend'));
app.use('/api/areas', require('./routes/area'));
app.use('/api/areas/requests', require('./routes/areaRequestRoutes'));

// サーバー起動
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
