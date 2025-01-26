const db = require('../config/database');

class BlogPost {
  static async create({ siteId, title, content, status = 'draft' }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO blog_posts (site_id, title, content, status) VALUES (?, ?, ?, ?)`,
        [siteId, title, content, status],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ 
            id: this.lastID, 
            siteId, 
            title, 
            content, 
            status 
          });
        }
      );
    });
  }

  static async update({ id, title, content, status }) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE blog_posts 
         SET title = ?, content = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, content, status, id],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id, title, content, status });
        }
      );
    });
  }

  static async findBySite(siteId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM blog_posts WHERE site_id = ? ORDER BY created_at DESC`,
        [siteId],
        (err, posts) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(posts);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM blog_posts WHERE id = ?`,
        [id],
        (err, post) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(post);
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run(
        `DELETE FROM blog_posts WHERE id = ?`,
        [id],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        }
      );
    });
  }
}

module.exports = BlogPost;
