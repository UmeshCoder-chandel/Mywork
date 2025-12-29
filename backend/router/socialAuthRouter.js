import express from "express";
import auth from "../middleware/auth.js";
import {
  register,
  loginEnhanced,
  logoutEnhanced,
  googleLogin,
  forgotPassword,
  resetPassword,
  currentUser,
  updateProfile,
  changePassword,
  updateAvatar,
  sendOtp,
  verifyOtp,
  verifyEmail,
} from "../controller/authEnhancedController.js";
import { upload } from "../services/uploadService.js";

const router = express.Router();
router.use(express.json());

router.post("/signup", register);
router.post("/login", loginEnhanced);
router.post("/google", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutEnhanced);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);
router.get("/verify-email/:token", verifyEmail);
router.get("/me", auth, currentUser);
router.patch("/me", auth, updateProfile);
router.patch("/password", auth, changePassword);
router.post("/avatar", auth, upload.single("avatar"), updateAvatar);

export default router;

