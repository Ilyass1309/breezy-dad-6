const mongoose = require('mongoose');


/**
 * @swagger
 * components:
 *   schemas:
 *     CommentCreate:
 *       type: object
 *       required:
 *         - author
 *         - content
 *       properties:
 *         author:
 *           type: string
 *           format: objectId
 *           description: User ID who wrote the comment
 *         content:
 *           type: string
 *           description: Comment text
 *         parentComment:
 *           type: string
 *           format: objectId
 *           nullable: true
 *           description: Parent comment ID for replies
 *     CommentUpdate:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Updated comment text
 *     CommentResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           example: "60a7c0f4e4b0f9b81d2f4a55"
 *         author:
 *           type: string
 *           format: objectId
 *           example: "607d1f77bcf86cd799439011"
 *         post:
 *           type: string
 *           format: objectId
 *           example: "609b8a4e8a6b5b0015e5fbd1"
 *         content:
 *           type: string
 *           example: "This is a comment."
 *         parentComment:
 *           type: string
 *           format: objectId
 *           nullable: true
 *           example: null
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           example: ["607d1f77bcf86cd799439012"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-01T12:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-01-02T15:30:00Z"
 *
  *     ReplyCreate:
 *       type: object
 *       required:
 *         - author
 *         - content
 *         - parentComment
 *       properties:
 *         author:
 *           type: string
 *           format: objectId
 *           description: User ID who wrote the reply
 *         content:
 *           type: string
 *           description: Reply text
 *         parentComment:
 *           type: string
 *           format: objectId
 *           description: Parent comment ID (must NOT be null)
 *           example: "60a7c0f4e4b0f9b81d2f4a55"
 *     ReplyUpdate:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Updated reply text
 *     ReplyResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/CommentResponse'
 *         - type: object
 *           required:
 *             - parentComment
 *           properties:
 *             parentComment:
 *               type: string
 *               format: objectId
 *               description: Parent comment ID (never null for replies)
 *               example: "60a7c0f4e4b0f9b81d2f4a55"
 */
const CommentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    replyUsername: {type: mongoose.Schema.Types.String, default: null},
    isReply: { type: mongoose.Schema.Types.Boolean, default: null },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Comment', CommentSchema);
