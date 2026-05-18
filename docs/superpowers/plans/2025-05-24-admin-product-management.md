# Admin Product Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a product table with selection and sorting, and a side drawer for editing products, integrated into the admin dashboard using the existing singleton state.

**Architecture:** Component-based UI using functional renderers. State is managed by the singleton `AdminState`. The table and drawer will be decoupled from the main app logic and integrated in `app.js`.

**Tech Stack:** Vanilla JS (ES Modules), Tailwind CSS, Material Symbols.

---

### Task 1: Create Product Table Component

**Files:**
- Create: `js/admin/components/table.js`

- [ ] **Step 1: Implement `renderProductTable`**

```javascript
/**
 * Renders the product table
 * @param {HTMLElement} container 
 * @param {Array} products 
 * @param {Object} options - { onRowClick, onSelectionChange }
 */
export function renderProductTable(container, products, options = {}) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-6 w-10">
                            <input type="checkbox" id="select-all-products" class="rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20">
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vid">ID</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vname">Наименование</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vprice">Цена</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vcat">Категория</th>
                        <th class="py-4 px-6 font-bold">Статус</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${products.map(product => `
                        <tr class="group hover:bg-white/[0.02] transition-colors cursor-pointer" data-id="${product.vid}">
                            <td class="py-4 px-6">
                                <input type="checkbox" class="product-checkbox rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20" data-id="${product.vid}">
                            </td>
                            <td class="py-4 px-6 text-xs font-mono text-[#d7c1c7]">${product.vid}</td>
                            <td class="py-4 px-6 font-medium">${product.vname}</td>
                            <td class="py-4 px-6 text-[#ffb0cc] font-bold">${Number(product.vprice).toLocaleString()} ₽</td>
                            <td class="py-4 px-6 text-sm text-[#d7c1c7]">${product.vcat}</td>
                            <td class="py-4 px-6">
                                <span class="px-2 py-1 rounded-full text-[10px] uppercase tracking-tighter font-bold ${product.vstatus === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}">
                                    ${product.vstatus === 'active' ? 'Активен' : 'Черновик'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Add event listeners
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return;
            const id = row.dataset.id;
            const product = products.find(p => p.vid === id);
            if (options.onRowClick) options.onRowClick(product);
        });
    });

    const selectAll = container.querySelector('#select-all-products');
    const checkboxes = container.querySelectorAll('.product-checkbox');
    
    selectAll?.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
        if (options.onSelectionChange) {
            const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
            options.onSelectionChange(selectedIds);
        }
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (options.onSelectionChange) {
                const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
                options.onSelectionChange(selectedIds);
            }
        });
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/components/table.js
git commit -m "feat(admin): add product table component"
```

---

### Task 2: Create Side Drawer Editor Component

**Files:**
- Create: `js/admin/components/drawer.js`

- [ ] **Step 1: Implement `openDrawer`**

```javascript
/**
 * Opens the product editor drawer
 * @param {Object} product 
 * @param {Function} onSave 
 */
export function openDrawer(product, onSave) {
    let drawer = document.getElementById('admin-drawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'admin-drawer';
        drawer.className = 'fixed inset-y-0 right-0 w-[450px] bg-[#1d1b19] border-l border-[#534347]/20 z-50 transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col';
        document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
        <div class="p-8 border-b border-[#534347]/20 flex items-center justify-between">
            <div>
                <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight">Редактировать товар</h3>
                <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1">ID: ${product.vid}</div>
            </div>
            <button id="close-drawer" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="edit-product-form" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Наименование</label>
                    <input type="text" name="vname" value="${product.vname}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Цена (₽)</label>
                        <input type="number" name="vprice" value="${product.vprice}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Статус</label>
                        <select name="vstatus" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                            <option value="active" ${product.vstatus === 'active' ? 'selected' : ''}>Активен</option>
                            <option value="draft" ${product.vstatus === 'draft' ? 'selected' : ''}>Черновик</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Категория</label>
                    <input type="text" name="vcat" value="${product.vcat}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Описание</label>
                    <textarea name="vdescription" rows="4" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all resize-none">${product.vdescription || ''}</textarea>
                </div>
            </form>
        </div>

        <div class="p-8 border-t border-[#534347]/20 grid grid-cols-2 gap-4">
            <button id="cancel-edit" class="px-6 py-3 rounded-xl border border-[#534347]/30 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest font-['Space Grotesk']">Отмена</button>
            <button id="save-product" class="px-6 py-3 rounded-xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-sm font-bold uppercase tracking-widest font-['Space Grotesk']">Сохранить</button>
        </div>
    `;

    // Show drawer
    setTimeout(() => drawer.classList.remove('translate-x-full'), 10);

    const close = () => {
        drawer.classList.add('translate-x-full');
    };

    drawer.querySelector('#close-drawer').onclick = close;
    drawer.querySelector('#cancel-edit').onclick = close;
    
    drawer.querySelector('#save-product').onclick = async () => {
        const formData = new FormData(drawer.querySelector('#edit-product-form'));
        const updatedData = Object.fromEntries(formData.entries());
        
        const saveBtn = drawer.querySelector('#save-product');
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            await onSave(updatedData);
            close();
        } catch (err) {
            alert('Ошибка при сохранении: ' + err.message);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/components/drawer.js
git commit -m "feat(admin): add side drawer editor component"
```

---

### Task 3: Integrate Components in app.js

**Files:**
- Modify: `js/admin/app.js`

- [ ] **Step 1: Import state and components**

```javascript
import { renderLayout } from './ui.js';
import { state } from './state.js';
import { renderProductTable } from './components/table.js';
import { openDrawer } from './components/drawer.js';
```

- [ ] **Step 2: Implement `renderProductsView`**

```javascript
const renderProductsView = async (container) => {
    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Управление товарами</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Просмотр, редактирование и управление складскими запасами</p>
                </div>
                <button class="flex items-center gap-2 px-6 py-3 bg-[#ffb0cc] text-[#0f0e0c] rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-lg shadow-[#ffb0cc]/10">
                    <span class="material-symbols-outlined text-base">add</span>
                    Добавить товар
                </button>
            </div>

            <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="products-table-container">
                <div class="flex items-center justify-center h-[400px]">
                    <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('products-table-container');

    const updateTable = (products) => {
        renderProductTable(tableContainer, products, {
            onRowClick: (product) => {
                openDrawer(product, async (updatedData) => {
                    await state.updateProduct(product.vid, updatedData);
                });
            },
            onSelectionChange: (ids) => {
                console.log('Selected products:', ids);
            }
        });
    };

    // Initial fetch
    try {
        const products = await state.fetchProducts();
        updateTable(products);
    } catch (err) {
        tableContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-[400px] text-red-400 gap-4">
                <span class="material-symbols-outlined text-4xl">error</span>
                <div class="text-sm font-medium">${err.message}</div>
                <button onclick="location.reload()" class="text-xs uppercase tracking-widest font-bold underline">Повторить попытку</button>
            </div>
        `;
    }

    // Subscribe to updates
    state.on('products:updated', (products) => {
        updateTable(products);
    });
};
```

- [ ] **Step 3: Update View Switcher**

Update the `initViewSwitcher` to call `renderProductsView` when 'products' is selected.

- [ ] **Step 4: Commit**

```bash
git add js/admin/app.js
git commit -m "feat(admin): integrate product table and drawer into app"
```
