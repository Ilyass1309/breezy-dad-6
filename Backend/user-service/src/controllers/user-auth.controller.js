const User = require("../models/user.model");

// Contrôleur pour /auth-data
exports.getAuthData = async (req, res) => {
  const identifier = req.query.identifier;

  if (!identifier) {
    return res
      .status(400)
      .json({ error: "Missing identifier (email or username)" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      email: user.email,
      username: user.username,
      hashedPassword: user.password,
    });
  } catch (err) {
    console.error("Error in /auth-data:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Contrôleur pour POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newUser = new User({
      username,
      email,
      password,
      role: role || "user",
    });
    await newUser.save();

    return res.status(201).json({
      username: newUser.username,
      userId: newUser._id,
      message: "User created successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ error: `${field} already exists` });
    }

    console.error("Error creating user:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.storeRefreshToken = async (req, res) => {
  const { userId } = req.params;
  const { refreshToken } = req.body;

  console.log(userId);

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  try {
    const user = await User.findById(userId); // 👈 ICI
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({ message: "Refresh token stored" });
  } catch (err) {
    console.error("Failed to store refresh token:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.validateRefreshToken = async (req, res) => {
  const { userId } = req.params;
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refresh token" });
  }

  try {
    const user = await User.findById(userId); // 👈 ICI aussi
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    return res.status(200).json({ message: "Refresh token is valid" });
  } catch (err) {
    console.error("Failed to validate refresh token:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.revokeRefreshToken = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: "Refresh token revoked" });
  } catch (err) {
    console.error("Failed to revoke refresh token:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.isUsernameTaken = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Missing username" });
  }

  try {
    const existingUser = await User.findOne({ username });
    return res.status(200).json({ taken: !!existingUser });
  } catch (err) {
    console.error("Error checking username:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.searchUsersByUsername = async (req, res) => {
  const { query } = req.query;

  if (!query || query.trim() === "") {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const regex = new RegExp(query.trim(), "i");

    console.log("Requête utilisateur :", query);
    const users = await User.find({ username: { $regex: regex } })
      .select("username avatar _id")
      .limit(20);

    console.log("Utilisateurs trouvés :", users.length);

    return res.status(200).json(users);
  } catch (err) {
    console.error("Error searching users:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  const userId = req.userId;
  const { bio, avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { bio, avatar },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
