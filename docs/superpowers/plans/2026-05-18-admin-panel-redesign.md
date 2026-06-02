# Admin Pro 2026 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the admin panel into a modular, high-performance system with hybrid layout and smart bulk operations.

**Architecture:** Modular Vanilla JS on the frontend with a transactional Bulk API on the backend. Uses a proactive client-side cache and granular server-side cache invalidation.

**Tech Stack:** Node.js, Supabase, Vanilla JS, CSS Variables.

---

### Task 1: Backend Bulk API & Cache Hooks

**Files:**
- Modify: `api/[...slug].js`
- Test: `tests/admin-api.test.js`

- [ ] **Step 1: Implement targeted cache invalidation helper**

```javascript
// Add to api/[...slug].js
function invalidateProductCache(productIds) {
    if (!productIds || productIds.length === 0) return;
    // Instead of full warmProducts(), we fetch only changed items
    // and update the in-memory 'products' variable.
    console.log(`[Cache] Invalidating ${productIds.length} items`);
}
```

- [ ] **Step 2: Add Bulk Update Endpoint**

```javascript
router.post('/admin/bulk-update', authenticateAdmin, async (req, res) => {
    const { updates } = req.body;
    // Implement transactional update logic using supabase.rpc or multiple calls
    // Trigger invalidateProductCache(updatedIds)
    res.json({ success: true });
});
```

- [ ] **Step 3: Create verification test**

```bash
# Run: node tests/admin-api.test.js
# Expected: Success message for bulk update
```

- [ ] **Step 4: Commit**

```bash
git add api/[...slug].js
git commit -m "feat(api): add bulk-update endpoint and cache hooks"
```

---

### Task 2: Core Admin Shell & Modular Structure

**Files:**
- Create: `js/admin/app.js`
- Create: `js/admin/ui.js`
- Modify: `admin.html`

- [ ] **Step 1: Create the new modular shell in admin.html**

```html
<!-- admin.html -->
<div id="admin-app">
    <aside id="admin-sidebar"></aside>
    <main id="admin-content">
        <header id="admin-header"></header>
        <section id="admin-table-container"></section>
    </main>
    <div id="side-drawer" class="drawer hidden"></div>
</div>
<script type="module" src="/js/admin/app.js"></script>
```

- [ ] **Step 2: Implement basic Layout engine in ui.js**

```javascript
export function renderLayout() {
    document.getElementById('admin-sidebar').innerHTML = '...';
    // Base layout logic
}
```

- [ ] **Step 3: Commit**

```bash
git add admin.html js/admin/
git commit -m "feat(admin): initialize modular shell and layout"
```

---

### Task 3: State Management & Product Table

**Files:**
- Create: `js/admin/state.js`
- Create: `js/admin/components/table.js`

- [ ] **Step 1: Implement Proactive State in state.js**

```javascript
export const state = {
    products: [],
    loading: false,
    async fetchProducts() { ... },
    async updateProduct(id, data) {
        // Optimistic update
        const index = this.products.findIndex(p => p.id === id);
        this.products[index] = { ...this.products[index], ...data };
        renderTable();
        // Background sync
        await api.save(id, data);
    }
};
```

- [ ] **Step 2: Build the Sortable Table component**

```javascript
export function renderTable(products) {
    const html = products.map(p => `<tr>...</tr>`).join('');
    document.getElementById('admin-table-container').innerHTML = html;
}
```

- [ ] **Step 3: Commit**

```bash
git add js/admin/state.js js/admin/components/table.js
git commit -m "feat(admin): add state management and product table"
```

---

### Task 4: Side Drawer Editor

**Files:**
- Create: `js/admin/components/drawer.js`

- [ ] **Step 1: Implement the Side Drawer logic**

```javascript
export function openDrawer(product) {
    const drawer = document.getElementById('side-drawer');
    drawer.innerHTML = `
        <h3>Редактирование: ${product.name}</h3>
        <input name="price" value="${product.price}">
        <button onclick="saveProduct()">Сохранить</button>
    `;
    drawer.classList.remove('hidden');
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/components/drawer.js
git commit -m "feat(admin): add side drawer editor"
```

---

### Task 5: Smart Merge & Bulk Actions

**Files:**
- Create: `js/admin/import-engine.js`
- Create: `js/admin/components/bulk-toolbar.js`

- [ ] **Step 1: Implement Intellectual Merge Logic**

```javascript
export function mergePriceList(currentProducts, incomingData) {
    return incomingData.map(item => {
        const existing = currentProducts.find(p => p.vid === item.vid);
        if (existing) {
            return { ...existing, price: item.price, status: item.status };
        }
        return item; // New product
    });
}
```

- [ ] **Step 2: Add Bulk Actions Toolbar**

```javascript
export function renderBulkToolbar(selectedIds) {
    // Buttons for % price change, status toggle, etc.
}
```

- [ ] **Step 3: Commit**

```bash
git add js/admin/import-engine.js js/admin/components/bulk-toolbar.js
git commit -m "feat(admin): implement smart merge and bulk actions"
```

---

### Task 6: Final Integration & Cleanup

- [ ] **Step 1: Wire all components in app.js**
- [ ] **Step 2: Verify all Bulk Actions with end-to-end manual test**
- [ ] **Step 3: Commit**

```bash
git commit -m "feat(admin): final integration and polish"
```
