const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SiteCraft API' });
});

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route working!' });
});

// Export for Vercel
module.exports = app;
