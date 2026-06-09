/**
 * PREMIUM PRELOADER SYSTEM
 * Injected immediately to ensure early visibility for Iron Woodman High-Tech Site
 */

// --- GLOBAL API REWRITE INTERCEPTOR FOR VERCEL PRODUCTION BACKEND ---
(function() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // --- MATERIAL ICONS LOADING DETECTION ---
    if (document.fonts) {
        document.fonts.load('24px "Material Symbols Outlined"').then(function() {
            document.documentElement.classList.add('material-symbols-loaded');
        }).catch(function() {
            document.documentElement.classList.add('material-symbols-loaded');
        });
        setTimeout(function() {
            document.documentElement.classList.add('material-symbols-loaded');
        }, 1500); // safety timeout
    } else {
        document.documentElement.classList.add('material-symbols-loaded');
    }

    // --- THEME INITIALIZATION ---
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(savedTheme);
    
    // --- THEME TOGGLE AUDIO ---
    let _ctx = null;
    let _buf = null;

    function audioCtx() {
        if (!_ctx) {
            _ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (_ctx.state === "suspended") _ctx.resume();
        return _ctx;
    }

    function ensureBuf(ac) {
        if (_buf && _buf.sampleRate === ac.sampleRate) return _buf;
        const rate = ac.sampleRate;
        const len = Math.floor(rate * 0.006);
        const buf = ac.createBuffer(1, len, rate);
        const ch = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            const t = i / len;
            const sine = Math.sin(2 * Math.PI * 3400 * t);
            const noise = Math.random() * 2 - 1;
            ch[i] = (sine * 0.6 + noise * 0.4) * (1 - t) ** 3;
        }
        _buf = buf;
        return buf;
    }

    let lastSnd = 0;
    function playToggleSound() {
        const now = performance.now();
        if (now - lastSnd < 80) return;
        lastSnd = now;
        try {
            const ac = audioCtx();
            const buf = ensureBuf(ac);
            const src = ac.createBufferSource();
            const gain = ac.createGain();
            src.buffer = buf;
            gain.gain.value = 0.08;
            src.connect(gain);
            gain.connect(ac.destination);
            src.start();
        } catch (e) {
            /* silent */
        }
    }

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
        updateYandexWidgetsTheme(newTheme);
        
        // Play switch sound
        playToggleSound();
        
        // Remove switching class after transition (matching CSS 0.25s)
        setTimeout(() => {
            doc.classList.remove('theme-transitioning');
        }, 250);
    };

    function updateYandexWidgetsTheme(theme) {
        document.querySelectorAll('iframe[src*="yandex.ru/maps-reviews-widget"], iframe[src*="yandex.ru/map-widget"]').forEach(iframe => {
            let url = new URL(iframe.src);
            url.searchParams.set('theme', theme);
            let newSrc = url.toString();
            if (iframe.src !== newSrc) {
                iframe.src = newSrc;
            }
        });
    }

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
            icon.style.color = '#ca7093';
        });
    }
    
    // Initial visual update after DOM is ready or immediately if already parsed
    function initThemeToggle() {
        const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        updateToggleVisuals(currentTheme);
        updateYandexWidgetsTheme(currentTheme);
    }
    window.updateToggleVisualsGlobal = updateToggleVisuals;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeToggle);
    } else {
        initThemeToggle();
    }

    // --- PRECISE GOST CALCULATION ALGORITHMS ---
    window.parseUniversalSpecs = function(p) {
        if (!p) return p;
        let name = (p.name || '').toLowerCase();
        
        // Default assignments
        p.calcType = 'linear'; // default linear (meters, whips, tons)
        p.mLenVal = 6;
        p.wUnitVal = 1;
        p.m2Val = 1;
        p.isSheet = false;

        // Helper to extract numbers
        const extractDim = (regex) => {
            const m = name.match(regex);
            return m ? parseFloat(m[1].replace(',', '.')) : 0;
        };
        
        const extractLen = () => {
            const tokens = name.split(/\s+/);
            for (let i = tokens.length - 1; i >= 0; i--) {
                const t = tokens[i];
                if (t.endsWith('м') && !t.endsWith('мм') && !t.endsWith('см')) {
                    const val = parseFloat(t.replace('м', '').replace(',', '.'));
                    if (!isNaN(val) && val > 0) return val;
                }
                if (t === 'м' && i > 0) {
                    const val = parseFloat(tokens[i-1].replace(',', '.'));
                    if (!isNaN(val) && val > 0) return val;
                }
            }
            return 0;
        }

        // 1. АРМАТУРА
        if (name.includes('арматура')) {
            let d = extractDim(/арматура.*?(\d+(?:[.,]\d+)?)/);
            if (d > 0) {
                p.wUnitVal = (d * d * 0.617) / 100; // Вес 1 метра
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 11.7;
        }
        // 2. ТРУБА КРУГЛАЯ (ВГП, Эсв, Бесшовная)
        else if (name.includes('труба') && !name.includes('профиль') && !name.includes('проф')) {
            // Ожидаем формат Труба ... 57х3.5
            let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
            if (m) {
                let D = parseFloat(m[1].replace(',', '.')); // Наружный диаметр
                let s = parseFloat(m[2].replace(',', '.')); // Толщина стенки
                // ГОСТ вес трубы: M = 3.14 * (D - s) * s * 7.85 / 1000 = 0.02466 * s * (D - s)
                p.wUnitVal = 0.02466 * s * (D - s);
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 12;
        }
        // 3. ТРУБА ПРОФИЛЬНАЯ (Квадратная, Прямоугольная)
        else if (name.includes('труба') && (name.includes('профиль') || name.includes('проф'))) {
            // Ожидаем формат 40х20х2
            let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
            if (m) {
                let A = parseFloat(m[1].replace(',', '.'));
                let B = parseFloat(m[2].replace(',', '.'));
                let s = parseFloat(m[3].replace(',', '.'));
                p.wUnitVal = 0.0157 * s * (A + B - 2.86 * s);
            } else {
                let m2 = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
                if (m2) {
                    let A = parseFloat(m2[1].replace(',', '.'));
                    let s = parseFloat(m2[2].replace(',', '.'));
                    p.wUnitVal = 0.0157 * s * (A + A - 2.86 * s);
                }
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 6;
        }
        // 4. БАЛКА (Двутавр)
        else if (name.includes('балка') || name.includes('двутавр')) {
            let size = name.match(/(\d+)[бкшм]/);
            if (size) {
                let num = parseInt(size[1]);
                p.wUnitVal = num * 1.1; 
            } else {
                p.wUnitVal = 20; 
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 12;
        }
        // 5. ШВЕЛЛЕР
        else if (name.includes('швеллер')) {
            let size = extractDim(/швеллер\s*(\d+(?:[.,]\d+)?)/);
            if (size > 0) {
                p.wUnitVal = size * 0.85; 
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 12;
        }
        // 6. УГОЛОК
        else if (name.includes('уголок')) {
            let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
            if (m) {
                let a = parseFloat(m[1].replace(',', '.'));
                let b = parseFloat(m[2].replace(',', '.'));
                let s = parseFloat(m[3].replace(',', '.'));
                p.wUnitVal = (a + b - s) * s * 0.00785;
            }
            let l = extractLen();
            p.mLenVal = l > 0 ? l : 12;
        }
        // 7. ЛИСТ И ПРОФНАСТИЛ
        else if (name.includes('лист') || name.includes('профнастил') || name.includes('черепица')) {
            p.calcType = 'area';
            p.isSheet = true;
            let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
            if (m) {
                let t = parseFloat(m[1].replace(',', '.'));
                let w = parseFloat(m[2].replace(',', '.'));
                let l = parseFloat(m[3].replace(',', '.'));
                if (t > 50) { 
                    let temp = t; t = l; l = temp; 
                }
                let widthM = (w > 100 ? w / 1000 : w);
                let lengthM = (l > 100 ? l / 1000 : l);
                
                p.m2Val = widthM * lengthM; 
                p.wUnitVal = p.m2Val * t * 7.85; 
            } else {
                p.m2Val = 1;
                p.wUnitVal = 5;
            }
        }

        if (p.specs && Array.isArray(p.specs)) {
            p.specs.forEach(s => {
                let k = (s[0] || '').toLowerCase();
                let v = (s[1] || '').toLowerCase();
                if (k.includes('длина') || k.includes('раскрой')) {
                    let m = v.match(/(\d+(?:[.,]\d+)?)/);
                    if (m) {
                        let val = parseFloat(m[1].replace(',', '.'));
                        if (val > 100) val = val / 1000;
                        if (p.calcType === 'linear') p.mLenVal = val;
                    }
                }
                if (k.includes('вес') || k.includes('масса')) {
                    let m = v.match(/(\d+(?:[.,]\d+)?)/);
                    if (m) {
                        p.wUnitVal = parseFloat(m[1].replace(',', '.'));
                    }
                }
            });
        }
        return p;
    };
})();

// --- PREMIUM IRON WOODMAN GLOBAL MODAL OVERRIDES FOR ALERT & CONFIRM ---
window.confirm = function(message) {
    window.lockScrollGlobal();
    return new Promise((resolve) => {
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6';
        
        const isDestructive = /удалить|безвозвратно|необратимо/i.test(message);
        const title = isDestructive ? 'Подтверждение действия' : 'Системный запрос';
        const icon = isDestructive ? 'warning' : 'help_center';
        
        const isDark = document.documentElement.classList.contains('dark');
        const modalBg = isDark ? 'bg-surface-container-low/95' : 'bg-white/95';
        const textColor = isDark ? 'text-on-surface' : 'text-[#1a1817]';
        const subTextColor = isDark ? 'text-on-surface-variant' : 'text-[#534D4A]';
        const borderColor = isDark ? 'border-outline/10' : 'border-black/5';

        const accentColor = isDestructive ? 'var(--color-error)' : 'var(--color-primary)';
        const btnBase = isDestructive ? 'bg-error text-on-error shadow-lg shadow-error/20' : 'bg-primary text-on-primary shadow-lg shadow-primary/20';

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out modal-backdrop"></div>
            <div class="relative w-full max-w-md ${modalBg} backdrop-blur-2xl border ${borderColor} rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] flex flex-col transform scale-90 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-[2px] opacity-100" style="background: linear-gradient(90deg, transparent, ${accentColor}, transparent);"></div>
                
                <div class="p-10 pb-6 flex flex-col items-center text-center">
                    <div class="w-20 h-20 rounded-3xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'} border flex items-center justify-center mb-8 shadow-2xl relative group">
                        <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <span class="material-symbols-outlined text-4xl relative z-10" style="color: ${accentColor}">${icon}</span>
                    </div>
                    <h3 class="font-headline-md text-2xl font-bold tracking-tight ${textColor} mb-4 uppercase">
                        ${title}
                    </h3>
                    <p class="text-sm ${subTextColor} leading-relaxed font-medium opacity-80 px-4 font-body-md">
                        ${message}
                    </p>
                </div>
                
                <div class="p-10 pt-4 flex items-center justify-center gap-4 shrink-0 font-label-caps">
                    <button type="button" class="flex-1 px-6 py-5 rounded-2xl border ${borderColor} ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 hover:bg-black/10'} transition-all text-[11px] font-bold uppercase tracking-[0.2em] ${subTextColor} cancel-btn active:scale-95">
                        Отмена
                    </button>
                    <button type="button" class="flex-1 px-6 py-5 rounded-2xl ${btnBase} transition-all text-[11px] font-bold uppercase tracking-[0.2em] active:scale-95 confirm-btn">
                        Подтвердить
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.remove('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.remove('opacity-0', 'scale-90');
        });
        
        let closed = false;
        const close = (result) => {
            if (closed) return;
            closed = true;
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('opacity-0', 'scale-90');
            setTimeout(() => {
                modalWrapper.remove();
                window.unlockScrollGlobal();
                resolve(result);
            }, 400);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = () => close(false);
        modalWrapper.querySelector('.cancel-btn').onclick = () => close(false);
        modalWrapper.querySelector('.confirm-btn').onclick = () => close(true);
    });
};

window.activeAlertsGlobal = window.activeAlertsGlobal || new Set();

window.alert = function(message) {
    if (window.activeAlertsGlobal.has(message)) {
        return Promise.resolve();
    }
    window.activeAlertsGlobal.add(message);
    window.lockScrollGlobal();
    return new Promise((resolve) => {
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6';
        
        const isError = /ошибка|error|fail|неверн|пустым/i.test(message);
        const title = isError ? 'Внимание' : 'Инфо-сообщение';
        const icon = isError ? 'priority_high' : 'info';
        
        const isDark = document.documentElement.classList.contains('dark');
        const modalBg = isDark ? 'bg-surface-container-low/95' : 'bg-white/95';
        const textColor = isDark ? 'text-on-surface' : 'text-[#1a1817]';
        const subTextColor = isDark ? 'text-on-surface-variant' : 'text-[#534D4A]';
        const borderColor = isDark ? 'border-outline/10' : 'border-black/5';

        const accentColor = isError ? 'var(--color-error)' : 'var(--color-primary)';
        const btnBase = isError ? 'bg-error text-on-error shadow-lg shadow-error/20' : 'bg-primary text-on-primary shadow-lg shadow-primary/20';

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out modal-backdrop"></div>
            <div class="relative w-full max-w-md ${modalBg} backdrop-blur-2xl border ${borderColor} rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] flex flex-col transform scale-90 opacity-0 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-[2px] opacity-100" style="background: linear-gradient(90deg, transparent, ${accentColor}, transparent);"></div>
                
                <div class="p-10 pb-6 flex flex-col items-center text-center">
                    <div class="w-20 h-20 rounded-3xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'} border flex items-center justify-center mb-8 shadow-2xl">
                        <span class="material-symbols-outlined text-4xl" style="color: ${accentColor}">${icon}</span>
                    </div>
                    <h3 class="font-headline-md text-2xl font-bold tracking-tight ${textColor} mb-4 uppercase">
                        ${title}
                    </h3>
                    <p class="text-sm ${subTextColor} leading-relaxed font-medium opacity-80 px-4 font-body-md">
                        ${message}
                    </p>
                </div>
                
                <div class="p-10 pt-4 flex items-center justify-center shrink-0 font-label-caps">
                    <button type="button" class="w-full px-6 py-5 rounded-2xl ${btnBase} transition-all text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl active:scale-95 alert-btn">
                        Понятно
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalWrapper);
        
        requestAnimationFrame(() => {
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.remove('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.remove('opacity-0', 'scale-90');
        });
        
        let closed = false;
        const close = () => {
            if (closed) return;
            closed = true;
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('opacity-0', 'scale-90');
            setTimeout(() => {
                modalWrapper.remove();
                window.activeAlertsGlobal.delete(message);
                if (window.activeAlertsGlobal.size === 0) {
                    window.unlockScrollGlobal();
                }
                resolve();
            }, 400);
        };
        
        modalWrapper.querySelector('.modal-backdrop').onclick = close;
        modalWrapper.querySelector('.alert-btn').onclick = close;
    });
};

window.showToast = function(message, type = 'success', title = null) {
    if (!window.activeToastsMessages) window.activeToastsMessages = new Set();
    if (window.activeToastsMessages.has(message)) return;
    window.activeToastsMessages.add(message);

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
    let iconColor = 'text-green-500';
    let iconBg = 'bg-green-500/10 border-green-500/20';
    let borderColor = 'border-l-green-500';
    let defaultTitle = 'Успешно';

    if (type === 'error') {
        icon = 'error';
        iconColor = 'text-error';
        iconBg = 'bg-error/10 border-error/20';
        borderColor = 'border-l-error';
        defaultTitle = 'Ошибка';
    } else if (type === 'info') {
        icon = 'info';
        iconColor = 'text-primary';
        iconBg = 'bg-primary/10 border-primary/20';
        borderColor = 'border-l-primary';
        defaultTitle = 'Информация';
    } else if (type === 'warning') {
        icon = 'warning';
        iconColor = 'text-orange-500';
        iconBg = 'bg-orange-500/10 border-orange-500/20';
        borderColor = 'border-l-orange-500';
        defaultTitle = 'Внимание';
    }

    const toastTitle = title || defaultTitle;

    const toastEl = document.createElement('div');
    toastEl.className = `pointer-events-auto bg-surface-container-highest/95 backdrop-blur-md border border-outline/10 border-l-4 ${borderColor} rounded-2xl p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] flex items-start gap-3.5 transform translate-x-full opacity-0 transition-all duration-500 ease-out`;
    
    toastEl.innerHTML = `
        <div class="w-10 h-10 rounded-xl ${iconBg} border flex items-center justify-center ${iconColor} shrink-0 shadow-inner mt-0.5">
            <span class="material-symbols-outlined text-xl">${icon}</span>
        </div>
        <div class="flex-1 min-w-0 pr-1">
            <h4 class="font-headline-md text-sm font-bold text-on-surface tracking-tight truncate font-label-caps uppercase tracking-widest">
                ${toastTitle}
            </h4>
            <p class="text-xs text-on-surface-variant opacity-90 mt-1 leading-relaxed break-words font-body-md">
                ${message}
            </p>
        </div>
        <button type="button" class="text-on-surface-variant hover:text-on-surface opacity-50 hover:opacity-100 transition-opacity p-1 -mt-1 -mr-1 toast-close-btn">
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
        setTimeout(() => {
            window.activeToastsMessages.delete(message);
            toastEl.remove();
        }, 500);
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
        modalWrapper.className = 'fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6';
        
        const cardsHtml = options.map(opt => {
            const isSelected = opt.value === currentStatus;
            const borderClass = isSelected ? `border-primary bg-primary/10` : 'border-outline/10 bg-surface-container-lowest hover:bg-surface-container hover:border-outline/20';
            const shadowClass = isSelected ? `shadow-lg shadow-primary/20` : '';
            return `
                <button type="button" data-value="${opt.value}" class="status-option-card w-full p-4 rounded-2xl border ${borderClass} ${shadowClass} flex items-center gap-4 transition-all active:scale-95 text-left group font-label-caps">
                    <div class="w-12 h-12 rounded-xl bg-surface-container border border-outline/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm" style="color: ${opt.color}; border-color: ${opt.color}40;">
                        <span class="material-symbols-outlined text-2xl">${opt.icon || 'radio_button_unchecked'}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-bold tracking-tight uppercase" style="color: ${opt.color};">${opt.label}</span>
                            ${isSelected ? `<span class="material-symbols-outlined text-sm animate-pulse" style="color: ${opt.color};">task_alt</span>` : ''}
                        </div>
                        <p class="text-[10px] text-on-surface-variant opacity-80 leading-relaxed truncate font-medium">${opt.desc || ''}</p>
                    </div>
                </button>
            `;
        }).join('');

        modalWrapper.innerHTML = `
            <div class="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-150 modal-backdrop"></div>
            <div class="relative w-full max-w-md bg-surface-container-highest border border-outline/10 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col transform scale-95 opacity-0 transition-all duration-500 ease-out min-h-0 overflow-hidden modal-content">
                <div class="absolute top-0 left-0 right-0 h-1 opacity-80 background-gradient" style="background: linear-gradient(90deg, transparent, var(--color-primary), transparent);"></div>
                
                <div class="p-8 pb-6 flex items-center justify-between border-b border-outline/5 shrink-0 bg-surface-container">
                    <div>
                        <h3 class="font-headline-md text-xl font-bold tracking-tight text-on-surface font-label-caps uppercase tracking-widest">
                            ${title}
                        </h3>
                        <p class="text-xs text-on-surface-variant opacity-60 mt-1 font-body-md">Выберите один из доступных этапов</p>
                    </div>
                    <button type="button" class="w-10 h-10 rounded-full bg-surface-variant hover:bg-primary/10 border border-outline/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cancel-icon-btn active:scale-95 shrink-0">
                        <span class="material-symbols-outlined text-base">close</span>
                    </button>
                </div>
                
                <div class="p-8 py-6 flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0 max-h-[60vh] bg-background">
                    ${cardsHtml}
                </div>
                
                <div class="p-8 pt-4 flex items-center justify-center bg-surface-container border-t border-outline/10 shrink-0">
                    <button type="button" class="w-full px-6 py-4 rounded-2xl border border-outline/10 hover:bg-surface-variant transition-all text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary cancel-btn active:scale-95 font-label-caps">
                        Отмена
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
        
        let closed = false;
        const close = (result) => {
            if (closed) return;
            closed = true;
            const backdrop = modalWrapper.querySelector('.modal-backdrop');
            if (backdrop) backdrop.classList.add('opacity-0');
            const content = modalWrapper.querySelector('.modal-content');
            if (content) content.classList.add('opacity-0', 'scale-95');
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

// --- UI Refinements: Reduced Blur, Scroll Locking, Compact Modals ---
;(function() {
    const style = document.createElement('style');
    style.id = 'ui-refinement-overrides';
    style.innerHTML = `
        /* Reduced blur in dark mode for better visibility of shapes */
        html.dark .liquid-glass,
        html.dark .glass-panel,
        html.dark [class*="backdrop-blur-"] {
            backdrop-filter: blur(12px) saturate(160%) !important;
            -webkit-backdrop-filter: blur(12px) saturate(160%) !important;
        }

        /* Strict scroll lock for mobile popups */
        body.scroll-locked {
            overflow: hidden !important;
            touch-action: none !important;
            -webkit-overflow-scrolling: none !important;
        }

        /* Refined Toast/Push Notification Animation */
        #iron-toast-container {
            z-index: 9999 !important;
        }
        
        @keyframes iron-toast-in {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 768px) {
            #iron-toast-container {
                left: 50% !important;
                right: auto !important;
                transform: translateX(-50%) !important;
                bottom: 2rem !important;
                width: 90% !important;
                max-width: 400px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }
        }
    `;
    document.head.appendChild(style);
})();

// ─── CENTRALIZED SCROLL LOCK ─────────────────────────────────────────────────
// Uses a reference counter so multiple popups don't conflict
;(function() {
    let _lockCount = 0;
    let _savedScrollY = 0;

    window.lockScrollGlobal = function() {
        _lockCount++;
        if (_lockCount === 1) {
            _savedScrollY = window.scrollY;
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            if (scrollBarWidth > 0) {
                document.body.style.paddingRight = scrollBarWidth + 'px';
            }
            document.body.style.overflow = 'hidden';
            document.body.classList.add('scroll-locked');
        }
    };

    window.unlockScrollGlobal = function() {
        if (_lockCount <= 0) return;
        _lockCount--;
        if (_lockCount === 0) {
            document.body.classList.remove('scroll-locked');
            document.body.style.paddingRight = '';
            document.body.style.overflow = '';
        }
    };

    window.forceUnlockScrollGlobal = function() {
        _lockCount = 0;
        document.body.classList.remove('scroll-locked');
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
    };

    // Inject scroll-lock CSS once
    const style = document.createElement('style');
    style.textContent = `
        body.scroll-locked {
            overflow: hidden !important;
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
    if (!payload) return true;
    return false;
};

window.syncAuthStorageAndCookiesGlobal = function() {
    const cookieToken = window.getCookieGlobal('metal_token');
    const cookieUser = window.getCookieGlobal('metal_user');
    const cookieRemember = window.getCookieGlobal('metal_remember');
    const storageToken = localStorage.getItem('metal_token');
    const storageUser = localStorage.getItem('metal_user');
    const storageRemember = localStorage.getItem('metal_remember');

    if (cookieToken && !storageToken) {
        localStorage.setItem('metal_token', cookieToken);
        if (cookieUser) localStorage.setItem('metal_user', cookieUser);
        if (cookieRemember) localStorage.setItem('metal_remember', cookieRemember);
    } else if (storageToken && !cookieToken) {
        const remember = storageRemember === 'true';
        window.setCookieGlobal('metal_token', storageToken, remember ? 365 : null);
        if (storageUser) window.setCookieGlobal('metal_user', storageUser, remember ? 365 : null);
        window.setCookieGlobal('metal_remember', storageRemember || 'false', remember ? 365 : null);
    }

    const activeToken = storageToken || cookieToken;
    if (activeToken && window.isTokenExpiredGlobal && window.isTokenExpiredGlobal(activeToken)) {
        const remember = (storageRemember || cookieRemember) === 'true';
        if (!remember) {
            localStorage.removeItem('metal_token');
            localStorage.removeItem('metal_user');
            localStorage.removeItem('metal_orders');
            localStorage.removeItem('metal_remember');
            localStorage.removeItem('metal_session_start');
            localStorage.removeItem('metal_last_activity');
            window.eraseCookieGlobal('metal_token');
            window.eraseCookieGlobal('metal_user');
            window.eraseCookieGlobal('metal_remember');
            window.eraseCookieGlobal('metal_session_start');
            window.eraseCookieGlobal('metal_last_activity');
        }
    }
};

(function() {
    const preloaderStyles = `
        #globalPreloader {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(21, 19, 17, 0.8) !important;
            backdrop-filter: blur(25px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
            box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.02), inset 0 0 40px rgba(202, 112, 147, 0.02) !important;
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
            border: 1px solid rgba(202, 112, 147, 0.05);
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
            background: rgba(202, 112, 147, 0.03);
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex; align-items: center; justify-content: center;
            border: 1px solid rgba(202, 112, 147, 0.2);
            animation: preloader-pulse 2s ease-in-out infinite;
            position: relative; overflow: hidden;
        }
        .loader-hex::before {
            content: ''; position: absolute; top: -100%; left: 0; width: 100%; height: 200%;
            background: linear-gradient(to bottom, transparent, rgba(202, 112, 147, 0.3), transparent);
            animation: preloader-scan 3s ease-in-out infinite;
        }
        .loader-logo {
            width: 64px; height: 64px; object-fit: cover; border-radius: 50%;
            filter: drop-shadow(0 0 15px rgba(202, 112, 147, 0.4));
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
            width: 200px; height: 1px; background: rgba(202, 112, 147, 0.1);
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
            0%, 100% { transform: scale(1); border-color: rgba(202, 112, 147, 0.2); }
            50% { transform: scale(1.02); border-color: rgba(202, 112, 147, 0.5); }
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
            background-color: rgba(250, 250, 250, 0.75) !important;
            backdrop-filter: blur(25px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(25px) saturate(200%) !important;
            box-shadow: inset 0 0 80px rgba(255, 255, 255, 0.5), inset 0 0 40px rgba(202, 112, 147, 0.03) !important;
        }
        html.light .loader-ring, html:not(.dark) .loader-ring {
            border-color: rgba(202, 112, 147, 0.08) !important;
        }
        html.light .loader-ring::after, html:not(.dark) .loader-ring::after {
            border-top-color: #ca7093 !important;
        }
        html.light .loader-hex, html:not(.dark) .loader-hex {
            background: rgba(202, 112, 147, 0.03) !important;
            border-color: rgba(202, 112, 147, 0.2) !important;
        }
        html.light .loader-hex::before, html:not(.dark) .loader-hex::before {
            background: linear-gradient(to bottom, transparent, rgba(202, 112, 147, 0.3), transparent) !important;
        }
        html.light .loader-logo, html:not(.dark) .loader-logo {
            filter: drop-shadow(0 0 15px rgba(202, 112, 147, 0.3)) !important;
        }
        html.light .loader-text, html:not(.dark) .loader-text {
            color: #3B3B3B !important;
            opacity: 0.8 !important;
        }
        html.light .loader-progress-track, html:not(.dark) .loader-progress-track {
            background: rgba(202, 112, 147, 0.1) !important;
        }
        html.light .loader-progress-bar, html:not(.dark) .loader-progress-bar {
            background: #ca7093 !important;
            box-shadow: 0 0 10px rgba(202, 112, 147, 0.5) !important;
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

    // Add Font Awesome for social icons
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(faLink);
    }

    window.addEventListener('load', dismissPreloader);

    // Safety fallback: if some assets (like Google Fonts or Tailwind CDN) are blocked/throttled,
    // don't lock the user on a blank preloader screen forever.
    setTimeout(dismissPreloader, 1500);    // Auto-attach masks to any relevant inputs
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
    
    const isOpen = panel.classList.contains('scale-100');
    
    if (isOpen) {
        panel.classList.remove('scale-100', 'opacity-100');
        panel.classList.add('scale-95', 'opacity-0');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
        drawer.classList.add('pointer-events-none');
        setTimeout(() => { 
            window.unlockScrollGlobal();
        }, 300);
    } else {
        drawer.classList.remove('pointer-events-none');
        setTimeout(() => {
            panel.classList.remove('scale-95', 'opacity-0');
            panel.classList.add('scale-100', 'opacity-100');
            overlay.classList.remove('opacity-0');
            overlay.style.pointerEvents = 'auto';
            window.lockScrollGlobal();
            if (window.renderCartDrawerItems) window.renderCartDrawerItems();
        }, 10);
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
            drawer.style.display = 'none';
            window.unlockScrollGlobal(); // Restore scroll AFTER animation
        }, 600);
    } else {
        const token = localStorage.getItem('metal_token');
        if (token && (!window.isTokenExpiredGlobal || !window.isTokenExpiredGlobal(token))) {
            if (!window.location.pathname.includes('/cabinet')) {
                window.location.href = '/cabinet/';
            }
            return;
        }

        drawer.style.display = 'block';
        drawer.offsetHeight; // Force reflow
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
                transition: opacity 0.3s ease, visibility 0.3s ease;
                background: #1d1b19 !important;
                border: 2px solid #964551 !important;
                box-shadow: 0 15px 45px rgba(150, 69, 81, 0.4) !important;
                border-radius: 1.25rem !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            #scrollTopBtnGlobal.visible {
                opacity: 1;
                visibility: visible;
                pointer-events: auto;
            }
            #scrollTopBtnGlobal span {
                color: #964551 !important;
                transition: color 0.2s ease !important;
                transform: none !important;
            }
            #scrollTopBtnGlobal:hover span {
                color: #e5e7eb !important;
            }
            html.light #scrollTopBtnGlobal {
                background: #ffffff !important;
                border-color: #ca7093 !important;
                box-shadow: 0 15px 45px rgba(202, 112, 147, 0.2) !important;
            }
            html.light #scrollTopBtnGlobal span {
                color: #ca7093 !important;
            }
            html.light #scrollTopBtnGlobal:hover span {
                color: #d1d5db !important;
            }
            /* --- iPad and Tablet Responsiveness (768px - 1024px) --- */
            @media (max-width: 1024px) {
                :root { 
                    --header-height: 70px;
                }
                .font-display-xl {
                    font-size: clamp(2rem, 5vw, 3.5rem) !important;
                    line-height: 1.1 !important;
                }
                .font-headline-lg {
                    font-size: clamp(1.75rem, 4vw, 2.5rem) !important;
                }
                section {
                    padding-top: 3.5rem !important;
                    padding-bottom: 3.5rem !important;
                    min-height: auto !important;
                    height: auto !important;
                    overflow: visible !important;
                }
                section#hero {
                    padding-top: 0 !important;
                    padding-bottom: 0 !important;
                    min-height: calc(100dvh - var(--header-height)) !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: center !important;
                }
                .max-w-container-max {
                    padding-left: 20px !important;
                    padding-right: 20px !important;
                }
                /* Grid adjustments */
                .grid {
                    gap: 1.25rem !important;
                }
                .asymmetric-grid {
                    gap: 1.5rem !important;
                    display: flex !important;
                    flex-direction: column !important;
                }
                .asymmetric-grid > div {
                    grid-column: span 12 / span 12 !important;
                    width: 100% !important;
                }
                /* Product and fleet cards */
                .product-card, .fleet-card {
                    padding: 1.25rem !important;
                    height: auto !important;
                }
                .product-card img, .fleet-card img {
                    max-height: 180px !important;
                    object-fit: contain !important;
                }
                /* Footer responsiveness */
                #globalFooter .grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 2.5rem !important;
                }
                /* Forms on tablet */
                #cta-footer-merged .grid {
                    grid-template-columns: 1fr !important;
                    gap: 2rem !important;
                }
                /* Back to top button size for tablet */
                #scrollTopBtnGlobal {
                    width: 3.5rem !important;
                    height: 3.5rem !important;
                }
            }
                    grid-column: span 12 / span 12 !important;
                    width: 100% !important;
                }
                /* Product and fleet cards */
                .product-card, .fleet-card {
                    padding: 1.25rem !important;
                    height: auto !important;
                }
                /* Footer responsiveness */
                #globalFooter .grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                    gap: 2rem !important;
                }
                /* Forms on tablet */
                #cta-footer-merged .grid {
                    grid-template-columns: 1fr !important;
                    gap: 2rem !important;
                }
                /* News and other sections */
                .news-grid {
                    grid-template-columns: repeat(2, 1fr) !important;
                }
            }
            /* --- PREMIUM PINK SCROLLBAR --- */
            ::-webkit-scrollbar { width: 8px; height: 8px; }
            ::-webkit-scrollbar-track { background: #151311; }
            ::-webkit-scrollbar-thumb { background: #ca7093; border-radius: 10px; border: 2px solid #151311; }
            ::-webkit-scrollbar-thumb:hover { background: #964551; }
            * { scrollbar-width: thin; scrollbar-color: #ca7093 #151311; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(202, 112, 147, 0.3); }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #964551; }

            /* --- FLUID HEADER LOGO & TYPOGRAPHY --- */
            #globalHeader .logo-img-container img {
                width: 36px;
                height: 36px;
                transition: all 0.3s ease;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 13px;
                transition: all 0.3s ease;
            }
            @media (min-width: 360px) {
                #globalHeader .logo-img-container img {
                    width: 40px;
                    height: 40px;
                }
                #globalHeader .logo-text-part-1,
                #globalHeader .logo-text-part-2 {
                    font-size: 15px;
                }
            }
            @media (min-width: 400px) {
                #globalHeader .logo-img-container img {
                    width: 44px;
                    height: 44px;
                }
                #globalHeader .logo-text-part-1,
                #globalHeader .logo-text-part-2 {
                    font-size: 17px;
                }
            }
            @media (min-width: 480px) {
                #globalHeader .logo-img-container img {
                    width: 48px;
                    height: 48px;
                }
                #globalHeader .logo-text-part-1,
                #globalHeader .logo-text-part-2 {
                    font-size: 18px;
                }
            }
            @media (min-width: 768px) {
                #globalHeader .logo-img-container img {
                    width: 56px;
                    height: 56px;
                }
                #globalHeader .logo-text-part-1,
                #globalHeader .logo-text-part-2 {
                    font-size: 20px;
                }
            }
            @media (min-width: 1024px) {
                #globalHeader .logo-img-container img {
                    width: 64px;
                    height: 64px;
                }
                #globalHeader .logo-text-part-1,
                #globalHeader .logo-text-part-2 {
                    font-size: 24px;
                }
            }
            @media (max-width: 359px) and (min-width: 330px) {
                #globalHeader .logo-img-container {
                    display: none !important;
                }
            }
            @media (max-width: 329px) {
                #globalHeader .logo-text-container {
                    display: none !important;
                }
            }

            /* --- PREMIUM ANIMATED THEME TOGGLER --- */
            .theme-toggle-btn {
                background: none;
                border: none;
                cursor: pointer;
                padding: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--color-on-surface);
                border-radius: 9999px;
                outline: none;
                -webkit-tap-highlight-color: transparent;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
            #globalHeader .theme-toggle-btn {
                display: none;
            }
            @media (min-width: 768px) {
                #globalHeader .theme-toggle-btn {
                    display: flex;
                }
            }

            .theme-toggle-svg {
                transform-origin: center;
                transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                overflow: visible;
            }
            .theme-toggle-svg .center-circle {
                transition: r 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .theme-toggle-svg .mask-circle {
                transition: cx 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), cy 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            }
            .theme-toggle-svg .rays-group {
                transform-origin: center;
                transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            }

            /* Light theme state: center circle is smaller (5px), mask is shifted out, rays are visible */
            html.light .theme-toggle-svg {
                transform: rotate(0deg);
            }
            html.light .theme-toggle-svg .center-circle {
                r: 5px !important;
            }
            html.light .theme-toggle-svg .mask-circle {
                cx: 33px !important;
                cy: 0px !important;
            }
            html.light .theme-toggle-svg .rays-group {
                transform: scale(1) rotate(0deg) !important;
                opacity: 1 !important;
            }

            /* Dark theme state: center circle is larger (9px), mask carves crescent, rays are hidden */
            html.dark .theme-toggle-svg {
                transform: rotate(270deg);
            }
            html.dark .theme-toggle-svg .center-circle {
                r: 9px !important;
            }
            html.dark .theme-toggle-svg .mask-circle {
                cx: 17px !important;
                cy: 8px !important;
            }
            html.dark .theme-toggle-svg .rays-group {
                transform: scale(0) rotate(-30deg) !important;
                opacity: 0 !important;
            }
        </style>
        `;
        const adminFloatingBtns = `
        <button id="floatingChatBtnGlobal" onclick="openGlobalChatDrawerGlobal()" class="fixed bottom-8 right-[104px] z-[5000] w-14 h-14 bg-[#964551] border border-[#964551]/30 text-[#c7c5c5] flex items-center justify-center hover:bg-white transition-all shadow-2xl shadow-[#964551]/30 group rounded-2xl">
            <span class="material-symbols-outlined text-[28px] group-hover:scale-110 transition-transform">forum</span>
            <span id="floatingChatBadgeGlobal" class="absolute -top-2.5 -right-2.5 w-8 h-8 bg-[#ca7093] text-white text-[11px] font-black rounded-full flex items-center justify-center hidden border-2 border-[#1d1b19] shadow-md animate-pulse">!</span>
        </button>

        <button id="scrollTopBtnGlobal" onclick="scrollToTopGlobal()" class="fixed bottom-8 right-8 z-[5000] w-14 h-14 bg-[#1d1b19] border border-[#964551] text-[#c7c5c5] flex items-center justify-center shadow-2xl shadow-[#964551]/20 rounded-2xl">
            <span class="material-symbols-outlined text-[28px]">arrow_upward</span>
        </button>
        `;
        document.head.insertAdjacentHTML('beforeend', style);
        document.body.insertAdjacentHTML('beforeend', adminFloatingBtns);
    }

    if (!isAdmin) {
        const headerHtml = `
    <div id="scrollProgressGlobal"></div>
    <nav id="globalHeader" class="fixed top-0 w-full z-[1000] bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
        <div class="flex justify-between items-center h-20 px-4 md:px-margin-edge w-full max-w-container-max mx-auto">
            <div class="flex items-center gap-2 min-[360px]:gap-3 md:gap-4 group">
                <button id="mobileMenuBtnGlobal" onclick="toggleMobileMenuGlobal()" class="md:hidden material-symbols-outlined text-on-surface hover:text-primary transition-colors">menu</button>
                <a class="logo-link-hover-effect flex items-center gap-1.5 min-[360px]:gap-2 md:gap-4 whitespace-nowrap no-underline" href="/">
                    <div class="relative logo-img-container shrink-0">
                        <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 logo-bg-glow transition-opacity duration-500"></div>
                        <img src="/images/logo_icon.png" alt="Железный Дровосек" class="logo-img object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(202, 112, 147,0.4)]">
                    </div>
                    <div class="logo-text-container flex flex-col items-start leading-none">
                        <span class="logo-text-part-1 font-display-xl leading-tight tracking-tight text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="logo-text-part-2 font-display-xl leading-tight tracking-tight text-primary font-semibold uppercase">ДРОВОСЕК</span>
                    </div>
                </a>
            </div>
             <div class="hidden md:flex items-center gap-4 lg:gap-8 mx-auto whitespace-nowrap">
                <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-500 ease-out no-underline hidden lg:block" href="/">ГЛАВНАЯ</a>
                <div class="catalog-menu-wrapper relative" id="catalogMenuWrapperGlobal">
                    <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-500 ease-out flex items-center gap-1 cursor-pointer no-underline" id="catalogBtnGlobal" href="/catalog-select">КАТАЛОГ <span class="material-symbols-outlined text-[18px]">expand_more</span></a>
                </div>
                <div class="about-menu-wrapper relative h-full flex items-center" id="aboutMenuWrapperGlobal">
                    <a class="nav-link font-label-caps text-[13px] text-on-surface-variant hover:text-primary transition-all duration-500 ease-out no-underline flex items-center gap-1 cursor-pointer" id="aboutBtnGlobal" href="/about.html">О КОМПАНИИ <span class="material-symbols-outlined text-[18px]">expand_more</span></a>
                </div>
            </div>
            <div class="flex items-center gap-1 md:gap-3 lg:gap-6 whitespace-nowrap">
                <!-- Search Button -->
                <button id="globalSearchBtn" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-500 ease-out p-2 rounded-full hover:bg-white/5 active:scale-95" onclick="toggleSearchGlobal()">search</button>

                <div class="relative group">
                    <button onclick="toggleCartDrawerGlobal()" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-500 ease-out p-2 rounded-full hover:bg-white/5 active:scale-95 relative no-underline flex items-center">
                        shopping_cart
                        <span id="cartBadgeGlobal" class="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full hidden">0</span>
                    </button>
                </div>
                <button id="authBtnGlobal" onclick="toggleAuthModalGlobal()" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-500 ease-out p-2 rounded-full hover:bg-white/5 active:scale-95">person</button>
                <!-- Animated Theme Toggler -->
                <button class="theme-toggle-btn group hidden md:flex ml-3 lg:ml-5" onclick="window.toggleThemeGlobal()" aria-label="Toggle theme">
                    <svg class="theme-toggle-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="overflow: visible;">
                        <mask id="theme-mask-header">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            <circle class="mask-circle" cx="33" cy="0" r="9" fill="black" />
                        </mask>
                        <circle class="center-circle" cx="12" cy="12" fill="currentColor" stroke="none" mask="url(#theme-mask-header)" r="5" />
                        <g class="rays-group" style="transform-origin: 12px 12px;">
                            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" />
                            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" />
                            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" />
                            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" />
                            <line x1="5.64" y1="5.64" x2="4.22" y2="4.22" stroke="currentColor" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" />
                            <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" stroke="currentColor" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" />
                        </g>
                    </svg>
                </button>
            </div>

        </div>
    </nav>

    <div id="mobileMenuDrawerGlobal" class="fixed inset-0 z-[4000] pointer-events-none overflow-hidden md:hidden">
        <div id="mobileMenuOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-150 pointer-events-none" onclick="toggleMobileMenuGlobal()"></div>
        <div id="mobileMenuPanelGlobal" class="absolute top-0 left-0 w-[85%] max-w-sm h-full bg-surface/90 backdrop-blur-[40px] border-r border-white/10 -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto p-8 flex flex-col">
            <header class="flex justify-between items-center mb-10">
                <a href="/" class="logo-link-hover-effect flex items-center gap-4 leading-none no-underline">
                    <div class="relative logo-img-container">
                        <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 logo-bg-glow transition-opacity duration-500"></div>
                        <img src="/images/logo_icon.png" alt="Logo" class="logo-img w-14 h-14 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_15px_rgba(202, 112, 147,0.3)]">
                    </div>
                    <div class="flex flex-col items-start leading-none">
                        <span class="logo-text-part-1 font-display-xl text-[20px] text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="logo-text-part-2 font-display-xl text-[20px] text-primary font-semibold uppercase">ДРОВОСЕК</span>
                    </div>
                </a>
                <button onclick="toggleMobileMenuGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5">close</button>
            </header>
            
            <nav class="flex-1 flex flex-col gap-6 mt-4 pl-2 overflow-y-auto custom-scrollbar">
                                <button class="text-lg font-display-xl uppercase text-left hover:text-primary transition-all tracking-tight border-b border-white/5 pb-3 no-underline text-on-surface flex justify-between items-center group w-full" onclick="toggleMobileCatalogGlobal(); toggleMobileMenuGlobal();">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-primary text-xl">grid_view</span>
                        КАТАЛОГ
                    </div>
                    <span class="material-symbols-outlined text-primary transition-transform duration-500 ease-out">chevron_right</span>
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

                <div class="space-y-4 pt-2 border-t border-white/5">
                    <h3 class="text-[10px] font-label-caps text-on-surface-variant tracking-[0.2em] uppercase opacity-40 mb-4 px-1">НОВОСТИ И СЕРВИСЫ</h3>
                    <div class="flex flex-col gap-5 pl-1">
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/calculator">
                            <span class="material-symbols-outlined text-primary text-lg">calculate</span>
                            Калькулятор веса
                        </a>
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/services">
                            <span class="material-symbols-outlined text-primary text-lg">content_cut</span>
                            Услуги резки
                        </a>
                        <a class="text-md font-display-xl uppercase hover:text-primary transition-all no-underline text-on-surface flex items-center gap-3" href="/news">
                            <span class="material-symbols-outlined text-primary text-lg">newspaper</span>
                            Новости
                        </a>
                    </div>
                </div>
            </nav>

            <footer class="mt-auto pt-8 border-t border-white/5">
               <div class="flex items-center justify-between mb-8 p-4 bg-white/5 rounded-2xl">
                   <span class="font-label-caps text-[11px] tracking-widest text-on-surface opacity-60">ТЕМА ОФОРМЛЕНИЯ</span>
                   <button class="theme-toggle-btn" onclick="window.toggleThemeGlobal()" aria-label="Toggle theme">
                       <svg class="theme-toggle-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="overflow: visible;">
                           <mask id="theme-mask-mobile">
                               <rect x="0" y="0" width="100%" height="100%" fill="white" />
                               <circle class="mask-circle" cx="33" cy="0" r="9" fill="black" />
                           </mask>
                           <circle class="center-circle" cx="12" cy="12" fill="currentColor" stroke="none" mask="url(#theme-mask-mobile)" r="5" />
                           <g class="rays-group" style="transform-origin: 12px 12px;">
                               <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" />
                               <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" />
                               <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" />
                               <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" />
                               <line x1="5.64" y1="5.64" x2="4.22" y2="4.22" stroke="currentColor" />
                               <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" />
                               <line x1="5.64" y1="18.36" x2="4.22" y2="19.78" stroke="currentColor" />
                               <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" />
                           </g>
                       </svg>
                   </button>
               </div>
               <div class="flex gap-4 mb-6">
                    <a href="https://yandex.ru/maps/org/zhelezny_drovosek/183141073087?si=8qtpxb4kcht8cpvw3yya04k9y8" target="_blank" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all no-underline">
                        <span class="font-bold text-lg">Я</span>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all no-underline">
                        <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.896-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                    <a href="tel:+78129825320" class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all no-underline">
                        <span class="material-symbols-outlined text-lg">call</span>
                    </a>
                </div>
                <div class="text-[10px] text-on-surface-variant font-label-caps tracking-widest opacity-50">© 2024 ЖЕЛЕЗНЫЙ ДРОВОСЕК</div>
            </footer>
        </div>
    </div>

    <!-- Mobile Catalog Popup -->
    <div id="mobileCatalogDrawerGlobal" class="fixed inset-0 z-[4100] pointer-events-none overflow-hidden md:hidden">
        <div id="mobileCatalogOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-150 pointer-events-none" onclick="toggleMobileCatalogGlobal()"></div>
        <div id="mobileCatalogPanelGlobal" class="absolute top-0 right-0 w-[90%] max-w-sm h-full bg-surface/95 backdrop-blur-[40px] border-l border-white/10 translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto p-6 flex flex-col">
            <header class="flex justify-between items-center mb-6">
                <div class="font-display-xl text-[18px] text-primary font-bold uppercase tracking-widest">КАТАЛОГ ТОВАРОВ</div>
                <button onclick="toggleMobileCatalogGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5">close</button>
            </header>
            
            <div class="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div class="space-y-8 pb-10">
                    <!-- Metal Categories -->
                    <div class="space-y-4">
                        <h3 class="text-[10px] font-label-caps text-on-surface-variant tracking-[0.2em] uppercase opacity-40 mb-4 px-1">МЕТАЛЛОПРОКАТ</h3>
                        
                        <!-- Чёрный металлопрокат -->
                        <div class="burger-sub-accordion">
                            <button class="w-full flex items-center justify-between text-sm font-bold uppercase text-on-surface hover:text-primary no-underline transition-all pb-2" onclick="this.parentElement.classList.toggle('is-open')">
                                <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] opacity-50">construction</span>
                                    Чёрный металлопрокат
                                </div>
                                <span class="material-symbols-outlined text-[16px] text-primary transition-transform duration-500 ease-out burger-sub-arrow">expand_more</span>
                            </button>
                            <div class="burger-sub-accordion-body">
                                <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2 pt-2 pb-3">
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Арматура" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Арматура</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Композитная арматура" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Композитная арматура</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Балка двутавровая" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Балка двутавровая</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Закладные детали" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Закладные детали</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Круг" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Круг</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Квадрат" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Квадрат</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Лист стальной" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Лист стальной</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Лягушка арматурная" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Лягушка арматурная</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Полоса" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Полоса</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Просечно-вытяжной лист" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Просечно-вытяжной лист</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Проволока" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Проволока</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Сетка стальная" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Сетка стальная</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Швеллер" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Швеллер</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы бесшовные" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы бесшовные</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы электросварные" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы электросварные</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы профильные" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы профильные</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы ВГП" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы ВГП</a>
                                    <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Уголок" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Уголок</a>
                                </div>
                            </div>
                        </div>

                        <!-- Нержавеющая сталь -->
                        <div class="burger-sub-accordion">
                            <button class="w-full flex items-center justify-between text-sm font-bold uppercase text-on-surface hover:text-primary no-underline transition-all pb-2" onclick="this.parentElement.classList.toggle('is-open')">
                                <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] opacity-50">shield</span>
                                    Нержавеющая сталь
                                </div>
                                <span class="material-symbols-outlined text-[16px] text-primary transition-transform duration-500 ease-out burger-sub-arrow">expand_more</span>
                            </button>
                            <div class="burger-sub-accordion-body">
                                <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2 pt-2 pb-3">
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Сварочные материалы нержавеющие" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Сварочные материалы</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Круг нержавеющий" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Круг нержавеющий</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Квадрат нержавеющий" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Квадрат нержавеющий</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Лист нержавеющий" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Лист нержавеющий</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Полоса нержавеющая" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Полоса нержавеющая</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Шестигранник нержавеющий" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Шестигранник нержавеющий</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Трубы нержавеющие" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы нержавеющие</a>
                                    <a href="/catalog/?pcat=Нержавеющая сталь&cat=Уголок нержавеющий" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Уголок нержавеющий</a>
                                </div>
                            </div>
                        </div>

                        <!-- Специальные стали -->
                        <div class="burger-sub-accordion">
                            <button class="w-full flex items-center justify-between text-sm font-bold uppercase text-on-surface hover:text-primary no-underline transition-all pb-2" onclick="this.parentElement.classList.toggle('is-open')">
                                <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] opacity-50">workspace_premium</span>
                                    Специальные стали
                                </div>
                                <span class="material-symbols-outlined text-[16px] text-primary transition-transform duration-500 ease-out burger-sub-arrow">expand_more</span>
                            </button>
                            <div class="burger-sub-accordion-body">
                                <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2 pt-2 pb-3">
                                    <a href="/catalog/?pcat=Специальные стали&cat=Балка двутавр низколегированная" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Балка низколегированная</a>
                                    <a href="/catalog/?pcat=Специальные стали&cat=Трубы электросварные низколегированные" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Трубы низколегированные</a>
                                    <a href="/catalog/?pcat=Специальные стали&cat=Лист спецсталь" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Лист спецсталь</a>
                                    <a href="/catalog/?pcat=Специальные стали&cat=Швеллер низколегированный" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Швеллер низколегированный</a>
                                    <a href="/catalog/?pcat=Специальные стали&cat=Круг спецсталь" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Круг спецсталь</a>
                                    <a href="/catalog/?pcat=Специальные стали&cat=Уголок спецсталь" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Уголок спецсталь</a>
                                </div>
                            </div>
                        </div>

                        <!-- Кровельные материалы -->
                        <div class="burger-sub-accordion">
                            <button class="w-full flex items-center justify-between text-sm font-bold uppercase text-on-surface hover:text-primary no-underline transition-all pb-2" onclick="this.parentElement.classList.toggle('is-open')">
                                <div class="flex items-center gap-2.5">
                                    <span class="material-symbols-outlined text-[18px] opacity-50">roofing</span>
                                    Кровельные материалы
                                </div>
                                <span class="material-symbols-outlined text-[16px] text-primary transition-transform duration-500 ease-out burger-sub-arrow">expand_more</span>
                            </button>
                            <div class="burger-sub-accordion-body">
                                <div class="pl-7 flex flex-col gap-2.5 border-l border-white/5 ml-2 pt-2 pb-3">
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Композитная черепица" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Композитная черепица</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Гибкая черепица" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Гибкая черепица</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Натуральная черепица" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Натуральная черепица</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Ондулин" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Ондулин</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Фальцевая кровля" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Фальцевая кровля</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Водостоки" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Водостоки</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Металлочерепица" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Металлочерепица</a>
                                    <a href="/catalog/?pcat=Кровельные материалы&cat=Профнастил" class="text-xs text-on-surface-variant hover:text-primary no-underline uppercase tracking-wider" onclick="toggleMobileCatalogGlobal()">Профнастил</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Show All Button -->
                    <div class="pt-4 border-t border-white/5">
                        <a href="/catalog-select" onclick="toggleMobileCatalogGlobal()" class="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary text-center font-bold font-label-caps text-xs tracking-widest hover:bg-primary/90 transition-all uppercase rounded-xl no-underline">
                            <span>ПОКАЗАТЬ ВСЕ</span>
                            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </a>
                    </div>

                </div>
            </div>
        </div>
    </div>
    
    <!-- Global Search Overlay -->
    <div id="globalSearchOverlay" class="fixed inset-0 z-[5000] flex items-start justify-center pointer-events-none pt-24 px-4 overflow-hidden">
        <div id="searchBackdropGlobal" class="absolute inset-0 bg-black/80 backdrop-blur-xl opacity-0 transition-opacity duration-150 pointer-events-none" onclick="toggleSearchGlobal()"></div>
        <div id="searchContainerGlobal" class="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-surface/40 backdrop-blur-[40px] border border-white/10 p-6 md:p-10 translate-y-[-50px] opacity-0 transition-all duration-500 pointer-events-none rounded-[2.5rem]">
            <div class="flex items-center gap-4 border-b border-white/20 pb-4 mb-8 flex-shrink-0">
                <span class="material-symbols-outlined text-primary text-4xl">search</span>
                <input id="globalSearchInput" type="text" aria-label="Поиск по всему сайту" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" placeholder="ПОИСК ПО ВСЕМУ САЙТУ..." class="w-full bg-transparent border-none text-2xl md:text-4xl font-display-xl uppercase outline-none text-on-surface placeholder:text-white/20"/>
                <button onclick="toggleSearchGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2">close</button>
            </div>
            <div id="searchResultsGlobal" class="flex-1 overflow-hidden">
                <p class="text-on-surface-variant font-label-caps text-xs tracking-widest uppercase">Начните вводить текст для поиска...</p>
            </div>
        </div>
    </div>


    <div class="mega-overlay" id="megaOverlayGlobal"></div>
    
    <div id="cartDrawerGlobal" class="fixed inset-0 z-[3000] pointer-events-none overflow-hidden flex items-center justify-center p-4">
        <div id="cartOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out pointer-events-none" onclick="toggleCartDrawerGlobal()"></div>
        <div id="cartPanelGlobal" class="relative w-full max-w-2xl bg-surface border border-outline-variant/20 p-6 md:p-8 rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] transform scale-95 opacity-0 transition-all duration-500 ease-out pointer-events-none" style="background-color: var(--md-sys-color-surface, #151311);">
            <header class="flex justify-between items-center mb-6">
                <div>
                    <h2 class="font-display-xl text-xl font-bold uppercase tracking-wider text-on-surface">КОРЗИНА</h2>
                </div>
                <div class="flex items-center gap-4">
                    <button onclick="window.clearCartGlobal()" class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none"><span class="material-symbols-outlined text-sm">delete</span>Очистить</button>
                    <button onclick="toggleCartDrawerGlobal()" class="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer border-none">close</button>
                </div>
            </header>
            
            <div id="cartItemsGlobal" class="flex-1 overflow-y-auto space-y-3 mb-6 pr-2 custom-scrollbar">
            </div>
            
            <footer class="pt-6 border-t border-outline-variant/10 space-y-4 shrink-0">
                <div class="flex justify-between items-end mb-2">
                    <span class="font-label-caps text-xs text-on-surface-variant uppercase tracking-widest">ИТОГО К ОПЛАТЕ</span>
                    <span id="cartTotalGlobal" class="font-display-xl text-3xl font-black text-primary">0 ₽</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onclick="window.buyInOneClickCartGlobal()" class="w-full py-4 rounded-xl border border-primary hover:bg-primary/5 text-primary text-center font-bold text-[10px] tracking-[0.15em] transition-all uppercase flex items-center justify-center gap-2 cursor-pointer bg-transparent">
                        <span class="material-symbols-outlined text-base">bolt</span>БЫСТРЫЙ ЗАКАЗ
                    </button>
                    <a href="/cart/" class="block w-full py-4 rounded-xl bg-primary text-on-primary text-center font-bold text-[10px] tracking-[0.15em] hover:bg-primary/90 transition-all uppercase no-underline flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-base">shopping_cart_checkout</span>ПЕРЕЙТИ В КОРЗИНУ
                    </a>
                </div>
            </footer>
        </div>
    </div>

    <div class="mega-menu" id="megaMenuGlobal">
      <div class="mega-menu-inner">
        <div class="mega-menu-left">
          <div class="mega-cat-item" data-submenu="cherny"><a href="/catalog/?pcat=Чёрный металлопрокат" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">construction</span>Чёрный металлопрокат<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="nerzh"><a href="/catalog/?pcat=Нержавеющая сталь" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">shield</span>Нержавеющая сталь<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="spec"><a href="/catalog/?pcat=Специальные стали" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">workspace_premium</span>Специальные стали<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-item" data-submenu="krovlya"><a href="/catalog/?pcat=Кровельные материалы" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">roofing</span>Кровельные материалы<span class="material-symbols-outlined mega-arrow">chevron_right</span></a></div>
          <div class="mega-cat-divider"></div>
          <div class="mega-cat-item" data-submenu="none"><a href="/calculator" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">calculate</span>Калькулятор</a></div>
          <div class="mega-cat-item" data-submenu="none"><a href="/services" class="mega-cat-link"><span class="material-symbols-outlined mega-cat-icon">content_cut</span>Услуги резки</a></div>
        </div>
        <div class="mega-menu-right" id="megaMenuRightGlobal">
          <div class="mega-submenu" data-parent="cherny"><div class="mega-submenu-title">Чёрный металлопрокат</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Арматура" class="mega-sub-link">Арматура</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Композитная арматура" class="mega-sub-link">Композитная арматура</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Балка двутавровая" class="mega-sub-link">Балка двутавровая</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Закладные детали" class="mega-sub-link">Закладные детали</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Круг" class="mega-sub-link">Круг</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Квадрат" class="mega-sub-link">Квадрат</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Лист стальной" class="mega-sub-link">Лист стальной</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Лягушка арматурная" class="mega-sub-link">Лягушка арматурная</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Полоса" class="mega-sub-link">Полоса</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Просечно-вытяжной лист" class="mega-sub-link">Просечно-вытяжной лист</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Проволока" class="mega-sub-link">Проволока</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Сетка стальная" class="mega-sub-link">Сетка стальная</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Швеллер" class="mega-sub-link">Швеллер</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы бесшовные" class="mega-sub-link">Трубы бесшовные</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы электросварные" class="mega-sub-link">Трубы электросварные</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы профильные" class="mega-sub-link">Трубы профильные</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Трубы ВГП" class="mega-sub-link">Трубы ВГП</a>
            <a href="/catalog/?pcat=Чёрный металлопрокат&cat=Уголок" class="mega-sub-link">Уголок</a>
          </div></div>
          <div class="mega-submenu" data-parent="nerzh"><div class="mega-submenu-title">Нержавеющая сталь</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Сварочные материалы нержавеющие" class="mega-sub-link">Сварочные материалы</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Круг нержавеющий" class="mega-sub-link">Круг нержавеющий</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Квадрат нержавеющий" class="mega-sub-link">Квадрат нержавеющий</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Лист нержавеющий" class="mega-sub-link">Лист нержавеющий</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Полоса нержавеющая" class="mega-sub-link">Полоса нержавеющая</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Шестигранник нержавеющий" class="mega-sub-link">Шестигранник нержавеющий</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Трубы нержавеющие" class="mega-sub-link">Трубы нержавеющие</a>
            <a href="/catalog/?pcat=Нержавеющая сталь&cat=Уголок нержавеющий" class="mega-sub-link">Уголок нержавеющий</a>
          </div></div>
          <div class="mega-submenu" data-parent="spec"><div class="mega-submenu-title">Специальные стали</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Специальные стали&cat=Балка двутавр низколегированная" class="mega-sub-link">Балка низколегированная</a>
            <a href="/catalog/?pcat=Специальные стали&cat=Трубы электросварные низколегированные" class="mega-sub-link">Трубы низколегированные</a>
            <a href="/catalog/?pcat=Специальные стали&cat=Лист спецсталь" class="mega-sub-link">Лист спецсталь</a>
            <a href="/catalog/?pcat=Специальные стали&cat=Швеллер низколегированный" class="mega-sub-link">Швеллер низколегированный</a>
            <a href="/catalog/?pcat=Специальные стали&cat=Круг спецсталь" class="mega-sub-link">Круг спецсталь</a>
            <a href="/catalog/?pcat=Специальные стали&cat=Уголок спецсталь" class="mega-sub-link">Уголок спецсталь</a>
          </div></div>
          <div class="mega-submenu" data-parent="krovlya"><div class="mega-submenu-title">Кровельные материалы</div><div class="mega-submenu-grid">
            <a href="/catalog/?pcat=Кровельные материалы&cat=Композитная черепица" class="mega-sub-link">Композитная черепица</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Гибкая черепица" class="mega-sub-link">Гибкая черепица</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Натуральная черепица" class="mega-sub-link">Натуральная черепица</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Ондулин" class="mega-sub-link">Ондулин</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Фальцевая кровля" class="mega-sub-link">Фальцевая кровля</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Водостоки" class="mega-sub-link">Водостоки</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Металлочерепица" class="mega-sub-link">Металлочерепица</a>
            <a href="/catalog/?pcat=Кровельные материалы&cat=Профнастил" class="mega-sub-link">Профнастил</a>
          </div></div>
          <div class="mega-submenu mega-submenu-default is-active" data-parent="default"><div class="mega-default-content">
            <span class="material-symbols-outlined mega-default-icon">inventory_2</span>
            <div class="mega-default-title">Каталог продукции</div>
            <div class="mega-default-desc">Наведите на категорию, чтобы увидеть подкатегории</div>
            <a href="/catalog-select" class="mega-default-btn"><span>ВЕСЬ КАТАЛОГ</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
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

    <div id="authDrawerGlobal" class="fixed inset-0 z-[3010] pointer-events-none overflow-hidden" style="display: none;">
        <div id="authOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-150 pointer-events-none" onclick="toggleAuthModalGlobal()"></div>
        <div id="authPanelGlobal" class="absolute top-0 right-0 w-full max-w-md h-full liquid-glass border-l border-outline-variant/20 translate-x-full transition-transform duration-500 ease-in-out pointer-events-auto p-12 flex flex-col">
            <button onclick="toggleAuthModalGlobal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            <div class="flex-1 overflow-y-auto pt-8">
                <div id="authContentLoggedOut">
                    <header class="mb-12">
                        <div class="font-display-xl text-[32px] leading-none mb-2 uppercase">ЛИЧНЫЙ<br/><span class="text-primary">КАБИНЕТ</span></div>
                        <p class="text-on-surface-variant text-sm font-label-caps">ВОЙДИТЕ В СИСТЕМУ</p>
                    </header>
                    <form id="loginFormGlobal" class="space-y-8" onsubmit="handleLoginGlobal(event); return false;">
                        <div class="space-y-6">
                            <div>
                                <label for="loginEmailGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="loginEmailGlobal" autocomplete="username email" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div class="relative">
                                <label for="loginPassGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ПАРОЛЬ</label>
                                <div class="relative flex items-center">
                                    <input type="password" id="loginPassGlobal" autocomplete="current-password" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 pr-10 pl-0 outline-none font-body-md"/>
                                    <button type="button" onclick="togglePassVisibilityGlobal('loginPassGlobal', this)" class="absolute right-0 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-white/5">
                                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-between items-center mt-[-10px] mb-2">
                            <div class="flex items-center gap-2">
                                <input type="checkbox" id="loginRememberMeGlobal" style="cursor: pointer; min-width: 16px; min-height: 16px;" class="rounded border-outline-variant/30 text-primary focus:ring-primary focus:ring-0 bg-transparent w-4 h-4 shrink-0 cursor-pointer"/>
                                <label for="loginRememberMeGlobal" class="cursor-pointer text-on-surface-variant hover:text-primary transition-colors text-[10px] font-label-caps uppercase tracking-wider select-none">ЗАПОМНИТЬ МЕНЯ</label>
                            </div>
                            <button type="button" onclick="switchAuthGlobal('forgot')" class="text-on-surface-variant hover:text-primary text-[10px] font-label-caps uppercase transition-colors tracking-wider">ЗАБЫЛИ ПАРОЛЬ?</button>
                        </div>
                        <div class="flex items-start gap-2 mb-6">
                            <input type="checkbox" id="loginPrivacyGlobal" style="cursor: pointer; min-width: 16px; min-height: 16px;" class="mt-0.5 rounded border-outline-variant/30 text-primary focus:ring-primary focus:ring-0 bg-transparent w-4 h-4 shrink-0 cursor-pointer"/>
                            <label for="loginPrivacyGlobal" class="cursor-pointer text-on-surface-variant hover:text-primary transition-colors text-[10px] font-label-caps uppercase tracking-wider select-none leading-tight">Я СОГЛАСЕН НА ОБРАБОТКУ <a href="/privacy-policy.html" target="_blank" class="text-primary underline">ПЕРСОНАЛЬНЫХ ДАННЫХ</a></label>
                        </div>
                        <div id="loginErrorMsgGlobal" class="text-error text-[11px] font-label-caps mt-[-16px] mb-4 hidden uppercase tracking-wider"></div>
                        <button type="submit" onclick="handleLoginGlobal(event)" class="w-full py-5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">ВОЙТИ</button>
                        <div class="text-center">
                            <button type="button" onclick="switchAuthGlobal('register')" class="text-on-surface-variant hover:text-primary transition-colors font-label-caps text-[12px] uppercase">НЕТ АККАУНТА? ЗАРЕГИСТРИРОВАТЬСЯ</button>
                        </div>
                    </form>
                    <div id="registerFormGlobal" class="space-y-8 hidden">
                        <div class="space-y-6">
                            <div>
                                <label for="regNameGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ФИО / КОМПАНИЯ</label>
                                <input type="text" id="regNameGlobal" autocomplete="name" maxlength="100" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div>
                                <label for="regEmailGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="regEmailGlobal" autocomplete="email" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
                            </div>
                            <div class="relative">
                                <label for="regPassGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">ПАРОЛЬ</label>
                                <div class="relative flex items-center">
                                    <input type="password" id="regPassGlobal" autocomplete="new-password" oninput="validatePasswordStrengthGlobal(this.value)" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 pr-10 pl-0 outline-none font-body-md"/>
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
                                        <div id="strengthBarGlobal" class="h-full w-0 bg-error transition-all duration-500 ease-out"></div>
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
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-start gap-2 mt-4">
                            <input type="checkbox" id="regPrivacyGlobal" style="cursor: pointer; min-width: 16px; min-height: 16px;" class="mt-0.5 rounded border-outline-variant/30 text-primary focus:ring-primary focus:ring-0 bg-transparent w-4 h-4 shrink-0 cursor-pointer" onchange="document.getElementById('regSubmitBtnGlobal').disabled = !this.checked || document.getElementById('strengthTextGlobal').innerText === 'ОЧЕНЬ СЛАБЫЙ'"/>
                            <label for="regPrivacyGlobal" class="cursor-pointer text-on-surface-variant hover:text-primary transition-colors text-[10px] font-label-caps uppercase tracking-wider select-none leading-tight">Я СОГЛАСЕН НА ОБРАБОТКУ <a href="/privacy-policy.html" target="_blank" class="text-primary underline">ПЕРСОНАЛЬНЫХ ДАННЫХ</a></label>
                        </div>
                        <div id="regErrorMsgGlobal" class="text-error text-[11px] font-label-caps mb-4 hidden uppercase tracking-wider"></div>
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
                                <label for="forgotEmailGlobal" class="font-label-caps text-[11px] text-on-surface-variant block mb-2 tracking-widest uppercase">EMAIL</label>
                                <input type="email" id="forgotEmailGlobal" autocomplete="email" class="w-full bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-primary transition-colors text-on-surface py-3 px-0 outline-none font-body-md"/>
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

    <button id="floatingChatBtnGlobal" onclick="openGlobalChatDrawerGlobal()" class="fixed bottom-4 right-4 md:bottom-10 md:right-32 z-[5000] w-12 h-12 md:w-16 md:h-16 bg-primary text-on-primary flex items-center justify-center shadow-[0_8px_32px_rgba(202, 112, 147,0.3)] hover:scale-110 active:scale-90 transition-all duration-500 group rounded-2xl md:rounded-[1.5rem]">
        <span class="material-symbols-outlined text-[24px] md:text-[32px] group-hover:rotate-12 transition-transform">support_agent</span>
        <span id="floatingChatBadgeGlobal" class="absolute -top-2.5 -right-2.5 w-8 h-8 bg-[#ca7093] text-white text-[11px] font-black rounded-full flex items-center justify-center hidden border-2 border-background shadow-md"></span>
    </button>

    <button id="scrollTopBtnGlobal" onclick="scrollToTopGlobal()" class="fixed bottom-4 left-4 md:bottom-10 md:right-10 md:left-auto z-[5000] w-12 h-12 md:w-16 md:h-16 bg-surface-container-high/80 border border-white/10 text-primary flex items-center justify-center shadow-2xl rounded-2xl md:rounded-[1.5rem]">
        <span class="material-symbols-outlined text-[24px] md:text-[32px]">arrow_upward</span>
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


        /* Override bright pink colors with theme accent pinks */
        html.dark .text-primary, html.dark .text-\\[\\#ff4a7a\\] { color: var(--primary-wine) !important; }
        html.dark .bg-primary, html.dark .bg-\\[\\#ff4a7a\\] { background-color: var(--primary-wine) !important; }
        html.dark .border-primary, html.dark .border-\\[\\#ff4a7a\\] { border-color: var(--primary-wine) !important; }
        html.dark .hover\:bg-primary:hover { background-color: #7a3642 !important; }
        html.dark .pink-glow:hover { box-shadow: 0 0 20px rgba(var(--primary-wine-rgb), 0.25) !important; }
        
        /* Light Theme specific adjustments (Default state: #ca7093, Highlights/Selections: #964551) */
        html.light .text-primary, html.light .text-\\[\\#ff4a7a\\] { color: #ca7093 !important; }
        html.light .bg-primary, html.light .bg-\\[\\#ff4a7a\\] { background-color: #ca7093 !important; color: #ffffff !important; }
        html.light .border-primary, html.light .border-\\[\\#ff4a7a\\] { border-color: #ca7093 !important; }
        
        html.light .hover\:bg-primary:hover, 
        html.light .bg-primary:hover,
        html.light button.bg-primary:hover,
        html.light a.bg-primary:hover { 
            background-color: #964551 !important; 
            color: #ffffff !important; 
        }
        html.light .text-primary:hover,
        html.light a:hover .text-primary,
        html.light a.text-primary:hover {
            color: #964551 !important;
        }
        html.light .border-primary:hover {
            border-color: #964551 !important;
        }
        html.light .pink-glow:hover { 
            box-shadow: 0 0 20px rgba(150, 69, 81, 0.3) !important; 
        }
        html.light ::selection, html.light *::selection {
            background-color: #964551 !important;
            color: #ffffff !important;
        }
        html.light .material-symbols-outlined { color: #ca7093; }
        html.light .material-symbols-outlined:hover { color: #964551; }
        html.light .bg-primary .material-symbols-outlined { color: #ffffff !important; }
        html.light .cta-urgent-box { background-color: #ca7093 !important; }

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

        /* Prevent FOUT for Material Symbols Outlined icons */
        html:not(.material-symbols-loaded) .material-symbols-outlined {
            color: transparent !important;
            width: 1em !important;
            height: 1em !important;
            overflow: hidden !important;
            display: inline-block !important;
        }

        /* Hover state for unread notification items in chat sidebar */
        .unread-chat-item {
            transition: all 0.25s ease-in-out !important;
        }
        .unread-chat-item:hover {
            background-color: rgba(150, 69, 81, 0.35) !important; /* darker wine-red color */
            color: #ffffff !important;
        }

        /* Hover state for active folder tabs in global chat drawer */
        #chat-folder-orders.bg-\[\#ca7093\]:hover,
        #chat-folder-leads.bg-\[\#ca7093\]:hover,
        #chat-folder-orders-mobile.bg-\[\#ca7093\]:hover,
        #chat-folder-leads-mobile.bg-\[\#ca7093\]:hover {
            background-color: #964551 !important; /* dark wine-red */
            color: #ffffff !important;
        }
        /* Hover state for the badges inside active folder tabs */
        #chat-folder-orders.bg-\[\#ca7093\]:hover #sidebar-badge-orders,
        #chat-folder-leads.bg-\[\#ca7093\]:hover #sidebar-badge-leads {
            background-color: #ffffff !important;
            color: #964551 !important;
        }
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
                            <img src="/images/logo_icon.png" alt="Железный Дровосек" class="logo-img w-16 h-16 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(202, 112, 147,0.3)]">
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
                        <li><a href="/catalog-select" class="text-sm text-on-surface-variant hover:text-primary transition-colors no-underline uppercase tracking-wider">КАТАЛОГ</a></li>
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
                            <a href="https://yandex.ru/maps/org/zhelezny_drovosek/183141073087?si=8qtpxb4kcht8cpvw3yya04k9y8" target="_blank" rel="noopener noreferrer" class="text-sm text-on-surface-variant hover:text-primary transition-colors leading-relaxed opacity-80 decoration-dotted underline">ЛО, промзона Горелово, 2-й квартал, 30</a>
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
        /* --- PREMIUM ANIMATED THEME TOGGLER --- */
        .theme-toggle-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--color-on-surface);
            border-radius: 9999px;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #globalHeader .theme-toggle-btn {
            display: none;
        }
        @media (min-width: 768px) {
            #globalHeader .theme-toggle-btn {
                display: flex;
            }
        }

        .theme-toggle-svg {
            transform-origin: center;
            transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: visible;
        }
        .theme-toggle-svg .center-circle {
            transition: r 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .theme-toggle-svg .mask-circle {
            transition: cx 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), cy 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .theme-toggle-svg .rays-group {
            transform-origin: center;
            transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* Light theme state: center circle is smaller (5px), mask is shifted out, rays are visible */
        html.light .theme-toggle-svg {
            transform: rotate(0deg);
        }
        html.light .theme-toggle-svg .center-circle {
            r: 5px !important;
        }
        html.light .theme-toggle-svg .mask-circle {
            cx: 33px !important;
            cy: 0px !important;
        }
        html.light .theme-toggle-svg .rays-group {
            transform: scale(1) rotate(0deg) !important;
            opacity: 1 !important;
        }

        /* Dark theme state: center circle is larger (9px), mask carves crescent, rays are hidden */
        html.dark .theme-toggle-svg {
            transform: rotate(270deg);
        }
        html.dark .theme-toggle-svg .center-circle {
            r: 9px !important;
        }
        html.dark .theme-toggle-svg .mask-circle {
            cx: 17px !important;
            cy: 8px !important;
        }
        html.dark .theme-toggle-svg .rays-group {
            transform: scale(0) rotate(-30deg) !important;
            opacity: 0 !important;
        }

        /* --- THEME TRANSITIONS --- */
        .theme-transitioning, 
        .theme-transitioning body,
        .theme-transitioning header,
        .theme-transitioning footer,
        .theme-transitioning nav,
        .theme-transitioning aside,
        .theme-transitioning main,
        .theme-transitioning section,
        .theme-transitioning .liquid-glass,
        .theme-transitioning .glass-panel,
        .theme-transitioning .glass-card,
        .theme-transitioning .product-card,
        .theme-transitioning .fleet-card,
        .theme-transitioning button,
        .theme-transitioning input,
        .theme-transitioning select,
        .theme-transitioning textarea {
            transition: background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            will-change: background-color;
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
            box-shadow: 0 0 25px rgba(202, 112, 147, 0.7) !important;
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
            text-shadow: 0 0 15px rgba(202, 112, 147, 0.6);
        }

        /* Light mode adjustments */
        html.light .logo-link-hover-effect:hover .logo-img,
        html:not(.dark) .logo-link-hover-effect:hover .logo-img {
            border-color: #ca7093 !important;
            box-shadow: 0 0 20px rgba(202, 112, 147, 0.5) !important;
        }
        html.light .logo-link-hover-effect:hover .logo-text-part-1,
        html:not(.dark) .logo-link-hover-effect:hover .logo-text-part-1 {
            color: #000000 !important;
        }
        html.light .logo-link-hover-effect:hover .logo-text-part-2,
        html:not(.dark) .logo-link-hover-effect:hover .logo-text-part-2 {
            text-shadow: 0 0 12px rgba(150, 69, 81, 0.4) !important;
            color: #964551 !important;
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
            display: flex; max-width: 1440px; margin: 0 auto; 
            background: rgba(255, 255, 255, 0.45) !important;
            backdrop-filter: blur(35px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(35px) saturate(200%) !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            border-top: 3px solid #ca7093 !important;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
            min-height: 400px;
            border-radius: 0 0 24px 24px;
            overflow: hidden;
        }
        .mega-menu-left { 
            width: 300px; 
            background: rgba(255, 255, 255, 0.25) !important; 
            border-right: 1px solid rgba(0, 0, 0, 0.08) !important; 
            padding: 20px 0; 
        }
        .mega-cat-link {
            display: flex; align-items: center; gap: 12px; padding: 12px 30px;
            color: #1a1817 !important; text-decoration: none; font-family: 'Space Grotesk', sans-serif;
            font-size: 14px; transition: all 0.2s; position: relative;
        }
        .mega-cat-link:hover, .mega-cat-item.is-active .mega-cat-link { 
            background: rgba(255, 255, 255, 0.35) !important; 
            color: #ca7093 !important; 
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0, 0, 0, 0.03) !important;
        }
        .mega-cat-item.is-active .mega-cat-link::before {
            content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #ca7093 !important;
        }
        .mega-menu-right { 
            flex: 1; 
            padding: 40px; 
            background: rgba(255, 255, 255, 0.12) !important; 
        }
        .mega-submenu { display: none; }
        .mega-submenu.is-active { display: block; animation: fadeInSub 0.3s ease; }
        @keyframes fadeInSub { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .mega-submenu-title { 
            font-size: 20px; 
            font-weight: 700; 
            color: #1a1817 !important; 
            margin-bottom: 24px; 
            padding-bottom: 12px; 
            border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important; 
        }
        .mega-submenu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 20px; }
        .mega-sub-link { color: #4a4744 !important; text-decoration: none; font-size: 13px; display: block; padding: 6px 0; transition: color 0.2s; font-weight: 500 !important; }
        .mega-sub-link:hover { color: #ca7093 !important; }
        
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
            border-left: 1px solid rgba(202, 112, 147, 0.1) !important;
            box-shadow: -20px 0 80px rgba(0, 0, 0, 0.6), inset 1px 0 0 rgba(255, 255, 255, 0.05) !important;
        }
        #mobileMenuPanelGlobal { box-shadow: 20px 0 60px rgba(0,0,0,0.5); }
        /* Burger Accordion Styles */
        .burger-accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1); }
        .burger-accordion.is-open .burger-accordion-body { max-height: 2000px; }
        .burger-accordion.is-open .burger-accordion-arrow { transform: rotate(180deg); }
        .burger-sub-accordion-body { max-height: 0; overflow: hidden; transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1); }
        .burger-sub-accordion.is-open .burger-sub-accordion-body { max-height: 500px; }
        .burger-sub-accordion.is-open .burger-sub-arrow { transform: rotate(180deg); }
        
        .mega-default-content { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 16px; }
        .mega-default-icon { font-size: 56px; color: rgba(202, 112, 147, 0.4) !important; }
        .mega-default-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #1a1817 !important; }
        .mega-default-desc { font-size: 14px; color: rgba(26, 24, 23, 0.6) !important; max-width: 280px; }
        .mega-default-btn { 
            display: inline-flex; 
            align-items: center; 
            gap: 8px; 
            margin-top: 12px; 
            padding: 12px 28px; 
            border: 1px solid #ca7093 !important; 
            color: #ca7093 !important; 
            background: rgba(255, 255, 255, 0.2) !important;
            font-family: 'Space Grotesk', sans-serif; 
            font-size: 13px; 
            font-weight: 700; 
            letter-spacing: 0.1em; 
            text-decoration: none; 
            transition: all 0.3s ease; 
            border-radius: 12px;
        }
        .mega-default-btn:hover { background: #ca7093 !important; color: #ffffff !important; }
        .mega-cat-icon { color: #ca7093 !important; }
        .mega-arrow { color: rgba(26, 24, 23, 0.45) !important; }
        .mega-cat-link:hover .mega-arrow, .mega-cat-item.is-active .mega-arrow { color: #ca7093 !important; }
        .mega-cat-divider { height: 1px; background: rgba(0, 0, 0, 0.08) !important; margin: 10px 0; }

        /* Compact About Menu */
        .about-compact-menu { width: auto; }
        .about-compact-menu .mega-menu-inner { 
            width: 280px; 
            min-height: auto; 
            background: rgba(255, 255, 255, 0.45) !important;
            backdrop-filter: blur(35px) saturate(200%) !important;
            -webkit-backdrop-filter: blur(35px) saturate(200%) !important;
            border: 1px solid rgba(255, 255, 255, 0.4) !important;
            border-top: 3px solid #ca7093 !important;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
            border-radius: 0 0 20px 20px;
            overflow: hidden;
        }
        .about-compact-menu .mega-menu-left { width: 100%; border-right: none; padding: 10px 0; }
        .about-compact-menu .mega-cat-link { padding: 10px 24px; font-size: 13px; }
        .about-compact-menu .mega-cat-divider { margin: 8px 0; background: rgba(0, 0, 0, 0.08) !important; }

        /* --- DARK LIQUID GLASS MENU OVERRIDES --- */
        html.dark .mega-menu-inner,
        html.dark .about-compact-menu .mega-menu-inner {
            background: rgba(21, 19, 17, 0.75) !important;
            backdrop-filter: blur(40px) saturate(180%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(180%) !important;
            border: 1px solid rgba(255, 255, 255, 0.06) !important;
            border-top: 3px solid #964551 !important;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .mega-menu-left {
            background: rgba(15, 14, 12, 0.3) !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .mega-menu-right {
            background: rgba(21, 19, 17, 0.2) !important;
        }
        html.dark .mega-cat-link {
            color: #c7c5c5 !important;
        }
        html.dark .mega-cat-link:hover, 
        html.dark .mega-cat-item.is-active .mega-cat-link {
            background: rgba(150, 69, 81, 0.15) !important;
            color: #ffffff !important;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 15px rgba(0, 0, 0, 0.2) !important;
        }
        html.dark .mega-cat-item.is-active .mega-cat-link::before {
            background: #964551 !important;
        }
        html.dark .mega-cat-icon {
            color: #964551 !important;
        }
        html.dark .mega-arrow {
            color: rgba(255, 255, 255, 0.3) !important;
        }
        html.dark .mega-cat-link:hover .mega-arrow, 
        html.dark .mega-cat-item.is-active .mega-arrow {
            color: #964551 !important;
        }
        html.dark .mega-cat-divider {
            background: rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .mega-submenu-title {
            color: #c7c5c5 !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        }
        html.dark .mega-sub-link {
            color: #a09c99 !important;
        }
        html.dark .mega-sub-link:hover {
            color: #964551 !important;
        }
        html.dark .mega-default-icon {
            color: rgba(150, 69, 81, 0.5) !important;
        }
        html.dark .mega-default-title {
            color: #c7c5c5 !important;
        }
        html.dark .mega-default-desc {
            color: rgba(199, 197, 197, 0.6) !important;
        }
        html.dark .mega-default-btn {
            border: 1px solid #964551 !important;
            color: #964551 !important;
            background: rgba(150, 69, 81, 0.1) !important;
        }
        html.dark .mega-default-btn:hover {
            background: #964551 !important;
            color: #ffffff !important;
        }

        @media (max-width: 768px) {
            #cartPanelGlobal, #authPanelGlobal { width: 100%; max-width: 100%; }
            .mega-menu { display: none !important; }
        }

        #scrollTopBtnGlobal, #floatingChatBtnGlobal {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        #scrollTopBtnGlobal.visible, #floatingChatBtnGlobal.visible {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }
        #scrollTopBtnGlobal:hover span, #scrollTopBtnGlobal:active span {
            color: #c7c5c5 !important;
        }
        html.light #scrollTopBtnGlobal:hover span, html.light #scrollTopBtnGlobal:active span {
            color: #534D4A !important;
        }

        /* --- GLOBAL LIQUID GLASS SCROLLBAR WITH PREMIUM PINK BAR --- */
        ::-webkit-scrollbar {
            width: 10px;
            height: 10px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.02) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
        }
        html.light ::-webkit-scrollbar-track,
        html:not(.dark) ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
        }
        ::-webkit-scrollbar-thumb {
            background: #ca7093 !important;
            border: 2px solid transparent !important;
            background-clip: padding-box !important;
            border-radius: 10px !important;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #b85d80 !important;
            border: 2px solid transparent !important;
            background-clip: padding-box !important;
        }

        /* For Firefox */
        * {
            scrollbar-width: thin;
            scrollbar-color: #ca7093 transparent !important;
        }
        html.light, html.light * {
            scrollbar-color: #ca7093 transparent !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.01) !important;
        }
        html.light .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.01) !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(202, 112, 147, 0.3) !important;
            border-radius: 4px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ca7093 !important;
        }
        html.light .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(202, 112, 147, 0.3) !important;
        }
        html.light .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #ca7093 !important;
        }

        /* HIDE SCROLLBAR ON MOBILE */
        @media (max-width: 480px) {
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

        /* --- FLUID HEADER LOGO & TYPOGRAPHY --- */
        #globalHeader .logo-img-container img {
            width: 36px;
            height: 36px;
            transition: all 0.3s ease;
        }
        #globalHeader .logo-text-part-1,
        #globalHeader .logo-text-part-2 {
            font-size: 13px;
            transition: all 0.3s ease;
        }
        @media (min-width: 360px) {
            #globalHeader .logo-img-container img {
                width: 40px;
                height: 40px;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 15px;
            }
        }
        @media (min-width: 400px) {
            #globalHeader .logo-img-container img {
                width: 44px;
                height: 44px;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 17px;
            }
        }
        @media (min-width: 480px) {
            #globalHeader .logo-img-container img {
                width: 48px;
                height: 48px;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 18px;
            }
        }
        @media (min-width: 768px) {
            #globalHeader .logo-img-container img {
                width: 56px;
                height: 56px;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 20px;
            }
        }
        @media (min-width: 1024px) {
            #globalHeader .logo-img-container img {
                width: 64px;
                height: 64px;
            }
            #globalHeader .logo-text-part-1,
            #globalHeader .logo-text-part-2 {
                font-size: 24px;
            }
        }
        @media (max-width: 359px) and (min-width: 330px) {
            #globalHeader .logo-img-container {
                display: none !important;
            }
        }
        @media (max-width: 329px) {
            #globalHeader .logo-text-container {
                display: none !important;
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
            box-shadow: 0 0 15px rgba(202, 112, 147, 0.5);
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
        html.light .bg-\[\#1d1b19\] .text-\[\#ca7093\],
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

    // Update theme toggle visuals after injecting the elements
    if (typeof window.updateToggleVisualsGlobal === 'function') {
        const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
        window.updateToggleVisualsGlobal(currentTheme);
    }

    // Header Logic
    const isTouchDeviceGlobal = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const catalogWrapper = document.getElementById('catalogMenuWrapperGlobal');
    const menu = document.getElementById('megaMenuGlobal');
    const overlay = document.getElementById('megaOverlayGlobal');
    const catItems = document.querySelectorAll('.mega-cat-item');
    const submenus = document.querySelectorAll('.mega-submenu');

    let catMenuLastOpened = 0;
    let aboutMenuLastOpened = 0;

    function openMegaMenu() {
        if (!menu || !overlay) return;
        closeAboutMenu(); // Optimization: close about menu when opening catalog
        
        if (!menu.classList.contains('is-visible')) {
            catMenuLastOpened = Date.now();
        }

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
        catMenuLastOpened = 0;
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
                if (isTouchDeviceGlobal) {
                    // If menu was just opened (less than 500ms ago), prevent navigation
                    if (Date.now() - catMenuLastOpened < 500) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
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
        
        if (!aboutMenu.classList.contains('is-visible')) {
            aboutMenuLastOpened = Date.now();
        }

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
        aboutMenuLastOpened = 0;
    }

    if (aboutWrapper) {
        aboutWrapper.addEventListener('mouseenter', openAboutMenu);
        const aboutBtn = document.getElementById('aboutBtnGlobal');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                if (isTouchDeviceGlobal) {
                    // If menu was just opened (less than 500ms ago), prevent navigation
                    if (Date.now() - aboutMenuLastOpened < 500) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        }
    }
    if (aboutMenu) aboutMenu.addEventListener('mouseleave', closeAboutMenu);

    if (overlay) overlay.addEventListener('click', () => { closeMegaMenu(); closeAboutMenu(); });

    catItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!isTouchDeviceGlobal) {
                const sub = item.dataset.submenu;
                showSubmenu((sub && sub !== 'none') ? sub : 'default');
            }
        });

        // Touch handling for categories: first tap shows submenu, second tap navigates
        item.addEventListener('click', (e) => {
            if (isTouchDeviceGlobal) {
                const sub = item.dataset.submenu;
                if (sub && sub !== 'none' && sub !== 'default') {
                    if (!item.classList.contains('is-active')) {
                        e.preventDefault();
                        e.stopPropagation();
                        showSubmenu(sub);
                    }
                }
            }
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
        const isLengthOk = password.length >= 8;

        updateChecklistItemGlobal('rule-length', isLengthOk);
        updateChecklistItemGlobal('rule-upper', hasUpper);
        updateChecklistItemGlobal('rule-lower', hasLower);
        updateChecklistItemGlobal('rule-digit', hasDigit);
        
        // Removed rule-special check if the element exists, to avoid errors, we can safely ignore it or check
        const ruleSpecial = document.getElementById('rule-special');
        if (ruleSpecial) { ruleSpecial.style.display = 'none'; }

        let score = 0;
        if (isLengthOk) score += 25;
        if (hasUpper) score += 25;
        if (hasLower) score += 25;
        if (hasDigit) score += 25;

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
        
        const isDark = document.documentElement.classList.contains('dark');
        const modalBg = isDark ? 'bg-[#1d1b19]/90' : 'bg-white/95';
        const textColor = isDark ? 'text-white' : 'text-[#1a1817]';
        const subTextColor = isDark ? 'text-[#d7c1c7]' : 'text-[#534D4A]';
        const borderColor = isDark ? 'border-[#ff4a7a]/20' : 'border-[#ff4a7a]/30';

        overlay = document.createElement('div');
        overlay.id = 'globalErrorPopup';
        overlay.className = 'fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md opacity-0 transition-opacity duration-500 p-4 pointer-events-auto';
        overlay.innerHTML = `
            <div class="relative w-full max-w-sm ${modalBg} backdrop-blur-2xl border ${borderColor} rounded-[2.5rem] p-10 text-center space-y-8 shadow-[0_30px_60px_-12px_rgba(255,74,122,0.15)] opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" id="errorPanelInner">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff4a7a] to-transparent"></div>
                <div class="w-20 h-20 rounded-3xl bg-[#ff4a7a]/10 border border-[#ff4a7a]/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,74,122,0.2)]">
                    <span class="material-symbols-outlined text-5xl text-[#ff4a7a]">priority_high</span>
                </div>
                <div class="space-y-3">
                    <h3 class="font-['Space Grotesk'] text-2xl font-bold tracking-tight ${textColor} uppercase">Ошибка</h3>
                    <p class="${subTextColor} text-sm font-medium leading-relaxed opacity-80 uppercase tracking-widest">${message}</p>
                </div>
                <button onclick="window.closeErrorPopupGlobal()" class="w-full py-5 bg-[#ff4a7a] text-white font-bold text-[11px] tracking-[0.2em] hover:bg-[#ff2a60] transition-all uppercase rounded-2xl shadow-xl shadow-[#ff4a7a]/20 active:scale-95">ЗАКРЫТЬ</button>
            </div>
        `;
        document.body.appendChild(overlay);
        window.lockScrollGlobal();
        
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            const inner = document.getElementById('errorPanelInner');
            if (inner) {
                inner.classList.remove('opacity-0', 'translate-y-8');
            }
        }, 10);

        setTimeout(window.closeErrorPopupGlobal, 6000);
    };

    window.closeErrorPopupGlobal = function() {
        const overlay = document.getElementById('globalErrorPopup');
        const inner = document.getElementById('errorPanelInner');
        if (!overlay) return;
        
        overlay.classList.add('opacity-0');
        if (inner) {
            inner.classList.add('opacity-0', 'translate-y-8');
        }
        setTimeout(() => { overlay.remove(); window.unlockScrollGlobal(); }, 700);
    };

    window.showLoginFormErrorGlobal = function(message) {
        const errEl = document.getElementById('loginErrorMsgGlobal');
        if (errEl) {
            errEl.innerHTML = message;
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
            errEl.innerHTML = message;
            errEl.classList.remove('hidden');
            const form = document.getElementById('registerFormGlobal');
            if (form) {
                form.classList.add('animate-shake');
                setTimeout(() => form.classList.remove('animate-shake'), 500);
            }
        }
    };

    window.showSuccessPopupGlobal = function(message) {
        const isDark = document.documentElement.classList.contains('dark');
        const modalBg = isDark ? 'bg-[#1d1b19]/90' : 'bg-white/95';
        const textColor = isDark ? 'text-white' : 'text-[#1a1817]';
        const subTextColor = isDark ? 'text-[#e7e2dd]' : 'text-[#1A1817]';
        const borderColor = isDark ? 'border-primary/20' : 'border-primary/30';

        const popup = document.createElement('div');
        popup.className = `fixed top-10 left-1/2 -translate-x-1/2 z-[10000] ${modalBg} backdrop-blur-xl border ${borderColor} p-5 pr-8 rounded-[1.5rem] shadow-[0_20px_50px_rgba(150,69,81,0.3)] flex items-center gap-5 animate-in fade-in slide-in-from-top-8 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]`;
        popup.innerHTML = `
            <div class="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-primary text-2xl">check_circle</span>
            </div>
            <div>
                <div class="font-['Space Grotesk'] text-[10px] font-bold text-primary mb-0.5 uppercase tracking-[0.2em]">Успех</div>
                <div class="${subTextColor} text-[13px] font-medium leading-tight">${message}</div>
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.classList.add('animate-out', 'fade-out', 'slide-out-to-top-8');
            setTimeout(() => popup.remove(), 500);
        }, 4000);
    };


        window.showOtpPopupGlobal = function(email) {
        let overlay = document.getElementById('globalOtpPopup');
        if (overlay) overlay.remove();
        
        const isDark = document.documentElement.classList.contains('dark');
        const modalBg = isDark ? 'bg-[#1d1b19]/95' : 'bg-white/95';
        const textColor = isDark ? 'text-white' : 'text-[#1a1817]';
        const subTextColor = isDark ? 'text-[#d7c1c7]' : 'text-[#534D4A]';
        const borderColor = isDark ? 'border-[#ff4a7a]/20' : 'border-[#ff4a7a]/30';

        overlay = document.createElement('div');
        overlay.id = 'globalOtpPopup';
        overlay.className = 'fixed inset-0 z-[10100] flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 transition-opacity duration-500 p-4 pointer-events-auto';
        overlay.innerHTML = `
            <div class="relative w-full max-w-md ${modalBg} backdrop-blur-2xl border ${borderColor} rounded-[2.5rem] p-10 text-center space-y-8 shadow-[0_30px_60px_-12px_rgba(150,69,81,0.15)] opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" id="otpPanelInner">
                <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff4a7a] to-transparent"></div>
                <div class="w-20 h-20 rounded-3xl bg-[#ff4a7a]/10 border border-[#ff4a7a]/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,74,122,0.2)]">
                    <span class="material-symbols-outlined text-5xl text-[#ff4a7a]">mail</span>
                </div>
                <div class="space-y-3">
                    <h3 class="font-['Space Grotesk'] text-2xl font-bold tracking-tight ${textColor} uppercase">Подтверждение почты</h3>
                    <p class="${subTextColor} text-sm font-medium leading-relaxed opacity-80 uppercase tracking-widest">Код отправлен на почту <br/><span class="text-[#ff4a7a] font-bold lowercase">${email}</span></p>
                </div>
                
                <div class="space-y-4">
                    <input type="text" id="otpInputGlobal" maxlength="6" placeholder="ХХХХХХ" class="w-full text-center bg-transparent border-0 border-b border-outline-variant/30 focus:ring-0 focus:border-[#ff4a7a] transition-colors text-on-surface py-2 outline-none font-bold text-2xl tracking-[0.5em] placeholder:tracking-[0.2em] placeholder:opacity-30" autocomplete="one-time-code"/>
                    <div id="otpErrorMsgGlobal" class="text-error text-[11px] font-label-caps hidden uppercase tracking-wider"></div>
                </div>

                <div class="space-y-3">
                    <button onclick="handleVerifyOtpGlobal('${email}')" id="otpSubmitBtnGlobal" class="w-full py-5 bg-[#ff4a7a] text-white font-bold text-[11px] tracking-[0.2em] hover:bg-[#ff2a60] transition-all uppercase rounded-2xl shadow-xl shadow-[#ff4a7a]/20 active:scale-95">ПОДТВЕРДИТЬ</button>
                    
                    <button onclick="handleResendOtpGlobal('${email}')" id="otpResendBtnGlobal" class="w-full py-3 bg-transparent border border-outline-variant/20 text-on-surface-variant font-bold text-[10px] tracking-[0.2em] hover:bg-white/5 transition-all uppercase rounded-2xl">ОТПРАВИТЬ КОД ПОВТОРНО</button>
                </div>
                
                <button onclick="window.closeOtpPopupGlobal()" class="text-on-surface-variant hover:text-primary text-[10px] font-label-caps uppercase transition-colors tracking-wider">ОТМЕНА</button>
            </div>
        `;
        document.body.appendChild(overlay);
        window.lockScrollGlobal();
        
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            const inner = document.getElementById('otpPanelInner');
            if (inner) {
                inner.classList.remove('opacity-0', 'translate-y-8');
            }
            document.getElementById('otpInputGlobal')?.focus();
        }, 10);
    };

    window.closeOtpPopupGlobal = function() {
        const overlay = document.getElementById('globalOtpPopup');
        const inner = document.getElementById('otpPanelInner');
        if (!overlay) return;
        
        overlay.classList.add('opacity-0');
        if (inner) {
            inner.classList.add('opacity-0', 'translate-y-8');
        }
        setTimeout(() => { overlay.remove(); window.unlockScrollGlobal(); }, 700);
    };

    window.handleVerifyOtpGlobal = async function(email) {
        const code = document.getElementById('otpInputGlobal').value.trim();
        const errEl = document.getElementById('otpErrorMsgGlobal');
        const btn = document.getElementById('otpSubmitBtnGlobal');
        
        if (errEl) errEl.classList.add('hidden');
        
        if (!code || code.length !== 6) {
            if (errEl) {
                errEl.textContent = 'Введите 6-значный код';
                errEl.classList.remove('hidden');
            }
            return;
        }
        
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        }
        
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await res.json();
            if (res.ok) {
                window.closeOtpPopupGlobal();
                const drawer = document.getElementById('authDrawerGlobal');
                if (drawer && drawer.style.display !== 'none') {
                    if (window.toggleAuthModalGlobal) {
                        window.toggleAuthModalGlobal();
                    }
                }
                
                localStorage.setItem('metal_token', data.token);
                localStorage.setItem('metal_user', JSON.stringify(data.user));
                if (window.setCookieGlobal) {
                    window.setCookieGlobal('metal_token', data.token, 7);
                    window.setCookieGlobal('metal_user', JSON.stringify(data.user), 7);
                }
                
                showSuccessPopupGlobal(`Почта подтверждена! Добро пожаловать, ${data.user.name || 'пользователь'}!`);
                setTimeout(() => {
                    window.location.href = '/cabinet/';
                }, 1500);
            } else {
                if (errEl) {
                    errEl.textContent = data.error || 'Неверный код подтверждения';
                    errEl.classList.remove('hidden');
                }
            }
        } catch (e) {
            if (errEl) {
                errEl.textContent = 'Ошибка сервера при проверке';
                errEl.classList.remove('hidden');
            }
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'ПОДТВЕРДИТЬ';
            }
        }
    };

    window.handleResendOtpGlobal = async function(email) {
        const errEl = document.getElementById('otpErrorMsgGlobal');
        const resendBtn = document.getElementById('otpResendBtnGlobal');
        const originalText = resendBtn ? resendBtn.innerHTML : 'ОТПРАВИТЬ КОД ПОВТОРНО';
        
        if (errEl) errEl.classList.add('hidden');
        
        if (resendBtn) {
            resendBtn.disabled = true;
            resendBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
        }
        
        try {
            const res = await fetch('/api/auth/resend-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                showSuccessPopupGlobal('Новый код подтверждения отправлен!');
                let seconds = 60;
                resendBtn.disabled = true;
                const interval = setInterval(() => {
                    seconds--;
                    if (seconds <= 0) {
                        clearInterval(interval);
                        resendBtn.disabled = false;
                        resendBtn.innerHTML = 'ОТПРАВИТЬ КОД ПОВТОРНО';
                    } else {
                        resendBtn.innerHTML = `ПОВТОР ЧЕРЕЗ ${seconds} С`;
                    }
                }, 1000);
            } else {
                if (errEl) {
                    errEl.textContent = data.error || 'Не удалось отправить код';
                    errEl.classList.remove('hidden');
                }
                if (resendBtn) {
                    resendBtn.disabled = false;
                    resendBtn.innerHTML = originalText;
                }
            }
        } catch (e) {
            if (errEl) {
                errEl.textContent = 'Ошибка при отправке кода';
                errEl.classList.remove('hidden');
            }
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.innerHTML = originalText;
            }
        }
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

        const privacyCheckbox = document.getElementById('loginPrivacyGlobal');
        if (privacyCheckbox && !privacyCheckbox.checked) {
            showLoginFormErrorGlobal('Необходимо согласие на обработку персональных данных');
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
            const rememberMe = document.getElementById('loginRememberMeGlobal') ? document.getElementById('loginRememberMeGlobal').checked : false;
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('metal_token', data.token);
                localStorage.setItem('metal_user', JSON.stringify(data.user));
                localStorage.setItem('metal_remember', rememberMe ? 'true' : 'false');
                if (rememberMe) {
                    localStorage.removeItem('metal_session_start');
                    localStorage.removeItem('metal_last_activity');
                } else {
                    localStorage.setItem('metal_session_start', Date.now().toString());
                    localStorage.setItem('metal_last_activity', Date.now().toString());
                }
                if (window.setCookieGlobal) {
                    window.setCookieGlobal('metal_token', data.token, rememberMe ? 365 : null);
                    window.setCookieGlobal('metal_user', JSON.stringify(data.user), rememberMe ? 365 : null);
                    window.setCookieGlobal('metal_remember', rememberMe ? 'true' : 'false', rememberMe ? 365 : null);
                }
                showSuccessPopupGlobal(`Успешный вход! Добрый день, ${data.user.name || 'пользователь'}!`);
                setTimeout(() => {
                    window.location.href = '/cabinet/';
                }, 1500);
            } else { 
                if (data.error === 'email_not_confirmed') {
                    showLoginFormErrorGlobal('Ваша почта не подтверждена. Введите код подтверждения.');
                    window.showOtpPopupGlobal(email);
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
                    showSuccessPopupGlobal('Регистрация успешна! Введите код подтверждения.');
                    window.showOtpPopupGlobal(email);
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
        localStorage.removeItem('metal_remember');
        localStorage.removeItem('metal_session_start');
        localStorage.removeItem('metal_last_activity');
        if (window.eraseCookieGlobal) {
            window.eraseCookieGlobal('metal_token');
            window.eraseCookieGlobal('metal_user');
            window.eraseCookieGlobal('metal_remember');
            window.eraseCookieGlobal('metal_session_start');
            window.eraseCookieGlobal('metal_last_activity');
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
            height: auto !important;
            min-height: 100% !important;
        }
        /* Fix for iPad height/cutoff issues */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
            body { padding-bottom: env(safe-area-inset-bottom); }
        }
        @media (max-width: 1024px) {
            section:not(#catalog-section):not(#globalFooter):not(footer).no-block-scroll,
            section:not(#catalog-section):not(#globalFooter):not(footer)[data-no-block-scroll] {
                height: auto !important;
                min-height: auto !important;
            }
            .fixed.bottom-4, .fixed.bottom-8 {
                bottom: max(1rem, env(safe-area-inset-bottom, 1rem)) !important;
            }
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
        if (window.innerWidth < 1024) return; // Disable custom swipe snapping on mobile/tablet
        if (!isBlockScrollPage() || e.touches.length !== 1) return;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (window.innerWidth < 1024) return; // Disable custom swipe snapping on mobile/tablet
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
            '#productModalGlobal',
            '#globalChatDrawerModal'
        ];
        return popupSelectors.some(s => document.querySelector(s));
    };

    const updateScrollTopVisibility = () => {
        // Scroll progress bar
        const scrollBar = document.getElementById('scrollProgressGlobal');
        if (scrollBar) {
            const winScroll = window.scrollY;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            scrollBar.style.width = scrolled + "%";
        }

        const btn = document.getElementById('scrollTopBtnGlobal');
        const chatBtn = document.getElementById('floatingChatBtnGlobal');
        const isPopupOpen = window.checkAnyPopupOpenGlobal();

        if (btn) {
            if (window.scrollY > 500 && !isPopupOpen) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        if (chatBtn) {
            const hero = document.getElementById('hero');
            const heroHeight = hero ? hero.offsetHeight : 600;
            if (isPopupOpen || window.scrollY < heroHeight - 100) {
                chatBtn.classList.remove('visible');
            } else {
                chatBtn.classList.add('visible');
            }
        }
    };

    let scrollTickingGlobal = false;
    window.addEventListener('scroll', () => {
        if (!scrollTickingGlobal) {
            window.requestAnimationFrame(() => {
                updateScrollTopVisibility();
                scrollTickingGlobal = false;
            });
            scrollTickingGlobal = true;
        }
    }, { passive: true });
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
    } // Close if (!isAdmin)
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
            background: rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(40px) saturate(220%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.15) !important;
            will-change: transform, opacity;
            transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1) !important;
        }
        html.light .liquid-glass,
        html:not(.dark) .liquid-glass {
            background: rgba(255, 255, 255, 0.22) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.03), inset 0 0 30px rgba(255, 255, 255, 0.4) !important;
            color: #1A1817 !important;
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
        <div class="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 transition-opacity duration-150 pointer-events-auto" id="successOverlay" onclick="window.closeApplicationPopup()"></div>
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
                <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
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
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-150 pointer-events-auto" id="modalOverlay" onclick="window.closeContactModalGlobal()"></div>
        <div class="relative liquid-glass p-8 md:p-16 max-w-2xl w-full rounded-[2rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto" id="modalPanel">
            <button onclick="window.closeContactModalGlobal()" class="absolute top-8 right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">close</button>
            
            <header class="mb-12">
                <span class="font-label-caps text-[10px] md:text-sm text-primary tracking-[0.3em] uppercase block mb-4 font-bold">Обратная связь</span>
                <h2 class="font-display-xl text-3xl md:text-5xl leading-none text-on-surface font-bold">${title}</h2>
            </header>

            <form id="globalContactForm" class="space-y-8" onsubmit="window.handleApplicationSubmit(event, '${type}')">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="relative">
                        <label for="contactName" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Ваше имя</label>
                        <input id="contactName" name="name" autocomplete="name" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="text" placeholder="Иван Иванов"/>
                    </div>
                    <div class="relative">
                        <label for="contactPhone" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Телефон</label>
                        <input id="contactPhone" name="phone" autocomplete="tel" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="tel" placeholder="+7-(___)-___-__-__"/>
                    </div>
                </div>
                <div class="relative">
                    <label for="contactEmail" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Электронная почта (необязательно)</label>
                    <input id="contactEmail" name="email" autocomplete="email" class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="email" placeholder="example@mail.ru"/>
                </div>
                <div class="relative">
                    <label for="contactMessage" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Ваше сообщение</label>
                    <textarea id="contactMessage" name="message" autocomplete="off" class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none resize-none h-32 font-medium" placeholder="Опишите ваш запрос..."></textarea>
                </div>

                <button type="submit" class="w-full md:w-auto px-12 py-5 bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 transition-all duration-500 ease-out group flex items-center justify-center gap-3 rounded-full mt-4">
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
        <div class="absolute inset-0 bg-black/95 backdrop-blur-2xl opacity-0 transition-opacity duration-150 pointer-events-auto" id="productModalOverlay" onclick="window.closeProductModalGlobal()"></div>
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
        const rawImage = p.image || p.img || '/images/products/hot_rolled_sheets_premium_1778423920658.png';
        const images = rawImage ? rawImage.split(',') : ['/images/products/hot_rolled_sheets_premium_1778423920658.png'];
        const mainImage = images[0] || '';
        
        let galleryHtml = '';
        if (images.length > 1) {
            galleryHtml = `
            <div class="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-2">
                ${images.map((img, i) => `
                    <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-primary' : 'border-transparent'} cursor-pointer hover:border-primary/50 transition-all" onclick="document.getElementById('main-modal-global-image-${p.id}').src='${img}'; Array.from(this.parentElement.children).forEach(c => c.classList.replace('border-primary', 'border-transparent')); this.classList.replace('border-transparent', 'border-primary');">
                        <img src="${img}" class="w-full h-full object-cover" alt="Миниатюра"/>
                    </div>
                `).join('')}
            </div>`;
        }
        
        panel.innerHTML = `
            <button onclick="window.closeProductModalGlobal()" class="absolute top-6 right-6 md:top-8 md:right-8 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors z-20">close</button>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full pt-4 md:pt-0">
                <div class="w-full">
                    <div class="aspect-square w-full overflow-hidden rounded-2xl bg-surface-container border border-outline-variant/10 shadow-2xl">
                        <img id="main-modal-global-image-${p.id}" src="${mainImage}" class="w-full h-full object-cover" alt="${p.name}"/>
                    </div>
                    ${galleryHtml}
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
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-150 pointer-events-auto" id="drawingOverlay" onclick="window.closeDrawingModal()"></div>
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
                            <label for="drawingName" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Имя</label>
                            <input id="drawingName" name="name" autocomplete="name" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="text" placeholder="Иван Иванов"/>
                        </div>
                        <div class="relative">
                            <label for="drawingPhone" class="font-label-caps text-[10px] text-on-surface-variant mb-2 block tracking-widest uppercase font-bold">Телефон</label>
                            <input id="drawingPhone" name="phone" autocomplete="tel" required class="w-full bg-transparent border-b border-white/10 focus:border-primary focus:ring-0 transition-all py-3 text-on-surface placeholder:text-white/20 outline-none font-medium" type="tel" placeholder="+7-(___)-___-__-__"/>
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

window.calculateGlobalChatUnreadCount = function(topics) {
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');
    const myRole = isAdmin ? 'admin' : 'client';
    let readTimes = {};
    try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}
    let totalUnread = 0;
    topics.forEach(t => {
        let msgs = [];
        try { msgs = typeof t.messages === 'string' ? JSON.parse(t.messages) : t.messages; } catch(e){}
        if (!msgs || !msgs.length) return;
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sender !== myRole) {
            const topicKey = t.type + '_' + t.id;
            const lastRead = readTimes[topicKey] || 0;
            totalUnread += msgs.filter(m => m.sender !== myRole && new Date(m.timestamp).getTime() > lastRead).length;
        }
    });
    return totalUnread;
};

window.updateGlobalChatBadgeDisplay = function(count) {
    const badge = document.getElementById('floatingChatBadgeGlobal');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
};

window.markTopicAsReadGlobal = function(topicKey) {
    let readTimes = {};
    try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}
    readTimes[topicKey] = Date.now();
    localStorage.setItem('metal_chat_read_times', JSON.stringify(readTimes));
    if (window.globalChatTopics) {
        window.updateGlobalChatBadgeDisplay(window.calculateGlobalChatUnreadCount(window.globalChatTopics));
        if (typeof window.renderGlobalChatSidebarList === 'function') {
            window.renderGlobalChatSidebarList();
        }
    }
};

// URL Actions (e.g. ?action=login) and Notification Fetch
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email_confirmed') === 'true') {
        setTimeout(() => {
            if (typeof window.showSuccessPopupGlobal === 'function') {
                window.showSuccessPopupGlobal('Электронная почта успешно подтверждена!');
            }
        }, 100);
    }
    if (params.get('action') === 'login') {
        setTimeout(() => {
            if (typeof window.toggleAuthModalGlobal === 'function') {
                window.toggleAuthModalGlobal();
            }
        }, 300);
    }

    const token = localStorage.getItem('metal_token');
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');
    if (!token) return;
    try {
        let topics = [];
        if (isAdmin) {
            const res = await fetch('/api/admin/chat-topics', { headers: { 'Authorization': 'Bearer ' + token } });
            if (res.ok) topics = await res.json();
        } else {
            const [ordersRes, leadsRes] = await Promise.all([
                fetch('/api/orders/my', { headers: { 'Authorization': 'Bearer ' + token } }),
                fetch('/api/leads/my', { headers: { 'Authorization': 'Bearer ' + token } })
            ]);
            let orders = []; let leads = [];
            if (ordersRes.ok) orders = await ordersRes.json();
            if (leadsRes.ok) leads = await leadsRes.json();
            const orderTopics = orders.map(o => ({ id: o.id, type: 'order', messages: o.messages || [] }));
            const leadTopics = leads.filter(l => {
                return ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && l.type.startsWith('Заказ #'));
            }).map(l => ({ id: l.id, type: 'lead', messages: l.messages || [] }));
            topics = [...orderTopics, ...leadTopics];
        }
        window.updateGlobalChatBadgeDisplay(window.calculateGlobalChatUnreadCount(topics));
    } catch (e) {}
});

// --- SUPPORT LANDING SCREEN ---
window.openSupportLandingGlobal = function() {
    const existing = document.getElementById('supportLandingModal');
    if (existing) { existing.remove(); window.unlockScrollGlobal(); return; }

    const token = localStorage.getItem('metal_token');
    const userStr = localStorage.getItem('metal_user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch(e){}
    const isLoggedIn = !!(token && user);

    const modal = document.createElement('div');
    modal.id = 'supportLandingModal';
    modal.className = 'fixed inset-0 z-[7000] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none';

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-xl opacity-0 transition-opacity duration-200 pointer-events-auto" onclick="document.getElementById('supportLandingModal').remove(); window.unlockScrollGlobal()"></div>
        <div class="relative bg-surface-container-lowest shadow-2xl border border-outline-variant/10 rounded-t-3xl md:rounded-[2.5rem] overflow-hidden pointer-events-auto w-full max-w-md opacity-0 transition-all duration-500 flex flex-col" id="supportLandingPanel">
            <!-- Header -->
            <div class="p-6 border-b border-white/5 flex items-center justify-between bg-surface-container-high/80 backdrop-blur-xl shrink-0">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <span class="material-symbols-outlined text-xl">support_agent</span>
                    </div>
                    <div>
                        <div class="font-['Space_Grotesk'] font-bold text-base uppercase tracking-tight">ПОДДЕРЖКА <span class="text-primary">WOODMAN</span></div>
                        <div class="flex items-center gap-1.5 text-[10px] text-green-400 font-bold uppercase tracking-widest mt-0.5">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>Online
                        </div>
                    </div>
                </div>
                <button onclick="document.getElementById('supportLandingModal').remove(); window.unlockScrollGlobal()" class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all">
                    <span class="material-symbols-outlined text-lg">close</span>
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-3">
                <p class="text-xs text-on-surface-variant text-center mb-4 uppercase tracking-widest opacity-60 font-bold">Выберите способ обращения</p>
                
                <!-- Call -->
                <a href="tel:+78005553535" class="group flex items-center gap-4 p-4 rounded-2xl border border-outline/10 bg-surface-container hover:bg-green-500/5 hover:border-green-500/30 transition-all cursor-pointer shadow-sm">
                    <div class="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-xl">phone</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-sm uppercase tracking-wide">Позвонить</div>
                        <div class="text-xs text-on-surface-variant opacity-70 mt-0.5">+7 (800) 555-35-35 · Бесплатно</div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/40 group-hover:text-green-500 transition-colors">chevron_right</span>
                </a>

                <!-- Write to chat -->
                <button id="support-landing-chat-btn" class="w-full group flex items-center gap-4 p-4 rounded-2xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer shadow-sm text-left">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-xl">chat</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-sm uppercase tracking-wide">Написать в чат</div>
                        <div class="text-xs text-on-surface-variant opacity-70 mt-0.5">Ответ в течение нескольких минут</div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/40 group-hover:text-primary transition-colors">chevron_right</span>
                </button>

                <!-- Find appeal -->
                <button id="support-landing-appeals-btn" class="w-full group flex items-center gap-4 p-4 rounded-2xl border border-outline/10 bg-surface-container hover:bg-[#5b9cf6]/5 hover:border-[#5b9cf6]/30 transition-all cursor-pointer shadow-sm text-left">
                    <div class="w-12 h-12 rounded-xl bg-[#5b9cf6]/10 border border-[#5b9cf6]/20 flex items-center justify-center text-[#5b9cf6] group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-xl">search</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-sm uppercase tracking-wide">Найти обращение</div>
                        <div class="text-xs text-on-surface-variant opacity-70 mt-0.5">${isLoggedIn ? 'Просмотр истории ваших обращений' : 'Войдите для просмотра обращений'}</div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/40 group-hover:text-[#5b9cf6] transition-colors">chevron_right</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.lockScrollGlobal();
    setTimeout(() => {
        const panel = document.getElementById('supportLandingPanel');
        if (panel && panel.previousElementSibling) panel.previousElementSibling.classList.remove('opacity-0');
        if (panel) { panel.classList.remove('opacity-0'); panel.classList.add('modal-animate-in'); }
    }, 10);

    // Chat button
    const chatBtn = document.getElementById('support-landing-chat-btn');
    if (chatBtn) {
        chatBtn.onclick = () => {
            modal.remove();
            window.unlockScrollGlobal();
            if (isLoggedIn) {
                window.globalChatFolder = 'order';
                window.openGlobalChatDrawerGlobal();
            } else {
                if (typeof window.toggleAuthModalGlobal === 'function') window.toggleAuthModalGlobal();
            }
        };
    }

    // Find appeal button
    const appealsBtn = document.getElementById('support-landing-appeals-btn');
    if (appealsBtn) {
        appealsBtn.onclick = () => {
            modal.remove();
            window.unlockScrollGlobal();
            if (isLoggedIn) {
                window.globalChatFolder = 'lead';
                window.openGlobalChatDrawerGlobal();
            } else {
                if (typeof window.toggleAuthModalGlobal === 'function') window.toggleAuthModalGlobal();
            }
        };
    }
};

// --- CUSTOM DROPDOWN for chat topic selector ---
window.toggleGlobalChatDropdown = function() {
    const menu = document.getElementById('globalChatDropdownMenu');
    const arrow = document.getElementById('globalChatDropdownArrow');
    if (!menu) return;
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    } else {
        menu.classList.add('hidden');
        if (arrow) arrow.style.transform = '';
    }
};
window.closeGlobalChatDropdown = function() {
    const menu = document.getElementById('globalChatDropdownMenu');
    const arrow = document.getElementById('globalChatDropdownArrow');
    if (menu) menu.classList.add('hidden');
    if (arrow) arrow.style.transform = '';
};
window.renderGlobalChatDropdownMenu = function() {
    const menu = document.getElementById('globalChatDropdownMenu');
    const label = document.getElementById('globalChatDropdownLabel');
    if (!menu) return;

    const folder = window.globalChatFolder || 'order';
    const topics = (window.globalChatTopics || []).filter(t => t.type === folder);
    const folderLabel = folder === 'order' ? 'заказ' : 'обращение';

    if (topics.length === 0) {
        menu.innerHTML = `<div class="px-4 py-3 text-[10px] text-on-surface-variant opacity-40 uppercase tracking-widest font-bold text-center">Нет диалогов</div>`;
        if (label) { label.textContent = `Выберите заказ/обращение`; label.classList.add('opacity-50'); }
        return;
    }

    // Sort: unread first, then by last message time
    let readTimes = {};
    try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}
    const myRole = (window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html')) ? 'admin' : 'client';
    const getUnread = (t) => {
        const key = t.type + '_' + t.id;
        const lastRead = readTimes[key] || 0;
        const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
        return msgs.filter(m => m.sender !== myRole && new Date(m.timestamp).getTime() > lastRead).length;
    };
    const getLatestTime = (t) => {
        const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
        return msgs.length > 0 ? new Date(msgs[msgs.length - 1].timestamp).getTime() : (t.created_at ? new Date(t.created_at).getTime() : 0);
    };
    const sorted = [...topics].sort((a, b) => {
        const ua = getUnread(a), ub = getUnread(b);
        if (ua !== ub) return ub - ua;
        return getLatestTime(b) - getLatestTime(a);
    });

    const formatTime = (t) => {
        const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
        const ts = msgs.length > 0 ? msgs[msgs.length - 1].timestamp : t.created_at;
        if (!ts) return '';
        const d = new Date(ts), now = new Date();
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const yest = new Date(now); yest.setDate(yest.getDate() - 1);
        if (d.toDateString() === yest.toDateString()) return 'Вчера';
        const days = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
        const diff = Math.ceil(Math.abs(now - d) / 86400000);
        return diff < 7 ? days[d.getDay()] : d.toLocaleDateString([], { day:'2-digit', month:'2-digit' });
    };

    const selectedTopic = window.globalChatSelectedTopic;
    menu.innerHTML = sorted.map(t => {
        const key = t.type + '_' + t.id;
        const unread = getUnread(t);
        const time = formatTime(t);
        const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
        const preview = msgs.length > 0 ? msgs[msgs.length - 1].text : 'Нет сообщений';
        const isSelected = selectedTopic && selectedTopic.type === t.type && String(selectedTopic.id) === String(t.id);
        const shortTitle = t.title.includes(' — ') ? t.title.split(' — ').slice(0, 1).join(' — ') : t.title;
        return `
            <div onclick="window.selectFromDropdown('${key}')" class="px-4 py-3 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition-all ${isSelected ? 'bg-primary/10' : 'hover:bg-white/5'}">
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                        <span class="text-[10px] font-bold uppercase tracking-wide ${isSelected ? 'text-primary' : 'text-on-surface'} truncate">${shortTitle}</span>
                        <span class="text-[9px] text-on-surface-variant opacity-50 shrink-0 font-mono">${time}</span>
                    </div>
                    <div class="text-[10px] text-on-surface-variant opacity-60 truncate mt-0.5">${preview}</div>
                </div>
                ${unread > 0 ? `<span class="bg-[#ca7093] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">${unread}</span>` : ''}
            </div>
        `;
    }).join('');

    // Update label
    if (label) {
        if (selectedTopic && selectedTopic.type === folder) {
            const t = sorted.find(t => String(t.id) === String(selectedTopic.id));
            if (t) {
                const shortTitle = t.title.includes(' — ') ? t.title.split(' — ').slice(0, 1).join(' — ') : t.title;
                label.textContent = shortTitle;
                label.classList.remove('opacity-50');
            }
        } else {
            label.textContent = `Выберите заказ/обращение`;
            label.classList.add('opacity-50');
        }
    }
};
window.selectFromDropdown = function(val) {
    window.closeGlobalChatDropdown();
    window.selectGlobalChatTopicGlobal(val);
    // Update label
    const label = document.getElementById('globalChatDropdownLabel');
    const [type, id] = val.split('_');
    const t = (window.globalChatTopics || []).find(t => t.type === type && String(t.id) === String(id));
    if (t && label) {
        const shortTitle = t.title.includes(' — ') ? t.title.split(' — ').slice(0, 1).join(' — ') : t.title;
        label.textContent = shortTitle;
        label.classList.remove('opacity-50');
    }
};

// --- WELCOME SCREEN renderer (called after data loads) ---
window.renderGlobalChatWelcomeScreen = function() {
    const container = document.getElementById('globalChatMessagesContainer');
    if (!container) return;
    container.innerHTML = `
        <div id="chatWelcomeState" class="flex flex-col items-center justify-center h-full py-8 px-4 animate-in fade-in duration-500 ease-out">
            <div class="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-lg shadow-primary/10">
                <span class="material-symbols-outlined text-3xl">support_agent</span>
            </div>
            <h3 class="font-bold text-base uppercase tracking-tight text-on-surface text-center mb-1">Чем можем помочь?</h3>
            <p class="text-xs text-on-surface-variant text-center mb-6 opacity-60 max-w-xs">Выберите диалог из списка или создайте новое обращение</p>
            <div class="flex flex-col gap-3 w-full max-w-xs">
                <a href="tel:+78005553535" class="group flex items-center gap-3 p-3.5 rounded-2xl border border-outline/10 bg-surface-container hover:bg-green-500/5 hover:border-green-500/30 transition-all text-left">
                    <div class="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-lg">phone</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-xs uppercase tracking-wide">Позвонить</div>
                        <div class="text-[11px] text-on-surface-variant opacity-60 mt-0.5">+7 (800) 555-35-35 · Бесплатно</div>
                    </div>
                    <span class="material-symbols-outlined text-sm text-on-surface-variant/30 group-hover:text-green-500 transition-colors">chevron_right</span>
                </a>
                <button id="chatWelcomeNewAppeal" class="group flex items-center gap-3 p-3.5 rounded-2xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all text-left w-full">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-lg">edit_note</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-xs uppercase tracking-wide">Создать обращение</div>
                        <div class="text-[11px] text-on-surface-variant opacity-60 mt-0.5">Новый вопрос или заявка</div>
                    </div>
                    <span class="material-symbols-outlined text-sm text-on-surface-variant/30 group-hover:text-primary transition-colors">chevron_right</span>
                </button>
            </div>
        </div>
    `;
    const btn = document.getElementById('chatWelcomeNewAppeal');
    if (btn) btn.onclick = () => window.openNewAppealTypePopup();
};

// --- NEW APPEAL TYPE POPUP ---
window.openNewAppealTypePopup = function() {
    const existing = document.getElementById('newAppealTypePopup');
    if (existing) { existing.remove(); return; }

    const popup = document.createElement('div');
    popup.id = 'newAppealTypePopup';
    popup.className = 'fixed inset-0 z-[8000] flex items-center justify-center p-4 pointer-events-none';
    popup.innerHTML = `
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 transition-opacity duration-200 pointer-events-auto" onclick="document.getElementById('newAppealTypePopup').remove()"></div>
        <div class="relative bg-surface-container-lowest border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm opacity-0 transition-all duration-500 ease-out pointer-events-auto overflow-hidden" id="newAppealTypePanel">
            <div class="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <div class="font-bold text-sm uppercase tracking-tight">Новое обращение</div>
                    <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5 uppercase tracking-widest">Выберите тип</div>
                </div>
                <button onclick="document.getElementById('newAppealTypePopup').remove()" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <span class="material-symbols-outlined text-base text-on-surface-variant">close</span>
                </button>
            </div>
            <div class="p-4 space-y-3">
                <button id="appealTypeOrder" class="w-full group flex items-center gap-4 p-4 rounded-2xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all text-left">
                    <div class="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-xl">inventory_2</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-sm uppercase tracking-wide">По заказу</div>
                        <div class="text-xs text-on-surface-variant opacity-60 mt-0.5">Вопрос по конкретному заказу</div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/30 group-hover:text-primary transition-colors">chevron_right</span>
                </button>
                <button id="appealTypeGeneral" class="w-full group flex items-center gap-4 p-4 rounded-2xl border border-outline/10 bg-surface-container hover:bg-[#5b9cf6]/5 hover:border-[#5b9cf6]/30 transition-all text-left">
                    <div class="w-12 h-12 rounded-xl bg-[#5b9cf6]/10 border border-[#5b9cf6]/20 flex items-center justify-center text-[#5b9cf6] group-hover:scale-110 transition-transform shrink-0">
                        <span class="material-symbols-outlined text-xl">help_outline</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="font-bold text-on-surface text-sm uppercase tracking-wide">Другой вопрос</div>
                        <div class="text-xs text-on-surface-variant opacity-60 mt-0.5">Общий, финансовый, технический</div>
                    </div>
                    <span class="material-symbols-outlined text-on-surface-variant/30 group-hover:text-[#5b9cf6] transition-colors">chevron_right</span>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    setTimeout(() => {
        const overlay = popup.querySelector('.absolute');
        const panel = document.getElementById('newAppealTypePanel');
        if (overlay) overlay.classList.remove('opacity-0');
        if (panel) { panel.classList.remove('opacity-0'); panel.style.transform = 'scale(1)'; }
    }, 10);

    // "По заказу" — выбор заказа из списка
    document.getElementById('appealTypeOrder').onclick = () => {
        const panel = document.getElementById('newAppealTypePanel');
        if (!panel) return;

        const orders = window.globalChatAllOrders || [];
        let ordersHtml = '';
        if (orders.length === 0) {
            ordersHtml = `<div class="p-6 text-center text-xs text-on-surface-variant opacity-60">У вас нет активных заказов</div>`;
        } else {
            ordersHtml = orders.map(o => {
                const dateStr = new Date(o.created_at).toLocaleDateString('ru-RU');
                const totalStr = Number(o.total || 0).toLocaleString('ru-RU');
                return `
                    <button class="w-full text-left p-3.5 rounded-2xl border border-[#964551]/20 bg-[#964551]/5 hover:bg-[#964551]/15 hover:border-[#964551]/45 transition-all flex flex-col gap-1 select-order-btn" data-id="${o.id}">
                        <div class="font-bold text-xs uppercase tracking-wide text-on-surface">Заказ #${o.id}</div>
                        <div class="text-[10px] text-on-surface-variant opacity-60">от ${dateStr} · ${totalStr} ₽</div>
                    </button>
                `;
            }).join('');
        }

        panel.innerHTML = `
            <div class="p-6 border-b border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button id="newAppealBackBtn" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all text-on-surface-variant hover:text-white">
                        <span class="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                    <div>
                        <div class="font-bold text-sm uppercase tracking-tight">Выберите заказ</div>
                        <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5 uppercase tracking-widest font-mono">Обращение по заказу</div>
                    </div>
                </div>
                <button onclick="document.getElementById('newAppealTypePopup').remove()" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <span class="material-symbols-outlined text-base text-on-surface-variant">close</span>
                </button>
            </div>
            <div class="p-4 space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                ${ordersHtml}
            </div>
        `;

        document.getElementById('newAppealBackBtn').onclick = () => {
            popup.remove();
            window.openNewAppealTypePopup();
        };

        panel.querySelectorAll('.select-order-btn').forEach(btn => {
            btn.onclick = () => {
                const orderId = btn.dataset.id;

                const exists = (window.globalChatTopics || []).some(t => t.type === 'order' && String(t.id) === String(orderId));
                if (exists) {
                    if (confirm('У вас уже есть обращение по этому заказу, перейти в него?')) {
                        popup.remove();
                        if (typeof window.switchGlobalChatFolder === 'function') {
                            window.switchGlobalChatFolder('order');
                        }
                        if (typeof window.selectGlobalChatTopicGlobal === 'function') {
                            window.selectGlobalChatTopicGlobal('order_' + orderId);
                        }
                        const input = document.getElementById('globalChatInput');
                        if (input) { input.focus(); }
                    }
                    return;
                }

                popup.remove();

                const orderObj = orders.find(o => String(o.id) === String(orderId));
                if (orderObj) {
                    const placeholderTopic = {
                        id: orderObj.id,
                        type: 'order',
                        title: `📦 Заказ #${orderObj.id} — ${Number(orderObj.total || 0).toLocaleString()} ₽`,
                        created_at: orderObj.created_at,
                        messages: orderObj.messages || []
                    };
                    if (!window.globalChatTopics) window.globalChatTopics = [];
                    window.globalChatTopics.unshift(placeholderTopic);
                }

                if (typeof window.switchGlobalChatFolder === 'function') {
                    window.switchGlobalChatFolder('order');
                }
                if (typeof window.selectGlobalChatTopicGlobal === 'function') {
                    window.selectGlobalChatTopicGlobal('order_' + orderId);
                }
                const input = document.getElementById('globalChatInput');
                if (input) { input.focus(); input.placeholder = 'Напишите ваш вопрос по заказу...'; }
            };
        });
    };

    // "Другой вопрос" — уточнение типа
    document.getElementById('appealTypeGeneral').onclick = () => {
        const panel = document.getElementById('newAppealTypePanel');
        if (!panel) return;

        const types = [
            { type: 'Общий вопрос', desc: 'Вопросы по работе сайта, условиям и т.д.' },
            { type: 'Финансовый вопрос', desc: 'Вопросы оплаты, счетов и возвратов' },
            { type: 'Техническая проблема', desc: 'Неполадки на сайте или в личном кабинете' }
        ];

        let typesHtml = types.map(t => {
            return `
                <button class="w-full text-left p-3.5 rounded-2xl border border-outline/10 bg-surface-container hover:bg-[#5b9cf6]/5 hover:border-[#5b9cf6]/30 transition-all flex flex-col gap-1 select-type-btn" data-type="${t.type}">
                    <div class="font-bold text-xs uppercase tracking-wide text-on-surface">${t.type}</div>
                    <div class="text-[10px] text-on-surface-variant opacity-60">${t.desc}</div>
                </button>
            `;
        }).join('');

        panel.innerHTML = `
            <div class="p-6 border-b border-white/5 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <button id="newAppealBackBtn" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all text-on-surface-variant hover:text-white">
                        <span class="material-symbols-outlined text-base">arrow_back</span>
                    </button>
                    <div>
                        <div class="font-bold text-sm uppercase tracking-tight">Выберите тему</div>
                        <div class="text-[10px] text-on-surface-variant opacity-60 mt-0.5 uppercase tracking-widest font-mono">Другие вопросы</div>
                    </div>
                </div>
                <button onclick="document.getElementById('newAppealTypePopup').remove()" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <span class="material-symbols-outlined text-base text-on-surface-variant">close</span>
                </button>
            </div>
            <div class="p-4 space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
                ${typesHtml}
            </div>
        `;

        document.getElementById('newAppealBackBtn').onclick = () => {
            popup.remove();
            window.openNewAppealTypePopup();
        };

        panel.querySelectorAll('.select-type-btn').forEach(btn => {
            btn.onclick = () => {
                const questionType = btn.dataset.type;
                popup.remove();

                // Calculate next ID for new appeal based on existing lead topics
                const leadTopics = (window.globalChatTopics || []).filter(t => t.type === 'lead' && t.id !== 'pending');
                const maxId = leadTopics.reduce((max, t) => Math.max(max, parseInt(t.id) || 0), 0);
                const nextId = maxId + 1;

                const pendingTopic = {
                    id: 'pending',
                    type: 'lead',
                    title: `✉️ Обращение #${nextId} — ${questionType}`,
                    created_at: new Date().toISOString(),
                    messages: [],
                    isPending: true,
                    pendingType: questionType
                };

                window.globalChatTopics = (window.globalChatTopics || []).filter(t => t.id !== 'pending');
                window.globalChatTopics.unshift(pendingTopic);

                if (typeof window.switchGlobalChatFolder === 'function') {
                    window.switchGlobalChatFolder('lead');
                }

                window.globalChatSelectedTopic = { type: 'lead', id: 'pending' };
                window.globalChatActiveMessages = [];
                window.renderGlobalChatMessagesGlobal();
                window.renderGlobalChatSidebarList();
                window.renderGlobalChatDropdownMenu();

                const input = document.getElementById('globalChatInput');
                if (input) { input.focus(); input.placeholder = 'Опишите ваш вопрос...'; }
            };
        });
    };
};

window.openGlobalChatDrawerGlobal = async function() {

    if (typeof window.cancelAllBulkActions === 'function') {
        window.cancelAllBulkActions();
    }

    const token = localStorage.getItem('metal_token');
    const userStr = localStorage.getItem('metal_user');
    let user = null;
    try { if (userStr) user = JSON.parse(userStr); } catch(e){}

    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');

    const modal = document.createElement('div');
    modal.id = 'globalChatDrawerModal';
    modal.className = 'fixed inset-0 z-[7000] flex items-end md:items-center justify-center p-0 md:p-4 pointer-events-none';
    
    if (!token || (!isAdmin && !user)) {
        modal.innerHTML = `
            <div class="absolute inset-0 bg-black/95 backdrop-blur-2xl opacity-0 transition-opacity duration-150 pointer-events-auto" onclick="this.parentElement.remove(); window.unlockScrollGlobal()"></div>
            <div class="relative liquid-glass p-6 md:p-10 max-w-lg w-full rounded-t-[2rem] md:rounded-[2.5rem] opacity-0 transition-all duration-500 ease-out pointer-events-auto shadow-2xl border border-white/10" id="globalChatModalPanel">
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

    window.switchGlobalChatFolder = function(folder) {
        window.globalChatFolder = folder;
        const btnOrders = document.getElementById('chat-folder-orders');
        const btnLeads = document.getElementById('chat-folder-leads');
        const btnOrdersMob = document.getElementById('chat-folder-orders-mobile');
        const btnLeadsMob = document.getElementById('chat-folder-leads-mobile');
        
        const activeClass = 'flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-[#0f0e0c] bg-[#ca7093] border border-[#ca7093]/20 hover:bg-[#964551] hover:text-white flex items-center justify-center gap-1.5';
        const inactiveClass = 'flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5';

        if (folder === 'order') {
            if(btnOrders) btnOrders.className = activeClass;
            if(btnLeads) btnLeads.className = inactiveClass;
            if(btnOrdersMob) btnOrdersMob.className = activeClass;
            if(btnLeadsMob) btnLeadsMob.className = inactiveClass;
        } else {
            if(btnLeads) btnLeads.className = activeClass;
            if(btnOrders) btnOrders.className = inactiveClass;
            if(btnLeadsMob) btnLeadsMob.className = activeClass;
            if(btnOrdersMob) btnOrdersMob.className = inactiveClass;
        }
        window.renderGlobalChatSidebarList();
        
        // Update dropdown placeholder for current folder
        const dropdownLabel = document.getElementById('globalChatDropdownLabel');
        if (dropdownLabel && !window.globalChatSelectedTopic) {
            dropdownLabel.textContent = 'Выберите заказ/обращение';
            dropdownLabel.classList.add('opacity-50');
        }

        const filtered = (window.globalChatTopics || []).filter(t => t.type === folder);
        
        if (window.globalChatSelectedTopic && window.globalChatSelectedTopic.type === folder) {
            window.selectGlobalChatTopicGlobal(window.globalChatSelectedTopic.type + '_' + window.globalChatSelectedTopic.id);
        } else if (filtered.length > 0 && isAdmin) {
            window.selectGlobalChatTopicGlobal(filtered[0].type + '_' + filtered[0].id);
        } else {
            window.globalChatSelectedTopic = null;
            window.globalChatActiveMessages = [];
            window.renderGlobalChatSidebarList();
            window.renderGlobalChatDropdownMenu();
            window.renderGlobalChatWelcomeScreen();
        }
    };

    window.filterGlobalChats = function() {
        window.renderGlobalChatSidebarList();
    };

    window.renderGlobalChatSidebarList = function() {
        const list = document.getElementById('activeChatsList');
        if (!list) return;

        const formatChatTime = (timestamp) => {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const now = new Date();
            
            const isToday = date.toDateString() === now.toDateString();
            
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const isYesterday = date.toDateString() === yesterday.toDateString();
            
            if (isToday) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (isYesterday) {
                return 'Вчера';
            } else {
                const diffTime = Math.abs(now - date);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays < 7) {
                    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                    return days[date.getDay()];
                } else {
                    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                }
            }
        };

        const folder = window.globalChatFolder || 'order';
        const topics = window.globalChatTopics || [];
        const searchVal = (document.getElementById('chatSearchInput')?.value || '').toLowerCase();

        const myRole = (window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html')) ? 'admin' : 'client';
        let readTimes = {};
        try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}

        const getTopicUnreadCount = (t) => {
            const topicKey = t.type + '_' + t.id;
            const lastRead = readTimes[topicKey] || 0;
            const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
            return msgs.filter(m => m.sender !== myRole && new Date(m.timestamp).getTime() > lastRead).length;
        };

        const filtered = topics.filter(t => {
            if (t.type !== folder) return false;
            if (searchVal) {
                return t.title.toLowerCase().includes(searchVal) || (t.id && String(t.id).includes(searchVal));
            }
            return true;
        }).sort((a, b) => {
            const unreadCountA = getTopicUnreadCount(a);
            const unreadCountB = getTopicUnreadCount(b);
            
            if (unreadCountA !== unreadCountB) {
                return unreadCountB - unreadCountA;
            }
            
            const getLatestTime = (t) => {
                const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
                if (msgs.length > 0) {
                    return new Date(msgs[msgs.length - 1].timestamp).getTime();
                }
                return t.created_at ? new Date(t.created_at).getTime() : 0;
            };
            return getLatestTime(b) - getLatestTime(a);
        });

        if (!list) return;

        if (filtered.length === 0) {
            list.innerHTML = `<div class="p-6 text-center text-[10px] uppercase font-bold text-on-surface-variant/30 tracking-widest">Нет диалогов</div>`;
            return;
        }

        const unreadHTML = [];
        const readHTML = [];
        let totalUnreadCount = 0;

        filtered.forEach(t => {
            const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            const timestamp = lastMsg ? lastMsg.timestamp : t.created_at;
            const time = formatChatTime(timestamp);
            const previewText = lastMsg ? lastMsg.text : 'Нет сообщений';
            const isSelected = window.globalChatSelectedTopic && window.globalChatSelectedTopic.type === t.type && String(window.globalChatSelectedTopic.id) === String(t.id);
            
            const topicKey = t.type + '_' + t.id;
            const unreadInTopic = getTopicUnreadCount(t);
            const badgeHtml = unreadInTopic > 0 ? `<span class="bg-[#ca7093] text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">${unreadInTopic}</span>` : '';
            
            let activeClass = 'border-transparent text-on-surface hover:bg-white/5';
            if (isSelected) activeClass = 'bg-[#ca7093]/10 border-[#ca7093] text-primary';
            else if (unreadInTopic > 0) activeClass = 'unread-chat-item bg-[#ca7093]/10 border-transparent text-on-surface';
            
            const cardHtml = `
                <div onclick="window.selectGlobalChatTopicGlobal('${topicKey}')" class="p-4 border-l-2 cursor-pointer transition-all ${activeClass} flex flex-col gap-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold uppercase tracking-wider opacity-90">${t.type === 'order' ? 'Заказ #' + t.id : 'Обращение #' + t.id}</span>
                        <span class="text-[9px] text-on-surface-variant opacity-50 font-mono">${time}</span>
                    </div>
                    <div class="text-xs font-semibold truncate flex items-center justify-between">
                        <span>${t.title.split(' — ')[1] || t.title}</span>
                        ${badgeHtml}
                    </div>
                    <div class="text-[10px] text-on-surface-variant truncate opacity-60">${previewText}</div>
                </div>
            `;

            if (unreadInTopic > 0) {
                unreadHTML.push(cardHtml);
                totalUnreadCount += unreadInTopic;
            } else {
                readHTML.push(cardHtml);
            }
        });

        let finalHtml = '';
        if (unreadHTML.length > 0) {
            finalHtml += `
                <div class="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                    <span class="text-[10px] font-black tracking-widest text-[#ca7093] uppercase">НЕПРОЧИТАННЫЕ</span>
                    <span class="bg-[#ca7093] text-white text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center">${totalUnreadCount}</span>
                </div>
                ${unreadHTML.join('')}
            `;
        }
        if (readHTML.length > 0) {
            finalHtml += `
                <div class="px-4 py-3 border-b border-white/5 bg-white/[0.01] mt-2">
                    <span class="text-[10px] font-black tracking-widest text-on-surface-variant opacity-60 uppercase">ПРОЧИТАННЫЕ</span>
                </div>
                ${readHTML.join('')}
            `;
        }

        list.innerHTML = finalHtml;

        // Update sidebar folder tab badges
        const myRoleForBadge = (window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html')) ? 'admin' : 'client';
        let readTimesForBadge = {};
        try { readTimesForBadge = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}
        const allTopics = window.globalChatTopics || [];
        const countUnreadForFolder = (folderType) => {
            return allTopics.filter(t => t.type === folderType).reduce((acc, t) => {
                const key = t.type + '_' + t.id;
                const lastRead = readTimesForBadge[key] || 0;
                const msgs = typeof t.messages === 'string' ? (() => { try { return JSON.parse(t.messages); } catch(e) { return []; } })() : (t.messages || []);
                return acc + msgs.filter(m => m.sender !== myRoleForBadge && new Date(m.timestamp).getTime() > lastRead).length;
            }, 0);
        };
        const badgeOrders = document.getElementById('sidebar-badge-orders');
        const badgeLeads = document.getElementById('sidebar-badge-leads');
        const badgeOrdersMob = document.getElementById('sidebar-badge-orders-mobile');
        const badgeLeadsMob = document.getElementById('sidebar-badge-leads-mobile');
        const unreadOrders = countUnreadForFolder('order');
        const unreadLeads = countUnreadForFolder('lead');
        if (badgeOrders) {
            if (unreadOrders > 0) { badgeOrders.textContent = unreadOrders > 9 ? '9+' : unreadOrders; badgeOrders.classList.remove('hidden'); }
            else { badgeOrders.classList.add('hidden'); }
        }
        if (badgeLeads) {
            if (unreadLeads > 0) { badgeLeads.textContent = unreadLeads > 9 ? '9+' : unreadLeads; badgeLeads.classList.remove('hidden'); }
            else { badgeLeads.classList.add('hidden'); }
        }
        if (badgeOrdersMob) {
            if (unreadOrders > 0) { badgeOrdersMob.textContent = unreadOrders > 9 ? '9+' : unreadOrders; badgeOrdersMob.classList.remove('hidden'); }
            else { badgeOrdersMob.classList.add('hidden'); }
        }
        if (badgeLeadsMob) {
            if (unreadLeads > 0) { badgeLeadsMob.textContent = unreadLeads > 9 ? '9+' : unreadLeads; badgeLeadsMob.classList.remove('hidden'); }
            else { badgeLeadsMob.classList.add('hidden'); }
        }

        // Update custom dropdown
        if (typeof window.renderGlobalChatDropdownMenu === 'function') window.renderGlobalChatDropdownMenu();
    };

    modal.innerHTML = `
        <div class="absolute inset-0 bg-black/90 backdrop-blur-xl opacity-0 transition-opacity duration-150 pointer-events-auto" onclick="window.closeGlobalChatDrawerGlobal()"></div>
        <div class="relative bg-surface-container-lowest shadow-2xl border border-outline-variant/10 transition-all duration-500 rounded-t-3xl md:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl border border-white/5 pointer-events-auto w-full max-w-4xl h-[90vh] md:h-[650px] max-h-[90vh] md:max-h-[85vh]" id="globalChatModalPanel">
            <header class="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-surface-container-high/80 backdrop-blur-xl shrink-0">
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
                    ${!isAdmin ? `
                    <button onclick="window.openNewAppealTypePopup()" class="h-10 px-3 sm:px-4 flex items-center justify-center gap-1.5 rounded-xl bg-[#ca7093]/10 border border-[#ca7093]/20 text-[#ca7093] hover:bg-[#ca7093]/25 hover:text-white transition-all font-bold text-[10px] uppercase tracking-widest shrink-0" title="Создать новое обращение">
                        <span class="material-symbols-outlined text-sm">edit_note</span>
                        <span class="hidden sm:inline">Новое обращение</span>
                    </button>
                    ` : ''}
                    <button onclick="window.closeGlobalChatDrawerGlobal()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-on-surface-variant hover:text-white hover:bg-white/10 transition-all">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </header>

            <div class="flex-1 flex overflow-hidden relative">
                <div class="w-full md:w-72 border-r border-white/5 overflow-y-auto hidden md:flex flex-col bg-surface-container-lowest shrink-0" id="chatListSidebar">
                    <div class="p-4 border-b border-white/5 space-y-3">
                        <div class="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                            <button id="chat-folder-orders" onclick="window.switchGlobalChatFolder('order')" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-[#0f0e0c] bg-[#ca7093] border border-[#ca7093]/20 flex items-center justify-center gap-1.5">Заказы<span id="sidebar-badge-orders" class="hidden bg-white text-[#ca7093] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                            <button id="chat-folder-leads" onclick="window.switchGlobalChatFolder('lead')" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5">Обращения<span id="sidebar-badge-leads" class="hidden bg-[#ca7093] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                        </div>
                        <input type="text" id="chatSearchInput" oninput="window.filterGlobalChats()" placeholder="Поиск..." class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/30"/>
                    </div>
                    <div id="activeChatsList" class="divide-y divide-white/5 flex-1 overflow-y-auto custom-scrollbar">
                        <div class="p-10 text-center text-[10px] uppercase font-bold text-on-surface-variant/30 tracking-widest">Загрузка...</div>
                    </div>
                </div>

                <div class="flex-1 flex flex-col bg-surface-container-low border border-outline-variant/10 transition-all duration-500 rounded-xl md:rounded-2xl shadow-inner flex flex-col shadow-2xl border border-white/5 overflow-hidden">
                    <div class="absolute inset-0 opacity-[0.02] pointer-events-none" style="background-image: radial-gradient(#964551 1px, transparent 1px); background-size: 32px 32px;"></div>
                    
                    <div class="px-4 py-3 bg-surface-container-high/90 backdrop-blur-xl border-b border-white/5 flex flex-col md:flex-row md:items-center gap-3 md:gap-0 shrink-0 z-20 relative">
                        <div class="flex md:hidden gap-1 bg-white/5 p-1 rounded-xl border border-white/5 w-full">
                            <button id="chat-folder-orders-mobile" onclick="window.switchGlobalChatFolder('order')" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-[#0f0e0c] bg-[#ca7093] border border-[#ca7093]/20 flex items-center justify-center gap-1.5">Заказы<span id="sidebar-badge-orders-mobile" class="hidden bg-white text-[#ca7093] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                            <button id="chat-folder-leads-mobile" onclick="window.switchGlobalChatFolder('lead')" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5">Обращения<span id="sidebar-badge-leads-mobile" class="hidden bg-[#ca7093] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                        </div>
                        <div class="w-full max-w-full relative" id="globalChatDropdownWrapper">
                            <button id="globalChatDropdownBtn" onclick="window.toggleGlobalChatDropdown()" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none font-body-md flex items-center justify-between gap-2 hover:border-primary/30 transition-all cursor-pointer">
                                <span id="globalChatDropdownLabel" class="truncate opacity-50">Выберите заказ/обращение</span>
                                <span class="material-symbols-outlined text-base text-on-surface-variant/50 shrink-0 transition-transform" id="globalChatDropdownArrow">expand_more</span>
                            </button>
                            <div id="globalChatDropdownMenu" class="hidden absolute left-0 right-0 top-full mt-1 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Messages Container -->
                    <div id="globalChatMessagesContainer" class="flex-1 overflow-y-auto custom-scrollbar relative z-10 flex flex-col">
                        <!-- Loading state shown while data is fetching -->
                        <div id="chatLoadingState" class="flex flex-col items-center justify-center h-full py-8 px-4">
                            <div class="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                            <p class="text-xs text-on-surface-variant opacity-40 uppercase tracking-widest font-bold">Загрузка...</p>
                        </div>
                    </div>

                    <!-- Input Area -->
                    <div class="p-4 md:p-8 bg-surface-container-high/90 backdrop-blur-xl border-t border-outline-variant/10 shrink-0 z-20">
                        <div class="relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/40 transition-all shadow-sm">
                            <textarea id="globalChatInput" placeholder="Напишите сообщение..." class="flex-1 bg-transparent border-0 focus:ring-0 text-sm md:text-base text-on-surface py-2 px-3 resize-none max-h-32 outline-none h-10 custom-scrollbar" rows="1"></textarea>
                            <button id="globalChatSendBtn" onclick="window.sendGlobalChatMessageGlobal()" class="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">
                                <span class="material-symbols-outlined text-xl md:text-2xl">send</span>
                            </button>
                        </div>
                    </div>
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

        // Close dropdown on outside click
        document.addEventListener('click', function onOutsideClick(e) {
            const wrapper = document.getElementById('globalChatDropdownWrapper');
            if (wrapper && !wrapper.contains(e.target)) {
                window.closeGlobalChatDropdown();
            }
            if (!document.getElementById('globalChatDrawerModal')) {
                document.removeEventListener('click', onOutsideClick);
            }
        });
    }, 10);

    try {
        if (isAdmin) {
            const res = await fetch('/api/admin/chat-topics', { headers: { 'Authorization': 'Bearer ' + token } });
            if (res.ok) {
                window.globalChatTopics = await res.json();
                window.switchGlobalChatFolder(window.globalChatFolder || 'order');
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

            window.globalChatAllOrders = orders; // Save all user's orders

            const orderTopics = orders
                .filter(o => {
                    // Показываем только заказы с сообщениями в чате
                    const msgs = o.messages || [];
                    const parsedMsgs = typeof msgs === 'string' ? (() => { try { return JSON.parse(msgs); } catch(e) { return []; } })() : msgs;
                    return parsedMsgs.length > 0;
                })
                .map(o => ({
                id: o.id,
                type: 'order',
                title: `📦 Заказ #${o.id} — ${Number(o.total || 0).toLocaleString()} ₽`,
                created_at: o.created_at,
                messages: o.messages || []
            }));
            const leadTopics = leads.filter(l => {
                return ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && l.type.startsWith('Заказ #'));
            }).map(l => ({
                id: l.id,
                type: 'lead',
                title: `✉️ Обращение #${l.id} — ${l.type || 'Вопрос'}`,
                created_at: l.created_at,
                messages: l.messages || []
            }));

            window.globalChatTopics = [...orderTopics, ...leadTopics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            window.switchGlobalChatFolder(window.globalChatFolder || 'order');
        }
    } catch(e) { console.warn('Global chat load error:', e); }

    const input = document.getElementById('globalChatInput');
    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                if (e.ctrlKey) {
                    const start = input.selectionStart;
                    const end = input.selectionEnd;
                    input.value = input.value.substring(0, start) + "\n" + input.value.substring(end);
                    input.selectionStart = input.selectionEnd = start + 1;
                    input.dispatchEvent(new Event('input'));
                    e.preventDefault();
                } else {
                    e.preventDefault();
                    window.sendGlobalChatMessageGlobal();
                }
            }
        };
    }
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

window.selectGlobalChatTopicGlobal = async function(val) {
    if (!val) return;
    window.markTopicAsReadGlobal(val);
    const [type, id] = val.split('_');
    window.globalChatSelectedTopic = { type, id };

    const input = document.getElementById('globalChatInput');
    if (input) input.placeholder = 'Напишите сообщение...';

    // Update custom dropdown label
    const label = document.getElementById('globalChatDropdownLabel');
    const topicForLabel = (window.globalChatTopics || []).find(t => t.type === type && String(t.id) === String(id));
    if (topicForLabel && label) {
        const shortTitle = topicForLabel.title.includes(' — ') ? topicForLabel.title.split(' — ').slice(0, 1).join(' — ') : topicForLabel.title;
        label.textContent = shortTitle;
        label.classList.remove('opacity-50');
    }

    const topic = (window.globalChatTopics || []).find(t => t.type === type && String(t.id) === String(id));
    if (!topic) return;

    let messages = [];
    try {
        if (typeof topic.messages === 'string') messages = JSON.parse(topic.messages);
        else if (Array.isArray(topic.messages)) messages = topic.messages;
    } catch(e){}
    window.globalChatActiveMessages = messages;

    window.renderGlobalChatMessagesGlobal();

    // Dynamically load Supabase client library if it hasn't been loaded on this page
    if (!window.supabase) {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch(e) {
            console.error('Failed to dynamically load Supabase JS library:', e);
            return;
        }
    }

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

    if (id !== 'pending') {
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
                    window.markTopicAsReadGlobal(val);
                }
            }).subscribe();
    }
    window.renderGlobalChatSidebarList();
};

window.renderGlobalChatMessagesGlobal = function() {
    const chatBox = document.getElementById('globalChatMessagesContainer');
    if (!chatBox) return;
    const messages = window.globalChatActiveMessages || [];
    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');

    if (!messages.length) {
        chatBox.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6 animate-in fade-in duration-500 ease-out">
                <span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span>
                <span class="text-sm font-bold uppercase tracking-widest font-['Space Grotesk'] text-on-surface">${isAdmin ? 'Чат с клиентом' : 'Чат с менеджером'}</span>
                <span class="text-xs opacity-70 mt-1 max-w-xs leading-relaxed">Здесь будет сохраняться вся история переписки. Напишите первое сообщение ниже.</span>
            </div>
        `;
        return;
    }

    chatBox.innerHTML = messages.map(m => {
        const isMe = isAdmin ? m.sender === 'admin' : m.sender === 'client';
        const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        if (isMe) {
            return `
                <div class="flex flex-col items-end mb-4 animate-in fade-in duration-500 ease-out">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="relative px-5 pt-3 pb-5 pr-14 rounded-3xl text-sm bg-primary text-on-primary rounded-br-none shadow-md font-medium leading-relaxed break-words">
                            <span class="block">${m.text}</span>
                            <span class="absolute bottom-1 right-2.5 flex items-center gap-0.5 text-[9px] opacity-60 font-mono select-none pointer-events-none text-on-primary">
                                ${timeStr}
                                <span class="material-symbols-outlined text-[11px] leading-none text-on-primary">done_all</span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start mb-4 animate-in fade-in duration-500 ease-out">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="relative px-5 pt-3 pb-5 pr-10 rounded-3xl text-sm bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-bl-none shadow-md leading-relaxed break-words animate-in fade-in duration-500 ease-out">
                            <span class="block">${m.text}</span>
                            <span class="absolute bottom-1 right-2.5 flex items-center gap-0.5 text-[9px] opacity-50 font-mono select-none pointer-events-none">
                                ${timeStr}
                            </span>
                        </div>
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
    if (!text) return;

    if (!window.globalChatSelectedTopic) {
        alert('Пожалуйста, выберите заказ/обращение или нажмите «Создать обращение».');
        return;
    }

    const { type, id } = window.globalChatSelectedTopic;

    // Handle creation of pending lead on first message
    if (type === 'lead' && id === 'pending') {
        const userStr = localStorage.getItem('metal_user');
        let user = null;
        try { if (userStr) user = JSON.parse(userStr); } catch(e){}
        const token = localStorage.getItem('metal_token');
        if (!token) return;

        try {
            if (input) input.disabled = true;
            const sendBtn = document.getElementById('globalChatSendBtn');
            if (sendBtn) sendBtn.disabled = true;

            const pendingTopic = (window.globalChatTopics || []).find(t => t.type === 'lead' && String(t.id) === 'pending');
            const questionType = pendingTopic?.pendingType || 'Общий вопрос';

            const createRes = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({
                    name: user?.name || 'Клиент',
                    phone: user?.phone || 'Не указан',
                    email: user?.email || 'Не указан',
                    message: text,
                    type: questionType
                })
            });

            if (!createRes.ok) throw new Error('Failed to create lead');

            // Remove the pending placeholder topic
            window.globalChatTopics = (window.globalChatTopics || []).filter(t => t.id !== 'pending');

            const [ordersRes, leadsRes] = await Promise.all([
                fetch('/api/orders/my', { headers: { 'Authorization': 'Bearer ' + token } }),
                fetch('/api/leads/my', { headers: { 'Authorization': 'Bearer ' + token } })
            ]);
            let orders = [];
            let leads = [];
            if (ordersRes.ok) orders = await ordersRes.json();
            if (leadsRes.ok) leads = await leadsRes.json();

            const orderTopics = orders
                .filter(o => {
                    const msgs = o.messages || [];
                    const parsedMsgs = typeof msgs === 'string' ? (() => { try { return JSON.parse(msgs); } catch(e) { return []; } })() : msgs;
                    return parsedMsgs.length > 0;
                })
                .map(o => ({
                id: o.id,
                type: 'order',
                title: `📦 Заказ #${o.id} — ${Number(o.total || 0).toLocaleString()} ₽`,
                created_at: o.created_at,
                messages: o.messages || []
            }));
            const leadTopics = leads.filter(l => {
                return ['Общий вопрос', 'Финансовый вопрос', 'Техническая проблема'].includes(l.type) || (l.type && l.type.startsWith('Заказ #'));
            }).map(l => ({
                id: l.id,
                type: 'lead',
                title: `✉️ Обращение #${l.id} — ${l.type || 'Вопрос'}`,
                created_at: l.created_at,
                messages: l.messages || []
            }));

            window.globalChatTopics = [...orderTopics, ...leadTopics].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            const newLeadTopic = leadTopics.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            
            if (input) {
                input.value = '';
                input.disabled = false;
                input.placeholder = 'Напишите сообщение...';
            }
            if (sendBtn) sendBtn.disabled = false;

            if (newLeadTopic) {
                window.selectGlobalChatTopicGlobal('lead_' + newLeadTopic.id);
            } else {
                window.switchGlobalChatFolder('lead');
            }
        } catch (err) {
            console.error('Failed to create lead:', err);
            if (input) input.disabled = false;
            const sendBtn = document.getElementById('globalChatSendBtn');
            if (sendBtn) sendBtn.disabled = false;
            alert('Не удалось отправить сообщение. Пожалуйста, попробуйте позже.');
        }
        return;
    }

    const isAdmin = window.location.pathname.includes('/admin') || window.location.pathname.includes('admin.html');
    const sender = isAdmin ? 'admin' : 'client';
    const newMsg = { sender, text, timestamp: new Date().toISOString() };
    
    window.globalChatActiveMessages.push(newMsg);
    input.value = '';
    window.renderGlobalChatMessagesGlobal();
    window.renderGlobalChatSidebarList();

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
            window.renderGlobalChatSidebarList();
        }
    } catch(e) {
        window.globalChatActiveMessages.pop();
        window.renderGlobalChatMessagesGlobal();
        window.renderGlobalChatSidebarList();
    }
};


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
        box-shadow: 0 4px 14px rgba(202, 112, 147, 0.25) !important;
    }
    .custom-select-trigger.is-active {
        background: #151311 !important;
        color: #c7c5c5;
        box-shadow: 0 4px 14px rgba(202, 112, 147, 0.3) !important;
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
        background: rgba(202, 112, 147, 0.1);
        color: #c7c5c5;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
    }
    .custom-select-option.is-selected {
        background: rgba(202, 112, 147, 0.15);
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
        background: rgba(255, 255, 255, 0.45) !important;
        backdrop-filter: blur(20px) saturate(150%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(150%) !important;
        border: 1px solid rgba(255, 255, 255, 0.7) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05) !important;
        outline: none !important;
        color: #151311 !important;
    }
    html.light .custom-select-trigger:hover,
    html.light .custom-select-trigger.is-active {
        background: rgba(255, 255, 255, 0.65) !important;
        border: 1px solid rgba(255, 255, 255, 0.9) !important;
        box-shadow: 0 4px 14px rgba(150, 69, 81, 0.25) !important;
        color: #964551 !important;
        outline: none !important;
    }
    html.light .custom-select-arrow {
        color: #964551 !important;
    }
    html.light .custom-select-popup {
        background: rgba(255, 255, 255, 0.45) !important;
        backdrop-filter: blur(25px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(25px) saturate(180%) !important;
        border: 1px solid rgba(255, 255, 255, 0.7) !important;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12) !important;
        outline: none !important;
    }
    html.light .custom-select-option {
        color: #151311 !important;
        border: none !important;
        border-width: 0 !important;
        border-style: none !important;
        outline: none !important;
        background: transparent !important;
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
                
                const optDivStyles = 'display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;';
                
                for (let i = 0; i < options.length; i++) {
                    const opt = options[i];
                    const optDiv = document.createElement('div');
                    optDiv.className = 'custom-select-option';
                    optDiv.style.cssText = optDivStyles;
                    optDiv.setAttribute('data-value', opt.value);
                    
                    let cleanText = opt.textContent;
                    let badgeHtml = '';
                    const match = cleanText.match(/\((\d+)\s+нов\.\)/);
                    if (match) {
                        const count = match[1];
                        cleanText = cleanText.replace(/\(\d+\s+нов\.\)/, '').trim();
                        badgeHtml = `<span class="bg-[#ca7093] text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-auto shrink-0">${count}</span>`;
                    }
                    
                    optDiv.innerHTML = `<span class="truncate">${cleanText}</span>${badgeHtml}`;
                    
                    if (opt.selected) {
                        optDiv.classList.add('is-selected');
                        textSpan.innerHTML = `<span class="flex items-center justify-between w-full mr-2"><span class="truncate">${cleanText}</span>${badgeHtml}</span>`;
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
                
                if (!textSpan.innerHTML && options.length > 0) {
                    const firstOpt = options[0];
                    let cleanText = firstOpt.textContent;
                    let badgeHtml = '';
                    const match = cleanText.match(/\((\d+)\s+нов\.\)/);
                    if (match) {
                        const count = match[1];
                        cleanText = cleanText.replace(/\(\d+\s+нов\.\)/, '').trim();
                        badgeHtml = `<span class="bg-[#ca7093] text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-auto shrink-0">${count}</span>`;
                    }
                    textSpan.innerHTML = `<span class="flex items-center justify-between w-full mr-2"><span class="truncate">${cleanText}</span>${badgeHtml}</span>`;
                }
            }
            
            rebuildOptions();
            
            function positionPopup() {
                const triggerRect = trigger.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                const popupMaxH = 200;
                const spaceBelow = viewportHeight - triggerRect.bottom;
                const spaceAbove = triggerRect.top;

                // Clamp width to available space
                const desiredWidth = triggerRect.width;
                const clampedLeft = Math.max(8, Math.min(triggerRect.left, viewportWidth - desiredWidth - 8));
                popup.style.width = Math.min(desiredWidth, viewportWidth - 16) + 'px';
                popup.style.left = clampedLeft + 'px';

                if (spaceBelow >= Math.min(popupMaxH, 120) || spaceBelow >= spaceAbove) {
                    // Open downward — clamp to viewport bottom
                    popup.style.top = (triggerRect.bottom + 6) + 'px';
                    popup.style.bottom = 'auto';
                    popup.style.maxHeight = Math.min(popupMaxH, viewportHeight - triggerRect.bottom - 16) + 'px';
                    popup.style.transformOrigin = 'top center';
                } else {
                    // Open upward — clamp to viewport top
                    const maxUp = Math.min(popupMaxH, triggerRect.top - 16);
                    popup.style.bottom = (viewportHeight - triggerRect.top + 6) + 'px';
                    popup.style.top = 'auto';
                    popup.style.maxHeight = maxUp + 'px';
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
            let resizeTicking = false;
            window.addEventListener('scroll', () => {
                if (!resizeTicking) {
                    window.requestAnimationFrame(() => {
                        onScrollResize();
                        resizeTicking = false;
                    });
                    resizeTicking = true;
                }
            }, { passive: true });
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
            filter: brightness(0.85);
        }
        /* Light Theme defaults */
        html.light .map-container-wrapper iframe,
        html:not(.dark) .map-container-wrapper iframe {
            filter: brightness(0.97);
        }
        /* Active (Interacting) state */
        .map-container-wrapper.active iframe {
            pointer-events: auto !important;
            filter: brightness(1) !important;
        }
        /* Liquid Glass Frosted Overlay */
        .map-container-wrapper::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 5;
            pointer-events: none;
            backdrop-filter: blur(5px) saturate(120%);
            -webkit-backdrop-filter: blur(5px) saturate(120%);
            background: rgba(255, 255, 255, 0.12);
            transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        html.dark .map-container-wrapper::before {
            background: rgba(21, 19, 17, 0.35);
            backdrop-filter: blur(5px) saturate(100%);
            -webkit-backdrop-filter: blur(5px) saturate(100%);
        }
        .map-container-wrapper.active::before {
            opacity: 0;
            backdrop-filter: blur(0px) saturate(100%);
            -webkit-backdrop-filter: blur(0px) saturate(100%);
        }
        /* Glassmorphic Interaction Badge */
        .map-container-wrapper::after {
            content: 'Нажмите для взаимодействия с картой';
            position: absolute;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(12px) saturate(120%);
            -webkit-backdrop-filter: blur(12px) saturate(120%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: #151311;
            padding: 10px 20px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 9999px;
            pointer-events: none;
            opacity: 0.95;
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            z-index: 10;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }
        html.dark .map-container-wrapper::after {
            background: rgba(21, 19, 17, 0.65);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #e7e2dd;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .map-container-wrapper.active::after {
            opacity: 0;
            transform: translate(-50%, 12px);
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

    // --- USER SESSION: SLIDING TOKEN REFRESH (no auto-logout) ---
    // Sessions persist indefinitely until the user explicitly logs out.
    (function() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch(...args);
                // Silently capture refreshed tokens from the server
                const newToken = response.headers.get('x-session-token');
                if (newToken) {
                    localStorage.setItem('metal_token', newToken);
                    if (window.setCookieGlobal) {
                        window.setCookieGlobal('metal_token', newToken, 365);
                    }
                }
                return response;
            } catch(e) {
                return originalFetch(...args);
            }
        };
    })();
})();

/* ==========================================
   PRODUCT DETAILS CARD MODAL (SHARED)
   ========================================== */



window.openProductCardModal = async function(productId) {
    if (!productId) return;
    window.currentProductIdModal = productId;
    if (window.updatePresenceStateGlobal) window.updatePresenceStateGlobal();
    
    let overlay = document.getElementById('product-card-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'product-card-modal-overlay';
        overlay.className = 'fixed inset-0 z-[7000] flex items-end md:items-center justify-center p-0 md:p-6 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-500 ease-out pointer-events-auto';
        overlay.innerHTML = `
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" id="product-card-modal-backdrop"></div>
            <div class="relative w-full max-w-2xl bg-surface-container border border-outline/20 rounded-t-[2rem] md:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col transform translate-y-full md:translate-y-0 md:scale-95 transition-transform duration-500 ease-out min-h-0 text-on-surface p-4 md:p-8 max-h-[90vh] md:max-h-[85vh]">
                <div class="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mb-4 md:hidden"></div>
                <button id="close-product-card-modal" class="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-all text-on-surface-variant hover:text-primary hover:scale-110 active:scale-90 z-20" title="Закрыть">
                    <span class="material-symbols-outlined text-xl">close</span>
                </button>
                <div class="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant opacity-50">
                    <span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                    <span class="font-label-caps text-xs uppercase tracking-widest mt-2">Загрузка карточки товара...</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    if (typeof window.lockScrollGlobal === 'function') window.lockScrollGlobal();
    
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.querySelector('div.relative').classList.remove('scale-95');
    });

    const close = () => {
        overlay.classList.add('opacity-0');
        overlay.querySelector('div.relative').classList.add('scale-95');
        setTimeout(() => {
            overlay.remove();
            if (typeof window.unlockScrollGlobal === 'function') window.unlockScrollGlobal();
        }, 300);
    };

    overlay.querySelector('#close-product-card-modal').onclick = close;
    overlay.querySelector('#product-card-modal-backdrop').onclick = close;

    try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Товар не найден в базе данных');
        let p = await res.json();

        if (window.parseUniversalSpecs) {
            p = window.parseUniversalSpecs(p);
        }

        const name = p.name || '';
        const category = p.category || p.parent_category || 'Металлопрокат';
        const description = p.description || p.desc || 'Описание для данного товара временно отсутствует.';
        const vstatus = p.vstatus || 'active';
        const rawImage = p.image || p.img || '';
        const images = rawImage ? rawImage.split(',') : [''];
        const mainImage = images[0] || '';
        const specs = p.specs || [];

        const isGost = description.toLowerCase().includes('гост');
        const isSteelGrade = specs.find(s => s[0] && (s[0].toLowerCase().includes('стали') || s[0].toLowerCase().includes('марка')))?.[1];

        let galleryHtml = '';
        if (images.length > 1) {
            galleryHtml = `
            <div class="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-2">
                ${images.map((img, i) => `
                    <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-primary' : 'border-transparent'} cursor-pointer hover:border-primary/50 transition-all" onclick="document.getElementById('main-modal-image-${p.id}').src='${img}'; Array.from(this.parentElement.children).forEach(c => c.classList.replace('border-primary', 'border-transparent')); this.classList.replace('border-transparent', 'border-primary');">
                        <img src="${img}" class="w-full h-full object-cover" alt="Миниатюра"/>
                    </div>
                `).join('')}
            </div>`;
        }

        let lengthVal = p.mLenVal || 6;
        let weightVal = p.wUnitVal || 1;
        let areaVal = p.m2Val || 1;
        
        let priceTon = parseFloat(p.price_ton || p.priceTonNum || 0);
        let priceUnitInput = parseFloat(p.price_unit || p.priceUnitNum || 0);
        
        let priceWhip = priceUnitInput > 0 ? priceUnitInput : 0;
        if (priceWhip === 0 && priceTon > 0) {
            priceWhip = Math.round((priceTon / 1000) * weightVal * (p.calcType === 'linear' ? lengthVal : 1));
        }
        
        let priceMeter = 0;
        if (p.calcType === 'linear') {
            priceMeter = priceWhip > 0 ? Math.round(priceWhip / lengthVal) : 0;
            if (priceMeter === 0 && priceTon > 0) {
                priceMeter = Math.round((priceTon / 1000) * weightVal);
            }
        } else if (p.calcType === 'area') {
            priceMeter = priceWhip > 0 ? Math.round(priceWhip / areaVal) : 0;
            if (priceMeter === 0 && priceTon > 0) {
                priceMeter = Math.round((priceTon / 1000) * (weightVal / areaVal));
            }
        }

        const priceTonFmt = priceTon > 0 ? priceTon.toLocaleString('ru-RU') : 'По запросу';
        const priceWhipFmt = priceWhip > 0 ? priceWhip.toLocaleString('ru-RU') : 'По запросу';
        const priceMeterFmt = priceMeter > 0 ? priceMeter.toLocaleString('ru-RU') : 'По запросу';

        const opt1Label = p.calcType === 'area' ? 'Цена за лист' : (p.isSheet ? 'Цена за штуку' : 'Цена за хлыст');
        const opt2Label = p.calcType === 'area' ? 'Цена за м2' : 'Цена за метр';

        const purchaseBlockHtml = `
            <div class="space-y-4 bg-surface-container-low/30 p-5 rounded-3xl border border-outline-variant/10 shadow-sm text-on-surface">
                <div class="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                    <span class="text-lg font-bold font-display text-on-surface">Стоимость</span>
                    <div class="flex flex-col items-end gap-1">
                        <div class="flex items-center gap-1.5 text-xs text-on-surface-variant/70 select-none">
                            <span class="material-symbols-outlined text-base text-green-500 animate-pulse">visibility</span>
                            Прямо сейчас смотрят: <span class="font-bold text-on-surface global-view-count-span">1</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[11px] text-green-500 select-none font-semibold uppercase tracking-wider font-label-caps">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                            В наличии
                        </div>
                    </div>
                </div>

                <div class="space-y-2 mt-4">
                    <label class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="whip" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">${opt1Label}</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">${priceWhipFmt} ₽</span>
                    </label>
                    <label class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="meter" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">${opt2Label}</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">${priceMeterFmt} ₽</span>
                    </label>
                    <label class="flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="ton" checked class="w-4 h-4 text-primary bg-transparent border-primary focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface group-hover/opt:text-on-surface transition-colors">Цена за тонну</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">${priceTonFmt} ₽</span>
                    </label>
                </div>

                <div class="flex items-center justify-between mt-5 bg-surface-container-lowest border border-outline-variant/5 p-4 rounded-2xl shadow-inner">
                    <div class="flex items-center bg-surface-container border border-outline-variant/10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <button id="btn-qty-minus-modal" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">-</button>
                        <input id="input-qty-modal" type="text" class="w-12 bg-transparent border-none text-center font-bold text-on-surface outline-none text-sm h-full" value="1" />
                        <button id="btn-qty-plus-modal" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">+</button>
                    </div>
                    <div class="text-right">
                        <div class="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant/50 font-label-caps mb-0.5">Итоговая стоимость</div>
                        <span class="text-base md:text-lg font-bold text-primary font-display-xl" id="display-total-price-modal">= ${priceTonFmt} ₽</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2 pt-2">
                    <button id="btn-add-to-cart-modal" class="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-wider rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase shadow-md font-label-caps border-none cursor-pointer">
                        <span class="material-symbols-outlined text-lg">shopping_cart</span> В корзину
                    </button>
                    <button id="btn-one-click-modal" class="w-full text-center text-[10px] font-bold text-primary hover:underline transition-all py-1.5 uppercase tracking-widest font-label-caps bg-transparent border-none cursor-pointer">
                        Купить в 1 клик
                    </button>
                </div>
            </div>
        `;

        const modalContent = overlay.querySelector('div.relative');
        modalContent.innerHTML = `
            <button id="close-product-card-modal" class="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-all text-on-surface-variant hover:text-primary hover:scale-110 active:scale-90 z-20" title="Закрыть">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>

            <div class="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 pb-6">
                <div class="space-y-5">
                    <div class="aspect-[4/3] w-full overflow-hidden border border-outline-variant/10 bg-surface-container-low shadow-md rounded-2xl relative group">
                        <img id="main-modal-image-${p.id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="${mainImage}" alt="${name}"/>
                        <div class="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 border border-outline-variant/20 rounded-lg flex gap-2 shadow-sm">
                            ${isGost ? `<span class="font-label-caps text-[9px] text-primary tracking-[0.2em] font-bold">ГОСТ</span>` : ''}
                            ${isSteelGrade ? `<span class="font-label-caps text-[9px] text-on-surface tracking-[0.2em] font-bold">${isSteelGrade}</span>` : ''}
                        </div>
                    </div>
                    ${galleryHtml}
                    
                    <div class="bg-surface-container-low/40 p-4 rounded-2xl border border-outline/5 space-y-2">
                        <span class="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold font-label-caps block">Доступность</span>
                        <div class="flex items-center gap-2">
                            ${vstatus === 'active' 
                                ? `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl font-label-caps"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> В наличии</span>`
                                : `<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl font-label-caps"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Нет в наличии</span>`
                            }
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <span class="text-[10px] text-primary uppercase font-label-caps tracking-widest font-bold block">${category.toUpperCase()}</span>
                        <h3 class="font-display-xl text-xl md:text-2xl font-bold uppercase tracking-tight text-on-surface mt-2 leading-snug">${name}</h3>
                        <div class="text-[10px] text-on-surface-variant opacity-40 font-mono mt-1">ID: ${productId}</div>
                    </div>

                    ${purchaseBlockHtml}
                </div>
                <div class="col-span-full mt-6 border-t border-outline-variant/10 pt-6">
                     <div class="flex border-b border-outline-variant/10 overflow-x-auto scroll-hide pb-0.5">
                         <button id="modal-tab-specs" class="px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-all bg-transparent cursor-pointer font-label-caps border-none">Характеристики</button>
                         <button id="modal-tab-desc" class="px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all bg-transparent cursor-pointer font-label-caps border-none">Описание</button>
                     </div>
                     <div id="modal-tab-content" class="py-5 text-on-surface-variant leading-relaxed text-xs md:text-sm font-body-md">
                     </div>
                </div>
            </div>
        `;

        window.closeProductCardModal = close;
        window.currentProductIdModal = productId;
        if (window.updatePresenceStateGlobal) window.updatePresenceStateGlobal();

        const tabContentDesc = description.replace(/\n/g, '<br>');
        const tabContentSpecs = specs.length > 0 ? `
            <div class="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden max-w-4xl shadow-sm bg-white dark:bg-[#1e1c1a]">
                <table class="w-full text-left border-collapse">
                    <tbody>
                        ${specs.map(([l, v], idx) => `
                            <tr class="${idx % 2 === 0 ? 'bg-[#fbf9f7] dark:bg-[#1e1c1a]' : 'bg-[#ffffff] dark:bg-[#151311]'} border-b border-black/5 dark:border-white/5 last:border-b-0">
                                <td class="px-5 py-3 text-xs font-bold text-[#1a1817]/60 dark:text-white/40 uppercase tracking-wider">${l}</td>
                                <td class="px-5 py-3 text-xs font-bold text-[#1a1817] dark:text-white text-right">${v}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>` : '<p>Характеристики для данного товара не указаны.</p>';

        const switchModalTab = (tabName) => {
            ['specs', 'desc'].forEach(name => {
                const btn = overlay.querySelector(`#modal-tab-${name}`);
                if (btn) {
                    if (name === tabName) {
                        btn.className = "px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-all bg-transparent cursor-pointer font-label-caps border-none";
                    } else {
                        btn.className = "px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all bg-transparent cursor-pointer font-label-caps border-none";
                    }
                }
            });
            const contentDiv = overlay.querySelector('#modal-tab-content');
            if (contentDiv) {
                contentDiv.innerHTML = tabName === 'specs' ? tabContentSpecs : tabContentDesc;
            }
        };

        const contentDiv = overlay.querySelector('#modal-tab-content');
        if (contentDiv) contentDiv.innerHTML = tabContentSpecs;

        overlay.querySelector('#modal-tab-specs').onclick = () => switchModalTab('specs');
        overlay.querySelector('#modal-tab-desc').onclick = () => switchModalTab('desc');

        let selectedPrice = priceTon;
        const updateVolhonkaSum = () => {
            const inputQty = overlay.querySelector('#input-qty-modal');
            const displayTotal = overlay.querySelector('#display-total-price-modal');
            if (!inputQty || !displayTotal) return;
            
            let qty = parseFloat(inputQty.value) || 1;
            if (qty < 1) { qty = 1; inputQty.value = '1'; }
            
            const totalSum = Math.round(qty * selectedPrice);
            displayTotal.textContent = `= ${totalSum.toLocaleString('ru-RU')} ₽`;
        };

        const radios = overlay.querySelectorAll('input[name="price-type"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                radios.forEach(r => {
                    const label = r.closest('label');
                    if (label) label.className = "flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt";
                });
                const activeLabel = e.target.closest('label');
                if (activeLabel) activeLabel.className = "flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt";
                
                const val = e.target.value;
                if (val === 'whip') selectedPrice = priceWhip;
                else if (val === 'meter') selectedPrice = priceMeter;
                else selectedPrice = priceTon;
                
                updateVolhonkaSum();
            });
        });

        const btnMinus = overlay.querySelector('#btn-qty-minus-modal');
        const btnPlus = overlay.querySelector('#btn-qty-plus-modal');
        const inputQty = overlay.querySelector('#input-qty-modal');

        if (btnMinus && btnPlus && inputQty) {
            btnMinus.onclick = () => { let val = parseInt(inputQty.value) || 1; if (val > 1) { inputQty.value = val - 1; updateVolhonkaSum(); } };
            btnPlus.onclick = () => { let val = parseInt(inputQty.value) || 1; inputQty.value = val + 1; updateVolhonkaSum(); };
            inputQty.oninput = updateVolhonkaSum;
        }

        const btnAddToCart = overlay.querySelector('#btn-add-to-cart-modal');
        if (btnAddToCart) {
            btnAddToCart.onclick = () => {
                const qty = parseInt(inputQty.value) || 1;
                if (window.addToCartGlobal) window.addToCartGlobal(p.id, qty);
                const oldText = btnAddToCart.innerHTML;
                btnAddToCart.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Добавлено!';
                btnAddToCart.style.backgroundColor = '#10B981';
                btnAddToCart.style.color = '#FFFFFF';
                setTimeout(() => {
                    btnAddToCart.innerHTML = oldText;
                    btnAddToCart.style.backgroundColor = '#ca7093';
                    btnAddToCart.style.color = '#FFFFFF';
                }, 2000);
            };
        }

        const btnOneClick = overlay.querySelector('#btn-one-click-modal');
        if (btnOneClick) {
            btnOneClick.onclick = () => {
                const tel = prompt('Введите ваш телефон для заказа в 1 клик:');
                if (tel) alert('Спасибо! Наш менеджер свяжется с вами по номеру ' + tel + ' в течение 10 минут для подтверждения заказа.');
            };
        }

        modalContent.querySelector('#close-product-card-modal').onclick = close;

    } catch(err) {
        alert("Извините, данный товар больше не существует. Для подробностей свяжитесь с нами.");
        const modalContent = overlay.querySelector('div.relative');
        modalContent.innerHTML = `
            <button id="close-product-card-modal" class="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-colors text-on-surface-variant z-10">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="flex flex-col items-center justify-center py-12 text-red-400 gap-4 text-center px-6">
                <span class="material-symbols-outlined text-4xl animate-bounce">error</span>
                <div class="text-sm font-medium">Извините, данный товар больше не существует.</div>
                <div class="text-xs opacity-60">Для подробностей свяжитесь с нами.</div>
            </div>
        `;
        modalContent.querySelector('#close-product-card-modal').onclick = close;
    }
};


// Cookie Banner Logic
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('cookie_consent')) {
        const bannerHtml = `
        <div id="cookieBannerGlobal" class="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl bg-surface-container-high/40 backdrop-blur-md border border-outline-variant/20 px-5 py-3 rounded-2xl shadow-lg z-[9999] opacity-50 hover:opacity-100 transition-all duration-500 ease-out flex items-center gap-4 translate-y-[150%]">
            <p class="flex-1 text-xs text-on-surface-variant leading-snug">
                Мы используем файлы cookie для улучшения работы сайта. Продолжая, вы соглашаетесь с <a href="/privacy-policy.html" class="text-primary underline">Политикой конфиденциальности</a>.
            </p>
            <button onclick="acceptCookiesGlobal()" class="shrink-0 px-6 py-2 bg-primary text-on-primary font-label-caps text-[11px] tracking-widest hover:bg-primary/90 transition-all rounded-lg uppercase">ОК</button>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', bannerHtml);
        setTimeout(() => {
            const banner = document.getElementById('cookieBannerGlobal');
            if(banner) banner.classList.remove('translate-y-[150%]');
        }, 1000);
    }
});

window.acceptCookiesGlobal = function() {
    localStorage.setItem('cookie_consent', 'true');
    const banner = document.getElementById('cookieBannerGlobal');
    if(banner) {
        banner.classList.add('translate-y-full');
        setTimeout(() => banner.remove(), 500);
    }
};



window.clearCartGlobal = function() {
    localStorage.setItem('metal_cart', '[]');
    window.renderCartDrawerItems();
    if (window.updateGlobalCartBadge) window.updateGlobalCartBadge();
    if (typeof updateCartUI === 'function') updateCartUI();
};

window.buyInOneClickGlobal = function(id, qty = 1, unit = 'т.', price = 0) {
    window.lockScrollGlobal();
    
    // We get product details from cache or page
    let p = null;
    if (window.currentProductsList) {
        p = window.currentProductsList.find(x => x.id === id);
    }
    if (!p && typeof currentProduct !== 'undefined') {
        p = currentProduct;
    }
    
    const name = p ? p.name : 'Товар ' + id;
    const total = (parseFloat(qty) * parseFloat(price)).toFixed(2);

    const modalHtml = `
    <div id="buyOneClickModalGlobal" class="fixed inset-0 z-[9000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out" onclick="window.closeBuyOneClickGlobal()"></div>
        <div class="relative w-full max-w-md bg-surface border border-outline-variant/20 p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col transform transition-all duration-500 ease-out" style="background-color: var(--md-sys-color-surface, #151311);">
            <button onclick="window.closeBuyOneClickGlobal()" class="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer border-none bg-transparent">close</button>
            
            <h3 class="font-display-xl text-xl font-bold uppercase tracking-wider text-on-surface mb-6">Заказ в 1 клик</h3>
            
            <div class="mb-6 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
                <p class="text-sm text-on-surface/80 font-medium mb-2">${name}</p>
                <div class="flex justify-between items-end">
                    <span class="text-xs text-on-surface-variant">${qty} ${unit}</span>
                    <span class="text-lg font-bold text-primary">${total} ₽</span>
                </div>
            </div>

            <div class="space-y-4 mb-8">
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ваше имя</label>
                    <input type="text" id="oneClickNameGlobal" placeholder="Иван Иванов" class="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary/50 transition-colors rounded-xl px-4 py-3 text-sm text-on-surface outline-none" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Телефон</label>
                    <input type="tel" id="oneClickPhoneGlobal" placeholder="+7 (___) ___-__-__" class="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary/50 transition-colors rounded-xl px-4 py-3 text-sm text-on-surface outline-none" />
                </div>
            </div>

            <button onclick="window.submitBuyOneClickGlobal('${id}', ${qty}, '${unit}', ${price})" class="w-full py-4 bg-primary text-on-primary font-bold text-[11px] tracking-widest hover:bg-primary/90 transition-all rounded-xl uppercase shadow-lg shadow-primary/20 active:scale-95 cursor-pointer border-none">
                ОФОРМИТЬ ЗАКАЗ
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeBuyOneClickGlobal = function() {
    const m = document.getElementById('buyOneClickModalGlobal');
    if (m) {
        m.remove();
        window.unlockScrollGlobal();
    }
};

window.submitBuyOneClickGlobal = async function(id, qty, unit, price) {
    const nameInput = document.getElementById('oneClickNameGlobal');
    const phoneInput = document.getElementById('oneClickPhoneGlobal');
    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        if(window.showToast) window.showToast('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    // Add logic to submit lead
    const leadData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        productId: id,
        qty,
        unit,
        price,
        total: (parseFloat(qty) * parseFloat(price)).toFixed(2)
    };
    
    try {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(leadData)
        });
        if(res.ok) {
            if(window.showToast) window.showToast('Заказ успешно оформлен! Мы свяжемся с вами.', 'success');
            window.closeBuyOneClickGlobal();
        } else {
            if(window.showToast) window.showToast('Ошибка при оформлении заказа', 'error');
        }
    } catch(e) {
        if(window.showToast) window.showToast('Ошибка при отправке данных', 'error');
    }
};

window.buyInOneClickCartGlobal = function() {
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    if (cart.length === 0) {
        if(window.showToast) window.showToast('Корзина пуста', 'error');
        return;
    }
    
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.price) * parseFloat(item.qty);
    });
    
    window.toggleCartDrawerGlobal(); // Close cart modal
    window.lockScrollGlobal();

    const modalHtml = `
    <div id="buyOneClickCartModalGlobal" class="fixed inset-0 z-[9000] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ease-out" onclick="window.closeBuyOneClickCartGlobal()"></div>
        <div class="relative w-full max-w-md bg-surface border border-outline-variant/20 p-6 md:p-8 rounded-[2.5rem] shadow-2xl flex flex-col transform transition-all duration-500 ease-out" style="background-color: var(--md-sys-color-surface, #151311);">
            <button onclick="window.closeBuyOneClickCartGlobal()" class="absolute top-6 right-6 material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer border-none bg-transparent">close</button>
            
            <h3 class="font-display-xl text-xl font-bold uppercase tracking-wider text-on-surface mb-6">Быстрый заказ корзины</h3>
            
            <div class="mb-6 p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
                <p class="text-sm text-on-surface/80 font-medium mb-2">Товаров в корзине: ${cart.length}</p>
                <div class="flex justify-between items-end">
                    <span class="text-xs text-on-surface-variant">Итого к оплате:</span>
                    <span class="text-xl font-bold text-primary">${total.toFixed(2)} ₽</span>
                </div>
            </div>

            <div class="space-y-4 mb-8">
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ваше имя</label>
                    <input type="text" id="oneClickCartNameGlobal" placeholder="Иван Иванов" class="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary/50 transition-colors rounded-xl px-4 py-3 text-sm text-on-surface outline-none" />
                </div>
                <div>
                    <label class="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Телефон</label>
                    <input type="tel" id="oneClickCartPhoneGlobal" placeholder="+7 (___) ___-__-__" class="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary/50 transition-colors rounded-xl px-4 py-3 text-sm text-on-surface outline-none" />
                </div>
            </div>

            <button onclick="window.submitBuyOneClickCartGlobal()" class="w-full py-4 bg-primary text-on-primary font-bold text-[11px] tracking-widest hover:bg-primary/90 transition-all rounded-xl uppercase shadow-lg shadow-primary/20 active:scale-95 cursor-pointer border-none">
                ПОДТВЕРДИТЬ ЗАКАЗ
            </button>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.closeBuyOneClickCartGlobal = function() {
    const m = document.getElementById('buyOneClickCartModalGlobal');
    if (m) {
        m.remove();
        window.unlockScrollGlobal();
    }
};

window.submitBuyOneClickCartGlobal = async function() {
    const nameInput = document.getElementById('oneClickCartNameGlobal');
    const phoneInput = document.getElementById('oneClickCartPhoneGlobal');
    if (!nameInput.value.trim() || !phoneInput.value.trim()) {
        if(window.showToast) window.showToast('Пожалуйста, заполните все поля', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('metal_cart') || '[]');
    let total = 0;
    cart.forEach(item => {
        total += parseFloat(item.price) * parseFloat(item.qty);
    });
    
    const leadData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        isCart: true,
        cartItems: cart,
        total: total.toFixed(2)
    };
    
    try {
        const res = await fetch('/api/leads', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(leadData)
        });
        if(res.ok) {
            if(window.showToast) window.showToast('Заказ успешно оформлен! Мы свяжемся с вами.', 'success');
            window.clearCartGlobal();
            window.closeBuyOneClickCartGlobal();
        } else {
            if(window.showToast) window.showToast('Ошибка при оформлении заказа', 'error');
        }
    } catch(e) {
        if(window.showToast) window.showToast('Ошибка при отправке данных', 'error');
    }
};
