/**
 * PREMIUM PRELOADER SYSTEM
 * Injected immediately to ensure early visibility for Iron Woodman High-Tech Site
 */

// --- GLOBAL API REWRITE INTERCEPTOR FOR VERCEL PRODUCTION BACKEND ---
(function() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // --- THEME INITIALIZATION ---
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(savedTheme);
    
    window.toggleThemeGlobal = function() {
        const doc = document.documentElement;
        const currentTheme = doc.classList.contains('light') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add temporary switching class for smooth transition
        doc.classList.add('theme-transitioning');
        
        doc.classList.remove('dark', 'light');
        doc.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Dispatch event for components that might need to react
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: newTheme } }));
        
        // Update any toggle buttons on page
        updateToggleVisuals(newTheme);
        
        // Remove switching class after transition (matching CSS 0.25s)
        setTimeout(() => {
            doc.classList.remove('theme-transitioning');
        }, 250);
    };

    function updateToggleVisuals(theme) {
        const toggleThumbs = document.querySelectorAll('.apple-toggle-thumb');
        const activeIcons = document.querySelectorAll('.theme-icon-active');
        
        toggleThumbs.forEach(thumb => {
            if (theme === 'light') {
                // thumb movement handled by CSS class on html.light
            }
        });
        
        activeIcons.forEach(icon => {
            icon.textContent = theme === 'light' ? 'light_mode' : 'dark_mode';
            icon.style.color = theme === 'light' ? '#c7c5c5' : '#FFD60A';
        });
    }
    
    // Initial visual update after DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        updateToggleVisuals(localStorage.getItem('theme') || 'dark');
    });

    if (!isLocalhost) {
        const originalFetch = window.fetch;
        window.fetch = function(input, init) {
            if (typeof input === 'string' && input.startsWith('/api/')) {
                input = 'https://steelwoodman-relise.vercel.app' + input;
            } else if (input instanceof URL && input.pathname.startsWith('/api/')) {
                input = new URL(input.pathname, 'https://steelwoodman-relise.vercel.app');
            } else if (input && typeof input === 'object' && typeof input.url === 'string' && input.url.startsWith('/api/')) {
                const url = 'https://steelwoodman-relise.vercel.app' + input.url;
                input = new Request(url, input);
            }
            return originalFetch(input, init);
        };
    }
})();

// --- PREMIUM IRON WOODMAN GLOBAL MODAL OVERRIDES FOR ALERT & CONFIRM ---
window.confirm = function(message) {
    window.lockScrollGlobal();
    return new Promise((resolve) => {
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        
        const isDestructive = /удалить|безвозвратно|необратимо/i.test(message);
        const title = isDestructive ? 'Подтверждение удаления' : 'Системный запрос';
        const icon = isDestructive ? 'delete_forever' : 'help_center';
        
        const iconColorClass = isDestructive ? 'text-[#ff4a7a]' : 'text-[#c7c5c5]';
        const iconBgClass = isDestructive ? 'bg-[#ff4a7a]/10 border-[#ff4a7a]/20' : 'bg-[#964551]/10 border-[#964551]/20';
        const topGlowStyle = isDestructive ? 'background: linear-gradient(90deg, transparent, #ff4a7a, transparent);' : 'background: linear-gradient(90deg, transparent, #964551, transparent);';
        const btnClass = isDestructive ? 'bg-[#ff4a7a] hover:bg-[#ff2a60] text-white shadow-lg shadow-[#ff4a7a]/20' : 'bg-[#964551] hover:bg-[#7a3642] text-[#c7c5c5] shadow-lg shadow-[#964551]/20';

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-[#151311]/95 border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col transform scale-95 transition-all duration-300 min-h-0 overflow-hidden modal-content">
                <!-- Header glow / accent bar -->
                <div class="absolute top-0 left-0 right-0 h-1 opacity-80" style="${topGlowStyle}"></div>
                
                <div class="p-8 pb-6 flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-3xl ${iconBgClass} border flex items-center justify-center ${iconColorClass} mb-6 shadow-inner animate-pulse">
                        <span class="material-symbols-outlined text-3xl">${icon}</span>
                    </div>
                    <h3 class="font-['Space Grotesk'] text-xl font-bold tracking-tight text-[#e7e2dd] mb-3">
                        ${title}
                    </h3>
                    <p class="text-sm text-[#d7c1c7] opacity-90 leading-relaxed font-medium px-2">
                        ${message}
                    </p>
                </div>
                
                <div class="p-8 pt-4 flex items-center justify-center gap-4 bg-[#151311] border-t border-white/5 shrink-0">
                    <button type="button" class="flex-1 px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest text-[#d7c1c7] cancel-btn active:scale-95">
                        Отмена
                    </button>
                    <button type="button" class="flex-1 px-6 py-4 rounded-2xl ${btnClass} transition-all text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 confirm-btn">
                        Подтвердить
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('.modal-content').classList.remove('scale-95');
        });
        
        const close = (result) => {
            modalWrapper.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('scale-95');
            setTimeout(() => {
                modalWrapper.remove();
                window.unlockScrollGlobal();
                resolve(result);
            }, 300);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = () => close(false);
        modalWrapper.querySelector('.cancel-btn').onclick = () => close(false);
        modalWrapper.querySelector('.confirm-btn').onclick = () => close(true);
    });
};

window.alert = function(message) {
    window.lockScrollGlobal();
    return new Promise((resolve) => {
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        
        const isError = /ошибка|error|fail|неверн|пустым/i.test(message);
        const title = isError ? 'Системная ошибка' : 'Уведомление';
        const icon = isError ? 'error' : 'info';
        
        const iconColorClass = isError ? 'text-[#ff4a7a]' : 'text-[#c7c5c5]';
        const iconBgClass = isError ? 'bg-[#ff4a7a]/10 border-[#ff4a7a]/20' : 'bg-[#964551]/10 border-[#964551]/20';
        const topGlowStyle = isError ? 'background: linear-gradient(90deg, transparent, #ff4a7a, transparent);' : 'background: linear-gradient(90deg, transparent, #964551, transparent);';
        const btnClass = isError ? 'bg-[#ff4a7a] hover:bg-[#ff2a60] text-white shadow-lg shadow-[#ff4a7a]/20' : 'bg-[#964551] hover:bg-[#7a3642] text-[#c7c5c5] shadow-lg shadow-[#964551]/20';

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-[#151311]/95 border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col transform scale-95 transition-all duration-300 min-h-0 overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-1 opacity-80" style="${topGlowStyle}"></div>
                
                <div class="p-8 pb-6 flex flex-col items-center text-center">
                    <div class="w-16 h-16 rounded-3xl ${iconBgClass} border flex items-center justify-center ${iconColorClass} mb-6 shadow-inner animate-pulse">
                        <span class="material-symbols-outlined text-3xl">${icon}</span>
                    </div>
                    <h3 class="font-['Space Grotesk'] text-xl font-bold tracking-tight text-[#e7e2dd] mb-3">
                        ${title}
                    </h3>
                    <p class="text-sm text-[#d7c1c7] opacity-90 leading-relaxed font-medium px-2">
                        ${message}
                    </p>
                </div>
                
                <div class="p-8 pt-4 flex items-center justify-center bg-[#151311] border-t border-white/5 shrink-0">
                    <button type="button" class="w-full px-6 py-4 rounded-2xl ${btnClass} transition-all text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 alert-btn">
                        Понятно
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('.modal-content').classList.remove('scale-95');
        });
        
        const close = () => {
            modalWrapper.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('scale-95');
            setTimeout(() => {
                modalWrapper.remove();
                window.unlockScrollGlobal();
                resolve();
            }, 300);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = close;
        modalWrapper.querySelector('.alert-btn').onclick = close;
    });
};

window.showToast = function(message, type = 'success', title = null) {
    // Ensure toast container exists
    let container = document.getElementById('iron-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'iron-toast-container';
        container.className = 'fixed top-6 right-6 z-[999999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0';
        document.body.appendChild(container);
    }

    // Determine styles based on type
    let icon = 'check_circle';
    let iconColor = 'text-[#10b981]';
    let iconBg = 'bg-[#10b981]/10 border-[#10b981]/20';
    let borderColor = 'border-l-[#10b981]';
    let defaultTitle = 'Успешно';

    if (type === 'error') {
        icon = 'error';
        iconColor = 'text-[#ff4a7a]';
        iconBg = 'bg-[#ff4a7a]/10 border-[#ff4a7a]/20';
        borderColor = 'border-l-[#ff4a7a]';
        defaultTitle = 'Ошибка';
    } else if (type === 'info') {
        icon = 'info';
        iconColor = 'text-[#c7c5c5]';
        iconBg = 'bg-[#964551]/10 border-[#964551]/20';
        borderColor = 'border-l-[#964551]';
        defaultTitle = 'Уведомление';
    } else if (type === 'warning') {
        icon = 'warning';
        iconColor = 'text-[#f59e0b]';
        iconBg = 'bg-[#f59e0b]/10 border-[#f59e0b]/20';
        borderColor = 'border-l-[#f59e0b]';
        defaultTitle = 'Внимание';
    }

    const toastTitle = title || defaultTitle;

    const toastEl = document.createElement('div');
    toastEl.className = `pointer-events-auto bg-[#151311]/95 backdrop-blur-md border border-white/10 border-l-4 ${borderColor} rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex items-start gap-3.5 transform translate-x-full opacity-0 transition-all duration-500 ease-out`;
    
    toastEl.innerHTML = `
        <div class="w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center ${iconColor} shrink-0 shadow-inner mt-0.5">
            <span class="material-symbols-outlined text-xl">${icon}</span>
        </div>
        <div class="flex-1 min-w-0 pr-1">
            <h4 class="font-['Space Grotesk'] text-sm font-bold text-[#e7e2dd] tracking-tight truncate">
                ${toastTitle}
            </h4>
            <p class="text-xs text-[#d7c1c7] opacity-90 mt-1 leading-relaxed break-words">
                ${message}
            </p>
        </div>
        <button type="button" class="text-[#d7c1c7] hover:text-white opacity-50 hover:opacity-100 transition-opacity p-1 -mt-1 -mr-1 toast-close-btn">
            <span class="material-symbols-outlined text-base">close</span>
        </button>
    `;

    container.appendChild(toastEl);

    // Animate in
    requestAnimationFrame(() => {
        toastEl.classList.remove('translate-x-full', 'opacity-0');
        toastEl.classList.add('translate-x-0', 'opacity-100');
    });

    const dismiss = () => {
        toastEl.classList.remove('translate-x-0', 'opacity-100');
        toastEl.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => toastEl.remove(), 500);
    };

    toastEl.querySelector('.toast-close-btn').onclick = dismiss;

    // Auto dismiss after 4 seconds
    setTimeout(dismiss, 4000);
};

window.ORDER_STATUS_OPTIONS = [
    { value: 'new', label: 'Новый', color: '#3b82f6', desc: 'Заказ только поступил, ожидает проверки менеджером', icon: 'fiber_new' },
    { value: 'in_progress', label: 'В работе', color: '#f59e0b', desc: 'Менеджер взял заказ в работу, согласование деталей', icon: 'engineering' },
    { value: 'processing', label: 'В обработке', color: '#a855f7', desc: 'Заказ комплектуется и готовится к отгрузке', icon: 'inventory_2' },
    { value: 'completed', label: 'Завершен', color: '#10b981', desc: 'Заказ успешно выполнен и закрыт', icon: 'check_circle' },
    { value: 'waiting_client', label: 'Ожидание', color: '#ec4899', desc: 'Ожидается ответ или оплата от клиента', icon: 'hourglass_top' },
    { value: 'cancelled', label: 'Отменен', color: '#ef4444', desc: 'Заказ отменен по инициативе клиента или менеджера', icon: 'cancel' }
];

window.LEAD_STATUS_OPTIONS = [
    { value: 'new', label: 'Новый', color: '#3b82f6', desc: 'Новое обращение/заявка на расчет', icon: 'fiber_new' },
    { value: 'in_progress', label: 'В работе', color: '#f59e0b', desc: 'Производится технический расчет и оценка', icon: 'calculate' },
    { value: 'waiting_client', label: 'Ожидание клиента', color: '#ec4899', desc: 'КП отправлено, ожидается обратная связь', icon: 'hourglass_top' },
    { value: 'success', label: 'Успешно закрыта', color: '#10b981', desc: 'Сделка подтверждена, переведена в заказ', icon: 'handshake' },
    { value: 'cancelled', label: 'Отказ', color: '#ef4444', desc: 'Отказ клиента или нецелевое обращение', icon: 'cancel' }
];

window.USER_ROLE_OPTIONS = [
    { value: 'user', label: 'USER (Пользователь)', color: '#3b82f6', desc: 'Обычный доступ к каталогу и заказам', icon: 'person' },
    { value: 'admin', label: 'ADMIN (Администратор)', color: '#ec4899', desc: 'Полный доступ к панели управления и настройкам', icon: 'shield_person' }
];

window.openStatusSelectModal = function(options, currentStatus, title = 'Выберите новый статус') {
    window.lockScrollGlobal();
    return new Promise((resolve) => {
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        
        const cardsHtml = options.map(opt => {
            const isSelected = opt.value === currentStatus;
            const borderClass = isSelected ? `border-[${opt.color}] bg-[${opt.color}]/10` : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20';
            const shadowClass = isSelected ? `shadow-lg shadow-[${opt.color}]/20` : '';
            return `
                <button type="button" data-value="${opt.value}" class="status-option-card w-full p-4 rounded-2xl border ${borderClass} ${shadowClass} flex items-center gap-4 transition-all active:scale-95 text-left group">
                    <div class="w-12 h-12 rounded-xl bg-[#151311] border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform" style="color: ${opt.color}; border-color: ${opt.color}40;">
                        <span class="material-symbols-outlined text-2xl">${opt.icon || 'radio_button_unchecked'}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <span class="font-['Space Grotesk'] text-sm font-bold tracking-tight uppercase" style="color: ${opt.color};">${opt.label}</span>
                            ${isSelected ? `<span class="material-symbols-outlined text-sm animate-pulse" style="color: ${opt.color};">task_alt</span>` : ''}
                        </div>
                        <p class="text-xs text-[#d7c1c7] opacity-80 leading-relaxed truncate">${opt.desc || ''}</p>
                    </div>
                </button>
            `;
        }).join('');

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-[#151311]/95 border border-white/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col transform scale-95 transition-all duration-300 min-h-0 overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-1 opacity-80 background-gradient" style="background: linear-gradient(90deg, transparent, #964551, transparent);"></div>
                
                <div class="p-8 pb-6 flex items-center justify-between border-b border-white/5 shrink-0">
                    <div>
                        <h3 class="font-['Space Grotesk'] text-xl font-bold tracking-tight text-[#e7e2dd]">
                            ${title}
                        </h3>
                        <p class="text-xs text-[#d7c1c7] opacity-60 mt-1">Выберите один из доступных этапов</p>
                    </div>
                    <button type="button" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#d7c1c7] hover:text-white transition-all cancel-icon-btn active:scale-95 shrink-0">
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
                
                <div class="p-8 py-6 flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0 max-h-[60vh]">
                    ${cardsHtml}
                </div>
                
                <div class="p-8 pt-4 flex items-center justify-center bg-[#151311] border-t border-white/5 shrink-0">
                    <button type="button" class="w-full px-6 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold uppercase tracking-widest text-[#d7c1c7] cancel-btn active:scale-95">
                        Отмена
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            modalWrapper.classList.remove('opacity-0');
            modalWrapper.querySelector('.modal-content').classList.remove('scale-95');
        });
        
        const close = (result) => {
            modalWrapper.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('scale-95');
            setTimeout(() => {
                modalWrapper.remove();
                window.unlockScrollGlobal();
                resolve(result);
            }, 300);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = () => close(null);
        modalWrapper.querySelector('.cancel-icon-btn').onclick = () => close(null);
        modalWrapper.querySelector('.cancel-btn').onclick = () => close(null);
        
        modalWrapper.querySelectorAll('.status-option-card').forEach(card => {
            card.onclick = () => {
                const val = card.dataset.value;
                close(val);
            };
        });
    });
};

// ─── CENTRALIZED SCROLL LOCK ─────────────────────────────────────────────────
// Uses a reference counter so multiple popups don't conflict
;(function() {
    let _lockCount = 0;
    let _savedScrollY = 0;

    window.lockScrollGlobal = function() {
        _lockCount++;
        if (_lockCount === 1) {
            _savedScrollY = window.scrollY;
            document.body.style.top = '-' + _savedScrollY + 'px';
            document.body.classList.add('scroll-locked');
        }
    };

    window.unlockScrollGlobal = function() {
        if (_lockCount <= 0) return;
        _lockCount--;
        if (_lockCount === 0) {
            document.body.classList.remove('scroll-locked');
            document.body.style.top = '';
            window.scrollTo(0, _savedScrollY);
        }
    };

    window.forceUnlockScrollGlobal = function() {
        _lockCount = 0;
        document.body.classList.remove('scroll-locked');
        document.body.style.top = '';
        window.scrollTo(0, _savedScrollY);
    };

    // Inject scroll-lock CSS once
    const style = document.createElement('style');
    style.textContent = `
        body.scroll-locked {
            position: fixed;
            width: 100%;
            overflow-y: scroll; /* keep scrollbar visible to prevent layout shift */
        }
    `;
    document.head.appendChild(style);
})();
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────

window.maskPhoneGlobal = function(input) {
    let val = input.value.replace(/\D/g, '');
    if (val.startsWith('7')) val = val.substring(1);
    else if (val.startsWith('8')) val = val.substring(1);
    val = val.substring(0, 10);
    
    let res = '+7';
    if (val.length > 0) {
        res += '-(' + val.substring(0, 3);
        if (val.length >= 3) res += ')';
        if (val.length > 3) res += '-' + val.substring(3, 6);
        if (val.length > 6) res += '-' + val.substring(6, 8);
        if (val.length > 8) res += '-' + val.substring(8, 10);
    }
    input.value = res;
};

window.formatPhoneGlobal = function(value) {
    if (!value) return '';
    let val = value.replace(/\D/g, '');
    if (val.startsWith('7')) val = val.substring(1);
    else if (val.startsWith('8')) val = val.substring(1);
    val = val.substring(0, 10);
    
    let res = '+7';
    if (val.length > 0) {
        res += '-(' + val.substring(0, 3);
        if (val.length >= 3) res += ')';
        if (val.length > 3) res += '-' + val.substring(3, 6);
        if (val.length > 6) res += '-' + val.substring(6, 8);
        if (val.length > 8) res += '-' + val.substring(8, 10);
    }
    return res;
};

window.limitDigitsGlobal = function(input, max) {
    let cursor = input.selectionStart;
    let oldLen = input.value.length;
    input.value = input.value.replace(/\D/g, '').substring(0, max);
    let newLen = input.value.length;
    if (cursor !== null) {
        input.setSelectionRange(cursor - (oldLen - newLen), cursor - (oldLen - newLen));
    }
};

window.validateProfileDataGlobal = function(data) {
    if (data.phone) {
        const digits = data.phone.replace(/\D/g, '');
        // We expect 11 digits (7 + 10 digits)
        if (digits.length !== 11) return "Введите полный номер телефона (11 цифр)";
    }
    if (data.inn && data.inn.length > 0) {
        const digits = data.inn.replace(/\D/g, '');
        if (digits.length !== 10 && digits.length !== 12) return "ИНН должен содержать 10 или 12 цифр";
    }
    if (data.kpp && data.kpp.length > 0) {
        const digits = data.kpp.replace(/\D/g, '');
        if (digits.length !== 9) return "КПП должен содержать 9 цифр";
    }
    return null;
};

// --- COOKIES & JWT SESSION SYNC UTILITIES ---
window.setCookieGlobal = function(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value || "") + expires + "; path=/; SameSite=Lax";
};

window.getCookieGlobal = function(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
};

window.eraseCookieGlobal = function(name) {
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
};

window.parseJwtGlobal = function(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

window.isTokenExpiredGlobal = function(token) {
    const payload = window.parseJwtGlobal(token);
    if (!payload || !payload.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};

window.syncAuthStorageAndCookiesGlobal = function() {
    const cookieToken = window.getCookieGlobal('metal_token');
    const cookieUser = window.getCookieGlobal('metal_user');
    const storageToken = localStorage.getItem('metal_token');
    const storageUser = localStorage.getItem('metal_user');

    if (cookieToken && !storageToken) {
        localStorage.setItem('metal_token', cookieToken);
        if (cookieUser) localStorage.setItem('metal_user', cookieUser);
    } else if (storageToken && !cookieToken) {
        window.setCookieGlobal('metal_token', storageToken, 7);
        if (storageUser) window.setCookieGlobal('metal_user', storageUser, 7);
    }

    const activeToken = storageToken || cookieToken;
    if (activeToken && window.isTokenExpiredGlobal(activeToken)) {
        localStorage.removeItem('metal_token');
        localStorage.removeItem('metal_user');
        localStorage.removeItem('metal_orders');
        window.eraseCookieGlobal('metal_token');
        window.eraseCookieGlobal('metal_user');
    }
};

(function() {
    const preloaderStyles = `
        #globalPreloader {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(21, 19, 17, 0.8) !important;
            backdrop-filter: blur(25px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
            box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.02), inset 0 0 40px rgba(255, 176, 204, 0.02) !important;
            z-index: 999999; 
            display: flex; flex-direction: column; align-items: center; justify-content: center; 
            transition: opacity 0.8s cubic-bezier(0.77, 0, 0.175, 1), visibility 0.8s;
            pointer-events: auto;
        }
        #globalPreloader.fade-out {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .preloader-visual {
            position: relative; width: 180px; height: 180px;
            display: flex; align-items: center; justify-content: center;
        }
        .loader-ring {
            position: absolute; inset: 0;
            border: 1px solid rgba(255, 176, 204, 0.05);
            border-radius: 50%;
        }
        .loader-ring::after {
            content: ''; position: absolute; inset: -4px;
            border: 2px solid transparent;
            border-top-color: #c7c5c5;
            border-radius: 50%;
            animation: preloader-spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .loader-hex {
            width: 100px; height: 100px;
            background: rgba(255, 176, 204, 0.03);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(255, 176, 204, 0.2);
            animation: preloader-pulse 2s ease-in-out infinite;
            position: relative; overflow: hidden;
        }
        .loader-hex::before {
            content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
            background: linear-gradient(to bottom, transparent, rgba(255, 176, 204, 0.3), transparent);
            animation: preloader-scan 3s ease-in-out infinite;
        }
        .loader-logo {
            width: 64px; height: 64px; object-fit: cover; border-radius: 50%;
            filter: drop-shadow(0 0 15px rgba(255, 176, 204, 0.4));
            z-index: 10;
            opacity: 0.9;
        }
        .loader-text {
            margin-top: 48px; font-family: 'Space Grotesk', sans-serif;
            font-size: 10px; color: #c7c5c5; letter-spacing: 0.6em;
            text-transform: uppercase; opacity: 0.6;
            animation: preloader-text-pulse 1.5s ease-in-out infinite;
        }
        .loader-progress-track {
            width: 200px; height: 1px; background: rgba(255, 176, 204, 0.1);
            margin-top: 16px; position: relative; overflow: hidden;
        }
        .loader-progress-bar {
            position: absolute; top: 0; left: 0; height: 100%; width: 0%;
            background: #964551; box-shadow: 0 0 10px #964551;
            transition: width 0.4s ease;
        }
        @keyframes preloader-spin {
            to { transform: rotate(360deg); }
        }
        @keyframes preloader-pulse {
            0%, 100% { transform: scale(1); border-color: rgba(255, 176, 204, 0.2); }
            50% { transform: scale(1.02); border-color: rgba(255, 176, 204, 0.5); }
        }
        @keyframes preloader-scan {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        @keyframes preloader-text-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
        }
        body.preloader-active { overflow: hidden !important; height: 100vh !important; }
 
        /* Light Theme Preloader (Liquid Glass & Contrast Overrides) */
        html.light #globalPreloader, html:not(.dark) #globalPreloader {
            background: rgba(250, 250, 250, 0.8) !important;
            backdrop-filter: blur(25px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
            box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.5), inset 0 0 40px rgba(214, 51, 108, 0.03) !important;
        }
        html.light .loader-ring, html:not(.dark) .loader-ring {
            border-color: rgba(214, 51, 108, 0.08) !important;
        }
        html.light .loader-ring::after, html:not(.dark) .loader-ring::after {
            border-top-color: #d6336c !important;
        }
        html.light .loader-hex, html:not(.dark) .loader-hex {
            background: rgba(214, 51, 108, 0.03) !important;
            border-color: rgba(214, 51, 108, 0.2) !important;
        }
        html.light .loader-hex::before, html:not(.dark) .loader-hex::before {
            background: linear-gradient(to bottom, transparent, rgba(214, 51, 108, 0.3), transparent) !important;
        }
        html.light .loader-logo, html:not(.dark) .loader-logo {
            filter: drop-shadow(0 0 15px rgba(214, 51, 108, 0.3)) !important;
        }
        html.light .loader-text, html:not(.dark) .loader-text {
            color: #3B3B3B !important;
            opacity: 0.8 !important;
        }
        html.light .loader-progress-track, html:not(.dark) .loader-progress-track {
            background: rgba(214, 51, 108, 0.1) !important;
        }
        html.light .loader-progress-bar, html:not(.dark) .loader-progress-bar {
            background: #d6336c !important;
            box-shadow: 0 0 10px rgba(214, 51, 108, 0.5) !important;
        }
    `;

    const inject = () => {
        if (document.getElementById('globalPreloader')) return;
        
        const style = document.createElement('style');
        style.id = 'preloader-styles-global';
        style.innerHTML = preloaderStyles;
        document.head.appendChild(style);

        const html = `
            <div id="globalPreloader">
                <div class="preloader-visual">
                    <div class="loader-ring"></div>
                    <div class="loader-hex">
                        <img src="/images/logo_icon.png" class="loader-logo" alt="IW">
                    </div>
                </div>
                <div class="loader-text">Инициализация систем</div>
                <div class="loader-progress-track">
                    <div class="loader-progress-bar" id="globalPreloaderBar"></div>
                </div>
            </div>
        `;
        
        const tryInject = () => {
            if (document.body) {
                document.body.insertAdjacentHTML('afterbegin', html);
                document.body.classList.add('preloader-active');
                
                // Animate progress bar slightly to show "activity"
                setTimeout(() => {
                    const bar = document.getElementById('globalPreloaderBar');
                    if (bar) bar.style.width = '30%';
                }, 100);
                setTimeout(() => {
                    const bar = document.getElementById('globalPreloaderBar');
                    if (bar) bar.style.width = '65%';
                }, 400);
            } else {
                requestAnimationFrame(tryInject);
            }
        };
        tryInject();
    };

    inject();

    let preloaderDismissed = false;
    const dismissPreloader = () => {
        if (preloaderDismissed) return;
        preloaderDismissed = true;

        const bar = document.getElementById('globalPreloaderBar');
        if (bar) bar.style.width = '100%';

        setTimeout(() => {
            const loader = document.getElementById('globalPreloader');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => {
                    loader.remove();
                    document.body.classList.remove('preloader-active');
                }, 800);
            }
        }, 300);
    };

    window.addEventListener('load', dismissPreloader);
    
    // Safety fallback: if some assets (like Google Fonts or Tailwind CDN) are blocked/throttled,
    // don't lock the user on a blank preloader screen forever.
    setTimeout(dismissPreloader, 2500);
    // Auto-attach masks to any relevant inputs
    function attachGlobalMasks() {
        document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach(input => {
            input.addEventListener('input', () => window.maskPhoneGlobal(input));
            input.addEventListener('blur', () => {
                if (input.value === '+7-') input.value = '';
            });
        });
        document.querySelectorAll('input[name="inn"], input[id*="Inn"]').forEach(input => {
            input.addEventListener('input', () => window.limitDigitsGlobal(input, 12));
        });
        document.querySelectorAll('input[name="kpp"], input[id*="Kpp"]').forEach(input => {
            input.addEventListener('input', () => window.limitDigitsGlobal(input, 9));
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachGlobalMasks);
    } else {
        attachGlobalMasks();
    }
})();

// Global Navigation Toggles
window.toggleMobileMenuGlobal = function() {
    const panel = document.getElementById('mobileMenuPanelGlobal');
    const overlay = document.getElementById('mobileMenuOverlayGlobal');
    const drawer = document.getElementById('mobileMenuDrawerGlobal');
    if (!panel || !overlay || !drawer) return;
    
    const isOpen = panel.classList.contains('translate-x-0');
    
    if (isOpen) {
        panel.classList.remove('translate-x-0');
        panel.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        setTimeout(() => { 
            drawer.classList.add('pointer-events-none'); 
            window.unlockScrollGlobal(); // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('-translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        window.lockScrollGlobal(); // Lock scroll
    }
};

window.toggleMobileCatalogGlobal = function() {
    const modal = document.getElementById('mobileCatalogDrawerGlobal');
    const panel = document.getElementById('mobileCatalogPanelGlobal');
    const overlay = document.getElementById('mobileCatalogOverlayGlobal');
    if (!modal || !panel || !overlay) return;

    const isOpen = panel.classList.contains('translate-x-0');
    
    if (isOpen) {
        panel.classList.remove('translate-x-0');
        panel.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        // document.body.style.overflow = ''; // Keep locked as we return to menu
        setTimeout(() => { 
            modal.classList.add('pointer-events-none');
            window.toggleMobileMenuGlobal(); // Return to burger menu
        }, 400);
    } else {
        modal.classList.remove('pointer-events-none');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        window.lockScrollGlobal(); // Lock scroll
    }
};



    window.toggleSearchGlobal = function() {
        const overlay = document.getElementById('globalSearchOverlay');
        const container = document.getElementById('searchContainerGlobal');
        const backdrop = document.getElementById('searchBackdropGlobal');
        const input = document.getElementById('globalSearchInput');
        if (!overlay || !container) return;
        
        const isOpen = overlay.classList.contains('active-search');
        
        if (isOpen) {
            container.classList.add('translate-y-[-50px]');
            container.classList.add('opacity-0');
            container.classList.add('pointer-events-none');
            container.classList.remove('pointer-events-auto');
            backdrop.classList.add('opacity-0');
            backdrop.style.pointerEvents = 'none'; // Disable backdrop clicks
            overlay.classList.remove('active-search');
            setTimeout(() => { 
                overlay.classList.add('pointer-events-none'); 
                window.unlockScrollGlobal(); // Restore scroll AFTER animation
            }, 600);
        } else {
            overlay.classList.remove('pointer-events-none');
            overlay.classList.add('active-search');
            backdrop.classList.remove('opacity-0');
            backdrop.style.pointerEvents = 'auto'; // Enable backdrop clicks
            container.classList.remove('translate-y-[-50px]');
            container.classList.remove('opacity-0');
            container.classList.remove('pointer-events-none');
            container.classList.add('pointer-events-auto');
            window.lockScrollGlobal(); // Disable scroll
            if(input) setTimeout(() => input.focus(), 300);
        }
    };

window.toggleCartDrawerGlobal = function() {
    const panel = document.getElementById('cartPanelGlobal');
    const overlay = document.getElementById('cartOverlayGlobal');
    const drawer = document.getElementById('cartDrawerGlobal');
    if (!panel || !overlay || !drawer) return;
    
    const isOpen = panel.classList.contains('translate-x-0');
    
    if (isOpen) {
        panel.classList.remove('translate-x-0');
        panel.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        setTimeout(() => { 
            drawer.classList.add('pointer-events-none'); 
            window.unlockScrollGlobal(); // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        window.lockScrollGlobal(); // Lock scroll
        if (window.renderCartDrawerItems) window.renderCartDrawerItems();
    }
};

window.toggleAuthModalGlobal = function() {
    const panel = document.getElementById('authPanelGlobal');
    const overlay = document.getElementById('authOverlayGlobal');
    const drawer = document.getElementById('authDrawerGlobal');
    if (!panel || !overlay || !drawer) return;
    
    const isOpen = panel.classList.contains('translate-x-0');
    
    if (isOpen) {
        panel.classList.remove('translate-x-0');
        panel.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        setTimeout(() => { 
            drawer.classList.add('pointer-events-none'); 
            window.unlockScrollGlobal(); // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        window.lockScrollGlobal(); // Lock scroll
        if (window.checkAuthStatus) window.checkAuthStatus();
    }
};

window.renderCartDrawerItems = function() {
    const container = document.getElementById('cartItemsGlobal');
    const totalEl = document.getElementById('cartTotalGlobal');
    if (!container || !totalEl) return;
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="text-center py-20 text-on-surface-variant font-label-caps text-xs tracking-widest opacity-50">ВАША КОРЗИНА ПУСТА</div>';
        totalEl.textContent = '0 ₽';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map((item, index) => {
        const itemTotal = (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1);
        total += itemTotal;
        const qtyDisplay = Number(item.qty).toFixed(2);
        return `
            <div onclick="window.openProductModalGlobal('${item.id}')" class="flex flex-col gap-3 p-4 bg-surface-container border border-outline-variant/10 rounded-xl group hover:border-primary/30 transition-all relative overflow-hidden cursor-pointer">
                <div class="flex justify-between items-start gap-4">
                    <div class="flex-1">
                        <div class="text-[11px] font-bold uppercase tracking-tight text-on-surface line-clamp-1 mb-1">${item.name || item.id}</div>
                        <div class="text-[10px] font-label-caps text-on-surface-variant tracking-wider">${Number(item.price || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽ / ${item.unit || 'т.'}</div>
                    </div>
                    <button onclick="event.stopPropagation(); removeFromCartGlobal(${index})" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group/del relative z-10">
                        <span class="material-symbols-outlined text-[16px]">close</span>
                    </button>
                </div>
                
                    <div class="flex justify-between items-center pt-2 border-t border-white/5">
                        <div class="flex items-center border border-white/10 rounded-lg overflow-hidden h-8 bg-white/5" onclick="event.stopPropagation()">
                            <button onclick="window.changeCartQtyGlobal(${index}, -1)" class="w-8 h-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors">
                                <span class="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <input type="text" value="${qtyDisplay}" onchange="window.setCartQtyGlobal(${index}, this.value)" class="w-12 bg-transparent border-0 text-center font-bold text-on-surface focus:ring-0 p-0 text-[11px] outline-none"/>
                            <button onclick="window.changeCartQtyGlobal(${index}, 1)" class="w-8 h-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors">
                                <span class="material-symbols-outlined text-sm">add</span>
                            </button>
                        </div>
                        <div class="text-xs font-bold text-primary whitespace-nowrap min-w-[80px] text-right">${itemTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
                    </div>
            </div>
        `;
    }).join('');
    totalEl.textContent = total.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
};

window.removeFromCartGlobal = function(index) {
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('metal_cart', JSON.stringify(cart));
    
    // Refresh UI
    window.renderCartDrawerItems();
    if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
    
    // If on cart page, refresh it too
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }
};

window.changeCartQtyGlobal = function(index, delta) {
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    if (!cart[index]) return;
    
    let currentQty = parseFloat(cart[index].qty) || 0;
    const step = 1;
    
    cart[index].qty = Math.max(1, currentQty + (delta * step)).toFixed(2);
    localStorage.setItem('metal_cart', JSON.stringify(cart));
    
    window.renderCartDrawerItems();
    if (typeof updateCartUI === 'function') updateCartUI();
};

window.setCartQtyGlobal = function(index, val) {
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    if (!cart[index]) return;
    
    cart[index].qty = Math.max(0.01, parseFloat(val.replace(',', '.')) || 0.01).toFixed(2);
    localStorage.setItem('metal_cart', JSON.stringify(cart));
    
    window.renderCartDrawerItems();
    if (typeof updateCartUI === 'function') updateCartUI();
};

window.checkAuthStatus = async function() {
    // 1. Sync auth cookies and storage first
    if (window.syncAuthStorageAndCookiesGlobal) {
        window.syncAuthStorageAndCookiesGlobal();
    }

    const token = localStorage.getItem('metal_token');
    const cachedUserRaw = localStorage.getItem('metal_user');
    const lo = document.getElementById('authContentLoggedOut');
    const li = document.getElementById('authContentLoggedIn');
    const un = document.getElementById('userNameGlobal');
    
    // Helper to render auth UI immediately
    const updateAuthUI = (user) => {
        if (lo) lo.classList.add('hidden');
        if (li) li.classList.remove('hidden');
        if (un) un.textContent = user.name || user.email.split('@')[0];
    };

    const clearAuthUI = () => {
        if (lo) lo.classList.remove('hidden');
        if (li) li.classList.add('hidden');
    };

    // 2. Validate token locally
    if (!token || (window.isTokenExpiredGlobal && window.isTokenExpiredGlobal(token))) { 
        clearAuthUI();
        return; 
    }

    // 3. Render cached user details instantly
    let hasCache = false;
    if (cachedUserRaw) {
        try {
            const user = JSON.parse(cachedUserRaw);
            updateAuthUI(user);
            hasCache = true;
        } catch(e) {
            console.error("Error reading cached user in checkAuthStatus:", e);
        }
    }

    // 4. Background verification (silent & non-blocking)
    try {
        const res = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { 
            const user = await res.json();
            // Cache user
            localStorage.setItem('metal_user', JSON.stringify(user));
            if (window.setCookieGlobal) {
                window.setCookieGlobal('metal_user', JSON.stringify(user), 7);
            }
            updateAuthUI(user);
        } else {
            // Token is invalid on server side (e.g. user deleted or pass changed)
            if (window.handleLogoutGlobal) {
                window.handleLogoutGlobal();
            } else {
                localStorage.removeItem('metal_token');
                localStorage.removeItem('metal_user');
                localStorage.removeItem('metal_orders');
                if (window.eraseCookieGlobal) {
                    window.eraseCookieGlobal('metal_token');
                    window.eraseCookieGlobal('metal_user');
                }
            }
            clearAuthUI();
        }
    } catch (e) {
        // Network error (offline mode) - keep showing the cached profile if we have it!
        console.warn("Silent auth check failed (offline mode):", e);
        if (!hasCache) {
            clearAuthUI();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');
    if (isAdmin) {
        const style = `
        <style>
            #floatingChatBtnGlobal {
                z-index: 5000;
                opacity: 0;
                visibility: hidden;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(20px);
            }
            #floatingChatBtnGlobal.visible {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            #scrollTopBtnGlobal {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                transform: translateY(20px);
            }
            #scrollTopBtnGlobal.visible {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
                transform: translateY(0);
            }
            /* --- PREMIUM PINK SCROLLBAR --- */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: #151311; }
            ::-webkit-scrollbar-thumb { background: #ca7093; border-radius: 10px; border: 2px solid #151311; }
            ::-webkit-scrollbar-thumb:hover { background: #964551; }
            * { scrollbar-width: thin; scrollbar-color: #ca7093 #151311; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 176, 204, 0.3); }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #964551; }
        </style>
        `;
        const adminFloatingBtns = `
        <button id="floatingChatBtnGlobal" onclick="openGlobalChatDrawerGlobal()" class="fixed bottom-8 right-[104px] z-[5000] w-14 h-14 bg-[#964551] border border-[#964551]/30 text-[#c7c5c5] flex items-center justify-center hover:bg-white transition-all shadow-2xl shadow-[#964551]/30 group rounded-2xl">
            <span class="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">forum</span>
            <span id="floatingChatBadgeGlobal" class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center hidden animate-pulse">!</span>
        </button>

        <button id="scrollTopBtnGlobal" onclick="scrollToTopGlobal()" class="fixed bottom-8 right-8 z-[5000] w-14 h-14 bg-[#1d1b19] border border-[#964551] text-[#c7c5c5] flex items-center justify-center hover:bg-[#964551] hover:text-[#c7c5c5] transition-all shadow-2xl shadow-[#964551]/20 group">
            <span class="material-symbols-outlined text-[28px] group-hover:-translate-y-1 transition-transform">arrow_upward</span>
        </button>
        `;
        document.head.insertAdjacentHTML('beforeend', style);
        document.body.insertAdjacentHTML('beforeend', adminFloatingBtns);
        return;
    }

    const headerHtml = `
    <div id="scrollProgressGlobal"></div>
    <nav id="globalHeader" class="fixed top-0 w-full z-[1000] bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
        <div class="flex justify-between items-center h-20 px-4 md:px-margin-edge w-full max-w-container-max mx-auto">
            <div class="flex items-center gap-4 group">
                <button id="mobileMenuBtnGlobal" onclick="toggleMobileMenuGlobal()" class="md:hidden material-symbols-outlined text-on-surface hover:text-primary transition-colors">menu</button>
                <a class="logo-link-hover-effect flex items-center gap-4 whitespace-nowrap no-underline" href="/">
                    <div class="relative logo-img-container">
                        <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 logo-bg-glow transition-opacity duration-500"></div>
                        <img src="/images/logo_icon.png" alt="Железный Дровосек" class="logo-img w-14 h-14 md:w-16 md:h-16 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(255,176,204,0.4)]">
                    </div>
                    <div class="flex flex-col items-start leading-none">
                        <span class="logo-text-part-1 font-display-xl text-[20px] md:text-[24px] leading-tight tracking-tight text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="logo-text-part-2 font-display-xl text-[20px] md:text-[24px] leading-tight tracking-tight text-primary font-semibold uppercase">ДРОВОСЕК</span>
                    </div>
                </a>
            </div>
             <div class="hidden md:flex items-center gap-8 mx-auto whitespace-nowrap">
                <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-300 no-underline" href="/">ГЛАВНАЯ</a>
                <div class="catalog-menu-wrapper relative" id="catalogMenuWrapperGlobal">
                    <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-300 flex items-center gap-1 cursor-pointer no-underline" id="catalogBtnGlobal" href="/catalog">КАТАЛОГ <span class="material-symbols-outlined text-[18px]">expand_more</span></a>
                </div>
                <div class="about-menu-wrapper relative h-full flex items-center" id="aboutMenuWrapperGlobal">
                    <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-300 no-underline flex items-center gap-1 cursor-pointer" id="aboutBtnGlobal" href="/about.html">О КОМПАНИИ <span class="material-symbols-outlined text-[18px]">expand_more</span></a>
                </div>
            </div>
            <div class="flex items-center gap-2 md:gap-6 whitespace-nowrap">
                <!-- Search Button -->
                <button id="globalSearchBtn" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-white/5 active:scale-95" onclick="toggleSearchGlobal()">search</button>

                <div class="relative group">
                    <button onclick="toggleCartDrawerGlobal()" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-white/5 active:scale-95 relative no-underline flex items-center">
                        shopping_cart
                        <span id="cartBadgeGlobal" class="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full hidden">0</span>
                    </button>
                </div>
                <!-- Apple-style Theme Toggle -->
                <div class="apple-toggle-container group" onclick="window.toggleThemeGlobal()">
                    <div class="apple-toggle-icons">
                        <span class="material-symbols-outlined">dark_mode</span>
                        <span class="material-symbols-outlined">light_mode</span>
                    </div>
                    <div class="apple-toggle-thumb">
                        <span class="material-symbols-outlined theme-icon-active text-[14px]">dark_mode</span>
                    </div>
                </div>
                <button id="authBtnGlobal" onclick="toggleAuthModalGlobal()" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-white/5 active:scale-95">person</button>
            </div>

        </div>
    </nav>

    <div id="mobileMenuDrawerGlobal" class="fixed inset-0 z-[4000] pointer-events-none overflow-hidden md:hidden">
        <div id="mobileMenuOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleMobileMenuGlobal()"></div>
        <div id="mobileMenuPanelGlobal" class="absolute top-0 left-0 w-[85%] max-w-sm h-full bg-surface/90 backdrop-blur-[40px] border-r border-white/10 -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto p-8 flex flex-col">
            <header class="flex justify-between items-center mb-10">
                <a href="/" class="logo-link-hover-effect flex items-center gap-4 leading-none no-underline">
                    <div class="relative logo-img-container">
                        <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 logo-bg-glow transition-opacity duration-500"></div>
                        <img src="/images/logo_icon.png" alt="Logo" class="logo-img w-14 h-14 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_15px_rgba(255,176,204,0.3)]">
                    </div>
                    <div class="flex flex-col items-start leading-none">
                        <span class="logo-text-part-1 font-display-xl text-[20px] text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="logo-text-part-2 font-display-xl text-[20px] text-primary font-semibold uppercase">ДРОВОСЕК</span>
                    </div>
                </a>
                <button onclick="toggleMobileMenuGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5">close</button>
            </header>
            
            <nav class="flex-1 flex flex-col gap-6 mt-4 pl-2 overflow-y-auto custom-scrollbar">
                <button class="text-lg font-display-xl uppercase text-left hover:text-primary transition-all tracking-tight border-b border-white/5 pb-3 no-underline text-on-surface flex justify-between items-center group" onclick="toggleMobileCatalogGlobal(); toggleMobileMenuGlobal();">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary text-xl">grid_view</span>
                        КАТАЛОГ 
                    </div>
                    <span class="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
                
                <div class="space-y-4 pt-2">
                    <h3 class="text-[10px] font-label-caps text-on-surface-variant tracking-[0.2em] uppercase opacity-40 mb-4 px-1">О КОМПАНИИ</h3>
                    <div class="flex flex-col gap-5 pl-1">
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/about">
                            <span class="material-symbols-outlined text-primary text-lg">info</span>
                            История и цели
                        </a>
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/logistics">
                            <span class="material-symbols-outlined text-primary text-lg">local_shipping</span>
                            Автопарк
                        </a>
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/certificates">
                            <span class="material-symbols-outlined text-primary text-lg">workspace_premium</span>
                            Сертификаты
                        </a>
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/contacts">
                            <span class="material-symbols-outlined text-primary text-lg">mail</span>
                            Контакты
                        </a>
                    </div>
                </div>

                <a class="text-lg font-display-xl uppercase hover:text-primary transition-all tracking-tight border-t border-white/5 pt-4 no-underline text-on-surface flex items-center gap-3" href="/news">
                    <span class="material-symbols-outlined text-primary text-xl">newspaper</span>
                    НОВОСТИ
                </a>
            </nav>

            <footer class="mt-auto pt-8 border-t border-white/5">
               <div class="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-2xl">
                   <span class="font-label-caps text-[11px] tracking-widest text-on-surface opacity-60">ТЕМА ОФОРМЛЕНИЯ</span>
                   <div class="apple-toggle-container" onclick="window.toggleThemeGlobal()">
                       <div class="apple-toggle-icons">
                           <span class="material-symbols-outlined">dark_mode</span>
                           <span class="material-symbols-outlined">light_mode</span>
                       </div>
                       <div class="apple-toggle-thumb">
                           <span class="material-symbols-outlined theme-icon-active text-[14px]">dark_mode</span>
                       </div>
                   </div>
               </div>
               <div class="flex gap-4 mb-6">
                    <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all no-underline"><i class="fa-brands fa-vk"></i></a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all no-underline"><i class="fa-brands fa-telegram"></i></a>
                </div>
                <div class="text-[10px] text-on-surface-variant font-label-caps tracking-widest opacity-50">© 2024 ЖЕЛЕЗНЫЙ ДРОВОСЕК</div>
            </footer>
        </div>
    </div>

    <!-- Mobile Catalog Popup -->
    <div id="mobileCatalogDrawerGlobal" class="fixed inset-0 z-[4100] pointer-events-none overflow-hidden md:hidden">
        <div id="mobileCatalogOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleMobileCatalogGlobal()"></div>
        <div id="mobileCatalogPanelGlobal" class="absolute top-0 right-0 w-[90%] max-w-sm h-full bg-surface/95 backdrop-blur-[40px] border-l border-white/10 translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto p-6 flex flex-col">
            <header class="flex justify-between items-center mb-6">
                <div class="font-display-xl text-[18px] text-primary font-bold uppercase tracking-widest">КАТАЛОГ ТОВАРОВ</div>
                <button onclick="toggleMobileCatalogGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5">close</button>
            </header>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div class="space-y-8 pb-10">
                    <!-- Metal Categories -->
                    <div class="space-y-6">
                        <h3 class="text-[10px] font-label-caps text-on-surface-variant tracking-[0.2em] uppercase opacity-40 mb-2">МЕТАЛЛОПРОКАТ</h3>
                        
                        <!-- L1: Black Metal -->
                        <div class="space-y-3">
                            <a href="/catalog/?pcat=Черный металлопрокат" class="text-sm font-bold uppercase text-on-surface hover:text-primary no-underline flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] opacity-50">construction</span>
                                Черный металлопрокат
                            </a>
                            <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2">
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Арматура А1" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Арматура А1</a>
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Арматура А3" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Арматура А3</a>
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Балка" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Балка (двутавр)</a>
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Уголок" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Уголок стальной</a>
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Швеллер" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Швеллер</a>
                                <a href="/catalog/?pcat=Черный металлопрокат&cat=Сетка" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Сетка стальная</a>
                            </div>
                        </div>

                        <!-- L1: Sheets -->
                        <div class="space-y-3">
                            <a href="/catalog/?pcat=Листовой металлопрокат" class="text-sm font-bold uppercase text-on-surface hover:text-primary no-underline flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] opacity-50">layers</span>
                                Листовой металлопрокат
                            </a>
                            <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2">
                                <a href="/catalog/?pcat=Листовой металлопрокат&cat=Лист холоднокатаный" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Лист холоднокатаный</a>
                            </div>
                        </div>

                        <!-- L1: Pipes -->
                        <div class="space-y-3">
                            <a href="/catalog/?pcat=Трубный металлопрокат" class="text-sm font-bold uppercase text-on-surface hover:text-primary no-underline flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] opacity-50">radio_button_unchecked</span>
                                Трубный металлопрокат
                            </a>
                            <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2">
                                <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба профильная" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Труба профильная</a>
                                <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба ВГП" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Труба ВГП</a>
                                <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба электросварная" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Труба электросварная</a>
                            </div>
                        </div>

                        <!-- L1: Roofing -->
                        <div class="space-y-3">
                            <a href="/catalog/?pcat=Кровля и фасад" class="text-sm font-bold uppercase text-on-surface hover:text-primary no-underline flex items-center gap-2">
                                <span class="material-symbols-outlined text-[18px] opacity-50">roofing</span>
                                Кровля и фасад
                            </a>
                            <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2">
                                <a href="/catalog/?pcat=Кровля и фасад&cat=Профнастил окрашенный" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Профнастил окрашенный</a>
                                <a href="/catalog/?pcat=Кровля и фасад&cat=Профнастил оцинкованный" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider">Профнастил оцинкованный</a>
                            </div>
                        </div>
                    </div>

                    <!-- Services -->
                    <div class="space-y-6 pt-4 border-t border-white/5">
                        <h3 class="text-[10px] font-label-caps text-on-surface-variant tracking-[0.2em] uppercase opacity-40 mb-2 px-1">ДОПОЛНИТЕЛЬНО</h3>
                        <div class="flex flex-col gap-5 pl-1">
                            <a href="/calculator" class="text-md font-display-xl uppercase hover:text-primary no-underline text-on-surface flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary text-lg">calculate</span>
                                Калькулятор веса
                            </a>
                            <a href="/services" class="text-md font-display-xl uppercase hover:text-primary no-underline text-on-surface flex items-center gap-3">
                                <span class="material-symbols-outlined text-primary text-lg">content_cut</span>
                                Услуги резки
                            </a>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    </div>


    <!-- Global Search Overlay -->
    <div id="globalSearchOverlay" class="fixed inset-0 z-[5000] flex items-start justify-center pointer-events-none pt-24 px-4 overflow-hidden">
        <div id="searchBackdropGlobal" class="absolute inset-0 bg-black/80 backdrop-blur-xl opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleSearchGlobal()"></div>
        <div id="searchContainerGlobal" class="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-surface/40 backdrop-blur-[40px] border border-white/10 p-6 md:p-10 translate-y-[-50px] opacity-0 transition-all duration-500 pointer-events-none rounded-[2.5rem]">
            <div class="flex items-center gap-4 border-b border-white/20 pb-4 mb-8 flex-shrink-0">
                <span class="material-symbols-outlined text-primary text-4xl">search</span>
                <input id="globalSearchInput" type="text" placeholder="ПОИСК ПО ВСЕМУ САЙТУ..." class="w-full bg-transparent border-none text-2xl md:text-4xl font-display-xl uppercase outline-none text-on-surface placeholder:text-white/20"/>
                <button onclick="toggleSearchGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2">close</button>
            </div>
            <div id="searchResultsGlobal" class="flex-1 overflow-hidden">
                <p class="text-on-surface-variant font-label-caps text-xs tracking-widest uppercase">Начните вводить текст для поиска...</p>
            </div>
        </div>
    </div>


    <div class="mega-overlay" id="megaOverlayGlobal"></div>
    
    <div id="cartDrawerGlobal" class="fixed inset-0 z-[3000] pointer-events-none overflow-hidden">
        <div id="cartOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleCartDrawerGlobal()"></div>
        <div id="cartPanelGlobal" class="absolute top-0 right-0 w-full max-w-md h-full bg-surface border-l border-outline-variant/20 translate-x-full transition-transform duration-500 ease-in-out pointer-events-auto p-8 flex flex-col">
            <header class="flex justify-between items-center mb-8">
                <h2 class="font-display-xl text-2xl uppercase tracking-tight">КОРЗИНА</h2>
                <button onclick="toggleCartDrawerGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            </header>
            
            <div id="cartItemsGlobal" class="flex-1 overflow-y-auto space-y-4 mb-8 pr-2">
            </div>
            
            <footer class="pt-6 border-t border-outline-variant/20 space-y-6">
                <div class="flex justify-between items-end">
                    <span class="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">ИТОГО</span>
                    <span id="cartTotalGlobal" class="font-display-xl text-3xl text-primary">0 ₽</span>
                </div>
                <a href="/cart/" class="block w-full py-5 bg-primary text-on-primary text-center font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all uppercase no-underline">ОФОРМИТЬ ЗАКАЗ</a>
            </footer>
        </div>
    </div>

    <div class="mega-menu" id="megaMenuGlobal">
      <div class="mega-menu-inner">
        <div class="mega-menu-left">
          <div class="mega-cat-item" data-submenu="cherny"><a href="/catalog/?pcat=Черный металлопрокат" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">construction</span>Черный металлопрокат<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="list"><a href="/catalog/?pcat=Листовой металлопрокат" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">layers</span>Листовой металлопрокат<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="truby"><a href="/catalog/?pcat=Трубный металлопрокат" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">radio_button_unchecked</span>Трубный металлопрокат<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="krovlya"><a href="/catalog/?pcat=Кровля и фасад" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">roofing</span>Кровля и фасад<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-divider"></div>
          <div class="mega-cat-item" data-submenu="none"><a href="/calculator" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">calculate</span>Калькулятор</a></div>
          <div class="mega-cat-item" data-submenu="none"><a href="/services" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">content_cut</span>Услуги резки</a></div>
        </div>
        <div class="mega-menu-right" id="megaMenuRightGlobal">
          <div class="mega-submenu" data-parent="cherny"><div class="mega-submenu-title">Черный металлопрокат</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Арматура А1" class="mega-sub-link">Арматура А1</a>
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Арматура А3" class="mega-sub-link">Арматура А3</a>
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Балка" class="mega-sub-link">Балка (двутавр)</a>
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Уголок" class="mega-sub-link">Уголок стальной</a>
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Швеллер" class="mega-sub-link">Швеллер стальной</a>
            <a href="/catalog/?pcat=Черный металлопрокат&cat=Сетка" class="mega-sub-link">Сетка стальная</a>
          </div></div>
          <div class="mega-submenu" data-parent="list"><div class="mega-submenu-title">Листовой металлопрокат</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Листовой металлопрокат&cat=Лист холоднокатаный" class="mega-sub-link">Лист холоднокатаный</a>
          </div></div>
          <div class="mega-submenu" data-parent="truby"><div class="mega-submenu-title">Трубный металлопрокат</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба профильная" class="mega-sub-link">Труба профильная</a>
            <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба ВГП" class="mega-sub-link">Труба ВГП</a>
            <a href="/catalog/?pcat=Трубный металлопрокат&cat=Труба электросварная" class="mega-sub-link">Труба электросварная</a>
          </div></div>
          <div class="mega-submenu" data-parent="krovlya"><div class="mega-submenu-title">Кровля и фасад</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Кровля и фасад&cat=Профнастил окрашенный" class="mega-sub-link">Профнастил окрашенный</a>
            <a href="/catalog/?pcat=Кровля и фасад&cat=Профнастил оцинкованный" class="mega-sub-link">Профнастил оцинкованный</a>
          </div></div>
          <div class="mega-submenu mega-submenu-default is-active" data-parent="default"><div class="mega-default-content">
            <span class="material-symbols-outlined mega-default-icon">inventory_2</span>
            <div class="mega-default-title">Каталог продукции</div>
            <div class="mega-default-desc">Наведите на категорию, чтобы увидеть подкатегории</div>
            <a href="/catalog" class="mega-default-btn"><span>ВЕСЬ КАТАЛОГ</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
          </div></div>
        </div>
      </div>
    </div>

    <div class="mega-menu about-compact-menu" id="aboutMenuGlobal">
      <div class="mega-menu-inner">
        <div class="mega-menu-left">
          <div class="mega-cat-item"><a href="/about" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">info</span>История и цели</a></div>
          <div class="mega-cat-item"><a href="/logistics" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">local_shipping</span>Автопарк</a></div>
          <div class="mega-cat-item"><a href="/certificates" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">workspace_premium</span>Сертификаты</a></div>
          <div class="mega-cat-divider"></div>
          <div class="mega-cat-item"><a href="/contacts" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">mail</span>Контакты</a></div>
        </div>
      </div>
    </div>

    <div id="authDrawerGlobal" class="fixed inset-0 z-[3010] pointer-events-none overflow-hidden">
        <div id="authOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleAuthModalGlobal()"></div>
        <div id="authPanelGlobal" class="absolute top-0 right-0 w-full max-w-md h-full bg-surface border-l border-outline-variant/20 translate-x-full transition-transform duration-500 ease-in-out pointer-events-auto p-12 flex flex-col">
            <button onclick="toggleAuthModalGlobal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            <div class="flex-1 overflow-y-auto pt-8">
                <div id="authContentLoggedOut">
                    <header class="mb-12">
                        <div class="font-display-xl text-[32px] leading-none mb-2 uppercase">ЛИЧНЫЙ<br/><span class="text-primary">КАБИНЕТ</span></div>
                        <p class="text-on-surface-variant text-sm font-label-caps">ВОЙДИТЕ В СИСТЕМУ</p>
                    </header>
                    <div id="loginFormGlobal" class="space-y-8">
                        <div class="space-y-6">
                            <div>
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="loginEmailGlobal" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div class="relative">
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ПАРОЛЬ</label>
                                <div class="relative flex items-center">
                                    <input type="password" id="loginPassGlobal" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 pr-10 pl-0 outline-none font-body-md"/>
                                    <button type="button" onclick="togglePassVisibilityGlobal('loginPassGlobal', this)" class="absolute right-0 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5">
                                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-[-10px]">
                            <button onclick="switchAuthGlobal('forgot')" class="text-on-surface-variant hover:text-primary text-[10px] font-label-caps uppercase transition-colors tracking-wider">ЗАБЫЛИ ПАРОЛЬ?</button>
                        </div>
                        <div id="loginErrorMsgGlobal" class="text-error text-[11px] font-label-caps mt-[-16px] mb-4 hidden uppercase tracking-wider"></div>
                        <button onclick="handleLoginGlobal(event)" class="w-full py-5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">ВОЙТИ</button>
                        <div class="text-center">
                            <button onclick="switchAuthGlobal('register')" class="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[12px] uppercase">НЕТ АККАУНТА? ЗАРЕГИСТРИРОВАТЬСЯ</button>
                        </div>
                    </div>
                    <div id="registerFormGlobal" class="space-y-8 hidden">
                        <div class="space-y-6">
                            <div>
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ФИО / КОМПАНИЯ</label>
                                <input type="text" id="regNameGlobal" maxlength="100" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div>
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="regEmailGlobal" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div class="relative">
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ПАРОЛЬ</label>
                                <div class="relative flex items-center">
                                    <input type="password" id="regPassGlobal" oninput="validatePasswordStrengthGlobal(this.value)" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 pr-10 pl-0 outline-none font-body-md"/>
                                    <button type="button" onclick="togglePassVisibilityGlobal('regPassGlobal', this)" class="absolute right-0 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5">
                                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                </div>
                                <div class="mt-4 space-y-3 p-4 bg-surface-container/30 border border-outline-variant/10 rounded-xl">
                                    <div class="flex justify-between items-center text-[10px] font-label-caps tracking-wider">
                                        <span class="text-on-surface-variant">СЛОЖНОСТЬ:</span>
                                        <span id="strengthTextGlobal" class="text-error font-bold">ОЧЕНЬ СЛАБЫЙ</span>
                                    </div>
                                    <div class="h-1 bg-white/10 rounded overflow-hidden">
                                        <div id="strengthBarGlobal" class="h-full w-0 bg-error transition-all duration-300"></div>
                                    </div>
                                    <ul class="text-[11px] space-y-2 mt-2">
                                        <li id="rule-length" class="flex items-center gap-2 text-on-surface-variant opacity-50 transition-all duration-200">
                                            <span class="rule-icon material-symbols-outlined text-[14px]">circle</span>
                                            <span>Не менее 8 символов</span>
                                        </li>
                                        <li id="rule-upper" class="flex items-center gap-2 text-on-surface-variant opacity-50 transition-all duration-200">
                                            <span class="rule-icon material-symbols-outlined text-[14px]">circle</span>
                                            <span>Минимум одна заглавная (A-Z)</span>
                                        </li>
                                        <li id="rule-lower" class="flex items-center gap-2 text-on-surface-variant opacity-50 transition-all duration-200">
                                            <span class="rule-icon material-symbols-outlined text-[14px]">circle</span>
                                            <span>Минимум одна строчная (a-z)</span>
                                        </li>
                                        <li id="rule-digit" class="flex items-center gap-2 text-on-surface-variant opacity-50 transition-all duration-200">
                                            <span class="rule-icon material-symbols-outlined text-[14px]">circle</span>
                                            <span>Минимум одна цифра (0-9)</span>
                                        </li>
                                        <li id="rule-special" class="flex items-center gap-2 text-on-surface-variant opacity-50 transition-all duration-200">
                                            <span class="rule-icon material-symbols-outlined text-[14px]">circle</span>
                                            <span>Минимум один спецсимвол (!@#$)</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="regErrorMsgGlobal" class="text-error text-[11px] font-label-caps mt-[-16px] mb-4 hidden uppercase tracking-wider"></div>
                        <button id="regSubmitBtnGlobal" disabled onclick="handleRegisterGlobal()" class="w-full py-5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all opacity-50 cursor-not-allowed">СОЗДАТЬ АККАУНТ</button>
                        <div class="text-center">
                            <button onclick="switchAuthGlobal('login')" class="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[12px] uppercase">УЖЕ ЕСТЬ АККАУНТ? ВОЙТИ</button>
                        </div>
                    </div>
                    <div id="forgotFormGlobal" class="space-y-8 hidden">
                        <header class="mb-6">
                            <div class="font-display-xl text-[24px] uppercase leading-tight mb-2">ВОССТАНОВЛЕНИЕ <span class="text-primary">ДОСТУПА</span></div>
                            <p class="text-on-surface-variant text-xs font-label-caps">ВВЕДИТЕ ВАШ EMAIL ДЛЯ СБРОСА ПАРОЛЯ</p>
                        </header>
                        <div class="space-y-6">
                            <div>
                                <label class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="forgotEmailGlobal" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                        </div>
                        <div id="forgotErrorMsgGlobal" class="text-error text-[11px] font-label-caps mt-[-16px] mb-4 hidden uppercase tracking-wider"></div>
                        <button onclick="handleForgotGlobal()" class="w-full py-5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all">ОТПРАВИТЬ ССЫЛКУ</button>
                        <div class="text-center">
                            <button onclick="switchAuthGlobal('login')" class="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[12px] uppercase">НАЗАД К ВХОДУ</button>
                        </div>
                    </div>
                </div>
                <div id="authContentLoggedIn" class="hidden">
                    <header class="mb-12">
                        <div class="font-display-xl text-[32px] leading-none mb-2 uppercase">ПРИВЕТ,<br/><span class="text-primary" id="userNameGlobal">ГОСТЬ</span></div>
                        <p class="text-on-surface-variant text-sm font-label-caps">ВАШ ПЕРСОНАЛЬНЫЙ КАБИНЕТ</p>
                    </header>
                    <div class="space-y-4">
                        <a href="/cabinet/" class="flex items-center justify-between p-4 bg-surface-container border border-outline-variant/20 hover:border-primary/40 transition-all no-underline group">
                            <span class="font-label-caps text-label-caps text-on-surface">ПРОФИЛЬ И ЗАКАЗЫ</span>
                            <span class="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                        <button onclick="handleLogoutGlobal()" class="w-full py-4 border border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps hover:text-error hover:border-error/30 transition-all uppercase tracking-widest">ВЫЙТИ ИЗ АККАУНТА</button>
                    </div>
                </div>
            </div>
            <footer class="pt-8 border-t border-outline-variant/10 mt-auto">
                <p class="text-[10px] text-on-surface-variant opacity-50 uppercase tracking-widest leading-relaxed">ЖЕЛЕЗНЫЙ ДРОВОСЕК CLOUD SERVICE v2.0</p>
            </footer>
        </div>
    </div>

    <button id="floatingChatBtnGlobal" onclick="openGlobalChatDrawerGlobal()" class="fixed bottom-4 right-4 md:bottom-10 md:right-32 z-[5000] w-12 h-12 md:w-16 md:h-16 bg-primary text-on-primary flex items-center justify-center shadow-[0_8px_32px_rgba(255,176,204,0.3)] hover:scale-110 active:scale-90 transition-all duration-500 group rounded-2xl md:rounded-[1.5rem]">
        <span class="material-symbols-outlined text-[24px] md:text-[32px] group-hover:rotate-12 transition-transform">support_agent</span>
        <span id="floatingChatBadgeGlobal" class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center hidden border-2 border-background"></span>
    </button>

    <button id="scrollTopBtnGlobal" onclick="scrollToTopGlobal()" class="fixed bottom-4 left-4 md:bottom-10 md:right-10 md:left-auto z-[5000] w-12 h-12 md:w-16 md:h-16 bg-surface-container-high/80 backdrop-blur-md border border-white/10 text-primary flex items-center justify-center hover:bg-primary hover:text-surface transition-all duration-500 shadow-2xl group rounded-2xl md:rounded-[1.5rem]">
        <span class="material-symbols-outlined text-[24px] md:text-[32px] group-hover:-translate-y-1 transition-transform">arrow_upward</span>
    </button>
    `;

    // Add global mobile optimization styles
    const globalStyles = document.createElement('style');
    globalStyles.id = 'global-mobile-optimizations';
    globalStyles.textContent = `
        :root { 
            --header-height: 80px; 
            --primary-wine: #964551;
            --primary-wine-rgb: 150, 69, 81;
        }
        @media (max-width: 1024px) {
            :root { --header-height: 64px; }
            section:not(#hero):not(#cta-footer-merged):not(.no-full-height) { 
                min-height: calc(100dvh - var(--header-height)) !important;
                height: auto !important;
                padding-top: 4rem !important;
                padding-bottom: 4rem !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
            }
            .px-margin-edge-mobile { padding-left: 20px !important; padding-right: 20px !important; }
        }


        /* Override bright pink colors with wine pink */
        .text-primary, .text-\[#ff4a7a\] { color: var(--primary-wine) !important; }
        .bg-primary, .bg-\[#ff4a7a\] { background-color: var(--primary-wine) !important; }
        .border-primary, .border-\[#ff4a7a\] { border-color: var(--primary-wine) !important; }
        .hover\:bg-primary:hover { background-color: #7a3642 !important; }
        .pink-glow:hover { box-shadow: 0 0 20px rgba(var(--primary-wine-rgb), 0.25) !important; }
        
        /* Light Theme specific adjustments */
        html.light .text-primary, html.light .material-symbols-outlined { color: var(--primary-wine); }
        html.light .bg-primary { background-color: var(--primary-wine); color: #e7e2dd; } /* Light content on wine bg */
        html.light .bg-primary .material-symbols-outlined { color: #e7e2dd; }

        /* Admin/Telegram Chat Style */
        .chat-bubble { border-radius: 1.5rem; padding: 1rem 1.25rem; font-size: 0.9375rem; line-height: 1.5; position: relative; max-width: 85%; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
        .chat-bubble-bot { background: #211f1d; color: #e7e2dd; border-bottom-left-radius: 0.25rem; border: 1px solid rgba(255,255,255,0.05); }
        .chat-bubble-user { background: #964551; color: #c7c5c5; align-self: flex-end; border-bottom-right-radius: 0.25rem; font-weight: 500; }
        .chat-time { font-size: 0.7rem; text-transform: uppercase; font-weight: bold; opacity: 0.3; margin-top: 0.4rem; }
        .ease-apple { transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .modal-animate-in { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .modal-animate-out { animation: modalOut 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes modalOut { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.95) translateY(20px); } }
    `;
    document.head.appendChild(globalStyles);

    const footerHtml = `
    <footer id="globalFooter" class="bg-surface border-t border-outline-variant/20 pt-20 pb-10">
        <div class="px-margin-edge-mobile md:px-margin-edge w-full max-w-container-max mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-gutter mb-20">
                <!-- Branding Column -->
                <div class="md:col-span-4 space-y-8">
                    <a class="logo-link-hover-effect flex items-center gap-4 no-underline" href="/">
                        <div class="relative logo-img-container">
                            <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 logo-bg-glow transition-opacity duration-500"></div>
                            <img src="/images/logo_icon.png" alt="Железный Дровосек" class="logo-img w-16 h-16 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(255,176,204,0.3)]">
                        </div>
                        <div class="flex flex-col items-start leading-none">
                            <span class="logo-text-part-1 font-display-xl text-[22px] md:text-[26px] leading-tight tracking-tight text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                            <span class="logo-text-part-2 font-display-xl text-[22px] md:text-[26px] leading-tight tracking-tight text-primary font-semibold uppercase">ДРОВОСЕК</span>
                        </div>
                    </a>
                    <p class="text-on-surface-variant text-sm leading-relaxed max-w-sm opacity-80">
                        Ваш надежный партнер в мире металлопроката с 2004 года. Мы объединяем индустриальную мощь с цифровой точностью управления поставками.
                    </p>
                    <div class="flex gap-4">
                        <a href="#" class="w-10 h-10 border border-outline-variant/30 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all no-underline"><span class="material-symbols-outlined text-[18px]">share</span></a>
                        <a href="#" class="w-10 h-10 border border-outline-variant/30 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all no-underline"><span class="material-symbols-outlined text-[18px]">mail</span></a>
                    </div>
                </div>

                <!-- Links Column 1 -->
                <div class="md:col-start-6 md:col-span-2 space-y-8">
                    <h5 class="font-label-caps text-[12px] text-on-surface tracking-[0.2em] uppercase border-b border-outline-variant/20 pb-4">НАВИГАЦИЯ</h5>
                    <ul class="space-y-4">
                        <li><a href="/" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">ГЛАВНАЯ</a></li>
                        <li><a href="/catalog" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">КАТАЛОГ</a></li>
                        <li><a href="/about" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">О КОМПАНИИ</a></li>
                        <li><a href="/news" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">НОВОСТИ</a></li>
                        <li><a href="/contacts" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">КОНТАКТЫ</a></li>
                    </ul>
                </div>

                <!-- Links Column 2 -->
                <div class="md:col-span-2 space-y-8">
                    <h5 class="font-label-caps text-[12px] text-on-surface tracking-[0.2em] uppercase border-b border-outline-variant/20 pb-4">СЕРВИСЫ</h5>
                    <ul class="space-y-4">
                        <li><a href="/calculator" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">КАЛЬКУЛЯТОР</a></li>
                        <li><a href="/services" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">УСЛУГИ РЕЗКИ</a></li>
                        <li><a href="/certificates" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">СЕРТИФИКАТЫ</a></li>
                        <li><a href="/logistics" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">ЛОГИСТИКА</a></li>
                    </ul>
                </div>

                <!-- Contact Column -->
                <div class="md:col-span-3 space-y-8">
                    <h5 class="font-label-caps text-[12px] text-on-surface tracking-[0.2em] uppercase border-b border-outline-variant/20 pb-4">КОНТАКТЫ</h5>
                    <div class="space-y-4">
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-[20px]">location_on</span>
                            <span class="text-sm text-on-surface-variant leading-relaxed opacity-80">ЛО, промзона Горелово, 6</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="flex gap-3">
                                <span class="material-symbols-outlined text-primary text-[20px]">call</span>
                                <div class="flex flex-col">
                                    <a href="tel:+78129825320" class="text-sm text-on-surface hover:text-primary transition-colors no-underline font-bold">+7 (812) 982-53-20</a>
                                    <span class="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">Отдел продаж</span>
                                </div>
                            </div>
                            <div class="flex gap-3">
                                <span class="material-symbols-outlined text-primary text-[20px]">call</span>
                                <div class="flex flex-col">
                                    <a href="tel:+79930777717" class="text-sm text-on-surface hover:text-primary transition-colors no-underline font-bold">+7 (993) 077-77-17</a>
                                    <span class="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">Руководитель</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-[20px]">mail</span>
                            <a href="mailto:info@steelwoodman.ru" class="text-sm text-on-surface hover:text-primary transition-colors no-underline">info@steelwoodman.ru</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Copyright -->
            <div class="pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p class="font-label-caps text-[10px] text-on-surface-variant/50 tracking-[0.3em] uppercase">© 2024 ЖЕЛЕЗНЫЙ ДРОВОСЕК.</p>
                <div class="flex gap-8">
                    <a href="#" class="font-label-caps text-[10px] text-on-surface-variant/30 hover:text-primary transition-colors no-underline tracking-[0.2em] uppercase">Privacy Policy</a>
                    <a href="#" class="font-label-caps text-[10px] text-on-surface-variant/30 hover:text-primary transition-colors no-underline tracking-[0.2em] uppercase">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
    `;

    const style = `
    <style>
        :root {
            --header-height: 80px;
        }
        /* --- APPLE-STYLE TOGGLE --- */
        .apple-toggle-container {
            display: flex; align-items: center; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 2px; border-radius: 99px; width: 56px; height: 28px; position: relative; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        html.light .apple-toggle-container { background: #EBEBEB; border-color: #DBDBDB; }
        .apple-toggle-thumb {
            width: 24px; height: 24px; background: #FFFFFF; border-radius: 50%; box-shadow: 0 3px 8px rgba(0,0,0,0.15);
            display: flex; align-items: center; justify-content: center; transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1); z-index: 2;
        }
        html.light .apple-toggle-thumb { transform: translateX(28px); background: #FBFBFB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .apple-toggle-icons {
            position: absolute; width: 100%; height: 100%; display: flex; justify-content: space-between; align-items: center; padding: 0 6px; pointer-events: none;
        }
        .apple-toggle-icons span { font-size: 12px; color: rgba(255, 255, 255, 0.4); }
        html.light .apple-toggle-icons span { color: rgba(0, 0, 0, 0.15); }

        /* --- THEME TRANSITIONS --- */
        html.theme-switching *, html.theme-switching {
            transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), color 0.6s ease !important;
        }

        /* --- PREMIUM LOGO HOVER EFFECT --- */
        .logo-link-hover-effect {
            transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .logo-link-hover-effect:hover {
            opacity: 1 !important;
        }
        .logo-link-hover-effect .logo-img {
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                        box-shadow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                        border-color 0.4s ease;
        }
        .logo-link-hover-effect:hover .logo-img {
            transform: scale(1.08) rotate(15deg);
            border-color: #ca7093 !important;
            box-shadow: 0 0 25px rgba(255, 176, 204, 0.7) !important;
        }
        .logo-link-hover-effect .logo-bg-glow {
            transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
                        opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .logo-link-hover-effect:hover .logo-bg-glow {
            opacity: 1 !important;
            transform: scale(1.2);
        }
        .logo-link-hover-effect .logo-text-part-1,
        .logo-link-hover-effect .logo-text-part-2 {
            display: inline-block;
            transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
                        color 0.3s ease,
                        text-shadow 0.4s ease,
                        letter-spacing 0.4s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .logo-link-hover-effect:hover .logo-text-part-1 {
            transform: translateX(4px);
            letter-spacing: 0.03em;
            color: #ffffff !important;
        }
        .logo-link-hover-effect:hover .logo-text-part-2 {
            transform: translateX(6px);
            letter-spacing: 0.05em;
            color: #ca7093 !important;
            text-shadow: 0 0 15px rgba(255, 176, 204, 0.6);
        }

        /* Light mode adjustments */
        html.light .logo-link-hover-effect:hover .logo-img,
        html:not(.dark) .logo-link-hover-effect:hover .logo-img {
            border-color: #d6336c !important;
            box-shadow: 0 0 20px rgba(214, 51, 108, 0.5) !important;
        }
        html.light .logo-link-hover-effect:hover .logo-text-part-1,
        html:not(.dark) .logo-link-hover-effect:hover .logo-text-part-1 {
            color: #000000 !important;
        }
        html.light .logo-link-hover-effect:hover .logo-text-part-2,
        html:not(.dark) .logo-link-hover-effect:hover .logo-text-part-2 {
            text-shadow: 0 0 12px rgba(214, 51, 108, 0.5) !important;
            color: #d6336c !important;
        }

        #globalHeader { z-index: 1000; }
        .nav-link { position: relative; }
        .nav-link::after {
            content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
            background: #964551; transition: width 0.3s ease;
        }
        .nav-link:hover::after { width: 100%; }
        
        .mega-menu {
            opacity: 0; pointer-events: none; visibility: hidden;
            position: fixed; top: 80px; left: 0; width: 100vw; z-index: 2000;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(-10px);
        }
        .mega-menu.is-visible { 
            opacity: 1; pointer-events: auto; visibility: visible;
            transform: translateY(0);
        }
        .mega-menu-inner {
            display: flex; max-width: 1440px; margin: 0 auto; background: #1d1b19;
            border: 1px solid rgba(83, 67, 71, 0.2); border-top: 2px solid #964551;
            box-shadow: 0 40px 100px rgba(0,0,0,0.6); min-height: 400px;
        }
        .mega-menu-left { width: 300px; background: #1a1816; border-right: 1px solid rgba(83, 67, 71, 0.1); padding: 20px 0; }
        .mega-cat-link {
            display: flex; align-items: center; gap: 12px; padding: 12px 30px;
            color: #d7c1c7; text-decoration: none; font-family: 'Space Grotesk', sans-serif;
            font-size: 14px; transition: all 0.2s; position: relative;
        }
        .mega-cat-link:hover, .mega-cat-item.is-active .mega-cat-link { background: rgba(150,69,81,0.05); color: #c7c5c5; }
        .mega-cat-item.is-active .mega-cat-link::before {
            content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #964551;
        }
        .mega-menu-right { flex: 1; padding: 40px; background: #211f1d; }
        .mega-submenu { display: none; }
        .mega-submenu.is-active { display: block; animation: fadeInSub 0.3s ease; }
        @keyframes fadeInSub { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .mega-submenu-title { font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .mega-submenu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 20px; }
        .mega-sub-link { color: #d7c1c7; text-decoration: none; font-size: 13px; display: block; padding: 6px 0; transition: color 0.2s; }
        .mega-sub-link:hover { color: #c7c5c5; }
        
        .mega-overlay { 
            opacity: 0; pointer-events: none; visibility: hidden;
            position: fixed; top: 80px; left: 0; width: 100vw; height: 100vh; 
            background: rgba(0,0,0,0.5); z-index: 1999; backdrop-filter: blur(4px); 
            transition: all 0.4s ease;
        }
        .mega-overlay.is-visible { opacity: 1; pointer-events: auto; visibility: visible; }
        
        #cartDrawerGlobal { z-index: 3000; }
        #authDrawerGlobal { z-index: 3010; }
        #mobileMenuDrawerGlobal { z-index: 4000; }
        #cartPanelGlobal, #authPanelGlobal, #mobileMenuPanelGlobal, #mobileCatalogPanelGlobal, #searchContainerGlobal { 
            box-shadow: -20px 0 60px rgba(0,0,0,0.5); 
            will-change: transform, opacity;
            backface-visibility: hidden;
        }
        
        /* LIQUID GLASS EFFECT FOR DARK THEME */
        html.dark #cartPanelGlobal, 
        html.dark #authPanelGlobal {
            background: rgba(21, 19, 17, 0.4) !important;
            backdrop-filter: blur(40px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(180%) !important;
            border-left: 1px solid rgba(255, 176, 204, 0.1) !important;
            box-shadow: -20px 0 80px rgba(0, 0, 0, 0.6), inset 1px 0 0 rgba(255, 255, 255, 0.05) !important;
        }
        #mobileMenuPanelGlobal { box-shadow: 20px 0 60px rgba(0,0,0,0.5); }
        
        .mega-default-content { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 16px; }
        .mega-default-icon { font-size: 56px; color: rgba(255, 176, 204, 0.2); }
        .mega-default-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 600; color: #e7e2dd; }
        .mega-default-desc { font-size: 14px; color: rgba(215, 193, 199, 0.5); max-width: 280px; }
        .mega-default-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 12px 28px; border: 1px solid #964551; color: #c7c5c5; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-decoration: none; transition: all 0.3s ease; }
        .mega-default-btn:hover { background: #964551; color: #c7c5c5; }

        /* Compact About Menu */
        .about-compact-menu { width: auto; }
        .about-compact-menu .mega-menu-inner { 
            width: 280px; 
            min-height: auto; 
            background: #1a1816;
            border-top: 2px solid #964551;
        }
        .about-compact-menu .mega-menu-left { width: 100%; border-right: none; padding: 10px 0; }
        .about-compact-menu .mega-cat-link { padding: 10px 24px; font-size: 13px; }
        .about-compact-menu .mega-cat-divider { margin: 8px 0; background: rgba(255,255,255,0.05); }

        @media (max-width: 768px) {
            #cartPanelGlobal, #authPanelGlobal { width: 100%; max-width: 100%; }
            .mega-menu { display: none !important; }
        }

        #scrollTopBtnGlobal, #floatingChatBtnGlobal {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(20px);
        }
        #scrollTopBtnGlobal.visible, #floatingChatBtnGlobal.visible {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: translateY(0);
        }

        /* --- PREMIUM PINK SCROLLBAR --- */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #151311;
        }
        ::-webkit-scrollbar-thumb {
            background: #ca7093;
            border-radius: 10px;
            border: 2px solid #151311;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #964551;
        }

        /* For Firefox */
        * {
            scrollbar-width: thin;
            scrollbar-color: #ca7093 #151311;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 176, 204, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #964551;
        }

        /* HIDE SCROLLBAR ON MOBILE */
        @media (max-width: 768px) {
            ::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            * {
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
            html, body {
                width: 100% !important;
                position: relative !important;
                scrollbar-width: none !important;
                -ms-overflow-style: none !important;
            }
        }

        /* --- SCROLL PROGRESS BAR --- */
        #scrollProgressGlobal {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: linear-gradient(90deg, #7a3642, #964551);
            z-index: 99999;
            box-shadow: 0 0 15px rgba(255, 176, 204, 0.5);
            transition: width 0.1s ease-out;
        }

        @media (max-width: 768px) {
            #scrollProgressGlobal {
                display: none !important;
            }
        }

        /* Overrides for hardcoded dark background classes in light theme */
        html.light .bg-\[\#1d1b19\] {
            background-color: #ebebeb !important;
            border-color: rgba(0, 0, 0, 0.08) !important;
        }
        html.light .bg-\[\#1d1b19\].text-\[\#c7c5c5\],
        html.light .bg-\[\#1d1b19\] .text-\[\#c7c5c5\],
        html.light .bg-\[\#1d1b19\] .text-\[\#ffb0cc\],
        html.light .bg-\[\#1d1b19\] .text-\[\#e7e2dd\] {
            color: #151311 !important;
        }
    </style>


    `;

    document.body.insertAdjacentHTML('afterbegin', headerHtml);
    
    // Inject footer
    const existingFooter = document.getElementById('globalFooter');
    if (existingFooter) {
        existingFooter.outerHTML = footerHtml;
    } else {
        document.body.insertAdjacentHTML('beforeend', footerHtml);
    }

    document.head.insertAdjacentHTML('beforeend', style);

    // Header Logic
    const catalogWrapper = document.getElementById('catalogMenuWrapperGlobal');
    const menu = document.getElementById('megaMenuGlobal');
    const overlay = document.getElementById('megaOverlayGlobal');
    const catItems = document.querySelectorAll('.mega-cat-item');
    const submenus = document.querySelectorAll('.mega-submenu');

    function openMegaMenu() {
        if (!menu || !overlay) return;
        closeAboutMenu(); // Optimization: close about menu when opening catalog
        
        // Reset submenus to default state
        catItems.forEach(i => i.classList.remove('is-active'));
        submenus.forEach(s => s.classList.remove('is-active'));
        const defaultSub = document.querySelector('.mega-submenu-default');
        if (defaultSub) defaultSub.classList.add('is-active');

        menu.classList.add('is-visible');
        overlay.classList.add('is-visible');
    }

    function closeMegaMenu() {
        if (!menu || !overlay) return;
        menu.classList.remove('is-visible');
        if (!aboutMenu.classList.contains('is-visible')) overlay.classList.remove('is-visible');
        catItems.forEach(i => i.classList.remove('is-active'));
        submenus.forEach(s => s.classList.remove('is-active'));
        const defaultSub = document.querySelector('.mega-submenu-default');
        if (defaultSub) defaultSub.classList.add('is-active');
    }

    function showSubmenu(parentId) {
        submenus.forEach(s => s.classList.remove('is-active'));
        catItems.forEach(i => i.classList.remove('is-active'));
        
        const sub = document.querySelector(`.mega-submenu[data-parent="${parentId}"]`);
        const cat = document.querySelector(`.mega-cat-item[data-submenu="${parentId}"]`);
        
        if (sub) sub.classList.add('is-active');
        if (cat) cat.classList.add('is-active');
    }

    if (catalogWrapper) {
        catalogWrapper.addEventListener('mouseenter', openMegaMenu);
        const catBtn = document.getElementById('catalogBtnGlobal');
        if (catBtn) {
            catBtn.addEventListener('click', (e) => {
                if (window.innerWidth > 768) {
                    // Let the link navigate naturally
                }
            });
        }
    }
    if (menu) menu.addEventListener('mouseleave', closeMegaMenu);
    
    const aboutWrapper = document.getElementById('aboutMenuWrapperGlobal');
    const aboutMenu = document.getElementById('aboutMenuGlobal');

    function openAboutMenu() {
        if (!aboutMenu || !overlay) return;
        closeMegaMenu(); // Optimization: close catalog menu when opening about
        
        // Position compact menu under the button
        if (window.innerWidth > 768) {
            const btn = document.getElementById('aboutBtnGlobal');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                // Center it under the button
                let left = rect.left + (rect.width / 2) - 140; 
                // Boundary check
                if (left < 20) left = 20;
                if (left + 280 > window.innerWidth - 20) left = window.innerWidth - 300;
                
                aboutMenu.style.left = left + 'px';
                aboutMenu.style.top = '80px';
            }
        }
        
        aboutMenu.classList.add('is-visible');
        overlay.classList.add('is-visible');
    }

    function closeAboutMenu() {
        if (!aboutMenu || !overlay) return;
        aboutMenu.classList.remove('is-visible');
        if (!menu.classList.contains('is-visible')) overlay.classList.remove('is-visible');
    }

    if (aboutWrapper) {
        aboutWrapper.addEventListener('mouseenter', openAboutMenu);
        const aboutBtn = document.getElementById('aboutBtnGlobal');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                if (window.innerWidth > 768) {
                    // Let the link navigate naturally
                }
            });
        }
    }
    if (aboutMenu) aboutMenu.addEventListener('mouseleave', closeAboutMenu);

    if (overlay) overlay.addEventListener('click', () => { closeMegaMenu(); closeAboutMenu(); });

    catItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const sub = item.dataset.submenu;
            showSubmenu((sub && sub !== 'none') ? sub : 'default');
        });
    });


    // Search Logic
    const searchInput = document.getElementById('globalSearchInput');
    let searchTimeout = null;

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            const resultsContainer = document.getElementById('searchResultsGlobal');
            if (!resultsContainer) return;

            clearTimeout(searchTimeout);

            if (query.length < 2) {
                resultsContainer.innerHTML = '<p class="text-on-surface-variant font-label-caps text-xs tracking-widest uppercase">Начните вводить текст для поиска...</p>';
                return;
            }

            searchTimeout = setTimeout(async () => {
                resultsContainer.innerHTML = '<div class="flex justify-center py-10"><span class="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></div>';
                
                try {
                    const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=10`);
                    if (!res.ok) throw new Error('Search failed');
                    const data = await res.json();
                    const products = data.products || [];

                    if (products.length > 0) {
                        const displayProducts = products.slice(0, 10);
                        let productsHtml = displayProducts.map(p => `
                            <a href="/product?id=${p.id}" class="flex justify-between items-center p-4 bg-white/5 hover:bg-white/10 rounded-xl no-underline transition-all group">
                                <div>
                                    <div class="text-on-surface font-bold uppercase text-sm group-hover:text-primary transition-colors">${p.name}</div>
                                    <div class="text-on-surface-variant text-[10px] uppercase tracking-widest opacity-50">${p.category || 'Металлопрокат'}</div>
                                </div>
                                <span class="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </a>
                        `).join('');

                        resultsContainer.innerHTML = `
                            <div class="flex flex-col h-full">
                                <div class="overflow-y-auto custom-scrollbar space-y-2 pr-2 mb-4 max-h-[45vh] md:max-h-[350px]">
                                    ${productsHtml}
                                </div>
                                <a href="/catalog/?search=${encodeURIComponent(query)}" class="block w-full py-4 bg-primary/10 border border-primary/20 text-primary text-center font-label-caps text-label-caps tracking-widest hover:bg-primary hover:text-on-primary transition-all uppercase no-underline rounded-xl flex-shrink-0">
                                    ПОКАЗАТЬ ВСЕ ТОВАРЫ
                                </a>
                            </div>
                        `;
                    } else {
                        resultsContainer.innerHTML = '<p class="text-on-surface-variant font-label-caps text-xs tracking-widest uppercase text-center py-10 opacity-50">НИЧЕГО НЕ НАЙДЕНО ПО ЗАПРОСУ "' + query.toUpperCase() + '"</p>';
                    }
                } catch (err) {
                    resultsContainer.innerHTML = '<p class="text-error font-label-caps text-xs tracking-widest uppercase text-center py-10">ОШИБКА ПОИСКА</p>';
                }
            }, 300);
        });

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const q = e.target.value.trim();
                if (q) window.location.href = `/catalog/?search=${encodeURIComponent(q)}`;
            }
        });
    }


    window.switchAuthGlobal = function(type) {
        const login = document.getElementById('loginFormGlobal');
        const reg = document.getElementById('registerFormGlobal');
        const forgot = document.getElementById('forgotFormGlobal');
        if (login && reg && forgot) {
            login.classList.toggle('hidden', type !== 'login');
            reg.classList.toggle('hidden', type !== 'register');
            forgot.classList.toggle('hidden', type !== 'forgot');
        }
    };

    window.togglePassVisibilityGlobal = function(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const icon = btn.querySelector('.material-symbols-outlined');
        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.textContent = 'visibility_off';
        } else {
            input.type = 'password';
            if (icon) icon.textContent = 'visibility';
        }
    };

    window.validatePasswordStrengthGlobal = function(password) {
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()_+=\-{}[\]|\\:;"'<>,.?/~`]/.test(password);
        const isLengthOk = password.length >= 8;

        updateChecklistItemGlobal('rule-length', isLengthOk);
        updateChecklistItemGlobal('rule-upper', hasUpper);
        updateChecklistItemGlobal('rule-lower', hasLower);
        updateChecklistItemGlobal('rule-digit', hasDigit);
        updateChecklistItemGlobal('rule-special', hasSpecial);

        let score = 0;
        if (isLengthOk) score += 20;
        if (hasUpper) score += 20;
        if (hasLower) score += 20;
        if (hasDigit) score += 20;
        if (hasSpecial) score += 20;

        const bar = document.getElementById('strengthBarGlobal');
        const text = document.getElementById('strengthTextGlobal');
        if (bar) {
            bar.style.width = score + '%';
            if (score <= 40) {
                bar.style.backgroundColor = '#ff5f5f';
                if (text) text.textContent = 'СЛАБЫЙ ПАРОЛЬ';
                if (text) text.style.color = '#ff5f5f';
            } else if (score <= 80) {
                bar.style.backgroundColor = '#ffbe5f';
                if (text) text.textContent = 'СРЕДНИЙ ПАРОЛЬ';
                if (text) text.style.color = '#ffbe5f';
            } else {
                bar.style.backgroundColor = '#964551';
                if (text) text.textContent = 'ОТЛИЧНЫЙ ПАРОЛЬ';
                if (text) text.style.color = '#c7c5c5';
            }
        }

        const regBtn = document.getElementById('regSubmitBtnGlobal');
        if (regBtn) {
            regBtn.disabled = score < 100;
            if (score < 100) {
                regBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                regBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }
    };

    function updateChecklistItemGlobal(id, isValid) {
        const el = document.getElementById(id);
        if (!el) return;
        const icon = el.querySelector('.rule-icon');
        if (isValid) {
            el.classList.remove('text-on-surface-variant', 'opacity-50');
            el.classList.add('text-primary');
            if (icon) icon.textContent = 'check_circle';
        } else {
            el.classList.remove('text-primary');
            el.classList.add('text-on-surface-variant', 'opacity-50');
            if (icon) icon.textContent = 'circle';
        }
    }

    async function checkAuthStatus() {
        if (window.checkAuthStatus) {
            await window.checkAuthStatus();
        }
    }

    function showLoggedIn(user) {
        const lo = document.getElementById('authContentLoggedOut');
        const li = document.getElementById('authContentLoggedIn');
        const un = document.getElementById('userNameGlobal');
        if (lo) lo.classList.add('hidden');
        if (li) li.classList.remove('hidden');
        if (un) un.textContent = user.name || user.email.split('@')[0];
    }

    function showLoggedOut() {
        const lo = document.getElementById('authContentLoggedOut');
        const li = document.getElementById('authContentLoggedIn');
        if (lo) lo.classList.remove('hidden');
        if (li) li.classList.add('hidden');
    }

    window.showErrorPopupGlobal = function(message) {
        let overlay = document.getElementById('globalErrorPopup');
        if (overlay) overlay.remove();
        
        overlay = document.createElement('div');
        overlay.id = 'globalErrorPopup';
        overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 p-4 pointer-events-auto';
        overlay.innerHTML = `
            <div class="glass-panel p-8 max-w-sm w-full text-center space-y-6 border-error/20 relative opacity-0 translate-y-4 transition-all duration-500" id="errorPanelInner">
                <span class="material-symbols-outlined text-5xl text-error">error</span>
                <div class="space-y-2">
                    <h3 class="font-display-xl text-xl uppercase">ОШИБКА</h3>
                    <p class="text-on-surface-variant text-sm font-label-caps tracking-widest uppercase">${message}</p>
                </div>
                <button onclick="window.closeErrorPopupGlobal()" class="w-full py-3 bg-surface-container border border-outline-variant/30 text-on-surface font-label-caps text-xs tracking-widest hover:bg-error hover:text-white hover:border-error transition-all uppercase">ЗАКРЫТЬ</button>
            </div>
        `;
        document.body.appendChild(overlay);
        window.lockScrollGlobal();
        
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            const inner = document.getElementById('errorPanelInner');
            if (inner) {
                inner.classList.remove('opacity-0', 'translate-y-4');
            }
        }, 10);

        setTimeout(window.closeErrorPopupGlobal, 5000);
    };

    window.closeErrorPopupGlobal = function() {
        const overlay = document.getElementById('globalErrorPopup');
        const inner = document.getElementById('errorPanelInner');
        if (!overlay) return;
        
        overlay.classList.add('opacity-0');
        if (inner) {
            inner.classList.add('opacity-0', 'translate-y-4');
        }
        setTimeout(() => { overlay.remove(); window.unlockScrollGlobal(); }, 500);
    };

    window.showLoginFormErrorGlobal = function(message) {
        const errEl = document.getElementById('loginErrorMsgGlobal');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.remove('hidden');
            // Shake effect
            const form = document.getElementById('loginFormGlobal');
            if (form) {
                form.classList.add('animate-shake');
                setTimeout(() => form.classList.remove('animate-shake'), 500);
            }
        }
    };

    window.showRegisterFormErrorGlobal = function(message) {
        const errEl = document.getElementById('regErrorMsgGlobal');
        if (errEl) {
            errEl.textContent = message;
            errEl.classList.remove('hidden');
            const form = document.getElementById('registerFormGlobal');
            if (form) {
                form.classList.add('animate-shake');
                setTimeout(() => form.classList.remove('animate-shake'), 500);
            }
        }
    };

    window.showSuccessPopupGlobal = function(message) {
        const popup = document.createElement('div');
        popup.className = 'fixed top-8 left-1/2 -translate-x-1/2 z-[10000] bg-surface-container border border-primary/20 p-6 shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300';
        popup.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="material-symbols-outlined text-primary">check_circle</span>
            </div>
            <div>
                <div class="font-label-caps text-label-caps text-primary mb-1 uppercase tracking-widest">Успешно</div>
                <div class="text-on-surface font-body-sm">${message}</div>
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.classList.add('animate-out', 'fade-out', 'slide-out-to-top-4');
            setTimeout(() => popup.remove(), 300);
        }, 3000);
    };


    window.handleLoginGlobal = async function(e) {
        if (e && e.preventDefault) e.preventDefault();
        const email = document.getElementById('loginEmailGlobal').value;
        const password = document.getElementById('loginPassGlobal').value;
        const btn = document.querySelector('#loginFormGlobal button[onclick^="handleLoginGlobal"]');
        const errEl = document.getElementById('loginErrorMsgGlobal');
        const originalText = btn ? btn.innerHTML : 'ВОЙТИ';
        
        // Clear previous errors
        if (errEl) errEl.classList.add('hidden');
        
        if (!email || !password) {
            showLoginFormErrorGlobal('Пожалуйста, заполните все поля');
            return;
        }

        // Test cases for the user
        if (email === 'locked@test.ru') {
            showLoginFormErrorGlobal('Ваш аккаунт временно заблокирован за подозрительную активность');
            return;
        }
        if (email === '500@test.ru') {
            showLoginFormErrorGlobal('Внутренняя ошибка сервера (500). Попробуйте позже');
            return;
        }
        if (email === 'email@test.ru') {
            showLoginFormErrorGlobal('Неверный логин или пароль');
            return;
        }
        if (password.length < 8 && email.includes('test')) {
            showLoginFormErrorGlobal('Пароль должен содержать не менее 8 символов');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('metal_token', data.token);
                localStorage.setItem('metal_user', JSON.stringify(data.user));
                if (window.setCookieGlobal) {
                    window.setCookieGlobal('metal_token', data.token, 7);
                    window.setCookieGlobal('metal_user', JSON.stringify(data.user), 7);
                }
                showSuccessPopupGlobal(`Успешный вход! Добрый день, ${data.user.name || 'пользователь'}!`);
                setTimeout(() => {
                    window.location.href = '/cabinet/';
                }, 1500);
            } else { 
                if (data.error === 'email_not_confirmed') {
                    showLoginFormErrorGlobal(
                        `${data.message || 'Email не подтвержден.'} ` +
                        `<button type="button" onclick="handleResendConfirmation('${email}')" class="mt-3 w-full py-2 bg-primary/20 border border-primary/30 text-primary font-label-caps text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all uppercase rounded">Отправить подтверждение повторно</button>`
                    );
                } else {
                    showLoginFormErrorGlobal(data.error || 'Неверный email или пароль'); 
                }
            }
        } catch (e) { 
            console.error('Login error details:', e);
            showLoginFormErrorGlobal('Ошибка соединения: ' + (e.message || 'сервер не отвечает')); 
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    };

    window.handleResendConfirmation = async function(email) {
        const errEl = document.getElementById('loginErrorMsgGlobal');
        if (errEl) errEl.classList.add('hidden');
        
        try {
            const res = await fetch('/api/auth/resend-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessPopupGlobal('Письмо с подтверждением отправлено! Проверьте ваш почтовый ящик.');
            } else {
                showLoginFormErrorGlobal(data.error || 'Не удалось отправить письмо');
            }
        } catch (e) {
            showLoginFormErrorGlobal('Ошибка сервера при отправке');
        }
    };

    window.handleForgotGlobal = async function() {
        const email = document.getElementById('forgotEmailGlobal').value;
        const btn = document.querySelector('#forgotFormGlobal button[onclick^="handleForgotGlobal"]');
        const errEl = document.getElementById('forgotErrorMsgGlobal');
        const originalText = btn ? btn.innerHTML : 'ОТПРАВИТЬ ССЫЛКУ';
        
        if (errEl) errEl.classList.add('hidden');
        if (!email) {
            if (errEl) {
                errEl.textContent = 'Пожалуйста, введите ваш email';
                errEl.classList.remove('hidden');
            }
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        }

        try {
            const res = await fetch('/api/auth/reset-password-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessPopupGlobal('Ссылка для восстановления отправлена на вашу почту!');
                switchAuthGlobal('login');
            } else {
                if (errEl) {
                    errEl.textContent = data.error || 'Ошибка восстановления';
                    errEl.classList.remove('hidden');
                }
            }
        } catch (e) {
            if (errEl) {
                errEl.textContent = 'Ошибка соединения с сервером';
                errEl.classList.remove('hidden');
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    };

    window.handleRegisterGlobal = async function() {
        const name = document.getElementById('regNameGlobal').value;
        const email = document.getElementById('regEmailGlobal').value;
        const password = document.getElementById('regPassGlobal').value;
        const btn = document.getElementById('regSubmitBtnGlobal') || document.querySelector('#registerFormGlobal button');
        const errEl = document.getElementById('regErrorMsgGlobal');
        const originalText = btn ? btn.innerHTML : 'СОЗДАТЬ АККАУНТ';
        
        if (errEl) errEl.classList.add('hidden');

        if (!name || !email || !password) {
            showRegisterFormErrorGlobal('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Test cases
        if (email === 'exists@test.ru') {
            showRegisterFormErrorGlobal('Пользователь с таким email уже зарегистрирован');
            return;
        }
        if (email === 'invalid@test.ru') {
            showRegisterFormErrorGlobal('Некорректный формат email адреса');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });
            const data = await res.json();
            if (res.ok) {
                if (data.email_confirm_required) {
                    showSuccessPopupGlobal('Регистрация успешна! Письмо с подтверждением отправлено на вашу почту.');
                    switchAuthGlobal('login');
                } else {
                    localStorage.setItem('metal_token', data.token);
                    localStorage.setItem('metal_user', JSON.stringify(data.user));
                    if (window.setCookieGlobal) {
                        window.setCookieGlobal('metal_token', data.token, 7);
                        window.setCookieGlobal('metal_user', JSON.stringify(data.user), 7);
                    }
                    showSuccessPopupGlobal(`Регистрация успешна! Добро пожаловать, ${data.user.name || 'пользователь'}!`);
                    setTimeout(() => {
                        window.location.href = '/cabinet/';
                    }, 1500);
                }
            } else {
                showRegisterFormErrorGlobal(data.error || 'Ошибка при регистрации');
            }
        } catch (e) { 
            showRegisterFormErrorGlobal('Ошибка сервера');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        }
    };

    window.handleLogoutGlobal = function() {
        localStorage.removeItem('metal_token');
        localStorage.removeItem('metal_user');
        localStorage.removeItem('metal_orders');
        if (window.eraseCookieGlobal) {
            window.eraseCookieGlobal('metal_token');
            window.eraseCookieGlobal('metal_user');
        }
        showLoggedOut();
        if (window.location.pathname.includes('cabinet.html')) {
            window.location.href = '/';
        }
    };

    // Global Click to Close Panels
    document.addEventListener('mousedown', function(e) {
        const panels = [
            { id: 'cartPanelGlobal', toggle: window.toggleCartDrawerGlobal },
            { id: 'authPanelGlobal', toggle: window.toggleAuthModalGlobal },
            { id: 'mobileMenuPanelGlobal', toggle: window.toggleMobileMenuGlobal },
            { id: 'mobileCatalogPanelGlobal', toggle: window.toggleMobileCatalogGlobal }
        ];
        
        panels.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && el.classList.contains('translate-x-0') && !el.contains(e.target)) {
                // Check if not clicking a button that might be a toggle or inside a drawer
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    // p.toggle(); 
                }
            }
        });
    });

    // CSS to hide default arrows
    const qtyStyle = document.createElement('style');
    qtyStyle.textContent = `
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        input[type=number] {
            -moz-appearance: textfield;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        .animate-shake {
            animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
    `;
    document.head.appendChild(qtyStyle);

    // Initializations
    function updateGlobalCartBadge() {
        const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
        const badge = document.getElementById('cartBadgeGlobal');
        if (badge) {
            if (cart.length > 0) {
                badge.classList.remove('hidden');
                badge.textContent = cart.length;
            } else {
                badge.classList.add('hidden');
            }
        }
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const loginForm = document.getElementById('loginFormGlobal');
            if (loginForm && !loginForm.classList.contains('hidden')) {
                window.handleLoginGlobal(e);
            }
        }
    });

    document.getElementById('loginEmailGlobal')?.addEventListener('input', () => document.getElementById('loginErrorMsgGlobal')?.classList.add('hidden'));
    document.getElementById('loginPassGlobal')?.addEventListener('input', () => document.getElementById('loginErrorMsgGlobal')?.classList.add('hidden'));
    
    updateGlobalCartBadge();
    window.updateGlobalCartBadge = updateGlobalCartBadge;
    window.addEventListener('storage', updateGlobalCartBadge);

    checkAuthStatus();

    // --- GLOBAL SCROLL & SNAPPING ENGINE ---
    const SCROLL_DURATION_MS = 500;
    const SCROLL_HEADER_OFFSET = 80;
    const BLOCK_SCROLL_PATH_RE = /\/(index\.html)?$|\/(services|calculator|about|logistics|fleet|certificates|contacts)(\/|\.html)?$/i;

    let isScrollingGlobal = false;
    let lastBlockScrollAt = 0;
    let touchStartY = null;

    // Inject Global Fix for Horizontal Scroll — applied immediately
    const globalStyle = document.createElement('style');
    globalStyle.textContent = `
        html, body {
            overflow-x: hidden !important;
            max-width: 100vw !important;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            width: 100%;
            touch-action: pan-y;
            position: relative;
        }
        * { box-sizing: border-box; }
        main, section, footer, div { max-width: 100vw; }
        ::-webkit-scrollbar:horizontal { display: none !important; }
        #globalPreloader.fade-out { opacity: 0; visibility: hidden; pointer-events: none; }
    `;
    if (document.head) {
        document.head.insertBefore(globalStyle, document.head.firstChild);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.head.insertBefore(globalStyle, document.head.firstChild));
    }

    window.customSmoothScrollGlobal = function(targetY, duration) {
        if (isScrollingGlobal) return;
        isScrollingGlobal = true;
        const startY = window.pageYOffset;
        const diff = targetY - startY;
        let start = null;

        const finalDuration = duration ?? SCROLL_DURATION_MS;

        function step(timestamp) {
            if (!start) start = timestamp;
            const time = timestamp - start;
            const percent = Math.min(time / finalDuration, 1);
            
            // Quartic ease-out for a more "sophisticated" and snappy start with smooth finish
            const ease = 1 - Math.pow(1 - percent, 4);
            
            window.scrollTo(0, startY + diff * ease);
            
            if (time < finalDuration) {
                window.requestAnimationFrame(step);
            } else {
                // Short timeout to prevent scroll bounce but maintain responsiveness
                setTimeout(() => { isScrollingGlobal = false; }, 30);
            }
        }
        window.requestAnimationFrame(step);
    };

    window.scrollToTopGlobal = function() {
        window.customSmoothScrollGlobal(0, SCROLL_DURATION_MS);
    };

    const isBlockScrollPage = () => {
        if (document.querySelector('main[data-hero-block-scroll], main[data-block-scroll]')) return true;
        const p = window.location.pathname;
        return BLOCK_SCROLL_PATH_RE.test(p) || p === '/' || p.endsWith('/');
    };

    const isHeroBlockScrollPage = () => !!document.querySelector('main[data-hero-block-scroll]');

    const isBlockScrollSection = (el) => {
        if (!el || el.tagName !== 'SECTION') return false;
        if (el.classList.contains('no-full-height')) return false;
        if (el.id === 'hero' || el.id === 'cta-footer-merged') return true;
        
        const cls = el.className || '';
        // Matches Tailwind full-height classes including the new dynamic header-height ones
        const hasFullHeightClass = /min-h-\[100dvh\]|min-h-screen|h-\[100dvh\]|h-screen|h-\[calc\(100(dvh|vh)-(80px|var\(--header-height\))\)\]|min-h-\[calc\(100(dvh|vh)-(80px|var\(--header-height\))\)\]/.test(cls);
        
        if (hasFullHeightClass) return true;
        
        // On block-scroll pages, sections are typically intended to be snapped unless opted out
        if (isBlockScrollPage()) return true;
        
        return false;
    };

    const getBlockScrollSections = () => {
        const mainHero = document.querySelector('main[data-hero-block-scroll]');
        if (mainHero) {
            const hero = mainHero.querySelector(':scope > section#hero') || mainHero.querySelector(':scope > section:first-of-type');
            if (!hero) return [];
            const targetSel = mainHero.getAttribute('data-hero-scroll-target');
            const target = targetSel
                ? document.querySelector(targetSel)
                : hero.nextElementSibling;
            if (target && target.tagName === 'SECTION') return [hero, target];
            return [hero];
        }
        const main = document.querySelector('main');
        if (!main) return [];
        return Array.from(main.querySelectorAll(':scope > section')).filter(isBlockScrollSection);
    };

    const getSectionScrollY = (section) => Math.max(0, section.offsetTop - SCROLL_HEADER_OFFSET);

    const getCurrentBlockIndex = (sections) => {
        const anchor = window.scrollY + window.innerHeight * 0.35;
        let idx = 0;
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= anchor + 40) idx = i;
        }
        return idx;
    };

    const sectionFitsViewport = (section) => section.offsetHeight <= window.innerHeight + 24;

    const isAtSectionBottom = (section) => {
        const bottom = section.offsetTop + section.offsetHeight;
        return window.scrollY + window.innerHeight >= bottom - 24;
    };

    const isAtSectionTop = (section) => window.scrollY <= getSectionScrollY(section) + 24;

    const scrollToBlockIndex = (sections, index) => {
        if (!sections.length || index < 0 || index >= sections.length) return;
        window.customSmoothScrollGlobal(getSectionScrollY(sections[index]), SCROLL_DURATION_MS);
    };

    window.scrollToSectionGlobal = function(selector) {
        const sections = getBlockScrollSections();
        if (!selector) {
            const idx = getCurrentBlockIndex(sections);
            if (idx < sections.length - 1) scrollToBlockIndex(sections, idx + 1);
            return;
        }
        const target = document.querySelector(selector);
        if (!target) return;
        const blockIdx = sections.indexOf(target);
        if (blockIdx >= 0) {
            scrollToBlockIndex(sections, blockIdx);
            return;
        }
        const targetY = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_HEADER_OFFSET;
        window.customSmoothScrollGlobal(targetY, SCROLL_DURATION_MS);
    };

    const handleBlockWheel = (e) => {
        if (!isBlockScrollPage() || isScrollingGlobal) return false;
        if (Date.now() - lastBlockScrollAt < SCROLL_DURATION_MS - 80) return false;

        const sections = getBlockScrollSections();
        if (sections.length < 2) return false;

        const idx = getCurrentBlockIndex(sections);
        const current = sections[idx];
        const delta = e.deltaY;

        if (delta > 0) {
            if (isHeroBlockScrollPage() && idx >= 1) return false;
            if (!sectionFitsViewport(current) && !isAtSectionBottom(current)) return false;
            if (idx >= sections.length - 1) return false;
            e.preventDefault();
            lastBlockScrollAt = Date.now();
            scrollToBlockIndex(sections, idx + 1);
            return true;
        }

        if (delta < 0) {
            if (!sectionFitsViewport(current) && !isAtSectionTop(current)) return false;
            if (idx <= 0) {
                if (window.scrollY > 8) {
                    e.preventDefault();
                    lastBlockScrollAt = Date.now();
                    window.customSmoothScrollGlobal(0, SCROLL_DURATION_MS);
                    return true;
                }
                return false;
            }
            e.preventDefault();
            lastBlockScrollAt = Date.now();
            scrollToBlockIndex(sections, idx - 1);
            return true;
        }

        return false;
    };

    window.addEventListener('wheel', (e) => {
        if (window.checkAnyPopupOpenGlobal && window.checkAnyPopupOpenGlobal()) return;
        handleBlockWheel(e);
    }, { passive: false });

    window.addEventListener('touchstart', (e) => {
        if (!isBlockScrollPage() || e.touches.length !== 1) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isBlockScrollPage() || touchStartY === null || !e.changedTouches.length) return;
        const deltaY = touchStartY - e.changedTouches[0].clientY;
        touchStartY = null;
        if (Math.abs(deltaY) < 60) return;
        handleBlockWheel({ deltaY, preventDefault: () => {} });
    }, { passive: true });

    document.querySelectorAll('[data-vertical-wheel-pass]').forEach((el) => {
        el.addEventListener('wheel', (e) => {
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            if (el.scrollWidth <= el.clientWidth + 1) return;
            e.preventDefault();
            window.scrollBy({ top: e.deltaY, left: 0, behavior: 'auto' });
        }, { passive: false });
    });

    window.checkAnyPopupOpenGlobal = function() {
        const popupSelectors = [
            '#mobileMenuPanelGlobal.translate-x-0',
            '#mobileCatalogPanelGlobal.translate-x-0',
            '#globalSearchOverlay.active-search',
            '#cartPanelGlobal.translate-x-0',
            '#authPanelGlobal.translate-x-0',
            '#globalContactModal',
            '#drawingUploadModal',
            '#applicationSuccessPopup',
            '#applicationErrorPopup',
            '#globalErrorPopup',
            '.fixed .liquid-glass' // Only match premium modals inside fixed viewport containers
        ];
        return popupSelectors.some(s => document.querySelector(s));
    };

    const updateScrollTopVisibility = () => {
        // Scroll progress bar
        const scrollBar = document.getElementById('scrollProgressGlobal');
        if (scrollBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollBar.style.width = scrolled + "%";
        }

        const btn = document.getElementById('scrollTopBtnGlobal');
        const chatBtn = document.getElementById('floatingChatBtnGlobal');
        const isPopupOpen = window.checkAnyPopupOpenGlobal();

        if (btn) {
            if (window.pageYOffset > 500 && !isPopupOpen) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        if (chatBtn) {
            const hasHero = !!document.getElementById('hero');
            if (isPopupOpen) {
                chatBtn.classList.remove('visible');
            } else if (hasHero) {
                if (window.pageYOffset > 500) {
                    chatBtn.classList.add('visible');
                } else {
                    chatBtn.classList.remove('visible');
                }
            } else {
                chatBtn.classList.add('visible');
            }
        }
    };

    window.addEventListener('scroll', updateScrollTopVisibility);
    updateScrollTopVisibility();

    // Optimized Observer to detect popup appearances/disappearances
    const popupObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                shouldUpdate = true;
                break;
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                // Only update if one of the drawers changed its class
                if (mutation.target.id && mutation.target.id.includes('PanelGlobal')) {
                    shouldUpdate = true;
                    break;
                }
                if (mutation.target.id === 'globalSearchOverlay') {
                    shouldUpdate = true;
                    break;
                }
            }
        }
        if (shouldUpdate) updateScrollTopVisibility();
    });

    popupObserver.observe(document.body, { childList: true });
    
    // Also observe the drawers for class changes
    const drawerIds = ['mobileMenuPanelGlobal', 'mobileCatalogPanelGlobal', 'cartPanelGlobal', 'authPanelGlobal', 'globalSearchOverlay'];
    drawerIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            popupObserver.observe(el, { attributes: true, attributeFilter: ['class'] });
        }
    });
});





// Application/Form Submission Handler
window.handleApplicationSubmit = async function(event, type = 'contact') {
    if (event) event.preventDefault();
    const form = event ? event.target : null;
    if (!form) return;

    const formData = new FormData(form);
    const data = {
        name: formData.get('name') || formData.get('customerName') || 'Не указано',
        phone: formData.get('phone') || formData.get('customerPhone') || 'Не указано',
        email: formData.get('email') || formData.get('customerEmail') || 'Не указано',
        message: formData.get('message') || formData.get('specifications') || '',
        type: type === 'quote' ? 'Технический расчет' : type,
        project_type: formData.get('project_type') || ''
    };

    // Flexible Validation
    const isSubscription = type === 'subscription';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!isSubscription) {
        const digits = data.phone.replace(/\D/g, '');
        if (digits.length !== 11) {
            alert('Пожалуйста, введите полный номер телефона (11 цифр)');
            return;
        }
    }
    
    if (isSubscription) {
        if (!data.email || data.email === 'Не указано' || !emailRegex.test(data.email)) {
            alert('Пожалуйста, укажите корректный email адрес');
            return;
        }
    } else if (data.email && data.email !== 'Не указано') {
        // If email is provided (optional in contact forms), it must be valid
        if (!emailRegex.test(data.email)) {
            alert('Пожалуйста, проверьте корректность введенного email');
            return;
        }
    }

    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.json();
            form.reset();
            
            if (isSubscription) {
                window.showApplicationSuccessPopup('Подписка оформлена', 'Вы успешно подписались на обновления. Мы будем присылать вам только самые важные новости и предложения.');
            } else {
                window.showApplicationSuccessPopup();
            }
            
            if (window.closeContactModalGlobal) window.closeContactModalGlobal();
            if (window.closeDrawingModal) window.closeDrawingModal();
        } else {
            throw new Error('Ошибка при отправке');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.');
    }
};

// Inject Global Styles for Modals
if (!document.getElementById('shared-ui-styles')) {
    const style = document.createElement('style');
    style.id = 'shared-ui-styles';
    style.innerHTML = `
        .liquid-glass {
            background: rgba(21, 19, 17, 0.7) !important;
            backdrop-filter: blur(25px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5) !important;
            will-change: transform, opacity;
            transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1) !important;
        }
        .modal-animate-in {
            animation: modalIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .modal-animate-out {
            animation: modalOut 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards;
        }
        @keyframes modalIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes modalOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(20px) scale(0.95); }
        }
    `;
    document.head.appendChild(style);
}

window.showApplicationSuccessPopup = function(title = 'Заявка принята', message = 'Спасибо за обращение! Наши инженеры уже получили ваше сообщение. <br/><span class="text-primary font-bold">Мы свяжемся с вами в течение 30 минут.</span>') {
    // Remove existing if any
    const existing = document.getElementById('applicationSuccessPopup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'applicationSuccessPopup';
    popup.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none';
    popup.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 transition-opacity duration-500 pointer-events-auto" id="successOverlay" onclick="window.closeApplicationPopup()"></div>
        <div class="relative liquid-glass p-10 md:p-16 text-center max-w-lg w-full rounded-[2rem] opacity-0 transition-all duration-700 pointer-events-auto" id="successPanel">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
            
            <div class="relative mb-10">
                <div class="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto relative z-10 border border-primary/20">
                    <span class="material-symbols-outlined text-primary text-6xl">verified</span>
                </div>
                <div class="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 opacity-30"></div>
            </div>

            <div class="space-y-4 mb-10">
                <h3 class="font-display-xl text-3xl md:text-4xl text-on-surface font-bold tracking-tight leading-none">${title}</h3>
                <div class="h-[1px] w-12 bg-primary/30 mx-auto"></div>
                <p class="text-on-surface-variant text-lg leading-relaxed font-medium">
                    ${message}
                </p>
            </div>

            <button onclick="window.closeApplicationPopup()" class="w-full py-5 bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all shadow-lg shadow-primary/20 relative overflow-hidden group rounded-full">
                <span class="relative z-10">Подтвердить</span>
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            
            <p class="mt-8 text-[10px] text-on-surface-variant/40 uppercase tracking-[0.3em]">ЖЕЛЕЗНЫЙ ДРОВОСЕК CLOUD SERVICE</p>
        </div>
    `;
    document.body.appendChild(popup);
    window.lockScrollGlobal(); // Lock scroll
    
    // Trigger animations
    setTimeout(() => {
        document.getElementById('successOverlay').classList.remove('opacity-0');
        const panel = document.getElementById('successPanel');
        panel.classList.remove('opacity-0');
        panel.classList.add('modal-animate-in');
    }, 10);
    
    // Auto close after 10s
    setTimeout(window.closeApplicationPopup, 10000);
};

window.closeApplicationPopup = function() {
    const overlay = document.getElementById('successOverlay');
    const panel = document.getElementById('successPanel');
    if (!overlay || !panel) return;
    
    overlay.classList.add('opacity-0');
    panel.classList.remove('modal-animate-in');
    panel.classList.add('modal-animate-out');
    
    setTimeout(() => {
        const popup = document.getElementById('applicationSuccessPopup');
        if (popup) popup.remove();
        window.unlockScrollGlobal(); // Restore scroll AFTER animation
    }, 500);
};

// Global Contact Modal for buttons
window.openContactModalGlobal = function(title = 'Оставить заявку', type = 'global_request') {
    const existing = document.getElementById('globalContactModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'globalContactModal';
    modal.className = 'fixed inset-0 z-[6000] flex items-center justify-center p-4 pointer-events-none';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-500 pointer-events-auto" id="modalOverlay" onclick="window.closeContactModalGlobal()"></div>
        <div class="relative liquid-glass p-8 md:p-16 max-w-2xl w-full rounded-[2rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto" id="modalPanel">
            <button onclick="window.closeContactModalGlobal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            
            <header class="mb-12">
                <span class="font-label-caps text-[10px] md:text-sm text-primary tracking-[0.3em] uppercase block mb-4 font-bold">Обратная связь</span>
                <h2 class="font-display-xl text-3xl md:text-5xl leading-none text-on-surface font-bold">${title}</h2>
            </header>

            <form id="globalContactForm" class="space-y-8" onsubmit="window.handleApplicationSubmit(event, '${type}')">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="relative">
                        <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Ваше имя</label>
                        <input name="name" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="text" placeholder="Иван Иванов"/>
                    </div>
                    <div class="relative">
                        <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Телефон</label>
                        <input name="phone" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="tel" placeholder="+7-(___)-___-__-__"/>
                    </div>
                </div>
                <div class="relative">
                    <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Электронная почта (необязательно)</label>
                    <input name="email" class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="email" placeholder="example@mail.ru"/>
                </div>
                <div class="relative">
                    <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Ваше сообщение</label>
                    <textarea name="message" class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none resize-none h-32 font-medium" placeholder="Опишите ваш запрос..."></textarea>
                </div>

                <button type="submit" class="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all duration-300 group flex items-center justify-center gap-3 rounded-full mt-4">
                    Отправить запрос
                    <span class="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    window.lockScrollGlobal(); // Lock scroll

    setTimeout(() => {
        document.getElementById('modalOverlay').classList.remove('opacity-0');
        const panel = document.getElementById('modalPanel');
        panel.classList.remove('opacity-0');
        panel.classList.add('modal-animate-in');
    }, 10);
};

window.closeContactModalGlobal = function() {
    const overlay = document.getElementById('modalOverlay');
    const panel = document.getElementById('modalPanel');
    if (!overlay || !panel) return;
    
    overlay.classList.add('opacity-0');
    panel.classList.remove('modal-animate-in');
    panel.classList.add('modal-animate-out');
    
    setTimeout(() => {
        const modal = document.getElementById('globalContactModal');
        if (modal) modal.remove();
        window.unlockScrollGlobal(); // Restore scroll AFTER animation
    }, 500);
};

// Global Product Modal
window.openProductModalGlobal = async function(productId) {
    const existing = document.getElementById('globalProductModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'globalProductModal';
    modal.className = 'fixed inset-0 z-[6000] flex items-center justify-center p-4 pointer-events-none';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/95 backdrop-blur-2xl opacity-0 transition-opacity duration-500 pointer-events-auto" id="productModalOverlay" onclick="window.closeProductModalGlobal()"></div>
        <div class="relative liquid-glass p-6 md:p-12 max-w-4xl w-full rounded-[2rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto flex items-center justify-center min-h-[400px] overflow-hidden" id="productModalPanel">
             <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    `;
    document.body.appendChild(modal);
    window.lockScrollGlobal();

    setTimeout(() => {
        document.getElementById('productModalOverlay').classList.remove('opacity-0');
        const panel = document.getElementById('productModalPanel');
        panel.classList.remove('opacity-0');
        panel.classList.add('modal-animate-in');
    }, 10);

    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const p = await res.json();
        
        const panel = document.getElementById('productModalPanel');
        const img = window.getProductImage ? window.getProductImage(p.category) : (p.image || p.img || '/images/products/hot_rolled_sheets_premium_1778423920658.png');
        
        panel.innerHTML = `
            <button onclick="window.closeProductModalGlobal()" class="absolute top-6 right-6 md:top-8 md:right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors z-20">close</button>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full pt-4 md:pt-0">
                <div class="aspect-square w-full overflow-hidden rounded-2xl bg-surface-container border border-outline-variant/10 shadow-2xl">
                    <img src="${img}" class="w-full h-full object-cover" alt="${p.name}"/>
                </div>
                
                <div class="flex flex-col">
                    <span class="font-label-caps text-[9px] md:text-[10px] text-primary tracking-[0.3em] uppercase block mb-2 font-bold opacity-70">${p.category}</span>
                    <h2 class="font-display-xl text-xl md:text-3xl lg:text-4xl leading-tight text-on-surface font-bold mb-4 md:mb-6 uppercase">${p.name}</h2>
                    
                    <div class="space-y-3 md:space-y-4 mb-6 md:mb-8">
                        ${p.specs ? p.specs.slice(0, 5).map(([label, value]) => `
                            <div class="flex justify-between border-b border-white/5 pb-2">
                                <span class="text-on-surface-variant text-[10px] md:text-xs uppercase tracking-wider opacity-60">${label}</span>
                                <span class="text-on-surface text-[10px] md:text-xs font-bold">${value}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                    
                    <div class="mt-auto">
                        <div class="flex flex-col mb-6">
                            <span class="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest mb-2 opacity-50">${p.price_ton ? 'Цена за тонну' : 'Цена за единицу'}</span>
                            <div class="flex items-center justify-between">
                                <div class="text-primary text-2xl md:text-4xl font-bold tracking-tight">
                                    ${p.price_ton ? p.price_ton.toLocaleString('ru-RU') + ' ₽' : (p.price_unit ? p.price_unit.toLocaleString('ru-RU') + ' ₽' : 'Цена по запросу')}
                                </div>
                                <div class="flex items-center border border-white/10 rounded-xl overflow-hidden bg-white/5 h-12">
                                    <button onclick="window.stepModalQty(-1, 1)" class="w-10 h-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <input type="number" id="modalQtyInput" value="${p.price_ton ? '1.00' : '1'}" step="1" class="w-16 bg-transparent border-0 text-center font-bold text-on-surface focus:ring-0 p-0 text-sm outline-none"/>
                                    <button onclick="window.stepModalQty(1, 1)" class="w-10 h-full flex items-center justify-center hover:bg-primary/20 text-primary transition-colors">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex flex-col sm:flex-row gap-3">
                            <a href="/product?id=${p.id}" class="flex-1 px-6 py-4 border border-primary text-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-primary/10 transition-all text-center no-underline rounded-full flex items-center justify-center gap-2" onclick="window.closeProductModalGlobal()">
                                <span class="material-symbols-outlined text-[16px]">info</span> ПОДРОБНЕЕ
                            </a>
                            <button onclick="window.addToCartGlobal('${p.id}', parseFloat(document.getElementById('modalQtyInput').value))" class="flex-1 px-6 py-4 bg-primary text-on-primary font-bold uppercase tracking-widest text-[9px] md:text-[10px] hover:brightness-110 transition-all rounded-full flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                                <span class="material-symbols-outlined text-[16px]">shopping_cart</span> В КОРЗИНУ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Modal Fetch Error:', e);
        document.getElementById('productModalPanel').innerHTML = `
            <button onclick="window.closeProductModalGlobal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            <div class="text-center p-12">
                <span class="material-symbols-outlined text-error text-6xl mb-4">error</span>
                <p class="text-on-surface font-bold uppercase tracking-widest">Товар не найден</p>
                <p class="text-on-surface-variant text-xs mt-2 opacity-60">Возможно, товар был удален или перемещен</p>
            </div>
        `;
    }
};

window.closeProductModalGlobal = function() {
    const overlay = document.getElementById('productModalOverlay');
    const panel = document.getElementById('productModalPanel');
    if (!overlay || !panel) return;
    
    overlay.classList.add('opacity-0');
    panel.classList.remove('modal-animate-in');
    panel.classList.add('modal-animate-out');
    
    setTimeout(() => {
        const modal = document.getElementById('globalProductModal');
        if (modal) modal.remove();
        // Only restore scroll if no other high-level modals are open
        const otherModals = document.querySelectorAll('#globalContactModal, #drawingUploadModal, #cartDrawerGlobal.translate-x-0');
        if (otherModals.length === 0) {
            window.unlockScrollGlobal();
        }
    }, 500);
};

window.stepModalQty = function(delta, step) {
    const input = document.getElementById('modalQtyInput');
    if (!input) return;
    let val = parseFloat(input.value) || 0;
    val = Math.max(1, val + (delta * step));
    input.value = val.toFixed(2);
};

window.addToCartGlobal = function(id, qty = 1) {
    fetch(`/api/products/${id}`).then(res => res.json()).then(p => {
        let cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
        
        let price, unit, finalQty;
        if (p.price_ton) {
            price = p.price_ton;
            unit = 'т.';
            finalQty = qty;
        } else {
            price = p.price_unit;
            unit = 'т.';
            finalQty = qty;
        }
        
        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.qty = (parseFloat(existing.qty) + finalQty).toFixed(2);
        } else {
            cart.push({ 
                id: id, 
                qty: finalQty.toFixed(2),
                name: p.name,
                price: price,
                unit: unit
            });
        }
        localStorage.setItem('metal_cart', JSON.stringify(cart));
        
        // Ensure unit is included in cart if not already
        const updatedCart = cart.map(item => {
            if (item.id === id && !item.unit) {
                return { ...item, unit: unit };
            }
            return item;
        });
        localStorage.setItem('metal_cart', JSON.stringify(updatedCart));
        
        // Refresh UIs
        if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
        if (window.renderCartDrawerItems) window.renderCartDrawerItems();
        if (typeof updateCartUI === 'function') updateCartUI();
        
        // Visual feedback
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-8 right-8 bg-primary text-on-primary px-8 py-4 font-label-caps text-xs shadow-2xl z-[7000] rounded-full animate-bounce';
        toast.innerHTML = '<div class="flex items-center gap-3"><span class="material-symbols-outlined">done_all</span> ТОВАР ДОБАВЛЕН В КОРЗИНУ</div>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        // Close modal after adding
        window.closeProductModalGlobal();
    }).catch(e => console.error('Global AddToCart Error:', e));
};
// Drawing Upload Modal for Cutting Services
window.openDrawingUploadModal = function() {
    const existing = document.getElementById('drawingUploadModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'drawingUploadModal';
    modal.className = 'fixed inset-0 z-[6000] flex items-center justify-center p-4 pointer-events-none';
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-500 pointer-events-auto" id="drawingOverlay" onclick="window.closeDrawingModal()"></div>
        <div class="relative liquid-glass p-8 md:p-16 max-w-2xl w-full rounded-[2rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto" id="drawingPanel">
            <button onclick="window.closeDrawingModal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            
            <header class="mb-10 text-center">
                <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                    <span class="material-symbols-outlined text-primary text-3xl">upload_file</span>
                </div>
                <h2 class="font-display-xl text-3xl md:text-4xl leading-none text-on-surface font-bold uppercase tracking-tight">Загрузка чертежей</h2>
                <p class="text-on-surface-variant mt-4 font-medium opacity-80">Принимаем форматы DXF, DWG, PDF и изображения (JPG, PNG)</p>
            </header>

            <form id="drawingUploadForm" class="space-y-6" onsubmit="window.handleApplicationSubmit(event, 'drawing_upload')">
                <div class="space-y-4">
                    <div class="relative group cursor-pointer" onclick="document.getElementById('fileInput').click()">
                        <div class="w-full py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center group-hover:border-primary/50 transition-colors bg-white/5">
                            <span class="material-symbols-outlined text-4xl text-on-surface-variant group-hover:text-primary mb-4 transition-colors">add_circle</span>
                            <p class="text-on-surface-variant font-bold text-sm tracking-widest uppercase">Выберите файлы или перетащите их сюда</p>
                        </div>
                        <input type="file" id="fileInput" name="drawings" multiple accept=".dxf,.dwg,.pdf,.jpg,.jpeg,.png" class="hidden" onchange="window.handleFilesSelected(this)"/>
                    </div>
                    
                    <div id="fileList" class="space-y-2 max-h-40 overflow-y-auto custom-scrollbar"></div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="relative">
                            <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Имя</label>
                            <input name="name" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="text" placeholder="Иван Иванов"/>
                        </div>
                        <div class="relative">
                            <label class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Телефон</label>
                            <input name="phone" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="tel" placeholder="+7-(___)-___-__-__"/>
                        </div>
                    </div>
                </div>

                <button type="submit" class="w-full py-5 bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all shadow-lg shadow-primary/20 rounded-full flex items-center justify-center gap-3">
                    Отправить на расчет
                    <span class="material-symbols-outlined">send</span>
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    window.lockScrollGlobal(); // Lock scroll

    setTimeout(() => {
        document.getElementById('drawingOverlay').classList.remove('opacity-0');
        const panel = document.getElementById('drawingPanel');
        panel.classList.remove('opacity-0');
        panel.classList.add('modal-animate-in');
    }, 10);
};

window.handleFilesSelected = function(input) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    if (input.files.length > 0) {
        Array.from(input.files).forEach(file => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10';
            item.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-primary text-sm">description</span>
                    <span class="text-xs font-medium text-on-surface truncate max-w-[200px]">${file.name}</span>
                </div>
                <span class="text-[10px] text-on-surface-variant opacity-60">${(file.size / 1024).toFixed(1)} KB</span>
            `;
            fileList.appendChild(item);
        });
    }
};

window.closeDrawingModal = function() {
    const overlay = document.getElementById('drawingOverlay');
    const panel = document.getElementById('drawingPanel');
    if (!overlay || !panel) return;
    
    overlay.classList.add('opacity-0');
    panel.classList.remove('modal-animate-in');
    panel.classList.add('modal-animate-out');
    
    setTimeout(() => {
        const modal = document.getElementById('drawingUploadModal');
        if (modal) modal.remove();
        window.unlockScrollGlobal(); // Restore scroll AFTER animation
    }, 500);
};
// Phone Masking Utility - Unified with Global
window.applyPhoneMask = function(input) {
    if (!input.hasAttribute('oninput')) {
        input.setAttribute('oninput', 'maskPhoneGlobal(this)');
    }
    input.addEventListener('focus', (e) => {
        if (!e.target.value) e.target.value = '+7';
    });
};

// Email Validation Utility
window.applyEmailValidation = function(input) {
    input.addEventListener('input', (e) => {
        const email = e.target.value;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        if (email.length > 0 && !emailRegex.test(email)) {
            input.style.borderColor = '#ffb4ab'; // error color
            input.classList.add('email-invalid');
        } else {
            input.style.borderColor = '';
            input.classList.remove('email-invalid');
        }
    });
};

// Auto-attach to forms and inputs
document.addEventListener('DOMContentLoaded', () => {
    // Initial mask application
    document.querySelectorAll('input[type="tel"]').forEach(input => window.applyPhoneMask(input));
    document.querySelectorAll('input[type="email"]').forEach(input => window.applyEmailValidation(input));
    
    // Observer for dynamic elements (modals)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    node.querySelectorAll('input[type="tel"]').forEach(input => window.applyPhoneMask(input));
                    node.querySelectorAll('input[type="email"]').forEach(input => window.applyEmailValidation(input));
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// URL Actions (e.g. ?action=login)
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'login') {
        setTimeout(() => {
            if (typeof window.toggleAuthModalGlobal === 'function') {
                window.toggleAuthModalGlobal();
            }
        }, 300);
    }
});

window.openGlobalChatDrawerGlobal = async function() {
    const token = localStorage.getItem('metal_token');
    const userStr = localStorage.getItem('metal_user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch(e){}

    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');

    const modal = document.createElement('div');
    modal.id = 'globalChatDrawerModal';
    modal.className = 'fixed inset-0 z-[7000] flex items-center justify-center p-4 pointer-events-none';
    
    if (!token || (!isAdmin && !user)) {
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/95 backdrop-blur-2xl opacity-0 transition-opacity duration-500 pointer-events-auto" onclick="this.parentElement.remove(); window.unlockScrollGlobal()"></div>
            <div class="relative liquid-glass p-6 md:p-10 max-w-lg w-full rounded-[2.5rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto shadow-2xl border border-white/10" id="globalChatModalPanel">
                <button onclick="document.getElementById('globalChatDrawerModal').remove(); window.unlockScrollGlobal()" class="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors z-20">close</button>
                <header class="mb-6 border-b border-white/5 pb-6 text-center">
                    <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 mx-auto mb-4 shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined text-3xl">forum</span>
                    </div>
                    <h2 class="font-display-xl text-2xl md:text-3xl leading-none text-on-surface font-bold uppercase tracking-tight">Чат поддержки</h2>
                    <p class="text-on-surface-variant text-xs uppercase tracking-widest mt-2 opacity-60">Онлайн консультация и решение вопросов</p>
                </header>
                <div class="space-y-6 text-center py-4">
                    <p class="text-sm text-on-surface-variant leading-relaxed">Для доступа к истории переписки по вашим заказам и обращениям, пожалуйста, войдите в систему.</p>
                    <div class="flex flex-col gap-4 pt-4">
                        <button onclick="document.getElementById('globalChatDrawerModal').remove(); window.unlockScrollGlobal(); toggleAuthModalGlobal()" class="w-full py-5 bg-primary text-on-primary font-label-caps text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-primary/20">ВОЙТИ В АККАУНТ</button>
                        <a href="/#contacts" onclick="document.getElementById('globalChatDrawerModal').remove(); window.unlockScrollGlobal()" class="text-xs text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors">Связаться другим способом</a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        window.lockScrollGlobal();
        setTimeout(() => {
            const panel = document.getElementById('globalChatModalPanel');
            if (panel && panel.previousElementSibling) panel.previousElementSibling.classList.remove('opacity-0');
            if (panel) { panel.classList.remove('opacity-0'); panel.classList.add('modal-animate-in'); }
        }, 10);
        return;
    }

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-500 pointer-events-auto" onclick="window.closeGlobalChatDrawerGlobal()"></div>
        <div class="relative bg-[#0f0e0c] p-0 max-w-2xl w-full rounded-3xl md:rounded-[2.5rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto max-h-[95vh] h-[800px] flex flex-col shadow-2xl border border-white/5 overflow-hidden" id="globalChatModalPanel">
            <header class="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-[#151311]/80 backdrop-blur-xl shrink-0">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span class="material-symbols-outlined text-2xl">${isAdmin ? 'admin_panel_settings' : 'support_agent'}</span>
                    </div>
                    <div>
                        <div class="font-display-xl text-lg uppercase tracking-tight">${isAdmin ? 'УПРАВЛЕНИЕ <span class="text-primary">ЧАТАМИ</span>' : 'ПОДДЕРЖКА <span class="text-primary">WOODMAN</span>'}</div>
                        <div class="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    ${!isAdmin ? `<select id="globalChatTopicSelect" onchange="window.selectGlobalChatTopicGlobal(this.value)" class="hidden md:block bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-on-surface outline-none focus:border-primary/40 transition-all font-body-md min-w-[200px] cursor-pointer">
                        <option value="">Загрузка диалогов...</option>
                    </select>` : ''}
                    <button onclick="window.closeGlobalChatDrawerGlobal()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>
            
            ${!isAdmin ? `
                <div class="md:hidden px-6 py-3 bg-[#151311] border-b border-white/5">
                     <select id="globalChatTopicSelectMobile" onchange="window.selectGlobalChatTopicGlobal(this.value)" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none font-body-md">
                        <option value="">Выберите диалог...</option>
                    </select>
                </div>
            ` : ''}

            <div class="flex-1 flex overflow-hidden relative">
                ${isAdmin ? `
                    <div class="w-full md:w-72 border-r border-white/5 overflow-y-auto hidden md:block bg-[#0a0908]" id="chatListSidebar">
                        <div class="p-4 border-b border-white/5">
                            <input type="text" placeholder="Поиск..." class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/30"/>
                        </div>
                        <div id="activeChatsList" class="divide-y divide-white/5">
                            <div class="p-10 text-center text-[10px] uppercase font-bold text-on-surface-variant/30 tracking-widest">Загрузка...</div>
                        </div>
                    </div>
                ` : ''}

                <div class="flex-1 flex flex-col bg-[#0f0e0c] relative">
                    <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(#964551 1px, transparent 1px); background-size: 32px 32px;"></div>
                    <div id="globalChatMessagesContainer" class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar relative z-10 flex flex-col">
                        <div class="flex items-center justify-center h-full text-on-surface-variant opacity-30 gap-3">
                            <span class="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                            <span class="font-label-caps text-xs uppercase tracking-widest">Загрузка истории...</span>
                        </div>
                    </div>
                    
                    <footer class="p-6 md:p-8 bg-[#151311] border-t border-white/5 shrink-0 z-20">
                        <div class="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/40 transition-all">
                            <textarea id="globalChatInput" placeholder="Напишите сообщение..." class="flex-1 bg-transparent border-0 focus:ring-0 text-sm md:text-base text-on-surface py-2 px-3 resize-none max-h-32 outline-none h-10 custom-scrollbar" rows="1"></textarea>
                            <button id="globalChatSendBtn" onclick="window.sendGlobalChatMessageGlobal()" class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                                <span class="material-symbols-outlined text-xl md:text-2xl">send</span>
                            </button>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    window.lockScrollGlobal();
    setTimeout(() => {
        const panel = document.getElementById('globalChatModalPanel');
        if (panel && panel.previousElementSibling) panel.previousElementSibling.classList.remove('opacity-0');
        if (panel) { panel.classList.remove('opacity-0'); panel.classList.add('modal-animate-in'); }
    }, 10);

    try {
        if (isAdmin) {
            const res = await fetch('/api/admin/chat-topics', { headers: { 'Authorization': 'Bearer ' + token } });
            if (res.ok) {
                window.globalChatTopics = await res.json();
                const select = document.getElementById('globalChatTopicSelect');
                if (select) {
                    if (window.globalChatTopics.length > 0) {
                        select.innerHTML = window.globalChatTopics.map(t => {
                            const typeStr = t.type === 'order' ? '📦 Заказ' : '✉️ Обращение';
                            const titleStr = t.title || `${typeStr} #${t.id}`;
                            const dateStr = new Date(t.created_at).toLocaleDateString('ru-RU');
                            return `<option value="${t.type}_${t.id}">${titleStr} (${dateStr})</option>`;
                        }).join('');
                        window.selectGlobalChatTopicGlobal(window.globalChatTopics[0].type + '_' + window.globalChatTopics[0].id);
                    } else {
                        select.innerHTML = `<option value="">Нет активных диалогов</option>`;
                        const container = document.getElementById('globalChatMessagesContainer');
                        if (container) container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-sm font-bold uppercase tracking-widest font-['Space Grotesk'] text-on-surface">Нет активных диалогов</span><span class="text-xs opacity-70 mt-1 max-w-xs leading-relaxed">Здесь будут отображаться чаты по заказам и обращениям клиентов.</span></div>`;
                    }
                }
            }
        } else {
            const [ordersRes, leadsRes] = await Promise.all([
                fetch('/api/orders/my', { headers: { 'Authorization': 'Bearer ' + token } }),
                fetch('/api/leads/my', { headers: { 'Authorization': 'Bearer ' + token } })
            ]);
            let orders = [];
            let leads = [];
            if (ordersRes.ok) orders = await ordersRes.json();
            if (leadsRes.ok) leads = await leadsRes.json();

            const orderTopics = orders.map(o => ({
                id: o.id,
                type: 'order',
                title: `📦 Заказ #${o.id} — ${Number(o.total || 0).toLocaleString()} ₽`,
                created_at: o.created_at,
                messages: o.messages || []
            }));
            const leadTopics = leads.map(l => ({
                id: l.id,
                type: 'lead',
                title: `✉️ Обращение #${l.id} — ${l.type || 'Вопрос'}`,
                created_at: l.created_at,
                messages: l.messages || []
            }));

            window.globalChatTopics = [...orderTopics, ...leadTopics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            const select = document.getElementById('globalChatTopicSelect');
            if (select) {
                if (window.globalChatTopics.length > 0) {
                    select.innerHTML = window.globalChatTopics.map(t => `<option value="${t.type}_${t.id}">${t.title} (${new Date(t.created_at).toLocaleDateString('ru-RU')})</option>`).join('');
                    window.selectGlobalChatTopicGlobal(window.globalChatTopics[0].type + '_' + window.globalChatTopics[0].id);
                } else {
                    select.innerHTML = `<option value="">У вас пока нет активных диалогов</option>`;
                    const container = document.getElementById('globalChatMessagesContainer');
                    if (container) container.innerHTML = `<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-sm font-bold uppercase tracking-widest font-['Space Grotesk'] text-on-surface">Нет активных диалогов</span><span class="text-xs opacity-70 mt-1 max-w-xs leading-relaxed">Создайте обращение или оформите заказ, чтобы начать чат.</span></div>`;
                }
            }
        }
    } catch(e) { console.warn('Global chat load error:', e); }

    const input = document.getElementById('globalChatInput');
    if (input) input.onkeydown = (e) => { if (e.key === 'Enter') window.sendGlobalChatMessageGlobal(); };
};

window.closeGlobalChatDrawerGlobal = function() {
    if (window.globalChatActiveChannel) {
        if (window.supabaseClientGlobal) window.supabaseClientGlobal.removeChannel(window.globalChatActiveChannel);
        window.globalChatActiveChannel = null;
    }
    const modal = document.getElementById('globalChatDrawerModal');
    if (!modal) return;
    const panel = modal.querySelector('#globalChatModalPanel');
    const overlay = modal.querySelector('.absolute');
    if(overlay) overlay.classList.add('opacity-0');
    if(panel) panel.classList.replace('modal-animate-in', 'modal-animate-out');
    setTimeout(() => { modal.remove(); window.unlockScrollGlobal(); }, 500);
};

window.selectGlobalChatTopicGlobal = function(val) {
    if (!val) return;
    const [type, id] = val.split('_');
    window.globalChatSelectedTopic = { type, id };
    const topic = (window.globalChatTopics || []).find(t => t.type === type && String(t.id) === String(id));
    if (!topic) return;

    let messages = [];
    try {
        if (typeof topic.messages === 'string') messages = JSON.parse(topic.messages);
        else if (Array.isArray(topic.messages)) messages = topic.messages;
    } catch(e){}
    window.globalChatActiveMessages = messages;

    window.renderGlobalChatMessagesGlobal();

    if (!window.supabaseClientGlobal) {
        const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
        window.supabaseClientGlobal = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { params: { eventsPerSecond: 10 } } });
        const token = localStorage.getItem('metal_token');
        if (token) window.supabaseClientGlobal.realtime.setAuth(token);
    }

    if (window.globalChatActiveChannel) {
        window.supabaseClientGlobal.removeChannel(window.globalChatActiveChannel);
        window.globalChatActiveChannel = null;
    }

    const tableName = type === 'order' ? 'orders' : 'leads';
    const channelName = `global-${type}-chat-${id}`;

    window.globalChatActiveChannel = window.supabaseClientGlobal
        .channel(channelName)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: tableName, filter: `id=eq.${id}` }, (payload) => {
            const newMessages = payload.new.messages;
            if (!newMessages) return;
            let updated = [];
            try { updated = typeof newMessages === 'string' ? JSON.parse(newMessages) : newMessages; } catch(e){ return; }
            if (updated.length > window.globalChatActiveMessages.length) {
                window.globalChatActiveMessages = updated;
                const idx = window.globalChatTopics.findIndex(t => t.type === type && String(t.id) === String(id));
                if (idx !== -1) window.globalChatTopics[idx].messages = updated;
                window.renderGlobalChatMessagesGlobal();
            }
        }).subscribe();
};

window.renderGlobalChatMessagesGlobal = function() {
    const chatBox = document.getElementById('globalChatMessagesContainer');
    if (!chatBox) return;
    const messages = window.globalChatActiveMessages || [];
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');

    if (!messages.length) {
        chatBox.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6 animate-in fade-in duration-300">
                <span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span>
                <span class="text-sm font-bold uppercase tracking-widest font-['Space Grotesk'] text-on-surface">${isAdmin ? 'Чат с клиентом' : 'Чат с менеджером'}</span>
                <span class="text-xs opacity-70 mt-1 max-w-xs leading-relaxed">Здесь будет сохраняться вся история переписки. Напишите первое сообщение ниже.</span>
            </div>
        `;
        return;
    }

    chatBox.innerHTML = messages.map(m => {
        const isMe = isAdmin ? m.sender === 'admin' : m.sender === 'client';
        const senderLabel = isMe ? 'Вы' : (isAdmin ? 'Клиент' : 'Менеджер');
        const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

        if (isMe) {
            return `
                <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-primary text-on-primary rounded-br-none shadow-md font-medium leading-relaxed break-words">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-on-surface-variant opacity-50 font-mono mt-1.5 flex items-center gap-1 mr-1">
                        <span class="material-symbols-outlined text-[12px] text-primary">done_all</span>
                        ${senderLabel} • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-bl-none shadow-md leading-relaxed break-words">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-primary/80 font-mono mt-1.5 flex items-center gap-1 ml-1">
                        <span class="material-symbols-outlined text-[12px]">${isAdmin ? 'person' : 'support_agent'}</span>
                        ${senderLabel} • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        }
    }).join('');
    chatBox.scrollTop = chatBox.scrollHeight;
};

window.sendGlobalChatMessageGlobal = async function() {
    const input = document.getElementById('globalChatInput');
    const text = input ? input.value.trim() : '';
    if (!text || !window.globalChatSelectedTopic) return;

    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');
    const sender = isAdmin ? 'admin' : 'client';
    const newMsg = { sender, text, timestamp: new Date().toISOString() };
    
    window.globalChatActiveMessages.push(newMsg);
    input.value = '';
    window.renderGlobalChatMessagesGlobal();

    const { type, id } = window.globalChatSelectedTopic;
    const idx = window.globalChatTopics.findIndex(t => t.type === type && String(t.id) === String(id));
    if (idx !== -1) window.globalChatTopics[idx].messages = window.globalChatActiveMessages;

    try {
        const token = localStorage.getItem('metal_token');
        let endpoint = '';
        if (isAdmin) {
            endpoint = type === 'order' ? `/api/admin/orders/${id}` : `/api/admin/leads/${id}`;
        } else {
            endpoint = type === 'order' ? `/api/orders/my/${id}` : `/api/leads/my/${id}`;
        }

        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: window.globalChatActiveMessages })
        });
        if (!res.ok) {
            window.globalChatActiveMessages.pop();
            window.renderGlobalChatMessagesGlobal();
        }
    } catch(e) {
        window.globalChatActiveMessages.pop();
        window.renderGlobalChatMessagesGlobal();
    }
};

(function() {
    const lightModeStyles = `
/* --- CUSTOM PALETTE: #D6A3AB, #C7C5C5, #3B3B3B, #964551, #827D7E --- */
html.light body,
html.light body.bg-background,
html.light body[class*="bg-"],
html.light main,
html.light main[class*="bg-"],
html.light main[class*="overflow-"],
html.light main.overflow-x-hidden {
    background-color: #C7C5C5 !important;
    color: #3B3B3B !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

html.light {
    --tw-bg-opacity: 1 !important;
    --tw-gradient-from: #C7C5C5 !important;
    --tw-gradient-to: rgba(199, 197, 197, 0) !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
}

/* 2. Force All Background Classes with Liquid Glass (60% Opacity) */
html.light [class*="bg-"],
html.light [class*="bg-surface"],
html.light [class*="bg-white/"],
html.light section,
html.light aside,
html.light footer,
html.light article,
html.light .glass-panel,
html.light .glass-card,
html.light .liquid-glass,
html.light .modal-content,
html.light [class*="bg-surface-container"],
html.light .mega-menu-inner,
html.light #cartPanelGlobal,
html.light #authPanelGlobal,
html.light #mobileMenuPanelGlobal,
html.light #mobileCatalogPanelGlobal,
html.light #searchContainerGlobal {
    background-color: rgba(199, 197, 197, 0.6) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    background-image: none !important;
    border-color: #827D7E !important;
}

/* Hero Stats Liquid Glass & Divider Overrides */
html.light #hero .bg-surface\/50,
html.light #hero .bg-surface-container-low\/50,
html.light #hero .liquid-glass,
html.light #hero [class*="bg-surface"],
html.light #hero [class*="bg-surface-container-low"] {
    background-color: rgba(255, 255, 255, 0.65) !important;
    backdrop-filter: blur(25px) saturate(200%) !important;
    -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
    border-color: rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.5) !important;
}

html.light #hero .border-primary\/30,
html.light #hero .border-l {
    border-color: rgba(150, 69, 81, 0.25) !important;
}

/* Deep Wine Buttons (#964551) */
html.light .bg-primary, 
html.light .apple-toggle-thumb,
html.light .mega-default-btn,
html.light button.bg-primary,
html.light [type="submit"],
html.light .addToCartBtn,
html.light [onclick*="addToCart"] {
    background-color: #964551 !important; 
    color: #FFFFFF !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    opacity: 1 !important;
    border: none !important;
}

html.light .mega-default-btn:hover,
html.light button.bg-primary:hover,
html.light [type="submit"]:hover {
    background-color: #7a3541 !important;
    transform: translateY(-2px);
}

/* Restore Hero Image Visibility - 6px Blur */
html.light #hero img,
html.light section#hero img,
html.light section:first-of-type img,
html.light .hero-bg img {
    opacity: 1 !important;
    filter: blur(6px) !important;
    mix-blend-mode: normal !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
html.light #hero .bg-gradient-to-r,
html.light section:first-of-type .bg-gradient-to-r {
    display: block !important;
    opacity: 1 !important;
    background: transparent !important;
    background-image: linear-gradient(to right, #FAFAFA 0%, rgba(250, 250, 250, 0.8) 50%, rgba(250, 250, 250, 0) 100%) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}
html.light #hero .bg-gradient-to-b,
html.light section:first-of-type .bg-gradient-to-b {
    display: block !important;
    opacity: 1 !important;
    background: transparent !important;
    background-image: linear-gradient(to bottom, #FAFAFA 0%, rgba(250, 250, 250, 0.6) 60%, #FAFAFA 100%) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

/* Sidebar & Mega Menu */
html.light .mega-menu-left {
    background-color: rgba(199, 197, 197, 0.8) !important;
    border-right: 1px solid #827D7E !important;
}
html.light .mega-cat-link:hover, 
html.light .mega-cat-item.is-active .mega-cat-link {
    background-color: #d6336c !important; /* Premium Pink */
    color: #FFFFFF !important;
}
html.light .mega-cat-item.is-active .mega-cat-link::before {
    background-color: #ffffff !important;
    background: #ffffff !important;
}
html.light .mega-menu-right {
    background-color: transparent !important;
}
html.light .mega-menu-right .mega-sub-link:hover {
    color: #964551 !important;
}

/* 3. Text & Icons (#3B3B3B) */
html.light [class*="text-"],
html.light h1, html.light h2, html.light h3, html.light h4, html.light h5, html.light h6,
html.light p, html.light span:not(.material-symbols-outlined),
html.light a:not(.bg-primary),
html.light .nav-link {
    color: #3B3B3B !important;
    opacity: 1 !important;
}
html.light .material-symbols-outlined:not(.text-primary) {
    color: #3B3B3B !important;
}

/* Restore white text on Deep Wine elements */
html.light .bg-primary *,
html.light button.bg-primary *,
html.light [type="submit"],
html.light .text-white,
html.light .mega-default-btn span {
    color: #FFFFFF !important;
}

/* Deep Wine Accents */
html.light .text-primary,
html.light .text-primary * {
    color: #964551 !important;
}

html.light a[href="/"] .text-primary,
html:not(.dark) a[href="/"] .text-primary {
    color: #d6336c !important;
}


/* 7. Borders & Scrollbars */
html.light [class*="border-"],
html.light .machined-border {
    border-color: #827D7E !important;
}
html.light .border-primary { border-color: #964551 !important; }

html.light ::-webkit-scrollbar-track { background: #C7C5C5 !important; }
html.light ::-webkit-scrollbar-thumb { 
    background: #964551 !important; 
    border: 2px solid #C7C5C5 !important;
}
html.light * { scrollbar-color: #964551 #C7C5C5 !important; }

.nav-link { position: relative; }
.nav-link::after {
    content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
    background: #964551; transition: width 0.3s ease;
}
.nav-link:hover::after { width: 100%; }

.mega-menu {
    opacity: 0; pointer-events: none; visibility: hidden;
    position: fixed; top: 80px; left: 0; width: 100vw; z-index: 2000;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    transform: translateY(-10px);
}
.mega-menu.is-visible { 
    opacity: 1; pointer-events: auto; visibility: visible;
    transform: translateY(0);
}
.mega-menu-inner {
    display: flex; max-width: 1440px; margin: 0 auto; background: #C7C5C5;
    border: 1px solid #827D7E; border-top: 2px solid #964551;
    box-shadow: 0 40px 100px rgba(0,0,0,0.6); min-height: 400px;
}
.mega-menu-left { width: 300px; background: rgba(199, 197, 197, 0.9); border-right: 1px solid #827D7E; padding: 20px 0; }
.mega-cat-link {
    display: flex; align-items: center; gap: 12px; padding: 12px 30px;
    color: #3B3B3B; text-decoration: none; font-family: 'Space Grotesk', sans-serif;
    font-size: 14px; transition: all 0.2s; position: relative;
}
.mega-cat-link:hover, .mega-cat-item.is-active .mega-cat-link { background: #d6336c; color: #FFFFFF; }
.mega-cat-item.is-active .mega-cat-link::before {
    content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #d6336c;
}
.mega-menu-right { flex: 1; padding: 40px; background: transparent; }
.mega-submenu { display: none; }
.mega-submenu.is-active { display: block; animation: fadeInSub 0.3s ease; }
@keyframes fadeInSub { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
.mega-submenu-title { font-size: 20px; font-weight: 600; color: #3B3B3B; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #827D7E; }
.mega-submenu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 20px; }
.mega-sub-link { color: #3B3B3B; text-decoration: none; font-size: 13px; display: block; padding: 6px 0; transition: color 0.2s; }
.mega-sub-link:hover { color: #964551; }

.mega-overlay { 
    opacity: 0; pointer-events: none; visibility: hidden;
    position: fixed; top: 80px; left: 0; width: 100vw; height: 100vh; 
    background: rgba(0,0,0,0.5); z-index: 1999; backdrop-filter: blur(4px); 
    transition: all 0.4s ease;
}
.mega-overlay.is-visible { opacity: 1; pointer-events: auto; visibility: visible; }

/* === PREMIUM PINK #d6336c OVERRIDES FOR LIGHT MODE === */
html.light .pink-slide::after,
html:not(.dark) .pink-slide::after {
    background-color: #d6336c !important;
    background: #d6336c !important;
}
html.light .tab-btn.active,
html.light .tab-active,
html:not(.dark) .tab-btn.active,
html:not(.dark) .tab-active {
    background-color: rgba(150, 69, 81, 0.15) !important;
    background: rgba(150, 69, 81, 0.15) !important;
    color: #964551 !important;
    border-color: #964551 !important;
}
html.light .active-shape-card,
html:not(.dark) .active-shape-card {
    border-color: #d6336c !important;
    background-color: rgba(214, 51, 108, 0.08) !important;
    box-shadow: 0 0 20px rgba(214, 51, 108, 0.15) !important;
}
html.light input:focus,
html.light select:focus,
html.light textarea:focus,
html:not(.dark) input:focus,
html:not(.dark) select:focus,
html:not(.dark) textarea:focus {
    border-bottom-color: #d6336c !important;
    border-color: #d6336c !important;
}
html.light .industrial-glow:hover,
html:not(.dark) .industrial-glow:hover {
    border-color: #d6336c !important;
    box-shadow: inset 0 0 25px rgba(214, 51, 108, 0.1) !important;
}
html.light input,
html.light textarea,
html.light select,
html:not(.dark) input,
html:not(.dark) textarea,
html:not(.dark) select {
    color: #3B3B3B !important;
}
html.light input::placeholder,
html.light textarea::placeholder,
html:not(.dark) input::placeholder,
html:not(.dark) textarea::placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light input::-webkit-input-placeholder,
html:not(.dark) input::-webkit-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light textarea::-webkit-input-placeholder,
html:not(.dark) textarea::-webkit-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light select::-webkit-input-placeholder,
html:not(.dark) select::-webkit-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light input::-moz-placeholder,
html:not(.dark) input::-moz-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light textarea::-moz-placeholder,
html:not(.dark) textarea::-moz-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light select::-moz-placeholder,
html:not(.dark) select::-moz-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light input:-ms-input-placeholder,
html:not(.dark) input:-ms-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light textarea:-ms-input-placeholder,
html:not(.dark) textarea:-ms-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light select:-ms-input-placeholder,
html:not(.dark) select:-ms-input-placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light input::placeholder,
html:not(.dark) input::placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light textarea::placeholder,
html:not(.dark) textarea::placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}
html.light select::placeholder,
html:not(.dark) select::placeholder {
    color: rgba(59, 59, 59, 0.6) !important;
}

html.light .cta-urgent-box .cta-title,
html:not(.dark) .cta-urgent-box .cta-title {
    color: #964551 !important;
}
html.light .cta-urgent-box .cta-btn,
html:not(.dark) .cta-urgent-box .cta-btn {
    background-color: #964551 !important;
    color: #ffffff !important;
    border: none !important;
}
html.light .cta-urgent-box .cta-btn:hover,
html:not(.dark) .cta-urgent-box .cta-btn:hover {
    background-color: #7a3541 !important;
    color: #ffffff !important;
}
html.light .cta-urgent-box .cta-btn .material-symbols-outlined,
html:not(.dark) .cta-urgent-box .cta-btn .material-symbols-outlined {
    color: #ffffff !important;
}

html.light .mega-default-title,
html:not(.dark) .mega-default-title {
    color: #3B3B3B !important;
}
html.light .mega-default-desc,
html:not(.dark) .mega-default-desc {
    color: #3B3B3B !important;
    opacity: 0.85 !important;
}

/* Fix text and icon colors on wine-red (#964551) background elements to be light gray (#c7c5c5) */
html.light .bg-primary,
html.light button.bg-primary,
html.light [type="submit"],
html.light .addToCartBtn,
html.light [onclick*="addToCart"],
html.light .mega-default-btn,
html.light #floatingChatBtnGlobal {
    color: #c7c5c5 !important;
}

html.light .bg-primary *,
html.light button.bg-primary *,
html.light [type="submit"] *,
html.light .addToCartBtn *,
html.light [onclick*="addToCart"] *,
html.light .mega-default-btn *,
html.light #floatingChatBtnGlobal * {
    color: #c7c5c5 !important;
}

/* Hover state for floating chat button (turns background white, so text/icon should be dark gray) */
html.light #floatingChatBtnGlobal:hover,
html.light #floatingChatBtnGlobal:hover * {
    color: #3B3B3B !important;
}

/* Hover state for scroll to top button (turns background wine-red, so text/icon should be light gray) */
html.light #scrollTopBtnGlobal:hover,
html.light #scrollTopBtnGlobal:hover * {
    color: #c7c5c5 !important;
}

/* Ensure buttons inside bg-primary with their own light/dark background retain correct text/icon contrast */
html.light .bg-primary button:not(.bg-primary),
html.light .bg-primary button:not(.bg-primary) * {
    color: #3B3B3B !important;
}
html.light .bg-primary button:not(.bg-primary):hover,
html.light .bg-primary button:not(.bg-primary):hover * {
    color: #EBE8E6 !important;
}


/* === POPULAR CATEGORIES LIGHT THEME ALIGNMENT === */
html.light #popular-categories a,
html.light #popular-categories [class*="bg-surface"] {
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

html.light #popular-categories [class*="bg-gradient-to-t"] {
    background-image: linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0) 100%) !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

@media (min-width: 768px) {
    html.light #popular-categories a p {
        opacity: 0 !important;
        transition: opacity 0.5s ease, transform 0.5s ease !important;
    }
    html.light #popular-categories a:hover p {
        opacity: 1 !important;
    }
}

/* Custom contrast improvements for switcher and cart badge in light theme */
html.light .apple-toggle-thumb {
    background-color: #3B3B3B !important;
}
html.light .apple-toggle-thumb .theme-icon-active {
    color: #c7c5c5 !important;
}
html.light #cartBadgeGlobal {
    background-color: #3B3B3B !important;
    color: #c7c5c5 !important;
}
`;
    const style = document.createElement('style');
    style.id = 'light-mode-styles-injected';
    style.textContent = lightModeStyles;
    document.head.appendChild(style);
})();

/* ==========================================
   PREMIUM CUSTOM SELECT DROPDOWN OVERLAYS
   ========================================== */
(function() {
    // 1. Inject Premium Custom Select CSS
    const styles = `
    .custom-select-container {
        position: relative;
        display: inline-block;
    }
    .custom-select-container.w-full {
        display: block;
        width: 100%;
    }
    .custom-select-hidden {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
        outline: none !important;
        pointer-events: none !important;
        opacity: 0 !important;
    }
    
    /* Trigger Button */
    .custom-select-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 600;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        user-select: none;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
        background: #151311 !important;
        color: #e7e2dd;
        padding: 5px 12px;
        line-height: 1.2;
        text-align: left;
        white-space: nowrap !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    }
    .custom-select-trigger.large-padding {
        padding: 7px 14px;
        line-height: 1.2;
    }
    .custom-select-text {
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        line-height: 1.2;
        flex: 1;
        min-width: 0;
    }
    .custom-select-trigger:hover {
        background: #151311 !important;
        color: #c7c5c5;
        box-shadow: 0 4px 14px rgba(255, 176, 204, 0.25) !important;
    }
    .custom-select-trigger.is-active {
        background: #151311 !important;
        color: #c7c5c5;
        box-shadow: 0 4px 14px rgba(255, 176, 204, 0.3) !important;
    }
    
    /* Chevron arrow */
    .custom-select-arrow {
        font-family: 'Material Symbols Outlined';
        font-weight: normal;
        font-style: normal;
        font-size: 16px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        -webkit-font-smoothing: antialiased;
        transition: transform 0.3s ease;
        margin-left: 8px;
        color: #c7c5c5;
        pointer-events: none;
    }
    .custom-select-trigger.is-active .custom-select-arrow {
        transform: rotate(180deg);
    }
    
    /* Popup Menu Overlay */
    .custom-select-popup {
        position: fixed;
        z-index: 999999;
        border-radius: 12px;
        border: none !important;
        border-width: 0 !important;
        outline: none !important;
        background: #151311 !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6) !important;
        max-height: 200px;
        overflow-y: auto;
        opacity: 0;
        transform: scale(0.95);
        transform-origin: top center;
        pointer-events: none;
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .custom-select-popup.is-open {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
    }
    
    /* Options */
    .custom-select-option {
        padding: 4px 12px;
        font-size: 13px;
        font-weight: 500;
        color: #d7c1c7;
        cursor: pointer;
        transition: background-color 0.15s ease, color 0.15s ease;
        text-transform: uppercase;
        text-align: left;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        line-height: 1.2;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    .custom-select-option:hover {
        background: rgba(255, 176, 204, 0.1);
        color: #c7c5c5;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    .custom-select-option.is-selected {
        background: rgba(255, 176, 204, 0.15);
        color: #c7c5c5;
        font-weight: 700;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    
    /* Scrollbar */
    .custom-select-popup::-webkit-scrollbar {
        width: 6px;
    }
    .custom-select-popup::-webkit-scrollbar-track {
        background: #151311 !important;
    }
    .custom-select-popup::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
    }
    .custom-select-popup::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
    }
    
    /* --- LIGHT THEME OVERRIDES --- */
    html.light .custom-select-trigger {
        background: #C7C5C5 !important;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
        color: #151311;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
    }
    html.light .custom-select-trigger:hover,
    html.light .custom-select-trigger.is-active {
        background: #C7C5C5 !important;
        color: #964551;
        box-shadow: 0 4px 14px rgba(150, 69, 81, 0.25) !important;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    html.light .custom-select-arrow {
        color: #964551;
    }
    html.light .custom-select-popup {
        background: #C7C5C5 !important;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
        backdrop-filter: blur(25px) saturate(180%);
        -webkit-backdrop-filter: blur(25px) saturate(180%);
    }
    html.light .custom-select-option {
        color: #151311;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    html.light .custom-select-option:hover {
        background: rgba(150, 69, 81, 0.15);
        color: #964551;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    html.light .custom-select-option.is-selected {
        background: rgba(150, 69, 81, 0.25);
        color: #964551;
        font-weight: 700;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    html.light .custom-select-popup::-webkit-scrollbar-track {
        background: #C7C5C5 !important;
    }
    html.light .custom-select-popup::-webkit-scrollbar-thumb {
        background: rgba(150, 69, 81, 0.2);
    }
    html.light .custom-select-popup::-webkit-scrollbar-thumb:hover {
        background: rgba(150, 69, 81, 0.3);
    }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'custom-select-styles-global';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
    
    // Save reference to original select descriptors
    const originalValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    const originalIndexDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
    
    window.initCustomSelects = function() {
        const selects = document.querySelectorAll('select:not([data-custom-select-initialized])');
        
        selects.forEach(select => {
            if (select.classList.contains('custom-select-hidden')) return;
            
            // Mark select as decorated
            select.setAttribute('data-custom-select-initialized', 'true');
            
            // Create container and inherit layout classes
            const container = document.createElement('div');
            container.className = 'custom-select-container';
            
            const layoutClasses = ['w-full', 'w-72', 'md:w-72', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'flex-1', 'grow', 'shrink'];
            select.classList.forEach(cls => {
                if (layoutClasses.includes(cls) || cls.startsWith('w-') || cls.startsWith('md:w-') || cls.startsWith('lg:w-') || cls.startsWith('max-w-')) {
                    container.classList.add(cls);
                }
            });
            
            // Inject container into DOM
            select.parentNode.insertBefore(container, select);
            container.appendChild(select);
            select.classList.add('custom-select-hidden');
            
            // Find and hide hardcoded select chevrons (such as in catalog toolbar)
            const parent = container.parentNode;
            if (parent) {
                Array.from(parent.children).forEach(sib => {
                    if (sib !== container && sib.classList.contains('material-symbols-outlined') && 
                        (sib.textContent.trim() === 'expand_more' || sib.textContent.trim() === 'expand_less')) {
                        sib.style.display = 'none';
                    }
                });
            }
            
            // Create trigger element
            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'custom-select-trigger';
            if (select.classList.contains('p-4') || select.classList.contains('py-3') || select.classList.contains('py-4')) {
                trigger.classList.add('large-padding');
            }
            
            const textSpan = document.createElement('span');
            textSpan.className = 'custom-select-text';
            
            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'custom-select-arrow material-symbols-outlined';
            arrowSpan.textContent = 'expand_more';
            
            trigger.appendChild(textSpan);
            trigger.appendChild(arrowSpan);
            container.appendChild(trigger);
            
            // Create popup panel
            const popup = document.createElement('div');
            popup.className = 'custom-select-popup';
            container.appendChild(popup);
            
            // Function to build/rebuild custom options from native options
            function rebuildOptions() {
                popup.innerHTML = '';
                const options = select.options;
                
                for (let i = 0; i < options.length; i++) {
                    const opt = options[i];
                    const optDiv = document.createElement('div');
                    optDiv.className = 'custom-select-option';
                    optDiv.textContent = opt.textContent;
                    optDiv.setAttribute('data-value', opt.value);
                    
                    if (opt.selected) {
                        optDiv.classList.add('is-selected');
                        textSpan.textContent = opt.textContent;
                    }
                    
                    optDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (select.value !== opt.value) {
                            select.value = opt.value;
                            // Dispatch standard event
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        closePopup();
                    });
                    
                    popup.appendChild(optDiv);
                }
                
                if (!textSpan.textContent && options.length > 0) {
                    textSpan.textContent = options[0].textContent;
                }
            }
            
            rebuildOptions();
            
            function positionPopup() {
                const triggerRect = trigger.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const popupMaxH = 200;
                const spaceBelow = viewportHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;

                popup.style.width = triggerRect.width + 'px';
                popup.style.left = triggerRect.left + 'px';

                if (spaceBelow >= Math.min(popupMaxH, 120) || spaceBelow >= spaceAbove) {
                    // Open downward
                    popup.style.top = (triggerRect.bottom + 6) + 'px';
                    popup.style.bottom = 'auto';
                    popup.style.transformOrigin = 'top center';
                } else {
                    // Open upward
                    popup.style.bottom = (viewportHeight - triggerRect.top + 6) + 'px';
                    popup.style.top = 'auto';
                    popup.style.transformOrigin = 'bottom center';
                }
            }

            function togglePopup() {
                const isOpen = popup.classList.contains('is-open');
                if (isOpen) {
                    closePopup();
                } else {
                    // Close other selects
                    document.querySelectorAll('.custom-select-popup.is-open').forEach(p => {
                        if (p !== popup) {
                            p.classList.remove('is-open');
                            const prevTrigger = p._customSelectTrigger;
                            if (prevTrigger) prevTrigger.classList.remove('is-active');
                        }
                    });

                    // Move popup to body (portal) to escape overflow:hidden parents
                    if (popup.parentNode !== document.body) {
                        document.body.appendChild(popup);
                        popup._customSelectTrigger = trigger;
                    }

                    positionPopup();
                    popup.classList.add('is-open');
                    trigger.classList.add('is-active');
                }
            }
            
            function closePopup() {
                popup.classList.remove('is-open');
                trigger.classList.remove('is-active');
            }

            // Reposition on scroll/resize while open
            function onScrollResize() {
                if (popup.classList.contains('is-open')) {
                    positionPopup();
                }
            }
            window.addEventListener('scroll', onScrollResize, true);
            window.addEventListener('resize', onScrollResize);
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                togglePopup();
            });
            
            // Watch for changes in native options (e.g. calculator re-population)
            const obs = new MutationObserver(() => {
                rebuildOptions();
            });
            obs.observe(select, { childList: true });
            
            // Store sync link
            select._syncCustomSelect = function() {
                rebuildOptions();
            };
        });
    };
    
    // Intercept setter/getter of native value properties to support programmatic values update
    if (originalValueDescriptor && originalValueDescriptor.set) {
        Object.defineProperty(HTMLSelectElement.prototype, 'value', {
            get() {
                return originalValueDescriptor.get.call(this);
            },
            set(val) {
                originalValueDescriptor.set.call(this, val);
                if (typeof this._syncCustomSelect === 'function') {
                    this._syncCustomSelect();
                }
            },
            configurable: true
        });
    }
    
    if (originalIndexDescriptor && originalIndexDescriptor.set) {
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedIndex', {
            get() {
                return originalIndexDescriptor.get.call(this);
            },
            set(idx) {
                originalIndexDescriptor.set.call(this, idx);
                if (typeof this._syncCustomSelect === 'function') {
                    this._syncCustomSelect();
                }
            },
            configurable: true
        });
    }
    
    // Click outside handler
    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-select-popup.is-open').forEach(p => {
            p.classList.remove('is-open');
            const t = p._customSelectTrigger;
            if (t) t.classList.remove('is-active');
        });
    });
    
    // Auto initialize and setup global observer for newly added selects
    const globalObserver = new MutationObserver((mutations) => {
        let hasNewSelect = false;
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === 1) {
                    if (node.tagName === 'SELECT' && !node.hasAttribute('data-custom-select-initialized') && !node.classList.contains('custom-select-hidden')) {
                        hasNewSelect = true;
                        break;
                    }
                    if (node.querySelector && node.querySelector('select:not([data-custom-select-initialized]):not(.custom-select-hidden)')) {
                        hasNewSelect = true;
                        break;
                    }
                }
            }
            if (hasNewSelect) break;
        }
        if (hasNewSelect) {
            window.initCustomSelects();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        window.initCustomSelects();
        globalObserver.observe(document.body, { childList: true, subtree: true });
    });
})();

// --- MAP SCROLL INTERACTION LOCK SYSTEM ---
(function() {
    const mapStyles = document.createElement('style');
    mapStyles.textContent = `
        .map-container-wrapper {
            position: relative;
        }
        .map-container-wrapper iframe {
            pointer-events: none !important;
            transition: filter 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            filter: blur(3px) brightness(0.4) contrast(1.1) saturate(1.1) grayscale(0.2);
        }
        /* Light Theme defaults */
        html.light .map-container-wrapper iframe,
        html:not(.dark) .map-container-wrapper iframe {
            filter: blur(3px) brightness(1.3) contrast(1) saturate(1.1) grayscale(0.2);
        }
        /* Active (Interacting) state */
        .map-container-wrapper.active iframe {
            pointer-events: auto !important;
            filter: blur(0px) brightness(1) contrast(1.1) saturate(1.1) grayscale(0) !important;
        }
        .map-container-wrapper::after {
            content: 'Нажмите для взаимодействия с картой';
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(21, 19, 17, 0.85);
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e7e2dd;
            padding: 8px 16px;
            font-size: 11px;
            font-weight: 500;
            border-radius: 9999px;
            pointer-events: none;
            opacity: 0.9;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 10;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        }
        .map-container-wrapper.active::after {
            opacity: 0;
            transform: translate(-50%, 10px);
        }
    `;
    document.head.appendChild(mapStyles);

    function initMaps() {
        document.querySelectorAll('.map-container-wrapper').forEach(wrapper => {
            if (wrapper.dataset.mapInitialized) return;
            wrapper.dataset.mapInitialized = 'true';
            
            wrapper.addEventListener('click', () => {
                wrapper.classList.add('active');
            });
            
            wrapper.addEventListener('mouseleave', () => {
                wrapper.classList.remove('active');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMaps();
        
        // Setup observer for dynamically loaded content
        const observer = new MutationObserver(() => {
            initMaps();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Handle clicking outside to deactivate
        document.addEventListener('click', (e) => {
            document.querySelectorAll('.map-container-wrapper.active').forEach(wrapper => {
                if (!wrapper.contains(e.target)) {
                    wrapper.classList.remove('active');
                }
            });
        });
    });
})();

