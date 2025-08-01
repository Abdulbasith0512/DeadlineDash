require('dotenv').config({ path: './config.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const assignmentRoutes = require('./routes/assignments');
const courseRoutes = require('./routes/courses');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
let mongoServer;

async function connectToDatabase() {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
      // Production: Connect to MongoDB Atlas
      console.log('📊 Connecting to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ Connected to MongoDB Atlas successfully');
    } else {
      // Development: Use in-memory MongoDB server
      console.log('📊 Setting up in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      console.log('📊 Using in-memory MongoDB server at:', mongoUri);
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      console.log('✅ Connected to in-memory MongoDB successfully');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot start production server without MongoDB connection');
      process.exit(1);
    } else {
      console.log('⚠️ Continuing without MongoDB connection. Some features may not work.');
    }
  }
}

// Connect to database
connectToDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/courses', courseRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/assignments', (req, res) => {
  res.sendFile(path.join(__dirname, 'assignments.html'));
});

app.get('/courses', (req, res) => {
  res.sendFile(path.join(__dirname, 'courses.html'));
});

app.get('/calendar', (req, res) => {
  res.sendFile(path.join(__dirname, 'calendar.html'));
});

app.get('/statistics', (req, res) => {
  res.sendFile(path.join(__dirname, 'statistics.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'settings.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  
  // Close the Express server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close MongoDB connection
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
  
  // Stop the in-memory MongoDB server if it exists (development only)
  if (mongoServer && process.env.NODE_ENV !== 'production') {
    await mongoServer.stop();
    console.log('MongoDB memory server stopped');
  }
  
  process.exit(0);
});