const Notification = require("../models/notification.model");
const axios = require("axios");

exports.createNotification = async (req, res) => {
  const { userId, type, content, link } = req.body;

  if (!userId || !type || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const notification = new Notification({
      userId,
      type,
      content,
      link: link || "",
    });

    await notification.save();

    return res
      .status(201)
      .json({ message: "Notification created", id: notification._id });
  } catch (err) {
    console.error("Error creating notification:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/notifications/
exports.getUserNotifications = async (req, res) => {
  const userId = req.userId;

  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    }); // les plus récentes d’abord

    return res.status(200).json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/notifications/count
exports.getNotificationCount = async (req, res) => {
  const userId = req.userId;

  try {
    const count = await Notification.countDocuments({ userId });
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error counting notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/notifications/:notificationId
exports.readAndDelete = async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const deleted = await Notification.findByIdAndDelete(notificationId);

    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification read and deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /api/notifications/all/
exports.readAllAndDelete = async (req, res) => {
  const userId = req.userId;

  try {
    const notifications = await Notification.find({ userId });

    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found" });
    }

    await Notification.deleteMany({ userId });

    res.status(200).json({
      message: "All notifications read and deleted",
      deletedCount: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/notifications/onPostCreated
exports.onPostCreated = async (req, res) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ message: "Missing userId or postId" });
  }

  try {
    // Récupérer les followers depuis le user-service
    const response = await axios.get(
      `http://user-service:3001/api/users/${userId}/followers`
    );
    const followers = response.data.followers;

    if (!Array.isArray(followers)) {
      return res
        .status(500)
        .json({ message: "Invalid followers data from user-service" });
    }

    // Créer une notification pour chaque follower
    const notifications = followers.map((followerId) => ({
      userId: followerId,
      type: "friend_post",
      content: `Your friend posted something new.`,
      link: `/posts/${postId}`,
    }));

    await Notification.insertMany(notifications);

    return res.status(201).json({ message: "Notifications sent to followers" });
  } catch (err) {
    console.error("Error in onPostCreated:", err.message);
    return res.status(500).json({ message: "Failed to notify followers" });
  }
};

// PATCH /api/notifications/:notificationId
exports.readAndUpdate = async (req, res) => {
  const notificationId = req.params.notificationId;

  try {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Marquer la notification comme lue
    notification.read = true;
    await notification.save();

    res
      .status(200)
      .json({ message: "Notification read and updated", notification });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
