import express from "express";
import auth from "../middleware/auth.js";
import {
  getMessages,
  listConversations,
  sendMessage,
  createConversation,
  sendMessageToConversation,
} from "../controller/chatController.js";

const router = express.Router();
router.use(express.json());

router.get("/conversations", auth, listConversations);
router.get("/conversations/:id/messages", auth, getMessages);
router.post("/messages", auth, sendMessage);
router.post("/conversations", auth, createConversation);
router.post("/conversations/:id/messages", auth, sendMessageToConversation);

export default router;

