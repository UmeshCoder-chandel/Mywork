import Story from "../models/Story.js";
import { buildFileUrl } from "../services/uploadService.js";

export const createStory = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Media required" });
    const mediaUrl = buildFileUrl(req.file.filename);
    const story = await Story.create({
      user: req.user._id,
      mediaUrl,
      caption: req.body.caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    res.status(201).json({ story });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listStories = async (_req, res) => {
  try {
    const now = new Date();
    const stories = await Story.find({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .populate("user", "-password");
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

