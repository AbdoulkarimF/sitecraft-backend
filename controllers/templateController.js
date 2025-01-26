const Template = require('../models/Template');

// Templates disponibles
const templates = [
  {
    id: 'default',
    name: 'Template par défaut',
    description: 'Un template moderne et épuré',
    thumbnail: '/templates/default/thumbnail.jpg',
    sections: [
      {
        id: 'hero',
        name: 'En-tête',
        content: {
          title: 'Bienvenue sur mon site',
          subtitle: 'Un site web professionnel et moderne',
          cta: 'En savoir plus'
        }
      },
      {
        id: 'about',
        name: 'À propos',
        content: {
          title: 'À propos',
          text: 'Présentez votre entreprise ou votre projet ici.'
        }
      },
      {
        id: 'contact',
        name: 'Contact',
        content: {
          title: 'Contactez-nous',
          email: 'contact@example.com',
          phone: '+33 1 23 45 67 89'
        }
      }
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Parfait pour les blogueurs et créateurs de contenu',
    thumbnail: '/templates/blog/thumbnail.jpg',
    sections: [
      {
        id: 'header',
        name: 'En-tête',
        content: {
          title: 'Mon Blog',
          description: 'Partagez vos pensées avec le monde'
        }
      },
      {
        id: 'posts',
        name: 'Articles récents',
        content: {
          title: 'Articles récents',
          postsPerPage: 6
        }
      }
    ]
  }
];

exports.getTemplates = async (req, res) => {
  try {
    console.log('Récupération de la liste des templates');
    const templates = await Template.findAll();
    console.log('Templates trouvés:', templates.length);
    res.json({ templates });
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des templates' });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Récupération du template:', id);

    const template = await Template.findById(id);
    if (!template) {
      console.log('Template non trouvé:', id);
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    console.log('Template trouvé:', template.name);
    res.json({ template });
  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du template' });
  }
};
