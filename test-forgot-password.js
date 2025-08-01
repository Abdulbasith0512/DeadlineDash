require('dotenv').config({ path: './config.env' });
const { sendOTPSMS } = require('./services/smsService');

async function testForgotPassword() {
  console.log('Testing Forgot Password functionality...');
  
  const phoneNumber = '+919010197771';
  const otp = '123456';
  const purpose = 'password-reset';
  const userName = 'Test User';
  
  try {
    console.log('📱 Sending password reset OTP...');
    const result = await sendOTPSMS(phoneNumber, otp, purpose, userName);
    
    if (result.success) {
      console.log('✅ Password reset OTP sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Check your phone for the password reset SMS.');
    } else {
      console.log('❌ Password reset OTP failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Forgot password test failed:', error.message);
  }
}

testForgotPassword(); 