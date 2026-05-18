export function renderLayout() {
    const app = document.getElementById('admin-app');
    if (!app) return;

    app.innerHTML = `
        <div class="flex h-screen overflow-hidden bg-[#0f0e0c] text-[#e7e2dd] font-['Inter']">
            <!-- Sidebar -->
            <aside id="admin-sidebar" class="w-72 bg-[#1d1b19] border-r border-[#534347]/20 flex flex-col sticky top-0 h-screen">
                <div class="p-8 border-b border-[#534347]/20 flex items-center gap-3">
                    <img src="/images/logo_icon.png" class="w-10 h-10 rounded-full" alt="IW">
                    <div class="font-['Space Grotesk'] font-bold text-sm tracking-tight leading-none">
                        <div class="text-[#e7e2dd]">WOODMAN</div>
                        <div class="text-[#ffb0cc]">ADMIN</div>
                    </div>
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
            <main id="admin-main" class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header id="admin-header" class="h-20 border-b border-[#534347]/20 px-10 flex items-center justify-between bg-[#151311]/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 id="admin-title" class="font-['Space Grotesk'] text-xl font-bold uppercase tracking-tight">Дашборд</h2>
                    <div id="admin-user-info" class="flex items-center gap-4">
                        <div class="text-right">
                            <div id="admin-user-name" class="text-sm font-bold text-[#e7e2dd]">Admin User</div>
                            <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest">Administrator</div>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-[#ffb0cc]/20 flex items-center justify-center border border-[#ffb0cc]/30">
                            <span class="material-symbols-outlined text-[#ffb0cc]">person</span>
                        </div>
                    </div>
                </header>

                <div id="admin-content" class="flex-1 overflow-y-auto p-10 custom-scrollbar">
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
}

function renderSidebar() {
    const nav = document.getElementById('admin-nav');
    const items = [
        { id: 'dashboard', label: 'Дашборд', icon: 'dashboard' },
        { id: 'products', label: 'Товары', icon: 'inventory_2' },
        { id: 'orders', label: 'Заказы', icon: 'shopping_cart' },
        { id: 'users', label: 'Клиенты', icon: 'group' },
        { id: 'leads', label: 'Лиды', icon: 'leaderboard' },
        { id: 'analytics', label: 'Аналитика', icon: 'insights' }
    ];

    nav.innerHTML = items.map(item => `
        <button data-view="${item.id}" data-label="${item.label}" class="nav-item w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-[#d7c1c7] group">
            <span class="material-symbols-outlined text-[#ffb0cc] group-hover:scale-110 transition-transform">${item.icon}</span>
            ${item.label}
        </button>
    `).join('');
}
