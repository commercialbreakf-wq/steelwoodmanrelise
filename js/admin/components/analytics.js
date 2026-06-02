export const renderAnalyticsView = async (container, state) => {
    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-on-surface">Финансовая отчетность</h3>
                    <p class="text-sm text-on-surface-variant mt-1">Продуктовая и финансовая аналитика по всем каналам продаж</p>
                </div>
                <div class="flex gap-2">
                    <button id="refresh-analytics-btn" class="flex items-center justify-center gap-2 px-6 py-4 bg-surface-variant text-[#964551] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#964551]/10 transition-all">
                        <span class="material-symbols-outlined text-base">refresh</span>
                        Обновить аналитику
                    </button>
                </div>
            </div>

            <div id="analytics-stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Monthly Revenue Trend -->
                <div class="glass lg:col-span-2 rounded-[2.5rem] p-8 border-white/5 min-h-[450px] flex flex-col">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight text-on-surface">Динамика выручки</h4>
                            <p class="text-[10px] text-on-surface-variant opacity-70 uppercase tracking-widest mt-1">Подтвержденные продажи за последние 30 дней</p>
                        </div>
                        <div id="total-month-rev" class="text-right">
                             <div class="text-lg font-bold text-[#964551]">0 ₽</div>
                             <div class="text-[9px] uppercase font-bold text-on-surface-variant opacity-60">Итого за период</div>
                        </div>
                    </div>
                    <div id="revenue-chart" class="flex-1 flex items-end gap-1.5 h-64 border-b border-outline/10 pb-2">
                        <div class="flex items-center justify-center w-full h-full text-on-surface-variant opacity-50">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Анализ транзакций...</span>
                        </div>
                    </div>
                    <div class="flex justify-between mt-4 text-[9px] uppercase font-bold tracking-widest text-on-surface-variant opacity-60">
                        <span>30 дней назад</span>
                        <span>Сегодня</span>
                    </div>
                </div>

                <!-- Sales Efficiency -->
                <div class="glass rounded-[2.5rem] p-8 border-white/5 min-h-[450px] flex flex-col">
                    <h4 class="text-lg font-bold font-['Space Grotesk'] mb-8 uppercase tracking-tight text-on-surface">Эффективность</h4>
                    <div id="sales-efficiency" class="flex-1 space-y-8">
                        <div class="flex items-center justify-center h-full text-on-surface-variant opacity-60">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Расчет KPI...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Top Revenue Drivers -->
                <div class="glass rounded-[2.5rem] p-8 border-outline/10 min-h-[400px]">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight text-on-surface">Топ драйверов выручки</h4>
                        <span class="material-symbols-outlined text-[#964551]">trending_up</span>
                    </div>
                    <div id="top-revenue-products" class="space-y-4">
                        <div class="text-center py-20 text-on-surface-variant opacity-60">Обработка товарных позиций...</div>
                    </div>
                </div>

                <!-- Status & Risk Analysis -->
                <div class="glass rounded-[2.5rem] p-8 border-outline/10 min-h-[400px]">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight text-on-surface">Статус воронки и риски</h4>
                        <span class="material-symbols-outlined text-[#964551]">analytics</span>
                    </div>
                    <div id="status-distribution" class="space-y-6">
                        <div class="text-center py-20 text-on-surface-variant opacity-60">Анализ жизненного цикла заказов...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    window.adminStateGlobal = state;

    const showProfitBreakdownModal = (totalRevenue, estimatedProfit, completedOrdersCount) => {
        if (!window.showModalGlobal) return;
        
        window.showModalGlobal('Финансовые показатели (Оценка)', `
            <div class="space-y-6">
                <div class="p-6 rounded-2xl bg-surface-variant border border-outline/10 space-y-4 text-on-surface">
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-on-surface-variant font-medium">Общая выручка:</span>
                        <span class="text-sm font-bold font-mono">${totalRevenue.toLocaleString()} ₽</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-outline/5 pt-3">
                        <span class="text-xs text-on-surface-variant font-medium">Завершенные заказы:</span>
                        <span class="text-sm font-bold font-mono">${completedOrdersCount}</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-outline/5 pt-3">
                        <span class="text-xs text-on-surface-variant font-medium">Маржинальность (оценка):</span>
                        <span class="text-sm font-bold text-[#964551]">15.0%</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-[#964551]/20 pt-4">
                        <span class="text-sm font-bold">Расчетная прибыль:</span>
                        <span class="text-lg font-bold text-[#964551] font-mono">${estimatedProfit.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</span>
                    </div>
                </div>
                <p class="text-[10px] text-on-surface-variant opacity-60 italic text-center font-medium leading-relaxed">
                    Данный расчет носит ориентировочный характер на основе средней чистой прибыли компании (15% от стоимости металлопроката и логистических услуг).
                </p>
            </div>
        `);
    };

    const showAverageCheckModal = (state, completedOrders) => {
        if (!window.showModalGlobal) return;
        
        const sorted = [...completedOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const totalRev = completedOrders.reduce((sum, o) => sum + (Number(o.total_price || o.total) || 0), 0);
        const avgCheck = completedOrders.length > 0 ? (totalRev / completedOrders.length) : 0;
        
        const listHtml = sorted.map((order, idx) => {
            const date = new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            return `
                <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 flex justify-between items-center hover:border-[#964551]/30 transition-all cursor-pointer group/item active:scale-98" onclick="if(window.openOrderDrawer) { window.openOrderDrawer('${order.id}', window.adminStateGlobal || state); }">
                    <div>
                        <div class="text-xs font-mono font-bold text-[#964551]">${order.id}</div>
                        <div class="text-sm font-bold text-on-surface uppercase tracking-tight mt-1 group-hover/item:text-[#964551] transition-colors">${order.customer_name || 'Не указано'}</div>
                        <div class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest mt-1">${date}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-bold text-on-surface font-mono">${Number(order.total_price || order.total || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
            `;
        }).join('');

        window.showModalGlobal('Реестр закрытых заказов', `
            <div class="space-y-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#964551]/5 border border-[#964551]/10 rounded-2xl p-6 -mt-2 text-on-surface">
                    <div>
                        <div class="text-[9px] text-[#964551] uppercase font-label-caps tracking-widest font-bold">Средний чек</div>
                        <div class="text-2xl font-bold font-mono mt-1">${avgCheck.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</div>
                    </div>
                    <div class="text-left sm:text-right">
                        <div class="text-[9px] text-on-surface-variant/60 uppercase font-label-caps tracking-widest font-bold">Всего заказов</div>
                        <div class="text-sm font-bold mt-1">${completedOrders.length}</div>
                    </div>
                </div>
                <div class="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    ${listHtml || '<div class="py-12 text-center text-on-surface-variant opacity-40 uppercase tracking-widest font-label-caps text-xs">Нет завершенных заказов</div>'}
                </div>
            </div>
        `);
    };

    const showDailyOrdersModal = (dateKey, displayDate, orders) => {
        if (!window.showModalGlobal) return;
        
        const dailyOrders = orders.filter(order => {
            const orderDate = new Date(order.created_at);
            if (isNaN(orderDate.getTime())) return false;
            
            const year = orderDate.getFullYear();
            const month = String(orderDate.getMonth() + 1).padStart(2, '0');
            const day = String(orderDate.getDate()).padStart(2, '0');
            const orderDateKey = `${year}-${month}-${day}`;
            
            return orderDateKey === dateKey;
        });

        dailyOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const totalDailyRevenue = dailyOrders
            .filter(o => {
                const s = (o.status || '').toUpperCase();
                return ['COMPLETED', 'SUCCESS', 'PAID', 'DELIVERED'].includes(s);
            })
            .reduce((sum, o) => sum + (Number(o.total_price || o.total) || 0), 0);

        const listHtml = dailyOrders.map(order => {
            const date = new Date(order.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            const items = order.order_items || [];
            
            let statusColor = 'text-gray-400';
            let statusBg = 'bg-white/5';
            let statusText = order.status || 'NEW';
            
            const s = (order.status || 'new').toLowerCase().trim();
            if (s === 'completed' || s === 'success' || s === 'paid') {
                statusColor = 'text-green-400';
                statusText = 'Завершен';
                statusBg = 'bg-green-400/10';
            } else if (s === 'new' || s === 'pending') {
                statusColor = 'text-blue-400';
                statusText = 'Новый';
                statusBg = 'bg-blue-400/10';
            } else if (s === 'processing' || s === 'in_progress') {
                statusColor = 'text-yellow-400';
                statusText = 'В работе';
                statusBg = 'bg-yellow-400/10';
            } else if (s === 'cancelled') {
                statusColor = 'text-red-400';
                statusText = 'Отменен';
                statusBg = 'bg-red-400/10';
            }

            return `
                <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#964551]/30 transition-all cursor-pointer group/item active:scale-98" onclick="if(window.openOrderDrawer) { window.openOrderDrawer('${order.id}', window.adminStateGlobal || state); }">
                    <div class="space-y-1.5 flex-grow font-body-md">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-bold text-primary">${order.id}</span>
                            <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em] ${statusBg} ${statusColor} font-label-caps">${statusText}</span>
                            <span class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest">${date}</span>
                        </div>
                        <div class="text-sm font-bold text-on-surface uppercase tracking-tight group-hover/item:text-[#964551] transition-colors">${order.customer_name || 'Не указано'}</div>
                        <div class="text-[11px] text-on-surface-variant space-y-1">
                            ${items.map(i => `<div>• ${i.product_name || i.name} <span class="text-primary font-bold">x${i.quantity}</span></div>`).join('')}
                        </div>
                    </div>
                    <div class="text-left sm:text-right shrink-0">
                        <div class="text-sm font-bold text-primary font-display-xl">${Number(order.total_price || order.total || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
            `;
        }).join('');

        window.showModalGlobal(`Заказы за ${displayDate}`, `
            <div class="space-y-6 text-on-surface">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#964551]/5 border border-[#964551]/10 rounded-2xl p-6 -mt-2">
                    <div>
                        <div class="text-[9px] text-[#964551] uppercase font-label-caps tracking-widest font-bold">Выручка за день</div>
                        <div class="text-2xl font-bold font-mono mt-1">${totalDailyRevenue.toLocaleString()} ₽</div>
                    </div>
                    <div class="text-left sm:text-right">
                        <div class="text-[9px] text-on-surface-variant/60 uppercase font-label-caps tracking-widest font-bold">Всего заказов</div>
                        <div class="text-sm font-bold mt-1">${dailyOrders.length}</div>
                    </div>
                </div>
                <div class="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    ${listHtml || '<div class="py-12 text-center text-on-surface-variant opacity-40 uppercase tracking-widest font-label-caps text-xs">Нет заказов за этот день</div>'}
                </div>
            </div>
        `);
    };

    const showProductDriverOrdersModal = (productName, orders) => {
        if (!window.showModalGlobal) return;
        
        const driverOrders = orders.filter(order => {
            const items = order.order_items || [];
            return items.some(item => (item.product_name || item.name || '').toLowerCase() === productName.toLowerCase());
        });

        driverOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const totalProductRevenue = driverOrders.reduce((sum, order) => {
            const items = order.order_items || [];
            const item = items.find(i => (i.product_name || i.name || '').toLowerCase() === productName.toLowerCase());
            return sum + (Number(item.price) * Number(item.quantity) || 0);
        }, 0);

        const totalProductQty = driverOrders.reduce((sum, order) => {
            const items = order.order_items || [];
            const item = items.find(i => (i.product_name || i.name || '').toLowerCase() === productName.toLowerCase());
            return sum + (Number(item.quantity) || 0);
        }, 0);

        const listHtml = driverOrders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            
            const items = order.order_items || [];
            const item = items.find(i => (i.product_name || i.name || '').toLowerCase() === productName.toLowerCase());
            const qty = item ? item.quantity : 0;
            const price = item ? (item.price || 0) : 0;
            
            let statusColor = 'text-gray-400';
            let statusBg = 'bg-white/5';
            let statusText = order.status || 'NEW';
            
            const s = (order.status || 'new').toLowerCase().trim();
            if (s === 'completed' || s === 'success' || s === 'paid') {
                statusColor = 'text-green-400';
                statusBg = 'bg-green-400/10';
                statusText = 'Завершен';
            } else if (s === 'new' || s === 'pending') {
                statusColor = 'text-blue-400';
                statusBg = 'bg-blue-400/10';
                statusText = 'Новый';
            } else if (s === 'processing' || s === 'in_progress') {
                statusColor = 'text-yellow-400';
                statusBg = 'bg-yellow-400/10';
                statusText = 'В работе';
            } else if (s === 'cancelled') {
                statusColor = 'text-red-400';
                statusBg = 'bg-red-400/10';
                statusText = 'Отменен';
            }

            return `
                <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#964551]/30 transition-all cursor-pointer group/item active:scale-98" onclick="if(window.openOrderDrawer) { window.openOrderDrawer('${order.id}', window.adminStateGlobal || state); }">
                    <div class="space-y-1.5 flex-grow font-body-md">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-bold text-primary">${order.id}</span>
                            <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em] ${statusBg} ${statusColor} font-label-caps">${statusText}</span>
                            <span class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest">${date}</span>
                        </div>
                        <div class="text-sm font-bold text-on-surface uppercase tracking-tight group-hover/item:text-[#964551] transition-colors">${order.customer_name || 'Не указано'}</div>
                        <div class="text-xs text-on-surface-variant">
                            Куплено: <span class="text-[#964551] font-bold font-mono">${qty} ед.</span> по цене <span class="font-mono">${Number(price).toLocaleString()} ₽</span>
                        </div>
                    </div>
                    <div class="text-left sm:text-right shrink-0">
                        <div class="text-sm font-bold text-on-surface font-mono">Всего в заказе: ${Number(order.total_price || order.total || 0).toLocaleString()} ₽</div>
                    </div>
                </div>
            `;
        }).join('');

        window.showModalGlobal(`Заказы с товаром: ${productName}`, `
            <div class="space-y-6 text-on-surface">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#964551]/5 border border-[#964551]/10 rounded-2xl p-6 -mt-2">
                    <div>
                        <div class="text-[9px] text-[#964551] uppercase font-label-caps tracking-widest font-bold">Выручка по товару</div>
                        <div class="text-2xl font-bold font-mono mt-1">${totalProductRevenue.toLocaleString()} ₽</div>
                    </div>
                    <div class="text-left sm:text-right">
                        <div class="text-[9px] text-on-surface-variant/60 uppercase font-label-caps tracking-widest font-bold">Общие продажи</div>
                        <div class="text-sm font-bold mt-1">${totalProductQty.toLocaleString()} ед. в ${driverOrders.length} заках.</div>
                    </div>
                </div>
                <div class="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    ${listHtml || '<div class="py-12 text-center text-on-surface-variant opacity-40 uppercase tracking-widest font-label-caps text-xs">Нет заказов с этим товаром</div>'}
                </div>
            </div>
        `);
    };

    const loadData = async () => {
        // Correct status mapping based on shared-ui.js
        const confirmedStatuses = ['COMPLETED', 'SUCCESS', 'PAID'];
        const inWorkStatuses = ['IN_PROGRESS', 'PROCESSING', 'WAITING_CLIENT'];
        
        try {
            console.log('[ANALYTICS] Starting loadData...');
            const refreshBtn = document.getElementById('refresh-analytics-btn');
            if (refreshBtn) {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">sync</span> Загрузка...';
            }

            console.log('[ANALYTICS] Fetching from state...');
            const [orders, products, users, leads] = await Promise.all([
                state.fetchOrders(),
                state.fetchProducts(),
                state.fetchUsers(),
                state.fetchLeads()
            ]);

            console.log('[ANALYTICS] Calculating metrics...');
            
            const confirmedOrders = orders.filter(o => {
                const s = (o.status || '').toUpperCase();
                return confirmedStatuses.includes(s);
            });
            
            const inWorkOrders = orders.filter(o => {
                const s = (o.status || '').toUpperCase();
                return inWorkStatuses.includes(s);
            });

            const totalRevenue = confirmedOrders.reduce((sum, o) => sum + (Number(o.total_price || o.total) || 0), 0);
            const pendingRevenue = inWorkOrders.reduce((sum, o) => sum + (Number(o.total_price || o.total) || 0), 0);
            
            const averageCheck = confirmedOrders.length > 0 ? (totalRevenue / confirmedOrders.length) : 0;
            const revenuePerLead = leads.length > 0 ? (totalRevenue / leads.length) : 0;
            const estimatedProfit = totalRevenue * 0.15; // 15% estimated margin

            // Update main KPI cards
            document.getElementById('analytics-stats').innerHTML = `
                <div id="kpi-revenue" class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center group hover:bg-[#964551]/5 hover:border-[#964551]/50 transition-all cursor-pointer active:scale-98">
                    <div class="w-12 h-12 rounded-2xl bg-[#964551]/10 flex items-center justify-center text-[#964551] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-on-surface">${totalRevenue.toLocaleString()} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70">Выручка (завершено)</div>
                </div>
                <div id="kpi-profit" class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center group hover:bg-[#964551]/5 hover:border-[#964551]/50 transition-all cursor-pointer active:scale-98">
                    <div class="w-12 h-12 rounded-2xl bg-surface-variant flex items-center justify-center text-on-surface-variant mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">query_stats</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-on-surface">${estimatedProfit.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70">Прибыль (est. 15%)</div>
                </div>
                <div id="kpi-avgcheck" class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center group hover:bg-[#964551]/5 hover:border-[#964551]/50 transition-all cursor-pointer active:scale-98">
                    <div class="w-12 h-12 rounded-2xl bg-[#964551]/10 flex items-center justify-center text-[#964551] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-on-surface">${averageCheck.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70">Средний чек</div>
                </div>
                <div id="kpi-pending" class="glass p-8 rounded-3xl border-[#964551]/20 flex flex-col items-center text-center group hover:bg-[#964551]/5 hover:border-[#964551]/50 transition-all cursor-pointer active:scale-98">
                    <div class="w-12 h-12 rounded-2xl bg-surface-variant flex items-center justify-center text-on-surface-variant mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">hourglass_empty</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-on-surface">${pendingRevenue.toLocaleString()} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70">В работе (потенциал)</div>
                </div>
            `;

            // Bind KPI card actions
            document.getElementById('kpi-revenue').onclick = () => {
                if (typeof window.showRevenueModal === 'function') {
                    window.showRevenueModal(state);
                } else {
                    console.warn('[ANALYTICS] showRevenueModal is not available');
                }
            };
            document.getElementById('kpi-profit').onclick = () => {
                showProfitBreakdownModal(totalRevenue, estimatedProfit, confirmedOrders.length);
            };
            document.getElementById('kpi-avgcheck').onclick = () => {
                showAverageCheckModal(state, confirmedOrders);
            };
            document.getElementById('kpi-pending').onclick = () => {
                if (typeof window.showActiveOrdersModal === 'function') {
                    window.showActiveOrdersModal(state);
                } else {
                    console.warn('[ANALYTICS] showActiveOrdersModal is not available');
                }
            };

            // 2. Revenue Dynamics Chart (Last 30 days)
            const days = 30;
            const revenueByDay = new Array(days).fill(0);
            const now = new Date();
            
            // Generate labels and date keys for matching calendar days
            const dailyLabels = [];
            const dailyKeys = [];
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(now.getDate() - (days - 1 - i));
                dailyLabels.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
                
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                dailyKeys.push(`${year}-${month}-${day}`);
            }

            confirmedOrders.forEach(order => {
                const orderDate = new Date(order.created_at);
                if (isNaN(orderDate.getTime())) return;
                
                const year = orderDate.getFullYear();
                const month = String(orderDate.getMonth() + 1).padStart(2, '0');
                const day = String(orderDate.getDate()).padStart(2, '0');
                const dateKey = `${year}-${month}-${day}`;
                
                const dayIndex = dailyKeys.indexOf(dateKey);
                if (dayIndex !== -1) {
                    revenueByDay[dayIndex] += Number(order.total_price || order.total) || 0;
                }
            });

            console.log('[ANALYTICS] Revenue by day:', revenueByDay);
            document.getElementById('total-month-rev').querySelector('.text-lg').textContent = `${revenueByDay.reduce((a, b) => a + b, 0).toLocaleString()} ₽`;

            const maxDailyRev = Math.max(...revenueByDay, 5000);
            document.getElementById('revenue-chart').innerHTML = revenueByDay.map((rev, i) => {
                const height = (rev / maxDailyRev * 100).toFixed(0);
                const isToday = i === days - 1;
                const dateKey = dailyKeys[i];
                const displayDate = dailyLabels[i];
                return `
                    <div class="revenue-bar flex-1 h-full flex items-end justify-center group relative cursor-pointer" data-date-key="${dateKey}" data-display-date="${displayDate}">
                        <div class="w-full bg-[#964551]/20 hover:bg-[#964551] transition-all rounded-t-lg" style="height: ${height}%"></div>
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-inverse-surface border border-primary/30 text-inverse-on-surface text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none shadow-2xl">
                            <div class="text-[#964551] mb-0.5">${rev.toLocaleString()} ₽</div>
                            <div class="text-[8px] opacity-60 uppercase">${dailyLabels[i]}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Bind click events on dynamics chart bars
            document.getElementById('revenue-chart').querySelectorAll('.revenue-bar').forEach(bar => {
                bar.onclick = () => {
                    const dateKey = bar.dataset.dateKey;
                    const displayDate = bar.dataset.displayDate;
                    showDailyOrdersModal(dateKey, displayDate, orders);
                };
            });

            // 3. Sales Efficiency & Funnel
            const leadCount = leads.length;
            const totalOrderCount = orders.length;
            const confirmedCount = confirmedOrders.length;
            
            const leadToOrderConv = leadCount > 0 ? (totalOrderCount / leadCount * 100).toFixed(1) : 0;
            const orderToPaidConv = totalOrderCount > 0 ? (confirmedCount / totalOrderCount * 100).toFixed(1) : 0;

            document.getElementById('sales-efficiency').innerHTML = `
                <div class="space-y-8">
                    <div class="glass p-6 rounded-2xl bg-surface-variant">
                        <div class="flex justify-between items-end mb-4">
                            <div>
                                <div class="text-2xl font-bold font-['Space Grotesk'] text-[#964551]">${leadToOrderConv}%</div>
                                <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70 tracking-widest mt-1">Лиды → Заказы</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-on-surface">${totalOrderCount}</div>
                                <div class="text-[9px] text-on-surface-variant opacity-60 uppercase">конверсия</div>
                            </div>
                        </div>
                        <div class="h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div class="h-full bg-[#964551]" style="width: ${Math.min(leadToOrderConv, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="glass p-6 rounded-2xl bg-surface-variant">
                        <div class="flex justify-between items-end mb-4">
                            <div>
                                <div class="text-2xl font-bold font-['Space Grotesk'] text-on-surface">${orderToPaidConv}%</div>
                                <div class="text-[10px] uppercase font-bold text-on-surface-variant opacity-70 tracking-widest mt-1">Заказы → Оплаты</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-on-surface">${confirmedCount}</div>
                                <div class="text-[9px] text-on-surface-variant opacity-60 uppercase">успех</div>
                            </div>
                        </div>
                        <div class="h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div class="h-full bg-outline/50" style="width: ${Math.min(orderToPaidConv, 100)}%"></div>
                        </div>
                    </div>

                    <div class="bg-[#964551]/5 border border-[#964551]/10 p-4 rounded-2xl">
                         <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-[#964551] text-sm">info</span>
                            <span class="text-[10px] uppercase font-bold text-[#964551] tracking-widest">Итоговая конверсия</span>
                         </div>
                         <div class="text-xl font-bold text-on-surface">${leadCount > 0 ? (confirmedCount / leadCount * 100).toFixed(1) : 0}%</div>
                         <p class="text-[9px] text-on-surface-variant opacity-60 mt-1 italic">Процент оплаченных заказов от общего числа входящих лидов за все время.</p>
                    </div>
                </div>
            `;

            // Top Products Driver analysis
            const productStats = {};
            orders.forEach(order => {
                if (order.order_items) {
                    order.order_items.forEach(item => {
                        const name = item.product_name || 'Прочее';
                        if (!productStats[name]) productStats[name] = { revenue: 0, count: 0 };
                        productStats[name].revenue += (Number(item.price) * Number(item.quantity) || 0);
                        productStats[name].count += Number(item.quantity) || 0;
                    });
                }
            });

            const drivers = Object.entries(productStats)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .slice(0, 6);

            document.getElementById('top-revenue-products').innerHTML = drivers.length > 0 ? drivers.map(([name, data], i) => `
                <div class="driver-card flex items-center justify-between p-4 bg-surface-variant rounded-2xl border border-outline/10 hover:border-[#964551]/50 transition-all group cursor-pointer active:scale-98" data-product-name="${name}">
                    <div class="flex items-center gap-4 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-[#964551]/10 flex items-center justify-center text-[#964551] group-hover:bg-[#964551] group-hover:text-on-primary transition-all font-bold text-xs">
                            ${i + 1}
                        </div>
                        <div class="truncate">
                            <div class="text-sm font-bold text-on-surface truncate">${name}</div>
                            <div class="text-[10px] text-on-surface-variant opacity-70">${data.count.toLocaleString()} ед. продано</div>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <div class="text-sm font-bold text-[#964551]">${data.revenue.toLocaleString()} ₽</div>
                        <div class="text-[9px] uppercase font-bold text-on-surface-variant opacity-60 tracking-tighter">${(data.revenue / totalRevenue * 100).toFixed(1)}% доли</div>
                    </div>
                </div>
            `).join('') : '<div class="text-center py-20 opacity-30">Нет детальных данных о продажах</div>';

            // Bind click events on driver cards
            document.getElementById('top-revenue-products').querySelectorAll('.driver-card').forEach(card => {
                card.onclick = () => {
                    const prodName = card.dataset.productName;
                    showProductDriverOrdersModal(prodName, orders);
                };
            });

            // Order status risk analysis - Updated to match shared-ui.js
            const statusMap = {
                'NEW': { label: 'Новый', color: '#3b82f6', icon: 'fiber_new' },
                'IN_PROGRESS': { label: 'В работе', color: '#f59e0b', icon: 'engineering' },
                'PROCESSING': { label: 'В обработке', color: '#a855f7', icon: 'inventory_2' },
                'COMPLETED': { label: 'Завершен', color: '#10b981', icon: 'check_circle' },
                'WAITING_CLIENT': { label: 'Ожидание', color: '#ec4899', icon: 'hourglass_top' },
                'CANCELLED': { label: 'Отменен', color: '#ef4444', icon: 'cancel' }
            };

            const statusAnalysis = orders.reduce((acc, o) => {
                const s = (o.status || 'NEW').toUpperCase();
                if (!acc[s]) acc[s] = { count: 0, revenue: 0 };
                acc[s].count++;
                acc[s].revenue += (Number(o.total_price || o.total) || 0);
                return acc;
            }, {});

            const sortedAnalysis = Object.entries(statusAnalysis).sort((a, b) => b[1].revenue - a[1].revenue);

            document.getElementById('status-distribution').innerHTML = sortedAnalysis.length > 0 ? sortedAnalysis.map(([status, data]) => {
                const cfg = statusMap[status] || { label: status, color: '#d7c1c7', icon: 'help' };
                const totalPotential = totalRevenue + pendingRevenue || 1;
                const percent = (data.revenue / totalPotential * 100).toFixed(0);
                return `
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <div class="w-2 h-2 rounded-full" style="background: ${cfg.color}"></div>
                                <span class="text-[11px] font-bold uppercase tracking-wider text-on-surface">${cfg.label}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-bold text-[#964551]">${data.revenue.toLocaleString()} ₽</span>
                                <span class="text-[9px] text-on-surface-variant opacity-60 ml-2">${data.count} зак.</span>
                            </div>
                        </div>
                        <div class="h-1 bg-surface-variant rounded-full overflow-hidden">
                            <div class="h-full transition-all duration-1000" style="width: ${percent}%; background: ${cfg.color}"></div>
                        </div>
                    </div>
                `;
            }).join('') : '<div class="text-center py-20 opacity-30">Нет данных для анализа статусов</div>';

        } catch (e) {
            console.error('[ANALYTICS] Sync Failure:', e);
            document.getElementById('analytics-stats').innerHTML = `
                <div class="col-span-full p-12 glass rounded-3xl border-red-500/20 bg-red-500/5 text-center">
                    <span class="material-symbols-outlined text-5xl text-red-500 mb-4">analytics_off</span>
                    <h4 class="text-lg font-bold font-['Space Grotesk'] text-on-surface mb-2">Ошибка синхронизации данных</h4>
                    <p class="text-sm text-on-surface-variant opacity-80 max-w-md mx-auto mb-8">${e.message}</p>
                    <button id="retry-analytics-btn" class="px-8 py-4 bg-white/5 hover:bg-white/10 text-[#964551] rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                        Попробовать снова
                    </button>
                </div>
            `;
            const retryBtn = document.getElementById('retry-analytics-btn');
            if (retryBtn) retryBtn.onclick = loadData;
        } finally {
            const refreshBtn = document.getElementById('refresh-analytics-btn');
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<span class="material-symbols-outlined text-base">refresh</span> Обновить аналитику';
            }
        }
    };

    document.getElementById('refresh-analytics-btn').onclick = loadData;
    loadData();
};
