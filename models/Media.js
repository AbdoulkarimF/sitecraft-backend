const db = require('../config/database');
const path = require('path');
const fs = require('fs').promises;

class Media {
  static async create({ userId, siteId, filename, originalName, mimeType, size, path: filePath }) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO media (user_id, site_id, filename, original_name, mime_type, size, path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, siteId, filename, originalName, mimeType, size, filePath],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id: this.lastID,
            userId,
            siteId,
            filename,
            originalName,
            mimeType,
            size,
            path: filePath
          });
        }
      );
    });
  }

  static async findBySiteId(siteId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM media 
         WHERE site_id = ?
         ORDER BY created_at DESC`,
        [siteId],
        (err, mediaFiles) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(mediaFiles);
        }
      );
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM media 
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId],
        (err, mediaFiles) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(mediaFiles);
        }
      );
    });
  }

  static async delete(id, userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM media WHERE id = ? AND user_id = ?',
        [id, userId],
        async (err, media) => {
          if (err) {
            reject(err);
            return;
          }

          if (!media) {
            resolve({ deleted: false, reason: 'Media not found or unauthorized' });
            return;
          }

          try {
            // Supprimer le fichier physique
            await fs.unlink(media.path);

            // Supprimer l'entrée de la base de données
            db.run(
              'DELETE FROM media WHERE id = ?',
              [id],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve({ deleted: true });
              }
            );
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  static async getStorageUsage(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT SUM(size) as total_size 
         FROM media 
         WHERE user_id = ?`,
        [userId],
        (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            totalSize: result.total_size || 0,
            totalSizeMB: Math.round((result.total_size || 0) / (1024 * 1024) * 100) / 100
          });
        }
      );
    });
  }
}

module.exports = Media;
