require('dotenv').config({ path: './config.env' });
const { sendSMS } = require('./services/smsService');

// Test Twilio configuration
async function testTwilio() {
  console.log('Testing Twilio configuration...');
  console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '***SET***' : 'NOT SET');
  console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***SET***' : 'NOT SET');
  console.log('TWILIO_PHONE_NUMBER:', process.env.TWILIO_PHONE_NUMBER || 'NOT SET');

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('❌ Twilio credentials not configured!');
    console.log('Please update config.env with your Twilio credentials');
    return;
  }

  // Test phone number (replace with your actual phone number)
  const testPhoneNumber = '+919010197771'; // Your verified phone number
  
  try {
    const result = await sendSMS(testPhoneNumber, 'DeadlineDASH Test: Your SMS configuration is working! 🎉');
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('Check your phone for the test SMS.');
    } else {
      console.log('❌ SMS test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Twilio test failed:', error.message);
    console.log('\nCommon solutions:');
    console.log('1. Check if Twilio credentials are correct');
    console.log('2. Verify the phone number format (+1234567890)');
    console.log('3. Make sure your Twilio account has credits');
    console.log('4. Check if the phone number is verified (for trial accounts)');
  }
}

testTwilio(); 