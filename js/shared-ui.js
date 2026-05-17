/**
 * PREMIUM PRELOADER SYSTEM
 * Injected immediately to ensure early visibility for Iron Woodman High-Tech Site
 */
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
            background: #151311; z-index: 999999; 
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
            border-top-color: #ffb0cc;
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
            font-size: 10px; color: #ffb0cc; letter-spacing: 0.6em;
            text-transform: uppercase; opacity: 0.6;
            animation: preloader-text-pulse 1.5s ease-in-out infinite;
        }
        .loader-progress-track {
            width: 200px; height: 1px; background: rgba(255, 176, 204, 0.1);
            margin-top: 16px; position: relative; overflow: hidden;
        }
        .loader-progress-bar {
            position: absolute; top: 0; left: 0; height: 100%; width: 0%;
            background: #ffb0cc; box-shadow: 0 0 10px #ffb0cc;
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
            document.body.style.overflow = ''; // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('-translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden'; // Lock scroll
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
        document.body.style.overflow = 'hidden'; // Lock scroll
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
                document.body.style.overflow = ''; // Restore scroll AFTER animation
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
            document.body.style.overflow = 'hidden'; // Disable scroll
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
            document.body.style.overflow = ''; // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden'; // Lock scroll
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
            document.body.style.overflow = ''; // Restore scroll AFTER animation
        }, 600);
    } else {
        drawer.classList.remove('pointer-events-none');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden'; // Lock scroll
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
        return `
            <div class="flex gap-4 p-4 bg-surface-container border border-outline-variant/10 rounded-xl group hover:border-primary/30 transition-all relative overflow-hidden">
                <div class="flex-1">
                    <div class="text-[11px] font-bold uppercase tracking-tight text-on-surface line-clamp-1 mb-1">${item.name || item.id}</div>
                    <div class="flex justify-between items-center">
                        <div class="text-[10px] font-label-caps text-on-surface-variant tracking-wider">${item.qty} ${item.unit || 'ед.'} × ${Number(item.price || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
                        <div class="text-xs font-bold text-primary">${itemTotal.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</div>
                    </div>
                </div>
                <button onclick="removeFromCartGlobal(${index})" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/10 text-on-surface-variant hover:text-error transition-all group/del">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                </button>
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

    const headerHtml = `
    <div id="scrollProgressGlobal"></div>
    <nav id="globalHeader" class="fixed top-0 w-full z-[1000] bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
        <div class="flex justify-between items-center h-20 px-4 md:px-margin-edge w-full max-w-container-max mx-auto">
            <div class="flex items-center gap-4 group">
                <button id="mobileMenuBtnGlobal" onclick="toggleMobileMenuGlobal()" class="md:hidden material-symbols-outlined text-on-surface hover:text-primary transition-colors">menu</button>
                <a class="flex items-center gap-4 hover:opacity-80 transition-opacity whitespace-nowrap no-underline" href="/">
                    <div class="relative group/logo">
                        <div class="absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-40 group-hover/logo:opacity-100 transition-opacity"></div>
                        <img src="/images/logo_icon.png" alt="Железный Дровосек" class="w-14 h-14 md:w-16 md:h-16 object-cover relative z-10 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(255,176,204,0.4)]">
                    </div>
                    <div class="flex flex-col items-start leading-none">
                        <span class="font-display-xl text-[20px] md:text-[24px] leading-tight tracking-tight text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="font-display-xl text-[20px] md:text-[24px] leading-tight tracking-tight text-primary font-semibold uppercase">ДРОВОСЕК</span>
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
                <button id="authBtnGlobal" onclick="toggleAuthModalGlobal()" class="material-symbols-outlined text-on-surface hover:text-primary transition-all duration-300 p-2 rounded-full hover:bg-white/5 active:scale-95">person</button>
            </div>

        </div>
    </nav>

    <div id="mobileMenuDrawerGlobal" class="fixed inset-0 z-[4000] pointer-events-none overflow-hidden md:hidden">
        <div id="mobileMenuOverlayGlobal" class="absolute inset-0 bg-black/60 backdrop-blur-md opacity-0 transition-opacity duration-500 pointer-events-none" onclick="toggleMobileMenuGlobal()"></div>
        <div id="mobileMenuPanelGlobal" class="absolute top-0 left-0 w-[85%] max-w-sm h-full bg-surface/90 backdrop-blur-[40px] border-r border-white/10 -translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] pointer-events-auto p-8 flex flex-col">
            <header class="flex justify-between items-center mb-10">
                <a href="/" class="flex items-center gap-4 leading-none no-underline">
                    <img src="/images/logo_icon.png" alt="Logo" class="w-14 h-14 object-cover rounded-full border-2 border-primary/30 shadow-[0_0_15px_rgba(255,176,204,0.3)]">
                    <div class="flex flex-col items-start leading-none">
                        <span class="font-display-xl text-[20px] text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                        <span class="font-display-xl text-[20px] text-primary font-semibold uppercase">ДРОВОСЕК</span>
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
                        <button onclick="handleLoginGlobal()" class="w-full py-5 bg-primary text-on-primary font-label-caps text-label-caps tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">ВОЙТИ</button>
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

    <button id="scrollTopBtnGlobal" onclick="scrollToTopGlobal()" class="fixed bottom-8 right-8 z-[5000] w-14 h-14 bg-[#1d1b19] border border-[#ffb0cc] text-[#ffb0cc] flex items-center justify-center hover:bg-[#ffb0cc] hover:text-[#1d1b19] transition-all shadow-2xl shadow-[#ffb0cc]/20 group">
        <span class="material-symbols-outlined text-[28px] group-hover:-translate-y-1 transition-transform">arrow_upward</span>
    </button>
    `;

    const footerHtml = `
    <footer id="globalFooter" class="bg-surface border-t border-outline-variant/20 pt-20 pb-10">
        <div class="px-margin-edge-mobile md:px-margin-edge w-full max-w-container-max mx-auto">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-gutter mb-20">
                <!-- Branding Column -->
                <div class="md:col-span-4 space-y-8">
                    <a class="flex items-center gap-4 hover:opacity-80 transition-opacity no-underline" href="/">
                        <img src="/images/logo_icon.png" alt="Железный Дровосек" class="w-16 h-16 object-cover rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(255,176,204,0.3)]">
                        <div class="flex flex-col items-start leading-none">
                            <span class="font-display-xl text-[22px] md:text-[26px] leading-tight tracking-tight text-on-surface font-semibold uppercase">ЖЕЛЕЗНЫЙ</span>
                            <span class="font-display-xl text-[22px] md:text-[26px] leading-tight tracking-tight text-primary font-semibold uppercase">ДРОВОСЕК</span>
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
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-[20px]">call</span>
                            <a href="tel:+79930777717" class="text-sm text-on-surface hover:text-primary transition-colors no-underline">+7 (993) 077-77-17</a>
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
        #globalHeader { z-index: 1000; }
        .nav-link { position: relative; }
        .nav-link::after {
            content: ''; position: absolute; bottom: -4px; left: 0; width: 0; height: 2px;
            background: #ffb0cc; transition: width 0.3s ease;
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
            border: 1px solid rgba(83, 67, 71, 0.2); border-top: 2px solid #ffb0cc;
            box-shadow: 0 40px 100px rgba(0,0,0,0.6); min-height: 400px;
        }
        .mega-menu-left { width: 300px; background: #1a1816; border-right: 1px solid rgba(83, 67, 71, 0.1); padding: 20px 0; }
        .mega-cat-link {
            display: flex; align-items: center; gap: 12px; padding: 12px 30px;
            color: #d7c1c7; text-decoration: none; font-family: 'Space Grotesk', sans-serif;
            font-size: 14px; transition: all 0.2s; position: relative;
        }
        .mega-cat-link:hover, .mega-cat-item.is-active .mega-cat-link { background: rgba(255,176,204,0.05); color: #ffb0cc; }
        .mega-cat-item.is-active .mega-cat-link::before {
            content: ''; position: absolute; left: 0; top: 0; width: 3px; height: 100%; background: #ffb0cc;
        }
        .mega-menu-right { flex: 1; padding: 40px; background: #211f1d; }
        .mega-submenu { display: none; }
        .mega-submenu.is-active { display: block; animation: fadeInSub 0.3s ease; }
        @keyframes fadeInSub { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        .mega-submenu-title { font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .mega-submenu-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px 20px; }
        .mega-sub-link { color: #d7c1c7; text-decoration: none; font-size: 13px; display: block; padding: 6px 0; transition: color 0.2s; }
        .mega-sub-link:hover { color: #ffb0cc; }
        
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
        #mobileMenuPanelGlobal { box-shadow: 20px 0 60px rgba(0,0,0,0.5); }
        
        .mega-default-content { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 16px; }
        .mega-default-icon { font-size: 56px; color: rgba(255, 176, 204, 0.2); }
        .mega-default-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 600; color: #e7e2dd; }
        .mega-default-desc { font-size: 14px; color: rgba(215, 193, 199, 0.5); max-width: 280px; }
        .mega-default-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 12px 28px; border: 1px solid #ffb0cc; color: #ffb0cc; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-decoration: none; transition: all 0.3s ease; }
        .mega-default-btn:hover { background: #ffb0cc; color: #151311; }

        /* Compact About Menu */
        .about-compact-menu { width: auto; }
        .about-compact-menu .mega-menu-inner { 
            width: 280px; 
            min-height: auto; 
            background: #1a1816;
            border-top: 2px solid #ffb0cc;
        }
        .about-compact-menu .mega-menu-left { width: 100%; border-right: none; padding: 10px 0; }
        .about-compact-menu .mega-cat-link { padding: 10px 24px; font-size: 13px; }
        .about-compact-menu .mega-cat-divider { margin: 8px 0; background: rgba(255,255,255,0.05); }

        @media (max-width: 768px) {
            #cartPanelGlobal, #authPanelGlobal { width: 100%; max-width: 100%; }
            .mega-menu { display: none !important; }
        }

        #scrollTopBtnGlobal {
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            transform: translateY(20px);
        }
        #scrollTopBtnGlobal.visible {
            opacity: 1;
            visibility: visible;
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
            background: #ffb0cc;
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
            background: #ffb0cc;
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
            background: linear-gradient(90deg, #ca7093, #ffb0cc);
            z-index: 99999;
            box-shadow: 0 0 15px rgba(255, 176, 204, 0.5);
            transition: width 0.1s ease-out;
        }

        @media (max-width: 768px) {
            #scrollProgressGlobal {
                display: none !important;
            }
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
            showSubmenu(sub !== 'none' ? sub : 'default');
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
                bar.style.backgroundColor = '#ffb0cc';
                if (text) text.textContent = 'ОТЛИЧНЫЙ ПАРОЛЬ';
                if (text) text.style.color = '#ffb0cc';
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
        setTimeout(() => overlay.remove(), 500);
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


    window.handleLoginGlobal = async function() {
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
    updateGlobalCartBadge();
    window.updateGlobalCartBadge = updateGlobalCartBadge;
    window.addEventListener('storage', updateGlobalCartBadge);

    checkAuthStatus();

    // --- GLOBAL SCROLL & SNAPPING ENGINE ---
    const SCROLL_DURATION_MS = 800;
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
        const cls = el.className || '';
        return /min-h-\[100dvh\]|min-h-screen|h-\[100dvh\]|h-screen/.test(cls) || el.id === 'cta-footer-merged';
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
        if (btn) {
            const isPopupOpen = window.checkAnyPopupOpenGlobal();
            if (window.pageYOffset > 500 && !isPopupOpen) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', updateScrollTopVisibility);

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
        type: type
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
    document.body.style.overflow = 'hidden'; // Lock scroll
    
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
        document.body.style.overflow = ''; // Restore scroll AFTER animation
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
    document.body.style.overflow = 'hidden'; // Lock scroll

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
        document.body.style.overflow = ''; // Restore scroll AFTER animation
    }, 500);
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
    document.body.style.overflow = 'hidden'; // Lock scroll

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
        document.body.style.overflow = ''; // Restore scroll AFTER animation
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
