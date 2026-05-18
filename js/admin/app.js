import { renderLayout } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin App Initializing...');
    
    // In later tasks, we will add auth check here
    renderLayout();
    
    // Simple view switcher for now
    const initViewSwitcher = () => {
        const navItems = document.querySelectorAll('.nav-item');
        if (navItems.length === 0) {
            // If layout isn't fully ready, retry once
            setTimeout(initViewSwitcher, 10);
            return;
        }

        navItems.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                console.log('Switching to view:', view);
                
                // Update title
                const titleEl = document.getElementById('admin-title');
                if (titleEl) {
                    titleEl.textContent = btn.innerText.trim();
                }

                // Highlight active button
                navItems.forEach(b => b.classList.remove('bg-white/5', 'text-[#ffb0cc]'));
                btn.classList.add('bg-white/5', 'text-[#ffb0cc]');

                // Update content placeholder
                const contentEl = document.getElementById('admin-content');
                if (contentEl) {
                    contentEl.innerHTML = `
                        <div class="flex items-center justify-center h-full opacity-30">
                            <div class="text-center">
                                <span class="material-symbols-outlined text-6xl mb-4">construction</span>
                                <div class="font-['Space_Grotesk'] uppercase tracking-widest">Раздел "${btn.innerText.trim()}" в разработке</div>
                            </div>
                        </div>
                    `;
                }
            });
        });

        // Default active view
        const dashboardBtn = document.querySelector('[data-view="dashboard"]');
        if (dashboardBtn) dashboardBtn.click();
    };

    initViewSwitcher();
});
