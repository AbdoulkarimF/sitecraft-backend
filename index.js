require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Debug route
app.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      uri: process.env.MONGODB_URI ? 'URI is set' : 'URI is missing',
      connectionState: mongoose.connection.readyState
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      corsOrigin: process.env.CORS_ORIGIN || 'not set',
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API test route is working!' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined');
    }
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('MongoDB Connected Successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
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
  console.error('Error:', err.message);
  res.status(500).json({
    error: true,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export the Express API
module.exports = app;
