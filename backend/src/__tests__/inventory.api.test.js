process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'sqlite::memory:?cache=shared';
process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');
const { app } = require('../app');
const { sequelize } = require('../models');

describe('Inventory API', () => {
  let authToken;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'Password123!',
        role: 'admin'
      });

    authToken = registerRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('creates and retrieves a product', async () => {
    const createRes = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sku: 'SKU-001',
        name: 'Test Product',
        price: 19.99,
        quantity: 12,
        lowStockThreshold: 5
      });

    expect(createRes.status).toBe(201);
    const productId = createRes.body.product.id;

    const fetchRes = await request(app)
      .get(`/api/inventory/${productId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(fetchRes.status).toBe(200);
    expect(fetchRes.body.name).toBe('Test Product');
  });
});
