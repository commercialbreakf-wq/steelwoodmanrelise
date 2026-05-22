const request = require('supertest');
const app = require('../api/[...slug]');

// Mock Supabase to avoid hitting real DB during initial test run
jest.mock('@supabase/supabase-js', () => {
  const mockResult = { data: [], error: null };
  const chainable = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockImplementation(function(data) {
      this._upsertData = data;
      return this;
    }),
    upsert: jest.fn().mockImplementation(function(data) {
      this._upsertData = data;
      return this;
    }),
    in: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockImplementation(function() {
      return Promise.resolve({ data: { id: 'admin-1', role: 'admin' }, error: null });
    }),
    single: jest.fn().mockImplementation(function() {
      if (this._upsertData) {
        return Promise.resolve({ data: Array.isArray(this._upsertData) ? this._upsertData[0] : this._upsertData, error: null });
      }
      return Promise.resolve({ data: { id: 'admin-1', role: 'admin' }, error: null });
    }),
    delete: jest.fn().mockReturnThis(),
    insert: jest.fn().mockImplementation(function(data) {
      this._upsertData = data;
      return this;
    }),
    then: function(onFulfilled) {
      let data = [];
      if (this._upsertData) {
        data = Array.isArray(this._upsertData) ? this._upsertData : [this._upsertData];
      }
      return Promise.resolve({ data, error: null }).then(onFulfilled);
    }
  };

  const mockFrom = jest.fn(() => chainable);

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        resend: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        admin: {
          createUser: jest.fn(),
          updateUserById: jest.fn(),
        }
      }
    }))
  };
});


describe('Admin Products CRUD API', () => {
  it('should bulk update products and return success', async () => {
    const updates = [
      { id: '1', price_ton: 50000 },
      { id: '2', price_ton: 60000 }
    ];

    const res = await request(app)
      .post('/api/admin/bulk-update')
      .set('Authorization', 'Bearer mock-admin-token')
      .send({ updates });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create a new product', async () => {
    const product = { name: 'New Product', price_ton: 10000 };
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', 'Bearer mock-admin-token')
      .send(product);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Product');
  });

  it('should update a product', async () => {
    const product = { name: 'Updated Product' };
    const res = await request(app)
      .put('/api/admin/products/1')
      .set('Authorization', 'Bearer mock-admin-token')
      .send(product);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete('/api/admin/products/1')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
