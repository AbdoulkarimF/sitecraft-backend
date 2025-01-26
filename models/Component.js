const db = require('../config/database');

class Component {
  static async create({ siteId, type, content, position }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO components (site_id, type, content, position)
         VALUES (?, ?, ?, ?)`,
        [siteId, type, JSON.stringify(content), position],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id: this.lastID,
            siteId,
            type,
            content,
            position
          });
        }
      );
    });
  }

  static async update({ id, content, position }) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE components 
         SET content = ?, position = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [JSON.stringify(content), position, id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id,
            content,
            position,
            changes: this.changes
          });
        }
      );
    });
  }

  static async findBySiteId(siteId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM components 
         WHERE site_id = ?
         ORDER BY position ASC`,
        [siteId],
        (err, components) => {
          if (err) {
            reject(err);
            return;
          }
          components.forEach(component => {
            component.content = JSON.parse(component.content);
          });
          resolve(components);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM components WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ deleted: this.changes > 0 });
        }
      );
    });
  }

  static async reorderComponents(siteId, componentOrders) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          componentOrders.forEach(({ id, position }) => {
            db.run(
              'UPDATE components SET position = ? WHERE id = ? AND site_id = ?',
              [position, id, siteId]
            );
          });

          db.run('COMMIT', (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve({ success: true });
          });
        } catch (err) {
          db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  }
}

module.exports = Component;
