const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

exports.register = async (req, res) => {
  try {
    console.log('Tentative d\'inscription - Données reçues:', {
      ...req.body,
      password: '[MASQUÉ]'
    });

    const { username, email, password } = req.body;

    // Validation des données
    if (!username || !email || !password) {
      console.log('Données manquantes:', { username, email, password: '***' });
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      console.log('Email déjà utilisé:', email);
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    // Génération du token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('Inscription réussie pour:', email);

    res.status(201).json({
      message: 'Inscription réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Erreur détaillée lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('Tentative de connexion - Email:', req.body.email);
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      console.log('Données manquantes');
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Recherche de l'utilisateur
    const user = await User.findByEmail(email);
    console.log('Utilisateur trouvé:', user ? 'Oui' : 'Non');

    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérification du mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Mot de passe valide:', validPassword ? 'Oui' : 'Non');

    if (!validPassword) {
      console.log('Mot de passe invalide pour:', email);
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Génération du token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    console.log('Connexion réussie pour:', email);

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    console.log('Vérification du token...');
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('Pas de token fourni');
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Format de token invalide');
      return res.status(401).json({ error: 'Format de token invalide' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token décodé:', decoded);

      // Vérifier si l'utilisateur existe toujours
      const user = await User.findById(decoded.userId);
      if (!user) {
        console.log('Utilisateur non trouvé pour le token');
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      req.user = decoded;
      console.log('Token valide pour l\'utilisateur:', decoded.email);
      next();
    } catch (err) {
      console.log('Erreur de vérification du token:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
