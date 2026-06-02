# Smart Merge & Bulk Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a bulk actions toolbar for the product table and a smart import engine for price list synchronization.

**Architecture:** 
- `import-engine.js`: Pure logic for merging product data.
- `bulk-toolbar.js`: A functional component that renders a floating UI for mass operations.
- `app.js`: Orchestrates the selection state and integrates the toolbar.

**Tech Stack:** JavaScript (ESM), Tailwind CSS, Material Symbols.

---

### Task 1: Import Engine Logic

**Files:**
- Create: `js/admin/import-engine.js`
- Test: `tests/admin/import-engine.test.js`

- [ ] **Step 1: Create the import engine with `mergePriceListData`**
Logic should match by `vid` or `vname`, update `vprice` and `vstatus`, and preserve other fields.

```javascript
/**
 * Merges incoming price list data with current products
 * @param {Array} currentProducts 
 * @param {Array} incomingData - Array of { vid, vname, vprice, vstatus }
 * @returns {Array} - Array of updates for bulkUpdateProducts
 */
export function mergePriceListData(currentProducts, incomingData) {
    const updates = [];
    
    incomingData.forEach(item => {
        let existing = null;
        if (item.vid) {
            existing = currentProducts.find(p => p.vid === item.vid);
        } else if (item.vname) {
            existing = currentProducts.find(p => p.vname === item.vname);
        }
        
        if (existing) {
            const changes = {};
            let hasChanges = false;
            
            if (item.vprice !== undefined && Number(item.vprice) !== Number(existing.vprice)) {
                changes.vprice = Number(item.vprice);
                hasChanges = true;
            }
            
            if (item.vstatus !== undefined && item.vstatus !== existing.vstatus) {
                changes.vstatus = item.vstatus;
                hasChanges = true;
            }
            
            if (hasChanges) {
                updates.push({ vid: existing.vid, ...changes });
            }
        }
    });
    
    return updates;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/import-engine.js
git commit -m "feat(admin): add smart import engine logic"
```

---

### Task 2: Bulk Toolbar Component

**Files:**
- Create: `js/admin/components/bulk-toolbar.js`

- [ ] **Step 1: Implement `renderBulkToolbar`**
The toolbar should be a floating bar at the bottom or integrated into the header. It should only show when `selectedIds.length > 0`.

```javascript
/**
 * Renders the bulk actions toolbar
 * @param {HTMLElement} container 
 * @param {Array} selectedIds 
 * @param {Object} callbacks - { onUpdatePrice, onToggleStatus, onImportPrice, onClose }
 */
export function renderBulkToolbar(container, selectedIds, callbacks) {
    if (!container) return;
    
    if (selectedIds.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div class="glass-dark px-6 py-4 rounded-2xl border border-[#ffb0cc]/20 shadow-2xl shadow-black/50 flex items-center gap-6">
                <div class="flex items-center gap-3 pr-6 border-r border-white/10">
                    <div class="w-8 h-8 rounded-full bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center font-bold text-xs">
                        ${selectedIds.length}
                    </div>
                    <div class="text-[10px] uppercase tracking-widest font-bold text-[#d7c1c7]">Выбрано</div>
                </div>

                <div class="flex items-center gap-2">
                    <button id="bulk-update-price" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#ffb0cc]">
                        <span class="material-symbols-outlined text-base">payments</span>
                        Цена
                    </button>
                    <button id="bulk-toggle-status" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#d7c1c7]">
                        <span class="material-symbols-outlined text-base">visibility</span>
                        Статус
                    </button>
                    <button id="bulk-import-price" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#d7c1c7]">
                        <span class="material-symbols-outlined text-base">upload_file</span>
                        Импорт
                    </button>
                </div>

                <button id="bulk-close" class="ml-4 p-2 hover:bg-white/5 rounded-full transition-all text-[#d7c1c7]">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    container.querySelector('#bulk-update-price').onclick = () => {
        const value = prompt('Введите изменение цены (например, +10%, -500, или новую цену 15000):');
        if (value) callbacks.onUpdatePrice(value);
    };

    container.querySelector('#bulk-toggle-status').onclick = () => {
        callbacks.onToggleStatus();
    };

    container.querySelector('#bulk-import-price').onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) callbacks.onImportPrice(file);
        };
        input.click();
    };

    container.querySelector('#bulk-close').onclick = () => {
        callbacks.onClose();
    };
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/components/bulk-toolbar.js
git commit -m "feat(admin): add bulk actions toolbar component"
```

---

### Task 3: Integration in App

**Files:**
- Modify: `js/admin/app.js`

- [ ] **Step 1: Integrate the toolbar and import logic**
Add a container for the toolbar in `renderProductsView` and update the `onSelectionChange` handler.

```javascript
// Add imports
import { renderBulkToolbar } from './components/bulk-toolbar.js';
import { mergePriceListData } from './import-engine.js';

// Inside renderProductsView
// ...
container.innerHTML = `
    <div class="space-y-8 ...">
        ...
        <div class="glass ..." id="products-table-container">...</div>
        <div id="bulk-toolbar-container" class="hidden"></div>
    </div>
`;

const toolbarContainer = document.getElementById('bulk-toolbar-container');
let selectedIds = [];

const updateToolbar = () => {
    renderBulkToolbar(toolbarContainer, selectedIds, {
        onUpdatePrice: async (value) => {
            const updates = selectedIds.map(id => {
                const product = state.products.find(p => p.vid === id);
                let newPrice = product.vprice;
                
                if (value.endsWith('%')) {
                    const percent = parseFloat(value) / 100;
                    newPrice = Math.round(product.vprice * (1 + percent));
                } else if (value.startsWith('+') || value.startsWith('-')) {
                    newPrice = product.vprice + parseFloat(value);
                } else {
                    newPrice = parseFloat(value);
                }
                
                return { vid: id, vprice: newPrice };
            });
            
            await state.bulkUpdateProducts(updates);
            selectedIds = [];
            updateToolbar();
        },
        onToggleStatus: async () => {
            const updates = selectedIds.map(id => {
                const product = state.products.find(p => p.vid === id);
                const newStatus = product.vstatus === 'active' ? 'archived' : 'active';
                return { vid: id, vstatus: newStatus };
            });
            
            await state.bulkUpdateProducts(updates);
            selectedIds = [];
            updateToolbar();
        },
        onImportPrice: async (file) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const incomingData = JSON.parse(e.target.result);
                    const updates = mergePriceListData(state.products, incomingData);
                    if (updates.length > 0) {
                        await state.bulkUpdateProducts(updates);
                        alert(`Обновлено ${updates.length} товаров`);
                    } else {
                        alert('Нет данных для обновления');
                    }
                } catch (err) {
                    alert('Ошибка при разборе файла: ' + err.message);
                }
            };
            reader.readAsText(file);
        },
        onClose: () => {
            selectedIds = [];
            // Re-render table to clear checkboxes - or just clear them manually
            const checkboxes = document.querySelectorAll('.product-checkbox, #select-all-products');
            checkboxes.forEach(cb => cb.checked = false);
            updateToolbar();
        }
    });
};

// Update onSelectionChange in renderProductTable options
onSelectionChange: (ids) => {
    selectedIds = ids;
    updateToolbar();
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/app.js
git commit -m "feat(admin): integrate bulk actions and smart import"
```
