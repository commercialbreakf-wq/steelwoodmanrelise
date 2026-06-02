# CRM Refinements & Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the administrative panel into a more robust CRM with tabbed taxonomy management, inline editing, fixed product flows, and rich client/lead detail views.

**Architecture:** SPA-style tab switching in `admin.html`. Taxonomy tables (Categories/Subcategories) will be derived from unique values in the `products` table and allow bulk renaming. Wizards will be debugged and extended with file upload support.

**Tech Stack:** Vanilla JavaScript, Tailwind CSS, Supabase (PostgreSQL), Lucide-like icons (Material Symbols).

---

### Task 1: Tabbed Navigation & Taxonomy Infrastructure

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add Tab Navigation UI**
Add a tab bar above the table section to switch between "Товары", "Категории", and "Подкатегории".

```html
<!-- Insert before the Search/Filter bar in the Products section -->
<div class="flex gap-4 mb-8 border-b border-outline-variant/10">
    <button onclick="switchTaxonomyTab('products')" id="tab-products" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-primary text-primary transition-all">Товары</button>
    <button onclick="switchTaxonomyTab('categories')" id="tab-categories" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent opacity-50 hover:opacity-100 transition-all">Категории</button>
    <button onclick="switchTaxonomyTab('subcategories')" id="tab-subcategories" class="px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent opacity-50 hover:opacity-100 transition-all">Подкатегории</button>
</div>
```

- [ ] **Step 2: Implement `switchTaxonomyTab` logic**
Update `admin.html` script to handle tab switching and show/hide corresponding table headers/bodies.

- [ ] **Step 3: Add Table Containers for Categories and Subcategories**
Duplicate the product table structure for Categories and Subcategories.

- [ ] **Step 4: Commit**
`git add admin.html && git commit -m "ui: add taxonomy tabs to admin dashboard"`

---

### Task 2: Row Selection & Interaction Improvements

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update `renderProducts` for Row Clicking**
Modify the template literal in `renderProducts` to include an `onclick` on the `<tr>` and a visible checkmark icon.

```javascript
// Inside renderProducts mapping
<tr onclick="handleRowClick(event, '${p.id}')" class="group border-b border-outline-variant/10 hover:bg-white/5 cursor-pointer transition-all ${selectedProductIds.has(p.id) ? 'bg-primary/5' : ''}">
    <td class="p-6">
        <div class="flex items-center gap-3">
            <div class="w-5 h-5 rounded border border-outline-variant/30 flex items-center justify-center transition-all ${selectedProductIds.has(p.id) ? 'bg-primary border-primary' : 'group-hover:border-primary/50'}">
                ${selectedProductIds.has(p.id) ? '<span class="material-symbols-outlined text-[14px] text-on-primary">check</span>' : ''}
            </div>
        </div>
    </td>
    <!-- ... rest of columns ... -->
</tr>
```

- [ ] **Step 2: Implement `handleRowClick`**
Add logic to toggle selection while ignoring clicks on action buttons or checkboxes.

- [ ] **Step 3: Commit**
`git add admin.html && git commit -m "ui: implement full-row selection with checkmarks"`

---

### Task 3: Inline Price Editing

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add Inline Edit UI to Price Column**
Wrap the price display in a container that toggles between text and an input field.

- [ ] **Step 2: Implement `toggleInlineEdit` and `saveInlinePrice`**
Add JS functions to swap the DOM elements and perform a `PUT` request to `/api/admin/products/:id`.

- [ ] **Step 3: Commit**
`git add admin.html && git commit -m "feat: add inline price editing to products table"`

---

### Task 4: Debug & Fix Product Wizard (Edit & Clone)

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Fix `initWizard` for Editing**
Ensure `wizardData.id_original` is correctly set and all fields are pre-populated. Debug the "halt after Step 2" issue (likely a missing `saveWizardStep2` or validation error in `nextStep`).

- [ ] **Step 2: Fix `selectCloneProduct`**
Ensure it clears the unique ID but keeps other metadata, then transitions to Step 2 correctly.

- [ ] **Step 3: Commit**
`git add admin.html && git commit -m "fix: resolve product edit and clone wizard bugs"`

---

### Task 5: Image Upload Support in Wizard

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add File Input to Wizard Step 2**
Add a "Upload File" button that triggers a hidden `<input type="file">`.

- [ ] **Step 2: Implement Base64 Conversion**
Add a helper to convert the selected file to a Data URL and update `wizardData.image`.

- [ ] **Step 3: Commit**
`git add admin.html && git commit -m "feat: add image file upload support to product wizard"`

---

### Task 6: Rich Detail Panels for Clients & Leads

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Create Slide-out Panel Component**
Add a hidden container that slides in from the right to show details.

- [ ] **Step 2: Implement `viewOrderDetails` with Custom UI**
Replace the `alert()` with a function that populates and shows the slide-out panel. Include order status management.

- [ ] **Step 3: Implement `viewLeadDetails` with Custom UI**
Replace the `alert()` for leads. Map technical types (e.g., `callback` -> `Заказать звонок`).

- [ ] **Step 4: Commit**
`git add admin.html && git commit -m "ui: replace native alerts with custom detail panels for orders and leads"`
