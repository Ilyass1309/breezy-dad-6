const router = require("express").Router();
const postController = require("../controllers/post.controller");
const { validateUrlObjectId } = require("../middlewares/validateIds");
const verifyJWT = require("../middlewares/verifyJWT");

// Routes for /api/posts

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Endpoints to manage posts
 */

/**
 * @swagger
 * /api/posts/{user_id}:
 *   get:
 *     summary: Get all posts by a user
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: User ID
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: No posts found for this user
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a post for a user
 *     tags: [Posts]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       description: Post data to create
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostCreate'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get posts feed from users the given user is subscribed to
 *     tags: [Posts]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posts feed retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostResponse'
 *       204:
 *         description: No content (empty feed)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/posts/{post_id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: Post ID to update
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       description: Data to update the post
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostUpdate'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: post_id
 *         schema:
 *           type: string
 *           format: objectId
 *         required: true
 *         description: Post ID to delete
 *     security:
 *      - bearerAuth: []
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

router.get(
  "/byuser/:user_id",
  [validateUrlObjectId("user_id"), verifyJWT],
  postController.getPostsByUserId
);

router.get("/feed", [verifyJWT], postController.getPostsOfSubscribdedTo);

router.get("/fyp", [verifyJWT], postController.getForYouFeed);

router.post("/", verifyJWT, postController.createPost);

router.put(
  "/:post_id",
  [validateUrlObjectId("post_id"), verifyJWT],
  postController.updatePost
);

router.delete(
  "/:post_id",
  [validateUrlObjectId("post_id"), verifyJWT],
  postController.deletePost
);

router.get(
  "/:post_id",
  [validateUrlObjectId("post_id")],
  postController.getPostById
);

router.get(
  "/search/recent",
  [verifyJWT],
  postController.searchRecentPostsByTag
);
router.get(
  "/search/liked",
  [verifyJWT],
  postController.searchMostLikedPostsByTag
);
router.get(
  "/search/popular",
  [verifyJWT],
  postController.searchPopularPostsByTag
);

module.exports = router;
