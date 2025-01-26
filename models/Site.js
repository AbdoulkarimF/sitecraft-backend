const db = require('../config/database');

class Site {
  static async create({ userId, name, template, content, domain = null, analyticsId = null, seoDescription = null, seoKeywords = null }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO sites (
          user_id, name, template, content, domain, analytics_id, 
          seo_description, seo_keywords
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, template, JSON.stringify(content), domain, analyticsId, seoDescription, seoKeywords],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ 
            id: this.lastID, 
            userId, 
            name, 
            template, 
            content,
            domain,
            analyticsId,
            seoDescription,
            seoKeywords
          });
        }
      );
    });
  }

  static async update({ id, content, domain, analyticsId, seoDescription, seoKeywords, published }) {
    return new Promise((resolve, reject) => {
      const updates = [];
      const params = [];

      if (content !== undefined) {
        updates.push('content = ?');
        params.push(JSON.stringify(content));
      }
      if (domain !== undefined) {
        updates.push('domain = ?');
        params.push(domain);
      }
      if (analyticsId !== undefined) {
        updates.push('analytics_id = ?');
        params.push(analyticsId);
      }
      if (seoDescription !== undefined) {
        updates.push('seo_description = ?');
        params.push(seoDescription);
      }
      if (seoKeywords !== undefined) {
        updates.push('seo_keywords = ?');
        params.push(seoKeywords);
      }
      if (published !== undefined) {
        updates.push('published = ?');
        params.push(published);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      db.run(
        `UPDATE sites SET ${updates.join(', ')} WHERE id = ?`,
        params,
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id, content, domain, analyticsId, seoDescription, seoKeywords, published });
        }
      );
    });
  }

  static async findByUser(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT s.*, 
                COUNT(DISTINCT c.id) as component_count,
                COUNT(DISTINCT b.id) as post_count
         FROM sites s
         LEFT JOIN components c ON s.id = c.site_id
         LEFT JOIN blog_posts b ON s.id = b.site_id
         WHERE s.user_id = ?
         GROUP BY s.id
         ORDER BY s.updated_at DESC`,
        [userId],
        (err, sites) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(sites.map(site => ({
            ...site,
            content: JSON.parse(site.content)
          })));
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT s.*, 
                COUNT(DISTINCT c.id) as component_count,
                COUNT(DISTINCT b.id) as post_count
         FROM sites s
         LEFT JOIN components c ON s.id = c.site_id
         LEFT JOIN blog_posts b ON s.id = b.site_id
         WHERE s.id = ?
         GROUP BY s.id`,
        [id],
        (err, site) => {
          if (err) {
            reject(err);
            return;
          }
          if (site) {
            site.content = JSON.parse(site.content);
          }
          resolve(site);
        }
      );
    });
  }

  static async findByDomain(domain) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM sites WHERE domain = ? AND published = 1`,
        [domain],
        (err, site) => {
          if (err) {
            reject(err);
            return;
          }
          if (site) {
            site.content = JSON.parse(site.content);
          }
          resolve(site);
        }
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Supprimer les composants
          db.run('DELETE FROM components WHERE site_id = ?', [id]);
          
          // Supprimer les articles de blog
          db.run('DELETE FROM blog_posts WHERE site_id = ?', [id]);
          
          // Supprimer les médias
          db.run('DELETE FROM media WHERE site_id = ?', [id]);
          
          // Supprimer le site
          db.run(
            'DELETE FROM sites WHERE id = ? AND user_id = ?',
            [id, userId],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              db.run('COMMIT', (err) => {
                if (err) {
                  reject(err);
                  return;
                }
                resolve({ deleted: this.changes > 0 });
              });
            }
          );
        } catch (err) {
          db.run('ROLLBACK');
          reject(err);
        }
      });
    });
  }
}

module.exports = Site;
