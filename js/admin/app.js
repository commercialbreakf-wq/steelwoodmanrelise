import { renderLayout } from './ui.js';
import { state } from './state.js';
import { renderProductTable } from './components/table.js';
import { openDrawer } from './components/drawer.js';
import { renderBulkToolbar } from './components/bulk-toolbar.js';
import { mergePriceListData } from './import-engine.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOrdersView } from './components/orders.js';
import { renderUsersView } from './components/users.js';
import { renderLeadsView } from './components/leads.js';
import { renderSupportView } from './components/support.js';

const initAdminApp = async () => {
    try {
        console.log('Admin App Initializing...');
        
        // Auth Check
        const token = localStorage.getItem('metal_token');
        if (!token) {
            window.location.href = '/#login';
            return;
        }
        
        renderLayout();
        
        const renderProductsView = async (container) => {
            container.innerHTML = `
                <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Управление каталогом</h3>
                            <p class="text-sm text-[#d7c1c7] mt-1">Полноценная CRM для редактирования базы данных</p>
                        </div>
                        <div class="flex gap-2">
                            <button id="refresh-products-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                                <span class="material-symbols-outlined text-sm">refresh</span>
                            </button>
                            <button id="export-excel-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-[#1e7145] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#1e7145]/80 transition-all shadow-xl shadow-[#1e7145]/10">
                                <span class="material-symbols-outlined text-base">download</span>
                                В эксель
                            </button>
                            <button id="add-product-btn" class="flex items-center justify-center gap-2 px-6 py-4 bg-[#ffb0cc] text-[#0f0e0c] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-[#ffb0cc]/10">
                                <span class="material-symbols-outlined text-base">add</span>
                                <span id="add-btn-text">Добавить товар</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="flex gap-1 bg-[#151311] p-1 rounded-2xl border border-white/5 w-fit">
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#ffb0cc] bg-white/5" data-tab="products">Товары</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="l1">Категории L1</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="l2">Категории L2</button>
                    </div>

                    <!-- CRM Search & Filters -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 glass rounded-3xl border-white/5" id="crm-controls">
                        <div class="md:col-span-2 relative">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#d7c1c7] opacity-40 text-lg">search</span>
                            <input type="text" id="crm-search" placeholder="Поиск по названию или ID..." class="w-full bg-[#151311] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#ffb0cc] outline-none transition-all">
                        </div>
                        <select id="crm-filter-l1" class="bg-[#151311] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#ffb0cc] outline-none">
                            <option value="">Все категории (L1)</option>
                        </select>
                        <select id="crm-filter-l2" class="bg-[#151311] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#ffb0cc] outline-none">
                            <option value="">Все подкатегории (L2)</option>
                        </select>
                    </div>

                    <div class="glass rounded-3xl overflow-hidden min-h-[500px]" id="products-table-container">
                        <div class="flex items-center justify-center h-[500px]">
                            <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                        </div>
                    </div>

                    <div id="bulk-toolbar-container" class="hidden"></div>
                </div>
            `;

            const tableContainer = document.getElementById('products-table-container');
            const toolbarContainer = document.getElementById('bulk-toolbar-container');
            const searchInput = document.getElementById('crm-search');
            const filterL1 = document.getElementById('crm-filter-l1');
            const filterL2 = document.getElementById('crm-filter-l2');
            const addBtn = document.getElementById('add-product-btn');
            const addBtnText = document.getElementById('add-btn-text');
            const exportBtn = document.getElementById('export-excel-btn');
            const refreshBtn = document.getElementById('refresh-products-btn');
            const controlsContainer = document.getElementById('crm-controls');
            
            let selectedIds = [];
            let currentProducts = [];
            let activeTab = 'products';

            const loadProducts = async () => {
                tableContainer.innerHTML = `
                    <div class="flex items-center justify-center h-[500px]">
                        <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                    </div>
                `;
                try {
                    currentProducts = await state.fetchProducts();
                    updateFilterOptions();
                    renderView();
                } catch (err) {
                    tableContainer.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-[500px] text-red-400 gap-4">
                            <span class="material-symbols-outlined text-4xl">error</span>
                            <div class="text-sm font-medium">${err.message}</div>
                            <button onclick="location.reload()" class="text-xs uppercase tracking-widest font-bold underline">Повторить попытку</button>
                        </div>
                    `;
                }
            };

            refreshBtn.onclick = loadProducts;

            const openCategoryDrawer = (type, oldData, onSave) => {
                const isEdit = !!oldData;
                const oldName = type === 'l1' ? oldData : (oldData ? oldData.name : '');
                const oldParent = type === 'l2' && oldData ? oldData.parent : '';

                let modalWrapper = document.getElementById('admin-modal-wrapper');
                if (!modalWrapper) {
                    modalWrapper = document.createElement('div');
                    modalWrapper.id = 'admin-modal-wrapper';
                    modalWrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
                    document.body.appendChild(modalWrapper);
                }

                const l1Categories = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort();

                modalWrapper.innerHTML = `
                    <div id="modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div id="modal-content" class="relative w-full max-w-md bg-[#1d1b19] border border-[#534347]/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0">
                        <div class="p-6 border-b border-[#534347]/20 flex items-center justify-between shrink-0">
                            <div>
                                <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight text-[#e7e2dd]">
                                    ${isEdit ? (type === 'l1' ? 'Редактирование категории L1' : 'Редактирование подкатегории L2') : (type === 'l1' ? 'Создание категории L1' : 'Создание подкатегории L2')}
                               </h3>
                                <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1">
                                    ${isEdit ? oldName : 'НОВАЯ ЗАПИСЬ'}
                                </div>
                            </div>
                            <button id="close-cat-modal" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors text-[#d7c1c7]">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            ${type === 'l2' ? `
                                <div class="space-y-2">
                                    <label class="text-[10px] uppercase opacity-50 text-[#d7c1c7]">Родительская категория (L1)</label>
                                    <select id="cat-parent-input" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd]">
                                        ${l1Categories.map(cat => `<option value="${cat}" ${oldParent === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                                    </select>
                                </div>
                            ` : ''}
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase opacity-50 text-[#d7c1c7]">Название ${type === 'l1' ? 'категории' : 'подкатегории'}</label>
                                <input type="text" id="cat-name-input" value="${oldName}" placeholder="Введите название..." class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd]">
                            </div>
                        </div>
                        <div class="p-6 border-t border-[#534347]/20 flex justify-end gap-4 bg-[#1d1b19] shrink-0 rounded-b-3xl">
                            <button type="button" id="cancel-cat" class="px-6 py-3 rounded-xl border border-[#534347]/30 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7]">Отмена</button>
                            <button type="button" id="save-cat" class="px-6 py-3 rounded-xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#ffb0cc]/10">
                                ${isEdit ? 'Сохранить' : 'Создать'}
                            </button>
                        </div>
                    </div>
                `;

                requestAnimationFrame(() => {
                    modalWrapper.classList.remove('opacity-0');
                    modalWrapper.querySelector('#modal-content').classList.remove('scale-95');
                });

                const close = () => {
                    modalWrapper.classList.add('opacity-0');
                    const content = modalWrapper.querySelector('#modal-content');
                    if (content) content.classList.add('scale-95');
                    setTimeout(() => modalWrapper.remove(), 300);
                };

                modalWrapper.querySelector('#close-cat-modal').onclick = close;
                modalWrapper.querySelector('#modal-backdrop').onclick = close;
                modalWrapper.querySelector('#cancel-cat').onclick = close;

                const saveBtn = modalWrapper.querySelector('#save-cat');
                saveBtn.onclick = async (e) => {
                    e.preventDefault();
                    const nameInput = modalWrapper.querySelector('#cat-name-input');
                    const newVal = nameInput.value.trim();
                    if (!newVal) {
                        alert('Название не может быть пустым');
                        return;
                    }

                    let result;
                    if (type === 'l1') {
                        result = newVal;
                    } else {
                        const parentInput = modalWrapper.querySelector('#cat-parent-input');
                        result = { name: newVal, parent: parentInput ? parentInput.value : '' };
                    }

                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Сохранение...';
                    try {
                        await onSave(result);
                        close();
                        await loadProducts();
                    } catch (err) {
                        alert('Ошибка: ' + err.message);
                        saveBtn.disabled = false;
                        saveBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
                    }
                };
            };

            const bindCategoryActions = (type) => {
                if (type === 'l1') {
                    document.querySelectorAll('.category-l1-card').forEach(card => {
                        card.onclick = () => {
                            const oldName = card.dataset.name;
                            openCategoryDrawer('l1', oldName, async (newName) => {
                                if (newName === oldName) return;
                                const updates = currentProducts.filter(p => p.parent_category === oldName).map(p => {
                                    const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                    return {
                                        id: p.id,
                                        parent_category: newName,
                                        ...(isPh ? { name: '📁 ' + newName } : {})
                                    };
                                });
                                if (updates.length > 0) {
                                    await state.bulkUpdateProducts(updates);
                                } else {
                                    const placeholder = currentProducts.find(p => p.parent_category === oldName && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                    if (placeholder) {
                                        await state.updateProduct(placeholder.id, { name: '📁 ' + newName, parent_category: newName });
                                    }
                                }
                                await loadProducts();
                            });
                        };
                    });

                    document.querySelectorAll('.edit-l1-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            btn.closest('.category-l1-card').click();
                        };
                    });

                    document.querySelectorAll('.delete-l1-btn').forEach(btn => {
                        btn.onclick = async (e) => {
                            e.stopPropagation();
                            const name = btn.dataset.name;
                            if (confirm(`Вы уверены, что хотите удалить категорию "${name}"? Вместе с ней будут удалены все подкатегории и товары.`)) {
                                const productsToDelete = currentProducts.filter(p => p.parent_category === name).map(p => p.id);
                                if (productsToDelete.length > 0) {
                                    await state.bulkDeleteProducts(productsToDelete);
                                }
                                await loadProducts();
                            }
                        };
                    });
                } else if (type === 'l2') {
                    document.querySelectorAll('.category-l2-card').forEach(card => {
                        card.onclick = () => {
                            const oldName = card.dataset.name;
                            const oldParent = card.dataset.parent;
                            openCategoryDrawer('l2', { name: oldName, parent: oldParent }, async ({ name: newName, parent: newParent }) => {
                                if (newName === oldName && newParent === oldParent) return;
                                const updates = currentProducts.filter(p => p.category === oldName && p.parent_category === oldParent).map(p => {
                                    const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                    return {
                                        id: p.id,
                                        category: newName,
                                        parent_category: newParent,
                                        ...(isPh ? { name: '📁 ' + newName } : {})
                                    };
                                });
                                if (updates.length > 0) {
                                    await state.bulkUpdateProducts(updates);
                                } else {
                                    const placeholder = currentProducts.find(p => p.category === oldName && p.parent_category === oldParent && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                    if (placeholder) {
                                        await state.updateProduct(placeholder.id, { name: '📁 ' + newName, category: newName, parent_category: newParent });
                                    }
                                }
                                await loadProducts();
                            });
                        };
                    });

                    document.querySelectorAll('.edit-l2-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            btn.closest('.category-l2-card').click();
                        };
                    });

                    document.querySelectorAll('.delete-l2-btn').forEach(btn => {
                        btn.onclick = async (e) => {
                            e.stopPropagation();
                            const name = btn.dataset.name;
                            if (confirm(`Вы уверены, что хотите удалить подкатегорию "${name}"? Вместе с ней будут удалены все вложенные товары.`)) {
                                const productsToDelete = currentProducts.filter(p => p.category === name && p.parent_category === btn.dataset.parent).map(p => p.id);
                                if (productsToDelete.length > 0) {
                                    await state.bulkDeleteProducts(productsToDelete);
                                }
                                await loadProducts();
                            }
                        };
                    });
                }
            };

            // Tab logic
            document.querySelectorAll('.product-tab').forEach(btn => {
                btn.onclick = () => {
                    document.querySelectorAll('.product-tab').forEach(b => b.classList.remove('text-[#ffb0cc]', 'bg-white/5'));
                    btn.classList.add('text-[#ffb0cc]', 'bg-white/5');
                    activeTab = btn.dataset.tab;
                    controlsContainer.style.display = activeTab === 'products' ? 'grid' : 'none';
                    if (activeTab === 'products') {
                        addBtnText.textContent = 'Добавить товар';
                    } else if (activeTab === 'l1') {
                        addBtnText.textContent = 'Добавить категорию L1';
                    } else if (activeTab === 'l2') {
                        addBtnText.textContent = 'Добавить подкатегорию L2';
                    }
                    renderView();
                };
            });

            const renderView = () => {
                if (activeTab === 'products') {
                    applyFilters();
                } else if (activeTab === 'l1') {
                    const l1s = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort();
                    tableContainer.innerHTML = `
                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px] content-start">
                            ${l1s.map(l => `
                                <div class="glass p-6 rounded-2xl flex items-center justify-between gap-4 hover:border-[#ffb0cc]/30 transition-all group bg-[#151311] cursor-pointer category-l1-card" data-name="${l}">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors">${l}</span>
                                        <span class="text-[10px] text-[#d7c1c7] opacity-60 mt-1">${currentProducts.filter(p => p.parent_category === l && p.vstatus !== 'archived').length} активных товаров</span>
                                    </div>
                                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="edit-l1-btn p-2 hover:text-[#ffb0cc] transition-colors" data-name="${l}" title="Редактировать">
                                            <span class="material-symbols-outlined text-base">edit</span>
                                        </button>
                                        <button class="delete-l1-btn p-2 hover:text-red-400 transition-colors" data-name="${l}" title="Удалить">
                                            <span class="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    bindCategoryActions('l1');
                } else if (activeTab === 'l2') {
                    const l2s = [...new Set(currentProducts.map(p => p.category).filter(Boolean))].sort();
                    tableContainer.innerHTML = `
                        <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[400px] content-start">
                            ${l2s.map(l => {
                                const sample = currentProducts.find(p => p.category === l);
                                const parent = sample ? sample.parent_category : '';
                                const count = currentProducts.filter(p => p.category === l && p.vstatus !== 'archived').length;
                                return `
                                    <div class="glass p-6 rounded-2xl flex items-center justify-between gap-4 hover:border-[#ffb0cc]/30 transition-all group bg-[#151311] cursor-pointer category-l2-card" data-name="${l}" data-parent="${parent}">
                                        <div class="flex flex-col">
                                            <span class="text-sm font font-bold text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors">${l}</span>
                                            <span class="text-[10px] text-[#ffb0cc]/70 font-bold mt-1">${parent || 'Без родителя'}</span>
                                            <span class="text-[10px] text-[#d7c1c7] opacity-60 mt-0.5">${count} активных товаров</span>
                                        </div>
                                        <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button class="edit-l2-btn p-2 hover:text-[#ffb0cc] transition-colors" data-name="${l}" data-parent="${parent}" title="Редактировать">
                                                <span class="material-symbols-outlined text-base">edit</span>
                                            </button>
                                            <button class="delete-l2-btn p-2 hover:text-red-400 transition-colors" data-name="${l}" data-parent="${parent}" title="Удалить">
                                                <span class="material-symbols-outlined text-base">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                    bindCategoryActions('l2');
                }
            };

            const updateFilterOptions = () => {
                const l1Set = new Set(currentProducts.map(p => p.parent_category).filter(Boolean));
                const l2Set = new Set(currentProducts.map(p => p.category).filter(Boolean));

                filterL1.innerHTML = '<option value="">Все категории (L1)</option>' + 
                    Array.from(l1Set).sort().map(l => `<option value="${l}">${l}</option>`).join('');
                
                filterL2.innerHTML = '<option value="">Все подкатегории (L2)</option>' + 
                    Array.from(l2Set).sort().map(l => `<option value="${l}">${l}</option>`).join('');
            };

            const applyFilters = () => {
                const search = searchInput.value.toLowerCase();
                const l1 = filterL1.value;
                const l2 = filterL2.value;

                const filtered = currentProducts.filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(search) || String(p.id).includes(search);
                    const matchesL1 = !l1 || p.parent_category === l1;
                    const matchesL2 = !l2 || p.category === l2;
                    return matchesSearch && matchesL1 && matchesL2;
                });
                updateTable(filtered);
            };

            searchInput.addEventListener('input', applyFilters);
            filterL1.addEventListener('change', applyFilters);
            filterL2.addEventListener('change', applyFilters);

            addBtn.onclick = () => {
                if (activeTab === 'products') {
                    openDrawer(null, async (newData) => {
                        await state.createProduct(newData);
                        await loadProducts();
                    });
                } else if (activeTab === 'l1') {
                    openCategoryDrawer('l1', null, async (newCatName) => {
                        const placeholder = {
                            id: 'cat_l1_' + Date.now(),
                            name: '📁 ' + newCatName,
                            parent_category: newCatName,
                            category: '',
                            price_ton: 0,
                            vstatus: 'active',
                            description: 'Системная категория L1'
                        };
                        await state.createProduct(placeholder);
                        await loadProducts();
                    });
                } else if (activeTab === 'l2') {
                    openCategoryDrawer('l2', null, async ({ name, parent }) => {
                        const placeholder = {
                            id: 'cat_l2_' + Date.now(),
                            name: '📁 ' + name,
                            parent_category: parent,
                            category: name,
                            price_ton: 0,
                            vstatus: 'active',
                            description: 'Системная подкатегория L2'
                        };
                        await state.createProduct(placeholder);
                        await loadProducts();
                    });
                }
            };

            exportBtn.onclick = () => {
                if (currentProducts.length === 0) {
                    alert('Нет данных для выгрузки');
                    return;
                }

                // Generate XML Spreadsheet 2003 format for perfect Excel column segmentation
                let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#534347"/>
   </Borders>
   <Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#534347" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StringCell">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
  </Style>
  <Style ss:ID="NumberCell">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:CharSet="204" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <NumberFormat ss:Format="Standard"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Каталог товаров">
  <Table>
   <Column ss:Width="120"/>
   <Column ss:Width="80"/>
   <Column ss:Width="150"/>
   <Column ss:Width="150"/>
   <Column ss:Width="200"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="80"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Статус</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Группа (L1)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Категория (L2)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Наименование (L3)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Цена (тонна)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Цена (ед)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ед. изм.</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Длина</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ширина</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Тип</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Вес</Data></Cell>
   </Row>`;

                const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

                currentProducts.forEach(p => {
                    const priceTon = Number(p.price_ton) || 0;
                    const priceUnit = Number(p.price_unit) || 0;
                    const statusText = p.vstatus === 'archived' ? 'Архив' : 'Активен';

                    xml += `\n   <Row ss:Height="22">
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.id)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(statusText)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.parent_category)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.category)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.name)}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${priceTon}</Data></Cell>
    <Cell ss:StyleID="NumberCell"><Data ss:Type="Number">${priceUnit}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.unit_label)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.length)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.width)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.type)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.weight)}</Data></Cell>
   </Row>`;
                });

                xml += `\n  </Table>
 </Worksheet>
</Workbook>`;

                const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `catalog_export_${new Date().toISOString().split('T')[0]}.xls`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            const updateToolbar = () => {
                renderBulkToolbar(toolbarContainer, selectedIds, {
                    onUpdatePrice: async (value) => {
                        const updates = selectedIds.map(id => {
                            const product = state.products.find(p => String(p.id) === String(id));
                            let newPrice = Number(product.price_ton || 0);
                            
                            if (value.endsWith('%')) {
                                const percent = parseFloat(value) / 100;
                                newPrice = Math.round(newPrice * (1 + percent));
                            } else if (value.startsWith('+') || value.startsWith('-')) {
                                newPrice = newPrice + parseFloat(value);
                            } else {
                                newPrice = parseFloat(value);
                            }
                            
                            return { id: id, price_ton: newPrice };
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
                            const product = state.products.find(p => String(p.id) === String(id));
                            const newStatus = product.vstatus === 'active' ? 'archived' : 'active';
                            return { id: id, vstatus: newStatus };
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
                            await state.updateProduct(product.id, updatedData);
                        });
                    },
                    onSelectionChange: (ids) => {
                        selectedIds = ids;
                        updateToolbar();
                    },
                    onDelete: async (id) => {
                        await state.deleteProduct(id);
                    }
                });
            };

            await loadProducts();

            // Subscribe to updates
            state.on('products:updated', (products) => {
                currentProducts = products;
                applyFilters();
            });
        };

        // Simple view switcher for now
        const initViewSwitcher = () => {
            const navItems = document.querySelectorAll('.nav-item');
            
            navItems.forEach(btn => {
                btn.addEventListener('click', () => {
                    try {
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
                            } else if (view === 'dashboard') {
                                renderDashboard(contentEl, state);
                            } else if (view === 'orders') {
                                renderOrdersView(contentEl, state);
                            } else if (view === 'users') {
                                renderUsersView(contentEl, state);
                            } else if (view === 'leads') {
                                renderLeadsView(contentEl, state);
                            } else if (view === 'support') {
                                renderSupportView(contentEl, state);
                            } else if (view === 'analytics') {
                                contentEl.innerHTML = `
                                    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        <div>
                                            <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Аналитика продаж</h3>
                                            <p class="text-sm text-[#d7c1c7] mt-1">Основные метрики и показатели эффективности</p>
                                        </div>

                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center">
                                                <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] mb-4">
                                                    <span class="material-symbols-outlined">payments</span>
                                                </div>
                                                <div class="text-3xl font-bold font-['Space Grotesk'] mb-1">—</div>
                                                <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Общая выручка</div>
                                            </div>
                                            <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center">
                                                <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] mb-4">
                                                    <span class="material-symbols-outlined">trending_up</span>
                                                </div>
                                                <div class="text-3xl font-bold font-['Space Grotesk'] mb-1">—</div>
                                                <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Средний чек</div>
                                            </div>
                                            <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center">
                                                <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] mb-4">
                                                    <span class="material-symbols-outlined">conversion_path</span>
                                                </div>
                                                <div class="text-3xl font-bold font-['Space Grotesk'] mb-1">—</div>
                                                <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Конверсия</div>
                                            </div>
                                        </div>

                                        <div class="glass rounded-[2.5rem] p-12 border-white/5 flex flex-col items-center justify-center text-center min-h-[400px]">
                                            <div class="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                                <span class="material-symbols-outlined text-4xl text-[#ffb0cc] animate-pulse">query_stats</span>
                                            </div>
                                            <h4 class="text-xl font-bold font-['Space Grotesk'] mb-2">Идет сбор данных</h4>
                                            <p class="text-sm text-[#d7c1c7] max-w-md opacity-60">Комплексные отчеты и графики будут доступны после накопления статистики за первый месяц работы системы.</p>
                                        </div>
                                    </div>
                                `;
                            }
                        }
                    } catch (e) {
                        console.error('Error switching views:', e);
                        alert('Ошибка переключения вида: ' + e.message);
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
    } catch (e) {
        console.error('Critical Error in initAdminApp:', e);
        document.getElementById('admin-app').innerHTML = `<div class="p-10 text-red-500">Critical Error: ${e.message}</div>`;
    }
};

// Export for debugging
export { initAdminApp };

// Execute immediately
initAdminApp();
