require('dotenv').config({ path: './config.env' });
const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function checkPhoneVerification() {
  console.log('Checking phone number verification...');
  
  try {
    // List verified numbers
    const verifiedNumbers = await client.outgoingCallerIds.list();
    
    console.log('\n📱 Verified Phone Numbers:');
    if (verifiedNumbers.length === 0) {
      console.log('❌ No verified phone numbers found!');
      console.log('\nTo verify your phone number:');
      console.log('1. Go to: https://console.twilio.com/');
      console.log('2. Navigate to: Phone Numbers → Manage → Verified Caller IDs');
      console.log('3. Click "Add a new Caller ID"');
      console.log('4. Enter your phone number: +919010197771');
      console.log('5. Twilio will send you a verification SMS');
      console.log('6. Enter the verification code in the console');
    } else {
      verifiedNumbers.forEach(number => {
        console.log(`✅ ${number.phoneNumber} - ${number.friendlyName || 'No name'}`);
      });
    }
    
    // Check if your number is verified
    const yourNumber = '+919010197771';
    const isVerified = verifiedNumbers.some(num => num.phoneNumber === yourNumber);
    
    if (isVerified) {
      console.log(`\n✅ Your number ${yourNumber} is verified!`);
      console.log('If you still didn\'t receive the SMS, check your spam folder.');
    } else {
      console.log(`\n❌ Your number ${yourNumber} is NOT verified!`);
      console.log('Please verify it in the Twilio console first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking verification:', error.message);
  }
}

checkPhoneVerification(); 