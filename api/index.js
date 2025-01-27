const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    res.json({
      message: 'Welcome to SiteCraft API',
      status: 'online',
      time: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        mongoDbUri: process.env.MONGODB_URI ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};
