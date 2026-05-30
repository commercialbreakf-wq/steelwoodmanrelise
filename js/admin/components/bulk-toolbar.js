/**
 * Renders the bulk actions toolbar
 * @param {HTMLElement} container 
 * @param {Array} selectedIds 
 * @param {Array} currentProducts
 */
export function renderBulkToolbar(container, selectedIds, callbacks, currentProducts = []) {
    if (!container) return;
    
    if (selectedIds.length === 0) {
        container.innerHTML = '';
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500 w-[calc(100%-1rem)] sm:w-auto max-w-[600px]">
            <div class="liquid-glass px-3 py-3 md:px-6 md:py-4 rounded-2xl border border-primary/20 shadow-2xl shadow-black/50 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 bg-surface-container/95">
                <div class="flex items-center justify-between md:justify-start gap-3 md:pr-6 md:border-r border-outline/10 shrink-0">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0">
                            ${selectedIds.length}
                        </div>
                        <div class="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label-caps">Выбрано</div>
                    </div>
                    <button id="bulk-close-mobile" class="md:hidden p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant">
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>

                <div class="flex items-center gap-1.5 md:gap-2 overflow-x-auto custom-scrollbar md:overflow-visible -mx-1 px-1 md:mx-0 md:px-0">
                    <button id="bulk-update-category" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-on-surface/5 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label-caps shrink-0">
                        <span class="material-symbols-outlined text-base">category</span>
                        <span>Категория</span>
                    </button>
                    <button id="bulk-update-price" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-primary/10 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary font-label-caps shrink-0">
                        <span class="material-symbols-outlined text-base">payments</span>
                        <span>Цена</span>
                    </button>
                    <button id="bulk-toggle-status" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-on-surface/5 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label-caps shrink-0">
                        <span class="material-symbols-outlined text-base">visibility</span>
                        <span>Наличие</span>
                    </button>
                    <button id="bulk-update-unit" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-primary/10 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary font-label-caps shrink-0" style="display: none;">
                        <span class="material-symbols-outlined text-base">straighten</span>
                        <span>Ед. изм.</span>
                    </button>
                    <button id="bulk-add-category" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-primary/10 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary font-label-caps shrink-0" style="display: none;">
                        <span class="material-symbols-outlined text-base">playlist_add</span>
                        <span>Добавить категорию</span>
                    </button>
                    <button id="bulk-remove-category" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-red-500/10 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-400 font-label-caps shrink-0" style="display: none;">
                        <span class="material-symbols-outlined text-base">playlist_remove</span>
                        <span>Убрать категорию</span>
                    </button>
                    <button id="bulk-delete-items" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-red-500/10 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-400 font-label-caps shrink-0">
                        <span class="material-symbols-outlined text-base">delete</span>
                        <span>Удалить</span>
                    </button>
                    <button id="bulk-export-products" class="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 hover:bg-on-surface/5 rounded-xl transition-all text-[10px] md:text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label-caps shrink-0">
                        <span class="material-symbols-outlined text-base">download</span>
                        <span>Экспорт</span>
                    </button>
                </div>

                <button id="bulk-close" class="hidden md:flex md:ml-4 p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant shrink-0">
                    <span class="material-symbols-outlined text-base">close</span>
                </button>
            </div>
        </div>
    `;

    // Add event listeners
    const categoryBtn = container.querySelector('#bulk-update-category');
    if (categoryBtn) {
        categoryBtn.onclick = () => {
            showCategoryPromptModal(currentProducts, (l1, l2) => {
                if (callbacks.onUpdateCategory) callbacks.onUpdateCategory(l1, l2);
            });
        };
    }

    const addCategoryBtn = container.querySelector('#bulk-add-category');
    if (addCategoryBtn) {
        if (callbacks.onAddCategory) {
            addCategoryBtn.style.display = 'flex';
            addCategoryBtn.onclick = () => {
                callbacks.onAddCategory();
            };
        } else {
            addCategoryBtn.style.display = 'none';
        }
    }

    const removeCategoryBtn = container.querySelector('#bulk-remove-category');
    if (removeCategoryBtn) {
        if (callbacks.onRemoveCategory) {
            removeCategoryBtn.style.display = 'flex';
            removeCategoryBtn.onclick = () => {
                callbacks.onRemoveCategory();
            };
        } else {
            removeCategoryBtn.style.display = 'none';
        }
    }

    const priceBtn = container.querySelector('#bulk-update-price');
    if (priceBtn) {
        priceBtn.onclick = () => {
            showPricePromptModal((value) => {
                if (value !== '') callbacks.onUpdatePrice(value);
            });
        };
    }

    const statusBtn = container.querySelector('#bulk-toggle-status');
    if (statusBtn) {
        statusBtn.onclick = () => {
            showConfirmPromptModal({
                title: 'Изменение наличия',
                icon: 'visibility',
                text: 'Вы уверены, что хотите убрать из наличия выбранные товары?',
                confirmText: 'Изменить',
                confirmClass: 'bg-primary text-on-primary hover:bg-on-surface hover:text-surface shadow-primary/20'
            }, () => {
                callbacks.onToggleStatus();
            });
        };
    }

    const exportBtn = container.querySelector('#bulk-export-products');
    if (exportBtn) {
        exportBtn.onclick = () => {
            showConfirmPromptModal({
                title: 'Экспорт в Excel',
                icon: 'download',
                text: 'При согласии произойдет выгрузка выбранных элементов в Excel. Продолжить?',
                confirmText: 'Выгрузить',
                confirmClass: 'bg-[#1e7145] text-white hover:brightness-110 shadow-[#1e7145]/20'
            }, () => {
                callbacks.onExportProducts();
            });
        };
    }

    const unitBtn = container.querySelector('#bulk-update-unit');
    if (unitBtn) {
        unitBtn.onclick = () => {
            if (callbacks.onUpdateUnit) callbacks.onUpdateUnit();
        };
    }

    const deleteBtn = container.querySelector('#bulk-delete-items');
    if (deleteBtn) {
        deleteBtn.onclick = () => {
            showConfirmPromptModal({
                title: 'Удаление элементов',
                icon: 'delete',
                text: 'Вы уверены, что хотите безвозвратно удалить выбранные элементы?',
                confirmText: 'Удалить',
                confirmClass: 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'
            }, () => {
                if (callbacks.onDeleteItems) callbacks.onDeleteItems();
            });
        };
    }

    const closeBtn = container.querySelector('#bulk-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            callbacks.onClose();
        };
    }

    const closeBtnMobile = container.querySelector('#bulk-close-mobile');
    if (closeBtnMobile) {
        closeBtnMobile.onclick = () => {
            callbacks.onClose();
        };
    }
}

/**
 * Shows a beautiful custom price change modal dialog
 * @param {Function} onConfirm 
 */
function showPricePromptModal(onConfirm) {
    let modalWrapper = document.getElementById('bulk-price-modal');
    if (modalWrapper) modalWrapper.remove();
    
    modalWrapper = document.createElement('div');
    modalWrapper.id = 'bulk-price-modal';
    modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
    modalWrapper.style.pointerEvents = 'auto';
    
    modalWrapper.innerHTML = `
        <div id="bulk-price-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
        <div id="bulk-price-container" class="relative w-full max-w-md bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-on-surface">
            <div class="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                <h3 class="text-sm uppercase tracking-widest text-primary font-bold font-label-caps flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">payments</span>
                    Изменение цены
                </h3>
                <button id="bulk-price-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            
            <div class="space-y-4">
                <p class="text-xs text-on-surface-variant opacity-80 leading-relaxed">
                    Введите изменение цены (например, <strong class="text-primary">+10%</strong>, <strong class="text-primary">-500</strong>, или новую фиксированную цену <strong class="text-primary">15000</strong>):
                </p>
                
                <input type="text" id="bulk-price-input" placeholder="Например, +10% или 25000" class="w-full bg-surface-container-lowest border border-outline/30 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all text-base text-on-surface font-bold text-center placeholder:opacity-30 shadow-inner">
                
                <div class="flex justify-end gap-3 pt-2">
                    <button id="bulk-price-cancel-btn" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="bulk-price-confirm-btn" class="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 font-label-caps">
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalWrapper);
    
    if (window.lockScrollGlobal) window.lockScrollGlobal();
    
    const container = modalWrapper.querySelector('#bulk-price-container');
    const input = modalWrapper.querySelector('#bulk-price-input');
    
    const close = () => {
        modalWrapper.classList.add('opacity-0');
        container.classList.add('scale-95');
        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
        setTimeout(() => modalWrapper.remove(), 300);
    };
    
    const confirm = () => {
        const value = input.value.trim();
        if (value !== '') {
            onConfirm(value);
        }
        close();
    };
    
    modalWrapper.querySelector('#bulk-price-backdrop').onclick = close;
    modalWrapper.querySelector('#bulk-price-close').onclick = close;
    modalWrapper.querySelector('#bulk-price-cancel-btn').onclick = close;
    modalWrapper.querySelector('#bulk-price-confirm-btn').onclick = confirm;
    
    input.onkeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirm();
        } else if (e.key === 'Escape') {
            close();
        }
    };
    
    setTimeout(() => input.focus(), 100);
    
    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        container.classList.remove('scale-95');
    });
}

/**
 * Shows a beautiful custom category change modal dialog
 * @param {Array} currentProducts
 * @param {Function} onConfirm 
 */
function showCategoryPromptModal(currentProducts, onConfirm) {
    let modalWrapper = document.getElementById('bulk-category-modal');
    if (modalWrapper) modalWrapper.remove();
    
    const l1s = [...new Set((currentProducts || []).map(p => p.parent_category).filter(Boolean))].sort();
    
    modalWrapper = document.createElement('div');
    modalWrapper.id = 'bulk-category-modal';
    modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
    modalWrapper.style.pointerEvents = 'auto';
    
    modalWrapper.innerHTML = `
        <div id="bulk-category-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
        <div id="bulk-category-container" class="relative w-full max-w-md bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-on-surface">
            <div class="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                <h3 class="text-sm uppercase tracking-widest text-primary font-bold font-label-caps flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">category</span>
                    Изменение категории
                </h3>
                <button id="bulk-category-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            
            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase opacity-50 text-on-surface font-label-caps tracking-widest">Категория (L1)</label>
                    <select id="bulk-category-l1" class="w-full bg-surface-container-lowest border border-outline/30 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all text-sm font-bold text-on-surface appearance-none">
                        <option value="">Выберите категорию...</option>
                        ${l1s.map(l1 => `<option value="${l1}">${l1}</option>`).join('')}
                    </select>
                </div>
                
                <div class="space-y-2">
                    <label class="text-[10px] uppercase opacity-50 text-on-surface font-label-caps tracking-widest">Подкатегория (L2)</label>
                    <select id="bulk-category-l2" class="w-full bg-surface-container-lowest border border-outline/30 rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all text-sm font-bold text-on-surface appearance-none" disabled>
                        <option value="">Сначала выберите L1...</option>
                    </select>
                </div>
                
                <div class="flex justify-end gap-3 pt-4">
                    <button id="bulk-category-cancel-btn" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="bulk-category-confirm-btn" class="px-5 py-3 rounded-xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 font-label-caps opacity-50 pointer-events-none">
                        Подтвердить
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalWrapper);
    
    if (window.lockScrollGlobal) window.lockScrollGlobal();
    
    const container = modalWrapper.querySelector('#bulk-category-container');
    const l1Select = modalWrapper.querySelector('#bulk-category-l1');
    const l2Select = modalWrapper.querySelector('#bulk-category-l2');
    const confirmBtn = modalWrapper.querySelector('#bulk-category-confirm-btn');
    
    l1Select.onchange = () => {
        const selectedL1 = l1Select.value;
        if (!selectedL1) {
            l2Select.innerHTML = '<option value="">Сначала выберите L1...</option>';
            l2Select.disabled = true;
            confirmBtn.classList.add('opacity-50', 'pointer-events-none');
            return;
        }
        
        const l2s = [...new Set((currentProducts || []).filter(p => p.parent_category === selectedL1).map(p => p.category).filter(Boolean))].sort();
        
        l2Select.innerHTML = '<option value="">Выберите подкатегорию (необязательно)...</option>' + 
            l2s.map(l2 => `<option value="${l2}">${l2}</option>`).join('');
        l2Select.disabled = false;
        
        confirmBtn.classList.remove('opacity-50', 'pointer-events-none');
    };
    
    const close = () => {
        modalWrapper.classList.add('opacity-0');
        container.classList.add('scale-95');
        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
        setTimeout(() => modalWrapper.remove(), 300);
    };
    
    const confirm = () => {
        const l1 = l1Select.value;
        const l2 = l2Select.value;
        if (l1) {
            onConfirm(l1, l2);
        }
        close();
    };
    
    modalWrapper.querySelector('#bulk-category-backdrop').onclick = close;
    modalWrapper.querySelector('#bulk-category-close').onclick = close;
    modalWrapper.querySelector('#bulk-category-cancel-btn').onclick = close;
    confirmBtn.onclick = confirm;
    
    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        container.classList.remove('scale-95');
    });
}

/**
 * Shows a beautiful custom confirmation modal dialog
 * @param {Object} options - { title, icon, text, confirmText, confirmClass }
 * @param {Function} onConfirm 
 */
export function showConfirmPromptModal(options, onConfirm) {
    let modalWrapper = document.getElementById('bulk-confirm-modal');
    if (modalWrapper) modalWrapper.remove();
    
    modalWrapper = document.createElement('div');
    modalWrapper.id = 'bulk-confirm-modal';
    modalWrapper.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 pointer-events-none';
    modalWrapper.style.pointerEvents = 'auto';
    
    const icon = options.icon || 'help';
    const title = options.title || 'Подтверждение';
    const text = options.text || 'Вы уверены?';
    const confirmText = options.confirmText || 'Подтвердить';
    const confirmClass = options.confirmClass || 'bg-primary text-on-primary hover:bg-on-surface hover:text-surface shadow-primary/20';
    
    modalWrapper.innerHTML = `
        <div id="bulk-confirm-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"></div>
        <div id="bulk-confirm-container" class="relative w-full max-w-md bg-surface-container border border-outline/20 rounded-[2rem] p-6 shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 text-on-surface">
            <div class="flex items-center justify-between pb-4 border-b border-outline/10 mb-4">
                <h3 class="text-sm uppercase tracking-widest text-primary font-bold font-label-caps flex items-center gap-2">
                    <span class="material-symbols-outlined text-base">${icon}</span>
                    ${title}
                </h3>
                <button id="bulk-confirm-close" class="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>
            
            <div class="space-y-4">
                <p class="text-sm text-on-surface-variant opacity-90 leading-relaxed font-medium">
                    ${text}
                </p>
                
                <div class="flex justify-end gap-3 pt-4">
                    <button id="bulk-confirm-cancel-btn" class="px-5 py-3 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label-caps">
                        Отмена
                    </button>
                    <button id="bulk-confirm-submit-btn" class="px-5 py-3 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg font-label-caps ${confirmClass}">
                        ${confirmText}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalWrapper);
    
    if (window.lockScrollGlobal) window.lockScrollGlobal();
    
    const container = modalWrapper.querySelector('#bulk-confirm-container');
    
    const close = () => {
        modalWrapper.classList.add('opacity-0');
        container.classList.add('scale-95');
        if (window.unlockScrollGlobal) window.unlockScrollGlobal();
        setTimeout(() => modalWrapper.remove(), 300);
    };
    
    const confirm = () => {
        onConfirm();
        close();
    };
    
    modalWrapper.querySelector('#bulk-confirm-backdrop').onclick = close;
    modalWrapper.querySelector('#bulk-confirm-close').onclick = close;
    modalWrapper.querySelector('#bulk-confirm-cancel-btn').onclick = close;
    modalWrapper.querySelector('#bulk-confirm-submit-btn').onclick = confirm;
    
    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        container.classList.remove('scale-95');
    });
}
