const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // ID du destinataire
    },
    type: {
      type: String,
      required: true,
      enum: [
        "follow", // tu as un nouveau follower
        "message", // tu as reçu un message
        "mention", // tu as été mentionné
        "friend_post", // un ami a publié quelque chose
        "post_reply", // quelqu’un a répondu à ton post
        "comment_reply", // quelqu’un a répondu à ton commentaire
        "comment_post", // quelqu’un a commenté ton post
      ],
    },
    content: {
      type: String,
      required: true, // texte lisible (ex : "Alice t'a envoyé un message")
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
