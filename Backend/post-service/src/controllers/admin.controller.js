const mongoose = require('mongoose');
const Post = require('../models/Post');
const { setLikesCount } = require('../../utils/adminTools');

// POST /api/admin/set-likes
exports.setLikesCount = async (req, res) => {
  try {
    const { postId, count } = req.body;
    if (!postId || typeof count !== 'number') return res.status(400).json({ error: 'postId et count requis' });
    const post = await setLikesCount(postId, count);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true, likes: post.likes.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
