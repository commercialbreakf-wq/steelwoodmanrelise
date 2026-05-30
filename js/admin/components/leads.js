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
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-container-low/90 backdrop-blur-md border border-primary/20 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div class="flex items-center gap-3 pr-6 border-r border-outline/10">
                <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    ${selectedLeadIds.size}
                </div>
                <div class="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label-caps">Выбрано</div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="relative flex items-center gap-2">
                    <button type="button" id="bulk-lead-status-btn" class="flex items-center gap-2 bg-surface-container border border-primary/20 hover:border-primary/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary outline-none cursor-pointer hover:bg-on-surface/5 transition-all shadow-md font-label-caps">
                        <span class="material-symbols-outlined text-primary text-sm">donut_large</span>
                        <span>Изменить статус...</span>
                        <span class="material-symbols-outlined text-sm opacity-50 ml-1">expand_more</span>
                    </button>
                </div>
                
                <button type="button" id="bulk-lead-delete-btn" class="flex items-center gap-2 px-4 py-2 hover:bg-error/10 border border-error/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-error font-label-caps">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Удалить
                </button>
            </div>
            
            <button id="bulk-lead-close-btn" class="ml-4 p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant" title="Снять выделение">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    `;

    const statusBtn = toolbar.querySelector('#bulk-lead-status-btn');
    statusBtn.onclick = async () => {
        const status = await window.openStatusSelectModal(window.LEAD_STATUS_OPTIONS, null, 'Изменить статус выбранных лидов');
        if (!status) return;
        const ids = Array.from(selectedLeadIds);
        try {
            await Promise.all(ids.map(id => 
                state.authenticatedFetch(`/api/admin/leads/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                })
            ));
            selectedLeadIds.clear();
            updateBulkLeadsToolbar(state);
            await state.fetchLeads();
            window.showToast(`Статус ${ids.length} лидов успешно обновлен на "${status}"`, 'success', 'Массовое обновление');
        } catch (err) {
            alert('Ошибка при массовом обновлении: ' + err.message);
        }
    };

    const deleteBtn = toolbar.querySelector('#bulk-lead-delete-btn');
    deleteBtn.onclick = async () => {
        if (await confirm(`Вы уверены, что хотите удалить выбранные элементы (${selectedLeadIds.size})?`)) {
            const ids = Array.from(selectedLeadIds);
            try {
                await Promise.all(ids.map(id => 
                    state.authenticatedFetch(`/api/admin/leads/${id}`, {
                        method: 'DELETE'
                    })
                ));
                selectedLeadIds.clear();
                updateBulkLeadsToolbar(state);
                await state.fetchLeads();
                window.showToast(`Успешно удалено лидов: ${ids.length}`, 'success', 'Массовое удаление');
            } catch (err) {
                alert('Ошибка при массовом удалении: ' + err.message);
            }
        }
    };

    const closeBtn = toolbar.querySelector('#bulk-lead-close-btn');
    closeBtn.onclick = () => {
        selectedLeadIds.clear();
        updateBulkLeadsToolbar(state);
        document.querySelectorAll('.lead-select-cell').forEach(cell => {
            const block = cell.querySelector('.lead-select-block');
            if (block) block.className = "lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-low text-transparent";
        });
        const selectAll = document.getElementById('leads-select-all');
        if (selectAll) selectAll.className = "w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-low text-transparent";
    };
}

/**
 * Renders the leads table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderLeadsView(container, state, embedMode = false, filterType = 'forms') {
    if (!container) return;

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
                <div class="liquid-glass rounded-3xl overflow-hidden min-h-[400px] border border-outline/5 shadow-xl bg-surface-container/30" id="leads-table-container">
                    <div class="flex items-center justify-center h-[400px]">
                        <div class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-2xl font-bold font-headline-md tracking-tight text-on-surface">Обработка заявок</h3>
                        <p class="text-sm text-on-surface-variant mt-1">Менеджмент лидов, технических расчетов и запросов</p>
                    </div>
                    <button type="button" id="refresh-leads-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-surface-container text-primary rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all border border-outline/5 shadow-lg font-label-caps">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                </div>

                <div class="liquid-glass rounded-3xl overflow-hidden min-h-[400px] border border-outline/5 shadow-xl bg-surface-container/30" id="leads-table-container">
                    <div class="flex items-center justify-center h-[400px]">
                        <div class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        `;
    }

    const tableContainer = document.getElementById('leads-table-container');
    let currentType = '';
    let currentStatus = ''; // Default 'All'
    let sortKey = 'created_at';
    let sortOrder = 'desc';

    const loadLeads = async () => {
        if (!tableContainer) return;
        tableContainer.innerHTML = `<div class="flex items-center justify-center h-[400px]"><div class="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>`;
        try {
            const leads = await state.fetchLeads();
            const filteredLeads = leads.filter(l => {
                const isAppeal = ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && (l.type.startsWith('Заказ #') || l.type.startsWith('Заказ ')));
                return filterType === 'appeals' ? isAppeal : !isAppeal;
            });
            renderLeadsWithFilters(tableContainer, filteredLeads, state, { 
                currentType, 
                currentStatus, 
                sortKey, 
                sortOrder, 
                setFilters: (f) => {
                    if (f.currentType !== undefined) currentType = f.currentType;
                    if (f.currentStatus !== undefined) currentStatus = f.currentStatus;
                    if (f.sortKey !== undefined) sortKey = f.sortKey;
                    if (f.sortOrder !== undefined) sortOrder = f.sortOrder;
                }
            });
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
    
    window._leadsUnsubscribe = state.on('leads:updated', (newLeads) => {
        const freshTableContainer = document.getElementById('leads-table-container');
        if (!freshTableContainer) return;
        const filteredLeads = newLeads.filter(l => {
            const isAppeal = ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && (l.type.startsWith('Заказ #') || l.type.startsWith('Заказ ')));
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
        container.innerHTML = `<div class="flex flex-col items-center justify-center h-[400px] text-on-surface-variant opacity-40"><span class="material-symbols-outlined text-6xl mb-4">leaderboard</span><div class="font-['Space Grotesk'] uppercase tracking-widest">Заявок пока нет</div></div>`;
        return;
    }

    const typeMap = { 'callback': 'Обратный звонок', 'contact_form': 'Контактная форма', 'catalog_inquiry': 'Запрос из каталога', 'quick_order': 'Быстрый заказ', 'quote': 'Технический расчет', 'Технический расчет': 'Технический расчет', 'logistics': 'Логистика', 'contact': 'Контакт', 'about_contact': 'Контакт (О нас)', 'lab_tests': 'Лабораторные тесты', 'main_contact': 'Основной контакт', 'subscription': 'Подписка', 'engineer_consult': 'Консультация инженера', 'drawing_upload': 'Загрузка чертежа', 'logistics_request': 'Запрос логистики', 'Общий вопрос': 'Общий вопрос', 'Финансовый вопрос': 'Финансовый вопрос', 'Техническая проблема': 'Техническая проблема' };
    const types = [...new Set(leads.map(l => l.type).filter(Boolean))];
    let { currentType, currentStatus, sortKey, sortOrder, setFilters } = filterOptions;

    const getStatusCount = (status) => {
        if (!status) return leads.length;
        return leads.filter(l => (l.status || 'new').toLowerCase().trim() === status.toLowerCase().trim()).length;
    };

    container.innerHTML = `
        <div class="flex gap-2 p-4 border-b border-outline/10 bg-surface-container overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2"><span class="material-symbols-outlined text-primary text-sm">filter_list</span><span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold font-label-caps">Тип:</span></div>
            <button type="button" class="lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentType === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-type="">Все виды</button>
            ${types.map(t => `<button type="button" class="lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentType === t ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-type="${t}">${typeMap[t] || t}</button>`).join('')}
        </div>
        <div class="flex gap-2 p-4 border-b border-outline/10 bg-surface-container overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2"><span class="material-symbols-outlined text-primary text-sm">donut_large</span><span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold font-label-caps">Статус:</span></div>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="">Все <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === '' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('')}</span></button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'new' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="new">Новые <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'new' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('new')}</span></button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'in_progress' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="in_progress">В работе <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'in_progress' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('in_progress')}</span></button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'waiting_client' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="waiting_client">Ожидание <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'waiting_client' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('waiting_client')}</span></button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'success' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="success">Успешно <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'success' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('success')}</span></button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'cancelled' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="cancelled">Отказ <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'cancelled' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('cancelled')}</span></button>
        </div>
        <div id="leads-table-content"></div>
    `;

    const contentContainer = container.querySelector('#leads-table-content');
    const updateTable = () => {
        const sortedLeads = [...leads].sort((a, b) => {
            let valA = a[sortKey]; let valB = b[sortKey];
            if (sortKey === 'created_at') { valA = new Date(valA); valB = new Date(valB); }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        const filtered = sortedLeads.filter(l => {
            const status = (l.status || 'new').toLowerCase().trim();
            const matchType = !currentType || l.type === currentType;
            const matchStatus = !currentStatus || status === currentStatus.toLowerCase().trim();
            return matchType && matchStatus;
        });
        renderLeadsTable(contentContainer, filtered, state, typeMap, { sortKey, sortOrder, onSort: (key) => {
            if (sortKey === key) sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'; else { sortKey = key; sortOrder = 'asc'; }
            if (setFilters) setFilters({ sortKey, sortOrder });
            updateTable();
        }});
    };

    container.querySelectorAll('.lead-type-tab').forEach(btn => btn.onclick = () => { if (typeof window.cancelAllBulkActions === 'function') window.cancelAllBulkActions(); currentType = btn.dataset.type; if (setFilters) setFilters({ currentType }); updateTable(); container.querySelectorAll('.lead-type-tab').forEach(b => b.className = `lead-type-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${b.dataset.type === currentType ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}`); });
    container.querySelectorAll('.lead-status-tab').forEach(btn => btn.onclick = () => { if (typeof window.cancelAllBulkActions === 'function') window.cancelAllBulkActions(); currentStatus = btn.dataset.status; if (setFilters) setFilters({ currentStatus }); updateTable(); container.querySelectorAll('.lead-status-tab').forEach(b => b.className = `lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${b.dataset.status === currentStatus ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}`); });
    updateTable();
}

function renderLeadsTable(container, leads, state, typeMap, sortOptions = {}) {
    if (leads.length === 0) { container.innerHTML = `<div class="p-16 text-center text-on-surface-variant opacity-60 text-base font-['Space Grotesk'] uppercase tracking-widest">Ничего не найдено</div>`; return; }
    const { sortKey, sortOrder, onSort } = sortOptions;
    const allChecked = leads.length > 0 && leads.every(l => selectedLeadIds.has(l.id));

    container.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar hidden md:block">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-outline/10 text-xs uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                        <th class="py-4 px-4 w-12 text-center"><div id="leads-select-all" class="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}"><span class="material-symbols-outlined text-[14px] font-bold">done_all</span></div></th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="name">Контактные данные</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="created_at">Детали запроса</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="type">Источник</th>
                        <th class="py-5 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="status">Статус</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-outline/5">
                    ${leads.map(lead => {
                        const isSelected = selectedLeadIds.has(lead.id);
                        const status = (lead.status || 'new').toLowerCase().trim();
                        
                        const statusClasses = {
                            'new': 'bg-blue-500/5 border-l-4 border-l-blue-500/50',
                            'in_progress': 'bg-yellow-500/5 border-l-4 border-l-yellow-500/50',
                            'waiting_client': 'bg-pink-500/5 border-l-4 border-l-pink-500/50',
                            'success': 'bg-green-500/5 border-l-4 border-l-green-500/50',
                            'cancelled': 'bg-red-500/5 border-l-4 border-l-red-500/50'
                        };
                        const rowClass = statusClasses[status] || '';

                        return `<tr class="group hover:bg-on-surface/[0.04] transition-colors cursor-pointer lead-row ${rowClass}" data-id="${lead.id}">
                            <td class="py-4 px-4 w-12 text-center lead-select-cell" data-id="${lead.id}"><div class="lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${isSelected ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}"><span class="material-symbols-outlined text-[14px] font-bold">check</span></div></td>
                            <td class="py-5 px-6"><div class="font-bold text-base uppercase text-on-surface truncate max-w-[200px] tracking-tight">${lead.name || 'Аноним'}</div><div class="text-sm text-primary font-mono mt-1 truncate max-w-[200px]">${lead.phone || ''}</div></td>
                            <td class="py-5 px-6"><div class="text-sm text-on-surface line-clamp-2 italic">"${lead.message || '...'}"</div><div class="text-[10px] text-on-surface-variant opacity-40 uppercase mt-1 font-mono font-label-caps tracking-widest">${new Date(lead.created_at).toLocaleString('ru-RU')}</div></td>
                            <td class="py-5 px-6"><span class="px-2 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase font-label-caps tracking-widest">${typeMap[lead.type] || lead.type || '...'}</span></td>
                            <td class="py-5 px-6">
                                <div class="flex items-center gap-2">
                                    ${(() => {
                                        const statusObj = window.LEAD_STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: 'var(--color-primary)', icon: 'donut_large' };
                                        return `<button type="button" data-id="${lead.id}" data-status="${status}" class="lead-status-modal-btn flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline/10 hover:border-outline/20 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0 font-label-caps" style="border-left: 4px solid ${statusObj.color};">
                                            <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                                                <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon || 'donut_large'}</span>
                                                <span class="truncate">${statusObj.label}</span>
                                            </span>
                                            <span class="material-symbols-outlined text-xs text-on-surface-variant opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                                        </button>`;
                                    })()}
                                    <button type="button" data-id="${lead.id}" class="delete-lead-btn p-2 rounded-xl text-error hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-error/10">
                                        <span class="material-symbols-outlined text-base transition-transform duration-300 group-hover/btn:-rotate-12">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="grid grid-cols-1 gap-4 md:hidden p-4">
            ${leads.map(lead => {
                const status = (lead.status || 'new').toLowerCase().trim();
                const statusObj = window.LEAD_STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: 'var(--color-primary)' };
                return `<div class="lead-row bg-surface-container rounded-2xl p-4 border border-outline/5 shadow-md cursor-pointer" data-id="${lead.id}">
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <div class="min-w-0">
                            <div class="font-bold text-on-surface uppercase truncate tracking-tight">${lead.name || 'Аноним'}</div>
                            ${lead.phone ? `<div class="text-xs text-primary font-mono mt-0.5 flex items-center gap-1 select-all"><span class="material-symbols-outlined text-sm">call</span>${lead.phone}</div>` : ''}
                        </div>
                        <span class="text-[9px] font-bold uppercase px-2.5 py-1 rounded font-label-caps tracking-widest shrink-0" style="color: ${statusObj.color}; background-color: ${statusObj.color}15; border: 1px solid ${statusObj.color}30;">${statusObj.label}</span>
                    </div>
                    <div class="text-xs text-on-surface-variant mb-2 italic line-clamp-2">"${lead.message || '...'}"</div>
                    <div class="flex justify-between items-center gap-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-[9px] font-bold uppercase font-label-caps tracking-widest truncate">${typeMap[lead.type] || lead.type || 'Заявка'}</span>
                            <div class="text-[9px] text-on-surface-variant opacity-50 font-mono font-label-caps uppercase tracking-widest shrink-0">${new Date(lead.created_at).toLocaleDateString('ru-RU')}</div>
                        </div>
                        <button data-id="${lead.id}" class="delete-lead-btn p-2 rounded-xl text-on-surface-variant hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 group/btn flex items-center justify-center hover:shadow-md hover:shadow-error/10 shrink-0"><span class="material-symbols-outlined text-base transition-transform duration-300 group-hover/btn:-rotate-12">delete</span></button>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;

    // Select cell click
    container.querySelectorAll('.lead-select-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = cell.dataset.id;
            const block = cell.querySelector('.lead-select-block');
            const isChecked = !selectedLeadIds.has(id);
            
            if (isChecked) {
                selectedLeadIds.add(id);
                block.className = "lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
            } else {
                selectedLeadIds.delete(id);
                block.className = "lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent";
            }
            
            updateBulkLeadsToolbar(state);

            // Update master check
            const selectAll = container.querySelector('#leads-select-all');
            if (selectAll) {
                const allVisibleCells = container.querySelectorAll('.lead-select-cell');
                const allChecked = Array.from(allVisibleCells).every(c => selectedLeadIds.has(c.dataset.id));
                selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            }
        });
    });

    // Select all check
    const selectAll = container.querySelector('#leads-select-all');
    if (selectAll) {
        selectAll.onclick = e => {
            e.stopPropagation();
            const allVisibleCells = container.querySelectorAll('.lead-select-cell');
            const currentlyAllChecked = Array.from(allVisibleCells).every(c => selectedLeadIds.has(c.dataset.id));
            const willBeChecked = !currentlyAllChecked;
            
            allVisibleCells.forEach(cell => {
                const id = cell.dataset.id;
                const block = cell.querySelector('.lead-select-block');
                if (willBeChecked) {
                    selectedLeadIds.add(id);
                    if(block) block.className = "lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
                } else {
                    selectedLeadIds.delete(id);
                    if(block) block.className = "lead-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent";
                }
            });
            
            selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${willBeChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            updateBulkLeadsToolbar(state);
        };
    }

    // Add sort listeners
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // Status change modal button
    container.querySelectorAll('.lead-status-modal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const currentStatus = btn.dataset.status;
            const newStatus = await window.openStatusSelectModal(window.LEAD_STATUS_OPTIONS, currentStatus, `Изменение статуса обращения ${id}`);
            if (!newStatus || newStatus === currentStatus) return;
            
            try {
                await state.authenticatedFetch(`/api/admin/leads/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                
                await state.fetchLeads();
                window.showToast(`Статус обращения ${id} изменен на "${newStatus}"`, 'success', 'Обновление статуса');
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        });
    });

    // Delete lead button
    container.querySelectorAll('.delete-lead-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (await confirm(`Вы уверены, что хотите удалить обращение ${id}? Это действие необратимо.`)) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    await state.authenticatedFetch(`/api/admin/leads/${id}`, {
                        method: 'DELETE'
                    });
                    await state.fetchLeads();
                    window.showToast(`Обращение ${id} успешно удалено`, 'success', 'Удаление обращения');
                } catch (err) {
                    alert('Ошибка при удалении: ' + err.message);
                    if (icon) icon.textContent = 'delete';
                    btn.disabled = false;
                }
            }
        });
    });

    container.querySelectorAll('.lead-row').forEach(row => row.onclick = (e) => { if (!e.target.closest('.lead-select-cell') && !e.target.closest('button')) openLeadDrawer(row.dataset.id, state); });
}

async function openLeadDrawer(leadId, state) {
    if (typeof window.cancelAllBulkActions === 'function') {
        window.cancelAllBulkActions();
    }
    try { await state.fetchLeads(); } catch(e) { console.error(e); }
    const lead = state.leads.find(l => String(l.id) === String(leadId));
    if (!lead) return;

    let messages = [];
    try { if (typeof lead.messages === 'string') messages = JSON.parse(lead.messages); else if (Array.isArray(lead.messages)) messages = lead.messages; } catch(e) {}

    let modalWrapper = document.getElementById('admin-lead-modal');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-lead-modal';
        modalWrapper.className = 'fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);
    }

    const renderMessages = () => {
        if (messages.length === 0) return `<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3">forum</span><span class="text-xs uppercase tracking-widest font-bold font-label-caps">Нет сообщений</span></div>`;
        return messages.map(m => {
            const isAdmin = m.sender === 'admin';
            const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

            if (isAdmin) {
                return `
                    <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                        <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                            <div class="px-5 py-3 rounded-3xl text-sm bg-[#ca7093] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                                ${m.text.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div class="text-[10px] text-on-surface-variant opacity-70 font-mono mt-1.5 flex items-center gap-1 mr-1">
                            <span class="material-symbols-outlined text-[12px] text-[#ca7093]">done_all</span>
                            Вы (Менеджер) • ${dateStr} ${timeStr}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                        <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                            <div class="px-5 py-3 rounded-3xl text-sm bg-surface-variant border border-outline/10 text-on-surface rounded-bl-none shadow-md leading-relaxed">
                                ${m.text.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        <div class="text-[10px] text-[#ca7093] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
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
        <div class="relative w-full max-w-3xl h-full max-h-[95vh] md:max-h-[90vh] bg-surface-container border border-outline/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 overflow-hidden">
            <div class="p-4 md:p-6 border-b border-outline/10 flex items-center justify-between shrink-0 bg-surface-container">
                <div class="overflow-hidden"><h3 class="font-headline-md text-base md:text-lg font-bold uppercase tracking-tight text-on-surface truncate">Обращение ${lead.id}</h3><div class="text-[10px] text-primary uppercase mt-1 truncate font-label-caps tracking-widest font-bold">${lead.name || 'Клиент'}</div></div>
                <div class="flex items-center gap-1 md:gap-2 shrink-0">
                    <button id="delete-lead-drawer-btn" class="w-9 h-9 md:w-10 md:h-10 rounded-xl text-error hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md hover:shadow-error/10" title="Удалить обращение"><span class="material-symbols-outlined text-xl">delete</span></button>
                    <button id="close-lead-modal" class="w-9 h-9 md:w-10 md:h-10 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant"><span class="material-symbols-outlined text-xl">close</span></button>
                </div>
            </div>
            <div class="flex-1 flex flex-col overflow-hidden min-h-0 p-4 md:p-6 space-y-4">
                <div class="bg-surface-container-low border border-outline/5 rounded-2xl p-4 space-y-2 shrink-0"><div class="text-[10px] text-on-surface-variant opacity-60 font-mono font-label-caps uppercase tracking-widest">${new Date(lead.created_at).toLocaleString('ru-RU')}</div><div class="text-sm text-on-surface leading-relaxed italic line-clamp-3">"${lead.message || '...'}"</div></div>
                <div class="bg-surface-container-low rounded-3xl border border-outline/10 flex flex-col flex-1 min-h-0 overflow-hidden shadow-inner bg-background/50">
                    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-2 min-h-0">${renderMessages()}</div>
                    <div class="p-3 md:p-4 border-t border-outline/10 shrink-0 bg-surface-container/50">
                        <div class="flex gap-2 md:gap-3 items-end bg-surface-container p-2 rounded-2xl border border-outline/10 focus-within:border-primary/50">
                            <textarea id="chat-input" placeholder="Ответ..." rows="1" class="flex-1 bg-transparent border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-0 text-on-surface placeholder:opacity-30 resize-none min-h-[44px] max-h-32 font-body-md"></textarea>
                            <button id="send-msg-btn" class="shrink-0 w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg hover:bg-on-surface hover:text-surface transition-all"><span class="material-symbols-outlined">send</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // ── Supabase Realtime for admin chat ────────────────────────────────────
    const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
    let supabaseRT = null;
    let adminRealtimeChannel = null;

    try {
        const sb = window.supabase;
        if (sb && sb.createClient) {
            if (!window.supabaseClientGlobal) {
                window.supabaseClientGlobal = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            }
            supabaseRT = window.supabaseClientGlobal;
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
                            chatBox.style.background = 'rgba(202, 112, 147, 0.05)';
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
        modalWrapper.classList.remove('opacity-100');
        modalWrapper.querySelector('div.relative').classList.add('scale-95');
        setTimeout(() => modalWrapper.remove(), 300);
    };

    modalWrapper.querySelector('#close-lead-modal').onclick = close;
    modalWrapper.querySelector('#lead-modal-backdrop').onclick = close;

    const deleteBtn = modalWrapper.querySelector('#delete-lead-drawer-btn');
    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (await confirm(`Вы уверены, что хотите удалить это обращение ${lead.id}? Это действие необратимо.`)) {
                try {
                    await state.authenticatedFetch(`/api/admin/leads/${lead.id}`, {
                        method: 'DELETE'
                    });
                    close();
                    await state.fetchLeads();
                    window.showToast(`Обращение ${lead.id} успешно удалено`, 'success', 'Удаление обращения');
                } catch (err) {
                    alert('Ошибка при удалении: ' + err.message);
                }
            }
        };
    }

    requestAnimationFrame(() => { modalWrapper.classList.add('opacity-100'); modalWrapper.querySelector('div.relative').classList.remove('scale-95'); });

    const chatInput = modalWrapper.querySelector('#chat-input');
    if (chatInput) { chatInput.focus(); chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = Math.min(chatInput.scrollHeight, 128) + 'px'; }); }

    const sendMessage = async () => {
        const text = chatInput.value.trim(); if (!text) return;
        messages.push({ sender: 'admin', text, timestamp: new Date().toISOString() });
        chatInput.value = ''; chatInput.style.height = 'auto';
        const chatContainer = modalWrapper.querySelector('#chat-messages');
        chatContainer.innerHTML = renderMessages(); chatContainer.scrollTop = chatContainer.scrollHeight;
        try { await state.authenticatedFetch(`/api/admin/leads/${lead.id}`, { method: 'PUT', body: JSON.stringify({ messages }) }); } catch(e) { alert('Ошибка: ' + e.message); }
    };

    modalWrapper.querySelector('#send-msg-btn').onclick = sendMessage;
    if (chatInput) { chatInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }; }
    const chatBox = modalWrapper.querySelector('#chat-messages'); chatBox.scrollTop = chatBox.scrollHeight;
}
