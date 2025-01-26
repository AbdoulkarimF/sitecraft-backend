const db = require('../config/database');

class Template {
  static async create({ id, name, description, thumbnail, category, content, isPremium = false }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO templates (id, name, description, thumbnail, category, content, is_premium)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, thumbnail, category, JSON.stringify(content), isPremium],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id, name, description, thumbnail, category, content, isPremium });
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM templates WHERE id = ?`,
        [id],
        (err, template) => {
          if (err) {
            reject(err);
            return;
          }
          if (template) {
            template.content = JSON.parse(template.content);
          }
          resolve(template);
        }
      );
    });
  }

  static async findAll({ category = null, isPremium = null } = {}) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM templates';
      const params = [];

      if (category || isPremium !== null) {
        query += ' WHERE';
        const conditions = [];
        
        if (category) {
          conditions.push('category = ?');
          params.push(category);
        }
        
        if (isPremium !== null) {
          conditions.push('is_premium = ?');
          params.push(isPremium);
        }

        query += ' ' + conditions.join(' AND ');
      }

      db.all(query, params, (err, templates) => {
        if (err) {
          reject(err);
          return;
        }
        templates.forEach(template => {
          template.content = JSON.parse(template.content);
        });
        resolve(templates);
      });
    });
  }
}

module.exports = Template;
