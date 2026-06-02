/**
 * Parameters Management Component
 * Manages the catalogue of product parameter names (справочник параметров)
 */

import { renderBulkToolbar, showConfirmPromptModal } from './bulk-toolbar.js';
import { showExportFormatModal } from '../export-engine.js';

export async function renderParametersView(container, state) {
    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 class="text-lg md:text-xl font-bold font-['Space Grotesk'] tracking-tight text-on-surface">Управление каталогом</h3>
                    <p class="text-xs text-on-surface-variant mt-0.5">Справочник параметров товаров</p>
                </div>
                <div class="flex flex-wrap gap-2 items-center">
                    <button id="refresh-params-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low text-primary border border-outline/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                    <button id="export-params-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low border border-outline/10 text-on-surface rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-surface-container-high transition-all">
                        <span class="material-symbols-outlined text-base">download</span>
                        <span class="hidden sm:inline">В эксель</span>
                    </button>
                    <button id="import-params-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container-low border border-outline/10 text-on-surface rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-surface-container-high transition-all">
                        <span class="material-symbols-outlined text-base">upload_file</span>
                        <span class="hidden sm:inline">Из эксель</span>
                    </button>
                    <button id="add-param-btn" class="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-primary text-on-primary rounded-2xl font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/10 shrink-0" title="Добавить параметр">
                        <span class="material-symbols-outlined text-base">add</span>
                    </button>
                </div>
            </div>

            <!-- Tabs: Desktop row | Mobile arrow-navigator -->
            <!-- Desktop tabs -->
            <div class="hidden md:flex gap-1 bg-surface-container-low p-1 rounded-2xl border border-outline/10 w-full md:w-fit overflow-x-auto scrollbar-none max-w-full">
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary" data-tab="products">Товары</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary" data-tab="l1">Категории L1</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary" data-tab="l2">Категории L2</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary" data-tab="l3">L3 (табы)</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-primary bg-primary/10" data-tab="parameters">Параметры</button>
            </div>
            <!-- Mobile tab navigator (arrow-switcher) -->
            <div class="flex md:hidden items-center justify-between gap-3 bg-surface-container-low p-3 rounded-2xl border border-outline/10">
                <button id="params-tab-prev-btn" class="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-90">
                    <span class="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <div class="flex flex-col items-center gap-1 flex-1">
                    <span class="font-bold uppercase text-[11px] tracking-widest text-primary">Параметры</span>
                    <div class="flex gap-1 mt-1">
                        <span class="w-1.5 h-1.5 rounded-full transition-all bg-outline/30"></span>
                        <span class="w-1.5 h-1.5 rounded-full transition-all bg-outline/30"></span>
                        <span class="w-1.5 h-1.5 rounded-full transition-all bg-outline/30"></span>
                        <span class="w-1.5 h-1.5 rounded-full transition-all bg-outline/30"></span>
                        <span class="w-1.5 h-1.5 rounded-full transition-all bg-primary scale-125"></span>
                    </div>
                </div>
                <button id="params-tab-next-btn" class="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container border border-outline/10 text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all active:scale-90">
                    <span class="material-symbols-outlined text-xl">chevron_right</span>
                </button>
            </div>

            <!-- Bulk Toolbar Container -->
            <div id="params-bulk-toolbar-container"></div>

            <!-- Search -->
            <div class="flex gap-2 items-center">
                <div class="relative flex-1">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60 text-lg">search</span>
                    <input type="text" id="params-search" placeholder="Поиск по названию параметра..." autocomplete="off" class="w-full bg-surface-container-low border border-outline/10 rounded-xl pl-12 pr-4 py-3 text-sm font-medium focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/40">
                </div>
            </div>

            <!-- Stats -->
            <div id="params-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>

            <!-- Table container -->
            <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="params-table-container">
                <div class="flex flex-col items-center justify-center h-[400px] gap-6 opacity-40">
                    <div class="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div class="font-label-caps text-[10px] uppercase tracking-[0.3em]">Загрузка параметров...</div>
                </div>
            </div>
        </div>
    `;

    let allParams = [];
    let filteredParams = [];

    const tableContainer = document.getElementById('params-table-container');
    const searchInput = document.getElementById('params-search');
    const statsEl = document.getElementById('params-stats');
    const addBtn = document.getElementById('add-param-btn');
    const refreshBtn = document.getElementById('refresh-params-btn');
    const exportBtn = document.getElementById('export-params-btn');

    // ─── API helpers ─────────────────────────────────────────────────────────
    const apiFetch = async (url, opts = {}) => {
        const token = localStorage.getItem('metal_token');
        let targetUrl = url;
        if (!opts.method || opts.method.toUpperCase() === 'GET') {
            const hasQuery = url.includes('?');
            targetUrl = `${url}${hasQuery ? '&' : '?'}t=${Date.now()}`;
        }
        const res = await fetch(targetUrl, {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            ...opts
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
    };

    const loadParams = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#964551]/20 border-t-[#964551] rounded-full animate-spin"></div>
            </div>
        `;
        try {
            allParams = await apiFetch('/api/admin/parameters');
            renderStats();
            applySearch();
        } catch (err) {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[400px] text-red-400 gap-4">
                    <span class="material-symbols-outlined text-4xl">error</span>
                    <div class="text-sm font-medium">${err.message}</div>
                    <button onclick="location.reload()" class="text-xs uppercase tracking-widest font-bold underline">Повторить</button>
                </div>
            `;
        }
    };

    // ─── Stats ────────────────────────────────────────────────────────────────
    const renderStats = () => {
        const withUnit = allParams.filter(p => p.unit).length;
        const withDesc = allParams.filter(p => p.description).length;
        const categories = new Set(allParams.flatMap(p => (p.category_hint || '').split(',').map(s => s.trim()).filter(Boolean))).size;

        statsEl.innerHTML = [
            { label: 'Всего параметров', value: allParams.length, icon: 'tune' },
            { label: 'С единицами изм.', value: withUnit, icon: 'straighten' },
            { label: 'С описанием', value: withDesc, icon: 'description' },
            { label: 'Категорий', value: categories, icon: 'category' },
        ].map(s => `
            <div class="liquid-glass p-6 rounded-2xl border border-outline/5 shadow-lg flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <span class="material-symbols-outlined text-xl">${s.icon}</span>
                </div>
                <div>
                    <div class="text-2xl font-bold text-on-surface font-display-xl">${s.value}</div>
                    <div class="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-widest mt-0.5">${s.label}</div>
                </div>
            </div>
        `).join('');
    };

    // ─── Search / filter ──────────────────────────────────────────────────────
    const applySearch = () => {
        const q = (searchInput?.value || '').toLowerCase().trim();
        filteredParams = q
            ? allParams.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description || '').toLowerCase().includes(q) ||
                (p.category_hint || '').toLowerCase().includes(q) ||
                (p.unit || '').toLowerCase().includes(q)
            )
            : [...allParams];
        renderTable();
    };

    searchInput?.addEventListener('input', applySearch);
    refreshBtn.onclick = loadParams;

    const importParamsBtn = document.getElementById('import-params-btn');
    if (importParamsBtn) {
        importParamsBtn.onclick = () => {
            let modalWrapper = document.getElementById('import-params-modal');
            if (modalWrapper) modalWrapper.remove();
            
            modalWrapper = document.createElement('div');
            modalWrapper.id = 'import-params-modal';
            modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
            modalWrapper.style.pointerEvents = 'auto';
            
            modalWrapper.innerHTML = `
                <div id="import-params-backdrop" class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>
                <div id="import-params-container" class="relative w-full max-w-2xl bg-[#141210] border border-white/5 rounded-[2rem] p-8 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-[#e7e2dd] mx-4">
                    <div class="flex items-center justify-between pb-6 mb-6">
                        <div>
                            <h3 class="text-xl font-['Space Grotesk'] tracking-tight text-[#e7e2dd] font-bold uppercase">ИМПОРТ ПАРАМЕТРОВ</h3>
                            <div class="text-[10px] text-[#964551] uppercase font-['Space Grotesk'] tracking-widest mt-1 font-bold">ПОДДЕРЖИВАЕТСЯ ФОРМАТ CSV</div>
                        </div>
                        <button id="import-params-close" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#d7c1c7] transition-colors">
                            <span class="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                    
                    <div class="bg-[#1a1816] border border-[#964551]/20 rounded-2xl p-6 mb-6">
                        <div class="text-sm text-[#d7c1c7] mb-4">
                            Для массового импорта параметров используйте файл формата CSV. Колонки должны содержать:
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">name</b> — Название <span class="text-[#964551]">*</span></div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">unit</b> — Ед. изм.</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">type</b> — string, number, boolean, select</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">required</b> — true/false или Да/Нет</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">options</b> — Значения списка (через запятую)</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">category_hint</b> — Категории</div>
                        </div>
                        <div class="mt-4">
                            <button id="download-params-template-btn" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#964551]/40 text-[#964551] hover:bg-[#964551] hover:text-[#0f0e0c] transition-all text-[10px] font-bold uppercase tracking-widest">
                                <span class="material-symbols-outlined text-sm">download</span> СКАЧАТЬ ШАБЛОН
                            </button>
                        </div>
                    </div>
                    
                    <div id="import-params-select-btn" class="border-2 border-dashed border-[#964551]/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#964551] hover:bg-[#964551]/5 transition-all group">
                        <div class="w-16 h-16 rounded-2xl border border-[#964551]/30 flex items-center justify-center text-[#964551] mb-4 group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-3xl">upload_file</span>
                        </div>
                        <h4 class="text-[#e7e2dd] font-bold text-lg mb-1">Перетащите CSV сюда</h4>
                        <p class="text-[#d7c1c7] text-sm opacity-60">или нажмите для выбора файла</p>
                    </div>
                    
                    <input type="file" id="import-params-input" accept=".csv" class="hidden">
                    
                    <div class="flex justify-end gap-3 pt-6 mt-4">
                        <button id="import-params-cancel-btn" class="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7] font-label-caps">ОТМЕНА</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modalWrapper);
            if (window.lockScrollGlobal) window.lockScrollGlobal();
            
            const container = modalWrapper.querySelector('#import-params-container');
            const fileInput = modalWrapper.querySelector('#import-params-input');
            const selectBtn = modalWrapper.querySelector('#import-params-select-btn');
            
            const close = () => {
                modalWrapper.classList.add('opacity-0');
                container.classList.add('scale-95');
                if (window.unlockScrollGlobal) window.unlockScrollGlobal();
                setTimeout(() => modalWrapper.remove(), 300);
            };
            
            modalWrapper.querySelector('#import-params-backdrop').onclick = close;
            modalWrapper.querySelector('#import-params-close').onclick = close;
            modalWrapper.querySelector('#import-params-cancel-btn').onclick = close;
            
            modalWrapper.querySelector('#download-params-template-btn').onclick = () => {
                const headers = "Название (name);Ед. изм. (unit);Тип (type);Обязательно (required);Список (options);Категории (category_hint);Описание (description)\n";
                const row = "Диаметр;мм;number;Да;;Арматура;Наружный диаметр\n";
                const blob = new Blob(["\uFEFF" + headers + row], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "Шаблон_импорта_параметров.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            
            selectBtn.onclick = () => fileInput.click();
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                if (!confirm(`Импортировать параметры из файла "${file.name}"?`)) return;
                
                const reader = new FileReader();
                reader.onload = async (ev) => {
                    const text = ev.target.result;
                    const lines = text.split('\n');
                    if (lines.length < 2) return alert('Файл пуст');
                    
                    const rows = lines.slice(1).map(l => l.split(';')).filter(row => row[0] && row[0].trim());
                    
                    try {
                        let created = 0;
                        for (const row of rows) {
                            const name = row[0]?.trim();
                            if (!name) continue;
                            
                            const payload = {
                                name,
                                unit: row[1]?.trim() || null,
                                type: row[2]?.trim() || 'string',
                                required: row[3]?.trim().toLowerCase() === 'да' || row[3]?.trim().toLowerCase() === 'true',
                                options: row[4]?.trim() || null,
                                category_hint: row[5]?.trim() || null,
                                description: row[6]?.trim() || null
                            };
                            
                            await apiFetch('/api/admin/parameters', {
                                method: 'POST',
                                body: JSON.stringify(payload)
                            });
                            created++;
                        }
                        alert(`Успешно создано параметров: ${created}`);
                        close();
                        await loadParams();
                    } catch (err) {
                        alert('Ошибка импорта: ' + err.message);
                    }
                };
                reader.readAsText(file);
            };
            
            requestAnimationFrame(() => {
                modalWrapper.classList.remove('opacity-0');
                container.classList.remove('scale-95');
            });
        };
    }

    // ─── Table render ─────────────────────────────────────────────────────────
    const renderTable = () => {
        if (filteredParams.length === 0) {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[400px] gap-4 opacity-40">
                    <span class="material-symbols-outlined text-5xl text-primary">tune</span>
                    <div class="font-label-caps text-[10px] uppercase tracking-[0.3em]">Параметры не найдены</div>
                    <button id="empty-add-param" class="px-6 py-3 rounded-2xl bg-primary text-on-primary text-xs font-bold uppercase tracking-widest">Добавить первый параметр</button>
                </div>
            `;
            document.getElementById('empty-add-param')?.addEventListener('click', () => openParamModal(null));
            return;
        }

        tableContainer.innerHTML = `
            <div class="overflow-x-auto">
                <!-- Desktop table -->
                <table class="w-full hidden md:table">
                    <thead>
                        <tr class="border-b border-outline/10">
                            <th class="py-5 px-6 w-10 header-select-cell cursor-pointer">
                                <input type="checkbox" id="select-all-params" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                            </th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Название параметра</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Ед. изм. / Тип</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Категории</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Использование</th>
                            <th class="w-24"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredParams.map((p) => `
                            <tr class="border-b border-outline/5 hover:bg-primary/[0.03] transition-colors group cursor-pointer param-row" data-id="${p.id}">
                                <td class="px-6 py-4 param-select-cell" data-id="${p.id}">
                                    <input type="checkbox" class="param-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id="${p.id}">
                                </td>
                                <td class="px-6 py-4 param-name-cell cursor-pointer" data-id="${p.id}">
                                    <div class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                                        <span class="param-name-text">${escapeHtml(p.name)}</span>
                                        <span class="material-symbols-outlined param-edit-icon text-[14px] opacity-0 group-hover:opacity-40 transition-opacity">edit</span>
                                        ${p.required ? '<span class="text-red-400 text-[10px] font-bold" title="Обязательный">*</span>' : ''}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col gap-1">
                                        <div class="quick-unit-select cursor-pointer w-max" data-id="${p.id}">
                                            ${p.unit ? 
                                                `<span class="px-3 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary w-max text-[10px] font-bold font-label-caps uppercase tracking-widest hover:bg-primary/25 transition-all inline-block select-none">${escapeHtml(p.unit)}</span>` : 
                                                `<span class="px-3 py-1 rounded-xl bg-surface-variant/30 border border-outline/10 text-on-surface-variant/40 w-max text-[10px] font-bold font-label-caps uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all inline-block select-none">—</span>`
                                            }
                                        </div>
                                        <span class="text-[9px] text-on-surface-variant opacity-60 uppercase font-bold tracking-widest">${p.type === 'number' ? 'Число' : (p.type === 'select' ? 'Список' : (p.type === 'boolean' ? 'Логическое' : 'Строка'))}</span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="quick-category-select flex flex-wrap gap-1 p-1.5 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/15 transition-all cursor-pointer w-full min-h-[30px]" data-id="${p.id}">
                                        ${(p.category_hint || '').split(',').filter(s => s.trim()).map(cat =>
                                            `<span class="px-2 py-0.5 rounded-lg bg-surface-variant text-on-surface-variant text-[9px] font-label-caps uppercase tracking-widest">${escapeHtml(cat.trim())}</span>`
                                        ).join('') || '<span class="text-on-surface-variant opacity-30 text-xs">—</span>'}
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-wrap gap-1.5 select-none">
                                        ${p.is_search_filter !== false ? 
                                            `<span class="px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold font-label-caps uppercase tracking-widest inline-flex items-center gap-1 shadow-sm"><span class="material-symbols-outlined text-[10px]">search</span>Поиск</span>` : ''
                                        }
                                        ${p.is_characteristic !== false ? 
                                            `<span class="px-2.5 py-1 rounded-xl bg-surface-variant/40 border border-outline/10 text-on-surface-variant text-[9px] font-bold font-label-caps uppercase tracking-widest inline-flex items-center gap-1"><span class="material-symbols-outlined text-[10px]">info</span>Характ.</span>` : ''
                                        }
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="edit-param-btn p-2 rounded-xl hover:bg-primary/10 hover:text-primary text-on-surface-variant transition-all" data-id="${p.id}" title="Редактировать">
                                            <span class="material-symbols-outlined text-base">edit</span>
                                        </button>
                                        <button class="delete-param-btn p-2 rounded-xl hover:bg-error/10 hover:text-error text-on-surface-variant transition-all" data-id="${p.id}" title="Удалить">
                                            <span class="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <!-- Spreadsheet footer aggregates -->
                    <tfoot class="border-t-2 border-primary/20 bg-surface-container-low/50 text-xs font-bold text-on-surface select-none">
                        <tr class="divide-x divide-outline/5">
                            <td class="py-4 px-6"></td>
                            <td class="py-4 px-6 text-[10px] uppercase font-bold text-on-surface-variant opacity-60">Итого:</td>
                            <td class="py-4 px-6">
                                <div class="text-[10px] text-on-surface-variant font-medium">ВСЕГО: <span id="param-stats-total" class="font-bold text-primary">0</span></div>
                                <div class="text-[10px] text-on-surface-variant font-medium mt-1">ОБЯЗАТЕЛЬНЫХ: <span id="param-stats-req" class="font-bold text-primary">0</span></div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-[10px] text-on-surface-variant font-medium">ТИПЫ:</div>
                                <div class="text-[9px] text-on-surface-variant font-medium mt-0.5 opacity-80" id="param-stats-types">Числа: 0 • Строки: 0 • Списки: 0</div>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-1 px-1 py-0.5 bg-surface-container border border-outline/10 rounded-xl w-max ml-auto shadow-inner">
                                    <button type="button" id="param-stats-all-btn" class="param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary">Все</button>
                                    <button type="button" id="param-stats-sel-btn" class="param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant">Выбр.</button>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
                <!-- Mobile cards -->
                <div class="md:hidden flex flex-col">
                    <div class="flex items-center gap-3 px-4 py-3 border-b border-outline/10">
                        <input type="checkbox" id="select-all-params-mobile" class="param-select-all-mobile w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                        <span class="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-label-caps">Выбрать все</span>
                    </div>
                    <div class="flex flex-col divide-y divide-outline/5">
                    ${filteredParams.map((p) => `
                        <div class="param-row p-4 hover:bg-primary/[0.03] transition-colors cursor-pointer" data-id="${p.id}">
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex items-start gap-3 flex-1 min-w-0">
                                    <input type="checkbox" class="param-checkbox w-5 h-5 rounded border-outline/30 bg-transparent text-primary cursor-pointer mt-0.5 shrink-0" data-id="${p.id}">
                                    <div class="flex-1 min-w-0">
                                        <div class="param-name-cell font-bold text-sm text-on-surface flex items-center gap-1.5 flex-wrap" data-id="${p.id}">
                                            <span class="param-name-text">${escapeHtml(p.name)}</span>
                                            ${p.required ? '<span class="text-red-400 text-[10px] font-bold">*</span>' : ''}
                                        </div>
                                        <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <div class="quick-unit-select cursor-pointer" data-id="${p.id}">
                                                ${p.unit ? 
                                                    `<span class="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold font-label-caps uppercase tracking-widest inline-block select-none">${escapeHtml(p.unit)}</span>` : 
                                                    `<span class="px-2 py-0.5 rounded-lg bg-surface-variant/30 border border-outline/10 text-on-surface-variant/40 text-[10px] font-bold font-label-caps uppercase tracking-widest inline-block select-none">—</span>`
                                                }
                                            </div>
                                            <span class="text-[9px] text-on-surface-variant opacity-60 uppercase font-bold tracking-widest">${p.type === 'number' ? 'Число' : (p.type === 'select' ? 'Список' : (p.type === 'boolean' ? 'Лог.' : 'Строка'))}</span>
                                        </div>
                                        <div class="quick-category-select flex flex-wrap gap-1 mt-2 cursor-pointer" data-id="${p.id}">
                                            ${(p.category_hint || '').split(',').filter(s => s.trim()).map(cat =>
                                                `<span class="px-2 py-0.5 rounded-lg bg-surface-variant text-on-surface-variant text-[9px] font-label-caps uppercase tracking-widest">${escapeHtml(cat.trim())}</span>`
                                            ).join('') || ''}
                                        </div>
                                        <div class="flex items-center gap-1.5 mt-2 flex-wrap select-none">
                                            ${p.is_search_filter !== false ? 
                                                `<span class="px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold font-label-caps uppercase tracking-widest inline-flex items-center gap-0.5"><span class="material-symbols-outlined text-[9px]">search</span>Поиск</span>` : ''
                                            }
                                            ${p.is_characteristic !== false ? 
                                                `<span class="px-2 py-0.5 rounded-lg bg-surface-variant/40 border border-outline/10 text-on-surface-variant text-[8px] font-bold font-label-caps uppercase tracking-widest inline-flex items-center gap-0.5"><span class="material-symbols-outlined text-[9px]">info</span>Характ.</span>` : ''
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div class="flex items-center gap-1 shrink-0">
                                    <button class="edit-param-btn p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary text-on-surface-variant transition-all min-w-[40px] min-h-[40px] flex items-center justify-center" data-id="${p.id}" title="Редактировать">
                                        <span class="material-symbols-outlined text-base">edit</span>
                                    </button>
                                    <button class="delete-param-btn p-2.5 rounded-xl hover:bg-error/10 hover:text-error text-on-surface-variant transition-all min-w-[40px] min-h-[40px] flex items-center justify-center" data-id="${p.id}" title="Удалить">
                                        <span class="material-symbols-outlined text-base">delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    </div>
                    <!-- Mobile stats view -->
                    <div class="mt-4 p-5 bg-surface-container rounded-3xl border border-outline/10 space-y-4 select-none">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Статистика:</span>
                            <div class="flex items-center gap-1 bg-surface-container-low border border-outline/10 rounded-xl p-1 shadow-inner">
                                <button type="button" id="param-stats-all-btn-mobile" class="param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary">Все</button>
                                <button type="button" id="param-stats-sel-btn-mobile" class="param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant">Выбр.</button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-[10px] uppercase font-bold text-on-surface-variant">
                            <div>Всего: <span id="param-stats-total-mobile" class="text-on-surface">0</span></div>
                            <div>Обязательных: <span id="param-stats-req-mobile" class="text-primary">0</span></div>
                            <div class="col-span-2">Типы: <span id="param-stats-types-mobile" class="text-on-surface font-mono">0</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="px-6 py-4 border-t border-outline/5 text-[10px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest">
                Показано ${filteredParams.length} из ${allParams.length} параметров
            </div>
        `;

        let lastChecked = null;
        const handleSelectClick = (clickedId, event) => {
            const clickedCb = event.target?.closest?.('.param-checkbox')
                || tableContainer.querySelector(`.param-checkbox[data-id="${clickedId}"]`);
            if (!clickedCb) return;

            const isRangeSelect = event.shiftKey || event.ctrlKey;
            const targetState = clickedCb.checked;

            if (isRangeSelect && lastChecked) {
                // Scope range to the same layout (desktop table vs mobile cards)
                const scope = clickedCb.closest('table') || clickedCb.closest('.md\\:hidden') || tableContainer;
                const cbArray = Array.from(scope.querySelectorAll('.param-checkbox'));
                const start = cbArray.findIndex(c => String(c.dataset.id) === String(clickedId));
                const end = cbArray.findIndex(c => String(c.dataset.id) === String(lastChecked.dataset.id));

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
            
            lastChecked = clickedCb;
        };

        // Bind row actions
        tableContainer.querySelectorAll('.param-row').forEach(row => {
            row.onclick = (e) => {
                if (e.target.closest('.edit-param-btn') || e.target.closest('.delete-param-btn') || e.target.closest('.quick-unit-select') || e.target.closest('.quick-category-select') || e.target.closest('.param-name-cell') || e.target.closest('input[type="checkbox"]')) return;
                
                const cb = row.querySelector('.param-checkbox');
                if (cb) {
                    cb.checked = !cb.checked;
                    handleSelectClick(cb.dataset.id, e);
                    cb.dispatchEvent(new Event('change'));
                }
            };
        });

        tableContainer.querySelectorAll('.quick-unit-select').forEach(el => {
            el.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(el.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (!param) return;
                
                document.querySelectorAll('.inline-unit-dropdown').forEach(d => d.remove());
                
                const rect = el.getBoundingClientRect();
                const dropdown = document.createElement('div');
                dropdown.className = 'inline-unit-dropdown custom-dropdown-menu fixed rounded-2xl p-2 z-[10000] min-w-[140px] flex flex-col shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200';
                dropdown.style.left = `${rect.left}px`;
                dropdown.style.top = `${rect.bottom + 4}px`;

                const units = ['мм', 'см', 'м', 'кг', 'т', 'шт', 'м²', 'пог. м', 'Без ед. изм.'];
                dropdown.innerHTML = `
                    <div class="flex items-center justify-between px-3 py-1.5 border-b border-outline/10 mb-1 select-none shrink-0">
                        <span class="text-[9px] font-bold text-on-surface-variant/50 uppercase tracking-wider font-label-caps">Ед. изм.</span>
                        <button class="dropdown-close-btn w-6 h-6 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                            <span class="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                    <div class="space-y-0.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                        ${units.map(u => {
                            const isCurrent = (param.unit || 'Без ед. изм.') === u || (!param.unit && u === 'Без ед. изм.');
                            return `
                                <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} transition-all flex items-center justify-between" data-unit="${u === 'Без ед. изм.' ? '' : u}">
                                    <span>${u}</span>
                                    ${isCurrent ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
                                </button>
                            `;
                        }).join('')}
                    </div>
                `;

                document.body.appendChild(dropdown);

                const cleanup = () => {
                    dropdown.remove();
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
                    if (dropdown.contains(ev.target)) {
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

                dropdown.querySelector('.dropdown-close-btn').onclick = (ev) => {
                    ev.stopPropagation();
                    cleanup();
                };

                dropdown.querySelectorAll('.custom-dropdown-item').forEach(btn => {
                    btn.onclick = async (ev) => {
                        ev.stopPropagation();
                        const newUnit = btn.dataset.unit;
                        const payload = {
                            name: param.name,
                            unit: newUnit,
                            category_hint: param.category_hint,
                            description: param.description,
                            sort_order: param.sort_order
                        };

                        try {
                            await apiFetch(`/api/admin/parameters/${param.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                            window.showToast?.(`Единица измерения изменена на ${newUnit || 'пусто'}`, 'success', 'Параметры');
                            cleanup();
                            await loadParams();
                        } catch (err) {
                            alert('Ошибка: ' + err.message);
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
        });

        tableContainer.querySelectorAll('.quick-category-select').forEach(el => {
            el.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(el.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (param) openCategoryParamModal(param);
            };
        });

        tableContainer.querySelectorAll('.edit-param-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (param) openParamModal(param);
            };
        });

        tableContainer.querySelectorAll('.delete-param-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (!param) return;
                if (!confirm(`Удалить параметр «${param.name}»? Это не повлияет на уже созданные товары.`)) return;

                try {
                    await apiFetch(`/api/admin/parameters/${id}`, { method: 'DELETE' });
                    window.showToast?.(`Параметр «${param.name}» удалён`, 'success', 'Параметры');
                    await loadParams();
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                }
            };
        });
        
        // Bind checkboxes
        const selectAll = tableContainer.querySelector('#select-all-params');
        const selectAllMobile = tableContainer.querySelector('#select-all-params-mobile');
        const selectAllEls = [selectAll, selectAllMobile].filter(Boolean);
        const checkboxes = tableContainer.querySelectorAll('.param-checkbox');
        
        tableContainer.querySelectorAll('.param-select-cell, .header-select-cell').forEach(cell => {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                const cb = cell.querySelector('input[type="checkbox"]');
                if (cb && e.target !== cb) {
                    cb.checked = !cb.checked;
                    if (cb.classList.contains('param-checkbox')) {
                        handleSelectClick(cb.dataset.id, e);
                    }
                    cb.dispatchEvent(new Event('change'));
                }
            });
        });

        let statsMode = 'all';
        const updateParamStatistics = () => {
            const statsAllBtn = tableContainer.querySelector('#param-stats-all-btn');
            const statsSelBtn = tableContainer.querySelector('#param-stats-sel-btn');
            const statsAllBtnMobile = tableContainer.querySelector('#param-stats-all-btn-mobile');
            const statsSelBtnMobile = tableContainer.querySelector('#param-stats-sel-btn-mobile');

            if (statsSelBtn) statsSelBtn.textContent = `Выбр. (${selectedParamIds.length})`;
            if (statsSelBtnMobile) statsSelBtnMobile.textContent = `Выбр. (${selectedParamIds.length})`;

            let targets = [];
            if (statsMode === 'all') {
                targets = [...filteredParams];
            } else {
                const checkedIds = new Set(selectedParamIds);
                targets = filteredParams.filter(p => checkedIds.has(p.id));
            }

            const totalCount = targets.length;
            const reqCount = targets.filter(p => p.required).length;
            
            const typeCounts = { number: 0, string: 0, select: 0, boolean: 0 };
            targets.forEach(p => {
                const t = p.type || 'string';
                if (typeCounts[t] !== undefined) typeCounts[t]++;
                else typeCounts.string++;
            });

            const elTotal = tableContainer.querySelector('#param-stats-total');
            const elReq = tableContainer.querySelector('#param-stats-req');
            const elTypes = tableContainer.querySelector('#param-stats-types');
            if (elTotal) elTotal.textContent = totalCount;
            if (elReq) elReq.textContent = reqCount;
            if (elTypes) {
                elTypes.textContent = `Числа: ${typeCounts.number} • Строки: ${typeCounts.string} • Списки: ${typeCounts.select} • Лог: ${typeCounts.boolean}`;
            }

            const elTotalMobile = tableContainer.querySelector('#param-stats-total-mobile');
            const elReqMobile = tableContainer.querySelector('#param-stats-req-mobile');
            const elTypesMobile = tableContainer.querySelector('#param-stats-types-mobile');
            if (elTotalMobile) elTotalMobile.textContent = totalCount;
            if (elReqMobile) elReqMobile.textContent = reqCount;
            if (elTypesMobile) {
                elTypesMobile.textContent = `#:${typeCounts.number} • A-Z:${typeCounts.string} • ☰:${typeCounts.select} • ✓/✗:${typeCounts.boolean}`;
            }

            const activeClass = 'param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary shadow-sm';
            const inactiveClass = 'param-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant hover:text-primary';
            
            if (statsAllBtn) statsAllBtn.className = statsMode === 'all' ? activeClass : inactiveClass;
            if (statsSelBtn) statsSelBtn.className = statsMode === 'selected' ? activeClass : inactiveClass;
            if (statsAllBtnMobile) statsAllBtnMobile.className = statsMode === 'all' ? activeClass : inactiveClass;
            if (statsSelBtnMobile) statsSelBtnMobile.className = statsMode === 'selected' ? activeClass : inactiveClass;
        };

        const updateSelectionState = () => {
            checkboxes.forEach(cb => {
                const id = parseInt(cb.dataset.id);
                if (cb.checked) {
                    if (!selectedParamIds.includes(id)) selectedParamIds.push(id);
                } else {
                    selectedParamIds = selectedParamIds.filter(val => val !== id);
                }
            });

            if (selectAllEls.length) {
                const uniqueIds = new Set(Array.from(checkboxes).map(cb => cb.dataset.id));
                const allChecked = uniqueIds.size > 0 && selectedParamIds.length === uniqueIds.size;
                const someChecked = selectedParamIds.length > 0;
                selectAllEls.forEach(sa => {
                    sa.checked = allChecked;
                    sa.indeterminate = someChecked && !allChecked;
                });
            }

            tableContainer.querySelectorAll('.param-row').forEach(row => {
                const id = parseInt(row.dataset.id);
                if (selectedParamIds.includes(id)) {
                    row.classList.add('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                    row.classList.remove('hover:bg-primary/3');
                } else {
                    row.classList.remove('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                    row.classList.add('hover:bg-primary/3');
                }
            });

            updateToolbar();
            updateParamStatistics();
        };

        selectAllEls.forEach(sa => {
            sa.addEventListener('change', () => {
                checkboxes.forEach(cb => cb.checked = sa.checked);
                updateSelectionState();
            });
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('click', (e) => {
                handleSelectClick(cb.dataset.id, e);
            });
            cb.addEventListener('change', () => {
                // Sync duplicate checkboxes (desktop table + mobile card share same data-id)
                const id = cb.dataset.id;
                tableContainer.querySelectorAll(`.param-checkbox[data-id="${id}"]`).forEach(c => {
                    if (c !== cb) c.checked = cb.checked;
                });
                updateSelectionState();
            });
        });

        checkboxes.forEach(cb => {
            const id = parseInt(cb.dataset.id);
            cb.checked = selectedParamIds.includes(id);
        });

        if (selectAllEls.length) {
            const uniqueIds = new Set(Array.from(checkboxes).map(cb => cb.dataset.id));
            const checkedUnique = new Set(Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id));
            const allChecked = uniqueIds.size > 0 && checkedUnique.size === uniqueIds.size;
            selectAllEls.forEach(sa => {
                sa.checked = allChecked;
                sa.indeterminate = checkedUnique.size > 0 && !allChecked;
            });
        }

        tableContainer.querySelectorAll('.param-row').forEach(row => {
            const id = parseInt(row.dataset.id);
            if (selectedParamIds.includes(id)) {
                row.classList.add('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                row.classList.remove('hover:bg-primary/3');
            } else {
                row.classList.remove('bg-[#964551]/10', 'hover:bg-[#964551]/15');
                row.classList.add('hover:bg-primary/3');
            }
        });

        // Hook stats button clicks
        tableContainer.querySelectorAll('#param-stats-all-btn, #param-stats-all-btn-mobile').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                statsMode = 'all';
                updateParamStatistics();
            };
        });
        tableContainer.querySelectorAll('#param-stats-sel-btn, #param-stats-sel-btn-mobile').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                statsMode = 'selected';
                updateParamStatistics();
            };
        });

        updateParamStatistics();

        // Inline Renaming binding
        tableContainer.querySelectorAll('.param-name-cell').forEach(cell => {
            cell.onclick = (e) => {
                e.stopPropagation();

                // Only start edit if clicked on the text or the edit icon
                if (!e.target.closest('.param-name-text') && !e.target.closest('.param-edit-icon')) {
                    // Clicked on empty space of the cell -> toggle row checkbox/highlight instead!
                    const row = cell.closest('.param-row');
                    if (row) {
                        const cb = row.querySelector('.param-checkbox');
                        if (cb) {
                            cb.checked = !cb.checked;
                            cb.dispatchEvent(new Event('change'));
                        }
                    }
                    return;
                }

                if (cell.querySelector('input')) return; // already editing

                const id = parseInt(cell.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (!param) return;

                const oldName = param.name;
                const spanText = cell.querySelector('.param-name-text');
                const editIcon = cell.querySelector('.material-symbols-outlined');
                if (editIcon) editIcon.style.display = 'none';

                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'bg-surface-container-lowest border border-primary/50 text-sm px-2 py-1 rounded-xl outline-none text-on-surface font-bold w-full animate-in fade-in zoom-in-95 duration-150';
                input.value = oldName;

                spanText.innerHTML = '';
                spanText.appendChild(input);
                input.focus();
                input.select();

                const finishEdit = async (isSave) => {
                    if (input.parentNode === null) return;
                    const newName = input.value.trim();

                    // Restore layout first
                    spanText.innerHTML = escapeHtml(oldName);
                    if (editIcon) editIcon.style.display = '';

                    if (!isSave || !newName || newName === oldName) return;

                    const payload = {
                        name: newName,
                        unit: param.unit,
                        category_hint: param.category_hint,
                        description: param.description,
                        sort_order: param.sort_order
                    };

                    try {
                        await apiFetch(`/api/admin/parameters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        window.showToast?.(`Параметр переименован в «${newName}»`, 'success', 'Параметры');
                        await loadParams();
                    } catch (err) {
                        alert('Ошибка при переименовании: ' + err.message);
                    }
                };

                input.onblur = () => finishEdit(true);
                input.onkeydown = (ev) => {
                    if (ev.key === 'Enter') {
                        ev.preventDefault();
                        finishEdit(true);
                    } else if (ev.key === 'Escape') {
                        ev.preventDefault();
                        finishEdit(false);
                    }
                };
            };
        });
    };

    let selectedParamIds = [];
    const updateToolbar = () => {
        const tbContainer = document.getElementById('params-bulk-toolbar-container');
        if (!tbContainer) return;

        renderBulkToolbar(tbContainer, selectedParamIds, {
            onExportProducts: () => {
                const exportData = allParams.filter(p => selectedParamIds.includes(p.id));
                if (exportData.length === 0) return;
                exportParamsToExcel(exportData);
            },
            onUpdateUnit: () => {
                showUnitPromptModal(bulkUpdateParamsUnit);
            },
            onAddCategory: (l1, l2) => {
                bulkAddParamsCategory(l1, l2);
            },
            onRemoveCategory: (l1, l2) => {
                bulkRemoveParamsCategory(l1, l2);
            },
            onDeleteItems: async () => {
                try {
                    for (const id of selectedParamIds) {
                        await apiFetch(`/api/admin/parameters/${id}`, { method: 'DELETE' });
                    }
                    window.showToast?.(`Удалено ${selectedParamIds.length} параметров`, 'success', 'Параметры');
                    selectedParamIds = [];
                    await loadParams();
                } catch (err) {
                    alert('Ошибка при массовом удалении: ' + err.message);
                }
            },
            onClose: () => {
                selectedParamIds = [];
                renderTable();
                updateToolbar();
            }
        }, state.products);

        // Hide unwanted buttons and show unit button
        setTimeout(() => {
            const btnCategory = tbContainer.querySelector('#bulk-update-category');
            const btnPrice = tbContainer.querySelector('#bulk-update-price');
            const btnStatus = tbContainer.querySelector('#bulk-toggle-status');
            const btnUnit = tbContainer.querySelector('#bulk-update-unit');
            const btnAddCat = tbContainer.querySelector('#bulk-add-category');
            const btnRemoveCat = tbContainer.querySelector('#bulk-remove-category');
            if (btnCategory) btnCategory.style.display = 'none';
            if (btnPrice) btnPrice.style.display = 'none';
            if (btnStatus) btnStatus.style.display = 'none';
            if (btnUnit) btnUnit.style.display = 'flex';
            if (btnAddCat) btnAddCat.style.display = 'flex';
            if (btnRemoveCat) btnRemoveCat.style.display = 'flex';
        }, 10);
    };

    const bulkAddParamsCategory = () => {
        openBulkCategoryParamModal(selectedParamIds, allParams, state, true);
    };

    const bulkRemoveParamsCategory = () => {
        openBulkCategoryParamModal(selectedParamIds, allParams, state, false);
    };

    const openBulkCategoryParamModal = (selectedIds, allParams, state, isAdd) => {
        let modalWrapper = document.getElementById('param-category-modal-wrapper');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'param-category-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);

        const allL1Categories = [...new Set((state.products || []).map(p => p.parent_category).filter(Boolean))].sort();
        const allL2Categories = [...new Set((state.products || []).map(p => p.category).filter(Boolean))].sort();

        // Calculate counts
        const paramCounts = selectedIds.length;
        const categoryCounts = {};
        selectedIds.forEach(id => {
            const param = allParams.find(p => p.id === id);
            if (param) {
                const cats = (param.category_hint || '').split(',').map(s => s.trim()).filter(Boolean);
                cats.forEach(c => {
                    categoryCounts[c] = (categoryCounts[c] || 0) + 1;
                });
            }
        });

        // Initialize selection set
        const selectedCategories = new Set();
        const indeterminateCategories = new Set();

        if (isAdd) {
            // For Bulk Add, initially check categories that exist in all parameters, and set indeterminate for partials
            Object.entries(categoryCounts).forEach(([cat, count]) => {
                if (count === paramCounts) {
                    selectedCategories.add(cat);
                } else if (count > 0) {
                    indeterminateCategories.add(cat);
                }
            });
        }

        modalWrapper.innerHTML = `
            <div id="param-cat-modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div id="param-cat-modal-content" class="relative w-full max-w-md max-h-[90vh] bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                <div class="p-4 sm:p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                    <div>
                        <h3 class="font-headline-md text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface font-label-caps">
                            ${isAdd ? 'Массовое добавление категорий' : 'Массовое удаление категорий'}
                        </h3>
                        <div class="text-[10px] text-primary uppercase font-label-caps tracking-widest mt-1">
                            Выбрано параметров: ${selectedIds.length}
                        </div>
                    </div>
                    <button id="close-param-cat-modal" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div class="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0">
                    <!-- Level select -->
                    <div class="space-y-2 shrink-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Уровень категорий:
                        </label>
                        <div class="flex gap-1 bg-surface-container-lowest p-1 rounded-2xl border border-outline/10 w-full select-none">
                            <button type="button" class="param-cat-level-btn flex-1 py-2 sm:py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-center" data-level="l1">Категории L1 (Группы)</button>
                            <button type="button" class="param-cat-level-btn flex-1 py-2 sm:py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-center" data-level="l2">Категории L2 (Подкатегории)</button>
                        </div>
                        <input type="hidden" id="param-cat-level-select" />
                    </div>

                    <!-- Category selection area -->
                    <div id="param-cat-selection-area" class="space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0"></div>
                </div>

                <div class="p-4 sm:p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-container rounded-b-3xl shrink-0">
                    <button id="cancel-param-cat" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="save-param-cat" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
                        ${isAdd ? 'Добавить' : 'Удалить'}
                    </button>
                </div>
            </div>
        `;

        const close = () => {
            modalWrapper.classList.add('opacity-0');
            modalWrapper.querySelector('#param-cat-modal-content').classList.add('scale-95');
            if (window.unlockScrollGlobal) window.unlockScrollGlobal();
            setTimeout(() => modalWrapper.remove(), 300);
        };

        const selectionArea = modalWrapper.querySelector('#param-cat-selection-area');
        const levelSelect = modalWrapper.querySelector('#param-cat-level-select');

        // Automatically determine initial level:
        let initialLevel = 'l1';
        if (!isAdd) {
            const hasL2Matches = Object.keys(categoryCounts).some(cat => allL2Categories.includes(cat) && !allL1Categories.includes(cat));
            if (hasL2Matches) {
                initialLevel = 'l2';
            }
        }
        levelSelect.value = initialLevel;

        const renderCatSelection = (level) => {
            const fullList = level === 'l1' ? allL1Categories : allL2Categories;
            const list = isAdd ? fullList : fullList.filter(cat => (categoryCounts[cat] || 0) > 0);

            const searchPlaceholder = level === 'l1' ? 'Поиск категории...' : 'Поиск подкатегории...';
            const gridLabel = level === 'l1' 
                ? (isAdd ? 'Выберите из существующих категорий L1 для добавления:' : 'Выберите из существующих категорий L1 для удаления:') 
                : (isAdd ? 'Выберите из существующих подкатегорий L2 для добавления:' : 'Выберите из существующих подкатегорий L2 для удаления:');
            const customInputLabel = level === 'l1' ? 'Или введите свою категорию L1:' : 'Или введите свою подкатегорию L2:';
            const customInputPlaceholder = level === 'l1' ? 'напр. Прокат листовой' : 'напр. Арматура гладкая';

            if (!isAdd && list.length === 0) {
                selectionArea.innerHTML = `
                    <div class="flex flex-col items-center justify-center py-10 text-center text-on-surface-variant opacity-60">
                        <span class="material-symbols-outlined text-4xl mb-2 text-primary">info</span>
                        <p class="text-xs font-bold uppercase tracking-wider font-label-caps">Нет категорий</p>
                        <p class="text-[10px] opacity-70 mt-1">Выбранные параметры не привязаны ни к одной категории этого уровня</p>
                    </div>
                `;
                return;
            }

            const hasConflicts = list.some(cat => {
                const count = categoryCounts[cat] || 0;
                return count > 0 && count < paramCounts;
            });

            const warningBanner = hasConflicts ? `
                <div id="param-cat-warning" class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col sm:flex-row items-start gap-2 text-xs text-amber-400 shrink-0 select-none cursor-pointer hover:bg-amber-500/15 transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                    <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 font-bold uppercase tracking-wider text-[9px] sm:text-[10px]">
                        <span class="material-symbols-outlined text-base shrink-0">warning</span>
                        <span class="sm:hidden text-amber-400/90">Внимание (нажмите для деталей)</span>
                    </div>
                    <div id="param-cat-warning-text" class="hidden sm:block leading-normal font-medium mt-0.5 sm:mt-0">
                        ${isAdd ? 
                            'Некоторые категории привязаны только к части параметров. Отмечены как "Частично". Добавление сделает привязку полной для всех.' : 
                            'Некоторые категории привязаны только к части параметров. Отмечены как "Частично". Удаление отвяжет их у всех.'
                        }
                    </div>
                </div>
            ` : '';

            selectionArea.innerHTML = `
                ${warningBanner}
                <div class="space-y-2.5 sm:space-y-3 flex-1 flex flex-col min-h-0">
                    <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                        ${gridLabel}
                    </label>
                    <div class="relative group shrink-0">
                        <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 text-sm group-focus-within:opacity-100 transition-opacity">search</span>
                        <input type="text" id="category-search" placeholder="${searchPlaceholder}" autocomplete="off" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                    </div>
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-h-[100px] sm:min-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                        ${list.map(cat => {
                            const count = categoryCounts[cat] || 0;
                            let presenceBadge = '';
                            let isChecked = false;
                            let isIndet = false;

                            if (isAdd) {
                                if (count === paramCounts) {
                                    isChecked = true;
                                    presenceBadge = `<span class="text-[9px] px-1.5 py-0.5 rounded-lg bg-green-500/10 text-green-400 font-bold uppercase tracking-wider font-label-caps shrink-0 select-none">У всех</span>`;
                                } else if (count > 0) {
                                    isIndet = true;
                                    presenceBadge = `<span class="text-[9px] px-1.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider font-label-caps shrink-0 select-none">Частично (${count}/${paramCounts})</span>`;
                                }
                            } else {
                                if (count === paramCounts) {
                                    presenceBadge = `<span class="text-[9px] px-1.5 py-0.5 rounded-lg bg-red-500/10 text-red-400 font-bold uppercase tracking-wider font-label-caps shrink-0 select-none">У всех</span>`;
                                } else if (count > 0) {
                                    presenceBadge = `<span class="text-[9px] px-1.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider font-label-caps shrink-0 select-none">Частично (${count}/${paramCounts})</span>`;
                                }
                            }

                            return `
                                <label class="category-item flex items-center justify-between p-2.5 rounded-lg sm:p-3 sm:rounded-xl bg-surface-container-lowest border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group" data-name="${escapeHtml(cat.toLowerCase())}">
                                    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-1.5">
                                        <input type="checkbox" class="category-checkbox w-5 h-5 rounded border-outline/30 text-primary cursor-pointer peer" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''} data-indet="${isIndet}">
                                        <span class="text-xs font-bold text-on-surface-variant peer-checked:text-primary transition-colors truncate">${escapeHtml(cat)}</span>
                                    </div>
                                    ${presenceBadge}
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>

                ${isAdd ? `
                <div class="space-y-2 border-t border-outline/10 pt-3 sm:pt-4 shrink-0">
                    <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                        ${customInputLabel}
                    </label>
                    <input type="text" id="new-custom-category" placeholder="${customInputPlaceholder}" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                </div>
                ` : ''}
            `;

            // Bind checkboxes & set indeterminate state in DOM
            selectionArea.querySelectorAll('.category-checkbox').forEach(cb => {
                if (cb.dataset.indet === 'true') {
                    cb.indeterminate = true;
                }

                cb.onchange = () => {
                    const val = cb.value;
                    if (cb.checked) {
                        selectedCategories.add(val);
                        indeterminateCategories.delete(val);
                    } else {
                        selectedCategories.delete(val);
                        indeterminateCategories.delete(val);
                    }
                };
            });

            // Bind search
            const searchInput = selectionArea.querySelector('#category-search');
            if (searchInput) {
                searchInput.oninput = () => {
                    const q = searchInput.value.toLowerCase().trim();
                    selectionArea.querySelectorAll('.category-item').forEach(item => {
                        const name = item.dataset.name || '';
                        item.style.display = name.includes(q) ? 'flex' : 'none';
                    });
                };
            }

            // Bind warning toggle on mobile
            const warningEl = selectionArea.querySelector('#param-cat-warning');
            if (warningEl) {
                warningEl.onclick = () => {
                    const textEl = warningEl.querySelector('#param-cat-warning-text');
                    if (textEl) {
                        textEl.classList.toggle('hidden');
                    }
                };
            }
        };

        const updateLevelTabs = (level) => {
            modalWrapper.querySelectorAll('.param-cat-level-btn').forEach(btn => {
                if (btn.dataset.level === level) {
                    btn.classList.add('text-primary', 'bg-primary/10');
                    btn.classList.remove('text-on-surface-variant', 'hover:text-primary');
                } else {
                    btn.classList.remove('text-primary', 'bg-primary/10');
                    btn.classList.add('text-on-surface-variant', 'hover:text-primary');
                }
            });
        };

        levelSelect.onchange = () => {
            updateLevelTabs(levelSelect.value);
            renderCatSelection(levelSelect.value);
        };

        // Initialize tabs styling
        updateLevelTabs(initialLevel);

        // Bind tabs click event
        modalWrapper.querySelectorAll('.param-cat-level-btn').forEach(btn => {
            btn.onclick = () => {
                const newLevel = btn.dataset.level;
                if (levelSelect.value !== newLevel) {
                    levelSelect.value = newLevel;
                    levelSelect.dispatchEvent(new Event('change'));
                }
            };
        });

        renderCatSelection(initialLevel);

        const save = async () => {
            const customInput = modalWrapper.querySelector('#new-custom-category');
            const customVal = customInput ? customInput.value.trim() : '';
            const level = levelSelect.value;

            const executeBulkUpdate = async (resolvedCustomVal) => {
                const saveBtn = modalWrapper.querySelector('#save-param-cat');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Сохранение...';

                try {
                    const promises = selectedIds.map(async (id) => {
                        const param = allParams.find(p => p.id === id);
                        if (param) {
                            let cats = (param.category_hint || '').split(',').map(s => s.trim()).filter(Boolean);
                            
                            if (isAdd) {
                                // Add all checked categories
                                selectedCategories.forEach(cat => {
                                    if (!cats.includes(cat)) cats.push(cat);
                                });
                                // Add custom category
                                if (resolvedCustomVal && !cats.includes(resolvedCustomVal)) {
                                    cats.push(resolvedCustomVal);
                                }
                            } else {
                                // Remove all checked categories
                                selectedCategories.forEach(cat => {
                                    cats = cats.filter(c => c !== cat);
                                });
                            }

                            const payload = {
                                name: param.name,
                                unit: param.unit,
                                category_hint: cats.join(', '),
                                description: param.description,
                                sort_order: param.sort_order
                            };
                            return apiFetch(`/api/admin/parameters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                        }
                    });

                    await Promise.all(promises);
                    window.showToast?.(
                        isAdd ? `Категории добавлены для ${selectedIds.length} параметров` : `Категории удалены для ${selectedIds.length} параметров`,
                        'success',
                        'Параметры'
                    );
                    close();
                    selectedParamIds = [];
                    await loadParams();
                } catch (err) {
                    alert('Ошибка массового обновления: ' + err.message);
                    saveBtn.disabled = false;
                    saveBtn.textContent = isAdd ? 'Добавить' : 'Удалить';
                }
            };

            if (isAdd && customVal) {
                const list = level === 'l1' ? allL1Categories : allL2Categories;
                const exists = list.includes(customVal);
                if (!exists) {
                    if (level === 'l1') {
                        try {
                            const placeholder = {
                                id: 'cat_l1_' + Date.now(),
                                name: '📁 ' + customVal,
                                parent_category: customVal,
                                category: '',
                                price_ton: 0,
                                vstatus: 'active',
                                description: 'Системная категория L1'
                            };
                            await state.createProduct(placeholder);
                        } catch (e) {
                            console.error('Failed to create L1 placeholder:', e);
                        }
                        await executeBulkUpdate(customVal);
                    } else {
                        // L2
                        promptForCategoryParent(customVal, state, async (parentL1) => {
                            // Ensure parent exists
                            if (!allL1Categories.includes(parentL1)) {
                                try {
                                    const l1Placeholder = {
                                        id: 'cat_l1_' + Date.now(),
                                        name: '📁 ' + parentL1,
                                        parent_category: parentL1,
                                        category: '',
                                        price_ton: 0,
                                        vstatus: 'active',
                                        description: 'Системная категория L1'
                                    };
                                    await state.createProduct(l1Placeholder);
                                } catch (e) {
                                    console.error('Failed to create L1 placeholder:', e);
                                }
                            }
                            // Create L2
                            try {
                                const placeholder = {
                                    id: 'cat_l2_' + Date.now(),
                                    name: '📁 ' + customVal,
                                    parent_category: parentL1,
                                    category: customVal,
                                    price_ton: 0,
                                    vstatus: 'active',
                                    description: 'Системная подкатегория L2'
                                };
                                await state.createProduct(placeholder);
                            } catch (e) {
                                console.error('Failed to create L2 placeholder:', e);
                            }
                            await executeBulkUpdate(customVal);
                        });
                    }
                } else {
                    await executeBulkUpdate(customVal);
                }
            } else {
                await executeBulkUpdate(null);
            }
        };

        modalWrapper.querySelector('#param-cat-modal-backdrop').onclick = close;
        modalWrapper.querySelector('#close-param-cat-modal').onclick = close;
        modalWrapper.querySelector('#cancel-param-cat').onclick = close;
        modalWrapper.querySelector('#save-param-cat').onclick = save;

        if (window.lockScrollGlobal) window.lockScrollGlobal();

        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('#param-cat-modal-content').classList.remove('scale-95');
        });
    };

    const exportParamsToExcel = (data) => {
        // Мультиформатный экспорт (XML / CSV / Excel / PDF) с фирменной айдентикой
        showExportFormatModal(data, 'parameters', {});
    };
    const _legacyExportParamsCSV = (data) => {
        const headers = "ID (id);Название (name);Ед. изм. (unit);Тип (type);Обязательно (required);Список (options);Категории (category_hint);Описание (description)\n";
        let csv = headers;
        
        data.forEach(p => {
            const row = [
                p.id || '',
                p.name || '',
                p.unit || '',
                p.type || 'string',
                p.required ? 'Да' : 'Нет',
                p.options || '',
                p.category_hint || '',
                p.description || ''
            ].map(val => String(val).replace(/;/g, ',').replace(/\n/g, ' '));
            csv += row.join(';') + '\n';
        });

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Параметры_экспорт_${new Date().toLocaleDateString('ru-RU')}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    // ─── Modal: add / edit ────────────────────────────────────────────────────
    const openParamModal = (param) => {
        const isEdit = !!param;

        let modalWrapper = document.getElementById('param-modal-wrapper');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'param-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);

        modalWrapper.innerHTML = `
            <div id="param-modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
            <div id="param-modal-content" class="relative w-full max-w-lg bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                    <div>
                        <h3 class="font-headline-md text-lg font-bold uppercase tracking-tight text-on-surface">
                            ${isEdit ? 'Редактирование параметра' : 'Новый параметр'}
                        </h3>
                        <div class="text-[10px] text-primary uppercase font-label-caps tracking-widest mt-1">
                            ${isEdit ? escapeHtml(param.name) : 'ДОБАВЛЕНИЕ В СПРАВОЧНИК'}
                        </div>
                    </div>
                    <button id="close-param-modal" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    <!-- Name -->
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Название параметра <span class="text-red-400">*</span>
                        </label>
                        <input type="text" id="param-name-input" value="${isEdit ? escapeHtml(param.name) : ''}" placeholder="напр. Диаметр, Марка стали, Толщина" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm font-bold text-on-surface">
                    </div>
                    <!-- Unit -->
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Единица измерения</label>
                        <input type="text" id="param-unit-input" value="${isEdit ? escapeHtml(param.unit || '') : ''}" placeholder="напр. мм, кг, шт (оставьте пустым если нет)" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                        <div class="flex flex-wrap gap-1.5 mt-1.5" id="param-modal-units-list">
                            ${['мм', 'см', 'м', 'кг', 'т', 'шт', 'м²', 'пог. м', 'Без ед. изм.'].map(u => {
                                const isCurrent = (isEdit && (param.unit || 'Без ед. изм.') === u) || (!isEdit && u === 'Без ед. изм.');
                                return `
                                    <button type="button" class="modal-unit-opt-btn px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-wider font-label-caps ${isCurrent ? 'border-primary bg-primary/10 text-primary' : 'border-outline/10 hover:border-primary/50 hover:bg-primary/5 text-on-surface-variant'}" data-value="${u === 'Без ед. изм.' ? '' : u}">
                                        ${u}
                                    </button>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    <!-- Category hint -->
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Применяется в категориях
                        </label>
                        <input type="text" id="param-category-input" value="${isEdit ? escapeHtml(param.category_hint || '') : ''}" placeholder="напр. Арматура, Труба (через запятую)" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                        <p class="text-[10px] text-on-surface-variant opacity-50">Используется для фильтрации подсказок при добавлении товара</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Type -->
                        <div class="space-y-2">
                            <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Тип данных</label>
                            <select id="param-type-input" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface appearance-none">
                                <option value="string" ${isEdit && param.type === 'string' ? 'selected' : ''}>Строка текста</option>
                                <option value="number" ${isEdit && param.type === 'number' ? 'selected' : ''}>Число</option>
                                <option value="boolean" ${isEdit && param.type === 'boolean' ? 'selected' : ''}>Логическое (Да/Нет)</option>
                                <option value="select" ${isEdit && param.type === 'select' ? 'selected' : ''}>Список значений</option>
                            </select>
                        </div>
                        
                        <!-- Required -->
                        <div class="space-y-2 flex flex-col justify-center pt-6">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" id="param-required-input" class="peer sr-only" ${isEdit && param.required ? 'checked' : ''}>
                                    <div class="w-10 h-6 bg-surface-variant rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary transition-colors duration-300"></div>
                                    <div class="absolute left-1 top-1 w-4 h-4 bg-surface rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
                                </div>
                                <span class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Обязательный</span>
                            </label>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 bg-[#1a1816]/40 p-4 rounded-2xl border border-outline/5">
                        <!-- Is Search Filter -->
                        <div class="space-y-2 flex flex-col justify-center">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" id="param-search-filter-input" class="peer sr-only" ${!isEdit || param.is_search_filter !== false ? 'checked' : ''}>
                                    <div class="w-10 h-6 bg-surface-variant rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary transition-colors duration-300"></div>
                                    <div class="absolute left-1 top-1 w-4 h-4 bg-surface rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
                                </div>
                                <span class="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Поиск (фильтр)</span>
                            </label>
                        </div>
                        
                        <!-- Is Characteristic -->
                        <div class="space-y-2 flex flex-col justify-center">
                            <label class="flex items-center gap-3 cursor-pointer group">
                                <div class="relative flex items-center justify-center">
                                    <input type="checkbox" id="param-characteristic-input" class="peer sr-only" ${!isEdit || param.is_characteristic !== false ? 'checked' : ''}>
                                    <div class="w-10 h-6 bg-surface-variant rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 peer-checked:bg-primary transition-colors duration-300"></div>
                                    <div class="absolute left-1 top-1 w-4 h-4 bg-surface rounded-full transition-transform duration-300 peer-checked:translate-x-4 shadow-sm"></div>
                                </div>
                                <span class="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Характеристика</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Options (only for select type) -->
                    <div class="space-y-2 ${isEdit && param.type === 'select' ? '' : 'hidden'}" id="param-options-container">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Значения для списка</label>
                        <input type="text" id="param-options-input" value="${isEdit ? escapeHtml(param.options || '') : ''}" placeholder="напр. Красный, Синий, Зеленый (через запятую)" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                        <p class="text-[10px] text-on-surface-variant opacity-50">Перечислите доступные варианты через запятую</p>
                    </div>

                    <!-- Description -->
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Описание / Пояснение</label>
                        <textarea id="param-desc-input" rows="3" placeholder="Дополнительная информация о параметре..." class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all resize-none text-sm text-on-surface">${isEdit ? escapeHtml(param.description || '') : ''}</textarea>
                    </div>
                    <!-- Sort order -->
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Порядок сортировки</label>
                        <input type="number" id="param-sort-input" value="${isEdit ? (param.sort_order || 0) : 0}" min="0" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                </div>
                <div class="p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-container-low shrink-0 rounded-b-3xl">
                    <button type="button" id="cancel-param" class="px-6 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Отмена</button>
                    <button type="button" id="save-param" class="px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10">
                        ${isEdit ? 'Сохранить' : 'Создать'}
                    </button>
                </div>
            </div>
        `;

        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('#param-modal-content').classList.remove('scale-95');
        });

        const close = () => {
            modalWrapper.classList.add('opacity-0');
            const content = modalWrapper.querySelector('#param-modal-content');
            if (content) content.classList.add('scale-95');
            setTimeout(() => modalWrapper.remove(), 300);
        };

        const unitInput = modalWrapper.querySelector('#param-unit-input');
        const unitOpts = modalWrapper.querySelectorAll('.modal-unit-opt-btn');
        unitOpts.forEach(btn => {
            btn.onclick = () => {
                unitOpts.forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
                    b.classList.add('border-outline/10', 'text-on-surface-variant');
                });
                btn.classList.add('border-primary', 'bg-primary/10', 'text-primary');
                btn.classList.remove('border-outline/10', 'text-on-surface-variant');
                unitInput.value = btn.dataset.value;
            };
        });

        unitInput.oninput = () => {
            const val = unitInput.value.trim();
            unitOpts.forEach(b => {
                const bVal = b.dataset.value;
                if ((val === '' && bVal === '') || (val !== '' && bVal === val)) {
                    b.classList.add('border-primary', 'bg-primary/10', 'text-primary');
                    b.classList.remove('border-outline/10', 'text-on-surface-variant');
                } else {
                    b.classList.remove('border-primary', 'bg-primary/10', 'text-primary');
                    b.classList.add('border-outline/10', 'text-on-surface-variant');
                }
            });
        };

        modalWrapper.querySelector('#close-param-modal').onclick = close;
        modalWrapper.querySelector('#param-modal-backdrop').onclick = close;
        modalWrapper.querySelector('#cancel-param').onclick = close;

        const saveBtn = modalWrapper.querySelector('#save-param');
        saveBtn.onclick = async () => {
            const name = modalWrapper.querySelector('#param-name-input').value.trim();
            if (!name) {
                alert('Название параметра не может быть пустым');
                return;
            }

            const payload = {
                name,
                unit: modalWrapper.querySelector('#param-unit-input').value.trim(),
                category_hint: modalWrapper.querySelector('#param-category-input').value.trim(),
                description: modalWrapper.querySelector('#param-desc-input').value.trim(),
                sort_order: parseInt(modalWrapper.querySelector('#param-sort-input').value) || 0,
                is_search_filter: modalWrapper.querySelector('#param-search-filter-input').checked,
                is_characteristic: modalWrapper.querySelector('#param-characteristic-input').checked
            };

            saveBtn.disabled = true;
            saveBtn.textContent = 'Сохранение...';

            try {
                if (isEdit) {
                    await apiFetch(`/api/admin/parameters/${param.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    window.showToast?.(`Параметр «${name}» обновлён`, 'success', 'Параметры');
                } else {
                    await apiFetch('/api/admin/parameters', { method: 'POST', body: JSON.stringify(payload) });
                    window.showToast?.(`Параметр «${name}» создан`, 'success', 'Параметры');
                }
                close();
                await loadParams();
            } catch (err) {
                alert('Ошибка: ' + err.message);
                saveBtn.disabled = false;
                saveBtn.textContent = isEdit ? 'Сохранить' : 'Создать';
            }
        };

        // Focus name input
        setTimeout(() => modalWrapper.querySelector('#param-name-input')?.focus(), 350);
    };

    function promptForCategoryParent(customVal, state, onConfirm) {
        let modalWrapper = document.getElementById('category-parent-prompt-modal');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'category-parent-prompt-modal';
        modalWrapper.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
        modalWrapper.style.pointerEvents = 'auto';

        const allL1Categories = [...new Set((state.products || []).map(p => p.parent_category).filter(Boolean))].sort();

        modalWrapper.innerHTML = `
            <div id="cat-parent-prompt-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
            <div id="cat-parent-prompt-container" class="relative w-full max-w-md bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-on-surface">
                <div class="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                    <h3 class="text-xs uppercase tracking-widest text-primary font-bold font-label-caps flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">category</span>
                        Укажите родительскую категорию
                    </h3>
                    <button id="cat-parent-prompt-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <p class="text-xs text-on-surface-variant opacity-80 leading-relaxed">
                        Вы вводите новую подкатегорию L2 <strong class="text-primary">«${escapeHtml(customVal)}»</strong>. Пожалуйста, укажите для неё родительскую категорию L1:
                    </p>
                    
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase opacity-65 font-label-caps tracking-widest">Родительская категория (L1)</label>
                        <div class="relative">
                            <select id="cat-parent-select" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 pr-10 focus:border-primary outline-none transition-all text-sm font-bold text-on-surface appearance-none cursor-pointer">
                                <option value="">Выберите категорию L1...</option>
                                ${allL1Categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('')}
                            </select>
                            <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base">expand_more</span>
                        </div>
                    </div>

                    <div class="space-y-2 pt-1">
                        <label class="text-[10px] uppercase opacity-65 font-label-caps tracking-widest">Или введите новую категорию L1:</label>
                        <input type="text" id="cat-parent-custom" placeholder="напр. Фасонный прокат" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button id="cat-parent-prompt-cancel" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                            Отмена
                        </button>
                        <button id="cat-parent-prompt-confirm" class="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
                            Подтвердить
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalWrapper);
        if (window.lockScrollGlobal) window.lockScrollGlobal();

        const container = modalWrapper.querySelector('#cat-parent-prompt-container');
        const select = modalWrapper.querySelector('#cat-parent-select');
        const customInput = modalWrapper.querySelector('#cat-parent-custom');

        const close = () => {
            modalWrapper.classList.add('opacity-0');
            container.classList.add('scale-95');
            if (window.unlockScrollGlobal) window.unlockScrollGlobal();
            setTimeout(() => modalWrapper.remove(), 300);
        };

        const confirm = () => {
            const selectVal = select.value;
            const customParentVal = customInput.value.trim();
            const parentL1 = customParentVal || selectVal;
            if (!parentL1) {
                alert('Необходимо выбрать или ввести родительскую категорию L1');
                return;
            }
            onConfirm(parentL1);
            close();
        };

        modalWrapper.querySelector('#cat-parent-prompt-backdrop').onclick = close;
        modalWrapper.querySelector('#cat-parent-prompt-close').onclick = close;
        modalWrapper.querySelector('#cat-parent-prompt-cancel').onclick = close;
        modalWrapper.querySelector('#cat-parent-prompt-confirm').onclick = confirm;

        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            container.classList.remove('scale-95');
        });
    }

    const openCategoryParamModal = (param) => {
        let modalWrapper = document.getElementById('param-category-modal-wrapper');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'param-category-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);

        const allL1Categories = [...new Set((state.products || []).map(p => p.parent_category).filter(Boolean))].sort();
        const allL2Categories = [...new Set((state.products || []).map(p => p.category).filter(Boolean))].sort();
        const allL3Categories = [...new Set((state.products || []).map(p => (p.l3 || '').toString().trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
        const activeCategories = (param.category_hint || '').split(',').map(s => s.trim()).filter(Boolean);
        const selectedCategories = new Set(activeCategories);

        modalWrapper.innerHTML = `
            <div id="param-cat-modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div id="param-cat-modal-content" class="relative w-full max-w-md max-h-[90vh] bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                <div class="p-4 sm:p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                    <div>
                        <h3 class="font-headline-md text-base sm:text-lg font-bold uppercase tracking-tight text-on-surface">
                            Категории параметра
                        </h3>
                        <div class="text-[10px] text-primary uppercase font-label-caps tracking-widest mt-1">
                            ${escapeHtml(param.name)}
                        </div>
                    </div>
                    <button id="close-param-cat-modal" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div class="p-4 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0">
                    <!-- Level select -->
                    <div class="space-y-2 shrink-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Уровень категорий:
                        </label>
                        <div class="flex gap-1 bg-surface-container-lowest p-1 rounded-2xl border border-outline/10 w-full select-none">
                            <button type="button" class="param-cat-level-btn flex-1 py-2 sm:py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-center" data-level="l1">Категории L1 (Группы)</button>
                            <button type="button" class="param-cat-level-btn flex-1 py-2 sm:py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-center" data-level="l2">Категории L2 (Подкатегории)</button>
                        </div>
                        <input type="hidden" id="param-cat-level-select" />
                    </div>

                    <!-- Category selection area -->
                    <div id="param-cat-selection-area" class="space-y-3 sm:space-y-4 flex-1 flex flex-col min-h-0"></div>
                </div>

                <div class="p-4 sm:p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-container rounded-b-3xl shrink-0">
                    <button id="cancel-param-cat" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="save-param-cat" class="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
                        Сохранить
                    </button>
                </div>
            </div>
        `;

        const close = () => {
            modalWrapper.classList.add('opacity-0');
            modalWrapper.querySelector('#param-cat-modal-content').classList.add('scale-95');
            if (window.unlockScrollGlobal) window.unlockScrollGlobal();
            setTimeout(() => modalWrapper.remove(), 300);
        };

        const selectionArea = modalWrapper.querySelector('#param-cat-selection-area');
        const levelSelect = modalWrapper.querySelector('#param-cat-level-select');

        // Automatically determine initial level:
        // if some active categories match L2 but not L1, default to L2. Otherwise default to L1.
        let initialLevel = 'l1';
        const hasL2Matches = activeCategories.some(cat => allL2Categories.includes(cat) && !allL1Categories.includes(cat));
        if (hasL2Matches) {
            initialLevel = 'l2';
        }
        levelSelect.value = initialLevel;

        const renderCatSelection = (level) => {
            if (level === 'l1') {
                selectionArea.innerHTML = `
                    <div class="space-y-2.5 sm:space-y-3 flex-1 flex flex-col min-h-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Выберите из существующих категорий L1:
                        </label>
                        <div class="relative group shrink-0">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 text-sm group-focus-within:opacity-100 transition-opacity">search</span>
                            <input type="text" id="category-search" placeholder="Поиск категории..." autocomplete="off" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                        </div>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-h-[100px] sm:min-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            ${allL1Categories.map(cat => {
                                const isChecked = selectedCategories.has(cat);
                                return `
                                    <label class="category-item flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-lg sm:p-3 sm:rounded-xl bg-surface-container-lowest border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group" data-name="${escapeHtml(cat.toLowerCase())}">
                                        <input type="checkbox" class="category-checkbox w-5 h-5 rounded border-outline/30 text-primary cursor-pointer peer" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''}>
                                        <span class="text-xs font-bold text-on-surface-variant peer-checked:text-primary transition-colors">${escapeHtml(cat)}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="space-y-2 border-t border-outline/10 pt-3 sm:pt-4 shrink-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Или введите свою категорию L1:
                        </label>
                        <input type="text" id="new-custom-category" placeholder="напр. Прокат листовой" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                `;
            } else {
                selectionArea.innerHTML = `
                    <div class="space-y-2.5 sm:space-y-3 flex-1 flex flex-col min-h-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Выберите из существующих подкатегорий L2:
                        </label>
                        <div class="relative group shrink-0">
                            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 text-sm group-focus-within:opacity-100 transition-opacity">search</span>
                            <input type="text" id="category-search" placeholder="Поиск подкатегории..." autocomplete="off" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl pl-10 pr-4 py-2 sm:py-2.5 text-xs focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                        </div>
                        <div class="grid grid-cols-2 gap-2 sm:gap-3 flex-1 min-h-[100px] sm:min-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            ${allL2Categories.map(cat => {
                                const isChecked = selectedCategories.has(cat);
                                return `
                                    <label class="category-item flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-lg sm:p-3 sm:rounded-xl bg-surface-container-lowest border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group" data-name="${escapeHtml(cat.toLowerCase())}">
                                        <input type="checkbox" class="category-checkbox w-5 h-5 rounded border-outline/30 text-primary cursor-pointer peer" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''}>
                                        <span class="text-xs font-bold text-on-surface-variant peer-checked:text-primary transition-colors">${escapeHtml(cat)}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="space-y-2 border-t border-outline/10 pt-3 sm:pt-4 shrink-0">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Или введите свою подкатегорию L2:
                        </label>
                        <input type="text" id="new-custom-category" placeholder="напр. Арматура гладкая" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                `;
            }

            // Bind search input logic
            const searchInput = selectionArea.querySelector('#category-search');
            if (searchInput) {
                searchInput.oninput = () => {
                    const q = searchInput.value.toLowerCase().trim();
                    selectionArea.querySelectorAll('.category-item').forEach(item => {
                        const name = item.dataset.name || '';
                        if (name.includes(q)) {
                            item.style.display = 'flex';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                };
            }

            // Bind checkbox changes
            selectionArea.querySelectorAll('.category-checkbox').forEach(cb => {
                cb.onchange = () => {
                    if (cb.checked) {
                        selectedCategories.add(cb.value);
                    } else {
                        selectedCategories.delete(cb.value);
                    }
                };
            });
        };

        const updateLevelTabs = (level) => {
            modalWrapper.querySelectorAll('.param-cat-level-btn').forEach(btn => {
                if (btn.dataset.level === level) {
                    btn.classList.add('text-primary', 'bg-primary/10');
                    btn.classList.remove('text-on-surface-variant', 'hover:text-primary');
                } else {
                    btn.classList.remove('text-primary', 'bg-primary/10');
                    btn.classList.add('text-on-surface-variant', 'hover:text-primary');
                }
            });
        };

        levelSelect.onchange = () => {
            updateLevelTabs(levelSelect.value);
            renderCatSelection(levelSelect.value);
        };

        // Initialize tabs styling
        updateLevelTabs(initialLevel);

        // Bind tabs click event
        modalWrapper.querySelectorAll('.param-cat-level-btn').forEach(btn => {
            btn.onclick = () => {
                const newLevel = btn.dataset.level;
                if (levelSelect.value !== newLevel) {
                    levelSelect.value = newLevel;
                    levelSelect.dispatchEvent(new Event('change'));
                }
            };
        });

        // Render initial level
        renderCatSelection(initialLevel);

        const save = async () => {
            const customInput = modalWrapper.querySelector('#new-custom-category');
            const customVal = customInput ? customInput.value.trim() : '';
            const level = levelSelect.value;

            const proceedSave = async (resolvedCustomVal) => {
                if (resolvedCustomVal && !selectedCategories.has(resolvedCustomVal)) {
                    selectedCategories.add(resolvedCustomVal);
                }

                const category_hint = Array.from(selectedCategories).join(', ');

                const payload = {
                    name: param.name,
                    unit: param.unit,
                    category_hint,
                    description: param.description,
                    sort_order: param.sort_order
                };

                const saveBtn = modalWrapper.querySelector('#save-param-cat');
                saveBtn.disabled = true;
                saveBtn.textContent = 'Сохранение...';

                try {
                    await apiFetch(`/api/admin/parameters/${param.id}`, { method: 'PUT', body: JSON.stringify(payload) });
                    window.showToast?.(`Категории для «${param.name}» обновлены`, 'success', 'Параметры');
                    close();
                    await loadParams();
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                    saveBtn.disabled = false;
                    saveBtn.textContent = 'Сохранить';
                }
            };

            if (customVal) {
                const list = level === 'l1' ? allL1Categories : allL2Categories;
                const exists = list.includes(customVal);
                if (!exists) {
                    if (level === 'l1') {
                        try {
                            const placeholder = {
                                id: 'cat_l1_' + Date.now(),
                                name: '📁 ' + customVal,
                                parent_category: customVal,
                                category: '',
                                price_ton: 0,
                                vstatus: 'active',
                                description: 'Системная категория L1'
                            };
                            await state.createProduct(placeholder);
                        } catch (e) {
                            console.error('Failed to create L1 placeholder:', e);
                        }
                        await proceedSave(customVal);
                    } else {
                        // L2
                        promptForCategoryParent(customVal, state, async (parentL1) => {
                            // Ensure parent L1 exists
                            if (!allL1Categories.includes(parentL1)) {
                                try {
                                    const l1Placeholder = {
                                        id: 'cat_l1_' + Date.now(),
                                        name: '📁 ' + parentL1,
                                        parent_category: parentL1,
                                        category: '',
                                        price_ton: 0,
                                        vstatus: 'active',
                                        description: 'Системная категория L1'
                                    };
                                    await state.createProduct(l1Placeholder);
                                } catch (e) {
                                    console.error('Failed to create L1 placeholder:', e);
                                }
                            }
                            // Create L2
                            try {
                                const placeholder = {
                                    id: 'cat_l2_' + Date.now(),
                                    name: '📁 ' + customVal,
                                    parent_category: parentL1,
                                    category: customVal,
                                    price_ton: 0,
                                    vstatus: 'active',
                                    description: 'Системная подкатегория L2'
                                };
                                await state.createProduct(placeholder);
                            } catch (e) {
                                console.error('Failed to create L2 placeholder:', e);
                            }
                            await proceedSave(customVal);
                        });
                    }
                } else {
                    await proceedSave(customVal);
                }
            } else {
                await proceedSave(null);
            }
        };

        modalWrapper.querySelector('#param-cat-modal-backdrop').onclick = close;
        modalWrapper.querySelector('#close-param-cat-modal').onclick = close;
        modalWrapper.querySelector('#cancel-param-cat').onclick = close;
        modalWrapper.querySelector('#save-param-cat').onclick = save;

        if (window.lockScrollGlobal) window.lockScrollGlobal();

        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('#param-cat-modal-content').classList.remove('scale-95');
        });
    };

    function showUnitPromptModal(onConfirm) {
        let modalWrapper = document.getElementById('bulk-unit-modal');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'bulk-unit-modal';
        modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
        modalWrapper.style.pointerEvents = 'auto';

        const units = ['мм', 'см', 'м', 'кг', 'т', 'шт', 'м²', 'пог. м', 'Без ед. изм.'];

        modalWrapper.innerHTML = `
            <div id="bulk-unit-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
            <div id="bulk-unit-container" class="relative w-full max-w-md bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-on-surface">
                <div class="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                    <h3 class="text-sm uppercase tracking-widest text-primary font-bold font-label-caps flex items-center gap-2">
                        <span class="material-symbols-outlined text-base">straighten</span>
                        Массовое изменение ед. изм.
                    </h3>
                    <button id="bulk-unit-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                        <span class="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <p class="text-xs text-on-surface-variant opacity-75">
                        Выберите единицу измерения для всех выбранных параметров или введите своё значение:
                    </p>
                    
                    <div class="grid grid-cols-3 gap-2">
                        ${units.map(u => `
                            <button type="button" class="unit-opt-btn px-3 py-2 rounded-xl border border-outline/10 hover:border-primary/50 hover:bg-primary/5 text-xs font-bold text-center transition-all uppercase tracking-wider font-label-caps text-on-surface-variant" data-value="${u === 'Без ед. изм.' ? '' : u}">
                                ${u}
                            </button>
                        `).join('')}
                    </div>

                    <div class="space-y-2 pt-2">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">Или введите своё значение:</label>
                        <input type="text" id="custom-unit-input" placeholder="напр. литр, куб. м" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button id="bulk-unit-cancel-btn" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                            Отмена
                        </button>
                        <button id="bulk-unit-confirm-btn" class="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
                            Применить
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalWrapper);
        
        if (window.lockScrollGlobal) window.lockScrollGlobal();
        
        const container = modalWrapper.querySelector('#bulk-unit-container');
        const input = modalWrapper.querySelector('#custom-unit-input');
        
        const close = () => {
            modalWrapper.classList.add('opacity-0');
            container.classList.add('scale-95');
            if (window.unlockScrollGlobal) window.unlockScrollGlobal();
            setTimeout(() => modalWrapper.remove(), 300);
        };

        let selectedUnitValue = null;

        modalWrapper.querySelectorAll('.unit-opt-btn').forEach(btn => {
            btn.onclick = () => {
                modalWrapper.querySelectorAll('.unit-opt-btn').forEach(b => b.classList.remove('border-primary', 'bg-primary/10', 'text-primary'));
                btn.classList.add('border-primary', 'bg-primary/10', 'text-primary');
                selectedUnitValue = btn.dataset.value;
                input.value = '';
            };
        });

        input.oninput = () => {
            modalWrapper.querySelectorAll('.unit-opt-btn').forEach(b => b.classList.remove('border-primary', 'bg-primary/10', 'text-primary'));
            selectedUnitValue = null;
        };

        const confirm = () => {
            let finalValue = selectedUnitValue;
            if (finalValue === null) {
                finalValue = input.value.trim();
            }
            onConfirm(finalValue);
            close();
        };

        modalWrapper.querySelector('#bulk-unit-backdrop').onclick = close;
        modalWrapper.querySelector('#bulk-unit-close').onclick = close;
        modalWrapper.querySelector('#bulk-unit-cancel-btn').onclick = close;
        modalWrapper.querySelector('#bulk-unit-confirm-btn').onclick = confirm;

        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            container.classList.remove('scale-95');
        });
    }

    const bulkUpdateParamsUnit = async (newUnit) => {
        if (selectedParamIds.length === 0) return;
        
        try {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[400px] gap-6 opacity-40">
                    <div class="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div class="font-label-caps text-[10px] uppercase tracking-[0.3em]">Массовое обновление параметров...</div>
                </div>
            `;
            
            const promises = selectedParamIds.map(async (id) => {
                const param = allParams.find(p => p.id === id);
                if (param) {
                    const payload = {
                        name: param.name,
                        unit: newUnit,
                        category_hint: param.category_hint,
                        description: param.description,
                        sort_order: param.sort_order
                    };
                    return apiFetch(`/api/admin/parameters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
                }
            });
            
            await Promise.all(promises);
            window.showToast?.(`Обновлено параметров: ${selectedParamIds.length}`, 'success', 'Параметры');
            selectedParamIds = [];
            await loadParams();
        } catch (err) {
            alert('Ошибка при массовом обновлении: ' + err.message);
            await loadParams();
        }
    };

    addBtn.onclick = () => openParamModal(null);

    if (exportBtn) {
        exportBtn.onclick = () => {
            let toExport = filteredParams && filteredParams.length > 0 ? filteredParams : allParams;
            if (selectedParamIds && selectedParamIds.length > 0) {
                toExport = allParams.filter(p => selectedParamIds.includes(p.id));
            }
            
            if (toExport.length === 0) {
                alert('Нет данных для экспорта');
                return;
            }

            // Открываем модалку выбора формата (XML / CSV / Excel / PDF)
            exportParamsToExcel(toExport);
        };
    }

    // Bind tab switching click handler for Parameters view
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

    // Mobile arrow navigation for Parameters view
    const tabOrder = ['products', 'l1', 'l2', 'l3', 'parameters'];
    const paramsPrevBtn = document.getElementById('params-tab-prev-btn');
    const paramsNextBtn = document.getElementById('params-tab-next-btn');
    const navigateToTab = (tab) => {
        if (tab === 'products') window.location.hash = 'products_nomenclature';
        else if (tab === 'parameters') window.location.hash = 'products_parameters';
        else window.location.hash = 'products_' + tab;
    };
    if (paramsPrevBtn) {
        paramsPrevBtn.onclick = () => {
            const idx = tabOrder.indexOf('parameters');
            navigateToTab(tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length]);
        };
    }
    if (paramsNextBtn) {
        paramsNextBtn.onclick = () => {
            const idx = tabOrder.indexOf('parameters');
            navigateToTab(tabOrder[(idx + 1) % tabOrder.length]);
        };
    }

    // ─── Initial load ─────────────────────────────────────────────────────────
    if (!state.products || state.products.length === 0) {
        try {
            await state.fetchProducts();
        } catch (err) {
            console.error('Failed to load products for categories:', err);
        }
    }
    await loadParams();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Fetch all parameters for use in other components (e.g. drawer)
 * Returns cached result if already loaded
 */
let _cachedParams = null;
let _cacheTs = 0;
export async function fetchAllParameters() {
    const now = Date.now();
    if (_cachedParams && now - _cacheTs < 60000) return _cachedParams; // 1 min cache

    try {
        const token = localStorage.getItem('metal_token');
        const res = await fetch(`/api/admin/parameters?t=${Date.now()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return [];
        _cachedParams = await res.json();
        _cacheTs = now;
        return _cachedParams;
    } catch {
        return _cachedParams || [];
    }
}

/** Invalidate cache (call after creating/updating a parameter) */
export function invalidateParametersCache() {
    _cachedParams = null;
    _cacheTs = 0;
}
