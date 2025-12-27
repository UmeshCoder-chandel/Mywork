import express from "express";
import auth from "../middleware/auth.js";
import { createStory, listStories } from "../controller/storyController.js";
import { upload } from "../services/uploadService.js";

const router = express.Router();
router.use(express.json());

router.get("/", auth, listStories);
router.post("/", auth, upload.single("media"), createStory);

export default router;

