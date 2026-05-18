import { renderLayout } from './ui.js';
import { state } from './state.js';
import { renderProductTable } from './components/table.js';
import { openDrawer } from './components/drawer.js';
import { renderBulkToolbar } from './components/bulk-toolbar.js';
import { mergePriceListData } from './import-engine.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin App Initializing...');
    
    // In later tasks, we will add auth check here
    renderLayout();
    
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

                <div id="bulk-toolbar-container" class="hidden"></div>
            </div>
        `;

        const tableContainer = document.getElementById('products-table-container');
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
                    
                    try {
                        await state.bulkUpdateProducts(updates);
                        selectedIds = [];
                        updateToolbar();
                    } catch (err) {
                        alert('Ошибка при обновлении: ' + err.message);
                    }
                },
                onToggleStatus: async () => {
                    const updates = selectedIds.map(id => {
                        const product = state.products.find(p => p.vid === id);
                        const newStatus = product.vstatus === 'active' ? 'archived' : 'active';
                        return { vid: id, vstatus: newStatus };
                    });
                    
                    try {
                        await state.bulkUpdateProducts(updates);
                        selectedIds = [];
                        updateToolbar();
                    } catch (err) {
                        alert('Ошибка при обновлении: ' + err.message);
                    }
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
                                alert('Нет данных для обновления (все товары соответствуют или не найдены)');
                            }
                        } catch (err) {
                            alert('Ошибка при разборе файла (ожидается JSON): ' + err.message);
                        }
                    };
                    reader.readAsText(file);
                },
                onClose: () => {
                    selectedIds = [];
                    // Clear checkboxes in UI
                    const checkboxes = document.querySelectorAll('.product-checkbox, #select-all-products');
                    checkboxes.forEach(cb => {
                        cb.checked = false;
                        cb.indeterminate = false;
                    });
                    updateToolbar();
                }
            });
        };

        const updateTable = (products) => {
            renderProductTable(tableContainer, products, {
                onRowClick: (product) => {
                    openDrawer(product, async (updatedData) => {
                        await state.updateProduct(product.vid, updatedData);
                    });
                },
                onSelectionChange: (ids) => {
                    selectedIds = ids;
                    updateToolbar();
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

    // Simple view switcher for now
    const initViewSwitcher = () => {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                const label = btn.dataset.label;
                console.log('Switching to view:', view);
                
                // Update title
                const titleEl = document.getElementById('admin-title');
                if (titleEl) {
                    titleEl.textContent = label;
                }

                // Highlight active button
                navItems.forEach(b => b.classList.remove('bg-white/5', 'text-[#ffb0cc]'));
                btn.classList.add('bg-white/5', 'text-[#ffb0cc]');

                // Update content placeholder
                const contentEl = document.getElementById('admin-content');
                if (contentEl) {
                    if (view === 'products') {
                        renderProductsView(contentEl);
                    } else {
                        contentEl.innerHTML = `
                            <div class="flex items-center justify-center h-full opacity-30">
                                <div class="text-center">
                                    <span class="material-symbols-outlined text-6xl mb-4">construction</span>
                                    <div class="font-['Space Grotesk'] uppercase tracking-widest">Раздел "${label}" в разработке</div>
                                </div>
                            </div>
                        `;
                    }
                }
            });
        });

        // Default active view
        const dashboardBtn = document.querySelector('[data-view="dashboard"]');
        if (dashboardBtn) {
            dashboardBtn.click();
        }
    };

    initViewSwitcher();
});
