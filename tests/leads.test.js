const request = require('supertest');
const app = require('../api/[...slug]');

// Mock Supabase to avoid hitting real DB
jest.mock('@supabase/supabase-js', () => {
  const chainable = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockImplementation(function() {
      return Promise.resolve({ data: { id: 'admin-1', role: 'admin' }, error: null });
    }),
    single: jest.fn().mockImplementation(function() {
      return Promise.resolve({ data: { id: 'admin-1', role: 'admin' }, error: null });
    }),
    then: function(onFulfilled) {
      // Return an array by default to satisfy .filter() calls in the backend cache
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    }
  };

  const mockFrom = jest.fn(() => chainable);

  return {
    createClient: jest.fn(() => ({
      from: mockFrom,
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }),
      }
    }))
  };
});

describe('Admin Leads API', () => {
  it('should delete a lead', async () => {
    const res = await request(app)
      .delete('/api/admin/leads/1')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
