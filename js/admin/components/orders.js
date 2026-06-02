const selectedOrderIds = new Set();

function updateBulkOrdersToolbar(state) {
    let toolbar = document.getElementById('orders-bulk-toolbar');
    if (selectedOrderIds.size === 0) {
        if (toolbar) toolbar.remove();
        return;
    }

    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'orders-bulk-toolbar';
        document.body.appendChild(toolbar);
    }

    toolbar.innerHTML = `
        <div class="admin-bulk-bar fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-auto max-w-[600px] bg-surface-container-low/95 backdrop-blur-md border border-primary/20 px-3 py-3 md:px-6 md:py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center gap-3 md:gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div class="flex items-center justify-between md:justify-start gap-3 md:pr-6 md:border-r border-outline/10 shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                        ${selectedOrderIds.size}
                    </div>
                    <div class="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label-caps">Выбрано</div>
                </div>
                <button id="bulk-order-close-mobile" class="md:hidden p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
            
            <div class="flex items-center gap-2 md:gap-4 overflow-x-auto custom-scrollbar md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
                <button type="button" id="bulk-order-status-btn" class="flex items-center gap-2 bg-surface-container border border-primary/20 hover:border-primary/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary outline-none cursor-pointer hover:bg-on-surface/5 transition-all shadow-md shrink-0">
                    <span class="material-symbols-outlined text-primary text-sm">donut_large</span>
                    <span>Статус...</span>
                    <span class="material-symbols-outlined text-sm opacity-50 ml-1">expand_more</span>
                </button>
                
                <button type="button" id="bulk-order-delete-btn" class="flex items-center gap-2 px-4 py-2 hover:bg-error/10 border border-error/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-error shrink-0">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Удалить
                </button>
            </div>
            
            <button id="bulk-order-close-btn" class="hidden md:flex md:ml-4 p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant shrink-0" title="Снять выделение">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    `;

    const statusBtn = toolbar.querySelector('#bulk-order-status-btn');
    statusBtn.onclick = async () => {
        const status = await window.openStatusSelectModal(window.ORDER_STATUS_OPTIONS, null, 'Изменить статус выбранных заказов');
        if (!status) return;
        const ids = Array.from(selectedOrderIds);
        try {
            await Promise.all(ids.map(id => 
                state.authenticatedFetch(`/api/admin/orders/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status })
                })
            ));
            selectedOrderIds.clear();
            updateBulkOrdersToolbar(state);
            await state.fetchOrders();
            window.showToast(`Статус ${ids.length} заказов успешно обновлен на "${status}"`, 'success', 'Массовое обновление');
        } catch (err) {
            alert('Ошибка при массовом обновлении: ' + err.message);
        }
    };

    const deleteBtn = toolbar.querySelector('#bulk-order-delete-btn');
    deleteBtn.onclick = async () => {
        if (await confirm(`Вы уверены, что хотите удалить выбранные заказы (${selectedOrderIds.size})?`)) {
            const ids = Array.from(selectedOrderIds);
            try {
                await Promise.all(ids.map(id => 
                    state.authenticatedFetch(`/api/admin/orders/${id}`, {
                        method: 'DELETE'
                    })
                ));
                selectedOrderIds.clear();
                updateBulkOrdersToolbar(state);
                await state.fetchOrders();
                window.showToast(`Успешно удалено заказов: ${ids.length}`, 'success', 'Массовое удаление');
            } catch (err) {
                alert('Ошибка при массовом удалении: ' + err.message);
            }
        }
    };

    const closeBtn = toolbar.querySelector('#bulk-order-close-btn');
    closeBtn.onclick = () => {
        selectedOrderIds.clear();
        updateBulkOrdersToolbar(state);
        document.querySelectorAll('.order-select-cell').forEach(cell => {
            const block = cell.querySelector('.order-select-block');
            if (block) block.className = "order-select-block w-6 h-6 rounded border flex items-center justify-center transition-all cursor-pointer border-white/20 bg-black/40 text-transparent";
        });
        const selectAll = document.getElementById('orders-select-all');
        if (selectAll) selectAll.className = "w-6 h-6 rounded border flex items-center justify-center transition-all cursor-pointer border-white/20 bg-black/40 text-transparent";
    };
    const closeBtnMobile = toolbar.querySelector('#bulk-order-close-mobile');
    if (closeBtnMobile) closeBtnMobile.onclick = () => closeBtn.onclick();
}

/**
 * Renders the orders table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderOrdersView(container, state) {
    if (!container) return;

    const oldToolbar = document.getElementById('orders-bulk-toolbar');
    if (oldToolbar) oldToolbar.remove();
    selectedOrderIds.clear();

    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-headline-md tracking-tight text-on-surface">Управление заказами</h3>
                    <p class="text-sm text-on-surface-variant mt-1">Обработка поступающих заказов и статусов оплаты</p>
                </div>
                <button type="button" id="refresh-orders-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-surface-container text-primary rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all border border-outline/5 shadow-lg">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <div class="liquid-glass rounded-3xl overflow-hidden min-h-[400px]" id="orders-table-container">
                <div class="flex items-center justify-center h-[400px]">
                    <div class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('orders-table-container');
    
    // Initial filters - ensure defaults are set and 'All' tab is active
    let currentStatus = '';
    let sortKey = 'created_at';
    let sortOrder = 'desc';

    const loadOrders = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
        `;
        try {
            const orders = await state.fetchOrders();
            renderOrdersWithFilters(tableContainer, orders, state, { 
                currentStatus, 
                sortKey, 
                sortOrder, 
                setFilters: (f) => {
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

    document.getElementById('refresh-orders-btn').onclick = loadOrders;
    
    // Subscribe to state updates
    state.on('orders:updated', (newOrders) => {
        renderOrdersWithFilters(tableContainer, newOrders, state, { currentStatus, sortKey, sortOrder, setFilters: (f) => {
            if (f.currentStatus !== undefined) currentStatus = f.currentStatus;
            if (f.sortKey !== undefined) sortKey = f.sortKey;
            if (f.sortOrder !== undefined) sortOrder = f.sortOrder;
        }});
    });

    // Initial load
    await loadOrders();
}

function renderOrdersWithFilters(container, orders, state, filterOptions = {}) {
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-[400px] text-on-surface-variant opacity-75">
                <span class="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                <div class="font-label-caps uppercase tracking-widest text-on-surface">Заказов пока нет</div>
            </div>
        `;
        return;
    }

    let { currentStatus, sortKey, sortOrder, setFilters } = filterOptions;

    const getStatusCount = (status) => {
        if (!status) return orders.length;
        const s = status.toLowerCase().trim();
        return orders.filter(o => {
            const os = (o.status || 'new').toLowerCase().trim();
            if (s === 'new') return os === 'new' || os === 'новый' || os === 'pending';
            return os === s;
        }).length;
    };

    container.innerHTML = `
        <!-- Tabs Navigation for Order Statuses -->
        <div class="flex gap-2 p-4 border-b border-outline/10 bg-surface-container overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2">
                <span class="material-symbols-outlined text-primary text-sm">donut_large</span>
                <span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold font-label-caps">Статус:</span>
            </div>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === '' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="">
                Все <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === '' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'new' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="new">
                Новые <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'new' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('new')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'processing' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="processing">
                В обработке <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'processing' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('processing')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'completed' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="completed">
                Завершены <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'completed' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('completed')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${currentStatus === 'cancelled' ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}" data-status="cancelled">
                Отменены <span class="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStatus === 'cancelled' ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}">${getStatusCount('cancelled')}</span>
            </button>
        </div>

        <div id="orders-table-content"></div>
    `;

    const contentContainer = container.querySelector('#orders-table-content');

    const updateTable = () => {
        const statusPriority = {
            'new': 1,
            'pending': 1,
            'новый': 1,
            'processing': 2,
            'completed': 3,
            'cancelled': 4
        };

        const sortedOrders = [...orders].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'status') {
                valA = statusPriority[valA] || 99;
                valB = statusPriority[valB] || 99;
            } else if (sortKey === 'created_at') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else if (sortKey === 'total') {
                valA = Number(valA);
                valB = Number(valB);
            } else if (sortKey === 'customer_name') {
                valA = (valA || '').toLowerCase();
                valB = (valB || '').toLowerCase();
            } else if (sortKey === 'id') {
                valA = Number(valA);
                valB = Number(valB);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        const filtered = sortedOrders.filter(o => {
            const os = (o.status || 'new').toLowerCase().trim();
            const fs = (currentStatus || '').toLowerCase().trim();
            if (!fs) return true;
            if (fs === 'new') return os === 'new' || os === 'новый' || os === 'pending';
            return os === fs;
        });

        renderOrdersTable(contentContainer, filtered, state, { sortKey, sortOrder, onSort: (key) => {
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

        container.querySelectorAll('.order-status-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            if (typeof window.cancelAllBulkActions === 'function') {
                window.cancelAllBulkActions();
            }
            currentStatus = btn.dataset.status;
            if (setFilters) setFilters({ currentStatus });            container.querySelectorAll('.order-status-tab').forEach(b => {
                b.className = `order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-label-caps transition-all shrink-0 ${b.dataset.status === currentStatus ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'}`;
            });
            updateTable();
        });
    });

    updateTable();
}

function renderOrdersTable(container, orders, state, sortOptions = {}) {
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="p-16 text-center text-on-surface-variant opacity-70 text-base font-label-caps uppercase tracking-widest">Ничего не найдено</div>
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

    const allChecked = orders.length > 0 && orders.every(o => selectedOrderIds.has(o.id));

    container.innerHTML = `
        <div class="hidden md:block overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                        <th class="py-4 px-4 w-12 text-center">
                            <div id="orders-select-all" class="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent hover:border-outline/40'}">
                                <span class="material-symbols-outlined text-[14px] font-bold">done_all</span>
                            </div>
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="id">ID ${getSortIcon('id')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="customer_name">Клиент ${getSortIcon('customer_name')}</th>
                        <th class="py-4 px-6 font-bold">Товары</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="total">Сумма ${getSortIcon('total')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="created_at">Дата ${getSortIcon('created_at')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="status">Статус ${getSortIcon('status')}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${orders.map(order => {
                        const items = order.order_items || [];
                        const msgCount = Array.isArray(order.messages) ? order.messages.length : 0;
                        let status = (order.status || 'new').toLowerCase().trim();
                        if (status === 'pending' || status === 'новый') status = 'new';
                        
                        const statusClasses = {
                            'new': 'bg-blue-500/5 border-l-4 border-l-blue-500/50',
                            'processing': 'bg-yellow-500/5 border-l-4 border-l-yellow-500/50',
                            'completed': 'bg-green-500/5 border-l-4 border-l-green-500/50',
                            'cancelled': 'bg-red-500/5 border-l-4 border-l-red-500/50'
                        };
                        const rowClass = statusClasses[status] || '';

                        const selectClasses = {
                            'new': 'text-blue-400 border-blue-500/30',
                            'processing': 'text-yellow-400 border-yellow-500/30',
                            'completed': 'text-green-400 border-green-500/30',
                            'cancelled': 'text-red-400 border-red-500/30'
                        };
                        const selectClass = selectClasses[status] || 'text-[#d7c1c7] border-[#534347]/30';
                        const isSelected = selectedOrderIds.has(order.id);

                        return `
                        <tr class="group hover:bg-on-surface/[0.04] transition-colors cursor-pointer order-row ${rowClass}" data-id="${order.id}">
                            <td class="py-4 px-4 w-12 text-center order-select-cell" data-id="${order.id}">
                                <div class="order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${isSelected ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent group-hover:border-outline/40'}">
                                    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-xs font-mono text-on-surface-variant">${order.id}</div>
                                ${msgCount > 0 ? `<div class="flex items-center gap-1 mt-1"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span><span class="text-[9px] text-primary font-bold uppercase tracking-widest font-label-caps">${msgCount} сообщ.</span></div>` : ''}
                            </td>
                            <td class="py-5 px-6">
                                <div class="font-bold text-base uppercase text-on-surface tracking-tight">${order.customer_name || 'Не указано'}</div>
                                <div class="text-sm text-primary font-mono font-medium mt-1 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">call</span>
                                    ${order.customer_phone || 'Телефон не указан'}
                                </div>
                                ${order.customer_email ? `<div class="text-sm text-on-surface-variant font-mono mt-0.5 flex items-center gap-1.5 select-all"><span class="material-symbols-outlined text-sm">mail</span>${order.customer_email}</div>` : ''}
                                ${order.customer_inn ? `<div class="text-xs text-primary/80 font-mono mt-1 bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg inline-block uppercase tracking-wider font-bold">ИНН: ${order.customer_inn}</div>` : ''}
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex flex-col gap-1.5 min-w-[250px]">
                                    ${items.map(i => {
                                        const hasId = i.product_id;
                                        const clickAttr = hasId ? `onclick="event.stopPropagation(); window.openProductCardModal('${i.product_id}')"` : '';
                                        const hoverClass = hasId ? 'hover:text-primary cursor-pointer' : '';
                                        return `
                                            <div ${clickAttr} class="flex items-center justify-between gap-3 text-[11px] leading-tight group/item ${hoverClass}">
                                                <span class="text-on-surface font-medium group-hover/item:text-primary transition-colors">• ${i.product_name || i.name}</span>
                                                <span class="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold shrink-0 font-label-caps text-[9px]">x${i.quantity}</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-primary font-bold font-display-xl text-sm">${Number(order.total).toLocaleString()} ₽</div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-xs text-on-surface font-medium">${new Date(order.created_at).toLocaleDateString()}</div>
                                <div class="text-[9px] opacity-30 uppercase mt-0.5 text-on-surface-variant font-label-caps">${new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                     ${(() => {
                                        const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: 'var(--color-primary)', icon: 'donut_large' };
                                        return `<button type="button" data-id="${order.id}" data-status="${status}" class="status-modal-btn flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline/10 hover:border-outline/20 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0 font-label-caps" style="border-left: 4px solid ${statusObj.color};">
                                            <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                                                <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon}</span>
                                                <span class="truncate">${statusObj.label}</span>
                                            </span>
                                            <span class="material-symbols-outlined text-xs text-on-surface-variant opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                                        </button>`;
                                    })()}
                                    <button type="button" data-id="${order.id}" class="delete-order-btn p-2 rounded-xl text-error hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-error/10" title="Удалить заказ">
                                        <span class="material-symbols-outlined text-base transition-transform duration-300 group-hover/btn:-rotate-12">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
                <!-- Spreadsheet footer aggregates -->
                <tfoot class="border-t-2 border-primary/20 bg-surface-container-low/50 text-xs font-bold text-on-surface select-none">
                    <tr class="divide-x divide-outline/5">
                        <td class="py-4 px-4"></td>
                        <td class="py-4 px-6 text-[10px] uppercase font-bold text-on-surface-variant opacity-60">Итого:</td>
                        <td class="py-4 px-6"></td>
                        <td class="py-4 px-6">
                            <div class="text-[10px] text-on-surface-variant font-medium">КОЛИЧЕСТВО: <span id="order-stats-count" class="font-bold text-on-surface">0</span></div>
                        </td>
                        <td class="py-4 px-6">
                            <div class="text-[10px] text-on-surface-variant font-medium">СУММА: <span id="order-stats-sum" class="font-bold text-primary">0 ₽</span></div>
                            <div class="text-[10px] text-on-surface-variant font-medium mt-1">СРЕДНИЙ ЧЕК: <span id="order-stats-avg" class="font-bold text-primary">0 ₽</span></div>
                        </td>
                        <td class="py-4 px-6">
                            <div class="text-[10px] text-on-surface-variant font-medium">МИН: <span id="order-stats-min" class="font-bold text-on-surface">0 ₽</span></div>
                            <div class="text-[10px] text-on-surface-variant font-medium mt-1">МАКС: <span id="order-stats-max" class="font-bold text-on-surface">0 ₽</span></div>
                        </td>
                        <td class="py-4 px-6 text-right">
                            <div class="flex items-center justify-end gap-1 px-1 py-0.5 bg-surface-container border border-outline/10 rounded-xl w-max ml-auto shadow-inner">
                                <button type="button" id="order-stats-all-btn" class="order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary">Все</button>
                                <button type="button" id="order-stats-sel-btn" class="order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant">Выбр.</button>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="grid grid-cols-1 gap-4 md:hidden p-4">
            ${orders.map(order => {
                const isSelected = selectedOrderIds.has(order.id);
                const items = order.order_items || [];
                const msgCount = Array.isArray(order.messages) ? order.messages.length : 0;
                let status = (order.status || 'new').toLowerCase().trim();
                if (status === 'pending' || status === 'новый') status = 'new';
                
                const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: 'var(--color-primary)', icon: 'donut_large' };
                
                return `
                <div class="order-row bg-surface-container rounded-2xl p-4 border border-outline/5 shadow-md cursor-pointer flex flex-col gap-3" data-id="${order.id}">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="order-select-cell p-1 cursor-pointer" data-id="${order.id}">
                                <div class="order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}">
                                    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                            </div>
                            <div>
                                <div class="text-xs font-mono text-on-surface-variant">${order.id}</div>
                                <div class="font-bold text-on-surface uppercase tracking-tight">${order.customer_name || 'Не указано'}</div>
                            </div>
                        </div>
                        <button type="button" data-id="${order.id}" class="delete-order-btn p-2 rounded-xl text-error hover:text-white hover:bg-error transition-all duration-300 flex items-center justify-center" title="Удалить заказ">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                    
                    <div class="text-xs text-primary font-mono font-medium flex items-center gap-1.5 select-all">
                        <span class="material-symbols-outlined text-sm">call</span>
                        ${order.customer_phone || 'Телефон не указан'}
                    </div>
                    ${order.customer_email ? `<div class="text-xs text-on-surface-variant font-mono flex items-center gap-1.5 select-all"><span class="material-symbols-outlined text-sm">mail</span>${order.customer_email}</div>` : ''}
                    
                    <div class="flex flex-col gap-1 border-t border-outline/5 pt-2">
                        ${items.map(i => {
                            const hasId = i.product_id;
                            const clickAttr = hasId ? `onclick="event.stopPropagation(); window.openProductCardModal('${i.product_id}')"` : '';
                            const hoverClass = hasId ? 'hover:text-primary cursor-pointer' : '';
                            return `
                                <div ${clickAttr} class="flex items-center justify-between gap-3 text-[11px] leading-tight group/item ${hoverClass} select-none">
                                    <span class="text-on-surface font-medium group-hover/item:text-primary transition-colors">• ${i.product_name || i.name}</span>
                                    <span class="px-2 py-0.5 bg-primary/10 text-primary rounded-md font-bold shrink-0 font-label-caps text-[9px]">x${i.quantity}</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="flex justify-between items-center border-t border-outline/5 pt-2">
                        <div class="text-primary font-bold font-display-xl text-base">${Number(order.total).toLocaleString()} ₽</div>
                        <div onclick="event.stopPropagation()">
                            <button type="button" data-id="${order.id}" data-status="${status}" class="status-modal-btn flex items-center justify-between gap-1.5 bg-surface-container-lowest border border-outline/10 hover:border-outline/20 rounded-xl px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all shadow-md font-label-caps" style="border-left: 3px solid ${statusObj.color};">
                                <span class="flex items-center gap-1 truncate" style="color: ${statusObj.color};">
                                    <span class="material-symbols-outlined text-xs shrink-0">${statusObj.icon}</span>
                                    <span class="truncate">${statusObj.label}</span>
                                </span>
                                <span class="material-symbols-outlined text-[10px] text-on-surface-variant opacity-45 shrink-0">expand_more</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center text-[10px] text-on-surface-variant opacity-60">
                        <div>${new Date(order.created_at).toLocaleDateString()} ${new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        ${msgCount > 0 ? `<div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span><span class="text-[9px] text-primary font-bold uppercase tracking-widest font-label-caps">${msgCount} сообщ.</span></div>` : ''}
                    </div>
                </div>
                `;
            }).join('')}
            
            <!-- Mobile stats view -->
            <div class="mt-4 p-5 bg-surface-container rounded-3xl border border-outline/10 space-y-4 select-none">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60 font-bold">Статистика:</span>
                    <div class="flex items-center gap-1 bg-surface-container-low border border-outline/10 rounded-xl p-1 shadow-inner">
                        <button type="button" id="order-stats-all-btn-mobile" class="order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary">Все</button>
                        <button type="button" id="order-stats-sel-btn-mobile" class="order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant">Выбр.</button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-[10px] uppercase font-bold text-on-surface-variant">
                    <div>Заказов: <span id="order-stats-count-mobile" class="text-on-surface">0</span></div>
                    <div>Сумма: <span id="order-stats-sum-mobile" class="text-primary">0 ₽</span></div>
                    <div>Средний чек: <span id="order-stats-avg-mobile" class="text-primary">0 ₽</span></div>
                    <div>Мин / Макс: <span id="order-stats-range-mobile" class="text-on-surface">0 / 0 ₽</span></div>
                </div>
            </div>
        </div>
    `;

    // Highlight updater, statistics updater, and range select
    const updateOrderRowHighlights = () => {
        container.querySelectorAll('.order-row').forEach(row => {
            const id = Number(row.dataset.id);
            const isSelected = selectedOrderIds.has(id);
            if (isSelected) {
                row.classList.add('bg-[#964551]/10', 'hover:bg-[#964551]/15');
            } else {
                row.classList.remove('bg-[#964551]/10', 'hover:bg-[#964551]/15');
            }
        });
    };
    updateOrderRowHighlights();

    let statsMode = 'all';
    const updateOrderStatistics = () => {
        const statsAllBtn = container.querySelector('#order-stats-all-btn');
        const statsSelBtn = container.querySelector('#order-stats-sel-btn');
        const statsAllBtnMobile = container.querySelector('#order-stats-all-btn-mobile');
        const statsSelBtnMobile = container.querySelector('#order-stats-sel-btn-mobile');

        if (statsSelBtn) statsSelBtn.textContent = `Выбр. (${selectedOrderIds.size})`;
        if (statsSelBtnMobile) statsSelBtnMobile.textContent = `Выбр. (${selectedOrderIds.size})`;

        let targets = [];
        if (statsMode === 'all') {
            targets = [...orders];
        } else {
            targets = orders.filter(o => selectedOrderIds.has(o.id));
        }

        const count = targets.length;
        const values = targets.map(o => Number(o.total || 0));
        const sum = values.reduce((acc, v) => acc + v, 0);
        const avg = count > 0 ? Math.round(sum / count) : 0;
        const min = values.length > 0 ? Math.min(...values) : 0;
        const max = values.length > 0 ? Math.max(...values) : 0;

        const elCount = container.querySelector('#order-stats-count');
        const elSum = container.querySelector('#order-stats-sum');
        const elAvg = container.querySelector('#order-stats-avg');
        const elMin = container.querySelector('#order-stats-min');
        const elMax = container.querySelector('#order-stats-max');
        if (elCount) elCount.textContent = count;
        if (elSum) elSum.textContent = sum.toLocaleString() + ' ₽';
        if (elAvg) elAvg.textContent = avg.toLocaleString() + ' ₽';
        if (elMin) elMin.textContent = min.toLocaleString() + ' ₽';
        if (elMax) elMax.textContent = max.toLocaleString() + ' ₽';

        const elCountMobile = container.querySelector('#order-stats-count-mobile');
        const elSumMobile = container.querySelector('#order-stats-sum-mobile');
        const elAvgMobile = container.querySelector('#order-stats-avg-mobile');
        const elRangeMobile = container.querySelector('#order-stats-range-mobile');
        if (elCountMobile) elCountMobile.textContent = count;
        if (elSumMobile) elSumMobile.textContent = sum.toLocaleString() + ' ₽';
        if (elAvgMobile) elAvgMobile.textContent = avg.toLocaleString() + ' ₽';
        if (elRangeMobile) elRangeMobile.textContent = `${min.toLocaleString()} / ${max.toLocaleString()} ₽`;

        const activeClass = 'order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all bg-primary text-on-primary shadow-sm';
        const inactiveClass = 'order-stats-apply-btn px-2.5 py-1.5 rounded-lg text-[8px] uppercase tracking-wider font-bold transition-all text-on-surface-variant hover:text-primary';
        
        if (statsAllBtn) statsAllBtn.className = statsMode === 'all' ? activeClass : inactiveClass;
        if (statsSelBtn) statsSelBtn.className = statsMode === 'selected' ? activeClass : inactiveClass;
        if (statsAllBtnMobile) statsAllBtnMobile.className = statsMode === 'all' ? activeClass : inactiveClass;
        if (statsSelBtnMobile) statsSelBtnMobile.className = statsMode === 'selected' ? activeClass : inactiveClass;
    };
    updateOrderStatistics();

    container.querySelectorAll('#order-stats-all-btn, #order-stats-all-btn-mobile').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            statsMode = 'all';
            updateOrderStatistics();
        };
    });
    container.querySelectorAll('#order-stats-sel-btn, #order-stats-sel-btn-mobile').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            statsMode = 'selected';
            updateOrderStatistics();
        };
    });

    let lastChecked = null;
    const handleOrderSelectClick = (clickedId, event) => {
        const clickedCell = event.target?.closest?.('.order-select-cell')
            || container.querySelector(`.order-select-cell[data-id="${clickedId}"]`);
        if (!clickedCell) return;

        const isRangeSelect = event.shiftKey || event.ctrlKey;
        const targetState = selectedOrderIds.has(clickedId);

        if (isRangeSelect && lastChecked) {
            const scope = clickedCell.closest('table') || clickedCell.closest('.md\\:hidden') || container;
            const cells = Array.from(scope.querySelectorAll('.order-select-cell'));
            const start = cells.findIndex(c => Number(c.dataset.id) === clickedId);
            const end = cells.findIndex(c => Number(c.dataset.id) === Number(lastChecked.dataset.id));

            if (start !== -1 && end !== -1) {
                const min = Math.min(start, end);
                const max = Math.max(start, end);

                for (let i = min; i <= max; i++) {
                    const targetCell = cells[i];
                    const targetId = Number(targetCell.dataset.id);
                    const block = targetCell.querySelector('.order-select-block');
                    if (targetState) {
                        selectedOrderIds.add(targetId);
                        if (block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
                    } else {
                        selectedOrderIds.delete(targetId);
                        if (block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent group-hover:border-outline/40";
                    }
                }
            }
        }
        
        lastChecked = clickedCell;
    };

    // Handle row selections
    container.querySelectorAll('.order-select-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(cell.dataset.id);
            const block = cell.querySelector('.order-select-block');
            const isChecked = !selectedOrderIds.has(id);
            
            if (isChecked) {
                selectedOrderIds.add(id);
                block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
            } else {
                selectedOrderIds.delete(id);
                block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent group-hover:border-outline/40";
            }
            
            handleOrderSelectClick(id, e);
            updateBulkOrdersToolbar(state);
            updateOrderRowHighlights();
            updateOrderStatistics();

            // Update master check
            const selectAll = container.querySelector('#orders-select-all');
            if (selectAll) {
                const allVisibleCells = container.querySelectorAll('.order-select-cell');
                const allChecked = Array.from(allVisibleCells).every(c => selectedOrderIds.has(Number(c.dataset.id)));
                selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            }
        });
    });

    const selectAll = container.querySelector('#orders-select-all');
    if (selectAll) {
        selectAll.onclick = e => {
            e.stopPropagation();
            const allVisibleCells = container.querySelectorAll('.order-select-cell');
            const currentlyAllChecked = Array.from(allVisibleCells).every(c => selectedOrderIds.has(Number(c.dataset.id)));
            const willBeChecked = !currentlyAllChecked;
            
            allVisibleCells.forEach(cell => {
                const id = Number(cell.dataset.id);
                const block = cell.querySelector('.order-select-block');
                if (willBeChecked) {
                    selectedOrderIds.add(id);
                    if(block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
                } else {
                    selectedOrderIds.delete(id);
                    if(block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent group-hover:border-outline/40";
                }
            });
            
            selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${willBeChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            updateBulkOrdersToolbar(state);
            updateOrderRowHighlights();
            updateOrderStatistics();
        };
    }

    // Add sort listeners
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // Event listeners
    container.querySelectorAll('.order-row').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.order-select-cell') || e.target.closest('button')) return;
            
            const isRangeSelect = e.shiftKey || e.ctrlKey;
            if (isRangeSelect) {
                e.stopPropagation();
                e.preventDefault();
                const id = Number(row.dataset.id);
                const block = row.querySelector('.order-select-block');
                const isChecked = !selectedOrderIds.has(id);
                
                if (isChecked) {
                    selectedOrderIds.add(id);
                    if (block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary";
                } else {
                    selectedOrderIds.delete(id);
                    if (block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent group-hover:border-outline/40";
                }
                
                handleOrderSelectClick(id, e);
                updateBulkOrdersToolbar(state);
                updateOrderRowHighlights();
                updateOrderStatistics();

                const selectAllVal = container.querySelector('#orders-select-all');
                if (selectAllVal) {
                    const allVisibleCells = container.querySelectorAll('.order-select-cell');
                    const allChecked = Array.from(allVisibleCells).every(c => selectedOrderIds.has(Number(c.dataset.id)));
                    selectAllVal.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
                }
            } else {
                openOrderDrawer(row.dataset.id, state);
            }
        });
    });

    container.querySelectorAll('.status-modal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const currentStatus = btn.dataset.status;
            const newStatus = await window.openStatusSelectModal(window.ORDER_STATUS_OPTIONS, currentStatus, `Изменение статуса заказа ${id}`);
            if (!newStatus || newStatus === currentStatus) return;
            
            try {
                await state.authenticatedFetch(`/api/admin/orders/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                
                state.updateOrderLocal(id, { status: newStatus });
                window.showToast(`Статус заказа ${id} изменен на "${newStatus}"`, 'success', 'Обновление статуса');
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        });
    });

    // Delete individual order button
    container.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (await confirm(`Вы уверены, что хотите удалить заказ ${id}? Это действие необратимо.`)) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    await state.authenticatedFetch(`/api/admin/orders/${id}`, {
                        method: 'DELETE'
                    });
                    await state.fetchOrders();
                    window.showToast(`Заказ ${id} успешно удален`, 'success', 'Удаление заказа');
                } catch (err) {
                    alert('Ошибка при удалении заказа: ' + err.message);
                    if (icon) icon.textContent = 'delete';
                    btn.disabled = false;
                }
            }
        });
    });
}

async function openOrderDrawer(orderId, state) {
    if (typeof window.cancelAllBulkActions === 'function') {
        window.cancelAllBulkActions();
    }
    try { await state.fetchOrders(); } catch(e) { console.error(e); }
    const order = state.orders.find(o => String(o.id) === String(orderId));
    if (!order) return;

    let messages = [];
    try {
        if (typeof order.messages === 'string') messages = JSON.parse(order.messages);
        else if (Array.isArray(order.messages)) messages = order.messages;
    } catch(e) {}

    let modalWrapper = document.getElementById('admin-order-modal');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-order-modal';
        modalWrapper.className = 'fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);
    }

    const renderMessages = () => messages.map(m => {
        const isAdmin = m.sender === 'admin';
        const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

        if (isAdmin) {
            return `
                <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-[#964551] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                            ${m.text.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div class="text-[10px] text-on-surface-variant opacity-70 font-mono mt-1.5 flex items-center gap-1 mr-1">
                        <span class="material-symbols-outlined text-[12px] text-[#964551]">done_all</span>
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
                    <div class="text-[10px] text-[#964551] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
                        <span class="material-symbols-outlined text-[12px]">person</span>
                        Клиент • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        }
    }).join('');

    modalWrapper.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" id="order-modal-backdrop"></div>
        <div class="relative w-full sm:max-w-3xl h-[92vh] sm:max-h-[90vh] bg-surface-container border border-outline/30 rounded-t-[2rem] sm:rounded-3xl shadow-2xl flex flex-col transform translate-y-full sm:translate-y-0 sm:scale-95 transition-transform duration-300 min-h-0">
            <div class="p-4 sm:p-6 border-b border-outline/10 flex items-center justify-between shrink-0 bg-surface-container rounded-t-[2rem] sm:rounded-t-3xl">
                <div>
                    <h3 class="font-headline-md text-lg font-bold uppercase tracking-tight text-on-surface">Заказ ${order.id}</h3>
                    <div class="text-[10px] text-primary uppercase font-label-caps tracking-widest mt-1">${order.customer_name || 'Клиент'}</div>
                </div>
                <button id="close-order-modal" class="w-10 h-10 rounded-full hover:bg-surface-variant flex items-center justify-center transition-colors text-on-surface-variant">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0">
                <div class="space-y-4">
                    <div class="flex items-center justify-between border-b border-outline/10 pb-2">
                        <h4 class="text-[10px] uppercase tracking-widest text-primary font-bold font-label-caps">Состав заказа</h4>
                        <span class="text-xs font-bold text-primary font-mono">${Number(order.total || 0).toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div class="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                        ${order.order_items && order.order_items.length > 0 ? order.order_items.map(item => {
                            const hasId = item.product_id;
                            const clickAttr = hasId ? `onclick="window.openProductCardModal('${item.product_id}')"` : '';
                            const hoverClass = hasId ? 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all' : '';
                            
                            return `
                                <div ${clickAttr} class="flex justify-between items-center p-4 bg-surface-container-lowest border border-outline/10 rounded-2xl ${hoverClass} group/item select-none">
                                    <div class="flex-1">
                                        <span class="text-sm font-bold text-on-surface uppercase transition-colors ${hasId ? 'group-hover/item:text-primary' : ''}">${item.product_name || item.name || 'Товар'}</span>
                                        <p class="text-[10px] text-on-surface-variant mt-1 opacity-60">${item.quantity} шт × ${Number(item.price || 0).toLocaleString('ru-RU')} ₽</p>
                                    </div>
                                    <p class="text-sm font-bold text-on-surface">${(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('ru-RU')} ₽</p>
                                </div>
                            `;
                        }).join('') : `<div class="py-6 px-4 border border-dashed border-outline/20 rounded-2xl text-center text-on-surface-variant text-xs opacity-40 uppercase tracking-widest font-label-caps">Детализация недоступна</div>`}
                    </div>
                </div>

                <div class="space-y-4">
                    <h4 class="text-[10px] uppercase tracking-widest text-primary font-bold font-label-caps">Документы по заказу</h4>
                    <div class="space-y-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] uppercase tracking-wider text-on-surface-variant opacity-60">Коммерческое предложение (PDF)</label>
                            <div class="flex gap-2 items-center">
                                <input type="text" id="kp-url-input" value="${order.kp_url || ''}" placeholder="Ссылка на КП..." class="flex-grow bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface" ${order.kp_url ? 'readonly' : ''}>
                                <button type="button" class="upload-file-btn p-3 rounded-xl bg-surface-variant hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline/10 shadow-sm shrink-0" data-target="kp-url-input" title="Загрузить PDF-файл">
                                    <span class="material-symbols-outlined text-lg">attach_file</span>
                                </button>
                                ${order.kp_url ? `
                                <button type="button" class="delete-doc-btn p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center border border-red-500/20 shadow-sm shrink-0" data-doc="kp_url" title="Удалить">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] uppercase tracking-wider text-on-surface-variant opacity-60">Счет на оплату (PDF)</label>
                            <div class="flex gap-2 items-center">
                                <input type="text" id="invoice-url-input" value="${order.invoice_url || ''}" placeholder="Ссылка на счет..." class="flex-grow bg-surface-container-lowest border border-outline/20 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all text-sm text-on-surface" ${order.invoice_url ? 'readonly' : ''}>
                                <button type="button" class="upload-file-btn p-3 rounded-xl bg-surface-variant hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-all flex items-center justify-center border border-outline/10 shadow-sm shrink-0" data-target="invoice-url-input" title="Загрузить PDF-файл">
                                    <span class="material-symbols-outlined text-lg">attach_file</span>
                                </button>
                                ${order.invoice_url ? `
                                <button type="button" class="delete-doc-btn p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center border border-red-500/20 shadow-sm shrink-0" data-doc="invoice_url" title="Удалить">
                                    <span class="material-symbols-outlined text-lg">delete</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-surface-variant/50 px-6 py-3.5 border border-outline/5 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                <span class="material-symbols-outlined text-base">forum</span>
                            </div>
                            <div>
                                <div class="text-xs font-bold text-on-surface uppercase tracking-tight">Чат с клиентом</div>
                                <div class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest mt-0.5">${order.customer_phone || 'Нет телефона'}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold font-label-caps">Realtime Sync</span>
                            <span id="chat-realtime-dot" class="flex items-center gap-1.5 text-[9px] text-green-400 uppercase tracking-widest font-bold opacity-70 font-label-caps">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live
                            </span>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest rounded-3xl border border-outline/10 flex flex-col h-[380px] shadow-2xl overflow-hidden">
                        <div id="chat-messages" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            ${messages.length ? renderMessages() : '<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-label-caps text-on-surface">Нет сообщений</span></div>'}
                        </div>
                        <div class="p-4 border-t border-outline/10 flex gap-3 shrink-0 bg-surface-container/50 items-center">
                            <input type="text" id="chat-input" placeholder="Написать клиенту..." class="flex-1 bg-surface-container-lowest border border-outline/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-primary transition-all text-on-surface placeholder:opacity-40 shadow-inner">
                            <button id="send-msg-btn" class="w-12 h-12 flex items-center justify-center rounded-2xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface transition-all shrink-0 shadow-lg shadow-primary/20">
                                <span class="material-symbols-outlined text-base">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <input type="file" id="global-pdf-uploader" accept="application/pdf" class="hidden">
    `;

    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        const c = modalWrapper.querySelector('div.relative');
        if (c) { c.classList.remove('translate-y-full', 'scale-95'); c.classList.add('translate-y-0', 'scale-100'); }
    });

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
                .channel(`admin-order-chat-${orderId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `id=eq.${orderId}`
                }, (payload) => {
                    const newMsgs = payload.new.messages;
                    if (!newMsgs) return;
                    let updated = [];
                    try { updated = typeof newMsgs === 'string' ? JSON.parse(newMsgs) : newMsgs; } catch(e) { return; }
                    if (updated.length > messages.length) {
                        messages = updated;
                        order.messages = messages;
                        const chatBox = modalWrapper.querySelector('#chat-messages');
                        if (chatBox) {
                            chatBox.innerHTML = renderMessages();
                            chatBox.scrollTop = chatBox.scrollHeight;
                            chatBox.style.transition = 'background 0.3s';
                            chatBox.style.background = 'rgba(150, 69, 81,0.05)';
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
        const c = modalWrapper.querySelector('div.relative');
        if (c) { c.classList.remove('translate-y-0', 'scale-100'); c.classList.add('translate-y-full', 'sm:translate-y-0', 'scale-95'); }
        setTimeout(() => modalWrapper.remove(), 300);
    };

    modalWrapper.querySelector('#close-order-modal').onclick = close;
    modalWrapper.querySelector('#order-modal-backdrop').onclick = close;

    // File upload logic
    const hiddenFileInput = modalWrapper.querySelector('#global-pdf-uploader');
    let currentUploadTargetInputId = null;

    modalWrapper.querySelectorAll('.upload-file-btn').forEach(btn => {
        btn.onclick = () => {
            currentUploadTargetInputId = btn.dataset.target;
            if (hiddenFileInput) hiddenFileInput.click();
        };
    });

    if (hiddenFileInput) {
        hiddenFileInput.onchange = async () => {
            const file = hiddenFileInput.files[0];
            if (!file) return;
            
            const targetInput = modalWrapper.querySelector(`#${currentUploadTargetInputId}`);
            if (!targetInput) return;

            // Show loading state on target button
            const btn = modalWrapper.querySelector(`.upload-file-btn[data-target="${currentUploadTargetInputId}"]`);
            const originalIcon = btn ? btn.innerHTML : '<span class="material-symbols-outlined text-lg">attach_file</span>';
            if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>';

            try {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const res = await state.authenticatedFetch('/api/admin/upload-file', {
                            method: 'POST',
                            body: JSON.stringify({
                                fileName: file.name,
                                fileData: reader.result
                            })
                        });
                        
                        const docType = currentUploadTargetInputId === 'kp-url-input' ? 'kp_url' : 'invoice_url';
                        await state.authenticatedFetch(`/api/admin/orders/${order.id}`, {
                            method: 'PUT',
                            body: JSON.stringify({ [docType]: res.url })
                        });
                        
                        order[docType] = res.url;
                        state.updateOrderLocal(order.id, { [docType]: res.url });
                        window.showToast(`Файл "${file.name}" загружен и сохранен`, 'success', 'Загрузка');
                        
                        openOrderDrawer(order.id, state);
                    } catch (err) {
                        alert('Ошибка загрузки файла: ' + err.message);
                    } finally {
                        if (btn) btn.innerHTML = originalIcon;
                    }
                };
                reader.readAsDataURL(file);
            } catch (err) {
                alert('Ошибка чтения файла: ' + err.message);
                if (btn) btn.innerHTML = originalIcon;
            }
            hiddenFileInput.value = ''; // Reset file input
        };
    }

    modalWrapper.querySelectorAll('.delete-doc-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('Вы уверены, что хотите удалить этот документ?')) {
                const docType = btn.dataset.doc;
                try {
                    btn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">hourglass_empty</span>';
                    await state.authenticatedFetch(`/api/admin/orders/${order.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ [docType]: null })
                    });
                    order[docType] = null;
                    state.updateOrderLocal(order.id, { [docType]: null });
                    window.showToast('Документ удален', 'success', 'Удаление');
                    openOrderDrawer(order.id, state);
                } catch (err) {
                    alert('Ошибка удаления: ' + err.message);
                    btn.innerHTML = '<span class="material-symbols-outlined text-lg">delete</span>';
                }
            }
        };
    });

    modalWrapper.querySelectorAll('#kp-url-input, #invoice-url-input').forEach(input => {
        input.onchange = async () => {
            const docType = input.id === 'kp-url-input' ? 'kp_url' : 'invoice_url';
            try {
                await state.authenticatedFetch(`/api/admin/orders/${order.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ [docType]: input.value })
                });
                order[docType] = input.value;
                state.updateOrderLocal(order.id, { [docType]: input.value });
                window.showToast('Ссылка сохранена', 'success', 'Сохранение');
                openOrderDrawer(order.id, state);
            } catch (err) {
                alert('Ошибка сохранения: ' + err.message);
            }
        };
    });

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
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT',
                body: JSON.stringify({ messages })
            });
            order.messages = messages;
            const idx = state.orders.findIndex(o => String(o.id) === String(orderId));
            if (idx !== -1) state.orders[idx].messages = messages;
            window.showToast('Сообщение отправлено клиенту', 'info', 'Чат');
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

window.openOrderDrawer = openOrderDrawer;
