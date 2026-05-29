/**
 * Parameters Management Component
 * Manages the catalogue of product parameter names (справочник параметров)
 */

import { renderBulkToolbar, showConfirmPromptModal } from './bulk-toolbar.js';

export async function renderParametersView(container, state) {
    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Управление каталогом</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Полноценная CRM для редактирования базы данных</p>
                </div>
                <div class="flex gap-2">
                    <button id="refresh-params-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                    <button id="import-params-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-[#151311] border border-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                        <span class="material-symbols-outlined text-base">upload_file</span>
                        Из эксель
                    </button>
                    <button id="export-params-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-[#151311] border border-white/10 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
                        <span class="material-symbols-outlined text-base">download</span>
                        В эксель
                    </button>
                    <button id="add-param-btn" class="flex items-center justify-center gap-2 px-6 py-4 bg-[#ffb0cc] text-[#0f0e0c] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-white transition-all shadow-xl shadow-[#ffb0cc]/10">
                        <span class="material-symbols-outlined text-base">add</span>
                        Добавить параметр
                    </button>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-1 bg-[#151311] p-1 rounded-2xl border border-white/5 w-fit">
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="products">Товары</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="l1">Категории L1</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="l2">Категории L2</button>
                <button class="product-tab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#ffb0cc] bg-white/5" data-tab="parameters">Параметры</button>
            </div>

            <!-- Bulk Toolbar Container -->
            <div id="params-bulk-toolbar-container"></div>

            <!-- Search -->
            <div class="liquid-glass p-6 rounded-[2.5rem] border-outline/5 shadow-2xl">
                <div class="relative group">
                    <span class="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-50 text-xl group-focus-within:opacity-100 transition-opacity">search</span>
                    <input type="text" id="params-search" placeholder="Поиск по названию параметра или описанию..." autocomplete="off" class="w-full bg-surface-container-low/30 border border-outline/10 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:border-primary outline-none transition-all text-on-surface placeholder:text-on-surface-variant/30">
                </div>
            </div>

            <!-- Stats -->
            <div id="params-stats" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>

            <!-- Table container -->
            <div class="liquid-glass rounded-[2.5rem] overflow-hidden min-h-[400px] border-outline/5 shadow-2xl relative" id="params-table-container">
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
        const res = await fetch(url, {
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
                <div class="w-8 h-8 border-2 border-[#ca7093]/20 border-t-[#ca7093] rounded-full animate-spin"></div>
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
                            <div class="text-[10px] text-[#ca7093] uppercase font-['Space Grotesk'] tracking-widest mt-1 font-bold">ПОДДЕРЖИВАЕТСЯ ФОРМАТ CSV</div>
                        </div>
                        <button id="import-params-close" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-[#d7c1c7] transition-colors">
                            <span class="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                    
                    <div class="bg-[#1a1816] border border-[#ffb0cc]/20 rounded-2xl p-6 mb-6">
                        <div class="text-sm text-[#d7c1c7] mb-4">
                            Для массового импорта параметров используйте файл формата CSV. Колонки должны содержать:
                        </div>
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">name</b> — Название <span class="text-[#ffb0cc]">*</span></div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">unit</b> — Ед. изм.</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">type</b> — string, number, boolean, select</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">required</b> — true/false или Да/Нет</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">options</b> — Значения списка (через запятую)</div>
                            <div class="bg-[#141210] p-3 rounded-xl border border-white/5"><b class="text-[#e7e2dd]">category_hint</b> — Категории</div>
                        </div>
                        <div class="mt-4">
                            <button id="download-params-template-btn" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#ffb0cc]/40 text-[#ffb0cc] hover:bg-[#ffb0cc] hover:text-[#0f0e0c] transition-all text-[10px] font-bold uppercase tracking-widest">
                                <span class="material-symbols-outlined text-sm">download</span> СКАЧАТЬ ШАБЛОН
                            </button>
                        </div>
                    </div>
                    
                    <div id="import-params-select-btn" class="border-2 border-dashed border-[#ffb0cc]/30 rounded-[2rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:border-[#ffb0cc] hover:bg-[#ffb0cc]/5 transition-all group">
                        <div class="w-16 h-16 rounded-2xl border border-[#ffb0cc]/30 flex items-center justify-center text-[#ffb0cc] mb-4 group-hover:scale-110 transition-transform">
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
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-outline/10">
                            <th class="py-5 px-6 w-10 header-select-cell cursor-pointer">
                                <input type="checkbox" id="select-all-params" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer">
                            </th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Название параметра</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Ед. изм. / Тип</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Категории</th>
                            <th class="text-left px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Описание</th>
                            <th class="text-right px-6 py-5 text-[10px] font-label-caps uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredParams.map((p, i) => `
                            <tr class="border-b border-outline/5 hover:bg-primary/3 transition-colors group cursor-pointer param-row" data-id="${p.id}">
                                <td class="px-6 py-4 param-select-cell" data-id="${p.id}">
                                    <input type="checkbox" class="param-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary cursor-pointer" data-id="${p.id}">
                                </td>
                                <td class="px-6 py-4">
                                    <div class="font-bold text-sm text-on-surface group-hover:text-primary transition-colors flex items-center gap-2">
                                        ${escapeHtml(p.name)}
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
                                <td class="px-6 py-4 text-xs text-on-surface-variant opacity-60 max-w-[200px] truncate">${escapeHtml(p.description || '—')}</td>
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
                </table>
            </div>
            <div class="px-6 py-4 border-t border-outline/5 text-[10px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest">
                Показано ${filteredParams.length} из ${allParams.length} параметров
            </div>
        `;

        // Bind row actions
        tableContainer.querySelectorAll('.param-row').forEach(row => {
            row.onclick = (e) => {
                if (e.target.closest('.edit-param-btn') || e.target.closest('.delete-param-btn') || e.target.closest('.quick-unit-select') || e.target.closest('.quick-category-select')) return;
                const id = parseInt(row.dataset.id);
                const param = allParams.find(p => p.id === id);
                if (param) openParamModal(param);
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
                dropdown.className = 'inline-unit-dropdown custom-dropdown-menu fixed rounded-2xl p-2 z-[10000] min-w-[140px] shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200';
                dropdown.style.left = `${rect.left}px`;
                dropdown.style.top = `${rect.bottom + 4}px`;

                const units = ['мм', 'см', 'м', 'кг', 'т', 'шт', 'м²', 'пог. м', 'Без ед. изм.'];
                dropdown.innerHTML = units.map(u => {
                    const isCurrent = (param.unit || 'Без ед. изм.') === u || (!param.unit && u === 'Без ед. изм.');
                    return `
                        <button class="custom-dropdown-item w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : 'text-on-surface-variant'} transition-all flex items-center justify-between" data-unit="${u === 'Без ед. изм.' ? '' : u}">
                            <span>${u}</span>
                            ${isCurrent ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
                        </button>
                    `;
                }).join('');

                document.body.appendChild(dropdown);

                dropdown.querySelectorAll('button').forEach(btn => {
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
                            dropdown.remove();
                            await loadParams();
                        } catch (err) {
                            alert('Ошибка: ' + err.message);
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
        const checkboxes = tableContainer.querySelectorAll('.param-checkbox');
        
        tableContainer.querySelectorAll('.param-select-cell, .header-select-cell').forEach(cell => {
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
            selectedParamIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => parseInt(cb.dataset.id));
            updateToolbar();
        });

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                selectedParamIds = Array.from(checkboxes).filter(c => c.checked).map(c => parseInt(c.dataset.id));
                if (selectAll) {
                    const allChecked = Array.from(checkboxes).every(c => c.checked);
                    selectAll.checked = allChecked;
                    selectAll.indeterminate = selectedParamIds.length > 0 && !allChecked;
                }
                updateToolbar();
            });
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
        });

        // Hide unwanted buttons and show unit button
        setTimeout(() => {
            const btnCategory = tbContainer.querySelector('#bulk-update-category');
            const btnPrice = tbContainer.querySelector('#bulk-update-price');
            const btnStatus = tbContainer.querySelector('#bulk-toggle-status');
            const btnUnit = tbContainer.querySelector('#bulk-update-unit');
            if (btnCategory) btnCategory.style.display = 'none';
            if (btnPrice) btnPrice.style.display = 'none';
            if (btnStatus) btnStatus.style.display = 'none';
            if (btnUnit) btnUnit.style.display = 'flex';
        }, 10);
    };

    const exportParamsToExcel = (data) => {
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

    const openCategoryParamModal = (param) => {
        let modalWrapper = document.getElementById('param-category-modal-wrapper');
        if (modalWrapper) modalWrapper.remove();

        modalWrapper = document.createElement('div');
        modalWrapper.id = 'param-category-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);

        const allL1Categories = [...new Set((state.products || []).map(p => p.parent_category).filter(Boolean))].sort();
        const activeCategories = (param.category_hint || '').split(',').map(s => s.trim()).filter(Boolean);

        modalWrapper.innerHTML = `
            <div id="param-cat-modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div id="param-cat-modal-content" class="relative w-full max-w-md bg-surface-container border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300">
                <div class="p-6 border-b border-outline/10 flex items-center justify-between shrink-0">
                    <div>
                        <h3 class="font-headline-md text-lg font-bold uppercase tracking-tight text-on-surface">
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
                
                <div class="p-6 space-y-6 overflow-y-auto custom-scrollbar max-h-[60vh]">
                    <div class="space-y-3">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Выберите из существующих категорий L1:
                        </label>
                        <div class="grid grid-cols-2 gap-3">
                            ${allL1Categories.map(cat => {
                                const isChecked = activeCategories.includes(cat);
                                return `
                                    <label class="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline/10 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer group">
                                        <input type="checkbox" class="category-checkbox w-5 h-5 rounded border-outline/30 text-primary cursor-pointer peer" value="${escapeHtml(cat)}" ${isChecked ? 'checked' : ''}>
                                        <span class="text-xs font-bold text-on-surface-variant peer-checked:text-primary transition-colors">${escapeHtml(cat)}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="space-y-2 border-t border-outline/10 pt-4">
                        <label class="text-[10px] uppercase opacity-60 text-on-surface font-label-caps tracking-widest">
                            Или введите свою категорию L1:
                        </label>
                        <input type="text" id="new-custom-category" placeholder="напр. Прокат листовой" class="w-full bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface">
                    </div>
                </div>

                <div class="p-6 border-t border-outline/10 flex justify-end gap-3 bg-surface-container rounded-b-3xl">
                    <button id="cancel-param-cat" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="save-param-cat" class="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
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

        const save = async () => {
            const checkboxes = modalWrapper.querySelectorAll('.category-checkbox');
            const selected = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            
            const customVal = modalWrapper.querySelector('#new-custom-category').value.trim();
            if (customVal && !selected.includes(customVal)) {
                selected.push(customVal);
            }

            const category_hint = selected.join(', ');

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

            showConfirmPromptModal({
                title: 'Экспорт в Excel',
                icon: 'download',
                text: 'Вы уверены, что хотите выгрузить параметры в Excel?',
                confirmText: 'Выгрузить',
                confirmClass: 'bg-[#1e7145] text-white hover:brightness-110 shadow-[#1e7145]/20'
            }, () => {
                exportParamsToExcel(toExport);
            });
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

    // ─── Initial load ─────────────────────────────────────────────────────────
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
        const res = await fetch('/api/admin/parameters', {
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
