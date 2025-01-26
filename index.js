require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const siteRoutes = require('./routes/site');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    mongoUri: process.env.MONGODB_URI ? 'MongoDB URI is set' : 'MongoDB URI is missing',
    corsOrigin: process.env.CORS_ORIGIN || 'default cors origin',
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sites', siteRoutes);

// MongoDB connection with better error handling
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    // Don't exit the process, just log the error
    return false;
  }
  return true;
};

// Connect to MongoDB but don't wait for it
connectDB();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

module.exports = app;
