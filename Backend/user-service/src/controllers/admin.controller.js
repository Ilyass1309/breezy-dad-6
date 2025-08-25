const mongoose = require('mongoose');
const User = require('../models/user.model');
const { setFollowersCount } = require('../../utils/adminTools');

// POST /api/admin/set-followers
exports.setFollowersCount = async (req, res) => {
  try {
    const { userId, count } = req.body;
    if (!userId || typeof count !== 'number') return res.status(400).json({ error: 'userId et count requis' });
    const user = await setFollowersCount(userId, count);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, followers: user.followers.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
