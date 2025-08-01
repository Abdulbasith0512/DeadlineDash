const crypto = require('crypto');
const OTP = require('../models/OTP');
const { sendOTPSMS } = require('../services/smsService');

// Generate a 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create and save OTP
const createOTP = async (email, purpose = 'registration') => {
  try {
    // Delete any existing unused OTPs for this email and purpose
    await OTP.deleteMany({
      email,
      purpose,
      isUsed: false
    });

    // Generate new OTP
    const otp = generateOTP();
    
    // Create OTP record
    const otpRecord = new OTP({
      email,
      otp,
      purpose,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });

    await otpRecord.save();
    return { success: true, otp };
  } catch (error) {
    console.error('Create OTP error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP via SMS
const sendOTP = async (phoneNumber, purpose = 'registration', userName = 'User') => {
  try {
    // Create OTP
    const otpResult = await createOTP(phoneNumber, purpose);
    if (!otpResult.success) {
      return { success: false, error: otpResult.error };
    }

    // For development, log the OTP to console
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 DEVELOPMENT OTP:', otpResult.otp);
      console.log('📱 Phone:', phoneNumber);
      console.log('👤 User:', userName);
      console.log('🎯 Purpose:', purpose);
    }

    // Send SMS
    const smsResult = await sendOTPSMS(phoneNumber, otpResult.otp, purpose, userName);
    if (!smsResult.success) {
      // If SMS fails, delete the OTP record
      await OTP.deleteOne({ email: phoneNumber, otp: otpResult.otp, purpose });
      return { success: false, error: smsResult.error };
    }

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Send OTP error:', error);
    return { success: false, error: error.message };
  }
};

// Verify OTP
const verifyOTP = async (email, otp, purpose = 'registration') => {
  try {
    const otpRecord = await OTP.findOne({
      email,
      otp,
      purpose,
      isUsed: false
    });

    if (!otpRecord) {
      return { success: false, error: 'Invalid OTP' };
    }

    if (!otpRecord.isValid()) {
      return { success: false, error: 'OTP has expired or is invalid' };
    }

    // Mark OTP as used
    await otpRecord.markAsUsed();

    return { success: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, error: error.message };
  }
};

// Resend OTP
const resendOTP = async (phoneNumber, purpose = 'registration', userName = 'User') => {
  try {
    // Delete any existing unused OTPs
    await OTP.deleteMany({
      email: phoneNumber,
      purpose,
      isUsed: false
    });

    // Send new OTP
    return await sendOTP(phoneNumber, purpose, userName);
  } catch (error) {
    console.error('Resend OTP error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  createOTP,
  sendOTP,
  verifyOTP,
  resendOTP
}; 