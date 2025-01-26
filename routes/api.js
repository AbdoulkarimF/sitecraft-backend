const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const siteController = require('../controllers/siteController');
const blogController = require('../controllers/blogController');
const templateController = require('../controllers/templateController');

// Routes d'authentification
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authController.verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Routes des templates (pas besoin d'authentification)
router.get('/templates', templateController.getTemplates);
router.get('/templates/:id', templateController.getTemplate);

// Middleware d'authentification pour les routes protégées
router.use(authController.verifyToken);

// Routes des sites (protégées)
router.post('/sites', siteController.createSite);
router.get('/sites', siteController.getUserSites);
router.get('/sites/:id', siteController.getSite);
router.put('/sites/:id', siteController.updateSite);

// Routes des blogs (protégées)
router.post('/posts', blogController.createPost);
router.get('/sites/:siteId/posts', blogController.getSitePosts);
router.get('/posts/:id', blogController.getPost);
router.put('/posts/:id', blogController.updatePost);
router.delete('/posts/:id', blogController.deletePost);

module.exports = router;
