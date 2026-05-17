# CRM Upgrade Task 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Analytics tab content, dashboard interactivity, and perform final polish on the CRM.

**Architecture:** Functional components in `admin.html` for data aggregation and chart rendering using pure CSS/HTML/SVG. Event-driven tab switching for dashboard cards.

**Tech Stack:** HTML, CSS (Tailwind-like classes), JavaScript (Vanilla), SVG.

---

### Task 1: Dashboard Interactivity

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add cursor-pointer and onclick events to dashboard cards**

```javascript
// Locate the cards for Товары, Заказы, Лиды, Клиенты
// Add class 'cursor-pointer'
// Add onclick="switchTab('products')", onclick="switchTab('orders')", etc.
```

- [ ] **Step 2: Verify interactivity**

Run: Manual check (visual/browser) or check code structure for correct IDs and event handlers.
Expected: Cards have `cursor-pointer` and correct `onclick`.

### Task 2: Implement `renderAnalytics()` Data Aggregation

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update `renderAnalytics` to aggregate data**

```javascript
function renderAnalytics() {
    const container = document.getElementById('tab-analytics');
    if (!container) return;

    // Aggregate Leads: 'new', 'contacted', 'closed'
    const leadStats = {
        new: allLeads.filter(l => l.status === 'new').length,
        contacted: allLeads.filter(l => l.status === 'contacted').length,
        closed: allLeads.filter(l => l.status === 'closed').length
    };

    // Aggregate Products by category
    const productStats = {};
    allProducts.forEach(p => {
        const cat = p.category || 'Без категории';
        productStats[cat] = (productStats[cat] || 0) + 1;
    });

    // Aggregate Orders
    const orderStats = {
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        completed: allOrders.filter(o => o.status === 'completed').length,
        cancelled: allOrders.filter(o => o.status === 'cancelled').length
    };

    // Store stats for rendering
    renderAnalyticsCharts(leadStats, productStats, orderStats);
}
```

- [ ] **Step 2: Commit aggregation logic**

```bash
git add admin.html
git commit -m "feat(admin): implement analytics data aggregation"
```

### Task 3: Implement Visual Representations (Charts)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Implement `renderAnalyticsCharts` with styled bars and SVGs**

```javascript
function renderAnalyticsCharts(leads, products, orders) {
    const container = document.getElementById('tab-analytics');
    
    // Funnel (Leads)
    // Category Distribution (Products)
    // Status Breakdown (Orders)
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <!-- Leads Funnel -->
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-bold mb-4">Воронка Лидов</h3>
                <div class="space-y-4">
                    ${renderBar('Новые', leads.new, 'bg-blue-500')}
                    ${renderBar('В работе', leads.contacted, 'bg-yellow-500')}
                    ${renderBar('Закрытые', leads.closed, 'bg-green-500')}
                </div>
            </div>
            
            <!-- Category Distribution -->
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-bold mb-4">Распределение по категориям</h3>
                <div class="space-y-2">
                    ${Object.entries(products).map(([name, count]) => renderBar(name, count, 'bg-indigo-500')).join('')}
                </div>
            </div>

            <!-- Order Statistics -->
            <div class="bg-white p-4 rounded-lg shadow md:col-span-2">
                <h3 class="text-lg font-bold mb-4">Статистика заказов (Всего: ${orders.total})</h3>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="p-3 border rounded text-center">
                        <div class="text-2xl font-bold text-yellow-600">${orders.pending}</div>
                        <div class="text-sm text-gray-500">В обработке</div>
                    </div>
                    <div class="p-3 border rounded text-center">
                        <div class="text-2xl font-bold text-green-600">${orders.completed}</div>
                        <div class="text-sm text-gray-500">Завершено</div>
                    </div>
                    <div class="p-3 border rounded text-center">
                        <div class="text-2xl font-bold text-red-600">${orders.cancelled}</div>
                        <div class="text-sm text-gray-500">Отменено</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderBar(label, value, colorClass) {
    const max = 20; // Example max for scaling
    const percent = Math.min(100, (value / max) * 100);
    return `
        <div>
            <div class="flex justify-between text-sm mb-1">
                <span>${label}</span>
                <span class="font-bold">${value}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="${colorClass} h-2.5 rounded-full" style="width: ${percent}%"></div>
            </div>
        </div>
    `;
}
```

- [ ] **Step 2: Commit visual implementation**

```bash
git add admin.html
git commit -m "feat(admin): add visual charts to analytics tab"
```

### Task 4: Final Polish and Verification

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Review for console errors and UI glitches**

Check: `switchTab` logic, breadcrumbs, title updates.

- [ ] **Step 2: Verify SPA navigation**

Check: `updateTitle` and `switchTab` synergy.

- [ ] **Step 3: Final Verification**

Run: `ls admin.html` (check if exists) and search for "renderAnalytics" in file.
Expected: All functions present and called correctly.

- [ ] **Step 4: Commit final polish**

```bash
git add admin.html
git commit -m "fix(admin): final polish and SPA navigation fixes"
```
