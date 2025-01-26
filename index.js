require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Server is running',
    env: {
      nodeEnv: process.env.NODE_ENV,
      mongoDbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      corsOrigin: process.env.CORS_ORIGIN
    }
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Initialize MongoDB connection
connectDB().then(connected => {
  if (!connected) {
    console.log('Failed to connect to MongoDB');
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    error: true,
    message: err.message
  });
});

// Export the Express API
module.exports = app;
