/**
 * Renders the leads table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderLeadsView(container, state) {
    if (!container) return;

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

    const tableContainer = document.getElementById('leads-table-container');

    let currentType = '';
    let currentStatus = 'new';
    let sortKey = 'created_at';
    let sortOrder = 'desc';

    const loadLeads = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
            </div>
        `;
        try {
            const leads = await state.fetchLeads();
            renderLeadsWithFilters(tableContainer, leads, state, { currentType, currentStatus, sortKey, sortOrder, setFilters: (f) => {
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

    document.getElementById('refresh-leads-btn').onclick = loadLeads;
    
    // Subscribe to state updates
    state.on('leads:updated', (newLeads) => {
        renderLeadsWithFilters(tableContainer, newLeads, state, { currentType, currentStatus, sortKey, sortOrder, setFilters: (f) => {
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
        'logistics_request': 'Запрос логистики'
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
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'new' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="new">
                Новые <span class="${currentStatus === 'new' ? 'opacity-60' : 'text-[#ffb0cc]'} ml-1">${getStatusCount('new')}</span>
            </button>
            <button type="button" class="lead-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === '' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="">
                Все <span class="opacity-60 ml-1">${getStatusCount('')}</span>
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

    container.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-xs uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
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

                        return `
                        <tr class="group hover:bg-white/[0.04] transition-colors ${rowClass}">
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

    // Add sort listeners
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // Event listeners
    container.querySelectorAll('.lead-status-select').forEach(select => {
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
        btn.addEventListener('click', async () => {
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
