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
  requestPhoneNumber,
  getPhoneRequestStatus,
  approvePhoneRequest,
  denyPhoneRequest,
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
router.post("/:id/phone/request", auth, requestPhoneNumber);
router.get("/:id/phone/status", auth, getPhoneRequestStatus);
router.post("/phone-requests/:requestId/approve", auth, approvePhoneRequest);
router.post("/phone-requests/:requestId/deny", auth, denyPhoneRequest);

export default router;

