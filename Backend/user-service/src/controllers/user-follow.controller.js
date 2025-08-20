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
    console.error("Error in getFollowers:", error);
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
    console.error("Error in getFollowing:", error);
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
    console.error("Error getting friends:", err);
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
    })
      .populate("followers", "_id")
      .populate("following", "_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const publicInfo = {
      username: user.username,
      id: user._id,
      bio: user.bio,
      avatar: user.avatar,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      joinedAt: user.createdAt,
    };

    return res.status(200).json(publicInfo);
  } catch (err) {
    console.error("Error fetching public user info:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
