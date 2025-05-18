// OTP Service for CupidArrow Dating App
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

// Store OTPs with expiration time (in memory - in production should use Redis or database)
const otpStore = new Map();

// Constants
const OTP_EXPIRY_TIME = 2 * 60 * 1000; // 2 minutes in milliseconds
const OTP_RESEND_TIME = 1 * 60 * 1000; // 1 minute in milliseconds

// Google OAuth2 Client setup
const GOOGLE_MAILER_CLIENT_ID = '138746242252-6ajo686cnpp0kqulhevsutaq4vofp889.apps.googleusercontent.com';
const GOOGLE_MAILER_CLIENT_SECRET = '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';
const GOOGLE_MAILER_REFRESH_TOKEN = '1//04aj5t_YF6qscCgYIARAAGAQSNwF-L9IrISExO_1pGsA0RXVHEeVxWKqGMU81_CtymImV-Y7N6u_9qmF6EV9AkbZnLHR84dLKGB4' // Add your refresh token here
const ADMIN_EMAIL_ADDRESS = 'maiidating.app@gmail.com'

// Initialize OAuth2Client
const myOAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
);

// Set credentials
myOAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN
});

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP with expiration
 * @param {string} email - User email
 * @param {string} otp - Generated OTP
 */
const storeOTP = (email, otp) => {
  const now = Date.now();
  otpStore.set(email, {
    otp,
    expiry: now + OTP_EXPIRY_TIME,
    resendTime: now + OTP_RESEND_TIME
  });
};

/**
 * Verify OTP for a given email
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {boolean} - Whether OTP is valid and not expired
 */
const verifyOTP = (email, otp) => {
  const otpData = otpStore.get(email);
  if (!otpData) {
    return false; // No OTP found for email
  }

  const now = Date.now();
  if (now > otpData.expiry) {
    otpStore.delete(email); // Clear expired OTP
    return false; // OTP expired
  }

  return otpData.otp === otp;
};

/**
 * Check if user can resend OTP
 * @param {string} email - User email
 * @returns {object} - Status and time remaining
 */
const canResendOTP = (email) => {
  const otpData = otpStore.get(email);
  if (!otpData) {
    return { canResend: true, timeRemaining: 0 };
  }

  const now = Date.now();
  const timeRemaining = Math.max(0, otpData.resendTime - now);
  
  return {
    canResend: now >= otpData.resendTime,
    timeRemaining: Math.ceil(timeRemaining / 1000) // Convert to seconds
  };
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @returns {Promise<{ success: boolean, otp?: string, message?: string }>}
 */
const sendOTP = async (email) => {
  try {
    // Check if user can resend OTP
    const resendStatus = canResendOTP(email);
    if (!resendStatus.canResend) {
      return {
        success: false,
        message: `Please wait ${resendStatus.timeRemaining} seconds before requesting another OTP`
      };
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP with expiration
    storeOTP(email, otp);

    // Get fresh access token
    const myAccessTokenObject = await myOAuth2Client.getAccessToken();
    const myAccessToken = myAccessTokenObject?.token;

    if (!myAccessToken) {
      throw new Error('Failed to get access token');
    }

    // Create email transport
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: ADMIN_EMAIL_ADDRESS,
        clientId: GOOGLE_MAILER_CLIENT_ID,
        clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
        refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
        accessToken: myAccessToken
      }
    });

    // Create email content
    const mailOptions = {
      from: `CupidArrow Dating App <${ADMIN_EMAIL_ADDRESS}>`,
      to: email,
      subject: 'Password Reset OTP for CupidArrow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #ff4b6a;">CupidArrow Dating App</h2>
          </div>
          <p>Hello,</p>
          <p>You've requested to reset your password. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="letter-spacing: 5px; margin: 0; color: #ff4b6a;">${otp}</h1>
          </div>
          <p>This OTP will expire in 2 minutes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Thank you,<br>The CupidArrow Team</p>
        </div>
      `
    };

    // Send the email
    await transport.sendMail(mailOptions);

    return {
      success: true,
      message: 'OTP sent successfully',
      otp // Only for development - remove in production
    };
  } catch (error) {
    console.error('OTP email sending error:', error);
    return {
      success: false,
      message: error.message || 'Failed to send OTP'
    };
  }
};

/**
 * Clear OTP after successful verification
 * @param {string} email - User email
 */
const clearOTP = (email) => {
  otpStore.delete(email);
};

module.exports = {
  generateOTP,
  sendOTP,
  verifyOTP,
  canResendOTP,
  clearOTP
};
