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
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#1d1b19]/90 backdrop-blur-md border border-[#ffb0cc]/20 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div class="flex items-center gap-3 pr-6 border-r border-white/10">
                <div class="w-8 h-8 rounded-full bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center font-bold text-xs">
                    ${selectedOrderIds.size}
                </div>
                <div class="text-[10px] uppercase tracking-widest font-bold text-[#d7c1c7] font-['Space Grotesk']">Выбрано</div>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="relative flex items-center gap-2">
                    <button type="button" id="bulk-order-status-btn" class="flex items-center gap-2 bg-[#151311] border border-[#ffb0cc]/20 hover:border-[#ffb0cc]/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ffb0cc] outline-none cursor-pointer hover:bg-white/5 transition-all shadow-md">
                        <span class="material-symbols-outlined text-[#ffb0cc] text-sm">donut_large</span>
                        <span>Изменить статус...</span>
                        <span class="material-symbols-outlined text-sm opacity-50 ml-1">expand_more</span>
                    </button>
                </div>
                
                <button type="button" id="bulk-order-delete-btn" class="flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-red-400">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Удалить
                </button>
            </div>
            
            <button id="bulk-order-close-btn" class="ml-4 p-2 hover:bg-white/5 rounded-full transition-all text-[#d7c1c7]" title="Снять выделение">
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
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Управление заказами</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Обработка поступающих заказов и статусов оплаты</p>
                </div>
                <button type="button" id="refresh-orders-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="orders-table-container">
                <div class="flex items-center justify-center h-[400px]">
                    <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('orders-table-container');
    
    let currentStatus = '';
    let sortKey = 'created_at';
    let sortOrder = 'desc';

    const loadOrders = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
            </div>
        `;
        try {
            const orders = await state.fetchOrders();
            renderOrdersWithFilters(tableContainer, orders, state, { currentStatus, sortKey, sortOrder, setFilters: (f) => {
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
            <div class="flex flex-col items-center justify-center h-[400px] text-[#d7c1c7] opacity-40">
                <span class="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                <div class="font-['Space Grotesk'] uppercase tracking-widest">Заказов пока нет</div>
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
        <div class="flex gap-2 p-4 border-b border-[#534347]/20 bg-[#151311] overflow-x-auto custom-scrollbar">
            <div class="flex items-center gap-2 shrink-0 mr-2">
                <span class="material-symbols-outlined text-[#ffb0cc] text-sm">donut_large</span>
                <span class="text-[10px] uppercase tracking-widest text-[#d7c1c7] opacity-60 font-bold font-['Space Grotesk']">Статус:</span>
            </div>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === '' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="">
                Все <span class="opacity-60 ml-1">${getStatusCount('')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'new' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="new">
                Новые <span class="${currentStatus === 'new' ? 'opacity-60' : 'text-[#ffb0cc]'} ml-1">${getStatusCount('new')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'processing' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="processing">
                В обработке <span class="opacity-60 ml-1">${getStatusCount('processing')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'completed' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="completed">
                Завершены <span class="opacity-60 ml-1">${getStatusCount('completed')}</span>
            </button>
            <button type="button" class="order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${currentStatus === 'cancelled' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}" data-status="cancelled">
                Отменены <span class="opacity-60 ml-1">${getStatusCount('cancelled')}</span>
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
            currentStatus = btn.dataset.status;
            if (setFilters) setFilters({ currentStatus });            container.querySelectorAll('.order-status-tab').forEach(b => {
                b.className = `order-status-tab px-4 py-2 rounded-xl text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all shrink-0 ${b.dataset.status === currentStatus ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/5 text-[#d7c1c7] hover:bg-white/10'}`;
            });
            updateTable();
        });
    });

    updateTable();
}

function renderOrdersTable(container, orders, state, sortOptions = {}) {
    if (orders.length === 0) {
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

    const allChecked = orders.length > 0 && orders.every(o => selectedOrderIds.has(o.id));

    container.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-4 w-12 text-center">
                            <div id="orders-select-all" class="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]' : 'border-white/20 bg-black/40 text-transparent hover:border-white/40'}">
                                <span class="material-symbols-outlined text-[14px] font-bold">done_all</span>
                            </div>
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="id">ID ${getSortIcon('id')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="customer_name">Клиент ${getSortIcon('customer_name')}</th>
                        <th class="py-4 px-6 font-bold">Товары</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="total">Сумма ${getSortIcon('total')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="created_at">Дата ${getSortIcon('created_at')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="status">Статус ${getSortIcon('status')}</th>
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
                        <tr class="group hover:bg-white/[0.04] transition-colors cursor-pointer order-row ${rowClass}" data-id="${order.id}">
                            <td class="py-4 px-4 w-12 text-center order-select-cell" data-id="${order.id}">
                                <div class="order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${isSelected ? 'bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]' : 'border-white/20 bg-black/40 text-transparent group-hover:border-white/40'}">
                                    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-xs font-mono text-[#d7c1c7]">#${order.id}</div>
                                ${msgCount > 0 ? `<div class="flex items-center gap-1 mt-1"><span class="w-1.5 h-1.5 rounded-full bg-[#ffb0cc] inline-block"></span><span class="text-[9px] text-[#ffb0cc]">${msgCount} сообщ.</span></div>` : ''}
                            </td>
                            <td class="py-5 px-6">
                                <div class="font-bold text-base uppercase text-[#e7e2dd] tracking-tight">${order.customer_name || 'Не указано'}</div>
                                <div class="text-sm text-[#ffb0cc] font-mono font-medium mt-1 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">call</span>
                                    ${order.customer_phone || 'Телефон не указан'}
                                </div>
                                ${order.customer_email ? `<div class="text-sm text-[#d7c1c7] font-mono mt-0.5 flex items-center gap-1.5 select-all"><span class="material-symbols-outlined text-sm">mail</span>${order.customer_email}</div>` : ''}
                                ${order.customer_inn ? `<div class="text-xs text-[#ffb0cc]/80 font-mono mt-1 bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-2.5 py-1 rounded-lg inline-block uppercase tracking-wider font-bold">ИНН: ${order.customer_inn}</div>` : ''}
                            </td>
                            <td class="py-4 px-6">
                                <div class="flex flex-col gap-1.5 min-w-[250px]">
                                    ${items.map(i => `
                                        <div class="flex items-center justify-between gap-3 text-[11px] leading-tight group/item">
                                            <span class="text-[#e7e2dd] font-medium">• ${i.product_name || i.name}</span>
                                            <span class="px-2 py-0.5 bg-[#ffb0cc]/10 text-[#ffb0cc] rounded-md font-bold shrink-0">x${i.quantity}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-[#ffb0cc] font-bold font-['Space Grotesk'] text-sm">${Number(order.total).toLocaleString()} ₽</div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-xs text-[#d7c1c7]">${new Date(order.created_at).toLocaleDateString()}</div>
                                <div class="text-[9px] opacity-30 uppercase mt-0.5">${new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    ${(() => {
                                        const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === status) || { label: status, color: '#3b82f6', icon: 'donut_large' };
                                        return `<button type="button" data-id="${order.id}" data-status="${status}" class="status-modal-btn flex items-center justify-between gap-2 bg-[#151311] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0" style="border-left: 4px solid ${statusObj.color};">
                                            <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                                                <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon}</span>
                                                <span class="truncate">${statusObj.label}</span>
                                            </span>
                                            <span class="material-symbols-outlined text-xs text-[#d7c1c7] opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                                        </button>`;
                                    })()}
                                    <button type="button" data-id="${order.id}" class="delete-order-btn p-2 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" title="Удалить заказ">
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

    // Handle row selections
    container.querySelectorAll('.order-select-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(cell.dataset.id);
            const block = cell.querySelector('.order-select-block');
            const isChecked = !selectedOrderIds.has(id);
            
            if (isChecked) {
                selectedOrderIds.add(id);
                block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]";
            } else {
                selectedOrderIds.delete(id);
                block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-white/20 bg-black/40 text-transparent group-hover:border-white/40";
            }
            
            updateBulkOrdersToolbar(state);

            // Update master check
            const selectAll = container.querySelector('#orders-select-all');
            if (selectAll) {
                const allVisibleCells = container.querySelectorAll('.order-select-cell');
                const allChecked = Array.from(allVisibleCells).every(c => selectedOrderIds.has(Number(c.dataset.id)));
                selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]' : 'border-white/20 bg-black/40 text-transparent hover:border-white/40'}`;
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
                    if(block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]";
                } else {
                    selectedOrderIds.delete(id);
                    if(block) block.className = "order-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-white/20 bg-black/40 text-transparent group-hover:border-white/40";
                }
            });
            
            selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${willBeChecked ? 'bg-[#ffb0cc]/20 border-[#ffb0cc]/50 text-[#ffb0cc]' : 'border-white/20 bg-black/40 text-transparent hover:border-white/40'}`;
            updateBulkOrdersToolbar(state);
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
        row.addEventListener('click', () => {
            openOrderDrawer(row.dataset.id, state);
        });
    });

    container.querySelectorAll('.status-modal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const currentStatus = btn.dataset.status;
            const newStatus = await window.openStatusSelectModal(window.ORDER_STATUS_OPTIONS, currentStatus, `Изменение статуса заказа #${id}`);
            if (!newStatus || newStatus === currentStatus) return;
            
            try {
                await state.authenticatedFetch(`/api/admin/orders/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ status: newStatus })
                });
                
                state.updateOrderLocal(id, { status: newStatus });
                window.showToast(`Статус заказа #${id} изменен на "${newStatus}"`, 'success', 'Обновление статуса');
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
            if (await confirm(`Вы уверены, что хотите удалить заказ #${id}? Это действие необратимо.`)) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    await state.authenticatedFetch(`/api/admin/orders/${id}`, {
                        method: 'DELETE'
                    });
                    await state.fetchOrders();
                    window.showToast(`Заказ #${id} успешно удален`, 'success', 'Удаление заказа');
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
        modalWrapper.className = 'fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
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

    modalWrapper.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" id="order-modal-backdrop"></div>
        <div class="relative w-full max-w-3xl max-h-[90vh] bg-[#1d1b19] border border-[#534347]/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0">
            <div class="p-6 border-b border-[#534347]/20 flex items-center justify-between shrink-0">
                <div>
                    <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight">Заказ #${order.id}</h3>
                    <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1">${order.customer_name || 'Клиент'}</div>
                </div>
                <button id="close-order-modal" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0">
                <div class="space-y-4">
                    <h4 class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-bold">Коммерческое предложение / Счет</h4>
                    <div class="flex gap-2">
                        <input type="text" id="invoice-url-input" value="${order.invoice_url || ''}" placeholder="Ссылка на счет/документ..." class="flex-1 bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] outline-none transition-all text-sm">
                        <button id="save-invoice-btn" class="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#ffb0cc] transition-all text-[10px] font-bold uppercase tracking-widest border border-white/10 shrink-0">Прикрепить</button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-white/5 px-6 py-3.5 border border-white/5 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] border border-[#ffb0cc]/30">
                                <span class="material-symbols-outlined text-base">forum</span>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-[#e7e2dd] uppercase tracking-widest font-['Space Grotesk'] block">Связь с клиентом</span>
                                <span class="text-[9px] text-[#d7c1c7] opacity-60 block">Чат синхронизируется в реальном времени</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] text-[#ffb0cc] bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">Telegram style</span>
                            <span id="chat-realtime-dot" class="flex items-center gap-1.5 text-[9px] text-green-400 uppercase tracking-widest font-bold opacity-70">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live
                            </span>
                        </div>
                    </div>
                    <div class="bg-black/40 rounded-3xl border border-white/10 flex flex-col h-[380px] shadow-2xl overflow-hidden">
                        <div id="chat-messages" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                            ${messages.length ? renderMessages() : '<div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-[\'Space Grotesk\'] text-[#e7e2dd]">Нет сообщений</span></div>'}
                        </div>
                        <div class="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-white/5 items-center">
                            <input type="text" id="chat-input" placeholder="Написать клиенту..." class="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#ffb0cc] transition-all text-[#e7e2dd] placeholder:opacity-40 shadow-inner">
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

    // ── Supabase Realtime for admin chat ────────────────────────────────────
    const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
    let supabaseRT = null;
    let adminRealtimeChannel = null;

    try {
        const sb = window.supabase;
        if (sb && sb.createClient) {
            supabaseRT = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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

    modalWrapper.querySelector('#close-order-modal').onclick = close;
    modalWrapper.querySelector('#order-modal-backdrop').onclick = close;

    modalWrapper.querySelector('#save-invoice-btn').onclick = async () => {
        const url = modalWrapper.querySelector('#invoice-url-input').value;
        const btn = modalWrapper.querySelector('#save-invoice-btn');
        btn.textContent = '...';
        try {
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT',
                body: JSON.stringify({ invoice_url: url })
            });
            order.invoice_url = url;
            btn.textContent = 'Сохранено';
            setTimeout(() => btn.textContent = 'Прикрепить', 2000);
            window.showToast('Счет/КП успешно прикреплен к заказу', 'success', 'Документы');
        } catch(e) {
            alert('Ошибка: ' + e.message);
            btn.textContent = 'Прикрепить';
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
