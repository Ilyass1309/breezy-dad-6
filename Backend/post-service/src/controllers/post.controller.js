
const Post = require("../models/Post.js");
const mongoose = require("mongoose");
const axios = require("axios");
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

module.exports = {
  getPostsByUserId: async (req, res) => {
    // Controller logic to retrieve posts by user id goes here
    const user_id = req.params.user_id;
    try {
      const posts = await Post.find({ author: user_id })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      if (posts?.length == 0) {
        return res.status(200).json({ message: "No post found for this user" });
      }

      if (posts) {
        return res.status(200).json(posts);
      }

      return res.status(200).json({ message: "No posts found for this user" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve posts", details: err.message });
    }
  },

  getPostsOfSubscribdedTo: async (req, res) => {
    try {
      const user_id = req.userId;

      if (!user_id) {
        return res.status(400).json({ message: "User id is required" });
      }

      const userServiceUrl = process.env.USER_SERVICE_URL;
      const response = await axios.get(
        `${userServiceUrl.replace(/\/$/, '')}/api/users/${user_id}/following`
      );
      const friends_ids = response.data.following;

      if (!friends_ids || friends_ids.length === 0) {
        return res.status(200).json({ feed: [] });
      }

      const feed = await Post.find()
        .where("author")
        .in(friends_ids)
        .lean()
        .exec();

      if (!feed) {
        return res.status(200).json([]);
      }

      return res.status(200).json(feed);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Unable to get user feed", details: err.message });
    }
  },

  createPost: async (req, res) => {
    try {
      const user_id = req.userId;
      const { content, tags, mediaUrls } = req.body;

      // TODO : Check if the author is the same as the logged-in user
      // TODO : Validate the input data

      const newPost = new Post({
        author: user_id,
        content,
        tags,
        mediaUrls,
      });

      const savedPost = await newPost.save();

      // Appel au notification-service
      try {
        const notifServiceUrl = process.env.NOTIFICATION_SERVICE_URL;
        await axios.post(
          `${notifServiceUrl.replace(/\/$/, '')}/api/notifications/on-post-created`,
          {
            userId: user_id, // L'utilisateur qui a créé le post
            postId: savedPost._id,
          }
        );
      } catch (notifyErr) {
        
        // Ne bloque pas la création du post en cas d'erreur de notif
      }

      return res.status(201).json(savedPost);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to create post", details: err.message });
    }
  },

  updatePost: async (req, res) => {
    try {
      const postId = req.userId;

      if (!postId) {
        return res.status(400).json({ message: "Post id is required" });
      }

      const { content, tags, mediaUrls } = req.body;

      const updatedPost = await Post.findByIdAndUpdate(
        new mongoose.Types.ObjectId(postId),
        {
          content,
          tags,
          mediaUrls,
        },
        { new: true }
      )
        .lean()
        .exec();

      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      return res.status(200).json(updatedPost);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to update post", details: err.message });
    }
  },

  deletePost: async (req, res) => {
    try {
      const postId = req.userId;

      if (!postId) {
        return res.status(400).json({ message: "Post id is required" });
      }

      const deletedPost = await Post.findByIdAndDelete(
        new mongoose.Types.ObjectId(postId)
      )
        .lean()
        .exec();

      if (!deletedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      return res.status(204).json({ message: "Post deleted successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to delete post", details: err.message });
    }
  },

  searchRecentPostsByTag: async (req, res) => {
    const { tag } = req.query;
    const limit = parseInt(req.query.limit) || 10; // nombre de posts à afficher
    const skip = parseInt(req.query.skip) || 0; // combien en ignorer

    if (!tag) {
      return res.status(400).json({ message: "Missing tag" });
    }

    try {
      const tagRegex = new RegExp(`^${tag}$`, "i");

      const posts = await Post.find({ tags: tagRegex })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true });

      return res.status(200).json(posts);
    } catch (err) {
      
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  searchMostLikedPostsByTag: async (req, res) => {
    const { tag } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    if (!tag) {
      return res.status(400).json({ message: "Missing tag" });
    }

    try {
      const tagRegex = new RegExp(`^${tag}$`, "i");

      const posts = await Post.aggregate([
        { $match: { tags: tagRegex } },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);

      return res.status(200).json(posts);
    } catch (err) {
      
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  searchPopularPostsByTag: async (req, res) => {
    const { tag } = req.query;
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    if (!tag) {
      return res.status(400).json({ message: "Missing tag" });
    }

    try {
      const tagRegex = new RegExp(`^${tag}$`, "i");
      const now = new Date();

      const posts = await Post.aggregate([
        { $match: { tags: tagRegex } },

        // Ajoute likesCount, commentsCount, age en heures
        {
          $addFields: {
            likesCount: { $size: "$likes" },
            commentsCount: { $size: "$comments" },
            ageInHours: {
              $divide: [{ $subtract: [now, "$createdAt"] }, 1000 * 60 * 60],
            },
          },
        },

        // Calcule un score basé sur ces critères
        {
          $addFields: {
            score: {
              $subtract: [
                {
                  $add: ["$likesCount", { $multiply: [0.5, "$commentsCount"] }],
                },
                { $multiply: [0.3, "$ageInHours"] },
              ],
            },
          },
        },

        { $sort: { score: -1 } },
        { $skip: skip },
        { $limit: limit },
      ]);
      const postIds = posts.map((post) => post._id);
      return res.status(200).json(postIds);
    } catch (err) {
      
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getPostById: async (req, res) => {
    const postId = req.params.post_id;

    if (!postId) {
      return res.status(400).json({ message: "Post ID is required" });
    }

    try {
      const post = await Post.findById(postId).lean().exec();

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      return res.status(200).json(post);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to retrieve post", details: err.message });
    }
  },

  getForYouFeed: async (req, res) => {
    try {
      const user_id = req.userId;
      if (!user_id) {
        return res.status(400).json({ message: "User id is required" });
      }

      // Récupère les abonnements de l'utilisateur
      let followingIds = [];
      try {
        const userServiceUrl = process.env.USER_SERVICE_URL;
        const response = await axios.get(
          `${userServiceUrl.replace(/\/$/, '')}/api/users/${user_id}/following`
        );
        followingIds = response.data.following || [];
      } catch (err) {
        
      }

        // Pagination : page et limit depuis le frontend (par défaut page 1, 8 posts)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const skip = (page - 1) * limit;

        // Récupère tous les posts (hors posts de l'utilisateur) triés par nombre de likes décroissant
        const posts = await Post.aggregate([
          { $match: { author: { $nin: [user_id] } } },
          { $addFields: { likesCount: { $size: "$likes" } } },
          { $sort: { likesCount: -1, createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ]);

      return res.status(200).json(posts);
    } catch (err) {
      
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
