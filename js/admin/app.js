import { renderLayout } from './ui.js';
import { state } from './state.js';
import { renderProductTable } from './components/table.js';
import { openDrawer } from './components/drawer.js';
import { renderBulkToolbar, showConfirmPromptModal } from './components/bulk-toolbar.js';
import { mergePriceListData, parseCSV, normalizeImportedProduct } from './import-engine.js';
import { renderDashboard } from './components/dashboard.js';
import { renderOrdersView } from './components/orders.js';
import { renderUsersView } from './components/users.js';
import { renderLeadsView } from './components/leads.js';
import { renderSupportView } from './components/support.js';
import { renderParametersView } from './components/parameters.js';

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
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Управление каталогом</h3>
                            <p class="text-sm text-[#d7c1c7] mt-1">Полноценная CRM для редактирования базы данных</p>
                        </div>
                        <div class="flex gap-2">
                            <button id="refresh-products-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                                <span class="material-symbols-outlined text-sm">refresh</span>
                            </button>
                            <button id="export-excel-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-[#151311] border border-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                                <span class="material-symbols-outlined text-base">download</span>
                                В эксель
                            </button>
                            <button id="import-excel-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-[#151311] border border-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                                <span class="material-symbols-outlined text-base">upload_file</span>
                                Из эксель
                            </button>
                            <button id="add-product-btn" class="flex items-center justify-center gap-2 px-6 py-4 bg-[#ffb0cc] text-[#0f0e0c] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-[#ffb0cc]/10">
                                <span class="material-symbols-outlined text-base">add</span>
                                <span id="add-btn-text">Добавить товар</span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabs -->
                    <div class="flex gap-1 bg-[#151311] p-1 rounded-2xl border border-white/5 w-fit">
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'products' ? 'text-[#ffb0cc] bg-white/5' : 'text-[#d7c1c7] hover:text-[#ffb0cc]'}" data-tab="products">Товары</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'l1' ? 'text-[#ffb0cc] bg-white/5' : 'text-[#d7c1c7] hover:text-[#ffb0cc]'}" data-tab="l1">Категории L1</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'l2' ? 'text-[#ffb0cc] bg-white/5' : 'text-[#d7c1c7] hover:text-[#ffb0cc]'}" data-tab="l2">Категории L2</button>
                        <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${activeTab === 'parameters' ? 'text-[#ffb0cc] bg-white/5' : 'text-[#d7c1c7] hover:text-[#ffb0cc]'}" data-tab="parameters">Параметры</button>
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
            const importBtn = document.getElementById('import-excel-btn');
            const exportBtn = document.getElementById('export-excel-btn');
            const refreshBtn = document.getElementById('refresh-products-btn');
            const controlsContainer = document.getElementById('crm-controls');
            
            let selectedIds = [];
            let currentProducts = [];
            let currentFilteredProducts = [];
            let currentPage = 1;
            const pageSize = 20;

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

            const exportDataToExcel = (dataToExport, type = 'products', shouldConfirm = true) => {
                const proceedExport = () => {
                    if (!dataToExport || dataToExport.length === 0) {
                        alert('Нет данных для экспорта');
                        return;
                    }
                    
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
`;

                const escapeXml = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

                if (type === 'products') {
                    xml += ` <Worksheet ss:Name="Номенклатура">
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
   <Column ss:Width="200"/>
   <Column ss:Width="200"/>
   <Column ss:Width="150"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">ID (id)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Статус (vstatus)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Группа (parent_category)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Категория (category)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Наименование (name)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Цена (тонна) (price_ton)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Цена (ед) (price_unit)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ед. изм. (unit_label)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Длина (length)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ширина (width)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Тип (type)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Вес (weight)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Описание (description)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Характеристики (specs)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Ссылка на фото (images)</Data></Cell>
   </Row>`;

                    dataToExport.forEach(p => {
                        const priceTon = Number(p.price_ton) || 0;
                        const priceUnit = Number(p.price_unit) || 0;
                        const statusText = p.vstatus || 'active';
                        const imagesText = Array.isArray(p.images) ? p.images.join(', ') : (p.images || '');
                        const specsText = (typeof p.specs === 'string') ? p.specs : JSON.stringify(p.specs || []);

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
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(p.description)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(specsText)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(imagesText)}</Data></Cell>
   </Row>`;
                    });
                } else if (type === 'l1') {
                    xml += ` <Worksheet ss:Name="Категории L1">
  <Table>
   <Column ss:Width="300"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Группа (parent_category)</Data></Cell>
   </Row>`;
                    dataToExport.forEach(item => {
                        xml += `\n   <Row ss:Height="22">
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(item.name)}</Data></Cell>
   </Row>`;
                    });
                } else if (type === 'l2') {
                    xml += ` <Worksheet ss:Name="Категории L2">
  <Table>
   <Column ss:Width="200"/>
   <Column ss:Width="300"/>
   <Row ss:Height="28">
    <Cell ss:StyleID="Header"><Data ss:Type="String">Группа (parent_category)</Data></Cell>
    <Cell ss:StyleID="Header"><Data ss:Type="String">Категория (category)</Data></Cell>
   </Row>`;
                    dataToExport.forEach(item => {
                        xml += `\n   <Row ss:Height="22">
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(item.parent)}</Data></Cell>
    <Cell ss:StyleID="StringCell"><Data ss:Type="String">${escapeXml(item.name)}</Data></Cell>
   </Row>`;
                    });
                }

                xml += `\n  </Table>\n </Worksheet>\n</Workbook>`;

                const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', `catalog_export_${new Date().toISOString().split('T')[0]}.xls`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            if (shouldConfirm) {
                showConfirmPromptModal({
                    title: 'Экспорт в Excel',
                    icon: 'download',
                    text: 'Вы уверены, что хотите выгрузить данные в Excel?',
                    confirmText: 'Выгрузить',
                    confirmClass: 'bg-[#1e7145] text-white hover:brightness-110 shadow-[#1e7145]/20'
                }, proceedExport);
            } else {
                proceedExport();
            }
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
                        const l1s = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort();
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
                    const tab = btn.dataset.tab;
                    if (tab === 'products') {
                        window.location.hash = 'products_nomenclature';
                    } else if (tab === 'parameters') {
                        window.location.hash = 'products_parameters';
                    } else {
                        window.location.hash = 'products_' + tab;
                    }
                };
            });

            // Set initial state based on activeTab
            if (controlsContainer) {
                controlsContainer.style.display = activeTab === 'products' ? 'grid' : 'none';
            }

            if (addBtnText) {
                if (activeTab === 'products') {
                    addBtnText.textContent = 'Добавить товар';
                } else if (activeTab === 'l1') {
                    addBtnText.textContent = 'Добавить категорию L1';
                } else if (activeTab === 'l2') {
                    addBtnText.textContent = 'Добавить подкатегорию L2';
                }
            }

            const saveFilters = () => {
                const filters = {
                    search: searchInput ? searchInput.value : '',
                    l1: filterL1 ? filterL1.value : '',
                    l2: filterL2 ? filterL2.value : ''
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
                    const l1s = [...new Set(currentProducts.map(p => p.parent_category).filter(Boolean))].sort();
                    const filteredL1s = search ? l1s.filter(l => l.toLowerCase().includes(search)) : l1s;
                    tableContainer.innerHTML = `
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                                        <th class="py-4 px-6 w-10 cursor-pointer header-select-cell">
                                            <input type="checkbox" id="select-all-cats" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                        </th>
                                        <th class="py-4 px-6 font-bold">Название категории (L1)</th>
                                        <th class="py-4 px-6 font-bold">Активные товары</th>
                                        <th class="py-4 px-6 font-bold text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline/5">
                                    ${filteredL1s.map(l => `
                                        <tr class="group hover:bg-on-surface/[0.02] transition-colors cursor-pointer category-l1-card" data-name="${l}">
                                            <td class="py-4 px-6 cat-select-cell" data-id="${l}">
                                                <input type="checkbox" class="cat-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id="${l}">
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">${l}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-[10px] text-on-surface-variant opacity-60">${currentProducts.filter(p => p.parent_category === l && p.vstatus !== 'archived').length} шт.</div>
                                            </td>
                                            <td class="py-4 px-6 text-right">
                                                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button class="edit-l1-btn p-2 hover:text-[#ffb0cc] transition-colors" data-name="${l}" title="Редактировать">
                                                        <span class="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button class="delete-l1-btn p-2 hover:text-red-400 transition-colors" data-name="${l}" title="Удалить">
                                                        <span class="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                    bindCategoryActions('l1');
                    bindCatCheckboxes();
                } else if (activeTab === 'l2') {
                    const search = searchInput.value.toLowerCase();
                    const l2s = [...new Set(currentProducts.map(p => p.category).filter(Boolean))].sort();
                    const filteredL2s = search ? l2s.filter(l => l.toLowerCase().includes(search)) : l2s;
                    tableContainer.innerHTML = `
                        <div class="overflow-x-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                                        <th class="py-4 px-6 w-10 cursor-pointer header-select-cell">
                                            <input type="checkbox" id="select-all-cats" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                                        </th>
                                        <th class="py-4 px-6 font-bold">Название подкатегории (L2)</th>
                                        <th class="py-4 px-6 font-bold">Родитель (L1)</th>
                                        <th class="py-4 px-6 font-bold">Активные товары</th>
                                        <th class="py-4 px-6 font-bold text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-outline/5">
                                    ${filteredL2s.map(l => {
                                        const sample = currentProducts.find(p => p.category === l);
                                        const parent = sample ? sample.parent_category : '';
                                        const count = currentProducts.filter(p => p.category === l && p.vstatus !== 'archived').length;
                                        // Use JSON string for ID to store both name and parent safely for checkboxes
                                        const catId = JSON.stringify({name: l, parent});
                                        return `
                                        <tr class="group hover:bg-on-surface/[0.02] transition-colors cursor-pointer category-l2-card" data-name="${l}" data-parent="${parent}">
                                            <td class="py-4 px-6 cat-select-cell" data-id='${catId}'>
                                                <input type="checkbox" class="cat-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id='${catId}'>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">${l}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-[10px] text-[#ffb0cc]/70 font-bold">${parent || 'Без родителя'}</div>
                                            </td>
                                            <td class="py-4 px-6">
                                                <div class="text-[10px] text-on-surface-variant opacity-60">${count} шт.</div>
                                            </td>
                                            <td class="py-4 px-6 text-right">
                                                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button class="edit-l2-btn p-2 hover:text-[#ffb0cc] transition-colors" data-name="${l}" data-parent="${parent}" title="Редактировать">
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
                        </div>
                    `;
                    bindCategoryActions('l2');
                    bindCatCheckboxes();
                }
            };
            
            const bindCatCheckboxes = () => {
                const selectAll = tableContainer.querySelector('#select-all-cats');
                const checkboxes = tableContainer.querySelectorAll('.cat-checkbox');
                
                tableContainer.querySelectorAll('.cat-select-cell, .header-select-cell').forEach(cell => {
                    cell.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const cb = cell.querySelector('input[type="checkbox"]');
                        if (cb && e.target !== cb) {
                            cb.checked = !cb.checked;
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                });

                selectAll?.addEventListener('change', () => {
                    checkboxes.forEach(cb => cb.checked = selectAll.checked);
                    selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
                    updateToolbar();
                });

                checkboxes.forEach(cb => {
                    cb.addEventListener('change', () => {
                        selectedIds = Array.from(checkboxes).filter(c => c.checked).map(c => c.dataset.id);
                        if (selectAll) {
                            const allChecked = Array.from(checkboxes).every(c => c.checked);
                            selectAll.checked = allChecked;
                            selectAll.indeterminate = selectedIds.length > 0 && !allChecked;
                        }
                        updateToolbar();
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
                filterL2.innerHTML = '<option value="">Все подкатегории (L2)</option>' + 
                    Array.from(l2Set).sort().map(l => `<option value="${l}">${l}</option>`).join('');
                
                if (Array.from(l2Set).includes(currentL2Val)) {
                    filterL2.value = currentL2Val;
                } else {
                    filterL2.value = '';
                }
            };

            const updateFilterOptions = () => {
                const l1Set = new Set(currentProducts.map(p => p.parent_category).filter(Boolean));

                filterL1.innerHTML = '<option value="">Все категории (L1)</option>' + 
                    Array.from(l1Set).sort().map(l => `<option value="${l}">${l}</option>`).join('');
                
                updateFilterL2Options();
                loadFilters();
            };

            const applyFilters = () => {
                saveFilters();

                if (activeTab === 'l1' || activeTab === 'l2') {
                    renderView();
                    return;
                }

                const search = searchInput.value.toLowerCase();
                const l1 = filterL1.value;
                const l2 = filterL2.value;

                const filtered = currentProducts.filter(p => {
                    const matchesSearch = p.name.toLowerCase().includes(search) || String(p.id).includes(search);
                    const matchesL1 = !l1 || p.parent_category === l1;
                    const matchesL2 = !l2 || p.category === l2;
                    return matchesSearch && matchesL1 && matchesL2;
                });
                
                currentPage = 1;
                currentFilteredProducts = filtered;
                renderCurrentPage();
            };

            const renderCurrentPage = () => {
                const start = (currentPage - 1) * pageSize;
                const end = start + pageSize;
                const pageItems = currentFilteredProducts.slice(start, end);
                updateTable(pageItems);
                updatePaginationUI(currentFilteredProducts.length);
            };

            window.adminChangePage = (p) => {
                currentPage = p;
                renderCurrentPage();
            };

            const updatePaginationUI = (totalItems) => {
                const totalPages = Math.ceil(totalItems / pageSize) || 1;
                let container = document.getElementById('admin-pagination');
                if (!container) {
                    container = document.createElement('div');
                    container.id = 'admin-pagination';
                    container.className = 'flex items-center justify-between p-4 bg-[#151311] border-t border-white/5 rounded-b-3xl mt-0';
                    tableContainer.parentNode.insertBefore(container, tableContainer.nextSibling);
                }
                
                if (totalItems === 0) {
                    container.innerHTML = '<span class="text-xs text-[#d7c1c7] opacity-60">Нет товаров</span>';
                    return;
                }

                const startIdx = (currentPage - 1) * pageSize + 1;
                const endIdx = Math.min(currentPage * pageSize, totalItems);

                container.innerHTML = `
                    <div class="text-xs text-[#d7c1c7] opacity-60">
                        Показано ${startIdx}-${endIdx} из ${totalItems}
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.adminChangePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-[#e7e2dd] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <span class="text-xs font-bold text-[#ffb0cc] min-w-[30px] text-center">${currentPage} / ${totalPages}</span>
                        <button onclick="window.adminChangePage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} class="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-[#e7e2dd] transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                            <span class="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                    </div>
                `;
            };

            searchInput.addEventListener('input', applyFilters);
            filterL1.addEventListener('change', () => {
                updateFilterL2Options();
                applyFilters();
            });
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

            if (importBtn) {
                importBtn.onclick = () => {
                    let modalWrapper = document.getElementById('import-template-modal');
                    if (modalWrapper) modalWrapper.remove();
                    
                    modalWrapper = document.createElement('div');
                    modalWrapper.id = 'import-template-modal';
                    modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
                    modalWrapper.style.pointerEvents = 'auto';
                    
                    modalWrapper.innerHTML = `
                        <div id="import-template-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>
                        <div id="import-template-container" class="relative w-full max-w-4xl bg-[#141210] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-[#e7e2dd] mx-4">
                            <div class="flex items-center justify-between pb-6 mb-6">
                                <div>
                                    <h3 class="text-xl font-['Space Grotesk'] tracking-tight text-[#e7e2dd] font-bold uppercase">
                                        ИМПОРТ ТОВАРОВ ИЗ ТАБЛИЦЫ
                                    </h3>
                                    <div class="text-[10px] text-[#ca7093] uppercase font-['Space Grotesk'] tracking-widest mt-1 font-bold">
                                        ПОДДЕРЖИВАЮТСЯ ФОРМАТЫ CSV И JSON
                                    </div>
                                </div>
                                <button id="import-template-close" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#d7c1c7] transition-colors">
                                    <span class="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>
                            
                            <div class="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                                <div class="bg-[#1a1816] border border-[#ffb0cc]/20 rounded-2xl p-6">
                                    <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div class="flex items-center gap-2 text-[#ffb0cc]">
                                            <span class="material-symbols-outlined text-sm">info</span>
                                            <h4 class="text-xs font-bold uppercase tracking-widest font-label-caps">ШАБЛОН ЗАГОЛОВКОВ И ДАННЫХ:</h4>
                                        </div>
                                        <button id="download-template-btn" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#ffb0cc]/40 text-[#ffb0cc] hover:bg-[#ffb0cc] hover:text-[#0f0e0c] transition-all text-[10px] font-bold uppercase tracking-widest">
                                            <span class="material-symbols-outlined text-sm">download</span>
                                            СКАЧАТЬ ШАБЛОН .CSV
                                        </button>
                                    </div>
                                    
                                    <p class="text-sm text-[#d7c1c7] mb-6">
                                        Убедитесь, что ваша таблица содержит следующие заголовки колонок (порядок не имеет значения). Символ <span class="text-[#ffb0cc]">*</span> указывает на обязательные поля:
                                    </p>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">ID (id)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. 832746</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Статус (vstatus)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">active / archived</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1 flex items-center gap-1">Группа (parent_category) <span class="text-[#ffb0cc]">*</span></div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. Арматура</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Категория (category)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. Арматура А500С</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1 flex items-center gap-1">Наименование (name) <span class="text-[#ffb0cc]">*</span></div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. Арматура 12мм</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Цена (тонна) (price_ton)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">число, напр. 75000</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Цена (ед) (price_unit)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">число, напр. 85.5</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Ед. изм. (unit_label)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. т, м, шт</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Длина (length)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. 11.7</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Ширина (width)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. 1.5</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Тип (type)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. А500С</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Вес (weight)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">напр. 0.888</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Описание (description)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">Текст описания</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Характеристики (specs)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">JSON формат</div>
                                        </div>
                                        <div class="bg-[#141210] p-3 rounded-xl border border-white/5 col-span-2">
                                            <div class="text-xs font-bold text-[#e7e2dd] mb-1">Ссылка на фото (images)</div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-60">http://...</div>
                                        </div>
                                    </div>
                                    
                                    <div class="mt-4 flex items-start gap-2 text-[10px] text-[#d7c1c7] opacity-80">
                                        <span>💡</span>
                                        <p><b>Совет по Excel:</b> сохраняйте таблицу в формате "CSV (разделитель - точка с запятой) (*.csv)" для корректного импорта.</p>
                                    </div>
                                </div>
                                
                                <div id="import-template-select-btn" class="border-2 border-dashed border-[#ffb0cc]/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#ffb0cc] hover:bg-[#ffb0cc]/5 transition-all group">
                                    <div class="w-16 h-16 rounded-2xl border border-[#ffb0cc]/30 flex items-center justify-center text-[#ffb0cc] mb-4 group-hover:scale-110 transition-transform">
                                        <span class="material-symbols-outlined text-3xl">upload_file</span>
                                    </div>
                                    <h4 class="text-[#e7e2dd] font-bold text-lg mb-1">Перетащите CSV или JSON файл сюда</h4>
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
                    
                    const container = modalWrapper.querySelector('#import-template-container');
                    
                    const close = () => {
                        modalWrapper.classList.add('opacity-0');
                        container.classList.add('scale-95');
                        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                        setTimeout(() => modalWrapper.remove(), 300);
                    };
                    
                    modalWrapper.querySelector('#import-template-backdrop').onclick = close;
                    modalWrapper.querySelector('#import-template-close').onclick = close;
                    modalWrapper.querySelector('#import-template-cancel-btn').onclick = close;
                    
                    modalWrapper.querySelector('#download-template-btn').onclick = () => {
                        const headers = "ID (id);Статус (vstatus);Группа (parent_category);Категория (category);Наименование (name);Цена (тонна) (price_ton);Цена (ед) (price_unit);Ед. изм. (unit_label);Длина (length);Ширина (width);Тип (type);Вес (weight);Описание (description);Характеристики (specs);Ссылка на фото (images)\n";
                        const exampleRow = "832746;active;Чёрный металлопрокат;Арматура;Арматура 12мм А500С;75000;85.5;т;11.7;1.5;А500С;0.888;Описание товара;[];http://link.jpg\n";
                        const blob = new Blob(["\uFEFF" + headers + exampleRow], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", "shablon_import_tovarov.csv");
                        link.style.visibility = 'hidden';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                    
                    modalWrapper.querySelector('#import-template-select-btn').onclick = () => {
                        close();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.csv,.json';
                        input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = async (ev) => {
                                    try {
                                        const text = ev.target.result;
                                        let incomingData = [];
                                        
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
                                        
                                        if (!confirm(`Импортировать ${incomingData.length} элементов?`)) return;

                                        let updatedCount = 0;
                                        let createdCount = 0;
                                        
                                        if (activeTab === 'l1' || activeTab === 'l2') {
                                            await state.bulkInsertProducts(incomingData);
                                            createdCount = incomingData.length;
                                        } else {
                                            const merged = mergePriceListData(state.products, incomingData);
                                            const updates = merged.updates || [];
                                            const newProducts = merged.newProducts || [];
                                            
                                            if (updates.length > 0) {
                                                await state.bulkUpdateProducts(updates);
                                                updatedCount = updates.length;
                                            }
                                            if (newProducts.length > 0) {
                                                await state.bulkInsertProducts(newProducts);
                                                createdCount = newProducts.length;
                                            }
                                        }
                                        
                                        if (updatedCount > 0 || createdCount > 0) {
                                            alert(`Успешно! Обновлено: ${updatedCount}, Создано: ${createdCount}`);
                                            await loadProducts();
                                        } else {
                                            alert('Нет данных для обновления или создания');
                                        }
                                    } catch (err) {
                                        alert('Ошибка при разборе файла: ' + err.message);
                                    }
                                };
                                reader.readAsText(file);
                            }
                        };
                        input.click();
                    };
                    
                    requestAnimationFrame(() => {
                        modalWrapper.classList.remove('opacity-0');
                        container.classList.remove('scale-95');
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
                    onClose: () => {
                        selectedIds = [];
                        // Clear checkboxes in UI
                        const checkboxes = document.querySelectorAll('.product-checkbox, #select-all-products');
                        checkboxes.forEach(cb => {
                            cb.checked = false;
                            cb.indeterminate = false;
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
                        exportDataToExcel(exportData, activeTab, false);
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
                document.querySelectorAll('.inline-cat-dropdown').forEach(d => d.remove());
                
                const rect = el.getBoundingClientRect();
                const dropdown = document.createElement('div');
                dropdown.className = 'inline-cat-dropdown custom-dropdown-menu fixed rounded-2xl p-2 z-[10000] min-w-[200px] max-h-[300px] overflow-y-auto custom-scrollbar shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200';
                
                let top = rect.bottom + window.scrollY + 4;
                let left = rect.left + window.scrollX;
                dropdown.style.left = `${left}px`;
                dropdown.style.top = `${top}px`;

                let optionsHtml = '';
                if (type === 'l1') {
                    const l1s = [...new Set(state.products.map(p => p.parent_category).filter(Boolean))].sort();
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
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#ffb0cc] transition-all" data-action="new">
                            <span>➕ Создать новую L1...</span>
                        </button>
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 transition-all" data-value="">
                            <span>❌ Без категории</span>
                        </button>
                    `;
                } else {
                    const l2s = [...new Set(state.products.filter(p => !product.parent_category || p.parent_category === product.parent_category).map(p => p.category).filter(Boolean))].sort();
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
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-[#ffb0cc] transition-all" data-action="new">
                            <span>➕ Создать новую L2...</span>
                        </button>
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-red-400 transition-all" data-value="">
                            <span>❌ Без подкатегории</span>
                        </button>
                    `;
                }

                dropdown.innerHTML = optionsHtml;
                document.body.appendChild(dropdown);

                const dropRect = dropdown.getBoundingClientRect();
                if (dropRect.right > window.innerWidth) {
                    dropdown.style.left = `${window.innerWidth - dropRect.width - 16}px`;
                }
                if (dropRect.bottom > window.innerHeight) {
                    dropdown.style.top = `${rect.top + window.scrollY - dropRect.height - 4}px`;
                }

                dropdown.querySelectorAll('button').forEach(btn => {
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

                        dropdown.remove();

                        try {
                            const updates = {};
                            if (type === 'l1') {
                                updates.parent_category = newValue || null;
                                updates.category = null;
                            } else {
                                updates.category = newValue || null;
                            }

                            await state.updateProduct(product.id, updates);
                            window.showToast?.(`Товар «${product.name}» обновлен`, 'success', 'Товары');
                            await loadProducts();
                        } catch (err) {
                            alert('Ошибка при изменении категории: ' + err.message);
                        }
                    };
                });

                const closeDropdown = (ev) => {
                    if (!dropdown.contains(ev.target) && ev.target !== el && !el.contains(ev.target)) {
                        dropdown.remove();
                        document.removeEventListener('click', closeDropdown);
                    }
                };
                setTimeout(() => document.addEventListener('click', closeDropdown), 50);
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
                    },
                    onStatusToggle: async (id, currentStatus) => {
                        const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
                        try {
                            await state.updateProduct(id, { vstatus: newStatus });
                            await loadProducts();
                        } catch (err) {
                            alert('Ошибка при изменении статуса: ' + err.message);
                        }
                    },
                    onCategoryClick: (product, type, el) => {
                        showCategorySelectPopup(product, type, el);
                    }
                });
            };

            await loadProducts();

            // Subscribe to updates
            const unsubscribe = state.on('products:updated', (products) => {
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
                let btn = document.querySelector(`[data-view="${viewId}"]`);
                if (!btn) {
                    btn = document.querySelector(`[data-view^="${viewId}"]`);
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
                navItems.forEach(b => b.classList.remove('bg-white/5', 'text-[#ffb0cc]'));
                btn.classList.add('bg-white/5', 'text-[#ffb0cc]');

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
                    } else if (view.startsWith('products_')) {
                        renderProductsView(contentEl, tab);
                    } else if (view === 'dashboard') {
                        renderDashboard(contentEl, state);
                    } else if (view === 'orders') {
                        renderOrdersView(contentEl, state);
                    } else if (view === 'users') {
                        renderUsersView(contentEl, state);
                    } else if (view === 'leads') {
                        renderLeadsView(contentEl, state);
                    } else if (view.startsWith('support_')) {
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
