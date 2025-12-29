import express from "express";
import auth from "../middleware/auth.js";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  feed,
  getPost,
  getReels,
  likePost,
  listComments,
  postsByUser,
  unlikePost,
  updateCaption,
  searchPosts,
  filterPosts,
} from "../controller/postController.js";
import { upload } from "../services/uploadService.js";

const router = express.Router();
router.use(express.json());

router.get("/feed", auth, feed);
router.get("/reels", auth, getReels);
router.get("/user/:userId", auth, postsByUser);
// Public search & filter (put before :id route)
router.get("/search", searchPosts);
router.get("/filter", filterPosts);
router.get("/:id", auth, getPost);
router.post("/", auth, upload.array("media", 10), createPost);
router.patch("/:id", auth, updateCaption);
router.delete("/:id", auth, deletePost);
router.post("/:id/like", auth, likePost);
router.post("/:id/unlike", auth, unlikePost);
router.get("/:id/comments", auth, listComments);
router.post("/:id/comments", auth, addComment);
router.delete("/:id/comments/:commentId", auth, deleteComment);

export default router;

