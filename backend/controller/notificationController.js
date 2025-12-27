import Notification from "../models/Notification.js";

export const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name profileImage")
      .populate("post", "_id desc image");
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

