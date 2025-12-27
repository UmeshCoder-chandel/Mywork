import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";
import { buildFileUrl } from "../services/uploadService.js";

dotenv.config();

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { sendEmail } from '../services/emailService.js';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_TOKEN, { expiresIn: "7d" });

export const register = async (req, res) => {
  try {
    const { name, email, phone, password, profession } = req.body;

    if (!email && !phone) {
      return res.status(400).json({ message: "Email or phone is required" });
    }
    const existing = await User.findOne({
      $or: [{ email }, { phone }],
    });
    if (existing) {
      return res.status(400).json({ message: "Account already exists" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      profession,
    });
    const token = signToken(user._id);
    res.cookie("access_token", token, cookieOptions);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    if (!email) return res.status(400).json({ message: 'Google account has no email' });
    let user = await User.findOne({ email });
    if (!user) {
      // create a new user with random password
      const randomPass = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || 'Google User',
        email,
        password: await bcrypt.hash(randomPass, 10),
        profileImage: picture || null,
      });
    }
    const token = signToken(user._id);
    res.cookie('access_token', token, cookieOptions);
    res.json({ user: { ...user.toObject(), password: undefined }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginEnhanced = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signToken(user._id);
    res.cookie("access_token", token, cookieOptions);
    res.json({ user: { ...user.toObject(), password: undefined }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const currentUser = async (req, res) => {
  res.json({ user: req.user });
};

export const logoutEnhanced = async (_req, res) => {
  res.clearCookie("access_token", cookieOptions);
  res.json({ message: "Logged out" });
};

export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone required" });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: "New User",
        phone,
        password: await bcrypt.hash(code, 10),
      });
    }
    user.otpCode = code;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return res.status(400).json({ message: "Phone and code required" });
    const user = await User.findOne({ phone }).select("+otpCode +otpExpires");
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not requested" });
    }
    if (user.otpCode !== code) return res.status(400).json({ message: "Invalid code" });
    if (new Date(user.otpExpires).getTime() < Date.now()) return res.status(400).json({ message: "Code expired" });
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_TOKEN, { expiresIn: "7d" });
    res.cookie("access_token", token, cookieOptions);
    res.json({ user: { ...user.toObject(), password: undefined }, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If an account exists, a reset email was sent' });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`;
    await sendEmail({ to: user.email, subject: 'Reset your password', html });
    res.json({ message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and newPassword required' });
    const user = await User.findOne({ resetPasswordToken: token }).select('+resetPasswordExpires +password');
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    if (new Date(user.resetPasswordExpires).getTime() < Date.now()) return res.status(400).json({ message: 'Token expired' });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const authToken = signToken(user._id);
    res.cookie('access_token', authToken, cookieOptions);
    res.json({ message: 'Password reset successful', token: authToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = (({ name, bio, location, profession, experience }) => ({
      name,
      bio,
      location,
      profession,
      experience,
    }))(req.body);
    const cleaned = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    const user = await User.findByIdAndUpdate(req.user._id, cleaned, {
      new: true,
      runValidators: true,
    }).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Current password incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Avatar file required" });
    }
    const avatar = buildFileUrl(req.file.filename);
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: avatar },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

