export function renderLayout() {
    // Hide tech support widget in admin panel
    if (!document.getElementById('hide-chat-widget-admin')) {
        const style = document.createElement('style');
        style.id = 'hide-chat-widget-admin';
        style.textContent = '#floatingChatBtnGlobal { display: none !important; }';
        document.head.appendChild(style);
    }

    const app = document.getElementById('admin-app');
    if (!app) return;

    app.innerHTML = `
        <div class="flex h-screen overflow-hidden bg-[#0f0e0c] text-[#e7e2dd] font-['Inter'] relative">
            <!-- Sidebar Overlay (Mobile) -->
            <div id="sidebar-overlay" class="fixed inset-0 bg-black/60 z-40 lg:hidden hidden backdrop-blur-sm transition-opacity duration-300 opacity-0"></div>

            <!-- Sidebar -->
            <aside id="admin-sidebar" class="fixed lg:static inset-y-0 left-0 w-72 bg-[#1d1b19] border-r border-[#534347]/20 flex flex-col z-50 transition-transform duration-300 -translate-x-full lg:translate-x-0">
                <div class="p-8 border-b border-[#534347]/20 flex items-center justify-between">
                    <a href="/" class="flex items-center gap-3 hover:opacity-85 transition-opacity group">
                        <img src="/images/logo_icon.png" class="w-10 h-10 rounded-full group-hover:scale-105 transition-transform" alt="IW">
                        <div class="font-['Space Grotesk'] font-bold text-sm tracking-tight leading-none">
                            <div class="text-[#e7e2dd] group-hover:text-white transition-colors">WOODMAN</div>
                            <div class="text-[#964551]">ADMIN</div>
                        </div>
                    </a>
                    <button id="close-sidebar" class="lg:hidden p-2 text-[#d7c1c7] hover:text-white transition-colors">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <nav id="admin-nav" class="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <!-- Nav items will be injected here -->
                </nav>
                <div id="admin-sidebar-footer" class="p-6 border-t border-[#534347]/20">
                    <button id="admin-logout" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 text-[#d7c1c7] hover:text-red-400 transition-all text-sm font-medium group">
                        <span class="material-symbols-outlined group-hover:scale-110 transition-transform">logout</span>
                        Выход
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main id="admin-main" class="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <header id="admin-header" class="h-20 border-b border-[#534347]/20 px-6 lg:px-10 flex items-center justify-between bg-[#151311]/50 backdrop-blur-md sticky top-0 z-30">
                    <div class="flex items-center gap-4">
                        <button id="mobile-menu-toggle" class="lg:hidden p-2 text-[#964551] hover:bg-white/5 rounded-lg transition-all">
                            <span class="material-symbols-outlined">menu</span>
                        </button>
                        <h2 id="admin-title" class="font-['Space Grotesk'] text-lg lg:text-xl font-bold uppercase tracking-tight truncate">Дашборд</h2>
                    </div>
                    
                    <div id="admin-user-info" class="flex items-center gap-3 lg:gap-4">
                        <div class="text-right hidden sm:block">
                            <div id="admin-user-name" class="text-sm font-bold text-[#e7e2dd]">Admin User</div>
                            <div class="text-[10px] text-[#964551] uppercase font-['Space Grotesk'] tracking-widest">Administrator</div>
                        </div>
                        <div class="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#964551]/20 flex items-center justify-center border border-[#964551]/30">
                            <span class="material-symbols-outlined text-[#964551] text-xl lg:text-2xl">person</span>
                        </div>
                    </div>
                </header>

                <div id="admin-content" class="h-[calc(100vh-80px)] overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <!-- Views will be injected here -->
                    <div class="flex items-center justify-center h-full opacity-30">
                        <div class="text-center">
                            <span class="material-symbols-outlined text-6xl mb-4">construction</span>
                            <div class="font-['Space Grotesk'] uppercase tracking-widest">Контент загружается...</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    renderSidebar();
    initMobileControls();
}

function initMobileControls() {
    const sidebar = document.getElementById('admin-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('mobile-menu-toggle');
    const close = document.getElementById('close-sidebar');

    const openSidebar = () => {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.add('opacity-100'), 10);
    };

    const closeSidebar = () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.remove('opacity-100');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    };

    toggle?.addEventListener('click', openSidebar);
    close?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    // Logout logic
    document.getElementById('admin-logout')?.addEventListener('click', () => {
        localStorage.removeItem('metal_token');
        window.location.href = '/#login';
    });

    // Close sidebar on nav click (mobile)
    document.getElementById('admin-nav')?.addEventListener('click', (e) => {
        if (e.target.closest('.nav-item') && window.innerWidth < 1024) {
            closeSidebar();
        }
    });
}

function renderSidebar() {
    const nav = document.getElementById('admin-nav');
    const items = [
        { id: 'dashboard', label: 'Дашборд', icon: 'dashboard' },
        { 
            id: 'products', 
            label: 'Товары', 
            icon: 'inventory_2',
            subitems: [
                { id: 'products_nomenclature', label: 'Список товаров', icon: 'list_alt', tab: 'products', parentLabel: 'Товары' },
                { id: 'products_l1', label: 'Категории L1', icon: 'folder', tab: 'l1', parentLabel: 'Товары' },
                { id: 'products_l2', label: 'Категории L2', icon: 'folder_open', tab: 'l2', parentLabel: 'Товары' },
                { id: 'products_l3', label: 'L3 (табы)', icon: 'tab', tab: 'l3', parentLabel: 'Товары' },
                { id: 'products_parameters', label: 'Параметры', icon: 'tune', tab: 'parameters', parentLabel: 'Товары' }
            ]
        },
        { id: 'orders', label: 'Заказы', icon: 'shopping_cart' },
        { 
            id: 'support', 
            label: 'Поддержка', 
            icon: 'forum',
            subitems: [
                { id: 'support_chats', label: 'Обращения (Чаты)', icon: 'chat', tab: 'chats', parentLabel: 'Поддержка' },
                { id: 'support_leads', label: 'Заявки', icon: 'description', tab: 'leads', parentLabel: 'Поддержка' }
            ]
        },
        { id: 'users', label: 'Клиенты', icon: 'group' },
        { id: 'leads', label: 'Лиды', icon: 'leaderboard' },
        { id: 'analytics', label: 'Аналитика', icon: 'insights' }
    ];

    nav.innerHTML = items.map(item => {
        const hasSubitems = item.subitems && item.subitems.length > 0;
        
        let html = `
            <div class="sidebar-group flex flex-col">
                <button data-view="${item.id}" data-label="${item.label}" class="nav-item w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-[#d7c1c7] group text-left">
                    <span class="material-symbols-outlined text-[#964551] group-hover:scale-110 transition-transform">${item.icon}</span>
                    <span class="flex-1 truncate">${item.label}</span>
                    ${hasSubitems ? '<span class="material-symbols-outlined text-xs text-[#d7c1c7]/40 rotate-180 transition-transform duration-200">keyboard_arrow_up</span>' : ''}
                </button>
        `;
        
        if (hasSubitems) {
            html += `
                <div class="ml-6 pl-4 border-l border-[#534347]/20 mt-1 mb-2 space-y-1 flex flex-col">
                    ${item.subitems.map(sub => `
                        <button data-view="${sub.id}" data-tab="${sub.tab}" data-label="${sub.parentLabel || item.label}" class="nav-item w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-xs font-medium text-[#d7c1c7]/80 group text-left">
                            <span class="material-symbols-outlined text-[#964551]/80 text-[16px] group-hover:scale-110 transition-transform">${sub.icon}</span>
                            <span class="flex-1 truncate">${sub.label}</span>
                        </button>
                    `).join('')}
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }).join('');
}

