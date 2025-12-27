import express from "express";
import auth from "../middleware/auth.js";
import {
  getProfile,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  suggestUsers,
} from "../controller/socialUserController.js";

const router = express.Router();
router.use(express.json());

router.get("/search", auth, searchUsers);
router.get("/suggestions", auth, suggestUsers);
router.get("/:id", auth, getProfile);
router.post("/:id/follow", auth, followUser);
router.delete("/:id/follow", auth, unfollowUser);
router.get("/:id/followers", auth, getFollowers);
router.get("/:id/following", auth, getFollowing);

export default router;

