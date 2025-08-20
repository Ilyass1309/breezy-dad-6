const axios = require("axios");
const Message = require("../models/message.model");

exports.sendMessage = async (req, res) => {
  const sender = req.userId;
  const { receiver, content } = req.body;

  if (!receiver || !content) {
    return res
      .status(400)
      .json({ message: "Receiver and content are required" });
  }

  try {
    const message = new Message({ sender, receiver, content });
    await message.save();

    // Appel au service de notification
    await axios.post("http://notification-service:3004/api/notifications", {
      userId: receiver,
      type: "message",
      content: `You received a new message.`,
      link: `/messages/${sender}`,
    });

    // Récupération de l'instance de Socket.IO
    const io = req.app.get("io");

    // Émettre uniquement aux deux participants
    io.to(sender.toString()).emit("newMessage", message);
    io.to(receiver.toString()).emit("newMessage", message);

    res.status(201).json({ message: "Message sent", messageId: message._id });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getInbox = async (req, res) => {
  const userId = req.userId;

  try {
    // Récupérer tous les messages où l'utilisateur est soit l'expéditeur soit le destinataire
    const allMessages = await Message.find({
      $or: [
        { receiver: userId, isDeleted: false },
        { sender: userId, isDeleted: false },
      ],
    })
      .sort({ createdAt: -1 })
      .select("_id sender receiver content createdAt isRead");

    // Grouper par l'autre utilisateur (l'interlocuteur) et ne garder que le dernier message
    const grouped = {};
    allMessages.forEach((msg) => {
      const interlocutor = msg.sender == userId ? msg.receiver : msg.sender;
      if (!grouped[interlocutor]) {
        grouped[interlocutor] = msg; // On garde le premier (le plus récent)
      }
    });

    // Transformer en liste d'objets { user, lastMessage }
    const conversations = Object.entries(grouped).map(
      ([user, lastMessage]) => ({
        user,
        lastMessage,
      })
    );

    return res.status(200).json(conversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteMessage = async (req, res) => {
  const userId = req.userId;
  const messageId = req.params.id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Vérifie si l'utilisateur est l'expéditeur ou le destinataire
    if (message.sender !== userId && message.receiver !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this message" });
    }

    // Suppression physique
    await message.deleteOne();

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting message:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.editMessage = async (req, res) => {
  const userId = req.userId;
  const messageId = req.params.id;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Règle 1 : seul l'expéditeur peut modifier
    if (message.sender !== userId) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this message" });
    }

    // Règle 2 : pas plus de 15 minutes
    const now = new Date();
    const minutesSinceCreated = (now - message.createdAt) / 60000;
    if (minutesSinceCreated > 15) {
      return res
        .status(400)
        .json({ message: "Message can no longer be edited (15 min limit)" });
    }

    // Règle 3 : pas plus de 3 modifications
    if (message.editedCount >= 3) {
      return res
        .status(400)
        .json({ message: "Message edit limit reached (3 times)" });
    }

    // Appliquer la modification
    message.content = content;
    message.editedCount += 1;
    message.lastEditedAt = now;

    await message.save();

    return res.status(200).json({ message: "Message updated successfully" });
  } catch (err) {
    console.error("Error editing message:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMessageById = async (req, res) => {
  const userId = req.userId;
  const messageId = req.params.id;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    // Vérifie si l'utilisateur est l'expéditeur ou le destinataire
    if (message.sender !== userId && message.receiver !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this message" });
    }
    // Marquer le message comme lu si c'est le destinataire
    if (message.receiver === userId && !message.isRead) {
      message.isRead = true;
      await message.save();
    }
    // Retourner directement l'objet message (toObject pour enlever les méthodes Mongoose)
    return res.status(200).json(message.toObject());
  } catch (err) {
    console.error("Error fetching message by ID:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getConversations = async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.userId;

  try {
    // Vérifie si l'utilisateur est l'expéditeur ou le destinataire
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
      isDeleted: false,
    }).sort({ createdAt: -1 }); // Par défaut, tous les champs sont sélectionnés

    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages by user:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.markConversationAsRead = async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.userId;
  try {
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Conversation marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
