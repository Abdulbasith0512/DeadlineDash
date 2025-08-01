const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS function
const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log('SMS sent successfully:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP SMS
const sendOTPSMS = async (phoneNumber, otp, purpose, userName) => {
  let message;
  
  if (purpose === 'registration') {
    message = `DeadlineDASH OTP: ${otp}

Welcome ${userName}! Use this code to verify your account.`;
  } else if (purpose === 'password-reset') {
    message = `DeadlineDASH Reset: ${otp}

Hello ${userName}! Use this code to reset your password.`;
  }

  console.log('📤 Attempting to send OTP SMS:');
  console.log('📱 To:', phoneNumber);
  console.log('🎯 Purpose:', purpose);
  console.log('👤 User:', userName);
  console.log('🔐 OTP:', otp);

  return await sendSMS(phoneNumber, message);
};

module.exports = {
  sendSMS,
  sendOTPSMS
}; 