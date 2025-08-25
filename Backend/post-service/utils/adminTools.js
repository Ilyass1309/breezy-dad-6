// Outils admin pour likes (post-service)
const mongoose = require('mongoose');
const Post = require('../src/models/Post');

// Forcer le nombre de likes d'un post (pour seed/admin)
async function setLikesCount(postId, count) {
  const fakeLikes = Array.from({ length: count }, () => new mongoose.Types.ObjectId());
  return await Post.findByIdAndUpdate(postId, { likes: fakeLikes }, { new: true });
}

module.exports = { setLikesCount };
