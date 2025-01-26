const request = require('supertest');
const app = require('../server');
const db = require('../config/database');
let authToken;
let userId;

describe('Site Endpoints', () => {
  beforeAll(async () => {
    // Créer un utilisateur et obtenir le token
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'sitetest',
        email: 'site@test.com',
        password: 'password123'
      });

    authToken = res.body.token;
    userId = res.body.user.id;
  });

  describe('POST /api/sites', () => {
    it('should create a new site', async () => {
      const res = await request(app)
        .post('/api/sites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Site',
          template: 'business',
          content: {
            hero: {
              title: 'Welcome',
              subtitle: 'To my site'
            }
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.site).toHaveProperty('id');
      expect(res.body.site.name).toBe('Test Site');
    });
  });

  describe('GET /api/sites', () => {
    it('should get user sites', async () => {
      const res = await request(app)
        .get('/api/sites')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.sites)).toBeTruthy();
      expect(res.body.sites.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/sites/:id', () => {
    let siteId;

    beforeAll(async () => {
      const site = await request(app)
        .post('/api/sites')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Test Site',
          template: 'business',
          content: {}
        });

      siteId = site.body.site.id;
    });

    it('should update site content', async () => {
      const res = await request(app)
        .put(`/api/sites/${siteId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: {
            hero: {
              title: 'Updated Title',
              subtitle: 'Updated Subtitle'
            }
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.site.content.hero.title).toBe('Updated Title');
    });
  });
});
