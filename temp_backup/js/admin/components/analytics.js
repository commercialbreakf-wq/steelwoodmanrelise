export const renderAnalyticsView = async (container, state) => {
    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Финансовая отчетность</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Продуктовая и финансовая аналитика по всем каналам продаж</p>
                </div>
                <div class="flex gap-2">
                    <button id="refresh-analytics-btn" class="flex items-center justify-center gap-2 px-6 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                        <span class="material-symbols-outlined text-base">refresh</span>
                        Обновить аналитику
                    </button>
                </div>
            </div>

            <div id="analytics-stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center animate-pulse bg-white/5 h-40"></div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Monthly Revenue Trend -->
                <div class="glass lg:col-span-2 rounded-[2.5rem] p-8 border-white/5 min-h-[450px] flex flex-col">
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight">Динамика выручки</h4>
                            <p class="text-[10px] text-[#d7c1c7] opacity-40 uppercase tracking-widest mt-1">Подтвержденные продажи за последние 30 дней</p>
                        </div>
                        <div id="total-month-rev" class="text-right">
                             <div class="text-lg font-bold text-[#ffb0cc]">0 ₽</div>
                             <div class="text-[9px] uppercase font-bold text-[#d7c1c7] opacity-30">Итого за период</div>
                        </div>
                    </div>
                    <div id="revenue-chart" class="flex-1 flex items-end gap-1.5 h-64 border-b border-white/5 pb-2">
                        <div class="flex items-center justify-center w-full h-full text-[#d7c1c7] opacity-20">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Анализ транзакций...</span>
                        </div>
                    </div>
                    <div class="flex justify-between mt-4 text-[9px] uppercase font-bold tracking-widest text-[#d7c1c7] opacity-30">
                        <span>30 дней назад</span>
                        <span>Сегодня</span>
                    </div>
                </div>

                <!-- Sales Efficiency -->
                <div class="glass rounded-[2.5rem] p-8 border-white/5 min-h-[450px] flex flex-col">
                    <h4 class="text-lg font-bold font-['Space Grotesk'] mb-8 uppercase tracking-tight">Эффективность</h4>
                    <div id="sales-efficiency" class="flex-1 space-y-8">
                        <div class="flex items-center justify-center h-full text-[#d7c1c7] opacity-30">
                            <span class="text-[10px] uppercase font-bold tracking-widest">Расчет KPI...</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Top Revenue Drivers -->
                <div class="glass rounded-[2.5rem] p-8 border-white/5 min-h-[400px]">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight">Топ драйверов выручки</h4>
                        <span class="material-symbols-outlined text-[#ffb0cc]">trending_up</span>
                    </div>
                    <div id="top-revenue-products" class="space-y-4">
                        <div class="text-center py-20 opacity-30">Обработка товарных позиций...</div>
                    </div>
                </div>

                <!-- Status & Risk Analysis -->
                <div class="glass rounded-[2.5rem] p-8 border-white/5 min-h-[400px]">
                    <div class="flex items-center justify-between mb-6">
                        <h4 class="text-lg font-bold font-['Space Grotesk'] uppercase tracking-tight">Статус воронки и риски</h4>
                        <span class="material-symbols-outlined text-[#ffb0cc]">analytics</span>
                    </div>
                    <div id="status-distribution" class="space-y-6">
                        <div class="text-center py-20 opacity-30">Анализ жизненного цикла заказов...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

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
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center group hover:bg-[#ffb0cc]/5 transition-all">
                    <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">payments</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-[#e7e2dd]">${totalRevenue.toLocaleString()} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Выручка (завершено)</div>
                </div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center group hover:bg-[#ffb0cc]/5 transition-all">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#d7c1c7] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">query_stats</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-[#e7e2dd]">${estimatedProfit.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Прибыль (est. 15%)</div>
                </div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center group hover:bg-[#ffb0cc]/5 transition-all">
                    <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">receipt_long</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-[#e7e2dd]">${averageCheck.toLocaleString(undefined, {maximumFractionDigits: 0})} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">Средний чек</div>
                </div>
                <div class="glass p-8 rounded-3xl border-[#ffb0cc]/20 flex flex-col items-center text-center group hover:bg-[#ffb0cc]/5 transition-all">
                    <div class="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#d7c1c7] mb-4 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined">hourglass_empty</span>
                    </div>
                    <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 text-[#e7e2dd]">${pendingRevenue.toLocaleString()} ₽</div>
                    <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40">В работе (потенциал)</div>
                </div>
            `;

            // 2. Revenue Dynamics Chart (Last 30 days)
            const days = 30;
            const revenueByDay = new Array(days).fill(0);
            const now = new Date();
            
            // Generate labels for the last 30 days for debugging/clarity
            const dailyLabels = [];
            for (let i = 0; i < days; i++) {
                const d = new Date();
                d.setDate(now.getDate() - (days - 1 - i));
                dailyLabels.push(d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }));
            }

            confirmedOrders.forEach(order => {
                const orderDate = new Date(order.created_at);
                if (isNaN(orderDate.getTime())) return;
                
                const diffTime = now.getTime() - orderDate.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays >= 0 && diffDays < days) {
                    revenueByDay[days - 1 - diffDays] += Number(order.total_price || order.total) || 0;
                }
            });

            console.log('[ANALYTICS] Revenue by day:', revenueByDay);
            document.getElementById('total-month-rev').querySelector('.text-lg').textContent = `${revenueByDay.reduce((a, b) => a + b, 0).toLocaleString()} ₽`;

            const maxDailyRev = Math.max(...revenueByDay, 5000);
            document.getElementById('revenue-chart').innerHTML = revenueByDay.map((rev, i) => {
                const height = (rev / maxDailyRev * 100).toFixed(0);
                const isToday = i === days - 1;
                return `
                    <div class="flex-1 ${isToday ? 'bg-[#ffb0cc]' : 'bg-[#ffb0cc]/20'} hover:bg-[#ffb0cc] transition-all relative group cursor-pointer" style="height: ${Math.max(height, 2)}%">
                        <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#1d1b19] border border-[#ffb0cc]/30 text-[#e7e2dd] text-[10px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none shadow-2xl">
                            <div class="text-[#ffb0cc] mb-0.5">${rev.toLocaleString()} ₽</div>
                            <div class="text-[8px] opacity-40 uppercase">${dailyLabels[i]}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // 3. Sales Efficiency & Funnel
            const leadCount = leads.length;
            const totalOrderCount = orders.length;
            const confirmedCount = confirmedOrders.length;
            
            const leadToOrderConv = leadCount > 0 ? (totalOrderCount / leadCount * 100).toFixed(1) : 0;
            const orderToPaidConv = totalOrderCount > 0 ? (confirmedCount / totalOrderCount * 100).toFixed(1) : 0;

            document.getElementById('sales-efficiency').innerHTML = `
                <div class="space-y-8">
                    <div class="glass p-6 rounded-2xl bg-white/2">
                        <div class="flex justify-between items-end mb-4">
                            <div>
                                <div class="text-2xl font-bold font-['Space Grotesk'] text-[#ffb0cc]">${leadToOrderConv}%</div>
                                <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40 tracking-widest mt-1">Лиды → Заказы</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-[#e7e2dd]">${totalOrderCount}</div>
                                <div class="text-[9px] text-[#d7c1c7] opacity-30 uppercase">конверсия</div>
                            </div>
                        </div>
                        <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-[#ffb0cc]" style="width: ${Math.min(leadToOrderConv, 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="glass p-6 rounded-2xl bg-white/2">
                        <div class="flex justify-between items-end mb-4">
                            <div>
                                <div class="text-2xl font-bold font-['Space Grotesk'] text-[#e7e2dd]">${orderToPaidConv}%</div>
                                <div class="text-[10px] uppercase font-bold text-[#d7c1c7] opacity-40 tracking-widest mt-1">Заказы → Оплаты</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-bold text-[#e7e2dd]">${confirmedCount}</div>
                                <div class="text-[9px] text-[#d7c1c7] opacity-30 uppercase">успех</div>
                            </div>
                        </div>
                        <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div class="h-full bg-[#d7c1c7]" style="width: ${Math.min(orderToPaidConv, 100)}%"></div>
                        </div>
                    </div>

                    <div class="bg-[#ffb0cc]/5 border border-[#ffb0cc]/10 p-4 rounded-2xl">
                         <div class="flex items-center gap-2 mb-2">
                            <span class="material-symbols-outlined text-[#ffb0cc] text-sm">info</span>
                            <span class="text-[10px] uppercase font-bold text-[#ffb0cc] tracking-widest">Итоговая конверсия</span>
                         </div>
                         <div class="text-xl font-bold text-[#e7e2dd]">${leadCount > 0 ? (confirmedCount / leadCount * 100).toFixed(1) : 0}%</div>
                         <p class="text-[9px] text-[#d7c1c7] opacity-40 mt-1 italic">Процент оплаченных заказов от общего числа входящих лидов за все время.</p>
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
                <div class="flex items-center justify-between p-4 bg-white/2 rounded-2xl border border-white/5 hover:border-[#ffb0cc]/20 transition-all group">
                    <div class="flex items-center gap-4 min-w-0">
                        <div class="w-10 h-10 rounded-xl bg-[#ffb0cc]/10 flex items-center justify-center text-[#ffb0cc] group-hover:bg-[#ffb0cc] group-hover:text-[#0f0e0c] transition-all font-bold text-xs">
                            ${i + 1}
                        </div>
                        <div class="truncate">
                            <div class="text-sm font-bold text-[#e7e2dd] truncate">${name}</div>
                            <div class="text-[10px] text-[#d7c1c7] opacity-40">${data.count.toLocaleString()} ед. продано</div>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <div class="text-sm font-bold text-[#ffb0cc]">${data.revenue.toLocaleString()} ₽</div>
                        <div class="text-[9px] uppercase font-bold text-[#d7c1c7] opacity-20 tracking-tighter">${(data.revenue / totalRevenue * 100).toFixed(1)}% доли</div>
                    </div>
                </div>
            `).join('') : '<div class="text-center py-20 opacity-30">Нет детальных данных о продажах</div>';

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
                                <span class="text-[11px] font-bold uppercase tracking-wider text-[#e7e2dd]">${cfg.label}</span>
                            </div>
                            <div class="text-right">
                                <span class="text-xs font-bold text-[#ffb0cc]">${data.revenue.toLocaleString()} ₽</span>
                                <span class="text-[9px] text-[#d7c1c7] opacity-30 ml-2">${data.count} зак.</span>
                            </div>
                        </div>
                        <div class="h-1 bg-white/5 rounded-full overflow-hidden">
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
                    <h4 class="text-lg font-bold font-['Space Grotesk'] text-[#e7e2dd] mb-2">Ошибка синхронизации данных</h4>
                    <p class="text-sm text-[#d7c1c7] opacity-60 max-w-md mx-auto mb-8">${e.message}</p>
                    <button id="retry-analytics-btn" class="px-8 py-4 bg-white/5 hover:bg-white/10 text-[#ffb0cc] rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
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
