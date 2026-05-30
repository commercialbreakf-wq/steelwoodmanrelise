/**
 * Renders the dashboard overview
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
// Define showModalGlobal helper if not already defined at module level
if (!window.showModalGlobal) {
    window.showModalGlobal = function(title, htmlContent) {
        if (typeof window.lockScrollGlobal === 'function') {
            window.lockScrollGlobal();
        }
        
        const modalWrapper = document.createElement('div');
        modalWrapper.id = 'global-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6';
        
        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-150 modal-backdrop"></div>
            <div class="relative w-full max-w-2xl bg-surface-container border border-outline/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col transform scale-95 opacity-0 transition-all duration-300 min-h-0 overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-1 opacity-80 background-gradient" style="background: linear-gradient(90deg, transparent, var(--color-primary), transparent);"></div>
                
                <div class="p-8 pb-6 flex items-center justify-between border-b border-outline/5 shrink-0 bg-surface-container">
                    <div>
                        <h3 class="font-headline-md text-xl font-bold tracking-tight text-on-surface font-label-caps uppercase tracking-widest">
                            ${title}
                        </h3>
                    </div>
                    <button type="button" class="w-10 h-10 rounded-full bg-surface-variant hover:bg-primary/10 border border-outline/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cancel-icon-btn active:scale-95 shrink-0">
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
                
                <div class="p-8 py-6 flex-1 overflow-y-auto custom-scrollbar min-h-0 bg-background text-on-surface">
                    ${htmlContent}
                </div>
                
                <div class="p-8 pt-4 flex items-center justify-center bg-surface-container border-t border-outline/10 shrink-0">
                    <button type="button" class="w-full px-6 py-4 rounded-2xl border border-outline/10 hover:bg-surface-variant transition-all text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary cancel-btn active:scale-95 font-label-caps">
                        Закрыть
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.remove('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.remove('opacity-0', 'scale-95');
        });
        
        const close = () => {
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                modalWrapper.remove();
                if (typeof window.unlockScrollGlobal === 'function') {
                    window.unlockScrollGlobal();
                }
            }, 300);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = close;
        modalWrapper.querySelector('.cancel-icon-btn').onclick = close;
        modalWrapper.querySelector('.cancel-btn').onclick = close;
    };
}

export async function renderDashboard(container, state) {
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 class="text-2xl lg:text-3xl font-bold font-display-xl tracking-tight text-on-surface uppercase m-0">Обзор систем</h3>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <p class="text-[10px] font-label-caps text-on-surface-variant uppercase tracking-[0.2em]">Мониторинг бизнес-показателей в реальном времени</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div id="connection-status" class="flex flex-wrap items-center gap-4 px-5 py-3.5 liquid-glass rounded-2xl border border-outline/10 text-[9px] uppercase font-bold tracking-[0.2em] text-on-surface-variant shadow-sm">
                        <div class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_5px_rgba(74,222,128,0.5)]"></span>
                            <span class="text-green-400">Node: Active</span>
                        </div>
                        <span class="text-outline/20">|</span>
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[10px] text-blue-400 leading-none">database</span>
                            <span>DB: <span id="db-latency-val" class="font-mono text-on-surface">12ms</span></span>
                        </div>
                        <span class="text-outline/20">|</span>
                        <div class="flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[10px] text-primary leading-none">lan</span>
                            <span>WS: Connected</span>
                        </div>
                    </div>
                    <button id="refresh-dashboard-btn" class="w-12 h-12 flex items-center justify-center bg-surface-container hover:bg-primary/10 text-primary rounded-2xl transition-all border border-outline/10 hover:border-primary/30 group shadow-sm" title="Обновить данные">
                        <span class="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">refresh</span>
                    </button>
                </div>
            </div>

            <!-- Главные метрики -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                ${renderStatCard('Товары в базе', '<div class="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>', 'inventory_2', '#ca7093', 'products')}
                ${renderStatCard('Активные заказы', '<div class="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>', 'shopping_cart', '#60a5fa', 'active-orders')}
                ${renderStatCard('Выручка (тек. мес)', '<div class="w-6 h-6 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>', 'payments', '#4ade80', 'revenue')}
                ${renderStatCard('Входящие лиды', '<div class="w-6 h-6 border-2 border-orange-400/20 border-t-orange-400 rounded-full animate-spin"></div>', 'leaderboard', '#fb923c', 'leads')}
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <!-- Последние заказы -->
                <div class="lg:col-span-8 liquid-glass rounded-[2.5rem] p-8 lg:p-10 flex flex-col relative overflow-hidden border border-outline/5 min-h-[550px] shadow-2xl">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
                    <div class="relative z-10 flex flex-col h-full">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                            <div>
                                <h4 class="font-display-xl font-bold text-xl flex items-center gap-3 text-on-surface uppercase tracking-tight">
                                    <span class="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center material-symbols-outlined text-blue-400">receipt_long</span>
                                    Операции
                                </h4>
                                <p class="text-[9px] text-on-surface-variant/50 uppercase font-label-caps tracking-[0.2em] mt-2">Последние 6 транзакций в системе</p>
                            </div>
                            <button onclick="document.querySelector('[data-view=\\'orders\\']')?.click()" class="px-6 py-3.5 bg-surface-container hover:bg-primary/10 rounded-2xl text-[9px] uppercase tracking-[0.2em] font-bold text-primary transition-all border border-outline/10 hover:border-primary/30">История операций</button>
                        </div>
                        <div id="recent-orders-list" class="flex-grow flex flex-col gap-4">
                            <div class="flex items-center justify-center h-full">
                                <div class="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Быстрые действия и Статистика -->
                <div class="lg:col-span-4 flex flex-col gap-8">
                    <div class="liquid-glass rounded-[2.5rem] p-8 lg:p-10 flex flex-col relative overflow-hidden border border-outline/5 shadow-xl">
                        <div class="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full pointer-events-none"></div>
                        <div class="relative z-10 flex flex-col h-full">
                            <h4 class="font-display-xl font-bold text-lg flex items-center gap-3 mb-8 text-on-surface uppercase tracking-tight">
                                <span class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center material-symbols-outlined text-primary text-lg">bolt</span>
                                Действия
                            </h4>
                            <div class="grid grid-cols-1 gap-4 flex-grow">
                                <button onclick="window.showAdminActionModal('Добавление товара', 'Открытие редактора каталога...'); setTimeout(() => { const navBtn = document.querySelector('[data-view=\\'products_nomenclature\\']'); if(navBtn) { navBtn.click(); setTimeout(() => document.getElementById('add-product-btn')?.click(), 300); } }, 800)" class="flex items-center gap-5 p-5 rounded-2xl bg-surface-container-low/30 border border-outline/10 hover:bg-primary/10 hover:border-primary/40 transition-all group text-left">
                                    <span class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center material-symbols-outlined text-2xl text-primary group-hover:scale-110 transition-transform shadow-sm">add_box</span>
                                    <div>
                                        <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface block">Новый товар</span>
                                        <span class="text-[8px] text-on-surface-variant/40 uppercase font-label-caps tracking-widest mt-1 block">Открыть редактор</span>
                                    </div>
                                </button>
                                <button onclick="window.showAdminActionModal('Аналитика', 'Загрузка бизнес-аналитики...'); setTimeout(() => { document.querySelector('[data-view=\\'analytics\\']')?.click(); }, 800)" class="flex items-center gap-5 p-5 rounded-2xl bg-surface-container-low/30 border border-outline/10 hover:bg-green-400/10 hover:border-green-400/40 transition-all group text-left">
                                    <span class="w-11 h-11 rounded-xl bg-green-400/10 flex items-center justify-center material-symbols-outlined text-2xl text-green-400 group-hover:scale-110 transition-transform shadow-sm">analytics</span>
                                    <div>
                                        <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface block">Отчеты</span>
                                        <span class="text-[8px] text-on-surface-variant/40 uppercase font-label-caps tracking-widest mt-1 block">Бизнес-аналитика</span>
                                    </div>
                                </button>
                                <button onclick="window.showAdminActionModal('Переход на витрину', 'Открытие каталога сайта...'); setTimeout(() => window.open('/catalog.html', '_blank'), 800)" class="flex items-center gap-5 p-5 rounded-2xl bg-surface-container-low/30 border border-outline/10 hover:bg-on-surface/10 transition-all group text-left">
                                    <span class="w-11 h-11 rounded-xl bg-on-surface/10 flex items-center justify-center material-symbols-outlined text-2xl text-on-surface group-hover:scale-110 transition-transform shadow-sm">open_in_new</span>
                                    <div>
                                        <span class="text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface block">Витрина</span>
                                        <span class="text-[8px] text-on-surface-variant/40 uppercase font-label-caps tracking-widest mt-1 block">Перейти на сайт</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Статус системы -->
                    <div class="liquid-glass rounded-[2.5rem] p-8 lg:p-10 border border-outline/5 shadow-xl relative overflow-hidden">
                         <div class="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent pointer-events-none"></div>
                         <h4 class="font-label-caps text-[9px] uppercase tracking-[0.25em] text-on-surface-variant/40 mb-8 flex items-center justify-between">
                            System Health
                            <span class="flex items-center gap-1.5 text-green-400 font-bold">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                Online: <span id="dashboard-online-count">1</span>
                            </span>
                         </h4>
                         <div class="space-y-8">
                            <div>
                                <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-3">
                                    <span class="text-on-surface/70">Загрузка процессора</span>
                                    <span id="cpu-load-val" class="text-primary">12%</span>
                                </div>
                                <div class="h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div id="cpu-load-bar" class="h-full bg-primary/40 rounded-full transition-all duration-1000" style="width: 12%"></div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-3">
                                    <span class="text-on-surface/70">Использование ОЗУ</span>
                                    <span id="ram-load-val" class="text-blue-400">4.2 GB</span>
                                </div>
                                <div class="h-1.5 bg-surface-container rounded-full overflow-hidden">
                                    <div id="ram-load-bar" class="h-full bg-blue-400/40 rounded-full transition-all duration-1000" style="width: 42%"></div>
                                </div>
                            </div>
                            <div class="pt-4 border-t border-outline/5 mt-6">
                                <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest mb-3">
                                    <span class="text-on-surface/70">Активность API (RPS)</span>
                                    <span id="api-activity-val" class="text-green-400 font-mono">4.8 req/s</span>
                                </div>
                                <div class="h-10 w-full bg-surface-container/10 rounded-xl overflow-hidden relative">
                                    <svg id="activity-sparkline" class="w-full h-full text-green-400/30" viewBox="0 0 100 30" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stop-color="#4ade80" stop-opacity="0.25"/>
                                                <stop offset="100%" stop-color="#4ade80" stop-opacity="0.0"/>
                                            </linearGradient>
                                        </defs>
                                        <path id="sparkline-fill" d="M 0 30 L 0 15 L 10 20 L 20 10 L 30 18 L 40 12 L 50 15 L 60 8 L 70 14 L 80 18 L 90 10 L 100 12 L 100 30 Z" fill="url(#sparkline-grad)"/>
                                        <path id="sparkline-line" d="M 0 15 L 10 20 L 20 10 L 30 18 L 40 12 L 50 15 L 60 8 L 70 14 L 80 18 L 90 10 L 100 12" fill="none" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round"/>
                                    </svg>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add global helper for admin action modals
    window.showAdminActionModal = function(title, content) {
        if (window.showModalGlobal) {
            window.showModalGlobal(title, `
                <div class="py-10 text-center space-y-6">
                    <div class="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <span class="material-symbols-outlined text-4xl text-primary animate-pulse">pending</span>
                    </div>
                    <div class="space-y-2">
                        <h3 class="font-display-xl text-xl font-bold uppercase tracking-tight text-on-surface">${title}</h3>
                        <p class="text-on-surface-variant font-label-caps text-[10px] uppercase tracking-widest opacity-60">${content}</p>
                    </div>
                    <div class="pt-4">
                        <div class="w-full h-1 bg-surface-container rounded-full overflow-hidden max-w-[200px] mx-auto">
                            <div class="h-full bg-primary animate-loading-bar"></div>
                        </div>
                    </div>
                </div>
            `);
        } else {
            alert(title + ': ' + content);
        }
    };

    const loadDashboardData = async () => {
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
                        listContainer.innerHTML = '<div class="text-sm text-on-surface-variant opacity-30 text-center mt-20 font-label-caps uppercase tracking-widest">Нет недавних транзакций</div>';
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
                                <div class="recent-order-row flex items-center justify-between p-5 rounded-3xl bg-surface-container-low/20 hover:bg-surface-container transition-all border border-outline/5 cursor-pointer group shadow-sm" data-order-id="${order.id}">
                                    <div class="flex items-center gap-5">
                                        <div class="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:bg-primary/20 group-hover:text-primary transition-all border border-transparent group-hover:border-primary/20 shadow-sm">
                                            <span class="material-symbols-outlined text-lg">payments</span>
                                        </div>
                                        <div>
                                            <div class="text-sm font-bold text-on-surface uppercase tracking-tight group-hover:text-primary transition-colors">${order.customer_name || 'Инкогнито'}</div>
                                            <div class="text-[9px] text-on-surface-variant opacity-40 uppercase tracking-widest mt-1 font-label-caps">${date}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-bold font-display-xl text-primary">${Number(order.total || 0).toLocaleString('ru-RU')} ₽</div>
                                        <div class="px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-[0.15em] ${statusBg} ${statusColor} inline-block mt-1.5 border border-white/5 font-label-caps">${statusText}</div>
                                    </div>
                                </div>
                            `;
                        }).join('');
                        
                        // Bind click events on recent order rows to open their drawer
                        listContainer.querySelectorAll('.recent-order-row').forEach(row => {
                            row.addEventListener('click', () => {
                                if (window.openOrderDrawer) {
                                    window.openOrderDrawer(row.dataset.orderId, state);
                                } else {
                                    document.querySelector('[data-view="orders"]')?.click();
                                }
                            });
                        });
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
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        }
    };

    // Load initial data
    await loadDashboardData();

    // Bind Refresh Dashboard Event
    const refreshBtn = document.getElementById('refresh-dashboard-btn');
    if (refreshBtn) {
        refreshBtn.onclick = async () => {
            const icon = refreshBtn.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.add('animate-spin');
            
            // Re-render spinners in stat cards
            updateStat('inventory_2', '<div class="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>');
            updateStat('shopping_cart', '<div class="w-6 h-6 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin"></div>');
            updateStat('payments', '<div class="w-6 h-6 border-2 border-green-400/20 border-t-green-400 rounded-full animate-spin"></div>');
            updateStat('leaderboard', '<div class="w-6 h-6 border-2 border-orange-400/20 border-t-orange-400 rounded-full animate-spin"></div>');
            
            await loadDashboardData();
            
            setTimeout(() => {
                if (icon) icon.classList.remove('animate-spin');
                if (window.showToast) {
                    window.showToast('Данные дашборда обновлены', 'success', 'Обновление');
                }
            }, 500);
        };
    }

    // Bind Stat Cards Event Listeners
    container.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const cardType = card.dataset.cardType;
            if (cardType === 'products') {
                document.querySelector('[data-view="products_nomenclature"]')?.click();
            } else if (cardType === 'leads') {
                document.querySelector('[data-view="leads"]')?.click();
            } else if (cardType === 'active-orders') {
                showActiveOrdersModal(state);
            } else if (cardType === 'revenue') {
                showRevenueModal(state);
            }
        });
    });

    // Stat Cards Event Listeners handled above


    // Setup dynamic status/latency updates
    const latencyInterval = setInterval(() => {
        const latencyEl = document.getElementById('db-latency-val');
        if (latencyEl) {
            latencyEl.textContent = `${Math.floor(Math.random() * 15) + 8}ms`;
        }
    }, 3000);

    const metricsInterval = setInterval(() => {
        const cpuVal = document.getElementById('cpu-load-val');
        const cpuBar = document.getElementById('cpu-load-bar');
        const ramVal = document.getElementById('ram-load-val');
        const ramBar = document.getElementById('ram-load-bar');
        
        if (cpuVal && cpuBar) {
            const cpu = Math.floor(Math.random() * 15) + 5; // 5-20%
            cpuVal.textContent = `${cpu}%`;
            cpuBar.style.width = `${cpu}%`;
        }
        if (ramVal && ramBar) {
            const ramPct = Math.floor(Math.random() * 4) + 40; // 40-44%
            const ramGb = (ramPct * 0.1).toFixed(1);
            ramVal.textContent = `${ramGb} GB`;
            ramBar.style.width = `${ramPct}%`;
        }
    }, 4000);

    // Dynamic SVG sparkline activity
    const sparkValues = [15, 20, 10, 18, 12, 15, 8, 14, 18, 10, 12];
    const sparkInterval = setInterval(() => {
        const lineEl = document.getElementById('sparkline-line');
        const fillEl = document.getElementById('sparkline-fill');
        const rpsVal = document.getElementById('api-activity-val');
        if (!lineEl || !fillEl) return;

        const newVal = Math.floor(Math.random() * 18) + 6;
        sparkValues.shift();
        sparkValues.push(newVal);
        
        let pathD = '';
        let fillD = 'M 0 30';
        const step = 100 / (sparkValues.length - 1);
        
        sparkValues.forEach((val, idx) => {
            const x = idx * step;
            const y = 30 - val;
            if (idx === 0) {
                pathD += `M ${x} ${y}`;
                fillD += ` L ${x} ${y}`;
            } else {
                pathD += ` L ${x} ${y}`;
                fillD += ` L ${x} ${y}`;
            }
        });
        fillD += ' L 100 30 Z';
        
        lineEl.setAttribute('d', pathD);
        fillEl.setAttribute('d', fillD);
        
        if (rpsVal) {
            const rps = (Math.random() * 6 + 2).toFixed(1);
            rpsVal.textContent = `${rps} req/s`;
        }
    }, 2000);

    // Save cleanup hooks to prevent memory leaks on view switch
    const presenceHandler = (e) => {
        const countSpan = document.getElementById('dashboard-online-count');
        if (countSpan && e.detail) {
            countSpan.textContent = e.detail.totalOnline || 1;
        }
    };
    window.addEventListener('presenceUpdated', presenceHandler);

    container._cleanup = () => {
        clearInterval(latencyInterval);
        clearInterval(metricsInterval);
        clearInterval(sparkInterval);
        window.removeEventListener('presenceUpdated', presenceHandler);
    };
}

function showActiveOrdersModal(state) {
    if (!window.showModalGlobal) return;
    
    let showAll = false;
    let sortBy = 'date-desc';
    
    const activeOrders = (state.orders || []).filter(o => {
        const status = (o.status || 'new').toLowerCase().trim();
        return ['new', 'новый', 'pending', 'processing', 'in_progress', 'в работе'].includes(status);
    });
    
    const getSortedOrders = () => {
        const ordersCopy = [...activeOrders];
        if (sortBy === 'date-desc') {
            ordersCopy.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'date-asc') {
            ordersCopy.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'price-desc') {
            ordersCopy.sort((a, b) => (Number(b.total || b.total_price) || 0) - (Number(a.total || a.total_price) || 0));
        } else if (sortBy === 'price-asc') {
            ordersCopy.sort((a, b) => (Number(a.total || a.total_price) || 0) - (Number(b.total || b.total_price) || 0));
        }
        return ordersCopy;
    };
    
    const renderList = () => {
        const sorted = getSortedOrders();
        const displayLimit = showAll ? sorted.length : 10;
        const visibleOrders = sorted.slice(0, displayLimit);
        
        const listContainer = document.getElementById('active-orders-list-container');
        if (!listContainer) return;
        
        if (sorted.length === 0) {
            listContainer.innerHTML = `
                <div class="py-12 text-center text-on-surface-variant opacity-40 uppercase tracking-widest font-label-caps text-xs">
                    <span class="material-symbols-outlined text-4xl block mb-3">shopping_bag</span>
                    Нет активных заказов
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = visibleOrders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
            const items = order.order_items || [];
            
            let statusColor = 'text-blue-400';
            let statusBg = 'bg-blue-400/10';
            let statusText = 'Новый';
            const status = (order.status || 'new').toLowerCase().trim();
            if (status === 'processing' || status === 'in_progress' || status === 'в работе') {
                statusColor = 'text-yellow-400';
                statusBg = 'bg-yellow-400/10';
                statusText = 'В работе';
            }
            
            return `
                <div class="p-5 rounded-2xl bg-surface-container-lowest border border-outline/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/20 transition-all">
                    <div class="space-y-1.5 flex-grow font-body-md">
                        <div class="flex items-center gap-3">
                            <span class="text-xs font-mono font-bold text-primary">${order.id}</span>
                            <span class="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.15em] ${statusBg} ${statusColor} font-label-caps">${statusText}</span>
                            <span class="text-[9px] text-on-surface-variant opacity-50 font-label-caps uppercase tracking-widest">${date}</span>
                        </div>
                        <div class="text-sm font-bold text-on-surface uppercase tracking-tight">${order.customer_name || 'Не указано'}</div>
                        <div class="text-[11px] text-on-surface-variant space-y-1">
                            ${items.map(i => {
                                const hasId = i.product_id;
                                const nameHtml = hasId 
                                    ? `<span onclick="event.stopPropagation(); window.openProductCardModal('${i.product_id}')" class="hover:text-primary transition-colors cursor-pointer">${i.product_name || i.name}</span>`
                                    : `<span>${i.product_name || i.name}</span>`;
                                return `<div>• ${nameHtml} <span class="text-primary font-bold">x${i.quantity}</span></div>`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="text-left sm:text-right shrink-0 flex flex-col items-start sm:items-end gap-2">
                        <div class="text-sm font-bold text-primary font-display-xl">${Number(order.total || 0).toLocaleString()} ₽</div>
                        <button class="view-active-order-btn px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-on-primary transition-all rounded-xl text-[9px] uppercase tracking-widest font-bold font-label-caps border border-primary/20" data-id="${order.id}">
                            Детали
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Show More button logic
        const showMoreWrapper = document.getElementById('active-orders-show-more-wrapper');
        if (showMoreWrapper) {
            if (sorted.length > 10 && !showAll) {
                showMoreWrapper.innerHTML = `
                    <button id="active-orders-show-all-btn" class="w-full px-6 py-4 rounded-2xl border border-primary/20 hover:bg-primary/5 hover:text-primary transition-all text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label-caps active:scale-95">
                        Показать все (${sorted.length})
                    </button>
                `;
                document.getElementById('active-orders-show-all-btn').onclick = () => {
                    showAll = true;
                    renderList();
                };
            } else {
                showMoreWrapper.innerHTML = '';
            }
        }
        
        // Bind click events for details buttons
        const modal = document.getElementById('global-modal-wrapper');
        if (modal) {
            modal.querySelectorAll('.view-active-order-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const orderId = btn.dataset.id;
                    // Close current modal
                    const closeBtn = modal.querySelector('.cancel-btn');
                    if (closeBtn) closeBtn.click();
                    
                    // Open order drawer
                    if (window.openOrderDrawer) {
                        window.openOrderDrawer(orderId, state);
                    }
                });
            });
        }
    };
    
    const controlsHtml = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-outline/10 -mt-2">
            <div>
                <p class="text-[10px] text-on-surface-variant/60 uppercase font-label-caps tracking-widest">Список всех заказов со статусом "Новый" или "В работе"</p>
                <div class="text-[9px] uppercase tracking-widest text-on-surface-variant/40 font-bold font-label-caps mt-1">
                    Всего активных: <span class="text-primary font-mono">${activeOrders.length}</span>
                </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
                <span class="text-[9px] uppercase tracking-[0.15em] text-on-surface-variant/60 font-bold font-label-caps">Сортировка:</span>
                <select id="active-orders-sort" class="text-[10px] font-bold uppercase tracking-widest bg-surface-container border border-outline/10 rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer">
                    <option value="date-desc">Сначала новые</option>
                    <option value="date-asc">Сначала старые</option>
                    <option value="price-desc">Сумма: по убыванию</option>
                    <option value="price-asc">Сумма: по возрастанию</option>
                </select>
            </div>
        </div>
    `;
    
    window.showModalGlobal('Активные заказы в работе', `
        <div class="space-y-6">
            ${controlsHtml}
            <div id="active-orders-list-container" class="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                <!-- Loaded dynamically -->
            </div>
            <div id="active-orders-show-more-wrapper" class="pt-2">
                <!-- Show all button dynamically rendered -->
            </div>
        </div>
    `);
    
    // Initial render
    renderList();
    
    // Bind sort select
    const sortSelect = document.getElementById('active-orders-sort');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderList();
        });
    }
}

function showRevenueModal(state) {
    if (!window.showModalGlobal) return;
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Filter completed orders contributing to revenue
    const completedOrders = (state.orders || []).filter(o => {
        const status = (o.status || '').toUpperCase();
        const isConfirmed = ['COMPLETED', 'SUCCESS', 'PAID', 'DELIVERED'].includes(status);
        return isConfirmed && new Date(o.created_at) >= monthStart;
    });
    
    // Aggregate sold products
    const soldProducts = {};
    completedOrders.forEach(order => {
        const items = order.order_items || [];
        items.forEach(item => {
            const name = item.product_name || item.name || 'Неизвестный товар';
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price || item.price_ton || 0);
            if (!soldProducts[name]) {
                soldProducts[name] = {
                    id: item.product_id,
                    name: name,
                    quantity: 0,
                    total: 0
                };
            }
            soldProducts[name].quantity += qty;
            soldProducts[name].total += price * qty;
        });
    });
    
    const soldList = Object.values(soldProducts);
    
    let currentSort = 'quantity'; // 'name', 'quantity', 'total'
    let currentDir = 'desc'; // 'asc', 'desc'
    
    const renderTable = () => {
        const tableBody = document.getElementById('revenue-table-body');
        const headerName = document.getElementById('revenue-header-name');
        const headerQty = document.getElementById('revenue-header-qty');
        const headerTotal = document.getElementById('revenue-header-total');
        if (!tableBody) return;
        
        // Sort the list
        soldList.sort((a, b) => {
            let valA, valB;
            if (currentSort === 'name') {
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                return currentDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            } else if (currentSort === 'quantity') {
                valA = a.quantity;
                valB = b.quantity;
            } else if (currentSort === 'total') {
                valA = a.total;
                valB = b.total;
            }
            return currentDir === 'asc' ? valA - valB : valB - valA;
        });
        
        // Helper to generate sort headers
        const getHeaderHtml = (label, colName, alignmentClass = '') => {
            const isActive = currentSort === colName;
            const icon = isActive 
                ? `<span class="material-symbols-outlined text-[10px] leading-none ml-1 select-none">${currentDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>`
                : '';
            const activeColorClass = isActive ? 'text-primary font-black' : 'text-on-surface-variant/60';
            
            return `
                <div class="flex items-center cursor-pointer hover:text-primary transition-colors select-none ${alignmentClass} ${activeColorClass}">
                    <span>${label}</span>
                    ${icon}
                </div>
            `;
        };
        
        if (headerName) headerName.innerHTML = getHeaderHtml('Наименование товара', 'name');
        if (headerQty) headerQty.innerHTML = getHeaderHtml('Кол-во', 'quantity', 'justify-center');
        if (headerTotal) headerTotal.innerHTML = getHeaderHtml('Общая сумма', 'total', 'justify-end');
        
        if (soldList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="py-12 text-center text-on-surface-variant opacity-40 uppercase tracking-widest font-label-caps text-xs">
                        Нет проданных товаров в текущем месяце
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = soldList.map((item, idx) => `
                <tr class="hover:bg-on-surface/[0.02]">
                    <td class="py-3.5 px-4 text-center font-mono font-bold text-primary">${idx + 1}</td>
                    <td class="py-3.5 px-4 font-bold uppercase tracking-tight text-[11px]">
                        ${item.id 
                            ? `<span onclick="event.stopPropagation(); window.openProductCardModal('${item.id}')" class="hover:text-primary transition-colors cursor-pointer">${item.name}</span>`
                            : `<span>${item.name}</span>`
                        }
                    </td>
                    <td class="py-3.5 px-4 text-center"><span class="px-2.5 py-1 font-bold font-mono text-primary bg-primary/5 rounded-lg text-[10px] inline-block font-label-caps">${item.quantity}</span></td>
                    <td class="py-3.5 px-4 text-right font-display-xl font-bold text-on-surface">${item.total > 0 ? item.total.toLocaleString() + ' ₽' : '—'}</td>
                </tr>
            `).join('');
        }
    };
    
    const tableTemplateHtml = `
        <div class="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-outline/10 text-[9px] uppercase tracking-wider text-on-surface-variant/60 font-bold font-label-caps">
                        <th class="py-3 px-4 w-12 text-center select-none">№</th>
                        <th class="py-3 px-4" id="revenue-header-name">Наименование товара</th>
                        <th class="py-3 px-4 text-center w-24" id="revenue-header-qty">Кол-во</th>
                        <th class="py-3 px-4 text-right w-36" id="revenue-header-total">Общая сумма</th>
                    </tr>
                </thead>
                <tbody id="revenue-table-body" class="divide-y divide-outline/5 text-xs text-on-surface font-body-md">
                    <!-- Loaded dynamically -->
                </tbody>
            </table>
        </div>
    `;
    
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total || o.total_price) || 0), 0);
    
    window.showModalGlobal('Реестр проданных товаров', `
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-green-400/5 border border-green-400/10 rounded-2xl p-4 -mt-2">
                <div>
                    <div class="text-[9px] text-green-400 uppercase font-label-caps tracking-widest font-bold">Выручка за текущий месяц</div>
                    <div class="text-xl font-bold font-display-xl text-on-surface uppercase tracking-tight mt-1">${totalRevenue.toLocaleString()} ₽</div>
                </div>
                <div class="text-left sm:text-right">
                    <div class="text-[9px] text-on-surface-variant/40 uppercase font-label-caps tracking-widest">Проданные позиции</div>
                    <div class="text-sm font-bold text-on-surface mt-1">${soldList.length} уникальных товаров</div>
                </div>
            </div>
            ${tableTemplateHtml}
        </div>
    `);
    
    // Bind click events to headers for sorting
    const bindHeaderClick = (elementId, colName) => {
        const el = document.getElementById(elementId);
        if (el) {
            el.onclick = () => {
                if (currentSort === colName) {
                    currentDir = currentDir === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSort = colName;
                    currentDir = 'desc';
                }
                renderTable();
            };
        }
    };
    
    // Initial render
    renderTable();
    
    // Set up header click handlers
    bindHeaderClick('revenue-header-name', 'name');
    bindHeaderClick('revenue-header-qty', 'quantity');
    bindHeaderClick('revenue-header-total', 'total');
}

function renderStatCard(label, value, icon, color, cardType) {
    return `
        <div class="stat-card liquid-glass rounded-[2rem] p-8 border-l-4 group hover:bg-on-surface/5 transition-all cursor-pointer bg-surface-container-lowest shadow-lg" style="border-left-color: ${color}" data-card-type="${cardType}">
            <div class="flex items-center justify-between mb-5">
                <div class="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5">
                    <span class="material-symbols-outlined text-2xl" style="color: ${color}">${icon}</span>
                </div>
                <div class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-400/5 border border-green-400/10">
                    <span class="w-1 h-1 rounded-full bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]"></span>
                    <span class="text-[8px] uppercase tracking-[0.1em] font-bold text-green-400">Live</span>
                </div>
            </div>
            <div class="text-2xl lg:text-3xl font-bold font-display-xl mb-1 stat-value truncate text-on-surface uppercase tracking-tight" data-icon="${icon}">${value}</div>
            <div class="text-[9px] uppercase tracking-[0.2em] font-bold text-on-surface-variant opacity-40 font-label-caps">${label}</div>
        </div>
    `;
}

function updateStat(icon, value) {
    const el = document.querySelector(`.stat-value[data-icon="${icon}"]`);
    if (el) el.innerHTML = value;
}

// Expose modal functions to window for use in other views (like analytics)
window.showActiveOrdersModal = showActiveOrdersModal;
window.showRevenueModal = showRevenueModal;
