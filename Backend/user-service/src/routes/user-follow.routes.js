const express = require("express");
const router = express.Router();
const userFollowController = require("../controllers/user-follow.controller");
const verifyJWT = require("../middlewares/verifyJWT");

//Read
router.get("/:userId/followers", userFollowController.getFollowers);
router.get("/:userId/following", userFollowController.getFollowing);
router.get("/:userId/friends", verifyJWT, userFollowController.getFriends);
router.get("/:userIdOrUsername", userFollowController.getPublicUserInfo);

module.exports = router;
