const User = require("../models/user.model");
const mongoose = require("mongoose");

// GET /api/users/:userId/followers
exports.getFollowers = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate(
      "followers",
      "username email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ followers: user.followers });
  } catch (error) {
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/users/:userId/following
exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate(
      "following",
      "username email"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ following: user.following });
  } catch (error) {
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/users/:userId/friends
exports.getFriends = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingSet = new Set(user.following.map((id) => id.toString()));
    const mutualFriends = user.followers.filter((followerId) =>
      followingSet.has(followerId.toString())
    );

    return res.status(200).json(mutualFriends);
  } catch (err) {
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPublicUserInfo = async (req, res) => {
  const identifier = req.params.userIdOrUsername;

  try {
    const user = await User.findOne({
      $or: [
        {
          _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null,
        },
        { username: identifier },
      ],
    }); // <-- retire les .populate ici

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const publicInfo = {
      username: user.username,
      id: user._id,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers, // tableau d'ObjectId
      following: user.following,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      joinedAt: user.createdAt,
    };

    return res.status(200).json(publicInfo);
  } catch (err) {
    
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/users/bulk?ids=1,2,3
exports.getUsersBulkMinimal = async (req, res) => {
  const idsParam = req.query.ids;
  if (!idsParam) {
    return res.status(400).json({ message: 'ids query param required' });
  }
  const rawIds = idsParam.split(',').map(s => s.trim()).filter(Boolean);
  const objectIds = rawIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  if (objectIds.length === 0) {
    return res.status(200).json([]);
  }
  try {
    const users = await User.find({ _id: { $in: objectIds } })
      .select('username avatar _id')
      .lean();
    const mapped = users.map(u => ({ id: u._id, username: u.username, avatar: u.avatar }));
    return res.status(200).json(mapped);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};
