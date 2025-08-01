require('dotenv').config({ path: './config.env' });
const { sendOTPSMS } = require('./services/smsService');

async function testOTPSMS() {
  console.log('Testing OTP SMS...');
  
  const phoneNumber = '+919010197771';
  const otp = '123456';
  const purpose = 'registration';
  const userName = 'Test User';
  
  try {
    const result = await sendOTPSMS(phoneNumber, otp, purpose, userName);
    
    if (result.success) {
      console.log('✅ OTP SMS sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Check your phone for the OTP SMS.');
    } else {
      console.log('❌ OTP SMS failed:', result.error);
    }
  } catch (error) {
    console.error('❌ OTP SMS test failed:', error.message);
  }
}

testOTPSMS(); 