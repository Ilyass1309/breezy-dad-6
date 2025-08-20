const router = require('express').Router({ mergeParams: true });
const likeController = require('../controllers/like.controller');
const {validateBodyObjectId, validateUrlObjectId} = require('../middlewares/validateIds');
const verifyJWT = require('../middlewares/verifyJWT')

// Routes for /api/posts/:post_id/likes

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: Endpoints to manage likes on posts and comments
 */

/**
 * @swagger
 * /api/posts/{post_id}/likes/like:
 *   post:
 *     summary: Like a post
 *     tags:
 *       - Likes
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to like
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user who likes the post
 *     responses:
 *       201:
 *         description: Like added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like added
 *       400:
 *         description: Bad Request (missing user_id)
 *       500:
 *         description: Internal Server Error
 */

router.post('/posts/:post_id/like',
    [validateUrlObjectId(('post_id')),
    verifyJWT],
    likeController.likePost);

/**
 * @swagger
 * /api/posts/{post_id}/likes/unlike:
 *   post:
 *     summary: Unlike a post
 *     tags:
 *       - Likes
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to unlike
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user who unlikes the post
 *     responses:
 *       200:
 *         description: Like removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like removed
 *       400:
 *         description: Bad Request (missing user_id)
 *       500:
 *         description: Internal Server Error
 */
router.post('/posts/:post_id/unlike',
    [validateUrlObjectId(('post_id')),
    verifyJWT],
    likeController.unlikePost);

router.post('/comments/:comment_id/like',
    [validateUrlObjectId(('comment_id')),
    verifyJWT],
    likeController.likeComment);

/**
 * @swagger
 * /api/posts/{post_id}/likes/unlike:
 *   post:
 *     summary: Unlike a post
 *     tags:
 *       - Likes
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to unlike
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID of the user who unlikes the post
 *     responses:
 *       200:
 *         description: Like removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Like removed
 *       400:
 *         description: Bad Request (missing user_id)
 *       500:
 *         description: Internal Server Error
 */
router.post('/comments/:comment_id/unlike',
    [validateUrlObjectId(('comment_id')),
    verifyJWT],
    likeController.unlikeComment);

module.exports = router;

