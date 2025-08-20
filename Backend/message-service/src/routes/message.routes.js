const express = require("express");
const router = express.Router();
const controller = require("../controllers/message.controller");
const verifyJWT = require("../middlewares/verifyJWT");

router.post("/send", verifyJWT, controller.sendMessage);
router.get("/inbox", verifyJWT, controller.getInbox);
router.get("/conversations/:userId", verifyJWT, controller.getConversations);
router.post(
  "/conversations/:userId/read",
  verifyJWT,
  controller.markConversationAsRead
);
// router.get("/sent", verifyJWT, controller.getSentMessages);
router.get("/:id", verifyJWT, controller.getMessageById);
router.delete("/:id", verifyJWT, controller.deleteMessage);
router.patch("/:id", verifyJWT, controller.editMessage);

module.exports = router;
