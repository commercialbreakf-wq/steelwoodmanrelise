const request = require('supertest');
const app = require('../api/[...slug]');

// Mock Supabase to avoid hitting real DB during initial test run
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    })),
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin-id' } }, error: null }),
    }
  }))
}));

describe('Admin Bulk API', () => {
  it('should bulk update products and return success', async () => {
    const updates = [
      { id: '1', price_ton: 50000 },
      { id: '2', price_ton: 60000 }
    ];

    // We expect a 404 or 405 initially because the endpoint doesn't exist
    const res = await request(app)
      .post('/api/admin/bulk-update')
      .set('Authorization', 'Bearer mock-admin-token')
      .send({ updates });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
