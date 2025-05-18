const otpService = require('../services/otp.service');
const User = require('../models/User');

/**
 * Send OTP to user's email for password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and message
 */
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Send OTP
    const result = await otpService.sendOTP(email);
    
    if (result.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'OTP sent successfully',
        expiresIn: 120 // 2 minutes in seconds
      });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Verify OTP and reset user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and message
 */
const verifyOTPAndResetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, OTP, and new password are required' 
      });
    }
    
    // Verify OTP
    const isValid = otpService.verifyOTP(email, otp);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
      // Find user and update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Import bcrypt utility
    const { hashPassword } = require('../utils/bcrypt');
    
    // Hash the new password before saving
    user.password = await hashPassword(newPassword);
    await user.save();
    
    // Clear the OTP
    otpService.clearOTP(email);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Password reset successful' 
    });
  } catch (error) {
    console.error('Verify OTP and reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Verify OTP only (without password reset)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and message
 */
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }
    
    // Verify OTP
    const isValid = otpService.verifyOTP(email, otp);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired OTP' 
      });
    }
    
    // OTP is valid, but we don't clear it yet to allow password reset later
    return res.status(200).json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Check if user can resend OTP
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with status and time remaining
 */
const checkResendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    const resendStatus = otpService.canResendOTP(email);
    
    return res.status(200).json({
      success: true,
      canResend: resendStatus.canResend,
      timeRemaining: resendStatus.timeRemaining
    });
  } catch (error) {
    console.error('Check resend OTP error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  sendOTP, 
  verifyOTPAndResetPassword,
  verifyOTP, 
  checkResendOTP
};
