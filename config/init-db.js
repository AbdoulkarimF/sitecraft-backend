const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, '../database/sitecraft.db'));

// Création des tables
db.serialize(async () => {
  // Table utilisateurs
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table templates
  db.run(`CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category TEXT,
    content TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Table sites
  db.run(`CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    template TEXT DEFAULT 'default',
    content TEXT DEFAULT '{"sections":[]}',
    domain TEXT UNIQUE,
    analytics_id TEXT,
    seo_description TEXT,
    seo_keywords TEXT,
    published BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (template) REFERENCES templates (id)
  )`);

  // Table composants
  db.run(`CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    content TEXT DEFAULT '{}',
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
  )`);

  // Table articles de blog
  db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'draft',
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
  )`);

  // Table médias
  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    site_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites (id) ON DELETE CASCADE
  )`);

  // Insertion des templates par défaut
  const defaultTemplates = [
    {
      id: 'default',
      name: 'Template par défaut',
      description: 'Un template moderne et épuré',
      thumbnail: '/templates/default/thumbnail.jpg',
      category: 'general',
      content: JSON.stringify({
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
      })
    },
    {
      id: 'blog',
      name: 'Blog',
      description: 'Parfait pour les blogueurs et créateurs de contenu',
      thumbnail: '/templates/blog/thumbnail.jpg',
      category: 'blog',
      content: JSON.stringify({
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
      })
    }
  ];

  // Suppression des données existantes
  db.run('DELETE FROM sites');
  db.run('DELETE FROM users');
  db.run('DELETE FROM templates');
  
  // Réinitialisation des auto-incréments
  db.run('DELETE FROM sqlite_sequence');

  // Insertion des templates par défaut
  defaultTemplates.forEach(template => {
    db.run(
      `INSERT OR REPLACE INTO templates (id, name, description, thumbnail, category, content)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [template.id, template.name, template.description, template.thumbnail, template.category, template.content]
    );
  });

  // Insertion de données de test
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: bcrypt.hashSync('password', 10)
  };

  db.run(
    `INSERT INTO users (username, email, password)
     VALUES (?, ?, ?)`,
    [testUser.username, testUser.email, testUser.password]
  );

  const testSite = {
    user_id: 1,
    name: 'Test Site',
    template: 'default',
    content: '{"sections":[]}',
    domain: 'testsite.com'
  };

  db.run(
    `INSERT INTO sites (user_id, name, template, content, domain)
     VALUES (?, ?, ?, ?, ?)`,
    [testSite.user_id, testSite.name, testSite.template, testSite.content, testSite.domain]
  );

  console.log('Base de données initialisée avec succès');
});

// Fermeture de la connexion
db.close();
