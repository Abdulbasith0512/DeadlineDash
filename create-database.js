require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pramodhkumar782006:pramodh786@cluster0.a0woy.mongodb.net/deadline-dash?retryWrites=true&w=majority&appName=Cluster0';

async function createDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Get database info
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`📊 Database: ${dbName}`);
    
    // Create a test user to ensure database exists
    const testUser = new User({
      email: 'test@example.com',
      phoneNumber: '+1234567890',
      fullName: 'Test User',
      password: 'testpassword123'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Collections created:');
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Count users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Total users: ${userCount}`);
    
    // Clean up test user
    await User.deleteOne({ email: 'test@example.com' });
    console.log('🧹 Test user cleaned up');
    
    await mongoose.disconnect();
    console.log('\n✅ Database created and ready!');
    console.log('📊 You should now see "deadline-dash" database in MongoDB Compass');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDatabase(); 