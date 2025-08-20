const Post = require('../models/Post')
const Comment = require('../models/Comment')

module.exports = {
    likePost: async (req, res) => {
        try {
            const post_id = req.params.post_id;
            const user_id = req.userId;

            if (!user_id) {
            return res.status(400).json({ message: 'Could not get user id from token' });
            }

            const post = await Post.findById(post_id).exec();

            if (!post) {
            return res.status(404).json({ message: 'Post not found' });
            }

            if (post.likes.includes(user_id)) {
            return res.status(400).json({ message: 'User has already liked the post' });
            }

            post.likes.push(user_id);

            await post.save();

            return res.status(201).json({ message: 'Like added', success: true });
        } catch (err) {
            return res.status(500).json({ message: 'Unable to like post', details: err.message });
        }
    },

    unlikePost: async (req, res) => {
        try {
            const post_id = req.params.post_id;
            const user_id = req.userId;

            if (!user_id) {
            return res.status(400).json({ message: 'Could not get user id from token' });
            }

            const post = await Post.findById(post_id).exec();

            if (!post) {
            return res.status(404).json({ message: 'Post not found' });
            }

            const hasLiked = post.likes.includes(user_id);

            if (!hasLiked) {
            return res.status(400).json({ message: 'User did not like the post' });
            }

            // Remove like
            post.likes = post.likes.filter((id) => id.toString() !== user_id.toString());

            await post.save();

            return res.status(200).json({ message: 'Like removed', success: true });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Unable to unlike post', details: err.message });
        }
    },


    likeComment: async (req, res) => {
        try {
            const comment_id = req.params.comment_id;
            const user_id = req.userId;

            if (!user_id) {
            return res.status(400).json({ message: 'Could not get user id from token' });
            }

            const comment = await Comment.findById(comment_id).exec();

            if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
            }

            if (comment.likes.includes(user_id)) {
            return res.status(400).json({ message: 'User has already liked the comment' });
            }

            comment.likes.push(user_id);

            await comment.save();

            return res.status(201).json({ message: 'Like added', success: true });
        } catch (err) {
            return res.status(500).json({ message: 'Unable to like comment', details: err.message });
        }
    },

    unlikeComment: async (req, res) => {
        try {
            const comment_id = req.params.comment_id;
            const user_id = req.userId;

            if (!user_id) {
            return res.status(400).json({ message: 'Could not get user id from token' });
            }

            const comment = await Comment.findById(comment_id).exec();

            if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
            }

            const hasLiked = comment.likes.includes(user_id);

            if (!hasLiked) {
            return res.status(400).json({ message: 'User did not like the comment' });
            }

            // Remove like
            comment.likes = comment.likes.filter((id) => id.toString() !== user_id.toString());

            await comment.save();

            return res.status(200).json({ message: 'Like removed', success: true });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Unable to unlike comment', details: err.message });
        }
    }
}