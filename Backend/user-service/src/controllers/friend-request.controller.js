const User = require('../models/user.model');
const axios = require('axios');

// POST /api/friend-requests/follow/:targetId
exports.followUser = async (req, res) => {
    const followerId = req.userId;
    const targetId = req.params.targetUserId;

    if (followerId === targetId) {
        return res.status(400).json({ message: "You can't follow yourself" });
    }

    try {
    // log removed
    // log removed
    // log removed
    // log removed

        const [follower, target] = await Promise.all([
            User.findById(followerId),
            User.findById(targetId)
        ]);

        if (!follower || !target) {
            // log removed
            return res.status(404).json({ message: "User not found" });
        }

        // Met à jour les relations si non déjà présentes
        if (!target.followers.includes(followerId)) {
            target.followers.push(followerId);
            await target.save();
            // log removed
        }

        if (!follower.following.includes(targetId)) {
            follower.following.push(targetId);
            await follower.save();
            // log removed
        }

        // Crée une notification via notification-service
        try {
            // log removed
            const notifServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
            const notifResponse = await axios.post(
                `${notifServiceUrl.replace(/\/$/, '')}/api/notifications`, {
                    userId: targetId,
                    type: 'follow',
                    content: `${follower.username} is now following you.`,
                    link: `/profile/${followerId}`
                }
            );
            // log removed
        } catch (notifyErr) {
            // log removed
            if (notifyErr.response) {
                // log removed
                // log removed
            }
        }

        return res.status(200).json({ message: "Followed successfully" });

    } catch (err) {
    // log removed
        return res.status(500).json({ message: "Internal server error" });
    }
};


// POST /api/unfollow/:targetUserId
exports.unfollowUser = async (req, res) => {
    const followerId = req.userId;
    const targetUserId = req.params.targetUserId;

    try {
        const [follower, targetUser] = await Promise.all([
            User.findById(followerId),
            User.findById(targetUserId)
        ]);

        if (!follower || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        follower.following = follower.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== followerId);

        await Promise.all([follower.save(), targetUser.save()]);

        return res.status(200).json({ message: "User unfollowed successfully" });
    } catch (err) {
    // log removed
        return res.status(500).json({ message: "Internal server error" });
    }
};

