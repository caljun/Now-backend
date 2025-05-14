const AreaRequest = require('../models/AreaRequest');
const Area = require('../models/Area');
const User = require('../models/user');

exports.requestAddToArea = async (req, res) => {
  const fromUser = req.user.id;
  const { toUserNowId, areaId } = req.body;

  try {
    const toUser = await User.findOne({ nowId: toUserNowId });
    if (!toUser) return res.status(404).json({ error: '相手ユーザーが見つかりません' });

    const existing = await AreaRequest.findOne({ fromUser, toUser: toUser._id, areaId, status: 'pending' });
    if (existing) return res.status(400).json({ error: 'すでに申請中です' });

    const newRequest = await AreaRequest.create({ fromUser, toUser: toUser._id, areaId });
    res.status(200).json({ message: 'リクエストを送信しました', requestId: newRequest._id });
  } catch (err) {
    console.error('requestAddToArea error:', err);
    res.status(500).json({ error: 'リクエスト作成に失敗しました' });
  }
};

exports.getMyAreaRequests = async (req, res) => {
  try {
    const requests = await AreaRequest.find({ toUser: req.user.id, status: 'pending' })
      .populate('fromUser', 'name')
      .populate('areaId', 'name');

    res.json({
      requests: requests.map(r => ({
        _id: r._id,
        fromUser: r.fromUser,
        area: r.areaId
      }))
    });
  } catch (err) {
    console.error('getMyAreaRequests error:', err);
    res.status(500).json({ error: '取得に失敗しました' });
  }
};

exports.approveAreaRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await AreaRequest.findById(id);
    if (!request || request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ error: '許可されていません' });
    }

    const area = await Area.findById(request.areaId);
    if (!area) return res.status(404).json({ error: 'エリアが見つかりません' });

    if (!area.members.includes(request.fromUser)) {
      area.members.push(request.fromUser);
      await area.save();
    }

    request.status = 'approved';
    await request.save();

    res.json({ message: 'エリアに追加しました' });
  } catch (err) {
    console.error('approveAreaRequest error:', err);
    res.status(500).json({ error: '承認処理に失敗しました' });
  }
};

exports.rejectAreaRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const request = await AreaRequest.findById(id);
    if (!request || request.toUser.toString() !== req.user.id) {
      return res.status(403).json({ error: '許可されていません' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ message: 'リクエストを拒否しました' });
  } catch (err) {
    console.error('rejectAreaRequest error:', err);
    res.status(500).json({ error: '拒否処理に失敗しました' });
  }
};
