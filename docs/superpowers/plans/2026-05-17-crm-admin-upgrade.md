# CRM Admin Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the current administrative panel into a comprehensive CRM system with an intuitive product wizard, bulk actions, lead management, and analytics.

**Architecture:** SPA (Single Page Application) approach for `admin.html`, using centralized state management and dynamic view switching.

**Tech Stack:** Vanilla JS, Tailwind CSS, Node.js (Express), Supabase (PostgreSQL).

---

### Task 1: Backend - Leads API and Database

**Files:**
- Modify: `api/[...slug].js`
- Create: `setup_leads.sql` (for reference/manual execution if needed)

- [ ] **Step 1: Define Leads API endpoints**
Add GET and PUT endpoints for managing leads.

```javascript
// Add these to api/[...slug].js in the ADMIN API section

// Leads Management
router.get('/admin/leads', authenticateAdmin, async (req, res) => {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.put('/admin/leads/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
```

- [ ] **Step 2: Verify Leads table exists**
Check if the `leads` table exists in Supabase. If not, it should have fields: `id` (int/uuid), `name`, `phone`, `email`, `message`, `type`, `status` (default 'new'), `created_at`.

- [ ] **Step 3: Commit backend changes**
```bash
git add api/[...slug].js
git commit -m "feat: add leads admin api"
```

---

### Task 2: Frontend - SPA Structure & Dashboard Navigation

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update Sidebar and Header**
Add "Leads" and "Analytics" links. Make dashboards clickable.

- [ ] **Step 2: Implement `switchTab` SPA logic**
Refactor `switchTab` to handle new sections and update dashboard cards to trigger `switchTab`.

```javascript
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.tab-link').forEach(l => {
        l.classList.remove('active', 'bg-white/5');
        if (l.dataset.tab === tabId) l.classList.add('active', 'bg-white/5');
    });

    const titles = {
        dashboard: 'Дашборд',
        products: 'Управление товарами',
        orders: 'Заказы',
        users: 'Пользователи',
        leads: 'Лиды (Заявки)',
        analytics: 'Аналитика'
    };
    document.getElementById('currentTabTitle').textContent = titles[tabId] || 'Панель управления';

    if (tabId === 'products') loadProducts();
    if (tabId === 'orders') loadOrders();
    if (tabId === 'users') loadUsers();
    if (tabId === 'leads') loadLeads();
    if (tabId === 'analytics') renderAnalytics();
}
```

- [ ] **Step 3: Make Dashboard cards clickable**
Update HTML in `tab-dashboard` to wrap cards in buttons or add `onclick`.

- [ ] **Step 4: Commit UI structure**
```bash
git add admin.html
git commit -m "ui: refactor admin to SPA and add leads/analytics nav"
```

---

### Task 3: Frontend - Leads Management Section

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add Leads Table HTML**
Add `<section id="tab-leads" class="tab-content hidden space-y-6">...</section>` with a table.

- [ ] **Step 2: Implement `loadLeads` and `renderLeads` functions**
```javascript
async function loadLeads() {
    const token = localStorage.getItem('metal_token');
    try {
        const res = await fetch('/api/admin/leads', { headers: { 'Authorization': 'Bearer ' + token } });
        const leads = await res.json();
        renderLeads(leads);
    } catch (e) { console.error(e); }
}

function renderLeads(leads) {
    const body = document.getElementById('leadsTableBody');
    body.innerHTML = leads.map(l => `
        <tr class="border-b border-outline-variant/10 hover:bg-white/5 transition-all">
            <td class="p-6">
                <div class="font-bold text-sm uppercase">${l.name}</div>
                <div class="text-[10px] opacity-50">${l.type || 'Заявка'}</div>
            </td>
            <td class="p-6 text-sm opacity-70">${l.phone}<br>${l.email}</td>
            <td class="p-6 text-sm opacity-70 max-w-xs truncate">${l.message || '-'}</td>
            <td class="p-6">
                <select onchange="handleLeadStatusChange(${l.id}, this.value)" class="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1 text-xs outline-none focus:border-primary">
                    <option value="new" ${l.status === 'new' ? 'selected' : ''}>Новый</option>
                    <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Связались</option>
                    <option value="closed" ${l.status === 'closed' ? 'selected' : ''}>Закрыт</option>
                </select>
            </td>
            <td class="p-6 text-right">
                <button onclick="viewLeadDetails(${l.id})" class="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Детали</button>
            </td>
        </tr>
    `).join('');
}
```

- [ ] **Step 3: Implement `handleLeadStatusChange`**

- [ ] **Step 4: Commit Leads section**
```bash
git add admin.html
git commit -m "feat: implement leads management UI"
```

---

### Task 4: Frontend - Product Wizard (Step 1-2: Setup)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Replace old Product Modal with Wizard HTML**
Create a multi-step modal container.

- [ ] **Step 2: Implement Wizard Navigation State**
`let currentWizardStep = 1;` and functions to go next/prev.

- [ ] **Step 3: Implement Step 1: Create vs Clone**
Add UI to search existing products for cloning.

```javascript
function selectCloneProduct(prodId) {
    const p = allProducts.find(x => x.id === prodId);
    if (!p) return;
    // Fill wizard state with p data
    fillWizardFromProduct(p);
    nextStep();
}
```

- [ ] **Step 4: Commit Wizard skeleton**
```bash
git add admin.html
git commit -m "ui: add product wizard skeleton and cloning logic"
```

---

### Task 5: Frontend - Product Wizard (Step 3: Smart Forms)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Define category-specific specs**
Create a mapping of category -> required specs fields.

- [ ] **Step 2: Implement dynamic fields in Step 3**
When category is selected in Step 2, update Step 3 HTML.

```javascript
const catSpecs = {
    'Трубы': ['Диаметр', 'Стенка', 'Длина'],
    'Листы': ['Толщина', 'Ширина', 'Длина'],
    // ...
};

function renderSmartSpecs(category) {
    const fields = catSpecs[category] || ['Значение'];
    // Generate inputs for these fields
}
```

- [ ] **Step 3: Commit Smart Forms**
```bash
git add admin.html
git commit -m "feat: implement smart forms in product wizard"
```

---

### Task 6: Frontend - Product Wizard (Step 4-5: Finalization)**

- [ ] **Step 1: Implement Step 4: Pricing & Weight**
Automatic calculation logic (if applicable).

- [ ] **Step 2: Implement Step 5: Preview**
Render a mini-card preview of the product.

- [ ] **Step 3: Update `handleProductSubmit` to use Wizard data**

- [ ] **Step 4: Commit Wizard completion**
```bash
git add admin.html
git commit -m "feat: complete product wizard"
```

---

### Task 7: Frontend - Mass Actions (Bulk selection)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add Checkboxes to Product Table**
Add a "Select All" checkbox in the header and per-row checkboxes.

- [ ] **Step 2: Create Floating Bulk Action Bar**
Hidden by default, shows when `selectedProducts.length > 0`.

- [ ] **Step 3: Implement "Change Price (%)" action**
Loop through selected IDs and send PUT requests or create a new bulk API endpoint.

```javascript
async function bulkUpdatePrice(percent) {
    for (const id of selectedIds) {
        const p = allProducts.find(x => x.id === id);
        const newPrice = p.price_ton * (1 + percent / 100);
        await updateProduct(id, { price_ton: newPrice });
    }
    loadDashboardData();
}
```

- [ ] **Step 4: Implement "Export to CSV"**
Generate a data URI and trigger download.

- [ ] **Step 5: Commit Mass Actions**
```bash
git add admin.html
git commit -m "feat: add bulk actions for products"
```

---

### Task 8: Frontend - Analytics & Clickable Dashboards

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Implement `renderAnalytics`**
Use simple CSS-based bars or a small library (Chart.js) if allowed, otherwise custom SVG/HTML bars.

- [ ] **Step 2: Hook up Dashboard counters to tabs**
Clicking "Заказы" card -> `switchTab('orders')`.

- [ ] **Step 3: Final Polishing & Verification**
Check all redirects, error states, and responsive layout.

- [ ] **Step 4: Final Commit**
```bash
git add admin.html
git commit -m "feat: final analytics and dashboard improvements"
```
