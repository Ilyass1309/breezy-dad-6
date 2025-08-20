const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     PostCreate:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 280
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *     PostUpdate:
 *       type: object
 *       properties:
 *         content:
 *           type: string
 *           maxLength: 280
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *     PostResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           example: "609b8a4e8a6b5b0015e5fbd1"
 *         author:
 *           type: string
 *           format: objectId
 *           example: "607d1f77bcf86cd799439011"
 *         content:
 *           type: string
 *           example: "This is a sample post content."
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["fun", "javascript"]
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           example: ["607d1f77bcf86cd799439012", "607d1f77bcf86cd799439013"]
 *         comments:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           example: []
 *         mediaUrls:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           example: ["https://example.com/image1.jpg"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-02T15:30:00Z"
 */
const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, maxlength: 280, required: true },
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    mediaUrls: [String],
  },
  { timestamps: true }
);

PostSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

PostSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);
