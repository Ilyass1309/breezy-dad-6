// Outils admin pour followers (user-service)
const mongoose = require('mongoose');
const User = require('../src/models/user.model');

// Forcer le nombre d'abonnés (followers) d'un user (pour seed/admin)
async function setFollowersCount(userId, count) {
  const fakeFollowers = Array.from({ length: count }, () => new mongoose.Types.ObjectId());
  return await User.findByIdAndUpdate(userId, { followers: fakeFollowers }, { new: true });
}

module.exports = { setFollowersCount };
