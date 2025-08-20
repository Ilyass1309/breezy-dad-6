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
        console.log('👉 [followUser] originalUrl:', req.originalUrl);
        console.log('👉 [followUser] params:', req.params);
        console.log('👉 [followUser] followerId:', followerId);
        console.log('👉 [followUser] targetId:', targetId);

        const [follower, target] = await Promise.all([
            User.findById(followerId),
            User.findById(targetId)
        ]);

        if (!follower || !target) {
            console.log('❌ [followUser] Either follower or target user not found');
            return res.status(404).json({ message: "User not found" });
        }

        // Met à jour les relations si non déjà présentes
        if (!target.followers.includes(followerId)) {
            target.followers.push(followerId);
            await target.save();
            console.log('✅ [followUser] Added follower to target');
        }

        if (!follower.following.includes(targetId)) {
            follower.following.push(targetId);
            await follower.save();
            console.log('✅ [followUser] Added target to follower');
        }

        // Crée une notification via notification-service
        try {
            console.log('📡 [followUser] Sending notification to notification-service...');
            const notifResponse = await axios.post('http://notification-service:3004/api/notifications', {
                userId: targetId,
                type: 'follow',
                content: `${follower.username} is now following you.`,
                link: `/profile/${followerId}`
            });
            console.log('✅ [followUser] Notification response:', notifResponse.data);
        } catch (notifyErr) {
            console.error('❌ [followUser] Failed to send follow notification:', notifyErr.message);
            if (notifyErr.response) {
                console.error('🔍 Response data:', notifyErr.response.data);
                console.error('🔍 Status code:', notifyErr.response.status);
            }
        }

        return res.status(200).json({ message: "Followed successfully" });

    } catch (err) {
        console.error("❌ [followUser] Error during follow:", err);
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
        console.error("Error unfollowing user:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

