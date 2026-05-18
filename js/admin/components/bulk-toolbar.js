/**
 * Renders the bulk actions toolbar
 * @param {HTMLElement} container 
 * @param {Array} selectedIds 
 * @param {Object} callbacks - { onUpdatePrice, onToggleStatus, onImportPrice, onClose }
 */
export function renderBulkToolbar(container, selectedIds, callbacks) {
    if (!container) return;
    
    if (selectedIds.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
            <div class="glass-dark px-6 py-4 rounded-2xl border border-[#ffb0cc]/20 shadow-2xl shadow-black/50 flex items-center gap-6">
                <div class="flex items-center gap-3 pr-6 border-r border-white/10">
                    <div class="w-8 h-8 rounded-full bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center font-bold text-xs">
                        ${selectedIds.length}
                    </div>
                    <div class="text-[10px] uppercase tracking-widest font-bold text-[#d7c1c7]">Выбрано</div>
                </div>

                <div class="flex items-center gap-2">
                    <button id="bulk-update-price" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#ffb0cc]">
                        <span class="material-symbols-outlined text-base">payments</span>
                        Цена
                    </button>
                    <button id="bulk-toggle-status" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#d7c1c7]">
                        <span class="material-symbols-outlined text-base">visibility</span>
                        Статус
                    </button>
                    <button id="bulk-import-price" class="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all text-xs font-bold uppercase tracking-wider text-[#d7c1c7]">
                        <span class="material-symbols-outlined text-base">upload_file</span>
                        Импорт
                    </button>
                </div>

                <button id="bulk-close" class="ml-4 p-2 hover:bg-white/5 rounded-full transition-all text-[#d7c1c7]">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const priceBtn = container.querySelector('#bulk-update-price');
    if (priceBtn) {
        priceBtn.onclick = () => {
            const value = prompt('Введите изменение цены (например, +10%, -500, или новую цену 15000):');
            if (value !== null && value !== '') callbacks.onUpdatePrice(value);
        };
    }

    const statusBtn = container.querySelector('#bulk-toggle-status');
    if (statusBtn) {
        statusBtn.onclick = () => {
            callbacks.onToggleStatus();
        };
    }

    const importBtn = container.querySelector('#bulk-import-price');
    if (importBtn) {
        importBtn.onclick = () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.csv';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) callbacks.onImportPrice(file);
            };
            input.click();
        };
    }

    const closeBtn = container.querySelector('#bulk-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            callbacks.onClose();
        };
    }
}
