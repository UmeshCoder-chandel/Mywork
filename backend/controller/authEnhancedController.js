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
    const { name, email, password, profession } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Account already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      name,
      email,
      password: hashed,
      profession,
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      // Fix: Use backend URL for verification endpoint, not frontend
      const backendUrl = process.env.BACKEND_URL || process.env.CLIENT_URL?.replace(':5173', ':3000') || 'http://localhost:3000';
      const verifyUrl = `${backendUrl}/api/social/auth/verify-email/${verificationToken}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to iWorkSocial, ${name || 'User'}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #2563eb; word-break: break-all; font-size: 12px;">${verifyUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">If you did not create this account, you can safely ignore this email.</p>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">This link will expire in 24 hours.</p>
        </div>
      `;
      await sendEmail({ to: email, subject: 'Verify your email - iWorkSocial', html });
      console.log(`✅ Verification email sent to ${email}`);
    } catch (e) {
      console.error('❌ Failed to send verification email:', e.message);
      // If email fails, user still exists but not verified
      // Log the error but don't fail registration
    }

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'idToken required' });
    }
    
    if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here' || process.env.GOOGLE_CLIENT_ID.includes('your_')) {
      console.error('GOOGLE_CLIENT_ID is not set or is using placeholder value');
      return res.status(500).json({ 
        message: 'Google authentication not configured on server',
        hint: 'Please set GOOGLE_CLIENT_ID environment variable on your hosting platform (e.g., Render, Heroku, etc.)'
      });
    }
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    let ticket;
    try {
      ticket = await client.verifyIdToken({ 
        idToken, 
        audience: process.env.GOOGLE_CLIENT_ID 
      });
    } catch (verifyError) {
      console.error('Google token verification failed:', verifyError.message);
      return res.status(401).json({ 
        message: 'Invalid Google token. Please try again.',
        error: verifyError.message 
      });
    }
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: 'Failed to get user info from Google' });
    }
    
    const { email, name, picture } = payload;
    if (!email) {
      return res.status(400).json({ message: 'Google account has no email' });
    }
    
    let user = await User.findOne({ email });
    if (!user) {
      // create a new user with random password
      const randomPass = crypto.randomBytes(16).toString('hex');
      user = await User.create({
        name: name || 'Google User',
        email,
        password: await bcrypt.hash(randomPass, 10),
        profileImage: picture || null,
        emailVerified: true, // Google accounts are already verified
      });
    } else {
      // Update emailVerified if user exists but wasn't verified
      if (!user.emailVerified) {
        user.emailVerified = true;
        await user.save();
      }
    }
    
    const token = signToken(user._id);
    res.cookie('access_token', token, cookieOptions);
    res.json({ 
      user: { ...user.toObject(), password: undefined }, 
      token 
    });
  } catch (error) {
    console.error('Google login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: error.message || 'Google login failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      hint: 'Check server logs for more details. Ensure GOOGLE_CLIENT_ID is set correctly on your hosting platform.'
    });
  }
};

export const loginEnhanced = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+password +emailVerificationToken +emailVerificationExpires +emailVerified");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If logging in with email, require verified email
    if (identifier.includes('@') && !user.emailVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
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

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=invalid_token`);
    }

    const user = await User.findOne({ emailVerificationToken: token }).select(
      '+emailVerificationToken +emailVerificationExpires'
    );
    if (!user) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=invalid_or_expired`);
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires.getTime() < Date.now()) {
      const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=expired`);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Email verified for user: ${user.email}`);
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?verified=true`);
  } catch (error) {
    console.error('❌ Email verification error:', error);
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?error=server_error`);
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
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password for your iWorkSocial account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #2563eb; word-break: break-all; font-size: 12px;">${resetUrl}</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">This link will expire in 1 hour.</p>
      </div>
    `;
    await sendEmail({ to: user.email, subject: 'Reset your password - iWorkSocial', html });
    console.log(`✅ Password reset email sent to ${user.email}`);
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
    const updates = (({ name, bio, location, profession, experience, phone }) => ({
      name,
      bio,
      location,
      profession,
      experience,
      phone,
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

