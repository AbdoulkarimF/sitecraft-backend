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
    // Return test response
    res.json({
      message: 'API test endpoint is working!',
      env: process.env.NODE_ENV,
      time: new Date().toISOString(),
      mongodb: process.env.MONGODB_URI ? 'URI is configured' : 'URI is missing'
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message
    });
  }
};
