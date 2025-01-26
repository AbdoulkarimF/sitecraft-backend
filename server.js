const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { limiter, sanitizeInput, requestLogger } = require('./middleware/security');
const apiRoutes = require('./routes/api');

// Configuration
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Configuration CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

// Middleware de parsing du corps de la requête
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de débogage pour voir le corps de la requête
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log('Raw body:', req.body);
  }
  next();
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(limiter);
app.use(compression());
app.use(sanitizeInput);
app.use(requestLogger);

// Routes de l'API
app.use('/api', apiRoutes);

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SiteCraft API is running' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({
    error: 'Une erreur est survenue',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
