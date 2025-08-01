/**
 * Environment Variable Setup Script
 * 
 * This script helps generate a secure JWT secret and set up environment variables
 * for deployment. It creates a config.env file with placeholder values that
 * can be filled in with actual credentials.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a secure random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Create config.env file from .env.example
const setupEnvFile = () => {
  const exampleEnvPath = path.join(__dirname, '..', '.env.example');
  const configEnvPath = path.join(__dirname, '..', 'config.env');
  
  // Check if .env.example exists
  if (!fs.existsSync(exampleEnvPath)) {
    console.error('Error: .env.example file not found!');
    process.exit(1);
  }
  
  // Check if config.env already exists
  if (fs.existsSync(configEnvPath)) {
    console.log('config.env file already exists. Skipping creation.');
    return;
  }
  
  // Read the example env file
  let envContent = fs.readFileSync(exampleEnvPath, 'utf8');
  
  // Replace JWT_SECRET with a generated one
  envContent = envContent.replace(
    'JWT_SECRET=your_jwt_secret_key',
    `JWT_SECRET=${generateJwtSecret()}`
  );
  
  // Write to config.env
  fs.writeFileSync(configEnvPath, envContent);
  console.log('✅ config.env file created successfully with a secure JWT secret.');
  console.log('⚠️  Please update the other environment variables with your actual credentials.');
};

// Run the setup
setupEnvFile();