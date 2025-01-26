const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route protégée pour tester l'authentification
router.get('/me', authController.verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
