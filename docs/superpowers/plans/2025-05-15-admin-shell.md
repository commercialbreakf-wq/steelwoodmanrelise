# Admin Shell & Modular Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the monolithic `admin.html` into a modular Vanilla JS application with a clean, modern shell.

**Architecture:** We'll use a "App Shell" pattern. `admin.html` will contain only the core layout containers and a script entry point. `js/admin/ui.js` will handle rendering the layout and sidebar, while `js/admin/app.js` will orchestrate the application.

**Tech Stack:** Vanilla JS (ES Modules), Tailwind CSS (via CDN for consistency with existing site), Material Symbols.

---

### Task 1: Setup Directory Structure

**Files:**
- Create: `js/admin/`

- [ ] **Step 1: Create the admin JS directory**
Run: `mkdir -p js/admin`

- [ ] **Step 2: Commit initial structure**
```bash
git add js/admin
git commit -m "chore: create admin JS directory"
```

---

### Task 2: Create UI Module (`js/admin/ui.js`)

**Files:**
- Create: `js/admin/ui.js`

- [ ] **Step 1: Implement basic layout rendering**
```javascript
export function renderLayout() {
    const app = document.getElementById('admin-app');
    if (!app) return;

    app.innerHTML = `
        <div class="flex h-screen overflow-hidden bg-[#0f0e0c] text-[#e7e2dd] font-['Inter']">
            <!-- Sidebar -->
            <aside id="admin-sidebar" class="w-72 bg-[#1d1b19] border-r border-[#534347]/20 flex flex-col sticky top-0 h-screen">
                <div class="p-8 border-b border-[#534347]/20 flex items-center gap-3">
                    <img src="/images/logo_icon.png" class="w-10 h-10 rounded-full" alt="IW">
                    <div class="font-['Space_Grotesk'] font-bold text-sm tracking-tight leading-none">
                        <div class="text-[#e7e2dd]">WOODMAN</div>
                        <div class="text-[#ffb0cc]">ADMIN</div>
                    </div>
                </div>
                <nav id="admin-nav" class="flex-1 p-6 space-y-2 overflow-y-auto">
                    <!-- Nav items will be injected here -->
                </nav>
                <div id="admin-sidebar-footer" class="p-6 border-t border-[#534347]/20">
                    <!-- Footer items like logout -->
                </div>
            </aside>

            <!-- Main Content Area -->
            <main id="admin-main" class="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header id="admin-header" class="h-20 border-b border-[#534347]/20 px-10 flex items-center justify-between bg-[#151311]/50 backdrop-blur-md sticky top-0 z-10">
                    <h2 id="admin-title" class="font-['Space_Grotesk'] text-xl font-bold uppercase tracking-tight">Дашборд</h2>
                    <div id="admin-user-info" class="flex items-center gap-4">
                        <!-- User profile info -->
                    </div>
                </header>

                <div id="admin-content" class="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <!-- Views will be injected here -->
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
        <button data-view="${item.id}" class="nav-item w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-medium text-[#d7c1c7] group">
            <span class="material-symbols-outlined text-[#ffb0cc] group-hover:scale-110 transition-transform">${item.icon}</span>
            ${item.label}
        </button>
    `).join('');
}
```

- [ ] **Step 2: Commit UI module**
```bash
git add js/admin/ui.js
git commit -m "feat: implement basic admin layout in ui.js"
```

---

### Task 3: Create Entry Point (`js/admin/app.js`)

**Files:**
- Create: `js/admin/app.js`

- [ ] **Step 1: Implement app orchestration**
```javascript
import { renderLayout } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin App Initializing...');
    
    // In later tasks, we will add auth check here
    renderLayout();
    
    // Simple view switcher for now
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            console.log('Switching to view:', view);
            document.getElementById('admin-title').textContent = btn.innerText.trim();
            // Highlight active button
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('bg-white/5', 'text-[#ffb0cc]'));
            btn.classList.add('bg-white/5', 'text-[#ffb0cc]');
        });
    });
});
```

- [ ] **Step 2: Commit app module**
```bash
git add js/admin/app.js
git commit -m "feat: add admin app entry point"
```

---

### Task 4: Refactor `admin.html`

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Replace monolithic content with the new shell**
```html
<!DOCTYPE html>
<html class="dark" lang="ru">
<head>
    <meta charset="utf-8"/>
    <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
    <title>Панель управления | Железный Дровосек</title>
    <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
    <style>
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 176, 204, 0.3); border-radius: 4px; }
    </style>
</head>
<body class="min-h-screen">
    <div id="admin-app">
        <!-- The app shell will be injected here -->
        <div class="flex items-center justify-center h-screen bg-[#0f0e0c] text-[#ffb0cc]">
            <div class="animate-pulse font-['Space_Grotesk'] text-xl uppercase tracking-widest">Загрузка...</div>
        </div>
    </div>

    <script type="module" src="/js/admin/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit refactored admin.html**
```bash
git add admin.html
git commit -m "refactor: replace monolithic admin.html with modular shell"
```
