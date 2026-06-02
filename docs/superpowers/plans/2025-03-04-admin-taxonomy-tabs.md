# Tabbed Navigation & Taxonomy Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tab bar to `admin.html` to switch between "Товары", "Категории", and "Подкатегории" views, and implement the necessary logic and table containers.

**Architecture:** 
- Add a secondary tab bar within the "Products" section of the admin dashboard.
- Implement a `switchTaxonomyTab` function to toggle visibility between Products, Categories, and Subcategories.
- Reuse the existing table styling for Categories and Subcategories.
- Extract unique Categories and Subcategories from the `allProducts` data on the fly.

**Tech Stack:** HTML5, Tailwind CSS, JavaScript.

---

### Task 1: UI Implementation - Tab Bar & Table Containers

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add Taxonomy Tab Bar**
Insert the tab bar UI into `#tab-products`.

```html
<!-- Inside <section id="tab-products" ...> -->
<div class="flex gap-4 mb-8 border-b border-outline-variant/10">
    <button onclick="switchTaxonomyTab('products')" id="tax-tab-products" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-primary text-primary transition-all">Товары</button>
    <button onclick="switchTaxonomyTab('categories')" id="tax-tab-categories" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent opacity-50 hover:opacity-100 transition-all">Категории</button>
    <button onclick="switchTaxonomyTab('subcategories')" id="tax-tab-subcategories" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent opacity-50 hover:opacity-100 transition-all">Подкатегории</button>
</div>
```

- [ ] **Step 2: Add Table Containers for Categories and Subcategories**
Duplicate the existing product table structure (or parts of it) for categories and subcategories, ensuring they are hidden by default.

```html
<!-- Categories Table -->
<div id="tax-container-categories" class="hidden glass rounded-3xl overflow-hidden">
    <table class="w-full text-left border-collapse">
        <thead>
            <tr class="border-b border-outline-variant/20 bg-white/5">
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50">Название категории</th>
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50">Кол-во товаров</th>
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50 text-right">Действия</th>
            </tr>
        </thead>
        <tbody id="categoriesTableBody"></tbody>
    </table>
</div>

<!-- Subcategories Table -->
<div id="tax-container-subcategories" class="hidden glass rounded-3xl overflow-hidden">
    <table class="w-full text-left border-collapse">
        <thead>
            <tr class="border-b border-outline-variant/20 bg-white/5">
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50">Подкатегория</th>
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50">Родительская категория</th>
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50">Кол-во товаров</th>
                <th class="p-6 text-[10px] font-display uppercase tracking-widest opacity-50 text-right">Действия</th>
            </tr>
        </thead>
        <tbody id="subcategoriesTableBody"></tbody>
    </table>
</div>
```

- [ ] **Step 3: Update existing Products table container ID**
Wrap the existing products table in a div with id `tax-container-products` to allow toggling.

### Task 2: Logic Implementation - Tab Switching & Data Aggregation

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Implement `switchTaxonomyTab` function**
Add the JS function to handle tab switching.

```javascript
function switchTaxonomyTab(tabId) {
    // Update tab buttons
    ['products', 'categories', 'subcategories'].forEach(id => {
        const btn = document.getElementById('tax-tab-' + id);
        if (!btn) return;
        if (id === tabId) {
            btn.classList.add('border-primary', 'text-primary');
            btn.classList.remove('border-transparent', 'opacity-50');
        } else {
            btn.classList.remove('border-primary', 'text-primary');
            btn.classList.add('border-transparent', 'opacity-50');
        }
        
        // Update containers
        const container = document.getElementById('tax-container-' + id);
        if (container) {
            if (id === tabId) container.classList.remove('hidden');
            else container.classList.add('hidden');
        }
    });

    // Toggle search/filter bar visibility
    const filterBar = document.getElementById('productFilterBar');
    if (filterBar) {
        if (tabId === 'products') filterBar.classList.remove('hidden');
        else filterBar.classList.add('hidden');
    }

    if (tabId === 'categories') renderCategories();
    if (tabId === 'subcategories') renderSubcategories();
}
```

- [ ] **Step 2: Implement `renderCategories` and `renderSubcategories`**
Extract unique values from `allProducts` and render them into the tables.

```javascript
function renderCategories() {
    const cats = {};
    allProducts.forEach(p => {
        cats[p.category] = (cats[p.category] || 0) + 1;
    });

    const body = document.getElementById('categoriesTableBody');
    body.innerHTML = Object.entries(cats).map(([name, count]) => `
        <tr class="border-b border-outline-variant/10 hover:bg-white/5 transition-all">
            <td class="p-6 font-bold text-sm uppercase">${name}</td>
            <td class="p-6 text-sm opacity-70">${count} товаров</td>
            <td class="p-6 text-right">
                <button class="p-2 rounded-full hover:bg-primary/20 text-primary transition-all opacity-30 cursor-not-allowed">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderSubcategories() {
    const subs = {};
    allProducts.forEach(p => {
        const sub = p.subcategory || 'Без подкатегории';
        const key = `${p.category} > ${sub}`;
        if (!subs[key]) subs[key] = { category: p.category, subcategory: sub, count: 0 };
        subs[key].count++;
    });

    const body = document.getElementById('subcategoriesTableBody');
    body.innerHTML = Object.values(subs).map(s => `
        <tr class="border-b border-outline-variant/10 hover:bg-white/5 transition-all">
            <td class="p-6 font-bold text-sm uppercase">${s.subcategory}</td>
            <td class="p-6 text-sm opacity-70">${s.category}</td>
            <td class="p-6 text-sm opacity-70">${s.count} товаров</td>
            <td class="p-6 text-right">
                <button class="p-2 rounded-full hover:bg-primary/20 text-primary transition-all opacity-30 cursor-not-allowed">
                    <span class="material-symbols-outlined text-[18px]">edit</span>
                </button>
            </td>
        </tr>
    `).join('');
}
```

### Task 3: Verification & Polish

- [ ] **Step 1: Verify tab switching**
Open `admin.html` and click through tabs. Verify active state and visibility.

- [ ] **Step 2: Verify data rendering**
Ensure categories and subcategories are correctly counted and displayed based on `allProducts`.

- [ ] **Step 3: Commit**

```bash
git add admin.html
git commit -m "ui: add taxonomy tabs to admin dashboard"
```
