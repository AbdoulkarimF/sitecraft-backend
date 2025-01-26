const Site = require('../models/Site');

exports.createSite = async (req, res) => {
  try {
    console.log('Création d\'un nouveau site - Données reçues:', req.body);
    console.log('Utilisateur:', req.user);

    const { name, template = 'default' } = req.body;
    const userId = req.user.userId;

    if (!name) {
      console.log('Erreur: nom du site manquant');
      return res.status(400).json({ error: 'Le nom du site est requis' });
    }

    // Initialiser le contenu par défaut
    const defaultContent = {
      sections: [],
      meta: {
        title: name,
        description: '',
        keywords: ''
      }
    };

    console.log('Création du site avec les paramètres:', {
      userId,
      name,
      template,
      content: defaultContent
    });

    const site = await Site.create({
      userId,
      name,
      template,
      content: defaultContent
    });

    console.log('Site créé avec succès:', site);

    res.status(201).json({
      message: 'Site créé avec succès',
      site
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la création du site:', error);
    res.status(500).json({ error: 'Erreur lors de la création du site' });
  }
};

exports.updateSite = async (req, res) => {
  try {
    console.log('Mise à jour du site - Données reçues:', req.body);
    const { id } = req.params;
    const updates = req.body;

    const site = await Site.findById(id);
    if (!site) {
      console.log('Site non trouvé:', id);
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    if (site.user_id !== req.user.userId) {
      console.log('Accès non autorisé pour l\'utilisateur:', req.user.userId);
      return res.status(403).json({ error: 'Non autorisé' });
    }

    console.log('Mise à jour du site avec les paramètres:', updates);
    const updatedSite = await Site.update({
      id,
      ...updates
    });

    console.log('Site mis à jour avec succès:', updatedSite);
    res.json({
      message: 'Site mis à jour avec succès',
      site: updatedSite
    });
  } catch (error) {
    console.error('Erreur détaillée lors de la mise à jour du site:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du site' });
  }
};

exports.getUserSites = async (req, res) => {
  try {
    console.log('Récupération des sites pour l\'utilisateur:', req.user.userId);
    const userId = req.user.userId;
    const sites = await Site.findByUser(userId);

    console.log('Sites récupérés:', sites.length);
    res.json({ sites });
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération des sites:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des sites' });
  }
};

exports.getSite = async (req, res) => {
  try {
    console.log('Récupération du site:', req.params.id);
    const { id } = req.params;
    const site = await Site.findById(id);

    if (!site) {
      console.log('Site non trouvé:', id);
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    if (site.user_id !== req.user.userId) {
      console.log('Accès non autorisé pour l\'utilisateur:', req.user.userId);
      return res.status(403).json({ error: 'Non autorisé' });
    }

    console.log('Site récupéré avec succès');
    res.json({ site });
  } catch (error) {
    console.error('Erreur détaillée lors de la récupération du site:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du site' });
  }
};
