const express = require("express");
const router = express.Router();
const userFollowController = require("../controllers/user-follow.controller");
const verifyJWT = require("../middlewares/verifyJWT");

//Read
// Bulk minimal public info (username + avatar)
router.get('/bulk', userFollowController.getUsersBulkMinimal);
router.get("/:userId/followers", userFollowController.getFollowers);
router.get("/:userId/following", userFollowController.getFollowing);
router.get("/:userId/friends", verifyJWT, userFollowController.getFriends);
router.get("/:userIdOrUsername", userFollowController.getPublicUserInfo);

module.exports = router;
