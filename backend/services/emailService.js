import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Validate email configuration
const validateEmailConfig = () => {
  const required = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.warn(`⚠️  Email configuration missing: ${missing.join(', ')}`);
    return false;
  }
  return true;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add connection timeout
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter configuration
if (validateEmailConfig()) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email service configuration error:', error.message);
    } else {
      console.log('✅ Email service configured successfully');
    }
  });
} else {
  console.warn('⚠️  Email service not fully configured. Emails may not be sent.');
}

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Check if email is configured
    if (!validateEmailConfig()) {
      console.error('Email not sent: SMTP configuration incomplete');
      throw new Error('Email service not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: text || html?.replace(/<[^>]*>/g, ''), // Fallback to plain text from HTML
      html,
    };

    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
    });
    throw error;
  }
};

export default sendEmail;
