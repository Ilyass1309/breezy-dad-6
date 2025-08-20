const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  editedCount: { type: Number, default: 0 },
  lastEditedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
});

module.exports = mongoose.model("Message", messageSchema);
