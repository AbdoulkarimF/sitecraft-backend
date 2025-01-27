module.exports = (req, res) => {
  res.json({
    message: 'Hello from SiteCraft API!',
    time: new Date().toISOString()
  });
};
