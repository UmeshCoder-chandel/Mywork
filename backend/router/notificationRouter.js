import express from "express";
import auth from "../middleware/auth.js";
import {
  listNotifications,
  markRead,
} from "../controller/notificationController.js";

const router = express.Router();
router.use(express.json());

router.get("/", auth, listNotifications);
router.post("/read", auth, markRead);

export default router;

