import { renderLayout } from './ui.js';
import { state } from './state.js?v=20260601b';
import { renderProductTable } from './components/table.js';
import { openDrawer } from './components/drawer.js?v=20260601c';
import { renderBulkToolbar, showConfirmPromptModal } from './components/bulk-toolbar.js?v=20260601b';
import { mergePriceListData, parseCSV, normalizeImportedProduct } from './import-engine.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOrdersView } from './components/orders.js';
import { renderUsersView } from './components/users.js';
import { renderLeadsView } from './components/leads.js';
import { renderSupportView } from './components/support.js';
import { renderParametersView } from './components/parameters.js?v=20260601b';
import { renderAnalyticsView } from './components/analytics.js';
import { showExportFormatModal } from './export-engine.js';

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
        
        const renderProductsView = async (container, initialTab) => {
            let activeTab = initialTab || 'products';
            container.innerHTML = `
                <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg md:text-xl font-bold font-['Space Grotesk'] tracking-tight text-on-surface">Управление каталогом</h3>
                            <p class="text-xs text-on-surface-variant mt-0.5">CRM для редактирования базы данных</p>
                        </div>
                        <div class="flex flex-wrap gap-2 items-center">
                            <button id="refresh-products-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low text-primary border border-outline/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all">
                                <span class="material-symbols-outlined text-sm">refresh</span>
                            </button>
                            <button id="export-excel-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low border border-outline/10 text-on-surface rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-surface-container-high transition-all">
                                <span class="material-symbols-outlined text-base">download</span>
                                <span class="hidden sm:inline">В эксель</span>
                            </button>
                            <button id="import-excel-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low border border-outline/10 text-on-surface rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-surface-container-high transition-all">
                                <span class="material-symbols-outlined text-base">upload_file</span>
                                <span class="hidden sm:inline">Из эксель</span>
                            </button>
                            <button id="add-product-btn" class="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-primary text-on-primary rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/10 shrink-0" title="Добавить товар">
                                <span class="material-symbols-outlined text-base">add</span>
                                <span id="add-btn-text" class="hidden">Добавить товар</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabs: Desktop row | Mobile arrow-navigator -->
                    <!-- Desktop tabs -->
                    <div class="hidden md:flex gap-1 bg-surface-container-low p-1 rounded-2xl border border-outline/10 w-full md:w-fit overflow-x-auto scrollbar-none max-w-full">
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'products' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}" data-tab="products">Товары</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'l1' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}" data-tab="l1">Категории L1</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'l2' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}" data-tab="l2">Категории L2</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'l3' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}" data-tab="l3">L3 (табы)</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'parameters' ? 'text-primary bg-primary/10' : 'text-on-surface-variant hover:text-primary'}" data-tab="parameters">Параметры</button>
                    </div>
                    <!-- Mobile tab navigator (arrow-switcher) -->
                    <div class="flex md:hidden items-center justify-between gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline/10">
                        <button id="tab-prev-btn" class="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-90">
                            <span class="material-symbols-outlined text-xl">chevron_left</span>
                        </button>
                        <div class="flex flex-col items-center gap-1 flex-1">
                            <span id="mobile-tab-label" class="font-bold uppercase text-[11px] tracking-widest text-primary">${activeTab === 'products' ? 'Товары' : activeTab === 'l1' ? 'Категории L1' : activeTab === 'l2' ? 'Категории L2' : activeTab === 'l3' ? 'L3 (табы)' : 'Параметры'}</span>
                            <div class="flex gap-1 mt-1">
                                <span class="w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'products' ? 'bg-primary scale-125' : 'bg-outline/30'}"></span>
                                <span class="w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'l1' ? 'bg-primary scale-125' : 'bg-outline/30'}"></span>
                                <span class="w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'l2' ? 'bg-primary scale-125' : 'bg-outline/30'}"></span>
                                <span class="w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'l3' ? 'bg-primary scale-125' : 'bg-outline/30'}"></span>
                                <span class="w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'parameters' ? 'bg-primary scale-125' : 'bg-outline/30'}"></span>
                            </div>
                        </div>
                        <button id="tab-next-btn" class="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-90">
                            <span class="material-symbols-outlined text-xl">chevron_right</span>
                        </button>
                    </div>

                    <!-- CRM Search & Filters -->
                    <div id="crm-controls" class="space-y-3">
                        <!-- Search + filter toggle row -->
                        <div class="flex gap-2 items-center">
                            <div class="relative flex-1">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-lg">search</span>
                                <input type="text" id="crm-search" placeholder="Поиск: название, ID, категория, марка, размер, параметры..." class="w-full bg-[#151311] border border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#964551] outline-none transition-all">
                            </div>
                            <button id="filter-toggle-btn" class="flex items-center gap-1.5 px-4 py-3 bg-surface-container-low border border-outline/10 rounded-xl font-bold uppercase text-[10px] tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shrink-0">
                                <span class="material-symbols-outlined text-base">tune</span>
                                <span class="hidden sm:inline">Фильтры</span>
                            </button>
                            <div class="relative shrink-0" id="col-toggle-wrapper">
                                <button id="col-toggle-btn" class="flex items-center gap-1.5 px-4 py-3 bg-surface-container-low border border-outline/10 rounded-xl font-bold uppercase text-[10px] tracking-widest text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shrink-0">
                                    <span class="material-symbols-outlined text-base">view_column</span>
                                    <span class="hidden sm:inline">Колонки</span>
                                </button>
                                <div id="col-toggle-dropdown" class="hidden absolute right-0 mt-2 bg-surface-container border border-outline/15 rounded-2xl p-4 shadow-2xl z-50 min-w-[200px] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div class="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-widest font-label-caps border-b border-outline/15 pb-2 mb-1 select-none">Показ колонок</div>
                                    <label class="flex items-center gap-3 text-xs font-bold text-on-surface cursor-pointer select-none">
                                        <input type="checkbox" data-col="parent_category" class="col-vis-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20">
                                        <span>Категория (L1)</span>
                                    </label>
                                    <label class="flex items-center gap-3 text-xs font-bold text-on-surface cursor-pointer select-none">
                                        <input type="checkbox" data-col="category" class="col-vis-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20">
                                        <span>Подкатегория (L2)</span>
                                    </label>
                                    <label class="flex items-center gap-3 text-xs font-bold text-on-surface cursor-pointer select-none">
                                        <input type="checkbox" data-col="vstatus" class="col-vis-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20">
                                        <span>Наличие</span>
                                    </label>
                                    <label class="flex items-center gap-3 text-xs font-bold text-on-surface cursor-pointer select-none">
                                        <input type="checkbox" data-col="price" class="col-vis-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20">
                                        <span>Цена (тонна)</span>
                                    </label>
                                    <label class="flex items-center gap-3 text-xs font-bold text-on-surface cursor-pointer select-none">
                                        <input type="checkbox" data-col="created_at" class="col-vis-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20">
                                        <span>Создан</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <!-- Filters panel: hidden by default, toggled on both mobile and desktop -->
                        <div id="crm-filters-panel" class="hidden">
                            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 glass rounded-3xl border-white/5 items-center">
                                <div class="md:col-span-4 lg:col-span-4">
                                    <select id="crm-filter-l1" class="bg-[#151311] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#964551] outline-none w-full">
                                        <option value="">Все категории (L1)</option>
                                    </select>
                                </div>
                                <div class="md:col-span-4 lg:col-span-4">
                                    <select id="crm-filter-l2" class="bg-[#151311] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#964551] outline-none w-full">
                                        <option value="">Все подкатегории (L2)</option>
                                    </select>
                                </div>
                                <div class="md:col-span-4 lg:col-span-4">
                                    <button id="reset-filters-btn" class="flex items-center justify-center gap-2 px-4 py-3 w-full bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_8px_20px_rgba(150, 69, 81,0.3)]" title="Сбросить фильтры">
                                        <span class="material-symbols-outlined text-base">filter_alt_off</span>
                                        <span class="text-[10px] uppercase tracking-widest">Сбросить фильтры</span>
                                    </button>
                                </div>
                                <!-- Dynamic Parameter Filters -->
                                <div id="crm-params-container" class="col-span-full grid grid-cols-1 md:grid-cols-3 gap-4 hidden"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Bulk toolbar: always above table -->
                    <div id="bulk-toolbar-container"></div>

                    <div class="glass rounded-3xl overflow-hidden min-h-[500px]" id="products-table-container">
                        <div class="flex items-center justify-center h-[500px]">
                            <div class="w-8 h-8 border-2 border-[#964551]/20 border-t-[#964551] rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            `;

            const tableContainer = document.getElementById('products-table-container');
            const toolbarContainer = document.getElementById('bulk-toolbar-container');
            const searchInput = document.getElementById('crm-search');
            const filterL1 = document.getElementById('crm-filter-l1');
            const filterL2 = document.getElementById('crm-filter-l2');
            const paramsContainer = document.getElementById('crm-params-container');
            const addBtn = document.getElementById('add-product-btn');
            const addBtnText = document.getElementById('add-btn-text');
            const importBtn = document.getElementById('import-excel-btn');
            const exportBtn = document.getElementById('export-excel-btn');
            const refreshBtn = document.getElementById('refresh-products-btn');
            const controlsContainer = document.getElementById('crm-controls');
            
            // Restore persisted selection from localStorage
            const SELECTION_STORAGE_KEY = 'metal_admin_selected_ids';
            const loadPersistedSelection = () => {
                try {
                    const stored = localStorage.getItem(SELECTION_STORAGE_KEY);
                    return stored ? JSON.parse(stored) : [];
                } catch (e) { return []; }
            };
            const savePersistedSelection = (ids) => {
                try {
                    localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(ids));
                } catch (e) {}
            };
            const clearPersistedSelection = () => {
                try { localStorage.removeItem(SELECTION_STORAGE_KEY); } catch (e) {}
            };

            let selectedIds = loadPersistedSelection();
            const COLUMN_STORAGE_KEY = 'metal_admin_visible_columns';
            const defaultVisibleCols = ['name', 'parent_category', 'category', 'vstatus', 'price', 'created_at'];
            let visibleColumns = (() => {
                try {
                    const stored = localStorage.getItem(COLUMN_STORAGE_KEY);
                    return stored ? JSON.parse(stored) : defaultVisibleCols;
                } catch (e) { return defaultVisibleCols; }
            })();
            const saveVisibleColumns = (cols) => {
                try {
                    localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(cols));
                } catch (e) {}
            };
            let currentProducts = [];
            let currentFilteredProducts = [];
            let currentPage = 1;
            let currentSortKey = '';
            let currentSortOrder = '';
            let currentStatusFilter = '';
            const pageSize = 20;
            let allParams = [];
            let activeParamFilters = {};
            let lastCatChecked = null;
            
            const handleCatSelectClick = (clickedId, event) => {
                const checkboxes = tableContainer.querySelectorAll('.cat-checkbox');
                const clickedCb = Array.from(checkboxes).find(c => c.dataset.id === clickedId);
                if (!clickedCb) return;

                const isRangeSelect = event.shiftKey || event.ctrlKey;
                const targetState = clickedCb.checked;

                if (isRangeSelect && lastCatChecked) {
                    // Scope range to same layout (desktop table vs mobile cards)
                    const scope = clickedCb.closest('table') || clickedCb.closest('.md\\:hidden') || tableContainer;
                    const cbArray = Array.from(scope.querySelectorAll('.cat-checkbox'));
                    const start = cbArray.findIndex(c => String(c.dataset.id) === String(clickedId));
                    const end = cbArray.findIndex(c => String(c.dataset.id) === String(lastCatChecked.dataset.id));

                    if (start !== -1 && end !== -1) {
                        const min = Math.min(start, end);
                        const max = Math.max(start, end);

                        for (let i = min; i <= max; i++) {
                            const targetCb = cbArray[i];
                            if (targetCb.checked !== targetState) {
                                targetCb.checked = targetState;
                                targetCb.dispatchEvent(new Event('change'));
                            }
                        }
                    }
                }
                
                lastCatChecked = clickedCb;
            };

            const getProductPriceMeter = (product) => {
                const pParsed = window.parseUniversalSpecs ? window.parseUniversalSpecs(product) : product;
                const lengthVal = pParsed.mLenVal || 6;
                const weightVal = pParsed.wUnitVal || 1;
                const calcType = pParsed.calcType || 'linear';
                
                let priceTon = parseFloat(product.price_ton) || 0;
                let priceUnit = parseFloat(product.price_unit) || 0;
                
                if (priceUnit === 0 && priceTon > 0 && weightVal > 0) {
                    priceUnit = Math.round((priceTon / 1000) * weightVal * (calcType === 'linear' ? lengthVal : 1));
                }
                
                if (calcType === 'linear' && lengthVal > 0) {
                    return priceUnit > 0 ? Math.round(priceUnit / lengthVal) : Math.round((priceTon / 1000) * weightVal);
                } else {
                    return priceUnit;
                }
            };

            const loadProducts = async () => {
                tableContainer.innerHTML = `
                    <div class="flex items-center justify-center h-[500px]">
                        <div class="w-8 h-8 border-2 border-[#964551]/20 border-t-[#964551] rounded-full animate-spin"></div>
                    </div>
                `;
                try {
                    const token = localStorage.getItem('metal_token');
                    const [products, params] = await Promise.all([
                        state.fetchProducts(),
                        fetch(`/api/admin/parameters?t=${Date.now()}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).then(r => r.json()).catch(() => [])
                    ]);
                    currentProducts = products;
                    allParams = Array.isArray(params) ? params : [];
                    
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

            window.loadProductsGlobal = loadProducts;

            refreshBtn.onclick = loadProducts;

            const exportDataToExcel = (dataToExport, type = 'products') => {
                // Открываем модалку выбора формата (XML / CSV / Excel / PDF).
                // Для товаров PDF дополнительно уточняет категории прайс-листа.
                showExportFormatModal(dataToExport, type, { allProducts: currentProducts });
            };

            if (exportBtn) {
                exportBtn.onclick = () => {
                    if (activeTab === 'products') {
                        let toExport = currentFilteredProducts && currentFilteredProducts.length > 0 ? currentFilteredProducts : currentProducts;
                        if (selectedIds && selectedIds.length > 0) {
                            toExport = currentProducts.filter(p => selectedIds.includes(String(p.id)));
                        }
                        exportDataToExcel(toExport, 'products');
                    } else if (activeTab === 'l1') {
                        const l1s = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                        exportDataToExcel(l1s.map(l => ({name: l})), 'l1');
                    } else if (activeTab === 'l2') {
                        const l2Set = new Set();
                        currentProducts.forEach(p => {
                            if (p.category) {
                                l2Set.add(JSON.stringify({name: p.category, parent: p.parent_category || ''}));
                            }
                        });
                        const l2s = Array.from(l2Set).map(s => JSON.parse(s)).sort((a,b) => a.name.localeCompare(b.name));
                        exportDataToExcel(l2s, 'l2');
                    }
                };
            }

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

                const l1Categories = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort((a, b) => a.localeCompare(b));

                modalWrapper.innerHTML = `
                    <div id="modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
                    <div id="modal-content" class="relative w-full max-w-md bg-[#1d1b19] border border-[#534347]/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0">
                        <div class="p-6 border-b border-[#534347]/20 flex items-center justify-between shrink-0">
                            <div>
                                <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight text-[#e7e2dd]">
                                    ${isEdit ? (type === 'l1' ? 'Редактирование категории L1' : 'Редактирование подкатегории L2') : (type === 'l1' ? 'Создание категории L1' : 'Создание подкатегории L2')}
                               </h3>
                                <div class="text-[10px] text-[#964551] uppercase font-['Space Grotesk'] tracking-widest mt-1">
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
                                    <select id="cat-parent-input" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#964551] outline-none transition-all text-sm font-bold text-[#e7e2dd]">
                                        ${l1Categories.map(cat => `<option value="${cat}" ${oldParent === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                                    </select>
                                </div>
                            ` : ''}
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase opacity-50 text-[#d7c1c7]">Название ${type === 'l1' ? 'категории' : 'подкатегории'}</label>
                                <input type="text" id="cat-name-input" value="${oldName}" placeholder="Введите название..." class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#964551] outline-none transition-all text-sm font-bold text-[#e7e2dd]">
                            </div>
                        </div>
                        <div class="p-6 border-t border-[#534347]/20 flex justify-end gap-4 bg-[#1d1b19] shrink-0 rounded-b-3xl">
                            <button type="button" id="cancel-cat" class="px-6 py-3 rounded-xl border border-[#534347]/30 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7]">Отмена</button>
                            <button type="button" id="save-cat" class="px-6 py-3 rounded-xl bg-[#964551] text-[#0f0e0c] hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#964551]/10">
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
                        window.showToast('Название не может быть пустым', 'warning', 'Валидация');
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
                        window.showToast('Ошибка: ' + err.message, 'error', 'Ошибка');
                        saveBtn.disabled = false;
                        saveBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
                    }
                };
            };

            const showCategoryParentSelectPopup = (l2Name, currentParent, el) => {
                document.querySelectorAll('.inline-parent-dropdown, .inline-parent-modal-wrapper').forEach(d => d.remove());

                const isMobile = window.innerWidth < 768;
                const l1s = [...new Set(state.products.map(p => p.parent_category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                let optionsHtml = l1s.map(cat => {
                    const isCurrent = currentParent === cat;
                    return `
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} transition-all flex items-center justify-between" data-value="${cat.replace(/"/g, '&quot;')}">
                            <span>${cat}</span>
                            ${isCurrent ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
                        </button>
                    `;
                }).join('');

                const addParentBtn = `
                    <div class="h-[1px] bg-outline/10 my-1"></div>
                    <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-primary transition-all flex items-center gap-1.5 add-parent-trigger-btn">
                        <span class="material-symbols-outlined text-[14px]">add</span>
                        <span>Добавить родителя...</span>
                    </button>
                `;

                let dropdownWrapper, dropdown;
                if (isMobile) {
                    dropdownWrapper = document.createElement('div');
                    dropdownWrapper.className = 'inline-parent-modal-wrapper fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300';
                    dropdown = document.createElement('div');
                    dropdown.className = 'inline-parent-dropdown relative w-full max-w-xs bg-surface-container border border-outline/20 rounded-[2rem] p-5 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 max-h-[70vh] text-on-surface';
                    dropdownWrapper.appendChild(dropdown);
                    document.body.appendChild(dropdownWrapper);
                } else {
                    dropdown = document.createElement('div');
                    dropdown.className = 'inline-parent-dropdown custom-dropdown-menu fixed rounded-2xl p-2 z-[10000] min-w-[200px] max-h-[320px] flex flex-col shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200';
                    const rect = el.getBoundingClientRect();
                    dropdown.style.left = `${rect.left + window.scrollX}px`;
                    dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
                    document.body.appendChild(dropdown);
                }

                const headerHtml = isMobile
                    ? `<div class="flex items-center justify-between pb-3 border-b border-outline/10 mb-3 select-none shrink-0">
                            <span class="text-xs font-bold text-primary uppercase tracking-widest font-label-caps">Родительская категория L1</span>
                            <button class="dropdown-close-btn w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                                <span class="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>`
                    : `<div class="flex items-center justify-between px-3 py-1.5 border-b border-outline/10 mb-1 select-none shrink-0">
                            <span class="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider font-label-caps">Родительская категория L1</span>
                            <button class="dropdown-close-btn w-6 h-6 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                                <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>`;

                dropdown.innerHTML = `
                    ${headerHtml}
                    <div class="dropdown-options-list overflow-y-auto custom-scrollbar flex-1 space-y-0.5 ${isMobile ? 'max-h-[45vh] space-y-1.5 pr-1' : 'max-h-[260px]'}">
                        ${optionsHtml}
                        ${addParentBtn}
                    </div>
                    <div class="add-parent-form-container hidden p-2 border-t border-outline/10 flex flex-col gap-2 shrink-0">
                        <input type="text" class="new-parent-input w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-3 py-2 text-xs focus:border-primary outline-none transition-all text-on-surface" placeholder="Название новой L1...">
                        <div class="flex justify-end gap-2">
                            <button class="cancel-add-parent px-3 py-1.5 rounded-lg border border-outline/10 hover:bg-surface-variant text-[9px] font-bold uppercase tracking-wider font-label-caps text-on-surface-variant">Отмена</button>
                            <button class="save-new-parent px-3 py-1.5 rounded-lg bg-primary text-on-primary text-[9px] font-bold uppercase tracking-wider font-label-caps">Создать</button>
                        </div>
                    </div>
                `;

                if (isMobile) {
                    requestAnimationFrame(() => {
                        dropdownWrapper.classList.remove('opacity-0');
                        dropdown.classList.remove('scale-95');
                    });
                    if (window.lockScrollGlobal) window.lockScrollGlobal();
                    dropdownWrapper.onclick = (ev) => {
                        if (ev.target === dropdownWrapper) cleanup();
                    };
                } else {
                    const dropRect = dropdown.getBoundingClientRect();
                    const rect = el.getBoundingClientRect();
                    if (dropRect.right > window.innerWidth) {
                        dropdown.style.left = `${window.innerWidth - dropRect.width - 16}px`;
                    }
                    if (dropRect.bottom > window.innerHeight) {
                        dropdown.style.top = `${rect.top + window.scrollY - dropRect.height - 4}px`;
                    }
                }

                const cleanup = () => {
                    if (isMobile) {
                        dropdownWrapper.classList.add('opacity-0');
                        dropdown.classList.add('scale-95');
                        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                        setTimeout(() => dropdownWrapper.remove(), 300);
                    } else {
                        dropdown.remove();
                    }
                    document.removeEventListener('click', closeDropdown, true);
                    window.removeEventListener('scroll', handleScroll, true);
                    window.removeEventListener('resize', handleResize);
                    document.removeEventListener('keydown', handleKeyDown, true);
                };

                const closeDropdown = (ev) => {
                    if (isMobile) return; // mobile uses backdrop onclick
                    if (dropdown.contains(ev.target) || ev.target === el || el.contains(ev.target)) {
                        return;
                    }
                    cleanup();
                };

                const handleScroll = (ev) => {
                    if (isMobile || dropdown.contains(ev.target)) return;
                    cleanup();
                };

                const handleResize = () => {
                    cleanup();
                };

                const handleKeyDown = (ev) => {
                    if (ev.key === 'Escape') {
                        cleanup();
                    }
                };

                dropdown.querySelector('.dropdown-close-btn').onclick = (ev) => {
                    ev.stopPropagation();
                    cleanup();
                };

                // Add parent trigger & inline form setup
                const triggerBtn = dropdown.querySelector('.add-parent-trigger-btn');
                const formContainer = dropdown.querySelector('.add-parent-form-container');
                const optionsList = dropdown.querySelector('.dropdown-options-list');
                const cancelBtn = dropdown.querySelector('.cancel-add-parent');
                const saveBtn = dropdown.querySelector('.save-new-parent');
                const input = dropdown.querySelector('.new-parent-input');

                triggerBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    optionsList.style.display = 'none';
                    formContainer.classList.remove('hidden');
                    input.focus();
                };

                cancelBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    optionsList.style.display = '';
                    formContainer.classList.add('hidden');
                    input.value = '';
                };

                const executeAddParent = async () => {
                    const newParentVal = input.value.trim();
                    if (!newParentVal) return;

                    cleanup();

                    try {
                        const placeholderId = 'cat_' + Date.now();
                        const placeholder = {
                            id: placeholderId,
                            name: '📁 ' + newParentVal,
                            parent_category: newParentVal,
                            category: null,
                            vstatus: 'active',
                            description: 'Системная заглушка для новой категории L1',
                            price_ton: 0,
                            price_unit: 0
                        };
                        await state.updateProduct(placeholderId, placeholder);

                        const updates = currentProducts.filter(p => p.category === l2Name && p.parent_category === currentParent).map(p => {
                            const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                            return {
                                id: p.id,
                                category: l2Name,
                                parent_category: newParentVal,
                                ...(isPh ? { name: '📁 ' + l2Name } : {})
                            };
                        });

                        if (updates.length > 0) {
                            await state.bulkUpdateProducts(updates);
                        } else {
                            const l2PlaceholderId = 'cat_' + (Date.now() + 1);
                            await state.updateProduct(l2PlaceholderId, {
                                id: l2PlaceholderId,
                                name: '📁 ' + l2Name,
                                category: l2Name,
                                parent_category: newParentVal,
                                vstatus: 'active',
                                description: 'Системная заглушка для новой подкатегории L2',
                                price_ton: 0,
                                price_unit: 0
                            });
                        }

                        window.showToast?.(`Категория «${newParentVal}» создана и назначена родителем для «${l2Name}»`, 'success', 'Категории');
                        await loadProducts();
                    } catch (err) {
                        window.showToast('Ошибка при создании категории L1: ' + err.message, 'error', 'Ошибка');
                    }
                };

                saveBtn.onclick = (ev) => {
                    ev.stopPropagation();
                    executeAddParent();
                };

                input.onkeydown = (ev) => {
                    if (ev.key === 'Enter') {
                        ev.preventDefault();
                        executeAddParent();
                    } else if (ev.key === 'Escape') {
                        ev.preventDefault();
                        cancelBtn.click();
                    }
                };

                dropdown.querySelectorAll('.custom-dropdown-item:not(.add-parent-trigger-btn)').forEach(btn => {
                    btn.onclick = async (ev) => {
                        ev.stopPropagation();
                        const newParent = btn.dataset.value;
                        cleanup();

                        if (newParent === currentParent) return;

                        try {
                            const updates = currentProducts.filter(p => p.category === l2Name && p.parent_category === currentParent).map(p => {
                                const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                return {
                                    id: p.id,
                                    category: l2Name,
                                    parent_category: newParent || null,
                                    ...(isPh ? { name: '📁 ' + l2Name } : {})
                                };
                            });

                            if (updates.length > 0) {
                                await state.bulkUpdateProducts(updates);
                            } else {
                                const placeholder = currentProducts.find(p => p.category === l2Name && p.parent_category === currentParent && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                if (placeholder) {
                                    await state.updateProduct(placeholder.id, { name: '📁 ' + l2Name, category: l2Name, parent_category: newParent || null });
                                }
                            }
                            window.showToast?.(`Родитель для «${l2Name}» изменен на «${newParent || 'Без родителя'}»`, 'success', 'Категории');
                            await loadProducts();
                        } catch (err) {
                            window.showToast('Ошибка при изменении родителя: ' + err.message, 'error', 'Ошибка');
                        }
                    };
                });

                // Attach event listeners using capture phase to catch clicks even if propagation is stopped
                setTimeout(() => {
                    document.addEventListener('click', closeDropdown, true);
                    window.addEventListener('scroll', handleScroll, true);
                    window.addEventListener('resize', handleResize);
                    document.addEventListener('keydown', handleKeyDown, true);
                }, 50);
            };

            // Helper: show centered popup for quick name editing on mobile
            const showNameEditPopup = (title, currentValue, onSave) => {
                let wrapper = document.getElementById('name-edit-popup-wrapper');
                if (wrapper) wrapper.remove();
                wrapper = document.createElement('div');
                wrapper.id = 'name-edit-popup-wrapper';
                wrapper.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300';
                wrapper.innerHTML = `
                    <div id="name-edit-popup" class="relative w-full max-w-xs bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-4 transform scale-95 transition-transform duration-300">
                        <div class="flex items-center justify-between">
                            <span class="text-xs font-bold text-primary uppercase tracking-widest font-label-caps">${title}</span>
                            <button id="name-edit-popup-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                                <span class="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                        <input type="text" id="name-edit-popup-input" value="${currentValue}" class="w-full bg-surface-container-lowest border border-outline/30 rounded-2xl px-4 py-3 focus:border-primary outline-none transition-all text-sm font-bold text-on-surface" placeholder="Введите название...">
                        <div class="flex justify-end gap-3">
                            <button id="name-edit-popup-cancel" class="px-5 py-2.5 rounded-xl border border-outline/20 hover:bg-surface-variant text-[10px] font-bold uppercase tracking-widest text-on-surface-variant transition-all">Отмена</button>
                            <button id="name-edit-popup-save" class="px-5 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all">Сохранить</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(wrapper);
                const popup = wrapper.querySelector('#name-edit-popup');
                const input = wrapper.querySelector('#name-edit-popup-input');
                requestAnimationFrame(() => {
                    wrapper.classList.remove('opacity-0');
                    popup.classList.remove('scale-95');
                    input.focus();
                    input.select();
                });
                const close = () => {
                    wrapper.classList.add('opacity-0');
                    popup.classList.add('scale-95');
                    if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                    setTimeout(() => wrapper.remove(), 300);
                };
                if (window.lockScrollGlobal) window.lockScrollGlobal();
                wrapper.querySelector('#name-edit-popup-close').onclick = close;
                wrapper.querySelector('#name-edit-popup-cancel').onclick = close;
                wrapper.onclick = (ev) => { if (ev.target === wrapper) close(); };
                const doSave = () => {
                    const val = input.value.trim();
                    if (!val) return;
                    close();
                    onSave(val);
                };
                wrapper.querySelector('#name-edit-popup-save').onclick = doSave;
                input.onkeydown = (ev) => {
                    if (ev.key === 'Enter') { ev.preventDefault(); doSave(); }
                    else if (ev.key === 'Escape') { ev.preventDefault(); close(); }
                };
            };

            const bindCategoryActions = (type) => {
                document.querySelectorAll('.cat-params-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        openCategoryParamsEditor(btn.dataset.level, btn.dataset.name, btn.dataset.parent || '');
                    };
                });
                if (type === 'l1') {
                    document.querySelectorAll('.category-l1-card').forEach(card => {
                        card.onclick = (e) => {
                            if (e.target.closest('.cat-select-cell') || e.target.closest('.cat-l1-name-cell') || e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
                            
                            const checkbox = card.querySelector('.cat-checkbox');
                            if (checkbox) {
                                checkbox.checked = !checkbox.checked;
                                handleCatSelectClick(checkbox.dataset.id, e);
                                checkbox.dispatchEvent(new Event('change'));
                            }
                        };
                    });

                    document.querySelectorAll('.cat-l1-name-cell').forEach(cell => {
                        cell.onclick = (e) => {
                            e.stopPropagation();
                            if (cell.querySelector('input')) return;

                            const oldName = cell.dataset.name;

                            if (window.innerWidth < 768) {
                                // Mobile: show popup
                                showNameEditPopup('Переименование категории L1', oldName, async (newName) => {
                                    if (!newName || newName === oldName) return;
                                    try {
                                        const updates = currentProducts.filter(p => p.parent_category === oldName).map(p => {
                                            const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                            return { id: p.id, parent_category: newName, ...(isPh ? { name: '📁 ' + newName } : {}) };
                                        });
                                        if (updates.length > 0) {
                                            await state.bulkUpdateProducts(updates);
                                        } else {
                                            const ph = currentProducts.find(p => p.parent_category === oldName && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                            if (ph) await state.updateProduct(ph.id, { name: '📁 ' + newName, parent_category: newName });
                                        }
                                        window.showToast?.(`Категория L1 переименована в «${newName}»`, 'success', 'Категории');
                                        await loadProducts();
                                    } catch (err) { window.showToast('Ошибка при переименовании: ' + err.message, 'error', 'Ошибка'); }
                                });
                                return;
                            }

                            // Desktop: inline input
                            const spanText = cell.querySelector('span:first-child');
                            const editIcon = cell.querySelector('.material-symbols-outlined');
                            if (editIcon) editIcon.style.display = 'none';

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'bg-surface-container-lowest border border-primary/50 text-xs px-2 py-0.5 rounded-lg outline-none text-on-surface font-bold min-w-[120px] max-w-full animate-in fade-in zoom-in-95 duration-150';
                            input.value = oldName;

                            spanText.innerHTML = '';
                            spanText.appendChild(input);
                            input.focus();
                            input.select();

                            const finishEdit = async (isSave) => {
                                if (input.parentNode === null) return;
                                const newName = input.value.trim();
                                spanText.innerHTML = oldName;
                                if (editIcon) editIcon.style.display = '';
                                if (!isSave || !newName || newName === oldName) return;
                                try {
                                    const updates = currentProducts.filter(p => p.parent_category === oldName).map(p => {
                                        const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                        return { id: p.id, parent_category: newName, ...(isPh ? { name: '📁 ' + newName } : {}) };
                                    });
                                    if (updates.length > 0) {
                                        await state.bulkUpdateProducts(updates);
                                    } else {
                                        const placeholder = currentProducts.find(p => p.parent_category === oldName && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                        if (placeholder) await state.updateProduct(placeholder.id, { name: '📁 ' + newName, parent_category: newName });
                                    }
                                    window.showToast?.(`Категория L1 переименована в «${newName}»`, 'success', 'Категории');
                                    await loadProducts();
                                } catch (err) { window.showToast('Ошибка при переименовании: ' + err.message, 'error', 'Ошибка'); }
                            };

                            input.onblur = () => finishEdit(true);
                            input.onkeydown = (ev) => {
                                if (ev.key === 'Enter') { ev.preventDefault(); finishEdit(true); }
                                else if (ev.key === 'Escape') { ev.preventDefault(); finishEdit(false); }
                            };
                        };
                    });

                    document.querySelectorAll('.edit-l1-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const oldName = btn.dataset.name;
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

                    document.querySelectorAll('.delete-l1-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const name = btn.dataset.name;
                            const isPlaceholder = (p) => String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                            const relatedProducts = currentProducts.filter(p => p.parent_category === name);
                            const realProductsCount = relatedProducts.filter(p => !isPlaceholder(p)).length;
                            const subcategories = [...new Set(relatedProducts.filter(p => p.category && !isPlaceholder(p)).map(p => p.category))];
                            const subcatCount = subcategories.length;

                            showConfirmPromptModal({
                                title: 'Удаление категории L1',
                                icon: 'delete',
                                text: `Вы уверены, что хотите удалить категорию "${name}"? Это действие безвозвратно удалит категорию, все её подкатегории (${subcatCount} шт.) и все товары в них (${realProductsCount} шт.).`,
                                confirmText: 'Удалить всё',
                                confirmClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            }, async () => {
                                const productsToDelete = relatedProducts.map(p => p.id);
                                if (productsToDelete.length > 0) {
                                    await state.bulkDeleteProducts(productsToDelete);
                                }
                                await loadProducts();
                            });
                        };
                    });
                } else if (type === 'l2') {
                    document.querySelectorAll('.category-l2-card').forEach(card => {
                        card.onclick = (e) => {
                            if (e.target.closest('.cat-select-cell') || e.target.closest('.cat-l2-name-cell') || e.target.closest('.cat-l2-parent-cell') || e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
                            
                            const checkbox = card.querySelector('.cat-checkbox');
                            if (checkbox) {
                                checkbox.checked = !checkbox.checked;
                                handleCatSelectClick(checkbox.dataset.id, e);
                                checkbox.dispatchEvent(new Event('change'));
                            }
                        };
                    });

                    document.querySelectorAll('.cat-l2-name-cell').forEach(cell => {
                        cell.onclick = (e) => {
                            e.stopPropagation();
                            if (cell.querySelector('input')) return;

                            const oldName = cell.dataset.name;
                            const oldParent = cell.dataset.parent;

                            if (window.innerWidth < 768) {
                                // Mobile: show popup
                                showNameEditPopup('Переименование подкатегории L2', oldName, async (newName) => {
                                    if (!newName || newName === oldName) return;
                                    try {
                                        const updates = currentProducts.filter(p => p.category === oldName && p.parent_category === oldParent).map(p => {
                                            const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                            return { id: p.id, category: newName, parent_category: oldParent, ...(isPh ? { name: '📁 ' + newName } : {}) };
                                        });
                                        if (updates.length > 0) {
                                            await state.bulkUpdateProducts(updates);
                                        } else {
                                            const ph = currentProducts.find(p => p.category === oldName && p.parent_category === oldParent && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                            if (ph) await state.updateProduct(ph.id, { name: '📁 ' + newName, category: newName, parent_category: oldParent });
                                        }
                                        window.showToast?.(`Подкатегория L2 переименована в «${newName}»`, 'success', 'Категории');
                                        await loadProducts();
                                    } catch (err) { window.showToast('Ошибка при переименовании: ' + err.message, 'error', 'Ошибка'); }
                                });
                                return;
                            }

                            // Desktop: inline input
                            const spanText = cell.querySelector('span:first-child');
                            const editIcon = cell.querySelector('.material-symbols-outlined');
                            if (editIcon) editIcon.style.display = 'none';

                            const input = document.createElement('input');
                            input.type = 'text';
                            input.className = 'bg-surface-container-lowest border border-primary/50 text-xs px-2 py-0.5 rounded-lg outline-none text-on-surface font-bold min-w-[120px] max-w-full animate-in fade-in zoom-in-95 duration-150';
                            input.value = oldName;

                            spanText.innerHTML = '';
                            spanText.appendChild(input);
                            input.focus();
                            input.select();

                            const finishEdit = async (isSave) => {
                                if (input.parentNode === null) return;
                                const newName = input.value.trim();
                                spanText.innerHTML = oldName;
                                if (editIcon) editIcon.style.display = '';
                                if (!isSave || !newName || newName === oldName) return;
                                try {
                                    const updates = currentProducts.filter(p => p.category === oldName && p.parent_category === oldParent).map(p => {
                                        const isPh = String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                                        return { id: p.id, category: newName, parent_category: oldParent, ...(isPh ? { name: '📁 ' + newName } : {}) };
                                    });
                                    if (updates.length > 0) {
                                        await state.bulkUpdateProducts(updates);
                                    } else {
                                        const placeholder = currentProducts.find(p => p.category === oldName && p.parent_category === oldParent && (String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная')));
                                        if (placeholder) await state.updateProduct(placeholder.id, { name: '📁 ' + newName, category: newName, parent_category: oldParent });
                                    }
                                    window.showToast?.(`Подкатегория L2 переименована в «${newName}»`, 'success', 'Категории');
                                    await loadProducts();
                                } catch (err) { window.showToast('Ошибка при переименовании: ' + err.message, 'error', 'Ошибка'); }
                            };

                            input.onblur = () => finishEdit(true);
                            input.onkeydown = (ev) => {
                                if (ev.key === 'Enter') { ev.preventDefault(); finishEdit(true); }
                                else if (ev.key === 'Escape') { ev.preventDefault(); finishEdit(false); }
                            };
                        };
                    });

                    document.querySelectorAll('.cat-l2-parent-cell').forEach(cell => {
                        cell.onclick = (e) => {
                            e.stopPropagation();
                            const l2Name = cell.dataset.name;
                            const currentParent = cell.dataset.parent;
                            showCategoryParentSelectPopup(l2Name, currentParent, cell);
                        };
                    });

                    document.querySelectorAll('.edit-l2-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const oldName = btn.dataset.name;
                            const oldParent = btn.dataset.parent;
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

                    document.querySelectorAll('.delete-l2-btn').forEach(btn => {
                        btn.onclick = (e) => {
                            e.stopPropagation();
                            const name = btn.dataset.name;
                            const parent = btn.dataset.parent;
                            const isPlaceholder = (p) => String(p.id).startsWith('cat_') || p.name.startsWith('📁') || p.description?.includes('Системная');
                            const relatedProducts = currentProducts.filter(p => p.category === name && p.parent_category === parent);
                            const realProductsCount = relatedProducts.filter(p => !isPlaceholder(p)).length;

                            showConfirmPromptModal({
                                title: 'Удаление подкатегории L2',
                                icon: 'delete',
                                text: `Вы уверены, что хотите удалить подкатегорию "${name}"? Это действие безвозвратно удалит подкатегорию и все товары в ней (${realProductsCount} шт.).`,
                                confirmText: 'Удалить всё',
                                confirmClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                            }, async () => {
                                const productsToDelete = relatedProducts.map(p => p.id);
                                if (productsToDelete.length > 0) {
                                    await state.bulkDeleteProducts(productsToDelete);
                                }
                                await loadProducts();
                            });
                        };
                    });
                }
            };

            // Tab logic
            const tabOrder = ['products', 'l1', 'l2', 'l3', 'parameters'];
            const tabLabels = { products: 'Товары', l1: 'Категории L1', l2: 'Категории L2', l3: 'L3 (табы)', parameters: 'Параметры' };

            const navigateToTab = (tab) => {
                if (tab === 'products') {
                    window.location.hash = 'products_nomenclature';
                } else if (tab === 'parameters') {
                    window.location.hash = 'products_parameters';
                } else {
                    window.location.hash = 'products_' + tab;
                }
            };

            document.querySelectorAll('.product-tab').forEach(btn => {
                btn.onclick = () => navigateToTab(btn.dataset.tab);
            });

            // Mobile arrow nav
            const tabPrevBtn = document.getElementById('tab-prev-btn');
            const tabNextBtn = document.getElementById('tab-next-btn');
            const mobileTabLabel = document.getElementById('mobile-tab-label');

            if (tabPrevBtn) {
                tabPrevBtn.onclick = () => {
                    const idx = tabOrder.indexOf(activeTab);
                    const prevTab = tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length];
                    navigateToTab(prevTab);
                };
            }
            if (tabNextBtn) {
                tabNextBtn.onclick = () => {
                    const idx = tabOrder.indexOf(activeTab);
                    const nextTab = tabOrder[(idx + 1) % tabOrder.length];
                    navigateToTab(nextTab);
                };
            }

            // Filter toggle — works on both mobile and desktop
            const filterToggleBtn = document.getElementById('filter-toggle-btn');
            const filtersPanelEl = document.getElementById('crm-filters-panel');

            if (filterToggleBtn && filtersPanelEl) {
                filterToggleBtn.onclick = () => {
                    const isOpen = !filtersPanelEl.classList.contains('hidden');
                    if (isOpen) {
                        filtersPanelEl.classList.add('hidden');
                        filterToggleBtn.classList.remove('text-primary', 'border-primary/30', 'bg-primary/10');
                    } else {
                        filtersPanelEl.classList.remove('hidden');
                        filterToggleBtn.classList.add('text-primary', 'border-primary/30', 'bg-primary/10');
                    }
                };
            }

            // Column toggler dropdown binding
            const colToggleBtn = document.getElementById('col-toggle-btn');
            const colToggleDropdown = document.getElementById('col-toggle-dropdown');
            const colToggleWrapper = document.getElementById('col-toggle-wrapper');

            if (colToggleBtn && colToggleDropdown && colToggleWrapper) {
                colToggleWrapper.style.display = activeTab === 'products' ? 'block' : 'none';

                colToggleBtn.onclick = (e) => {
                    e.stopPropagation();
                    const isHidden = colToggleDropdown.classList.contains('hidden');
                    if (isHidden) {
                        colToggleDropdown.classList.remove('hidden');
                        colToggleBtn.classList.add('text-primary', 'border-primary/30', 'bg-primary/10');
                    } else {
                        colToggleDropdown.classList.add('hidden');
                        colToggleBtn.classList.remove('text-primary', 'border-primary/30', 'bg-primary/10');
                    }
                };

                const closeColDropdown = (e) => {
                    if (!colToggleWrapper.contains(e.target)) {
                        colToggleDropdown.classList.add('hidden');
                        colToggleBtn.classList.remove('text-primary', 'border-primary/30', 'bg-primary/10');
                    }
                };
                document.addEventListener('click', closeColDropdown);
                
                const checkboxes = colToggleDropdown.querySelectorAll('.col-vis-checkbox');
                checkboxes.forEach(cb => {
                    const colKey = cb.dataset.col;
                    cb.checked = visibleColumns.includes(colKey);
                    
                    cb.onchange = () => {
                        const newCols = ['name'];
                        checkboxes.forEach(c => {
                            if (c.checked) newCols.push(c.dataset.col);
                        });
                        visibleColumns = newCols;
                        saveVisibleColumns(newCols);
                        renderCurrentPage();
                    };
                });
            }

            // Show/hide controls container based on active tab
            const filtersVisibleTabs = ['products'];
            if (controlsContainer) {
                controlsContainer.style.display = filtersVisibleTabs.includes(activeTab) ? 'block' : 'none';
            }

            // Hide "add" and "import" buttons on the L3 tab (L3 is auto-derived, not manually created)
            if (addBtn) addBtn.style.display = (activeTab === 'l3') ? 'none' : '';
            if (importBtn) importBtn.style.display = (activeTab === 'l3') ? 'none' : '';

            if (addBtnText) {
                if (activeTab === 'products') {
                    addBtnText.textContent = 'Добавить товар';
                } else if (activeTab === 'l1') {
                    addBtnText.textContent = 'Добавить категорию L1';
                } else if (activeTab === 'l2') {
                    addBtnText.textContent = 'Добавить подкатегорию L2';
                }
            }

            const getUniqueParamValues = (products, field) => {
                const values = new Set();
                products.forEach(p => {
                    if (p[field]) {
                        values.add(p[field].toString().trim());
                    }
                });
                return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
            };

            const getProductParamValue = (p, paramName) => {
                let specs = [];
                try {
                    if (typeof p.specs === 'string') {
                        specs = JSON.parse(p.specs);
                    } else if (Array.isArray(p.specs)) {
                        specs = p.specs;
                    }
                } catch (e) {}
                const normName = paramName.toLowerCase().trim();
                const match = specs.find(s => s && s[0] && s[0].toLowerCase().trim() === normName);
                if (match && match[1] !== undefined && match[1] !== null) {
                    return match[1].toString().trim();
                }
                // Fallback to direct database columns
                if (normName === 'размер' || normName === 'ширина') {
                    return p.width ? p.width.toString().trim() : '';
                }
                if (normName === 'длина') {
                    return p.length ? p.length.toString().trim() : '';
                }
                if (normName === 'марка стали' || normName === 'марка' || normName === 'тип') {
                    return p.type ? p.type.toString().trim() : '';
                }
                return '';
            };

            // ─── Category ↔ Parameters helpers ──────────────────────────────────
            const escapeHtml = (str) => {
                if (str === null || str === undefined) return '';
                return String(str)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            };

            const _isCatPlaceholder = (p) => String(p.id).startsWith('cat_') || (p.name || '').startsWith('📁') || (p.description || '').includes('Системная');

            // Parameters whose category_hint references this category name (L1 or L2)
            const getCategoryLinkedParams = (catName) => {
                if (!catName) return [];
                const n = catName.toLowerCase().trim();
                return allParams.filter(param => {
                    if (!param.category_hint) return false;
                    const hints = param.category_hint.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                    return hints.includes(n);
                });
            };

            // Real products belonging to a category path
            const getCategoryProducts = (level, name, parent) => {
                return currentProducts.filter(p => {
                    if (_isCatPlaceholder(p)) return false;
                    if (level === 'l1') return p.parent_category === name;
                    return p.category === name && (!parent || p.parent_category === parent);
                });
            };

            const _parseProductSpecs = (p) => {
                try {
                    if (typeof p.specs === 'string') return JSON.parse(p.specs) || [];
                    if (Array.isArray(p.specs)) return [...p.specs];
                } catch (e) {}
                return [];
            };

            const _setSpecValue = (specs, paramName, value) => {
                const norm = paramName.toLowerCase().trim();
                const idx = specs.findIndex(s => s && s[0] && s[0].toLowerCase().trim() === norm);
                const v = (value == null ? '' : String(value)).trim();
                if (!v) {
                    if (idx !== -1) specs.splice(idx, 1);
                } else if (idx !== -1) {
                    specs[idx] = [specs[idx][0] || paramName, v];
                } else {
                    specs.push([paramName, v]);
                }
                return specs;
            };

            // Small badges + edit button shown on each category card
            const renderCategoryParamsBadges = (level, name, parent) => {
                const linked = getCategoryLinkedParams(name);
                const dataName = (name || '').replace(/"/g, '&quot;');
                const dataParent = (parent || '').replace(/"/g, '&quot;');
                let badges;
                if (linked.length) {
                    const shown = linked.slice(0, 4).map(p =>
                        `<span class="px-2 py-0.5 rounded-lg bg-surface-variant text-on-surface-variant text-[9px] font-label-caps uppercase tracking-widest">${escapeHtml(p.name)}</span>`
                    ).join('');
                    const more = linked.length > 4 ? `<span class="text-[9px] text-on-surface-variant opacity-60 font-bold">+${linked.length - 4}</span>` : '';
                    badges = shown + more;
                } else {
                    badges = '<span class="text-[10px] text-on-surface-variant opacity-40">Параметры не привязаны</span>';
                }
                return `
                    <div class="flex flex-wrap items-center gap-1 mt-2">
                        <span class="material-symbols-outlined text-[14px] text-primary/60 mr-0.5">tune</span>
                        ${badges}
                        <button type="button" class="cat-params-btn ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all text-[9px] font-label-caps uppercase tracking-widest font-bold" data-level="${level}" data-name="${dataName}" data-parent="${dataParent}" title="Изменить значения параметров для товаров">
                            <span class="material-symbols-outlined text-[12px]">edit</span>
                            <span>Изменить</span>
                        </button>
                    </div>
                `;
            };

            // Modal: per-parameter editor of product values within a category
            const openCategoryParamsEditor = (level, name, parent) => {
                let modalWrapper = document.getElementById('category-params-editor-wrapper');
                if (modalWrapper) modalWrapper.remove();

                const linked = getCategoryLinkedParams(name);
                const catProducts = getCategoryProducts(level, name, parent).slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                const levelLabel = level === 'l1' ? 'Категория L1' : 'Подкатегория L2';

                modalWrapper = document.createElement('div');
                modalWrapper.id = 'category-params-editor-wrapper';
                modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
                document.body.appendChild(modalWrapper);

                // edits keyed by `${productId}|||${paramName}`
                const edits = {};

                const buildParamSection = (param) => {
                    const opts = (param.options || '').split(',').map(s => s.trim()).filter(Boolean);
                    const withVal = catProducts.filter(p => getProductParamValue(p, param.name)).length;
                    const rows = catProducts.map(p => {
                        const cur = getProductParamValue(p, param.name);
                        const pid = String(p.id).replace(/"/g, '&quot;');
                        const pname = param.name.replace(/"/g, '&quot;');
                        let field;
                        if (opts.length) {
                            field = `
                                <select class="cat-param-input w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2 py-1.5 text-xs focus:border-primary outline-none transition-all text-on-surface" data-pid="${pid}" data-pname="${pname}" data-initial="${escapeHtml(cur)}" style="color-scheme: dark;">
                                    <option value="" ${!cur ? 'selected' : ''}>— не задано —</option>
                                    ${opts.map(o => `<option value="${escapeHtml(o)}" ${cur === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
                                    ${cur && !opts.includes(cur) ? `<option value="${escapeHtml(cur)}" selected>${escapeHtml(cur)}</option>` : ''}
                                </select>`;
                        } else {
                            field = `<input type="text" class="cat-param-input w-full bg-surface-container-lowest border border-outline/20 rounded-lg px-2 py-1.5 text-xs focus:border-primary outline-none transition-all text-on-surface" value="${escapeHtml(cur)}" placeholder="${param.unit ? escapeHtml(param.unit) : 'значение'}" data-pid="${pid}" data-pname="${pname}" data-initial="${escapeHtml(cur)}">`;
                        }
                        return `
                            <div class="cat-param-row flex items-center gap-3 py-1.5" data-pname="${escapeHtml(param.name.toLowerCase())}" data-prodname="${escapeHtml((p.name || '').toLowerCase())}">
                                <div class="flex-1 min-w-0 flex items-center gap-2">
                                    <span class="text-[10px] text-on-surface-variant opacity-40 font-mono shrink-0">#${escapeHtml(String(p.id))}</span>
                                    <span class="text-xs text-on-surface truncate font-medium">${escapeHtml(p.name || '—')}</span>
                                </div>
                                <div class="w-40 shrink-0">${field}</div>
                            </div>`;
                    }).join('');

                    return `
                        <div class="cat-param-section border border-outline/10 rounded-2xl overflow-hidden bg-surface-container-low/40" data-pname="${escapeHtml(param.name.toLowerCase())}">
                            <div class="flex items-center justify-between gap-2 px-4 py-3 bg-surface-container-low/60 border-b border-outline/10">
                                <div class="flex items-center gap-2 min-w-0">
                                    <span class="font-bold text-sm text-on-surface truncate">${escapeHtml(param.name)}</span>
                                    ${param.unit ? `<span class="text-[10px] text-primary opacity-70 font-label-caps uppercase">${escapeHtml(param.unit)}</span>` : ''}
                                </div>
                                <span class="text-[10px] text-on-surface-variant opacity-60 shrink-0 font-label-caps uppercase tracking-widest">${withVal}/${catProducts.length} заполнено</span>
                            </div>
                            <div class="px-4 py-2 divide-y divide-outline/5 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                ${rows || '<div class="text-xs text-on-surface-variant opacity-40 py-3 text-center">Нет товаров в категории</div>'}
                            </div>
                        </div>`;
                };

                const emptyState = `
                    <div class="flex flex-col items-center justify-center text-center gap-3 py-10">
                        <span class="material-symbols-outlined text-4xl text-on-surface-variant opacity-30">link_off</span>
                        <div class="text-sm text-on-surface-variant opacity-70 max-w-xs">К этой категории не привязан ни один параметр.</div>
                        <div class="text-[11px] text-on-surface-variant opacity-50 max-w-xs">Откройте вкладку «Параметры» и добавьте «${escapeHtml(name)}» в категории нужного параметра.</div>
                    </div>`;

                const bodyContent = linked.length
                    ? `
                        <div class="relative group shrink-0">
                            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-50 text-sm">search</span>
                            <input type="text" id="cat-param-search" placeholder="Поиск товара..." autocomplete="off" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl pl-9 pr-4 py-2 text-xs focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                        </div>
                        <div id="cat-param-sections" class="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            ${linked.map(buildParamSection).join('')}
                        </div>`
                    : emptyState;

                modalWrapper.innerHTML = `
                    <div id="cat-param-editor-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div id="cat-param-editor-content" class="relative w-full max-w-2xl max-h-[90vh] bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                        <div class="p-4 sm:p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                            <div class="min-w-0">
                                <h3 class="font-headline-md text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface truncate">Параметры категории</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[10px] text-primary uppercase font-label-caps tracking-widest">${escapeHtml(name)}</span>
                                    <span class="text-[9px] text-on-surface-variant opacity-50 px-1.5 py-0.5 rounded border border-outline/15 font-label-caps uppercase">${levelLabel}</span>
                                    <span class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase">${catProducts.length} тов.</span>
                                </div>
                            </div>
                            <button id="close-cat-param-editor" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant shrink-0">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div class="p-4 sm:p-6 flex-1 flex flex-col gap-3 min-h-0">
                            ${bodyContent}
                        </div>
                        <div class="p-4 sm:p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-container rounded-b-3xl shrink-0">
                            <button id="cancel-cat-param-editor" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">Отмена</button>
                            <button id="save-cat-param-editor" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps ${linked.length ? '' : 'opacity-40 pointer-events-none'}">Сохранить</button>
                        </div>
                    </div>
                `;

                const close = () => {
                    modalWrapper.classList.add('opacity-0');
                    const c = modalWrapper.querySelector('#cat-param-editor-content');
                    if (c) c.classList.add('scale-95');
                    setTimeout(() => modalWrapper.remove(), 250);
                    document.removeEventListener('keydown', onKey);
                };
                const onKey = (e) => { if (e.key === 'Escape') close(); };
                document.addEventListener('keydown', onKey);

                modalWrapper.querySelector('#close-cat-param-editor').onclick = close;
                modalWrapper.querySelector('#cancel-cat-param-editor').onclick = close;
                modalWrapper.querySelector('#cat-param-editor-backdrop').onclick = close;

                // Track edits
                modalWrapper.querySelectorAll('.cat-param-input').forEach(inp => {
                    const handler = () => {
                        const pid = inp.dataset.pid;
                        const pname = inp.dataset.pname;
                        const initial = inp.dataset.initial || '';
                        const key = `${pid}|||${pname}`;
                        if ((inp.value || '').trim() === initial.trim()) {
                            delete edits[key];
                        } else {
                            edits[key] = inp.value;
                        }
                    };
                    inp.oninput = handler;
                    inp.onchange = handler;
                });

                // Search filter across product rows
                const searchInputEl = modalWrapper.querySelector('#cat-param-search');
                if (searchInputEl) {
                    searchInputEl.oninput = () => {
                        const q = searchInputEl.value.toLowerCase().trim();
                        modalWrapper.querySelectorAll('.cat-param-section').forEach(section => {
                            let anyVisible = false;
                            section.querySelectorAll('.cat-param-row').forEach(row => {
                                const match = !q || (row.dataset.prodname || '').includes(q);
                                row.style.display = match ? 'flex' : 'none';
                                if (match) anyVisible = true;
                            });
                            section.style.display = anyVisible ? '' : 'none';
                        });
                    };
                }

                // Save
                modalWrapper.querySelector('#save-cat-param-editor').onclick = async () => {
                    const keys = Object.keys(edits);
                    if (!keys.length) { close(); return; }

                    const updatesMap = {};
                    keys.forEach(key => {
                        const sep = key.indexOf('|||');
                        const pid = key.slice(0, sep);
                        const pname = key.slice(sep + 3);
                        if (!updatesMap[pid]) {
                            const prod = catProducts.find(p => String(p.id) === pid);
                            updatesMap[pid] = _parseProductSpecs(prod);
                        }
                        _setSpecValue(updatesMap[pid], pname, edits[key]);
                    });

                    const updates = Object.entries(updatesMap).map(([id, specs]) => ({ id, specs: JSON.stringify(specs) }));

                    const saveBtn = modalWrapper.querySelector('#save-cat-param-editor');
                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Сохранение...';
                    try {
                        await state.bulkUpdateProducts(updates);
                        window.showToast?.(`Обновлено товаров: ${updates.length}`, 'success', 'Параметры');
                        close();
                        await loadProducts();
                    } catch (err) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Сохранить';
                        window.showToast('Ошибка сохранения: ' + err.message, 'error', 'Ошибка');
                    }
                };

                requestAnimationFrame(() => {
                    modalWrapper.classList.remove('opacity-0');
                    const c = modalWrapper.querySelector('#cat-param-editor-content');
                    if (c) c.classList.remove('scale-95');
                });
            };

            const updateParamFilters = () => {
                const l1Val = filterL1 ? filterL1.value : '';
                const l2Val = filterL2 ? filterL2.value : '';

                if (!l1Val && !l2Val) {
                    if (paramsContainer) {
                        paramsContainer.innerHTML = '';
                        paramsContainer.classList.add('hidden');
                    }
                    activeParamFilters = {};
                    return;
                }

                // Filter products to find products under this category path
                const catProducts = currentProducts.filter(p => {
                    const matchesL1 = !l1Val || p.parent_category === l1Val;
                    const matchesL2 = !l2Val || p.category === l2Val;
                    return matchesL1 && matchesL2;
                });

                // Find active parameters from the parameter dictionary that match this category or subcategory
                const activeParamsForCat = allParams.filter(param => {
                    if (!param.category_hint) return false;
                    const hints = param.category_hint.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
                    const l1 = l1Val ? l1Val.toLowerCase() : '';
                    const l2 = l2Val ? l2Val.toLowerCase() : '';
                    return (l1 && hints.includes(l1)) || (l2 && hints.includes(l2));
                });

                // Only show parameters that actually have non-empty values in the current products
                const paramsToShow = activeParamsForCat.filter(param => {
                    return catProducts.some(p => getProductParamValue(p, param.name));
                });

                // Clean up activeParamFilters keys
                const newParamFilters = {};
                paramsToShow.forEach(param => {
                    if (activeParamFilters[param.name]) {
                        newParamFilters[param.name] = activeParamFilters[param.name];
                    }
                });
                activeParamFilters = newParamFilters;

                if (paramsToShow.length > 0 && paramsContainer) {
                    const existingSelects = paramsContainer.querySelectorAll('.crm-dynamic-param-filter');
                    const existingNames = Array.from(existingSelects).map(s => s.dataset.paramName);
                    const newNames = paramsToShow.map(p => p.name);
                    
                    const isSameStructure = existingNames.length === newNames.length && existingNames.every((name, idx) => name === newNames[idx]);
                    const visibleCount = paramsToShow.length;

                    if (isSameStructure) {
                        // Update in-place to preserve DOM and prevent closing/flicker
                        existingSelects.forEach((select, idx) => {
                            const param = paramsToShow[idx];
                            const val = activeParamFilters[param.name] || '';
                            
                            const uniqueValues = new Set();
                            catProducts.forEach(p => {
                                const v = getProductParamValue(p, param.name);
                                if (v) uniqueValues.add(v);
                            });
                            const sortedValues = Array.from(uniqueValues).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                            const optionsHtml = `<option value="">Все ${param.name.toLowerCase()}</option>` +
                                sortedValues.map(v => {
                                    const count = currentProducts.filter(p => {
                                        const matchesL1 = !l1Val || p.parent_category === l1Val;
                                        const matchesL2 = !l2Val || p.category === l2Val;
                                        if (!matchesL1 || !matchesL2) return false;

                                        const search = searchInput ? searchInput.value.toLowerCase() : '';
                                        const matchesSearch = !search || p.name.toLowerCase().includes(search) || String(p.id).includes(search);
                                        if (!matchesSearch) return false;

                                        const matchesStatus = !currentStatusFilter || (currentStatusFilter === 'active' && p.vstatus !== 'archived') || (currentStatusFilter === 'archived' && p.vstatus === 'archived');
                                        if (!matchesStatus) return false;

                                        for (const [paramName, filterVal] of Object.entries(activeParamFilters)) {
                                            if (paramName !== param.name && filterVal) {
                                                const pVal = getProductParamValue(p, paramName);
                                                if (pVal !== filterVal) return false;
                                            }
                                        }
                                        return getProductParamValue(p, param.name) === v;
                                    }).length;

                                    const isSelected = v === val;
                                    const isDisabled = count === 0 && !isSelected;
                                    return `<option value="${v}" ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled style="color: rgba(231, 226, 221, 0.3);"' : ''}>${v} (${count})</option>`;
                                }).join('');

                            select.innerHTML = optionsHtml;
                        });
                    } else {
                        // Full rebuild
                        let selectsHtml = '';
                        paramsToShow.forEach((param, idx) => {
                            let spanClass = 'md:col-span-3'; // fallback
                            if (visibleCount === 1) {
                                spanClass = 'md:col-span-11';
                            } else if (visibleCount === 2) {
                                spanClass = idx === 0 ? 'md:col-span-5' : 'md:col-span-6';
                            } else if (visibleCount === 3) {
                                spanClass = idx === 0 ? 'md:col-span-3' : 'md:col-span-4';
                            } else if (visibleCount === 4) {
                                spanClass = idx === 3 ? 'md:col-span-2' : 'md:col-span-3';
                            } else {
                                const baseSpan = Math.floor(11 / visibleCount);
                                const remainder = 11 % visibleCount;
                                const currentSpan = baseSpan + (idx < remainder ? 1 : 0);
                                spanClass = `md:col-span-${currentSpan}`;
                            }

                            const val = activeParamFilters[param.name] || '';
                            const uniqueValues = new Set();
                            catProducts.forEach(p => {
                                const v = getProductParamValue(p, param.name);
                                if (v) uniqueValues.add(v);
                            });
                            const sortedValues = Array.from(uniqueValues).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

                            const optionsHtml = `<option value="">Все ${param.name.toLowerCase()}</option>` +
                                sortedValues.map(v => {
                                    const count = currentProducts.filter(p => {
                                        const matchesL1 = !l1Val || p.parent_category === l1Val;
                                        const matchesL2 = !l2Val || p.category === l2Val;
                                        if (!matchesL1 || !matchesL2) return false;

                                        const search = searchInput ? searchInput.value.toLowerCase() : '';
                                        const matchesSearch = !search || p.name.toLowerCase().includes(search) || String(p.id).includes(search);
                                        if (!matchesSearch) return false;

                                        const matchesStatus = !currentStatusFilter || (currentStatusFilter === 'active' && p.vstatus !== 'archived') || (currentStatusFilter === 'archived' && p.vstatus === 'archived');
                                        if (!matchesStatus) return false;

                                        for (const [paramName, filterVal] of Object.entries(activeParamFilters)) {
                                            if (paramName !== param.name && filterVal) {
                                                const pVal = getProductParamValue(p, paramName);
                                                if (pVal !== filterVal) return false;
                                            }
                                        }
                                        return getProductParamValue(p, param.name) === v;
                                    }).length;

                                    const isSelected = v === val;
                                    const isDisabled = count === 0 && !isSelected;
                                    return `<option value="${v}" ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled style="color: rgba(231, 226, 221, 0.3);"' : ''}>${v} (${count})</option>`;
                                }).join('');

                            selectsHtml += `
                                <div class="${spanClass}">
                                    <select class="crm-dynamic-param-filter bg-[#151311] border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-[#964551] outline-none text-[#e7e2dd] w-full" data-param-name="${param.name.replace(/"/g, '&quot;')}">
                                        ${optionsHtml}
                                    </select>
                                </div>
                            `;
                        });

                        paramsContainer.innerHTML = selectsHtml + `
                            <div class="md:col-span-1 flex justify-center items-center">
                                <button id="reset-params-btn" class="flex items-center justify-center w-12 h-12 bg-[#964551]/10 border border-[#964551]/20 text-[#964551] rounded-2xl font-bold hover:bg-[#964551]/20 transition-all shrink-0" title="Сбросить параметры">
                                    <span class="material-symbols-outlined text-base">restart_alt</span>
                                </button>
                            </div>
                        `;

                        // Bind change handlers
                        paramsContainer.querySelectorAll('.crm-dynamic-param-filter').forEach(select => {
                            select.addEventListener('change', () => {
                                const paramName = select.dataset.paramName;
                                activeParamFilters[paramName] = select.value;
                                applyFilters();
                            });
                        });
                    }

                    // Bind reset params button click handler
                    const resetParamsBtn = paramsContainer.querySelector('#reset-params-btn');
                    if (resetParamsBtn) {
                        resetParamsBtn.onclick = () => {
                            activeParamFilters = {};
                            paramsContainer.querySelectorAll('.crm-dynamic-param-filter').forEach(select => {
                                select.value = '';
                            });
                            applyFilters();
                        };
                    }

                    paramsContainer.classList.remove('hidden');
                    paramsContainer.className = 'md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-4 items-center';
                } else if (paramsContainer) {
                    paramsContainer.innerHTML = '';
                    paramsContainer.classList.add('hidden');
                }
            };

            const saveFilters = () => {
                const filters = {
                    search: searchInput ? searchInput.value : '',
                    l1: filterL1 ? filterL1.value : '',
                    l2: filterL2 ? filterL2.value : '',
                    paramFilters: activeParamFilters,
                    statusFilter: currentStatusFilter
                };
                localStorage.setItem('metal_admin_product_filters', JSON.stringify(filters));
            };

            const loadFilters = () => {
                try {
                    const stored = localStorage.getItem('metal_admin_product_filters');
                    if (stored) {
                        const filters = JSON.parse(stored);
                        if (searchInput && filters.search !== undefined) searchInput.value = filters.search;
                        if (filterL1 && filters.l1 !== undefined) filterL1.value = filters.l1;
                        if (filterL2 && filters.l2 !== undefined) filterL2.value = filters.l2;
                        if (filters.statusFilter !== undefined) currentStatusFilter = filters.statusFilter;
                        if (filters.paramFilters !== undefined) activeParamFilters = filters.paramFilters;

                        updateParamFilters();
                    }
                } catch (e) {
                    console.error('Error loading filters:', e);
                }
            };

            const renderView = () => {
                if (activeTab === 'products') {
                    applyFilters();
                } else if (activeTab === 'l1') {
                    const search = searchInput.value.toLowerCase();
                    const l1s = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                    const filteredL1s = search ? l1s.filter(l => l.toLowerCase().includes(search)) : l1s;
                    tableContainer.innerHTML = `
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse hidden md:table">
                                <thead>
                                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                                        <th class="py-4 px-6 w-10 cursor-pointer header-select-cell">
                                            <input type="checkbox" id="select-all-cats" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                        </th>
                                        <th class="py-4 px-6 font-bold">Название категории (L1)</th>
                                        <th class="w-24"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline/5">
                                    ${filteredL1s.map(l => {
                                        const isChecked = selectedIds && selectedIds.includes(l);
                                        const selectedClass = isChecked ? ' bg-[#964551]/10 hover:bg-[#964551]/15' : ' hover:bg-on-surface/[0.02]';
                                        return `
                                        <tr class="group transition-colors cursor-pointer category-l1-card${selectedClass}" data-name="${l}">
                                            <td class="py-4 px-6 cat-select-cell" data-id="${l}">
                                                <input type="checkbox" class="cat-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id="${l}" ${isChecked ? 'checked' : ''}>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="flex items-center gap-1.5 group/cell">
                                                    <span class="cat-l1-name-cell cursor-pointer font-bold text-sm text-on-surface group-hover:text-primary hover:bg-primary/5 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5" data-name="${l.replace(/"/g, '&quot;')}">
                                                        <span>${l}</span>
                                                        <span class="material-symbols-outlined text-[14px] text-primary/50 opacity-0 group-hover/cell:opacity-100 transition-opacity">edit</span>
                                                    </span>
                                                </div>
                                                <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5">Активные товары: ${currentProducts.filter(p => p.parent_category === l && p.vstatus !== 'archived').length} шт.</div>
                                                ${renderCategoryParamsBadges('l1', l, '')}
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button class="edit-l1-btn p-2 hover:text-[#964551] transition-colors" data-name="${l}" title="Редактировать">
                                                        <span class="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button class="delete-l1-btn p-2 hover:text-red-400 transition-colors" data-name="${l}" title="Удалить">
                                                        <span class="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                            <!-- Mobile cards -->
                            <div class="md:hidden flex flex-col gap-3 p-3">
                                <div class="flex items-center gap-3 px-2 py-1">
                                    <input type="checkbox" id="select-all-cats" class="w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                    <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-label-caps">Выбрать все</span>
                                </div>
                                ${filteredL1s.map(l => {
                                    const isChecked = selectedIds && selectedIds.includes(l);
                                    const selectedClass = isChecked ? ' bg-[#964551]/10' : ' bg-surface-container-lowest';
                                    return `
                                    <div class="category-l1-card rounded-2xl p-4 border border-outline/5 transition-colors cursor-pointer${selectedClass}" data-name="${l}">
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex items-start gap-3 flex-1 min-w-0">
                                                <input type="checkbox" class="cat-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer mt-0.5 shrink-0" data-id="${l}" ${isChecked ? 'checked' : ''}>
                                                <div class="flex-1 min-w-0">
                                                    <div class="cat-l1-name-cell font-bold text-sm text-on-surface truncate" data-name="${l.replace(/"/g, '&quot;')}">${l}</div>
                                                    <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5">Активные товары: ${currentProducts.filter(p => p.parent_category === l && p.vstatus !== 'archived').length} шт.</div>
                                                    ${renderCategoryParamsBadges('l1', l, '')}
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-1 shrink-0">
                                                <button class="edit-l1-btn p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" data-name="${l}" title="Редактировать">
                                                    <span class="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button class="delete-l1-btn p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" data-name="${l}" title="Удалить">
                                                    <span class="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                      `;
                      bindCategoryActions('l1');
                      bindCatCheckboxes();
                  } else if (activeTab === 'l2') {
                      const search = searchInput.value.toLowerCase();
                      const l2s = [...new Set(currentProducts.map(p => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                      const filteredL2s = search ? l2s.filter(l => l.toLowerCase().includes(search)) : l2s;
                      tableContainer.innerHTML = `
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse hidden md:table">
                                <thead>
                                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                                        <th class="py-4 px-6 w-10 cursor-pointer header-select-cell">
                                            <input type="checkbox" id="select-all-cats" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                        </th>
                                        <th class="py-4 px-6 font-bold">Название подкатегории (L2)</th>
                                        <th class="py-4 px-6 font-bold">Родитель (L1)</th>
                                        <th class="w-24"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline/5">
                                    ${filteredL2s.map(l => {
                                        const sample = currentProducts.find(p => p.category === l);
                                        const parent = sample ? sample.parent_category : '';
                                        const count = currentProducts.filter(p => p.category === l && p.vstatus !== 'archived').length;
                                        // Use JSON string for ID to store both name and parent safely for checkboxes
                                        const catId = JSON.stringify({name: l, parent});
                                        const isChecked = selectedIds && selectedIds.includes(catId);
                                        const selectedClass = isChecked ? ' bg-[#964551]/10 hover:bg-[#964551]/15' : ' hover:bg-on-surface/[0.02]';
                                        return `
                                        <tr class="group transition-colors cursor-pointer category-l2-card${selectedClass}" data-name="${l}" data-parent="${parent}">
                                            <td class="py-4 px-6 cat-select-cell" data-id='${catId}'>
                                                <input type="checkbox" class="cat-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id='${catId}' ${isChecked ? 'checked' : ''}>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="flex items-center gap-1.5 group/cell">
                                                    <span class="cat-l2-name-cell cursor-pointer font-bold text-sm text-on-surface group-hover:text-primary hover:bg-primary/5 px-2 py-1 -mx-2 rounded-lg transition-all flex items-center gap-1.5" data-name="${l.replace(/"/g, '&quot;')}" data-parent="${parent.replace(/"/g, '&quot;')}">
                                                        <span>${l}</span>
                                                        <span class="material-symbols-outlined text-[14px] text-primary/50 opacity-0 group-hover/cell:opacity-100 transition-opacity">edit</span>
                                                    </span>
                                                </div>
                                                <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5">Активные товары: ${count} шт.</div>
                                                ${renderCategoryParamsBadges('l2', l, parent)}
                                            </td>
                                            <td class="py-4 px-6">
                                                <span class="cat-l2-parent-cell product-l1-badge cursor-pointer px-2.5 py-1 rounded-lg bg-surface-container border border-outline/10 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-[10px] text-on-surface-variant uppercase tracking-wider font-label-caps inline-flex items-center gap-1 select-none" data-name="${l.replace(/"/g, '&quot;')}" data-parent="${parent.replace(/"/g, '&quot;')}">
                                                    <span>${parent || 'Без родителя'}</span>
                                                    <span class="material-symbols-outlined text-[12px] opacity-60">expand_more</span>
                                                </span>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button class="edit-l2-btn p-2 hover:text-[#964551] transition-colors" data-name="${l}" data-parent="${parent}" title="Редактировать">
                                                        <span class="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button class="delete-l2-btn p-2 hover:text-red-400 transition-colors" data-name="${l}" data-parent="${parent}" title="Удалить">
                                                        <span class="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                            <!-- Mobile cards -->
                            <div class="md:hidden flex flex-col gap-3 p-3">
                                <div class="flex items-center gap-3 px-2 py-1">
                                    <input type="checkbox" id="select-all-cats" class="w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                    <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-label-caps">Выбрать все</span>
                                </div>
                                ${filteredL2s.map(l => {
                                    const sample = currentProducts.find(p => p.category === l);
                                    const parent = sample ? sample.parent_category : '';
                                    const count = currentProducts.filter(p => p.category === l && p.vstatus !== 'archived').length;
                                    const catId = JSON.stringify({name: l, parent});
                                    const isChecked = selectedIds && selectedIds.includes(catId);
                                    const selectedClass = isChecked ? ' bg-[#964551]/10' : ' bg-surface-container-lowest';
                                    return `
                                    <div class="category-l2-card rounded-2xl p-4 border border-outline/5 transition-colors cursor-pointer${selectedClass}" data-name="${l}" data-parent="${parent}">
                                        <div class="flex items-start justify-between gap-3">
                                            <div class="flex items-start gap-3 flex-1 min-w-0">
                                                <input type="checkbox" class="cat-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer mt-0.5 shrink-0" data-id='${catId}' ${isChecked ? 'checked' : ''}>
                                                <div class="flex-1 min-w-0">
                                                    <div class="cat-l2-name-cell font-bold text-sm text-on-surface truncate" data-name="${l.replace(/"/g, '&quot;')}" data-parent="${parent.replace(/"/g, '&quot;')}">${l}</div>
                                                    <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5 mb-2">Активные товары: ${count} шт.</div>
                                                    <span class="cat-l2-parent-cell cursor-pointer px-2 py-0.5 rounded-lg bg-surface-container border border-outline/10 text-[9px] text-on-surface-variant uppercase tracking-wider font-label-caps inline-flex items-center gap-1 select-none" data-name="${l.replace(/"/g, '&quot;')}" data-parent="${parent.replace(/"/g, '&quot;')}">
                                                        <span>${parent || 'Без родителя'}</span>
                                                        <span class="material-symbols-outlined text-[12px] opacity-60">expand_more</span>
                                                    </span>
                                                    ${renderCategoryParamsBadges('l2', l, parent)}
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-1 shrink-0">
                                                <button class="edit-l2-btn p-2.5 rounded-xl hover:bg-primary/10 text-primary transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" data-name="${l}" data-parent="${parent}" title="Редактировать">
                                                    <span class="material-symbols-outlined text-base">edit</span>
                                                </button>
                                                <button class="delete-l2-btn p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center" data-name="${l}" data-parent="${parent}" title="Удалить">
                                                    <span class="material-symbols-outlined text-base">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `}).join('')}
                            </div>
                        </div>
                    `;
                    bindCategoryActions('l2');
                    bindCatCheckboxes();
                } else if (activeTab === 'l3') {
                    const search = searchInput.value.toLowerCase();
                    // Group L3 values by their L2 category. l3 = "tabs" (e.g. Горячекатаный/Оцинкованный/Матовый/DIN)
                    const groups = {}; // catName -> Map(l3 -> count)
                    currentProducts.forEach(p => {
                        if (p.vstatus === 'archived') return;
                        const l3 = (p.l3 || '').toString().trim();
                        if (!l3) return;
                        const cat = p.category || '—';
                        if (!groups[cat]) groups[cat] = new Map();
                        groups[cat].set(l3, (groups[cat].get(l3) || 0) + 1);
                    });

                    let cats = Object.keys(groups).sort((a, b) => a.localeCompare(b));
                    if (search) {
                        cats = cats.filter(c => c.toLowerCase().includes(search) ||
                            [...groups[c].keys()].some(v => v.toLowerCase().includes(search)));
                    }

                    if (cats.length === 0) {
                        tableContainer.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-[400px] gap-4 text-center px-6">
                                <span class="material-symbols-outlined text-6xl text-on-surface-variant/30">tab_group</span>
                                <div class="text-on-surface-variant font-bold uppercase text-sm tracking-widest">Нет L3-вариантов (табов)</div>
                                <p class="text-on-surface-variant/60 text-xs max-w-md">L3 — это под-варианты внутри подкатегории (напр. «Горячекатаный», «Оцинкованный», «Матовый», стандарт DIN/SMS/ISO). Нажмите на таб, чтобы привязать к нему товары через поиск.</p>
                            </div>`;
                    } else {
                        tableContainer.innerHTML = `
                            <div class="p-4 md:p-6 space-y-5">
                                ${cats.map(cat => {
                                    const entries = [...groups[cat].entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }));
                                    const totalInCat = currentProducts.filter(p => p.category === cat && p.vstatus !== 'archived').length;
                                    const withL3 = entries.reduce((s, [, c]) => s + c, 0);
                                    return `
                                    <div class="bg-surface-container-lowest border border-outline/10 rounded-2xl overflow-hidden">
                                        <div class="flex items-center justify-between gap-3 px-5 py-3.5 bg-surface-container-low/40 border-b border-outline/10">
                                            <div class="flex items-center gap-2.5 min-w-0">
                                                <span class="material-symbols-outlined text-primary text-[20px]">tab</span>
                                                <span class="font-bold text-sm text-on-surface truncate">${cat}</span>
                                                <span class="text-[10px] text-on-surface-variant/60 uppercase tracking-widest shrink-0">${entries.length} ${entries.length === 1 ? 'таб' : 'таба(ов)'}</span>
                                            </div>
                                            <div class="flex items-center gap-2 shrink-0">
                                                <span class="text-[10px] text-on-surface-variant/50">${withL3} из ${totalInCat} тов.</span>
                                                <button class="l3-add-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-[10px] font-bold uppercase tracking-widest font-label-caps" data-cat="${cat.replace(/"/g, '&quot;')}" title="Создать новый таб в этой подкатегории">
                                                    <span class="material-symbols-outlined text-[15px]">add</span>
                                                    <span class="hidden sm:inline">Таб</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="p-4 flex flex-wrap gap-2.5">
                                            ${entries.map(([v, count]) => `
                                                <div class="l3-chip group flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl border border-primary/25 bg-primary/5 hover:border-primary/50 transition-all" data-cat="${cat.replace(/"/g, '&quot;')}" data-l3="${v.replace(/"/g, '&quot;')}">
                                                    <button class="l3-assign-btn flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-primary/10 transition-colors" title="Привязать товары к этому табу">
                                                        <span class="l3-chip-label font-bold text-xs text-on-surface outline-none rounded px-1" spellcheck="false">${v}</span>
                                                        <span class="text-[10px] font-bold text-white bg-primary px-1.5 py-0.5 rounded-md min-w-[22px] text-center">${count}</span>
                                                    </button>
                                                    <button class="l3-edit-btn w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/15 transition-colors" title="Переименовать таб (инлайн)">
                                                        <span class="material-symbols-outlined text-[15px]">edit</span>
                                                    </button>
                                                    <button class="l3-del-btn w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-colors" title="Убрать таб (очистить L3 у товаров)">
                                                        <span class="material-symbols-outlined text-[15px]">delete</span>
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>`;
                                }).join('')}
                            </div>`;

                        // Click a tab chip → open the product-search assignment popup
                        tableContainer.querySelectorAll('.l3-assign-btn').forEach(btn => {
                            btn.onclick = (e) => {
                                e.stopPropagation();
                                const chip = btn.closest('.l3-chip');
                                openL3AssignModal(chip.dataset.cat, chip.dataset.l3);
                            };
                        });

                        // Create a brand-new tab in a category, then immediately open the assignment popup
                        tableContainer.querySelectorAll('.l3-add-btn').forEach(btn => {
                            btn.onclick = (e) => {
                                e.stopPropagation();
                                const cat = btn.dataset.cat;
                                showConfirmPromptModal({
                                    icon: 'add',
                                    title: 'Новый таб (L3)',
                                    text: `Введите название нового таба для подкатегории «${cat}», затем привяжите к нему товары.`,
                                    confirmText: 'Создать и привязать',
                                    input: { placeholder: 'напр. Горячекатаный', value: '' }
                                }, (val) => {
                                    const name = (val || '').trim();
                                    if (!name) return;
                                    openL3AssignModal(cat, name);
                                });
                            };
                        });

                        // Inline rename a tab (no native prompt) — edits the label in place
                        tableContainer.querySelectorAll('.l3-edit-btn').forEach(btn => {
                            btn.onclick = (e) => {
                                e.stopPropagation();
                                const chip = btn.closest('.l3-chip');
                                const label = chip.querySelector('.l3-chip-label');
                                if (!label) return;
                                startInlineL3Rename(label, chip.dataset.cat, chip.dataset.l3);
                            };
                        });

                        // Clear L3 (remove the tab) for all products with this value
                        tableContainer.querySelectorAll('.l3-del-btn').forEach(btn => {
                            btn.onclick = (e) => {
                                e.stopPropagation();
                                const chip = btn.closest('.l3-chip');
                                const cat = chip.dataset.cat;
                                const l3v = chip.dataset.l3;
                                showConfirmPromptModal({
                                    icon: 'delete',
                                    title: 'Убрать таб',
                                    text: `Убрать таб «${l3v}» из категории «${cat}»? Товары останутся, но потеряют этот под-вариант (L3 очистится).`,
                                    confirmText: 'Убрать',
                                    confirmClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
                                }, async () => {
                                    const targets = currentProducts.filter(p => p.category === cat && (p.l3 || '') === l3v);
                                    if (targets.length === 0) return;
                                    const updates = targets.map(p => ({ ...p, l3: '' }));
                                    await state.bulkUpdateProducts(updates);
                                    if (window.showToast) window.showToast(`Таб «${l3v}» убран (${targets.length} тов.)`, 'success');
                                });
                            };
                        });
                    }
                }
            };
            
            const bindCatCheckboxes = () => {
                const selectAllEls = tableContainer.querySelectorAll('#select-all-cats');
                const checkboxes = tableContainer.querySelectorAll('.cat-checkbox');

                // Find all checkboxes sharing the same data-id (desktop row + mobile card)
                const getTwins = (id) => Array.from(checkboxes).filter(c => c.dataset.id === id);

                const updateRowHighlight = (cb) => {
                    getTwins(cb.dataset.id).forEach(box => {
                        const host = box.closest('tr') || box.closest('.category-l1-card') || box.closest('.category-l2-card');
                        if (!host) return;
                        if (cb.checked) {
                            host.classList.add('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                            host.classList.remove('hover:bg-on-surface/[0.02]', 'bg-surface-container-lowest');
                        } else {
                            host.classList.remove('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                            if (host.tagName === 'TR') {
                                host.classList.add('hover:bg-on-surface/[0.02]');
                            } else {
                                host.classList.add('bg-surface-container-lowest');
                            }
                        }
                    });
                };

                const syncDuplicates = (cb) => {
                    getTwins(cb.dataset.id).forEach(c => {
                        if (c !== cb) c.checked = cb.checked;
                    });
                };

                const recomputeSelection = () => {
                    const ids = new Set();
                    checkboxes.forEach(c => { if (c.checked) ids.add(c.dataset.id); });
                    selectedIds = Array.from(ids);
                    const uniqueIds = new Set(Array.from(checkboxes).map(c => c.dataset.id));
                    selectAllEls.forEach(sa => {
                        const allChecked = uniqueIds.size > 0 && selectedIds.length === uniqueIds.size;
                        sa.checked = allChecked;
                        sa.indeterminate = selectedIds.length > 0 && !allChecked;
                    });
                    updateToolbar();
                };

                tableContainer.querySelectorAll('.cat-select-cell, .header-select-cell').forEach(cell => {
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const cb = cell.querySelector('input[type="checkbox"]');
                        if (cb && e.target !== cb) {
                            cb.checked = !cb.checked;
                            if (cb.classList.contains('cat-checkbox')) {
                                handleCatSelectClick(cb.dataset.id, e);
                            }
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                });

                selectAllEls.forEach(selectAll => {
                    selectAll.addEventListener('change', () => {
                        checkboxes.forEach(cb => {
                            cb.checked = selectAll.checked;
                            updateRowHighlight(cb);
                        });
                        recomputeSelection();
                    });
                });

                checkboxes.forEach(cb => {
                    cb.addEventListener('click', (e) => {
                        handleCatSelectClick(cb.dataset.id, e);
                    });
                    cb.addEventListener('change', () => {
                        syncDuplicates(cb);
                        updateRowHighlight(cb);
                        recomputeSelection();
                    });
                });
            };

            const updateFilterL2Options = () => {
                const selectedL1 = filterL1.value;
                let filteredProducts = currentProducts;
                if (selectedL1) {
                    filteredProducts = currentProducts.filter(p => p.parent_category === selectedL1);
                }
                const l2Set = new Set(filteredProducts.map(p => p.category).filter(Boolean));
                
                const currentL2Val = filterL2.value;
                filterL2.innerHTML = `<option value="">Все подкатегории (L2) (${filteredProducts.filter(p => p.vstatus !== 'archived').length})</option>` + 
                    Array.from(l2Set).sort((a, b) => a.localeCompare(b)).map(l => {
                        const count = filteredProducts.filter(p => p.category === l && p.vstatus !== 'archived').length;
                        return `<option value="${l}">${l} (${count})</option>`;
                    }).join('');
                
                if (Array.from(l2Set).includes(currentL2Val)) {
                    filterL2.value = currentL2Val;
                } else {
                    filterL2.value = '';
                }
            };

            const updateFilterOptions = () => {
                const l1Set = new Set(currentProducts.map(p => p.parent_category).filter(Boolean));
                const totalCount = currentProducts.filter(p => p.vstatus !== 'archived').length;

                filterL1.innerHTML = `<option value="">Все категории (L1) (${totalCount})</option>` + 
                    Array.from(l1Set).sort((a, b) => a.localeCompare(b)).map(l => {
                        const count = currentProducts.filter(p => p.parent_category === l && p.vstatus !== 'archived').length;
                        return `<option value="${l}">${l} (${count})</option>`;
                    }).join('');
                
                updateFilterL2Options();
                loadFilters();
            };

            // Build a single searchable text blob for a product (name, id, categories, type, dimensions, all spec params)
            const buildSearchBlob = (p) => {
                if (p.__searchBlob) return p.__searchBlob;
                const parts = [
                    p.name,
                    p.id,
                    p.parent_category,
                    p.category,
                    p.type,
                    p.width,
                    p.length,
                    p.weight,
                    p.unit_label,
                    p.price_ton,
                    p.price_unit
                ];
                // Include all spec key/value pairs
                let specs = [];
                try {
                    if (typeof p.specs === 'string') specs = JSON.parse(p.specs);
                    else if (Array.isArray(p.specs)) specs = p.specs;
                } catch (e) {}
                if (Array.isArray(specs)) {
                    specs.forEach(s => {
                        if (Array.isArray(s)) { parts.push(s[0]); parts.push(s[1]); }
                    });
                }
                const blob = parts.filter(v => v !== undefined && v !== null && v !== '').join(' ').toLowerCase();
                // Cache on the object (non-enumerable so it won't leak into exports)
                try { Object.defineProperty(p, '__searchBlob', { value: blob, enumerable: false, configurable: true }); } catch (e) {}
                return blob;
            };

            // ─── L3 tab: inline rename (no native prompt, like renaming a file) ──
            const startInlineL3Rename = (labelEl, cat, oldL3) => {
                if (labelEl.dataset.editing === '1') return;
                labelEl.dataset.editing = '1';
                labelEl.setAttribute('contenteditable', 'plaintext-only');
                labelEl.classList.add('bg-surface-container', 'ring-1', 'ring-primary');

                // Select all text inside the label
                const range = document.createRange();
                range.selectNodeContents(labelEl);
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                labelEl.focus();

                let done = false;
                const finish = async (commit) => {
                    if (done) return;
                    done = true;
                    labelEl.removeAttribute('contenteditable');
                    labelEl.classList.remove('bg-surface-container', 'ring-1', 'ring-primary');
                    delete labelEl.dataset.editing;
                    const newL3 = (labelEl.textContent || '').trim();

                    if (!commit || !newL3 || newL3 === oldL3) {
                        labelEl.textContent = oldL3;
                        return;
                    }
                    const targets = currentProducts.filter(p => p.category === cat && (p.l3 || '') === oldL3);
                    if (targets.length === 0) { labelEl.textContent = oldL3; return; }
                    if (window.showToast) window.showToast(`Обновление ${targets.length} товаров...`, 'info');
                    try {
                        const updates = targets.map(p => ({ ...p, l3: newL3 }));
                        await state.bulkUpdateProducts(updates);
                        if (window.showToast) window.showToast(`Таб переименован: «${oldL3}» → «${newL3}»`, 'success');
                    } catch (err) {
                        if (window.showToast) window.showToast('Ошибка переименования: ' + err.message, 'error');
                        labelEl.textContent = oldL3;
                    }
                };

                labelEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); labelEl.blur(); }
                    else if (e.key === 'Escape') { e.preventDefault(); finish(false); labelEl.blur(); }
                });
                labelEl.addEventListener('blur', () => finish(true), { once: true });
            };

            // ─── L3 tab: click a tab → search products and mass-assign them to it ──
            const openL3AssignModal = (cat, l3Value) => {
                let modalWrapper = document.getElementById('l3-assign-modal');
                if (modalWrapper) modalWrapper.remove();

                modalWrapper = document.createElement('div');
                modalWrapper.id = 'l3-assign-modal';
                modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
                document.body.appendChild(modalWrapper);
                if (window.lockScrollGlobal) window.lockScrollGlobal();

                // Candidate products: everything in this L2 subcategory (active)
                const inCategory = currentProducts.filter(p => p.category === cat && p.vstatus !== 'archived');
                // Pre-select those already assigned to this tab
                const selected = new Set(inCategory.filter(p => (p.l3 || '') === l3Value).map(p => String(p.id)));

                modalWrapper.innerHTML = `
                    <div id="l3-assign-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
                    <div id="l3-assign-content" class="relative w-full max-w-lg max-h-[90vh] bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                        <div class="p-4 sm:p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                            <div class="min-w-0">
                                <h3 class="font-headline-md text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface truncate">Привязка к табу</h3>
                                <div class="text-[10px] text-primary uppercase font-label-caps tracking-widest mt-1 truncate">${escapeHtml(cat)} → ${escapeHtml(l3Value)}</div>
                            </div>
                            <button id="l3-assign-close" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant shrink-0">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div class="p-4 sm:p-6 space-y-3 flex-1 flex flex-col min-h-0">
                            <div class="relative group shrink-0">
                                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 text-sm group-focus-within:opacity-100 transition-opacity">search</span>
                                <input type="text" id="l3-assign-search" placeholder="Поиск товаров в «${escapeHtml(cat)}»..." autocomplete="off" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                            </div>
                            <div class="flex items-center justify-between shrink-0 px-1">
                                <label class="flex items-center gap-2 cursor-pointer select-none">
                                    <input type="checkbox" id="l3-assign-select-all" class="w-4 h-4 rounded border-outline/30 text-primary cursor-pointer">
                                    <span class="text-[10px] uppercase font-label-caps tracking-widest text-on-surface-variant">Выбрать все (видимые)</span>
                                </label>
                                <span id="l3-assign-count" class="text-[10px] font-bold text-primary uppercase tracking-widest"></span>
                            </div>
                            <div id="l3-assign-list" class="flex-1 min-h-[200px] overflow-y-auto custom-scrollbar pr-1 space-y-1.5"></div>
                        </div>

                        <div class="p-4 sm:p-6 border-t border-outline/10 flex justify-between items-center gap-3 bg-surface-container rounded-b-3xl shrink-0">
                            <span class="text-[10px] text-on-surface-variant/60 uppercase tracking-widest font-label-caps">Всего в подкатегории: ${inCategory.length}</span>
                            <div class="flex gap-3">
                                <button id="l3-assign-cancel" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">Отмена</button>
                                <button id="l3-assign-save" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">Применить</button>
                            </div>
                        </div>
                    </div>
                `;

                const listEl = modalWrapper.querySelector('#l3-assign-list');
                const searchEl = modalWrapper.querySelector('#l3-assign-search');
                const countEl = modalWrapper.querySelector('#l3-assign-count');
                const selectAllEl = modalWrapper.querySelector('#l3-assign-select-all');

                let visibleProducts = [];

                const updateCount = () => {
                    countEl.textContent = `Выбрано: ${selected.size}`;
                    if (visibleProducts.length > 0) {
                        selectAllEl.checked = visibleProducts.every(p => selected.has(String(p.id)));
                    } else {
                        selectAllEl.checked = false;
                    }
                };

                const renderList = () => {
                    const q = (searchEl.value || '').toLowerCase().trim();
                    const tokens = q.split(/\s+/).filter(Boolean);
                    visibleProducts = inCategory.filter(p => {
                        if (tokens.length === 0) return true;
                        const blob = buildSearchBlob(p);
                        return tokens.every(t => blob.includes(t));
                    }).slice(0, 300);

                    if (visibleProducts.length === 0) {
                        listEl.innerHTML = `<div class="flex flex-col items-center justify-center h-[200px] text-on-surface-variant/50 gap-2"><span class="material-symbols-outlined text-4xl">search_off</span><span class="text-xs uppercase tracking-widest font-label-caps">Ничего не найдено</span></div>`;
                        updateCount();
                        return;
                    }

                    listEl.innerHTML = visibleProducts.map(p => {
                        const id = String(p.id);
                        const isChecked = selected.has(id);
                        const curL3 = (p.l3 || '').trim();
                        const otherTab = curL3 && curL3 !== l3Value
                            ? `<span class="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider shrink-0">${escapeHtml(curL3)}</span>` : '';
                        return `
                            <label class="l3-assign-item flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer" data-id="${escapeHtml(id)}">
                                <input type="checkbox" class="l3-assign-cb w-5 h-5 rounded border-outline/30 text-primary cursor-pointer shrink-0" value="${escapeHtml(id)}" ${isChecked ? 'checked' : ''}>
                                <div class="flex-1 min-w-0">
                                    <div class="text-xs font-bold text-on-surface truncate">${escapeHtml(p.name || '—')}</div>
                                    <div class="text-[10px] text-on-surface-variant/50 font-mono truncate">#${escapeHtml(id)}</div>
                                </div>
                                ${otherTab}
                            </label>
                        `;
                    }).join('');

                    listEl.querySelectorAll('.l3-assign-cb').forEach(cb => {
                        cb.onchange = () => {
                            if (cb.checked) selected.add(cb.value); else selected.delete(cb.value);
                            updateCount();
                        };
                    });
                    updateCount();
                };

                searchEl.oninput = renderList;

                selectAllEl.onchange = () => {
                    const check = selectAllEl.checked;
                    visibleProducts.forEach(p => {
                        const id = String(p.id);
                        if (check) selected.add(id); else selected.delete(id);
                    });
                    listEl.querySelectorAll('.l3-assign-cb').forEach(cb => { cb.checked = check; });
                    updateCount();
                };

                const close = () => {
                    modalWrapper.classList.add('opacity-0');
                    modalWrapper.querySelector('#l3-assign-content').classList.add('scale-95');
                    if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                    setTimeout(() => modalWrapper.remove(), 300);
                };

                const save = async () => {
                    const saveBtn = modalWrapper.querySelector('#l3-assign-save');
                    // Products that should now have this L3
                    const shouldHave = new Set(selected);
                    const updates = [];
                    inCategory.forEach(p => {
                        const id = String(p.id);
                        const cur = (p.l3 || '');
                        if (shouldHave.has(id)) {
                            if (cur !== l3Value) updates.push({ ...p, l3: l3Value });
                        } else if (cur === l3Value) {
                            // Was assigned to this tab, now unchecked → clear it
                            updates.push({ ...p, l3: '' });
                        }
                    });

                    if (updates.length === 0) {
                        if (window.showToast) window.showToast('Изменений нет', 'info');
                        close();
                        return;
                    }

                    saveBtn.disabled = true;
                    saveBtn.textContent = 'Применение...';
                    try {
                        await state.bulkUpdateProducts(updates);
                        if (window.showToast) window.showToast(`Таб «${l3Value}»: обновлено ${updates.length} тов.`, 'success');
                        close();
                        // products:updated → applyFilters → renderView re-renders the L3 tab
                    } catch (err) {
                        saveBtn.disabled = false;
                        saveBtn.textContent = 'Применить';
                        if (window.showToast) window.showToast('Ошибка: ' + err.message, 'error');
                    }
                };

                modalWrapper.querySelector('#l3-assign-backdrop').onclick = close;
                modalWrapper.querySelector('#l3-assign-close').onclick = close;
                modalWrapper.querySelector('#l3-assign-cancel').onclick = close;
                modalWrapper.querySelector('#l3-assign-save').onclick = save;

                renderList();
                requestAnimationFrame(() => {
                    modalWrapper.classList.remove('opacity-0');
                    modalWrapper.querySelector('#l3-assign-content').classList.remove('scale-95');
                    searchEl.focus();
                });
            };

            const applyFilters = () => {
                saveFilters();

                if (activeTab === 'l1' || activeTab === 'l2' || activeTab === 'l3') {
                    renderView();
                    return;
                }

                updateParamFilters();

                const rawSearch = searchInput.value.trim().toLowerCase();
                // Split into tokens so "арматура 12" matches products containing both "арматура" and "12"
                const tokens = rawSearch.split(/\s+/).filter(Boolean);
                const l1 = filterL1.value;
                const l2 = filterL2.value;

                const filtered = currentProducts.filter(p => {
                    const matchesSearch = tokens.length === 0 || (() => {
                        const blob = buildSearchBlob(p);
                        return tokens.every(t => blob.includes(t));
                    })();
                    const matchesL1 = !l1 || p.parent_category === l1;
                    const matchesL2 = !l2 || p.category === l2;
                    const matchesStatus = !currentStatusFilter || (currentStatusFilter === 'active' && p.vstatus !== 'archived') || (currentStatusFilter === 'archived' && p.vstatus === 'archived');
                    
                    let matchesParams = true;
                    for (const [paramName, filterVal] of Object.entries(activeParamFilters)) {
                        if (filterVal) {
                            const pVal = getProductParamValue(p, paramName);
                            if (pVal !== filterVal) {
                                matchesParams = false;
                                break;
                            }
                        }
                    }

                    return matchesSearch && matchesL1 && matchesL2 && matchesStatus && matchesParams;
                });
                
                currentPage = 1;
                currentFilteredProducts = filtered;
                // Clear selection when filters change (new search context)
                // But keep selection if only page changes
                renderCurrentPage();
            };

            const renderCurrentPage = () => {
                let sortedProducts = [...currentFilteredProducts];
                if (currentSortKey) {
                    sortedProducts.sort((a, b) => {
                        let valA = a[currentSortKey] === undefined || a[currentSortKey] === null ? '' : a[currentSortKey];
                        let valB = b[currentSortKey] === undefined || b[currentSortKey] === null ? '' : b[currentSortKey];

                        if (currentSortKey === 'price_ton' || currentSortKey === 'price_unit') {
                            valA = Number(valA || 0);
                            valB = Number(valB || 0);
                            if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
                            if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
                            return 0;
                        } else if (currentSortKey === 'price_meter') {
                            valA = getProductPriceMeter(a);
                            valB = getProductPriceMeter(b);
                            if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
                            if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
                            return 0;
                        } else if (currentSortKey === 'created_at') {
                            valA = valA ? new Date(valA).getTime() : 0;
                            valB = valB ? new Date(valB).getTime() : 0;
                            if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
                            if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
                            return 0;
                        } else {
                            valA = String(valA);
                            valB = String(valB);
                            return currentSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
                        }
                    });
                }

                const start = (currentPage - 1) * pageSize;
                const end = start + pageSize;
                const pageItems = sortedProducts.slice(start, end);
                updateTable(pageItems);
                updatePaginationUI(currentFilteredProducts.length);
            };

            window.adminChangePage = (p) => {
                currentPage = p;
                // Preserve selectedIds across page navigation - do NOT reset
                renderCurrentPage();
            };

            const updatePaginationUI = (totalItems) => {
                const totalPages = Math.ceil(totalItems / pageSize) || 1;
                let container = document.getElementById('admin-pagination');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'admin-pagination';
                    tableContainer.parentNode.insertBefore(container, tableContainer.nextSibling);
                }
                container.className = 'flex items-center justify-between p-4 bg-surface-container-low border-t border-outline/10 rounded-b-3xl mt-0';
                
                if (totalItems === 0) {
                    container.innerHTML = '<span class="text-xs text-on-surface-variant opacity-60">Нет товаров</span>';
                    return;
                }

                const startIdx = (currentPage - 1) * pageSize + 1;
                const endIdx = Math.min(currentPage * pageSize, totalItems);

                const selCountHtml = selectedIds.length > 0
                    ? `<div class="flex items-center gap-1.5 text-xs font-bold text-primary animate-in fade-in duration-300">
                            <span class="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] font-bold">${selectedIds.length}</span>
                            <span class="uppercase tracking-widest font-label-caps opacity-80">выбрано всего</span>
                        </div>`
                    : `<div class="text-xs text-on-surface-variant opacity-60">Показано ${startIdx}-${endIdx} из ${totalItems}</div>`;

                container.innerHTML = `
                    ${selCountHtml}
                    <div class="flex items-center gap-2">
                        <button onclick="window.adminChangePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="p-2 rounded-xl border border-outline/10 hover:bg-on-surface/[0.05] text-on-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <span class="text-xs font-bold text-primary min-w-[30px] text-center">${currentPage} / ${totalPages}</span>
                        <button onclick="window.adminChangePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} class="p-2 rounded-xl border border-outline/10 hover:bg-on-surface/[0.05] text-on-surface transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                `;
            };

            let searchDebounceTimer = null;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(applyFilters, 180);
            });
            filterL1.addEventListener('change', () => {
                if (filterL1.value === '') {
                    filterL2.value = '';
                }
                activeParamFilters = {}; // Reset dynamic parameter filters when category changes
                updateFilterL2Options();
                updateParamFilters();
                applyFilters();
            });
            filterL2.addEventListener('change', () => {
                const selectedL2 = filterL2.value;
                if (selectedL2 && !filterL1.value) {
                    const prod = currentProducts.find(p => p.category === selectedL2);
                    if (prod && prod.parent_category) {
                        filterL1.value = prod.parent_category;
                        updateFilterL2Options();
                    }
                }
                activeParamFilters = {}; // Reset dynamic parameter filters when subcategory changes
                updateParamFilters();
                applyFilters();
            });
            
            const resetFiltersBtn = document.getElementById('reset-filters-btn');
            if (resetFiltersBtn) {
                resetFiltersBtn.onclick = () => {
                    if (filterL1) filterL1.value = '';
                    if (filterL2) filterL2.value = '';
                    updateFilterL2Options();
                    activeParamFilters = {};
                    updateParamFilters();
                    applyFilters();
                };
            }
            // Event listeners are bound dynamically to crm-dynamic-param-filter elements

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

            // Matrix Import Helper Functions
            const calculateImportDiff = (currentProducts, incomingData, activeTab) => {
                const added = [];
                const updated = [];
                const removed = [];
                const unchanged = [];
                
                if (activeTab === 'l1') {
                    const existingL1Names = [...new Set(currentProducts.filter(p => !p.category || p.category === '').map(p => p.parent_category).filter(Boolean))];
                    const incomingL1Names = [...new Set(incomingData.map(row => row.parent_category).filter(Boolean))];
                    
                    incomingL1Names.forEach(name => {
                        if (existingL1Names.includes(name)) {
                            unchanged.push({ name, type: 'L1 Категория' });
                        } else {
                            added.push({ name, type: 'L1 Категория' });
                        }
                    });
                    
                    existingL1Names.forEach(name => {
                        if (!incomingL1Names.includes(name)) {
                            removed.push({ name, type: 'L1 Категория' });
                        }
                    });
                } else if (activeTab === 'l2') {
                    const existingL2s = [];
                    currentProducts.forEach(p => {
                        if (p.parent_category && p.category && (!existingL2s.some(x => x.parent === p.parent_category && x.name === p.category))) {
                            existingL2s.push({ parent: p.parent_category, name: p.category });
                        }
                    });
                    
                    const incomingL2s = [];
                    incomingData.forEach(row => {
                        if (row.parent_category && row.category && (!incomingL2s.some(x => x.parent === row.parent_category && x.name === row.category))) {
                            incomingL2s.push({ parent: row.parent_category, name: row.category });
                        }
                    });
                    
                    incomingL2s.forEach(item => {
                        const exist = existingL2s.find(x => x.parent === item.parent && x.name === item.name);
                        if (exist) {
                            unchanged.push({ name: `${item.parent} → ${item.name}`, type: 'L2 Категория' });
                        } else {
                            added.push({ name: `${item.parent} → ${item.name}`, type: 'L2 Категория', raw: item });
                        }
                    });
                    
                    existingL2s.forEach(item => {
                        const match = incomingL2s.find(x => x.parent === item.parent && x.name === item.name);
                        if (!match) {
                            removed.push({ name: `${item.parent} → ${item.name}`, type: 'L2 Категория', raw: item });
                        }
                    });
                } else {
                    // Standard products comparison (Matrix diff)
                    const activeCategories = [];
                    incomingData.forEach(p => {
                        if (p.parent_category && p.category) {
                            if (!activeCategories.some(c => c.parent === p.parent_category && c.name === p.category)) {
                                activeCategories.push({ parent: p.parent_category, name: p.category });
                            }
                        }
                    });
                    
                    const dbProductsInScope = currentProducts.filter(p => 
                        activeCategories.some(c => c.parent === p.parent_category && c.name === p.category)
                    );
                    
                    incomingData.forEach(item => {
                        let existing = null;
                        if (item.id) {
                            existing = currentProducts.find(p => String(p.id) === String(item.id) || String(p.vid) === String(item.id));
                        }
                        if (!existing && item.name) {
                            existing = currentProducts.find(p => (p.name || '').toLowerCase().trim() === item.name.toLowerCase().trim());
                        }
                        
                        if (existing) {
                            const changes = {};
                            let hasChanges = false;
                            
                            if (item.price_ton && Number(item.price_ton) !== Number(existing.price_ton || 0)) {
                                changes.price_ton = { old: existing.price_ton || 0, new: item.price_ton };
                                hasChanges = true;
                            }
                            if (item.price_unit && Number(item.price_unit) !== Number(existing.price_unit || 0)) {
                                changes.price_unit = { old: existing.price_unit || 0, new: item.price_unit };
                                hasChanges = true;
                            }
                            if (item.vstatus && item.vstatus !== existing.vstatus) {
                                changes.vstatus = { old: existing.vstatus, new: item.vstatus };
                                hasChanges = true;
                            }
                            if (item.parent_category && item.parent_category !== existing.parent_category) {
                                changes.parent_category = { old: existing.parent_category, new: item.parent_category };
                                hasChanges = true;
                            }
                            if (item.category && item.category !== existing.category) {
                                changes.category = { old: existing.category, new: item.category };
                                hasChanges = true;
                            }
                            
                            if (hasChanges) {
                                updated.push({
                                    id: existing.id || existing.vid,
                                    name: existing.name,
                                    parent_category: existing.parent_category,
                                    category: existing.category,
                                    changes: changes,
                                    raw: { ...existing, ...item }
                                });
                            } else {
                                unchanged.push(existing);
                            }
                        } else {
                            added.push(item);
                        }
                    });
                    
                    dbProductsInScope.forEach(existing => {
                        let found = incomingData.some(item => {
                            if (item.id && (String(item.id) === String(existing.id) || String(item.id) === String(existing.vid))) {
                                return true;
                            }
                            if (item.name && (item.name || '').toLowerCase().trim() === (existing.name || '').toLowerCase().trim()) {
                                return true;
                            }
                            return false;
                        });
                        
                        if (!found) {
                            removed.push(existing);
                        }
                    });
                }
                
                return { added, removed, updated, unchanged };
            };

            const showImportComparisonModal = (fileName, diff, activeTab, onConfirm) => {
                let modalWrapper = document.getElementById('import-comparison-modal');
                if (modalWrapper) modalWrapper.remove();
                
                modalWrapper = document.createElement('div');
                modalWrapper.id = 'import-comparison-modal';
                modalWrapper.className = 'fixed inset-0 z-[200] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
                modalWrapper.style.pointerEvents = 'auto';

                modalWrapper.innerHTML = `
                    <div id="import-comparison-backdrop" class="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"></div>
                    <div id="import-comparison-container" class="relative w-full max-w-5xl bg-[#141210] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-[#e7e2dd] mx-4 max-h-[90vh]">
                        <!-- Header -->
                        <div class="flex items-center justify-between pb-6 border-b border-white/5 shrink-0">
                            <div>
                                <h3 class="text-xl font-['Space Grotesk'] tracking-tight text-[#e7e2dd] font-bold uppercase">Сравнение товарной матрицы</h3>
                                <p class="text-xs text-[#d7c1c7] opacity-60 mt-1">Файл: <span class="text-[#964551] font-bold">${fileName}</span></p>
                            </div>
                            <button id="import-comparison-close" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#d7c1c7] transition-colors">
                                <span class="material-symbols-outlined text-xl">close</span>
                            </button>
                        </div>
                        
                        <!-- Stats Cards Grid -->
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 shrink-0">
                            <!-- Added Card -->
                            <div class="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-450">
                                    <span class="material-symbols-outlined text-xl text-green-400">add_circle</span>
                                </div>
                                <div>
                                    <div class="text-[9px] uppercase font-bold text-green-400/70 tracking-wider">Новые</div>
                                    <div class="text-2xl font-bold text-green-400 mt-0.5">${diff.added.length}</div>
                                </div>
                            </div>
                            <!-- Removed Card -->
                            <div class="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-450">
                                    <span class="material-symbols-outlined text-xl text-red-400">remove_circle</span>
                                </div>
                                <div>
                                    <div class="text-[9px] uppercase font-bold text-red-400/70 tracking-wider">Убранные</div>
                                    <div class="text-2xl font-bold text-red-400 mt-0.5">${diff.removed.length}</div>
                                </div>
                            </div>
                            <!-- Updated Card -->
                            <div class="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-450">
                                    <span class="material-symbols-outlined text-xl text-amber-400">update</span>
                                </div>
                                <div>
                                    <div class="text-[9px] uppercase font-bold text-amber-400/70 tracking-wider">Измененные</div>
                                    <div class="text-2xl font-bold text-amber-400 mt-0.5">${diff.updated.length}</div>
                                </div>
                            </div>
                            <!-- Unchanged Card -->
                            <div class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                                <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#d7c1c7]">
                                    <span class="material-symbols-outlined text-xl text-[#d7c1c7]">check_circle</span>
                                </div>
                                <div>
                                    <div class="text-[9px] uppercase font-bold text-[#d7c1c7]/70 tracking-wider">Без изменений</div>
                                    <div class="text-2xl font-bold text-[#e7e2dd] mt-0.5">${diff.unchanged.length}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Inner Search & Filter Tabs -->
                        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 shrink-0">
                            <div class="flex gap-1 bg-[#1a1816] p-1 rounded-xl border border-white/5 select-none" id="comp-tabs-list">
                                <button class="comp-tab px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-wider transition-all text-green-400 bg-green-500/10" data-tab="added">Новые (${diff.added.length})</button>
                                <button class="comp-tab px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-wider transition-all text-red-400 hover:bg-red-500/5" data-tab="removed">Убранные (${diff.removed.length})</button>
                                <button class="comp-tab px-4 py-2 rounded-lg font-bold uppercase text-[9px] tracking-wider transition-all text-amber-450 hover:bg-amber-500/5" data-tab="updated">Измененные (${diff.updated.length})</button>
                            </div>
                            <div class="relative w-full md:w-64">
                                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-base">search</span>
                                <input type="text" id="comparison-search" placeholder="Поиск по названию..." class="w-full bg-[#151311] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs focus:border-[#964551] outline-none transition-all">
                            </div>
                        </div>

                        <!-- Scrollable list content -->
                        <div class="flex-1 overflow-y-auto custom-scrollbar my-4 pr-1 min-h-[250px]" id="comparison-list-content">
                            <!-- Rows will be rendered dynamically here -->
                        </div>

                        <!-- Footer -->
                        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5 shrink-0">
                            <div class="text-[10px] text-red-400/80 font-bold uppercase tracking-wider flex items-center gap-1.5" id="deletion-warning-note">
                                <span class="material-symbols-outlined text-sm">warning</span>
                                <span>Внимание: отсутствующие в файле товары будут удалены!</span>
                            </div>
                            <div class="flex gap-3 ml-auto w-full sm:w-auto justify-end">
                                <button id="import-comparison-cancel-btn" class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7] font-label-caps">
                                    ОТМЕНА
                                </button>
                                <button id="import-comparison-confirm-btn" class="px-6 py-3 rounded-xl bg-[#964551] text-[#0f0e0c] font-bold hover:brightness-110 transition-all text-[10px] uppercase tracking-widest shadow-xl shadow-[#964551]/10 font-label-caps">
                                    ПОДТВЕРДИТЬ ИМПОРТ
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                document.body.appendChild(modalWrapper);
                if (window.lockScrollGlobal) window.lockScrollGlobal();

                const container = modalWrapper.querySelector('#import-comparison-container');
                const searchInput = modalWrapper.querySelector('#comparison-search');
                const contentList = modalWrapper.querySelector('#comparison-list-content');
                const warnNote = modalWrapper.querySelector('#deletion-warning-note');
                
                let currentTab = 'added';
                let searchQuery = '';

                if (activeTab === 'l1' || activeTab === 'l2') {
                    warnNote.innerHTML = `
                        <span class="material-symbols-outlined text-sm">warning</span>
                        <span>Внимание: отсутствующие в файле категории и все входящие в них товары будут удалены!</span>
                    `;
                }

                const close = () => {
                    modalWrapper.classList.add('opacity-0');
                    container.classList.add('scale-95');
                    if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                    setTimeout(() => modalWrapper.remove(), 300);
                };

                modalWrapper.querySelector('#import-comparison-backdrop').onclick = close;
                modalWrapper.querySelector('#import-comparison-close').onclick = close;
                modalWrapper.querySelector('#import-comparison-cancel-btn').onclick = close;
                
                modalWrapper.querySelector('#import-comparison-confirm-btn').onclick = async () => {
                    close();
                    await onConfirm();
                };

                const renderRows = () => {
                    let items = [];
                    let colorClass = '';
                    let badgeHtml = '';
                    
                    if (currentTab === 'added') {
                        items = diff.added;
                        colorClass = 'text-green-400 border-green-500/10 bg-green-500/[0.02]';
                        badgeHtml = '<span class="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[9px] font-bold tracking-wider uppercase shrink-0">Новый</span>';
                    } else if (currentTab === 'removed') {
                        items = diff.removed;
                        colorClass = 'text-red-400 border-red-500/10 bg-red-500/[0.02]';
                        badgeHtml = '<span class="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[9px] font-bold tracking-wider uppercase shrink-0">Удалить</span>';
                    } else {
                        items = diff.updated;
                        colorClass = 'text-amber-400 border-amber-500/10 bg-amber-500/[0.02]';
                        badgeHtml = '<span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold tracking-wider uppercase shrink-0">Изменен</span>';
                    }

                    if (searchQuery) {
                        const q = searchQuery.toLowerCase().trim();
                        items = items.filter(x => {
                            const nameMatch = (x.name || '').toLowerCase().includes(q);
                            const categoryMatch = (x.category || x.parent_category || '').toLowerCase().includes(q);
                            return nameMatch || categoryMatch;
                        });
                    }

                    if (items.length === 0) {
                        contentList.innerHTML = `
                            <div class="flex flex-col items-center justify-center py-12 text-[#d7c1c7] opacity-40">
                                <span class="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                                <div class="text-xs uppercase tracking-widest font-bold">Ничего не найдено</div>
                            </div>
                        `;
                        return;
                    }

                    contentList.innerHTML = items.map((x, idx) => {
                        let detailsHtml = '';
                        
                        if (currentTab === 'updated') {
                            const changes = [];
                            if (x.changes.price_ton) {
                                changes.push(`Цена за тонну: <span class="line-through text-red-400">${x.changes.price_ton.old}</span> → <span class="text-green-400 font-bold">${x.changes.price_ton.new}</span>`);
                            }
                            if (x.changes.price_unit) {
                                changes.push(`Цена за ед.: <span class="line-through text-red-400">${x.changes.price_unit.old}</span> → <span class="text-green-400 font-bold">${x.changes.price_unit.new}</span>`);
                            }
                            if (x.changes.vstatus) {
                                changes.push(`Статус: <span class="opacity-60">${x.changes.vstatus.old}</span> → <span class="font-bold text-white">${x.changes.vstatus.new}</span>`);
                            }
                            if (x.changes.parent_category || x.changes.category) {
                                const oldCat = `${x.changes.parent_category?.old || ''} ${x.changes.category?.old || ''}`;
                                const newCat = `${x.changes.parent_category?.new || ''} ${x.changes.category?.new || ''}`;
                                changes.push(`Категория: <span class="opacity-60">${oldCat}</span> → <span class="font-bold text-white">${newCat}</span>`);
                            }
                            detailsHtml = `
                                <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#964551]">
                                    ${changes.map(c => `<span>• ${c}</span>`).join('')}
                                </div>
                            `;
                        } else if (activeTab === 'products') {
                            const price = x.price_ton ? `${x.price_ton} ₽/т` : (x.price_unit ? `${x.price_unit} ₽/${x.unit_label || 'ед'}` : 'Цену уточняйте');
                            detailsHtml = `
                                <div class="mt-1 text-[10px] text-[#d7c1c7]/80">
                                    Цена: <span class="text-[#e7e2dd] font-medium">${price}</span>
                                </div>
                            `;
                        }

                        const categoryDisplay = x.category ? (x.parent_category ? `${x.parent_category} → ${x.category}` : x.category) : (x.parent_category || 'Категория L1');

                        return `
                            <div class="p-4 rounded-2xl border ${colorClass} mb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300" style="animation-delay: ${Math.min(idx * 20, 350)}ms;">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <h4 class="text-sm font-bold text-[#e7e2dd] leading-snug">${x.name}</h4>
                                        ${badgeHtml}
                                    </div>
                                    <div class="text-[9px] uppercase font-bold text-[#964551]/60 tracking-wider mt-1">${categoryDisplay}</div>
                                    ${detailsHtml}
                                </div>
                            </div>
                        `;
                    }).join('');
                };

                // Switch tabs
                modalWrapper.querySelectorAll('.comp-tab').forEach(btn => {
                    btn.onclick = () => {
                        modalWrapper.querySelectorAll('.comp-tab').forEach(b => {
                            b.classList.remove('bg-green-500/10', 'bg-red-500/10', 'bg-amber-500/10');
                            b.classList.add('hover:bg-red-500/5', 'hover:bg-amber-500/5', 'hover:bg-green-500/5');
                        });
                        
                        currentTab = btn.dataset.tab;
                        if (currentTab === 'added') btn.classList.add('bg-green-500/10');
                        if (currentTab === 'removed') btn.classList.add('bg-red-500/10');
                        if (currentTab === 'updated') btn.classList.add('bg-amber-500/10');

                        renderRows();
                    };
                });

                searchInput.oninput = (e) => {
                    searchQuery = e.target.value;
                    renderRows();
                };

                renderRows();

                requestAnimationFrame(() => {
                    modalWrapper.classList.remove('opacity-0');
                    container.classList.remove('scale-95');
                });
            };

            if (importBtn) {
                importBtn.onclick = () => {
                    let modalWrapper = document.getElementById('import-template-modal');
                    if (modalWrapper) modalWrapper.remove();
                    
                    modalWrapper = document.createElement('div');
                    modalWrapper.id = 'import-template-modal';
                    modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
                    modalWrapper.style.pointerEvents = 'auto';

                    // Tab-aware import metadata (title, accepted formats, column hints, drop label)
                    const importMeta = (() => {
                        if (activeTab === 'l1') {
                            return {
                                title: 'ИМПОРТ КАТЕГОРИЙ L1 ИЗ ТАБЛИЦЫ',
                                formats: 'ПОДДЕРЖИВАЮТСЯ ФОРМАТЫ CSV И EXCEL',
                                accept: '.csv,.xlsx,.xls',
                                dropLabel: 'Перетащите CSV или Excel файл сюда',
                                intro: 'Файл должен содержать одну колонку с названием категории верхнего уровня (L1):',
                                cols: [
                                    { name: 'Группа (parent_category)', hint: 'напр. Чёрный металлопрокат', req: true }
                                ]
                            };
                        }
                        if (activeTab === 'l2') {
                            return {
                                title: 'ИМПОРТ ПОДКАТЕГОРИЙ L2 ИЗ ТАБЛИЦЫ',
                                formats: 'ПОДДЕРЖИВАЮТСЯ ФОРМАТЫ CSV И EXCEL',
                                accept: '.csv,.xlsx,.xls',
                                dropLabel: 'Перетащите CSV или Excel файл сюда',
                                intro: 'Файл должен содержать колонку родительской категории (L1) и колонку названия подкатегории (L2):',
                                cols: [
                                    { name: 'Группа (parent_category)', hint: 'родительская L1, напр. Чёрный металлопрокат', req: true },
                                    { name: 'Категория (category)', hint: 'подкатегория L2, напр. Арматура', req: true }
                                ]
                            };
                        }
                        return {
                            title: 'ИМПОРТ ТОВАРОВ ИЗ ТАБЛИЦЫ',
                            formats: 'ПОДДЕРЖИВАЮТСЯ ФОРМАТЫ CSV, JSON И EXCEL',
                            accept: '.csv,.json,.xlsx,.xls',
                            dropLabel: 'Перетащите CSV, JSON или Excel файл сюда',
                            intro: 'Убедитесь, что ваша таблица содержит следующие заголовки колонок (порядок не имеет значения). Символ <span class="text-[#964551]">*</span> указывает на обязательные поля:',
                            cols: [
                                { name: 'ID (id)', hint: 'напр. 832746' },
                                { name: 'Статус (vstatus)', hint: 'active / archived' },
                                { name: 'Группа (parent_category)', hint: 'напр. Арматура', req: true },
                                { name: 'Категория (category)', hint: 'напр. Арматура А500С' },
                                { name: 'Наименование (name)', hint: 'напр. Арматура 12мм', req: true },
                                { name: 'Цена (тонна) (price_ton)', hint: 'число, напр. 75000' },
                                { name: 'Цена (ед) (price_unit)', hint: 'число, напр. 85.5' },
                                { name: 'Ед. изм. (unit_label)', hint: 'напр. т, м, шт' },
                                { name: 'Длина (length)', hint: 'напр. 11.7' },
                                { name: 'Ширина (width)', hint: 'напр. 1.5' },
                                { name: 'Тип (type)', hint: 'напр. А500С' },
                                { name: 'Вес (weight)', hint: 'напр. 0.888' },
                                { name: 'Описание (description)', hint: 'Текст описания' },
                                { name: 'Характеристики (specs)', hint: 'JSON формат' },
                                { name: 'Ссылка на фото (images)', hint: 'http://...', wide: true }
                            ]
                        };
                    })();

                    const colsHtml = importMeta.cols.map(c => `
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5${c.wide ? ' col-span-2' : ''}">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1 flex items-center gap-1">${c.name}${c.req ? ' <span class="text-[#964551]">*</span>' : ''}</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">${c.hint}</div>
                                        </div>`).join('');
                    
                    modalWrapper.innerHTML = `
                        <div id="import-template-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>
                        <div id="import-template-container" class="relative w-full max-w-4xl bg-[#141210] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-[#e7e2dd] mx-4">
                            <div class="flex items-center justify-between pb-6 mb-6">
                                <div>
                                    <h3 class="text-xl font-['Space Grotesk'] tracking-tight text-[#e7e2dd] font-bold uppercase">
                                        ${importMeta.title}
                                    </h3>
                                    <div class="text-[10px] text-[#964551] uppercase font-['Space Grotesk'] tracking-widest mt-1 font-bold">
                                        ${importMeta.formats}
                                    </div>
                                </div>
                                <button id="import-template-close" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#d7c1c7] transition-colors">
                                    <span class="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            
                            <div class="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                                <div class="bg-[#1a1816] border border-[#964551]/20 rounded-2xl p-6">
                                    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div class="flex items-center gap-2 text-[#964551]">
                                            <span class="material-symbols-outlined text-sm">info</span>
                                            <h4 class="text-xs font-bold uppercase tracking-widest font-label-caps">ШАБЛОН ЗАГОЛОВКОВ И ДАННЫХ:</h4>
                                        </div>
                                        <button id="download-template-btn" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#964551]/40 text-[#964551] hover:bg-[#964551] hover:text-[#0f0e0c] transition-all text-[10px] font-bold uppercase tracking-widest">
                                            <span class="material-symbols-outlined text-sm">download</span>
                                            СКАЧАТЬ ШАБЛОН .CSV
                                        </button>
                                    </div>
                                    
                                    <p class="text-sm text-[#d7c1c7] mb-6">
                                        ${importMeta.intro}
                                    </p>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        ${colsHtml}
                                    </div>
                                    
                                    <div class="mt-4 flex items-start gap-2 text-[10px] text-[#d7c1c7] opacity-80">
                                        <span>💡</span>
                                        <p><b>Совет по Excel:</b> вы можете загружать как CSV файлы, так и обычные Excel таблицы (.xlsx, .xls) напрямую без конвертации.</p>
                                    </div>
                                </div>
                                
                                <div id="import-template-select-btn" class="border-2 border-dashed border-[#964551]/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#964551] hover:bg-[#964551]/5 transition-all group">
                                    <div class="w-16 h-16 rounded-2xl border border-[#964551]/30 flex items-center justify-center text-[#964551] mb-4 group-hover:scale-110 transition-transform">
                                        <span class="material-symbols-outlined text-3xl">upload_file</span>
                                    </div>
                                    <h4 class="text-[#e7e2dd] font-bold text-lg mb-1">${importMeta.dropLabel}</h4>
                                    <p class="text-[#d7c1c7] text-sm opacity-60">или нажмите для выбора файла на устройстве</p>
                                </div>
                            </div>
                            
                            <div class="flex justify-end gap-3 pt-6 mt-4">
                                <button id="import-template-cancel-btn" class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7] font-label-caps">
                                    ОТМЕНА
                                </button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modalWrapper);
                    
                    if (window.lockScrollGlobal) window.lockScrollGlobal();
                    
                    const containerEl = modalWrapper.querySelector('#import-template-container');
                    
                    const closeImportTemplate = () => {
                        modalWrapper.classList.add('opacity-0');
                        containerEl.classList.add('scale-95');
                        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                        setTimeout(() => modalWrapper.remove(), 300);
                    };
                    
                    modalWrapper.querySelector('#import-template-backdrop').onclick = closeImportTemplate;
                    modalWrapper.querySelector('#import-template-close').onclick = closeImportTemplate;
                    modalWrapper.querySelector('#import-template-cancel-btn').onclick = closeImportTemplate;
                    
                    modalWrapper.querySelector('#download-template-btn').onclick = () => {
                        let headers, exampleRow, fileName;
                        if (activeTab === 'l1') {
                            headers = "Группа (parent_category)\n";
                            exampleRow = "Чёрный металлопрокат\n";
                            fileName = "shablon_import_kategoriy_L1.csv";
                        } else if (activeTab === 'l2') {
                            headers = "Группа (parent_category);Категория (category)\n";
                            exampleRow = "Чёрный металлопрокат;Арматура\n";
                            fileName = "shablon_import_kategoriy_L2.csv";
                        } else {
                            headers = "ID (id);Статус (vstatus);Группа (parent_category);Категория (category);Наименование (name);Цена (тонна) (price_ton);Цена (ед) (price_unit);Ед. изм. (unit_label);Длина (length);Ширина (width);Тип (type);Вес (weight);Описание (description);Характеристики (specs);Ссылка на фото (images)\n";
                            exampleRow = "832746;active;Чёрный металлопрокат;Арматура;Арматура 12мм А500С;75000;85.5;т;11.7;1.5;А500С;0.888;Описание товара;[];http://link.jpg\n";
                            fileName = "shablon_import_tovarov.csv";
                        }
                        const blob = new Blob(["\uFEFF" + headers + exampleRow], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", fileName);
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    modalWrapper.querySelector('#import-template-select-btn').onclick = () => {
                        closeImportTemplate();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = importMeta.accept;
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const isExcel = file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls');
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                    try {
                                        let incomingData = [];
                                        
                                        if (isExcel) {
                                            if (typeof XLSX === 'undefined') {
                                                throw new Error('Библиотека SheetJS для чтения Excel не найдена на странице.');
                                            }
                                            const data = new Uint8Array(ev.target.result);
                                            const workbook = XLSX.read(data, { type: 'array' });
                                            const sheetName = workbook.SheetNames[0];
                                            const worksheet = workbook.Sheets[sheetName];
                                            const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                                            
                                            if (activeTab === 'l1') {
                                                incomingData = parsed.map(row => ({
                                                    id: 'cat_l1_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                    name: '📁 ' + (row['Группа (parent_category)'] || row['parent_category'] || 'Новая категория'),
                                                    parent_category: row['Группа (parent_category)'] || row['parent_category'] || 'Новая категория',
                                                    category: '',
                                                    price_ton: 0,
                                                    vstatus: 'active',
                                                    description: 'Системная категория L1 из импорта'
                                                }));
                                            } else if (activeTab === 'l2') {
                                                incomingData = parsed.map(row => ({
                                                    id: 'cat_l2_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                    name: '📁 ' + (row['Категория (category)'] || row['category'] || 'Новая подкатегория'),
                                                    parent_category: row['Группа (parent_category)'] || row['parent_category'] || '',
                                                    category: row['Категория (category)'] || row['category'] || 'Новая подкатегория',
                                                    price_ton: 0,
                                                    vstatus: 'active',
                                                    description: 'Системная подкатегория L2 из импорта'
                                                }));
                                            } else {
                                                incomingData = parsed.map(normalizeImportedProduct).filter(p => p.name);
                                            }
                                        } else {
                                            const text = ev.target.result;
                                            if (file.name.toLowerCase().endsWith('.csv')) {
                                                const parsed = parseCSV(text);
                                                
                                                if (activeTab === 'l1') {
                                                    incomingData = parsed.map(row => ({
                                                        id: 'cat_l1_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                        name: '📁 ' + (row['Группа (parent_category)'] || row['parent_category'] || 'Новая категория'),
                                                        parent_category: row['Группа (parent_category)'] || row['parent_category'] || 'Новая категория',
                                                        category: '',
                                                        price_ton: 0,
                                                        vstatus: 'active',
                                                        description: 'Системная категория L1 из импорта'
                                                    }));
                                                } else if (activeTab === 'l2') {
                                                    incomingData = parsed.map(row => ({
                                                        id: 'cat_l2_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                        name: '📁 ' + (row['Категория (category)'] || row['category'] || 'Новая подкатегория'),
                                                        parent_category: row['Группа (parent_category)'] || row['parent_category'] || '',
                                                        category: row['Категория (category)'] || row['category'] || 'Новая подкатегория',
                                                        price_ton: 0,
                                                        vstatus: 'active',
                                                        description: 'Системная подкатегория L2 из импорта'
                                                    }));
                                                } else {
                                                    incomingData = parsed.map(normalizeImportedProduct).filter(p => p.name);
                                                }
                                            } else {
                                                incomingData = JSON.parse(text);
                                            }
                                        }
                                        
                                        const diff = calculateImportDiff(state.products, incomingData, activeTab);
                                        
                                        if (diff.added.length === 0 && diff.removed.length === 0 && diff.updated.length === 0) {
                                            window.showToast('Импортируемый файл не содержит никаких изменений относительно базы данных.', 'info', 'Импорт');
                                            return;
                                        }
                                        
                                        showImportComparisonModal(file.name, diff, activeTab, async () => {
                                            let updatedCount = 0;
                                            let createdCount = 0;
                                            let deletedCount = 0;
                                            
                                            try {
                                                if (activeTab === 'l1') {
                                                    // Insert new L1 Categories
                                                    if (diff.added.length > 0) {
                                                        const insertPayload = diff.added.map(x => ({
                                                            id: 'cat_l1_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                            name: '📁 ' + x.name,
                                                            parent_category: x.name,
                                                            category: '',
                                                            price_ton: 0,
                                                            vstatus: 'active',
                                                            description: 'Системная категория L1 из импорта'
                                                        }));
                                                        await state.bulkInsertProducts(insertPayload);
                                                        createdCount = insertPayload.length;
                                                    }
                                                    // Delete removed L1 Categories (scoped)
                                                    if (diff.removed.length > 0) {
                                                        const removedNames = diff.removed.map(x => x.name);
                                                        const idsToDelete = state.products
                                                            .filter(p => removedNames.includes(p.parent_category))
                                                            .map(p => p.id);
                                                        if (idsToDelete.length > 0) {
                                                            await state.bulkDeleteProducts(idsToDelete);
                                                            deletedCount = idsToDelete.length;
                                                        }
                                                    }
                                                } else if (activeTab === 'l2') {
                                                    // Insert new L2 Categories
                                                    if (diff.added.length > 0) {
                                                        const insertPayload = diff.added.map(x => ({
                                                            id: 'cat_l2_' + Date.now() + Math.random().toString(36).substr(2, 9),
                                                            name: '📁 ' + x.raw.name,
                                                            parent_category: x.raw.parent,
                                                            category: x.raw.name,
                                                            price_ton: 0,
                                                            vstatus: 'active',
                                                            description: 'Системная подкатегория L2 из импорта'
                                                        }));
                                                        await state.bulkInsertProducts(insertPayload);
                                                        createdCount = insertPayload.length;
                                                    }
                                                    // Delete removed L2 Categories (scoped)
                                                    if (diff.removed.length > 0) {
                                                        const idsToDelete = state.products
                                                            .filter(p => diff.removed.some(x => x.raw.parent === p.parent_category && x.raw.name === p.category))
                                                            .map(p => p.id);
                                                        if (idsToDelete.length > 0) {
                                                            await state.bulkDeleteProducts(idsToDelete);
                                                            deletedCount = idsToDelete.length;
                                                        }
                                                    }
                                                } else {
                                                    // Standard Products import
                                                    // 1. Bulk Update changed products
                                                    if (diff.updated.length > 0) {
                                                        const updatePayload = diff.updated.map(u => {
                                                            const changesOnly = {};
                                                            for (const key in u.changes) {
                                                                changesOnly[key] = u.changes[key].new;
                                                            }
                                                            return { id: u.id, ...changesOnly };
                                                        });
                                                        await state.bulkUpdateProducts(updatePayload);
                                                        updatedCount = updatePayload.length;
                                                    }
                                                    // 2. Bulk Insert new products
                                                    if (diff.added.length > 0) {
                                                        await state.bulkInsertProducts(diff.added);
                                                        createdCount = diff.added.length;
                                                    }
                                                    // 3. Bulk Delete missing products (in scope of categories)
                                                    if (diff.removed.length > 0) {
                                                        const idsToDelete = diff.removed.map(p => p.id);
                                                        await state.bulkDeleteProducts(idsToDelete);
                                                        deletedCount = idsToDelete.length;
                                                    }
                                                }
                                                
                                                window.showToast(`Импорт успешно завершен!\nДобавлено товаров/категорий: ${createdCount}\nОбновлено цен/статусов: ${updatedCount}\nУдалено: ${deletedCount}`, 'success', 'Импорт');
                                                await loadProducts();
                                            } catch (err) {
                                                window.showToast('Ошибка при сохранении изменений: ' + err.message, 'error', 'Ошибка');
                                            }
                                        });
                                    } catch (err) {
                                        window.showToast('Ошибка при разборе файла: ' + err.message, 'error', 'Ошибка');
                                    }
                                };
                                
                                if (isExcel) {
                                    reader.readAsArrayBuffer(file);
                                } else {
                                    reader.readAsText(file);
                                }
                            }
                        };
                        input.click();
                    };

                    requestAnimationFrame(() => {
                        modalWrapper.classList.remove('opacity-0');
                        containerEl.classList.remove('scale-95');
                    });
                };
            }

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
                            window.showToast('Ошибка при обновлении: ' + err.message, 'error', 'Ошибка');
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
                            savePersistedSelection([]);
                            updateToolbar();
                        } catch (err) {
                            window.showToast('Ошибка при обновлении: ' + err.message, 'error', 'Ошибка');
                        }
                    },
                    onClose: () => {
                        selectedIds = [];
                        clearPersistedSelection();
                        // Clear checkboxes in UI
                        const checkboxes = document.querySelectorAll('.product-checkbox, #select-all-products');
                        checkboxes.forEach(cb => {
                            cb.checked = false;
                            cb.indeterminate = false;
                        });
                        // Clear row highlights in UI
                        const rows = document.querySelectorAll('tr[data-id], .product-mobile-card');
                        rows.forEach(row => {
                            row.classList.remove('bg-[#964551]/10');
                            row.classList.remove('hover:bg-[#964551]/15');
                            row.classList.add('hover:bg-on-surface/[0.02]');
                            if (row.classList.contains('product-mobile-card')) {
                                row.classList.add('bg-surface-container-lowest');
                            }
                        });
                        updateToolbar();
                    },
                    onExportProducts: () => {
                        let exportData = [];
                        if (activeTab === 'products') {
                            exportData = currentProducts.filter(p => selectedIds.includes(String(p.id)));
                        } else if (activeTab === 'l1') {
                            exportData = selectedIds.map(l => ({name: l}));
                        } else if (activeTab === 'l2') {
                            exportData = selectedIds.map(s => JSON.parse(s));
                        }
                        if (exportData.length === 0) return;
                        exportDataToExcel(exportData, activeTab);
                    },
                    onDeleteItems: async () => {
                        if (activeTab === 'products') {
                            await state.bulkDeleteProducts(selectedIds);
                        } else if (activeTab === 'l1') {
                            let pToDelete = [];
                            selectedIds.forEach(l => {
                                const ids = currentProducts.filter(p => p.parent_category === l).map(p => p.id);
                                pToDelete.push(...ids);
                            });
                            if (pToDelete.length > 0) await state.bulkDeleteProducts(pToDelete);
                        } else if (activeTab === 'l2') {
                            let pToDelete = [];
                            selectedIds.forEach(s => {
                                const cat = JSON.parse(s);
                                const ids = currentProducts.filter(p => p.category === cat.name && p.parent_category === cat.parent).map(p => p.id);
                                pToDelete.push(...ids);
                            });
                            if (pToDelete.length > 0) await state.bulkDeleteProducts(pToDelete);
                        }
                        selectedIds = [];
                        clearPersistedSelection();
                        updateToolbar();
                        await loadProducts();
                    }
                });

                setTimeout(() => {
                    const btnCategory = toolbarContainer.querySelector('#bulk-update-category');
                    const btnPrice = toolbarContainer.querySelector('#bulk-update-price');
                    const btnStatus = toolbarContainer.querySelector('#bulk-toggle-status');
                    const btnUnit = toolbarContainer.querySelector('#bulk-update-unit');
                    
                    if (btnUnit) btnUnit.style.display = 'none';
                    
                    if (activeTab === 'l1' || activeTab === 'l2') {
                        if (btnCategory) btnCategory.style.display = 'none';
                        if (btnPrice) btnPrice.style.display = 'none';
                        if (btnStatus) btnStatus.style.display = 'none';
                    } else {
                        if (btnCategory) btnCategory.style.display = 'flex';
                        if (btnPrice) btnPrice.style.display = 'flex';
                        if (btnStatus) btnStatus.style.display = 'flex';
                    }
                }, 10);
            };

            const showCategorySelectPopup = (product, type, el) => {
                document.querySelectorAll('.inline-cat-dropdown-wrapper, .inline-cat-dropdown').forEach(d => d.remove());
                
                const isMobile = window.innerWidth < 768;
                const rect = el.getBoundingClientRect();
                
                const dropdownWrapper = document.createElement('div');
                const dropdown = document.createElement('div');
                
                if (isMobile) {
                    dropdownWrapper.className = 'inline-cat-dropdown-wrapper fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300';
                    dropdown.className = 'relative w-full max-w-xs bg-surface-container border border-outline/20 rounded-[2rem] p-5 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 max-h-[70vh] text-on-surface';
                    dropdownWrapper.appendChild(dropdown);
                    document.body.appendChild(dropdownWrapper);
                } else {
                    dropdown.className = 'inline-cat-dropdown custom-dropdown-menu fixed rounded-2xl p-2 z-[10000] min-w-[200px] max-h-[320px] flex flex-col shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200';
                    let top = rect.bottom + window.scrollY + 4;
                    let left = rect.left + window.scrollX;
                    dropdown.style.left = `${left}px`;
                    dropdown.style.top = `${top}px`;
                    document.body.appendChild(dropdown);
                }

                let optionsHtml = '';
                if (type === 'l1') {
                    const l1s = [...new Set(state.products.map(p => p.parent_category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                    optionsHtml += l1s.map(cat => {
                        const isCurrent = product.parent_category === cat;
                        return `
                            <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} transition-all flex items-center justify-between" data-value="${cat.replace(/"/g, '&quot;')}">
                                <span>${cat}</span>
                                ${isCurrent ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
                            </button>
                        `;
                    }).join('');
                    
                    optionsHtml += `
                        <div class="h-[1px] bg-outline/10 my-1"></div>
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#964551] transition-all" data-action="new">
                            <span>➕ Создать новую L1...</span>
                        </button>
                    `;
                } else {
                    const l2s = [...new Set(state.products.filter(p => !product.parent_category || p.parent_category === product.parent_category).map(p => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
                    optionsHtml += l2s.map(cat => {
                        const isCurrent = product.category === cat;
                        return `
                            <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} transition-all flex items-center justify-between" data-value="${cat.replace(/"/g, '&quot;')}">
                                <span>${cat}</span>
                                ${isCurrent ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
                            </button>
                        `;
                    }).join('');
                    
                    optionsHtml += `
                        <div class="h-[1px] bg-outline/10 my-1"></div>
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#964551] transition-all" data-action="new">
                            <span>➕ Создать новую L2...</span>
                        </button>
                    `;
                }

                if (isMobile) {
                    dropdown.innerHTML = `
                        <div class="flex items-center justify-between pb-3 border-b border-outline/10 mb-3 select-none shrink-0">
                            <span class="text-xs font-bold text-primary uppercase tracking-widest font-label-caps">${type === 'l1' ? 'Выбор категории L1' : 'Выбор подкатегории L2'}</span>
                            <button class="dropdown-close-btn w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                                <span class="material-symbols-outlined text-base">close</span>
                            </button>
                        </div>
                        <div class="overflow-y-auto custom-scrollbar flex-1 space-y-1.5 pr-1 max-h-[45vh]">
                            ${optionsHtml}
                        </div>
                    `;
                } else {
                    dropdown.innerHTML = `
                        <div class="flex items-center justify-between px-3 py-1.5 border-b border-outline/10 mb-1 select-none shrink-0">
                            <span class="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider font-label-caps">${type === 'l1' ? 'Категория L1' : 'Подкатегория L2'}</span>
                            <button class="dropdown-close-btn w-6 h-6 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                                <span class="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                        <div class="overflow-y-auto custom-scrollbar flex-1 space-y-0.5 max-h-[260px]">
                            ${optionsHtml}
                        </div>
                    `;
                }

                const cleanup = () => {
                    if (isMobile) {
                        dropdownWrapper.classList.add('opacity-0');
                        dropdown.classList.add('scale-95');
                        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                        setTimeout(() => dropdownWrapper.remove(), 300);
                    } else {
                        dropdown.remove();
                    }
                    document.removeEventListener('click', closeDropdown, true);
                    window.removeEventListener('scroll', handleScroll, true);
                    window.removeEventListener('resize', handleResize);
                    document.removeEventListener('keydown', handleKeyDown, true);
                };

                const closeDropdown = (ev) => {
                    if (dropdown.contains(ev.target) || ev.target === el || el.contains(ev.target)) {
                        return;
                    }
                    cleanup();
                };

                const handleScroll = (ev) => {
                    if (isMobile || dropdown.contains(ev.target)) {
                        return;
                    }
                    cleanup();
                };

                const handleResize = () => {
                    cleanup();
                };

                const handleKeyDown = (ev) => {
                    if (ev.key === 'Escape') {
                        cleanup();
                    }
                };

                if (isMobile) {
                    dropdownWrapper.onclick = (ev) => {
                        if (ev.target === dropdownWrapper) {
                            cleanup();
                        }
                    };
                    if (window.lockScrollGlobal) window.lockScrollGlobal();
                    requestAnimationFrame(() => {
                        dropdownWrapper.classList.remove('opacity-0');
                        dropdown.classList.remove('scale-95');
                    });
                } else {
                    const dropRect = dropdown.getBoundingClientRect();
                    if (dropRect.right > window.innerWidth) {
                        dropdown.style.left = `${window.innerWidth - dropRect.width - 16}px`;
                    }
                    if (dropRect.bottom > window.innerHeight) {
                        dropdown.style.top = `${rect.top + window.scrollY - dropRect.height - 4}px`;
                    }
                }

                dropdown.querySelector('.dropdown-close-btn').onclick = (ev) => {
                    ev.stopPropagation();
                    cleanup();
                };

                dropdown.querySelectorAll('.custom-dropdown-item').forEach(btn => {
                    btn.onclick = async (ev) => {
                        ev.stopPropagation();
                        let newValue = btn.dataset.value;
                        const action = btn.dataset.action;

                        if (action === 'new') {
                            const promptText = type === 'l1' ? 'Введите название новой категории L1:' : 'Введите название новой подкатегории L2:';
                            const res = prompt(promptText);
                            if (res === null) return;
                            newValue = res.trim();
                            if (!newValue) return;
                        }

                        cleanup();

                        if (!newValue) {
                            window.showToast('Категория не может быть пустой!', 'warning', 'Валидация');
                            return;
                        }

                        try {
                            const updates = {};
                            if (type === 'l1') {
                                updates.parent_category = newValue;
                                // Find L2 categories under new L1
                                const relatedL2s = [...new Set(state.products.filter(p => p.parent_category === newValue).map(p => p.category).filter(Boolean))].sort();
                                if (relatedL2s.length > 0) {
                                    updates.category = relatedL2s[0];
                                } else {
                                    const l2Name = prompt(`Введите подкатегории L2 для новой категории "${newValue}":`, 'Общее');
                                    updates.category = (l2Name && l2Name.trim()) ? l2Name.trim() : 'Общее';
                                }
                            } else {
                                updates.category = newValue;
                            }

                            await state.updateProduct(product.id, updates);
                            window.showToast?.(`Товар «${product.name}» обновлен`, 'success', 'Товары');
                            await loadProducts();
                        } catch (err) {
                            window.showToast('Ошибка при изменении категории: ' + err.message, 'error', 'Ошибка');
                        }
                    };
                });

                // Attach event listeners using capture phase to catch clicks even if propagation is stopped
                setTimeout(() => {
                    document.addEventListener('click', closeDropdown, true);
                    window.addEventListener('scroll', handleScroll, true);
                    window.addEventListener('resize', handleResize);
                    document.addEventListener('keydown', handleKeyDown, true);
                }, 50);
            };

            const updateTable = (products) => {
                renderProductTable(tableContainer, products, {
                    selected: selectedIds,
                    visibleColumns: visibleColumns,
                    statusFilter: currentStatusFilter,
                    onStatusFilterChange: (newStatus) => {
                        currentStatusFilter = newStatus;
                        applyFilters();
                    },
                    onRowClick: (product) => {
                        openDrawer(product, async (updatedData) => {
                            await state.updateProduct(product.id, updatedData);
                        });
                    },
                    onSelectionChange: (ids) => {
                        selectedIds = ids;
                        savePersistedSelection(ids);
                        updateToolbar();
                    },
                    onDelete: async (id) => {
                        try {
                            await state.deleteProduct(id);
                            await loadProducts();
                        } catch (err) {
                            window.showToast('Ошибка при удалении товара: ' + err.message, 'error', 'Ошибка');
                        }
                    },
                    onStatusToggle: async (id, currentStatus) => {
                        const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
                        try {
                            await state.updateProduct(id, { vstatus: newStatus });
                            await loadProducts();
                        } catch (err) {
                            window.showToast('Ошибка при изменении статуса: ' + err.message, 'error', 'Ошибка');
                        }
                    },
                    onCategoryClick: (product, type, el) => {
                        showCategorySelectPopup(product, type, el);
                    },
                    onPriceChangeGlobal: async (id, prices) => {
                        await state.updateProduct(id, prices);
                        await loadProducts();
                    },
                    onSortChange: (sortKey, sortOrder) => {
                        currentSortKey = sortKey;
                        currentSortOrder = sortOrder;
                        renderCurrentPage();
                    }
                });
            };

            await loadProducts();

            // Subscribe to updates
            const unsubscribe = state.on('products:updated', (products) => {
                // Invalidate cached search blobs so edited products re-index
                try { products.forEach(p => { if (p.__searchBlob !== undefined) delete p.__searchBlob; }); } catch (e) {}
                currentProducts = products;
                applyFilters();
            });

            container._cleanup = () => {
                unsubscribe();
            };
        };

        // Hash-based view switcher
        const initViewSwitcher = () => {
            const navItems = document.querySelectorAll('.nav-item');
            
            const navigateToView = (viewId) => {
                if (viewId === 'products') {
                    window.location.hash = 'products_nomenclature';
                    return;
                }
                if (viewId === 'support') {
                    window.location.hash = 'support_chats';
                    return;
                }

                let btn = document.querySelector(`[data-view="${viewId}"]`);
                if (!btn) {
                    btn = document.querySelector(`[data-view^="${viewId}"]`);
                }
                // Product sub-tabs (products_l1/l2/l3/parameters) may not have their own
                // sidebar button — fall back to the main products nav button.
                if (!btn && viewId.startsWith('products_')) {
                    btn = document.querySelector('[data-view="products"]');
                }
                // Support topic views may not have their own sidebar button
                if (!btn && viewId.startsWith('support_')) {
                    btn = document.querySelector('[data-view="support"]');
                }
                if (!btn) {
                    btn = document.querySelector('[data-view="dashboard"]');
                }
                if (!btn) return;
                
                const view = btn.dataset.view;
                const label = btn.dataset.label;
                const tab = btn.dataset.tab;
                
                console.log('Switching to view:', view, 'tab:', tab);
                
                if (typeof window.cancelAllBulkActions === 'function') {
                    window.cancelAllBulkActions();
                }
                
                // Update title
                const titleEl = document.getElementById('admin-title');
                if (titleEl) {
                    titleEl.textContent = label;
                }

                // Highlight active button
                navItems.forEach(b => {
                    b.classList.remove('bg-white/5', 'text-[#964551]', 'active', 'text-white', 'bg-white/[0.02]');
                });
                btn.classList.add('bg-white/5', 'text-[#964551]', 'active');

                // Highlight parent group header if in sub-item
                const parentGroup = btn.closest('.sidebar-group');
                if (parentGroup) {
                    const parentBtn = parentGroup.querySelector('button:first-of-type');
                    if (parentBtn && parentBtn !== btn) {
                        parentBtn.classList.add('text-white', 'bg-white/[0.02]');
                    }
                }

                // Update content placeholder
                const contentEl = document.getElementById('admin-content');
                if (contentEl) {
                    // Cleanup previous view subscriptions
                    if (typeof contentEl._cleanup === 'function') {
                        contentEl._cleanup();
                        contentEl._cleanup = null;
                    }
                    
                    if (view === 'products_parameters') {
                        renderParametersView(contentEl, state);
                    } else if (view.startsWith('products_') || view === 'products') {
                        // Derive sub-tab from the hash so l1/l2/l3 route correctly
                        const hashTab = window.location.hash.substring(1).replace('products_', '');
                        const tabMap = { nomenclature: 'products', l1: 'l1', l2: 'l2', l3: 'l3', parameters: 'parameters' };
                        const resolvedTab = tabMap[hashTab] || tab || 'products';
                        if (resolvedTab === 'parameters') {
                            renderParametersView(contentEl, state);
                        } else {
                            renderProductsView(contentEl, resolvedTab);
                        }
                    } else if (view === 'dashboard') {
                        renderDashboard(contentEl, state);
                    } else if (view === 'orders') {
                        renderOrdersView(contentEl, state);
                    } else if (view === 'users') {
                        renderUsersView(contentEl, state);
                    } else if (view === 'leads') {
                        renderLeadsView(contentEl, state);
                    } else if (view.startsWith('support_') || view === 'support') {
                        renderSupportView(contentEl, state, tab);
                    } else if (view === 'analytics') {
                        renderAnalyticsView(contentEl, state);
                    }
                }
            };
            
            // Listen to clicks on menu items to update hash
            navItems.forEach(btn => {
                btn.addEventListener('click', () => {
                    const view = btn.dataset.view;
                    window.location.hash = view;
                });
            });
            
            // Handle hash change
            const handleHashChange = () => {
                let hash = window.location.hash.substring(1);
                if (!hash) {
                    hash = 'dashboard';
                }
                navigateToView(hash);
            };
            
            window.addEventListener('hashchange', handleHashChange);
            
            // Initial navigation on load
            let initialHash = window.location.hash.substring(1);
            if (!initialHash) {
                window.location.hash = 'dashboard';
            } else {
                handleHashChange();
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
