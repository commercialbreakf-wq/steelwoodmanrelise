const selectedLeadIds = new Set();

function updateBulkLeadsToolbar(state) {
    let toolbar = document.getElementById('leads-bulk-toolbar');
    if (selectedLeadIds.size === 0) {
        if (toolbar) toolbar.remove();
        return;
    }

    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'leads-bulk-toolbar';
        document.body.appendChild(toolbar);
    }

    toolbar.innerHTML = `
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1d1b19]/90 backdrop-blur-md border border-[#ffb0cc]/20 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div class="flex items-center gap-3 pr-6 border-r border-white/10">
                <div class="w-8 h-8 rounded-full bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center font-bold text-xs">
                    ${selectedLeadIds.size}
                </div>
                <div class="text-[10px] uppercase tracking-widest font-bold text-[#d7c1c7] font-['Space Grotesk']">Выбрано</div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="relative flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#ffb0cc] text-sm">donut_large</span>
                    <select id="bulk-lead-status-select" class="bg-[#151311] border border-[#ffb0cc]/20 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ffb0cc] outline-none cursor-pointer hover:bg-white/5 transition-all">
                        <option value="" disabled selected>Изменить статус...</option>
                        <option value="new">Новый</option>
                        <option value="in_progress">В работе</option>
                        <option value="waiting_client">Ожидание</option>
                        <option value="success">Успешно</option>
                        <option value="cancelled">Отказ</option>
                    </select>
                </div>
                
                <button id="bulk-lead-delete-btn" class="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-red-400">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Удалить
                </button>
            </div>
            
            <button id="bulk-lead-close-btn" class="ml-4 p-2 hover:bg-white/5 rounded-full transition-all text-[#d7c1c7]" title="Снять выделение">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    `;

    const select = toolbar.querySelector('#bulk-lead-status-select');
    select.addEventListener('change', async (e) => {
        const status = e.target.value;
        const ids = Array.from(selectedLeadIds);
        try {
            await state.authenticatedFetch('/api/admin/leads/batch-update', {
                method: 'POST',
                body: JSON.stringify({ ids, status })
            });
            selectedLeadIds.clear();
            updateBulkLeadsToolbar(state);
            await state.fetchLeads();
        } catch (err) {
            alert('Ошибка при массовом обновлении: ' + err.message);
        }
    });

    const deleteBtn = toolbar.querySelector('#bulk-lead-delete-btn');
    deleteBtn.onclick = async () => {
        if (confirm(`Вы уверены, что хотите удалить выбранные элементы (${selectedLeadIds.size})?`)) {
            const ids = Array.from(selectedLeadIds);
            try {
                await state.authenticatedFetch('/api/admin/leads/batch-delete', {
                    method: 'POST',
                    body: JSON.stringify({ ids })
                });
                selectedLeadIds.clear();
                updateBulkLeadsToolbar(state);
                await state.fetchLeads();
            } catch (err) {
                alert('Ошибка при массовом удалении: ' + err.message);
            }
        }
    };

    const closeBtn = toolbar.querySelector('#bulk-lead-close-btn');
    closeBtn.onclick = () => {
        selectedLeadIds.clear();
        updateBulkLeadsToolbar(state);
        document.querySelectorAll('.lead-select-checkbox').forEach(cb => cb.checked = false);
        const selectAll = document.getElementById('leads-select-all');
        if (selectAll) selectAll.checked = false;
    };
}

/**
 * Renders the leads table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderLeadsView(container, state, embedMode = false, filterType = 'forms') {
    if (!container) return;

    // Cleanup previous listener if any
    if (window._leadsUnsubscribe) {
        window._leadsUnsubscribe();
        window._leadsUnsubscribe = null;
    }

    const oldToolbar = document.getElementById('leads-bulk-toolbar');
    if (oldToolbar) oldToolbar.remove();
    selectedLeadIds.clear();

    if (embedMode) {
        container.innerHTML = `
            <div class="space-y-6 animate-in fade-in duration-500">
                <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="leads-table-container">
                    <div class="flex items-center justify-center h-[400px]">
                        <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Обработка заявок</h3>
                        <p class="text-sm text-[#d7c1c7] mt-1">Менеджмент лидов, технических расчетов и запросов</p>
                    </div>
                    <button type="button" id="refresh-leads-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                </div>

                <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="leads-table-container">
                    <div class="flex items-center justify-center h-[400px]">
                        <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        `;
    }

    const tableContainer = document.getElementById('leads-table-container');

    let currentType = '';
    let currentStatus = '';
    let sortKey = 'created_at';
    let sortOrder = 'desc';

    const loadLeads = async () => {
        if (!tableContainer) return;
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
            </div>
        `;
        try {
            const leads = await state.fetchLeads();
            const filteredLeads = leads.filter(l => {
                const isAppeal = ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && l.type.startsWith('Заказ #'));
                return filterType === 'appeals' ? isAppeal : !isAppeal;
            });
            renderLeadsWithFilters(tableContainer, filteredLeads, state, { currentType, currentStatus, sortKey, sortOrder, setFilters: (f) => {
                if (f.currentType !== undefined) currentType = f.currentType;
                if (f.currentStatus !== undefined) currentStatus = f.currentStatus;
                if (f.sortKey !== undefined) sortKey = f.sortKey;
                if (f.sortOrder !== undefined) sortOrder = f.sortOrder;
            }});
        } catch (err) {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[400px] text-red-400 gap-4">
                    <span class="material-symbols-outlined text-4xl">error</span>
                    <div class="text-sm font-medium">${err.message}</div>
                    <button onclick="location.reload()" class="text-xs uppercase tracking-widest font-bold underline">Повторить попытку</button>
                </div>
            `;
        }
    };

    const refreshBtn = document.getElementById('refresh-leads-btn');
    if (refreshBtn) refreshBtn.onclick = loadLeads;
    
    // Subscribe to state updates and store the unsubscribe function
    window._leadsUnsubscribe = state.on('leads:updated', (newLeads) => {
        // Always look for the current container in the DOM
        const freshTableContainer = document.getElementById('leads-table-container');
        if (!freshTableContainer) return;

        const filteredLeads = newLeads.filter(l => {
            const isAppeal = ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && l.type.startsWith('Заказ #'));
            return filterType === 'appeals' ? isAppeal : !isAppeal;
        });
        renderLeadsWithFilters(freshTableContainer, filteredLeads, state, { currentType, currentStatus, sortKey, sortOrder, setFilters: (f) => {
            if (f.currentType !== undefined) currentType = f.currentType;
            if (f.currentStatus !== undefined) currentStatus = f.currentStatus;
            if (f.sortKey !== undefined) sortKey = f.sortKey;
            if (f.sortOrder !== undefined) sortOrder = f.sortOrder;
        }});
    });

    await loadLeads();
}

function renderLeadsWithFilters(container, leads, state, filterOptions = {}) {
    if (leads.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-[400px] text-[#d7c1c7] opacity-40">
                <span class="material-symbols-outlined text-6xl mb-4">leaderboard</span>
                <div class="font-['Space Grotesk'] uppercase tracking-widest">Заявок пока нет</div>
            </div>
        `;
        return;
    }

    const typeMap = {
        'callback': 'Обратный звонок',
        'contact_form': 'Контактная форма',
        'catalog_inquiry': 'Запрос из каталога',
        'quick_order': 'Быстрый заказ',
        'quote': 'Технический расчет',
        'Технический расчет': 'Технический расчет',
        'logistics': 'Логистика',
        'contact': 'Контакт',
        'about_contact': 'Контакт (О нас)',
        'lab_tests': 'Лабораторные тесты',
        'main_contact': 'Основной контакт',
        'subscription': 'Подписка',
        'engineer_consult': 'Консультация инженера',
        'drawing_upload': 'Загрузка чертежа',
        'logistics_request': 'Запрос логистики',
        'Общий вопрос': 'Общий вопрос',
        'Финансовый вопрос': 'Финансовый вопрос',
        'Техническая проблема': 'Техническая проблема'
    };

    const types = [...new Set(leads.map(l => l.type).filter(Boolean))];

    let { currentType, currentStatus, sortKey, sortOrder, setFilters } = filterOptions;

    const getStatusCount = (status) => {
        if (!status) return leads.length;
        return leads.filter(l => (l.status || 'new').toLowerCase().trim() === status.toLowerCase().trim()).length;
    };

    container.innerHTML = `
        <!-- Tabs Navigation for Lead Types -->
        <div class="flex gap-2 p-4 border-b border-[#534347]/20 bg-[#151311] overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2">
                <span class="material-symbols-outlined text-[#ffb0cc] text-sm">filter_list</span>
                <span class="text-[10px] uppercase tracking-widest text-[#d7c1c7] opacity-60 font-bold font-['Space Grotesk']">Тип:</span>
            </div>
            <button type="button" class="lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentType === '' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-type="">
                Все виды
            </button>
            ${types.map(t => `
                <button type="button" class="lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentType === t ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-type="${t}">
                    ${typeMap[t] || t}
                </button>
            `).join('')}
        </div>

        <!-- Tabs Navigation for Lead Statuses -->
        <div class="flex gap-2 p-4 border-b border-[#534347]/20 bg-[#151311] overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2">
                <span class="material-symbols-outlined text-[#ffb0cc] text-sm">donut_large</span>
                <span class="text-[10px] uppercase tracking-widest text-[#d7c1c7] opacity-60 font-bold font-['Space Grotesk']">Статус:</span>
            </div>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === '' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="">
                Все <span class="opacity-60 ml-1">${getStatusCount('')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'new' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="new">
                Новые <span class="${currentStatus === 'new' ? 'opacity-60' : 'text-[#ffb0cc]'} ml-1">${getStatusCount('new')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'in_progress' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="in_progress">
                В работе <span class="opacity-60 ml-1">${getStatusCount('in_progress')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'waiting_client' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="waiting_client">
                Ожидание <span class="opacity-60 ml-1">${getStatusCount('waiting_client')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'success' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="success">
                Успешно <span class="opacity-60 ml-1">${getStatusCount('success')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'cancelled' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="cancelled">
                Отказ <span class="opacity-60 ml-1">${getStatusCount('cancelled')}</span>
            </button>
        </div>

        <div id="leads-table-content"></div>
    `;

    const contentContainer = container.querySelector('#leads-table-content');

    const updateTable = () => {
        const statusPriority = {
            'new': 1,
            'in_progress': 2,
            'waiting_client': 3,
            'success': 4,
            'cancelled': 5
        };

        const sortedLeads = [...leads].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'status') {
                valA = statusPriority[valA] || 99;
                valB = statusPriority[valB] || 99;
            } else if (sortKey === 'created_at') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else if (sortKey === 'name') {
                valA = (valA || '').toLowerCase();
                valB = (valB || '').toLowerCase();
            } else if (sortKey === 'type') {
                valA = (valA || '').toLowerCase();
                valB = (valB || '').toLowerCase();
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        const filtered = sortedLeads.filter(l => {
            const status = (l.status || 'new').toLowerCase().trim();
            const filterStatus = (currentStatus || '').toLowerCase().trim();
            const matchType = !currentType || l.type === currentType;
            const matchStatus = !filterStatus || status === filterStatus;
            return matchType && matchStatus;
        });

        renderLeadsTable(contentContainer, filtered, state, typeMap, { sortKey, sortOrder, onSort: (key) => {
            if (sortKey === key) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortKey = key;
                sortOrder = 'asc';
            }
            if (setFilters) setFilters({ sortKey, sortOrder });
            updateTable();
        }});
    };

    container.querySelectorAll('.lead-type-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentType = btn.dataset.type;
            if (setFilters) setFilters({ currentType });
            container.querySelectorAll('.lead-type-tab').forEach(b => {
                b.className = `lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${b.dataset.type === currentType ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}`;
            });
            updateTable();
        });
    });

    container.querySelectorAll('.lead-status-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStatus = btn.dataset.status;
            if (setFilters) setFilters({ currentStatus });
            container.querySelectorAll('.lead-status-tab').forEach(b => {
                b.className = `lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${b.dataset.status === currentStatus ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}`;
            });
            updateTable();
        });
    });

    updateTable();
}

function renderLeadsTable(container, leads, state, typeMap, sortOptions = {}) {
    if (leads.length === 0) {
        container.innerHTML = `
            <div class="p-16 text-center text-[#d7c1c7] opacity-60 text-base font-['Space Grotesk'] uppercase tracking-widest">Ничего не найдено</div>
        `;
        return;
    }

    const { sortKey, sortOrder, onSort } = sortOptions;

    const getSortIcon = (key) => {
        if (sortKey !== key) return '<span class="material-symbols-outlined text-[10px] opacity-20 ml-1">sort</span>';
        return sortOrder === 'asc' 
            ? '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_less</span>' 
            : '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_more</span>';
    };

    const allChecked = leads.length > 0 && leads.every(l => selectedLeadIds.has(l.id));

    container.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-xs uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-4 w-12 text-center">
                            <input type="checkbox" id="leads-select-all" class="w-4 h-4 rounded border-white/20 bg-black/40 text-[#ffb0cc] focus:ring-0 focus:ring-offset-0 cursor-pointer" ${allChecked ? 'checked' : ''}>
                        </th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="name">Контактные данные ${getSortIcon('name')}</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="created_at">Детали запроса ${getSortIcon('created_at')}</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="type">Источник ${getSortIcon('type')}</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="status">Статус ${getSortIcon('status')}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${leads.map(lead => {
                        const status = lead.status || 'new';
                        const statusClasses = {
                            'new': 'bg-blue-500/5 border-l-4 border-l-blue-500/50',
                            'in_progress': 'bg-yellow-500/5 border-l-4 border-l-yellow-500/50',
                            'waiting_client': 'bg-purple-500/5 border-l-4 border-l-purple-500/50',
                            'success': 'bg-green-500/5 border-l-4 border-l-green-500/50',
                            'cancelled': 'bg-red-500/5 border-l-4 border-l-red-500/50'
                        };
                        const rowClass = statusClasses[status] || '';

                        const selectClasses = {
                            'new': 'text-blue-400 border-blue-500/30',
                            'in_progress': 'text-yellow-400 border-yellow-500/30',
                            'waiting_client': 'text-purple-400 border-purple-500/30',
                            'success': 'text-green-400 border-green-500/30',
                            'cancelled': 'text-red-400 border-red-500/30'
                        };
                        const selectClass = selectClasses[status] || 'text-[#e7e2dd] border-[#534347]/40';
                        const isSelected = selectedLeadIds.has(lead.id);

                        return `
                        <tr class="group hover:bg-white/[0.04] transition-colors cursor-pointer lead-row ${rowClass}" data-id="${lead.id}">
                            <td class="py-4 px-4 w-12 text-center">
                                <input type="checkbox" class="lead-select-checkbox w-4 h-4 rounded border-white/20 bg-black/40 text-[#ffb0cc] focus:ring-0 focus:ring-offset-0 cursor-pointer" data-id="${lead.id}" ${isSelected ? 'checked' : ''}>
                            </td>
                            <td class="py-5 px-6">
                                <div class="font-bold text-base uppercase text-[#e7e2dd] tracking-tight">${lead.name || 'Аноним'}</div>
                                <div class="text-sm text-[#ffb0cc] font-mono font-medium mt-1 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">call</span>
                                    ${lead.phone || 'Телефон не указан'}
                                </div>
                                <div class="text-sm text-[#d7c1c7] font-mono mt-0.5 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">mail</span>
                                    ${lead.email || 'Email не указан'}
                                </div>
                            </td>
                            <td class="py-5 px-6">
                                ${lead.project_type ? `<div class="text-xs text-[#ffb0cc] font-['Space Grotesk'] font-bold uppercase mb-2 inline-flex items-center gap-1 bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-3 py-1 rounded-lg"><span class="material-symbols-outlined text-xs">precision_manufacturing</span>Проект: ${lead.project_type}</div>` : ''}
                                <div class="text-sm text-[#e7e2dd] leading-relaxed max-w-md italic">
                                    "${lead.message || 'Без комментария'}"
                                </div>
                                <div class="text-[10px] text-[#d7c1c7] opacity-40 uppercase mt-2 font-mono">${new Date(lead.created_at).toLocaleString('ru-RU')}</div>
                            </td>
                            <td class="py-5 px-6">
                                <span class="px-3 py-1.5 rounded-xl bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 text-xs uppercase font-bold text-[#ffb0cc] tracking-widest font-['Space Grotesk'] inline-block">
                                    ${typeMap[lead.type] || lead.type || 'Заявка'}
                                </span>
                            </td>
                            <td class="py-5 px-6">
                                <div class="flex items-center gap-4">
                                    <select data-id="${lead.id}" class="lead-status-select flex-1 min-w-[140px] bg-[#151311] border rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#ffb0cc] transition-all cursor-pointer shadow-lg ${selectClass}">
                                        <option value="new" ${status === 'new' ? 'selected' : ''}>Новый</option>
                                        <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>В работе</option>
                                        <option value="waiting_client" ${status === 'waiting_client' ? 'selected' : ''}>Ожидание клиента</option>
                                        <option value="success" ${status === 'success' ? 'selected' : ''}>Успешно закрыта</option>
                                        <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Отказ</option>
                                    </select>
                                    <button data-id="${lead.id}" class="delete-lead-btn p-2 hover:text-red-400 transition-colors" title="Удалить лид">
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

    // Add checkbox event listeners
    container.querySelectorAll('.lead-select-checkbox').forEach(cb => {
        cb.onclick = e => e.stopPropagation();
        cb.onchange = e => {
            const id = Number(cb.dataset.id);
            if (cb.checked) {
                selectedLeadIds.add(id);
            } else {
                selectedLeadIds.delete(id);
            }
            const selectAll = container.querySelector('#leads-select-all');
            if (selectAll) {
                const allVisibleCbs = container.querySelectorAll('.lead-select-checkbox');
                const allChecked = Array.from(allVisibleCbs).every(c => c.checked);
                selectAll.checked = allChecked;
            }
            updateBulkLeadsToolbar(state);
        };
    });

    const selectAll = container.querySelector('#leads-select-all');
    if (selectAll) {
        selectAll.onclick = e => e.stopPropagation();
        selectAll.onchange = e => {
            const checked = selectAll.checked;
            const allVisibleCbs = container.querySelectorAll('.lead-select-checkbox');
            allVisibleCbs.forEach(cb => {
                cb.checked = checked;
                const id = Number(cb.dataset.id);
                if (checked) {
                    selectedLeadIds.add(id);
                } else {
                    selectedLeadIds.delete(id);
                }
            });
            updateBulkLeadsToolbar(state);
        };
    }

    // Add sort listeners
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // Event listeners
    container.querySelectorAll('.lead-row').forEach(row => {
        row.addEventListener('click', () => {
            openLeadDrawer(row.dataset.id, state);
        });
    });

    container.querySelectorAll('.lead-status-select').forEach(select => {
        select.addEventListener('click', e => e.stopPropagation());
        select.addEventListener('change', async (e) => {
            const id = e.target.dataset.id;
            const status = e.target.value;
            try {
                await state.authenticatedFetch(`/api/admin/leads/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                });
                
                // Update local state
                const leadIndex = state.leads.findIndex(l => String(l.id) === String(id));
                if (leadIndex !== -1) {
                    state.leads[leadIndex].status = status;
                }
                
                e.target.classList.add('border-green-500');
                setTimeout(() => e.target.classList.remove('border-green-500'), 2000);
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        });
    });

    // Delete listener
    container.querySelectorAll('.delete-lead-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('Вы уверены, что хотите удалить этот лид?')) {
                try {
                    await state.authenticatedFetch(`/api/admin/leads/${id}`, {
                        method: 'DELETE'
                    });
                    // Refresh leads list
                    await state.fetchLeads();
                    // State change will trigger re-render because of the listener in renderLeadsView
                } catch (err) {
                    alert('Ошибка при удалении: ' + err.message);
                }
            }
        });
    });
}

async function openLeadDrawer(leadId, state) {
    try { await state.fetchLeads(); } catch(e) { console.error(e); }
    const lead = state.leads.find(l => String(l.id) === String(leadId));
    if (!lead) return;

    let messages = [];
    try {
        if (typeof lead.messages === 'string') messages = JSON.parse(lead.messages);
        else if (Array.isArray(lead.messages)) messages = lead.messages;
    } catch(e) {}

    let modalWrapper = document.getElementById('admin-lead-modal');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-lead-modal';
        modalWrapper.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);
    }

    const renderMessages = () => {
        if (messages.length === 0) {
            return `<div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-['Space Grotesk'] text-[#e7e2dd]">Нет сообщений</span></div>`;
        }
        return messages.map(m => {
            const isAdmin = m.sender === 'admin';
            const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

            if (isAdmin) {
                return `
                    <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                        <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                            <div class="px-5 py-3 rounded-3xl text-sm bg-[#ffb0cc] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                                ${m.text}
                            </div>
                        </div>
                        <div class="text-[10px] text-[#d7c1c7] opacity-50 font-mono mt-1.5 flex items-center gap-1 mr-1">
                            <span class="material-symbols-outlined text-[12px] text-[#ffb0cc]">done_all</span>
                            Вы (Менеджер) • ${dateStr} ${timeStr}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                        <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                            <div class="px-5 py-3 rounded-3xl text-sm bg-[#2a2624] border border-[#ffb0cc]/40 text-[#e7e2dd] rounded-bl-none shadow-xl leading-relaxed">
                                ${m.text}
                            </div>
                        </div>
                        <div class="text-[10px] text-[#ffb0cc] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
                            <span class="material-symbols-outlined text-[12px]">person</span>
                            Клиент • ${dateStr} ${timeStr}
                        </div>
                    </div>
                `;
            }
        }).join('');
    };

    modalWrapper.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" id="lead-modal-backdrop"></div>
        <div class="relative w-full max-w-3xl max-h-[90vh] bg-[#1d1b19] border border-[#534347]/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0 animate-in zoom-in-95 duration-300">
            <div class="p-6 border-b border-[#534347]/20 flex items-center justify-between shrink-0">
                <div>
                    <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight">Обращение #${lead.id}</h3>
                    <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1">${lead.name || 'Клиент'}</div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="delete-lead-drawer-btn" class="w-10 h-10 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors text-red-400" title="Удалить обращение">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                    <button id="close-lead-modal" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0">
                <div class="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 bg-[#ffb0cc]/10 text-[#ffb0cc] border border-[#ffb0cc]/20 rounded-md font-bold uppercase text-[9px] tracking-widest">${lead.type || 'Вопрос'}</span>
                        <span class="text-[10px] text-[#d7c1c7] opacity-60 font-mono">${new Date(lead.created_at).toLocaleString('ru-RU')}</span>
                    </div>
                    <div class="text-sm text-[#e7e2dd] leading-relaxed italic">
                        "${lead.message || 'Без описания'}"
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-white/5 px-6 py-3.5 border border-white/5 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] border border-[#ffb0cc]/30">
                                <span class="material-symbols-outlined text-base">forum</span>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-[#e7e2dd] uppercase tracking-widest font-['Space Grotesk'] block">Чат по обращению</span>
                                <span class="text-[9px] text-[#d7c1c7] opacity-60 block">Чат синхронизируется в реальном времени</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] text-[#ffb0cc] bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">Live Sync</span>
                            <span id="chat-realtime-dot" class="flex items-center gap-1.5 text-[9px] text-green-400 uppercase tracking-widest font-bold opacity-70">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live
                            </span>
                        </div>
                    </div>
                    <div class="bg-black/40 rounded-3xl border border-white/10 flex flex-col h-[380px] shadow-2xl overflow-hidden">
                        <div id="chat-messages" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            ${renderMessages()}
                        </div>
                        <div class="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-white/5 items-center">
                            <input type="text" id="chat-input" placeholder="Написать ответ..." class="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#ffb0cc] transition-all text-[#e7e2dd] placeholder:opacity-40 shadow-inner">
                            <button id="send-msg-btn" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:brightness-110 transition-all shrink-0 shadow-lg shadow-[#ffb0cc]/20">
                                <span class="material-symbols-outlined text-base">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        modalWrapper.querySelector('div.relative').classList.remove('scale-95');
    });

    const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
    let supabaseRT = null;
    let adminRealtimeChannel = null;

    try {
        const sb = window.supabase;
        if (sb && sb.createClient) {
            supabaseRT = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            adminRealtimeChannel = supabaseRT
                .channel(`admin-lead-chat-${leadId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'leads',
                    filter: `id=eq.${leadId}`
                }, (payload) => {
                    const newMsgs = payload.new.messages;
                    if (!newMsgs) return;
                    let updated = [];
                    try { updated = typeof newMsgs === 'string' ? JSON.parse(newMsgs) : newMsgs; } catch(e) { return; }
                    if (updated.length > messages.length) {
                        messages = updated;
                        lead.messages = messages;
                        const chatBox = modalWrapper.querySelector('#chat-messages');
                        if (chatBox) {
                            chatBox.innerHTML = renderMessages();
                            chatBox.scrollTop = chatBox.scrollHeight;
                            chatBox.style.transition = 'background 0.3s';
                            chatBox.style.background = 'rgba(255,176,204,0.05)';
                            setTimeout(() => { chatBox.style.background = ''; }, 600);
                        }
                    }
                })
                .subscribe();
        }
    } catch(e) { console.warn('Admin Realtime not available:', e.message); }

    const close = () => {
        if (adminRealtimeChannel && supabaseRT) {
            supabaseRT.removeChannel(adminRealtimeChannel);
        }
        modalWrapper.classList.add('opacity-0');
        modalWrapper.querySelector('div.relative').classList.add('scale-95');
        setTimeout(() => modalWrapper.remove(), 300);
    };

    modalWrapper.querySelector('#close-lead-modal').onclick = close;
    modalWrapper.querySelector('#lead-modal-backdrop').onclick = close;

    modalWrapper.querySelector('#delete-lead-drawer-btn').onclick = async () => {
        if (confirm('Вы уверены, что хотите безвозвратно удалить это обращение?')) {
            try {
                await state.authenticatedFetch(`/api/admin/leads/${leadId}`, {
                    method: 'DELETE'
                });
                close();
                await state.fetchLeads();
            } catch (err) {
                alert('Ошибка при удалении: ' + err.message);
            }
        }
    };

    const sendMessage = async () => {
        const input = modalWrapper.querySelector('#chat-input');
        const text = input.value.trim();
        if (!text) return;
        
        messages.push({ sender: 'admin', text, timestamp: new Date().toISOString() });
        input.value = '';
        
        const chatContainer = modalWrapper.querySelector('#chat-messages');
        chatContainer.innerHTML = renderMessages();
        chatContainer.scrollTop = chatContainer.scrollHeight;

        try {
            await state.authenticatedFetch(`/api/admin/leads/${lead.id}`, {
                method: 'PUT',
                body: JSON.stringify({ messages })
            });
            lead.messages = messages;
            const idx = state.leads.findIndex(l => String(l.id) === String(leadId));
            if (idx !== -1) state.leads[idx].messages = messages;
        } catch(e) {
            alert('Ошибка: ' + e.message);
            messages.pop();
            chatContainer.innerHTML = renderMessages();
        }
    };

    modalWrapper.querySelector('#send-msg-btn').onclick = sendMessage;
    modalWrapper.querySelector('#chat-input').onkeydown = (e) => {
        if (e.key === 'Enter') sendMessage();
    };
    
    const chatContainer = modalWrapper.querySelector('#chat-messages');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

