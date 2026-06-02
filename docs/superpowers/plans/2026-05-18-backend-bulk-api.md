# Backend Bulk API & Cache Hooks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a targeted cache invalidation helper and a bulk-update API endpoint for products to improve admin performance and data consistency.

**Architecture:** Extend the existing in-memory cache system in `api/[...slug].js` with a granular invalidation method. Add a batch-processing endpoint that uses Supabase's `upsert` for transactional updates and triggers the granular cache update.

**Tech Stack:** Node.js, Express, Supabase (PostgreSQL), Jest (for testing).

---

### Task 1: Setup Failing Test for Bulk Update

**Files:**
- Create: `tests/admin-api.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
const request = require('supertest');
const app = require('../api/[...slug]');

// Mock Supabase to avoid hitting real DB during initial test run
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/admin-api.test.js`
Expected: FAIL (likely 404)

- [ ] **Step 3: Commit initial test**

```bash
git add tests/admin-api.test.js
git commit -m "test: add failing test for bulk-update endpoint"
```

### Task 2: Implement Targeted Cache Invalidation

**Files:**
- Modify: `api/[...slug].js`

- [ ] **Step 1: Add `invalidateProductCache` function**

```javascript
// Locate the warmProducts and clearProductsCache functions
// Add this after warmProducts

async function invalidateProductCache(productIds) {
  if (!productIds || productIds.length === 0) return;
  console.log(`[CACHE] Granularly invalidating ${productIds.length} products...`);
  try {
    const { data, error } = await supabase.from('products').select('*').in('id', productIds);
    if (!error && data) {
      data.forEach(updatedProduct => {
        const idx = allProductsInMemory.findIndex(p => String(p.id) === String(updatedProduct.id));
        if (idx !== -1) {
          allProductsInMemory[idx] = updatedProduct;
        } else {
          allProductsInMemory.unshift(updatedProduct);
        }
      });
      console.log(`[CACHE] Granularly updated ${data.length} products in memory.`);
    }
  } catch (e) {
    console.error('[CACHE] Granular invalidation failed:', e.message);
  }
}
```

- [ ] **Step 2: Commit cache helper**

```bash
git add api/[...slug].js
git commit -m "feat(api): add invalidateProductCache helper for granular updates"
```

### Task 3: Add Bulk Update Endpoint

**Files:**
- Modify: `api/[...slug].js`

- [ ] **Step 1: Implement `POST /admin/bulk-update`**

```javascript
// Add after the existing admin product routes (PUT /admin/products/:id etc.)

router.post('/admin/bulk-update', authenticateAdmin, async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ error: 'Updates must be a non-empty array' });
  }

  try {
    // Supabase upsert handles multiple rows
    const { data, error } = await supabase
      .from('products')
      .upsert(updates, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[API] Bulk update error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const updatedIds = updates.map(u => u.id).filter(Boolean);
    if (updatedIds.length > 0) {
      // Trigger granular cache update instead of full reload
      await invalidateProductCache(updatedIds);
    }

    res.json({ success: true, count: data ? data.length : 0 });
  } catch (e) {
    console.error('[API] Bulk update exception:', e.message);
    res.status(500).json({ error: 'Internal server error during bulk update' });
  }
});
```

- [ ] **Step 2: Update the test to pass**

(Adjust the test mock if necessary to ensure it passes)

- [ ] **Step 3: Run test to verify it passes**

Run: `npx jest tests/admin-api.test.js`
Expected: PASS

- [ ] **Step 4: Commit endpoint**

```bash
git add api/[...slug].js
git commit -m "feat(api): add bulk-update endpoint for products"
```

### Task 4: Final Verification and Cleanup

- [ ] **Step 1: Run all tests**

Run: `npm test` (if configured) or `npx jest tests/admin-api.test.js`

- [ ] **Step 2: Manual verification if possible**

(Simulate a bulk update call using curl or a script)

- [ ] **Step 3: Final Commit**

```bash
git commit -m "chore: cleanup and finalize bulk update implementation" --allow-empty
```
