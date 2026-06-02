/**
 * Renders the dashboard overview
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderDashboard(container, state) {
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Обзор системы</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Ключевые показатели эффективности и статус систем</p>
                </div>
                <div class="flex items-center gap-2">
                    <span id="connection-status" class="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[10px] uppercase font-bold tracking-widest text-green-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                        Связь с БД: OK
                    </span>
                </div>
            </div>

            <!-- Главные метрики -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                ${renderStatCard('Товары', '<div class="w-6 h-6 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>', 'inventory_2', '#ffb0cc')}
                ${renderStatCard('Заказы', '<div class="w-6 h-6 border-2 border-[#b0ccff]/20 border-t-[#b0ccff] rounded-full animate-spin"></div>', 'shopping_cart', '#b0ccff')}
                ${renderStatCard('Выручка (мес)', '<div class="w-6 h-6 border-2 border-[#ccffb0]/20 border-t-[#ccffb0] rounded-full animate-spin"></div>', 'payments', '#ccffb0')}
                ${renderStatCard('Лиды', '<div class="w-6 h-6 border-2 border-[#ffccb0]/20 border-t-[#ffccb0] rounded-full animate-spin"></div>', 'leaderboard', '#ffccb0')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Последние заказы -->
                <div class="lg:col-span-2 glass rounded-3xl p-8 flex flex-col relative overflow-hidden border border-white/5 min-h-[500px]">
                    <div class="absolute inset-0 bg-gradient-to-br from-[#b0ccff]/5 to-transparent pointer-events-none"></div>
                    <div class="relative z-10 flex flex-col h-full">
                        <div class="flex justify-between items-center mb-8">
                            <div>
                                <h4 class="font-['Space Grotesk'] font-bold text-lg flex items-center gap-2">
                                    <span class="material-symbols-outlined text-[#b0ccff]">shopping_cart</span>
                                    Последние заказы
                                </h4>
                                <p class="text-[10px] text-[#d7c1c7] opacity-40 uppercase tracking-widest mt-1">Оперативная обработка транзакций</p>
                            </div>
                            <button onclick="document.querySelector('[data-view=\\'orders\\']')?.click()" class="px-4 py-2 bg-[#b0ccff]/10 hover:bg-[#b0ccff]/20 rounded-xl text-[10px] uppercase tracking-widest font-bold text-[#b0ccff] transition-all">Все заказы</button>
                        </div>
                        <div id="recent-orders-list" class="flex-grow flex flex-col gap-3">
                            <div class="w-8 h-8 border-2 border-[#b0ccff]/20 border-t-[#b0ccff] rounded-full animate-spin self-center mt-20"></div>
                        </div>
                    </div>
                </div>

                <!-- Быстрые действия и Статистика -->
                <div class="flex flex-col gap-8">
                    <div class="glass rounded-3xl p-8 flex flex-col relative overflow-hidden border border-white/5">
                        <div class="absolute inset-0 bg-gradient-to-br from-[#ffb0cc]/5 to-transparent pointer-events-none"></div>
                        <div class="relative z-10 flex flex-col h-full">
                            <h4 class="font-['Space Grotesk'] font-bold text-lg flex items-center gap-2 mb-8">
                                <span class="material-symbols-outlined text-[#ffb0cc]">bolt</span>
                                Действия
                            </h4>
                            <div class="grid grid-cols-1 gap-3 flex-grow">
                                <button id="dashboard-add-product" class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#ffb0cc]/10 hover:border-[#ffb0cc]/30 transition-all group text-left">
                                    <span class="w-10 h-10 rounded-xl bg-[#ffb0cc]/10 flex items-center justify-center material-symbols-outlined text-xl text-[#ffb0cc] group-hover:scale-110 transition-transform">add_box</span>
                                    <div>
                                        <span class="text-xs font-bold uppercase tracking-widest text-[#e7e2dd] block">Новый товар</span>
                                        <span class="text-[9px] text-[#d7c1c7] opacity-40 uppercase tracking-tighter">Добавить в каталог</span>
                                    </div>
                                </button>
                                <button onclick="document.querySelector('[data-view=\\'analytics\\']')?.click()" class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-[#ccffb0]/10 hover:border-[#ccffb0]/30 transition-all group text-left">
                                    <span class="w-10 h-10 rounded-xl bg-[#ccffb0]/10 flex items-center justify-center material-symbols-outlined text-xl text-[#ccffb0] group-hover:scale-110 transition-transform">monitoring</span>
                                    <div>
                                        <span class="text-xs font-bold uppercase tracking-widest text-[#e7e2dd] block">Аналитика</span>
                                        <span class="text-[9px] text-[#d7c1c7] opacity-40 uppercase tracking-tighter">Открыть отчеты</span>
                                    </div>
                                </button>
                                <button onclick="window.open('/', '_blank')" class="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all group text-left">
                                    <span class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center material-symbols-outlined text-xl text-white group-hover:scale-110 transition-transform">open_in_new</span>
                                    <div>
                                        <span class="text-xs font-bold uppercase tracking-widest text-[#e7e2dd] block">Перейти на сайт</span>
                                        <span class="text-[9px] text-[#d7c1c7] opacity-40 uppercase tracking-tighter">Внешняя витрина</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Статус склада (Mock) -->
                    <div class="glass rounded-3xl p-8 border border-white/5">
                         <h4 class="font-['Space Grotesk'] font-bold text-sm uppercase tracking-widest text-[#d7c1c7] opacity-40 mb-6 flex items-center justify-between">
                            Статус БД
                            <span class="text-[9px] text-green-400">Online</span>
                         </h4>
                         <div class="space-y-6">
                            <div>
                                <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <span class="text-[#e7e2dd]">Загрузка БД</span>
                                    <span id="db-load-val" class="text-[#ffb0cc]">24%</span>
                                </div>
                                <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div class="h-full bg-[#ffb0cc]/40 w-[24%]"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-2">
                                    <span class="text-[#e7e2dd]">Память кэша</span>
                                    <span class="text-[#b0ccff]">12.4 MB</span>
                                </div>
                                <div class="h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div class="h-full bg-[#b0ccff]/40 w-[62%]"></div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        // Fetch products
        state.fetchProducts().then(products => {
            updateStat('inventory_2', products.length);
        }).catch(err => {
            console.error(err);
            updateStat('inventory_2', 'ERR');
        });

        // Fetch orders and calculate revenue
        state.fetchOrders().then(orders => {
            updateStat('shopping_cart', orders.length);
            
            // Monthly revenue calculation
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthlyRevenue = orders
                .filter(o => {
                    const status = (o.status || '').toUpperCase();
                    const isConfirmed = ['COMPLETED', 'SUCCESS', 'PAID', 'DELIVERED'].includes(status);
                    return isConfirmed && new Date(o.created_at) >= monthStart;
                })
                .reduce((sum, o) => sum + (Number(o.total || o.total_price) || 0), 0);
            
            updateStat('payments', `${monthlyRevenue.toLocaleString()} ₽`);
            
            // Render recent orders
            const listContainer = document.getElementById('recent-orders-list');
            if (listContainer) {
                if (!orders || orders.length === 0) {
                    listContainer.innerHTML = '<div class="text-sm text-[#d7c1c7] opacity-60 text-center mt-20">Нет недавних транзакций</div>';
                } else {
                    const recentOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
                    listContainer.innerHTML = recentOrders.map(order => {
                        const date = new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                        
                        let statusColor = 'text-gray-400';
                        let statusText = order.status || 'new';
                        let statusBg = 'bg-white/5';
                        
                        const status = (order.status || 'new').toLowerCase().trim();
                        if (status === 'completed') { statusColor = 'text-green-400'; statusText = 'Завершен'; statusBg = 'bg-green-400/10'; }
                        else if (status === 'new' || status === 'новый' || status === 'pending') { statusColor = 'text-blue-400'; statusText = 'Новый'; statusBg = 'bg-blue-400/10'; }
                        else if (status === 'processing' || status === 'in_progress') { statusColor = 'text-yellow-400'; statusText = 'В работе'; statusBg = 'bg-yellow-400/10'; }
                        else if (status === 'cancelled') { statusColor = 'text-red-400'; statusText = 'Отменен'; statusBg = 'bg-red-400/10'; }
                        
                        return `
                            <div class="flex items-center justify-between p-4 rounded-2xl bg-white/2 hover:bg-white/5 transition-all border border-white/5 cursor-pointer group" onclick="document.querySelector('[data-view=\\'orders\\']')?.click()">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#d7c1c7] group-hover:bg-[#b0ccff]/20 group-hover:text-[#b0ccff] transition-all">
                                        <span class="material-symbols-outlined text-sm">receipt_long</span>
                                    </div>
                                    <div>
                                        <div class="text-sm font-bold text-[#e7e2dd] uppercase tracking-tight">${order.customer_name || 'Инкогнито'}</div>
                                        <div class="text-[9px] text-[#d7c1c7] opacity-40 uppercase tracking-widest mt-0.5">${date}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-bold font-['Space Grotesk'] text-[#ffb0cc]">${Number(order.total || 0).toLocaleString('ru-RU')} ₽</div>
                                    <div class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${statusBg} ${statusColor} inline-block mt-1">${statusText}</div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        }).catch(err => {
            console.error(err);
            updateStat('shopping_cart', 'ERR');
            updateStat('payments', 'ERR');
        });

        // Fetch users
        state.fetchUsers().then(users => {
            updateStat('group', users.length);
        }).catch(err => {
            console.error(err);
            updateStat('group', 'ERR');
        });

        // Fetch leads
        state.fetchLeads().then(leads => {
            updateStat('leaderboard', leads.length);
        }).catch(err => {
            console.error(err);
            updateStat('leaderboard', 'ERR');
        });

        // Add Product Event
        const addProductBtn = document.getElementById('dashboard-add-product');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                const navBtn = document.querySelector('[data-view="products"]');
                if (navBtn) {
                    navBtn.click();
                    setTimeout(() => {
                        document.getElementById('add-product-btn')?.click();
                    }, 100);
                }
            });
        }

    } catch (err) {
        console.error('Error in renderDashboard:', err);
    }
}

function renderStatCard(label, value, icon, color) {
    return `
        <div class="glass rounded-3xl p-8 border-l-4 group hover:bg-white/2 transition-all cursor-default" style="border-left-color: ${color}">
            <div class="flex items-center justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-xl" style="color: ${color}">${icon}</span>
                </div>
                <div class="flex items-center gap-1">
                    <span class="w-1 h-1 rounded-full bg-green-400"></span>
                    <span class="text-[9px] uppercase tracking-widest font-bold text-[#d7c1c7] opacity-40">Live</span>
                </div>
            </div>
            <div class="text-2xl font-bold font-['Space Grotesk'] mb-1 stat-value truncate text-[#e7e2dd]" data-icon="${icon}">${value}</div>
            <div class="text-[10px] uppercase tracking-widest font-bold text-[#d7c1c7] opacity-40">${label}</div>
        </div>
    `;
}

function updateStat(icon, value) {
    const el = document.querySelector(`.stat-value[data-icon="${icon}"]`);
    if (el) el.innerHTML = value;
}
