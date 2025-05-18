const express = require('express')
const otpController = require('../controllers/otp.controller')

const router = express.Router()

// Send OTP for password reset
router.post('/send', otpController.sendOTP)

// Verify OTP and reset password
router.post('/verify-reset', otpController.verifyOTPAndResetPassword)

// Verify OTP only (without password reset)
router.post('/verify', otpController.verifyOTP)

// Check if user can resend OTP
router.post('/check-resend', otpController.checkResendOTP)

module.exports = router
