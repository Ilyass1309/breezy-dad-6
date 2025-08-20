const router = require('express').Router({ mergeParams: true });
const commentController = require('../controllers/comment.controller');
const {validateBodyObjectId, validateUrlObjectId} = require('../middlewares/validateIds');
const verifyJWT = require('../middlewares/verifyJWT')


// Routes for /api/posts/:post_id/comments

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Endpoints to manage comments on posts
 */

/**
 * @swagger
 * tags:
 *   name: Replies
 *   description: Endpoints to manage replies on comments
 */

/**
 * @swagger
 * /api/posts/{post_id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the post
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: Invalid post_id parameter
 *       404:
 *         description: No comments found for this post
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the post
 *     requestBody:
 *       description: Comment to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreate'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: Invalid ObjectId in body or missing required fields
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/posts/{post_id}/comments/{comment_id}:
 *   put:
 *     summary: Update a comment on a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the post
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the comment to update
 *     requestBody:
 *       description: Updated comment content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdate'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentResponse'
 *       400:
 *         description: Invalid ObjectId parameter or missing content
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the post
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the comment to delete
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Comment deleted successfully
 *       400:
 *         description: Invalid ObjectId parameter
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/posts/{post_id}/comments/{comment_id}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the comment
 *     responses:
 *       200:
 *         description: List of replies for the comment
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReplyResponse'
 *       400:
 *         description: Invalid comment_id parameter
 *       404:
 *         description: No replies found for this comment
 *       500:
 *         description: Server error
 *   post:
 *     summary: Add a reply to a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the post
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the parent comment
 *     requestBody:
 *       description: Reply content and author
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - author
 *             properties:
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *                 format: objectId
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReplyResponse'
 *       400:
 *         description: Invalid ObjectId or missing content/author
 *       404:
 *         description: Parent comment not found or cannot reply to a reply
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/posts/{post_id}/comments/{comment_id}/replies/{reply_id}:
 *   put:
 *     summary: Update a reply to a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: path
 *         name: reply_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     requestBody:
 *       description: Updated reply content
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReplyResponse'
 *       400:
 *         description: Missing content or invalid ObjectId
 *       404:
 *         description: Reply not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a reply from a comment
 *     tags: [Replies]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *       - in: path
 *         name: reply_id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *     responses:
 *       200:
 *         description: Reply deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Reply successfully deleted
 *       400:
 *         description: Invalid ObjectId parameter
 *       404:
 *         description: Reply not found
 *       500:
 *         description: Server error
 */

router.get('/',
    [validateUrlObjectId('post_id'),
    verifyJWT],
    commentController.getPostComments);

router.post('/',
    [validateUrlObjectId('post_id'),
    verifyJWT],
    commentController.addCommentToPost);

router.put('/:comment_id',
    [validateUrlObjectId('post_id'),
    validateUrlObjectId('comment_id'),
    verifyJWT],
    commentController.updateCommentFromPost);

router.delete('/:comment_id',
    [validateUrlObjectId('post_id'),
    validateUrlObjectId('comment_id'),
    verifyJWT], 
    commentController.deleteCommentFromPost);


router.get('/:comment_id/replies',
    [validateUrlObjectId('comment_id'),
    verifyJWT],
    commentController.getCommentReplies);

router.get('/:comment_id/repliesCount',
    [validateUrlObjectId('comment_id'),
    verifyJWT],
    commentController.getCommentRepliesCount);

router.post('/:comment_id/replies',
    [validateUrlObjectId('comment_id'),
    verifyJWT],
    commentController.addReplyToComment);

router.put('/:comment_id/replies/:reply_id',
    [validateUrlObjectId('comment_id'),
    validateUrlObjectId('reply_id'),
    verifyJWT],
    commentController.updateReplyFromComment);

router.delete('/:comment_id/replies/:reply_id',
    [validateUrlObjectId('comment_id'),
    validateUrlObjectId('reply_id'),
    verifyJWT],
    commentController.deleteReplyFromComment);

module.exports = router;
