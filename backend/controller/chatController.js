import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

export const listConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name profileImage")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profileImage" },
      });
    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");
    res.json({ messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ message: "Receiver required" });
    let conversation =
      (await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
      })) ||
      (await Conversation.create({
        participants: [req.user._id, receiverId],
      }));

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text,
    });
    conversation.lastMessage = message._id;
    await conversation.save();

    await Notification.create({
      user: receiverId,
      sender: req.user._id,
      type: "message",
      message: message._id,
    });
    req.io?.to(String(receiverId)).emit("message", { conversationId: String(conversation._id), message });
    req.io?.to(String(receiverId)).emit("conversation-updated", conversation);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "User required" });
    let conversation =
      (await Conversation.findOne({
        participants: { $all: [req.user._id, userId] },
      })) ||
      (await Conversation.create({
        participants: [req.user._id, userId],
      }));
    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "name profileImage")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profileImage" },
      });
    res.status(201).json({ conversation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessageToConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { text } = req.body;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    const receiverId = conversation.participants.find((p) => String(p) !== String(req.user._id));
    if (!receiverId) return res.status(400).json({ message: "Receiver not found" });
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text,
    });
    conversation.lastMessage = message._id;
    await conversation.save();
    await Notification.create({
      user: receiverId,
      sender: req.user._id,
      type: "message",
      message: message._id,
    });
    req.io?.to(String(receiverId)).emit("message", { conversationId: String(conversation._id), message });
    req.io?.to(String(receiverId)).emit("conversation-updated", conversation);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

