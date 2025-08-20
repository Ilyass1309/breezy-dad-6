// routes/friend-request.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/friend-request.controller');
const verifyJWT = require('../middlewares/verifyJWT');

router.post('/follow/:targetUserId', verifyJWT, controller.followUser);
router.post('/unfollow/:targetUserId', verifyJWT, controller.unfollowUser);


module.exports = router;