const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/", controller.createNotification);
router.get("/", verifyJWT, controller.getUserNotifications);
router.get("/count", verifyJWT, controller.getNotificationCount);
router.delete("/all", verifyJWT, controller.readAllAndDelete);
router.post("/on-post-created", verifyJWT, controller.onPostCreated);
router.patch("/:notificationId", verifyJWT, controller.readAndUpdate);
router.delete("/:notificationId", verifyJWT, controller.readAndDelete);

module.exports = router;
