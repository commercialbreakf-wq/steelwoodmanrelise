// js/theme.js
(function() {
    const style = document.createElement('style');
    style.id = 'premium-theme-vars';
    style.innerHTML = `
        :root {
            --color-bg: #FAFAFA;
            --color-surface: #FFFFFF;
            --color-surface-variant: #F5F5F7;
            --color-surface-container-lowest: #FFFFFF;
            --color-surface-container-low: #FBFBFA;
            --color-surface-container: #F5F5F7;
            --color-surface-container-high: #EAEAEB;
            --color-surface-container-highest: #E5E5E6;
            --color-surface-bright: #FFFFFF;
            --color-surface-dim: #D9D2C9;
            --color-on-bg: #1A1817;
            --color-on-surface: #1A1817;
            --color-on-surface-variant: #534D4A;
            
            /* Premium Pink for Light Mode */
            --color-primary: #ca7093; 
            --color-on-primary: #FFFFFF;
            --color-primary-container: #FFD9E2;
            --color-on-primary-container: #400015;
            --color-primary-fixed: #FFD9E2;
            --color-primary-fixed-dim: #FFB0C8;
            --color-on-primary-fixed: #3B0013;
            --color-on-primary-fixed-variant: #721634;
            --color-inverse-primary: #FFB0C8;
            --color-surface-tint: #ca7093;

            --color-secondary: #ca7093;
            --color-on-secondary: #FFFFFF;
            --color-secondary-container: #FFD9E2;
            --color-on-secondary-container: #3E0017;
            --color-secondary-fixed: #FFD9E2;
            --color-secondary-fixed-dim: #ca7093;
            --color-on-secondary-fixed: #3E0017;
            --color-on-secondary-fixed-variant: #741738;

            --color-tertiary: #52525B;
            --color-on-tertiary: #FFFFFF;
            --color-tertiary-container: #D4D4D8;
            --color-on-tertiary-container: #18181B;

            --color-error: #BA1A1A;
            --color-on-error: #FFFFFF;
            --color-error-container: #FFDAD6;
            --color-on-error-container: #410002;
            
            --color-outline: #8E8A88;
            --color-outline-variant: #E0DCD9;
            --color-inverse-surface: #302E2D;
            --color-inverse-on-surface: #F2F0ED;
        }

        .dark {
            --color-bg: #151311;
            --color-surface: #151311;
            --color-surface-variant: #373431;
            --color-surface-container-lowest: #0f0e0c;
            --color-surface-container-low: #1d1b19;
            --color-surface-container: #211f1d;
            --color-surface-container-high: #2c2a27;
            --color-surface-container-highest: #373431;
            --color-surface-bright: #3b3936;
            --color-surface-dim: #151311;
            --color-on-bg: #c7c5c5;
            --color-on-surface: #c7c5c5;
            --color-on-surface-variant: #d7c1c7;
            
            --color-primary: #964551;
            --color-on-primary: #c7c5c5;
            --color-primary-container: #8E093D;
            --color-on-primary-container: #ffd9e4;
            --color-primary-fixed: #ffd9e4;
            --color-primary-fixed-dim: #964551;
            --color-on-primary-fixed: #3e0020;
            --color-on-primary-fixed-variant: #772c4d;
            --color-inverse-primary: #944365;
            --color-surface-tint: #964551;

            --color-secondary: #ca7093;
            --color-on-secondary: #660029;
            --color-secondary-container: #8e093d;
            --color-on-secondary-container: #ff96ad;
            --color-secondary-fixed: #ffd9df;
            --color-secondary-fixed-dim: #ca7093;
            --color-on-secondary-fixed: #3f0017;
            --color-on-secondary-fixed-variant: #8e093d;

            --color-tertiary: #c6c6c7;
            --color-on-tertiary: #2f3131;
            --color-tertiary-container: #909191;
            --color-on-tertiary-container: #282a2a;

            --color-error: #ffb4ab;
            --color-on-error: #690005;
            --color-error-container: #93000a;
            --color-on-error-container: #ffdad6;
            
            --color-outline: #a08c91;
            --color-outline-variant: #534347;
            --color-inverse-surface: #e7e2dd;
            --color-inverse-on-surface: #32302d;
        }

        /* Selection effect */
        ::selection {
            background-color: var(--color-primary);
            color: var(--color-on-primary);
        }

        /* Theme Transition Class */
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

        /* --- LIQUID GLASS & THEME SYNC --- */
        
        /* Global Liquid Glass styling for default / dark mode */
        .liquid-glass,
        .glass-panel,
        .glass-card,
        .dark .liquid-glass,
        .dark .glass-panel,
        .dark .glass-card {
            background: rgba(255, 255, 255, 0.08) !important;
            backdrop-filter: blur(40px) saturate(220%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
            border: 1px solid rgba(255, 255, 255, 0.18) !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.15) !important;
            will-change: transform, opacity;
            transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1) !important;
        }

        /* Global Header (Liquid Glass) */
        #globalHeader {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Dark Theme Header (Dark Liquid Glass) */
        .dark #globalHeader {
            background-color: rgba(21, 19, 17, 0.45);
            backdrop-filter: blur(30px) saturate(210%);
            -webkit-backdrop-filter: blur(30px) saturate(210%);
            border-bottom: 1px solid rgba(150, 69, 81, 0.2);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.35);
        }

        /* Light Theme Header (Premium Glass) */
        html:not(.dark) #globalHeader {
            background-color: rgba(255, 255, 255, 0.4) !important;
            backdrop-filter: blur(30px) saturate(210%) !important;
            -webkit-backdrop-filter: blur(30px) saturate(210%) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.4) !important;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03) !important;
        }

        /* Glass Panels, Menus, Popups, Lead Forms & Services - Global Sync */
        html:not(.dark) .bg-primary\/10,
        html:not(.dark) .bg-primary\/20,
        html:not(.dark) .bg-surface,
        html:not(.dark) .bg-surface-variant,
        html:not(.dark) .bg-surface-container,
        html:not(.dark) .bg-surface-container-low,
        html:not(.dark) .bg-surface-container-lowest,
        html:not(.dark) .bg-surface-container-high,
        html:not(.dark) .bg-surface-container-highest,
        html:not(.dark) .bg-surface-container\/10,
        html:not(.dark) .bg-surface-container\/20,
        html:not(.dark) .bg-surface-container\/50,
        html:not(.dark) .bg-surface-container-low\/50,
        html:not(.dark) .bg-white\/5,
        html:not(.dark) .bg-white\/10,
        html:not(.dark) .bg-white\/\[0\.03\],
        html:not(.dark) .liquid-glass,
        html:not(.dark) .glass-panel,
        html:not(.dark) .glass-card,
        html:not(.dark) .price-block,
        html:not(.dark) #cartPanelGlobal,
        html:not(.dark) #authPanelGlobal,
        html:not(.dark) #mobileMenuPanelGlobal,
        html:not(.dark) #mobileCatalogPanelGlobal,
        html:not(.dark) #searchContainerGlobal,
        html:not(.dark) #catalogSidebar,
        html:not(.dark) .bg-\\[\\#151311\\],
        html:not(.dark) .bg-\\[\\#0f0e0c\\],
        html:not(.dark) .bg-\\[\\#0a0908\\],
        html:not(.dark) .bg-\\[\\#1a1816\\],
        html:not(.dark) .bg-surface-container-low\/50,
        html:not(.dark) .bg-surface-container\/50,
        html:not(.dark) .machined-border,
        html:not(.dark) .vehicle-card,
        html:not(.dark) .fleet-card > div,
        html:not(.dark) section#cta-footer-merged .bg-surface,
        html:not(.dark) footer#globalFooter {
            background-color: rgba(255, 255, 255, 0.22) !important;
            backdrop-filter: blur(40px) saturate(210%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(210%) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.03), inset 0 0 30px rgba(255, 255, 255, 0.4) !important;
            color: var(--color-on-bg) !important;
        }

        /* Border Sync for Light Mode */
        html:not(.dark) .machined-border,
        html:not(.dark) .border-white\/5,
        html:not(.dark) .border-white\/10,
        html:not(.dark) .border-white\/20,
        html:not(.dark) .border-outline-variant\/10,
        html:not(.dark) .border-outline-variant\/20,
        html:not(.dark) .border-outline-variant\/30,
        html:not(.dark) .divide-white\/5,
        html:not(.dark) .divide-white\/10 {
            border-color: rgba(0, 0, 0, 0.08) !important;
        }

        /* Table & Grid fixes for Light Mode */
        html:not(.dark) .metal-grid-bg {
            background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px) !important;
        }
        html:not(.dark) thead tr.bg-white\/5 {
            background-color: rgba(0, 0, 0, 0.03) !important;
        }
        html:not(.dark) tbody tr:hover {
            background-color: rgba(150, 69, 81, 0.05) !important;
        }

        /* Forms & Inputs in Light Mode */
        html:not(.dark) input:not([type="checkbox"]),
        html:not(.dark) select,
        html:not(.dark) textarea {
            background-color: rgba(0, 0, 0, 0.02) !important;
            border-color: rgba(0, 0, 0, 0.15) !important;
            color: var(--color-on-bg) !important;
        }
        html:not(.dark) input:not([type="checkbox"]):focus,
        html:not(.dark) select:focus,
        html:not(.dark) textarea:focus {
            background-color: rgba(255, 255, 255, 1) !important;
            border-color: var(--color-primary) !important;
            box-shadow: 0 0 0 4px rgba(150, 69, 81, 0.1) !important;
        }
        html:not(.dark) input::placeholder,
        html:not(.dark) textarea::placeholder {
            color: rgba(0, 0, 0, 0.4) !important;
        }

        html:not(.dark) .mobile-nav-link {
            color: var(--color-on-bg) !important;
        }
        html:not(.dark) .text-on-surface-variant {
            color: var(--color-on-surface-variant) !important;
        }
        html:not(.dark) .bg-white\/5,
        html:not(.dark) .bg-white\/10 {
            background-color: rgba(0, 0, 0, 0.03) !important;
        }

        /* Card Highlights Restoration & Enhancement */
        .card-enter, .pink-glow {
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1) !important;
        }
        html:not(.dark) .card-enter:hover,
        html:not(.dark) .pink-glow:hover {
            background-color: #FFFFFF !important;
            border-color: var(--color-primary) !important;
            box-shadow: 0 15px 45px rgba(150, 69, 81, 0.12), 0 0 0 1px var(--color-primary) !important;
            transform: translateY(-5px) scale(1.005) !important;
        }

        /* 404 Page Theme Sync */
        html:not(.dark) .bg-industrial {
            background-image: linear-gradient(rgba(250, 250, 250, 0.85), rgba(250, 250, 250, 0.85)), url('/industrial_404_bg_1778612131862.png') !important;
        }
        html:not(.dark) .glitch-text {
            color: var(--color-on-bg);
            opacity: 0.6;
        }

        /* Hero Stats Liquid Glass & Divider Overrides */
        html:not(.dark) #hero .bg-surface\/50,
        html:not(.dark) #hero .bg-surface-container-low\/50,
        html:not(.dark) #hero .liquid-glass,
        html:not(.dark) #hero [class*="bg-surface"],
        html:not(.dark) #hero [class*="bg-surface-container-low"] {
            background-color: rgba(255, 255, 255, 0.22);
            backdrop-filter: blur(40px) saturate(210%);
            -webkit-backdrop-filter: blur(40px) saturate(210%);
            border-color: rgba(255, 255, 255, 0.5);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03), inset 0 0 20px rgba(255, 255, 255, 0.4);
        }

        html:not(.dark) #hero .border-primary\/30,
        html:not(.dark) #hero .border-l {
            border-color: rgba(202, 112, 147, 0.25);
        }

        /* Complete reset for Hero section in Light Mode */
        html:not(.dark) #hero,
        html:not(.dark) section#hero,
        html:not(.dark) section:first-of-type {
            background-color: transparent;
            background-image: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            filter: none;
        }

        html:not(.dark) #hero .absolute.inset-0.z-0 {
            background-color: transparent;
            background-image: none;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            filter: none;
        }

        html:not(.dark) #hero .bg-gradient-to-r,
        html:not(.dark) section:first-of-type .bg-gradient-to-r {
            display: block;
            opacity: 1;
            background: transparent;
            background-image: linear-gradient(to right, #FAFAFA 0%, rgba(250, 250, 250, 0.8) 50%, rgba(250, 250, 250, 0) 100%);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }

        html:not(.dark) #hero .bg-gradient-to-b,
        html:not(.dark) section:first-of-type .bg-gradient-to-b {
            display: block;
            opacity: 1;
            background: transparent;
            background-image: linear-gradient(to bottom, #FAFAFA 0%, rgba(250, 250, 250, 0.6) 60%, #FAFAFA 100%);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }

        html:not(.dark) #hero img,
        html:not(.dark) section#hero img,
        html:not(.dark) section:first-of-type img,
        html:not(.dark) .hero-bg img {
            opacity: 1;
            filter: blur(3px) brightness(0.85);
            mix-blend-mode: normal;
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
        }

        /* Glow effects for buttons in light mode */
        html:not(.dark) .bg-primary {
            box-shadow: 0 8px 25px -8px var(--color-primary);
        }
        html:not(.dark) .pink-glow:hover {
            box-shadow: 0 12px 35px -10px var(--color-primary);
        }
        
        /* Interactive element effects */
        .group:hover { z-index: 10; }
        button, a { transition: all 0.3s ease; }
        button:active, a.button:active { transform: scale(0.97); }
        
        /* Container Highlights */
        html:not(.dark) .group:hover.bg-surface,
        html:not(.dark) .group:hover.bg-surface-container,
        html:not(.dark) .card-enter:hover {
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08), inset 0 0 20px rgba(255,255,255,1);
            transform: translateY(-4px);
            border-color: rgba(150, 69, 81, 0.2);
        }

        /* Hero text colors & contrast shadows */
        html:not(.dark) h1 {
            color: var(--color-on-bg);
        }
        html:not(.dark) h1 .text-primary, html:not(.dark) h2 .text-primary {
            color: var(--color-primary);
            text-shadow: 0 4px 20px rgba(202, 112, 147, 0.2);
        }

        /* Dark Theme: Remove all bright/white section & panel borders/frames */
        .dark .border,
        .dark .border-t,
        .dark .border-b,
        .dark .border-l,
        .dark .border-r,
        .dark [class*="border-"],
        .dark .divide-y > *,
        .dark .divide-x > * {
            border-color: rgba(255, 255, 255, 0.04);
        }
        .dark .border-primary,
        .dark [class*="border-primary"] {
            border-color: var(--color-primary);
        }

        /* Premium Header Button Animations (Hover & Click & Active Page) */
        #globalSearchBtn, 
        #authBtnGlobal, 
        nav button[onclick="toggleCartDrawerGlobal()"],
        #mobileMenuBtnGlobal,
        .theme-toggle-btn {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #globalSearchBtn:hover, 
        #authBtnGlobal:hover, 
        nav button[onclick="toggleCartDrawerGlobal()"]:hover,
        #mobileMenuBtnGlobal:hover,
        .theme-toggle-btn:hover,
        #globalSearchBtn.active, 
        #authBtnGlobal.active, 
        nav button[onclick="toggleCartDrawerGlobal()"].active,
        #mobileMenuBtnGlobal.active,
        .theme-toggle-btn.active {
            transform: scale(1.12);
            background-color: var(--color-primary) !important;
            color: var(--color-on-primary) !important;
            box-shadow: 0 4px 12px rgba(150, 69, 81, 0.25);
        }
        #globalSearchBtn:active, 
        #authBtnGlobal:active, 
        nav button[onclick="toggleCartDrawerGlobal()"]:active,
        #mobileMenuBtnGlobal:active,
        .theme-toggle-btn:active {
            transform: scale(0.92);
            background-color: var(--color-primary) !important;
            color: var(--color-on-primary) !important;
            transition: all 0.1s ease;
        }

        /* === PREMIUM PINK #ca7093 OVERRIDES FOR LIGHT MODE === */
        html:not(.dark) .pink-slide::after {
            background-color: #ca7093;
        }
        html:not(.dark) .mega-cat-link:hover,
        html:not(.dark) .mega-cat-item.is-active .mega-cat-link {
            background-color: #964551;
            color: #ffffff;
        }
        html:not(.dark) .mega-cat-item.is-active .mega-cat-link::before {
            background-color: #ffffff;
        }
        html:not(.dark) .tab-btn.active,
        html:not(.dark) .tab-active {
            background-color: rgba(202, 112, 147, 0.15);
            color: #ca7093;
            border-color: #ca7093;
        }
        html:not(.dark) .active-shape-card {
            border-color: #ca7093;
            background-color: rgba(202, 112, 147, 0.08);
            box-shadow: 0 0 20px rgba(202, 112, 147, 0.15);
        }
        html:not(.dark) input:not([type="checkbox"]):focus,
        html:not(.dark) select:focus,
        html:not(.dark) textarea:focus {
            border-bottom-color: #964551;
            border-color: #964551;
        }
        html:not(.dark) .industrial-glow:hover {
            border-color: #964551;
            box-shadow: inset 0 0 25px rgba(150, 69, 81, 0.1);
        }

        /* === THEME-AWARE CATEGORY CARD OVERLAY ===
           Dark mode: darken image for white text.
           Light mode: lighten ("засветление") image for dark text. */
        .cat-card-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(10,8,6,0.92) 0%, rgba(10,8,6,0.55) 50%, rgba(10,8,6,0.1) 100%);
            transition: background 0.5s ease;
        }
        html:not(.dark) .cat-card-overlay {
            background: linear-gradient(to top, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.65) 45%, rgba(255,255,255,0.2) 100%);
        }
        /* Card title/desc text color flips per theme */
        .cat-card-title { color: #ffffff; text-shadow: 0 1px 8px rgba(0,0,0,0.8); }
        html:not(.dark) .cat-card-title { color: #151311; text-shadow: 0 1px 6px rgba(255,255,255,0.7); }
        .cat-card-desc { color: rgba(255,255,255,0.85); }
        html:not(.dark) .cat-card-desc { color: rgba(21,19,17,0.75); }
        /* Image opacity tuned per theme so light overlay reads well */
        html:not(.dark) .cat-card-img { opacity: 0.85 !important; }

        /* Premium hover animation for catalog cards in light theme */
        html:not(.dark) .card-enter:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(150, 69, 81, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.6);
            border-color: rgba(150, 69, 81, 0.4);
        }

        /* Harmonized quantity selector backgrounds and text in light theme */
        html:not(.dark) .qty-selector-container,
        html:not(.dark) .calc-input-container {
            background-color: #F5F5F7;
            border-color: rgba(0, 0, 0, 0.15);
        }
        html:not(.dark) .qty-selector-container *,
        html:not(.dark) .calc-input-container * {
            color: #1A1817;
        }
        html:not(.dark) .qty-selector-container .border-l,
        html:not(.dark) .qty-selector-container .border-b,
        html:not(.dark) .calc-input-container .border-l,
        html:not(.dark) .calc-input-container .border-t {
            border-color: rgba(0, 0, 0, 0.1);
        }
        html:not(.dark) .qty-selector-container .bg-white\/5,
        html:not(.dark) .calc-input-container .bg-white\/\[0\.03\] {
            background-color: rgba(0, 0, 0, 0.05);
        }

        /* Shopping cart button styling in catalog card in light theme */
        html:not(.dark) .catalog-cart-btn {
            transition: all 0.3s ease;
        }
        html:not(.dark) .catalog-cart-btn * {
            transition: color 0.3s ease;
        }
        html:not(.dark) .catalog-cart-btn:hover {
            background-color: #1a1816 !important;
            color: #ffffff !important;
            box-shadow: none !important;
        }
        html:not(.dark) .catalog-cart-btn:hover * {
            color: #ffffff !important;
        }

        /* Calculator low container border and background overrides */
        html:not(.dark) .bg-surface-container-low {
            background-color: #F5F5F7;
            border-color: rgba(0, 0, 0, 0.15);
        }
        html:not(.dark) .bg-surface-container-low .border-white\/10,
        html:not(.dark) .bg-surface-container-low .border-r,
        html:not(.dark) .bg-surface-container-low .border-b {
            border-color: rgba(0, 0, 0, 0.15);
        }

        /* Premium Soft Overlays for Light Mode */
        html:not(.dark) #modalOverlay,
        html:not(.dark) #productModalOverlay,
        html:not(.dark) #drawingOverlay,
        html:not(.dark) #globalChatDrawerModal > div:first-child,
        html:not(.dark) #mobileMenuOverlayGlobal,
        html:not(.dark) #mobileCatalogOverlayGlobal,
        html:not(.dark) #cartOverlayGlobal,
        html:not(.dark) #authOverlayGlobal,
        html:not(.dark) #globalErrorPopup,
        html:not(.dark) .mega-overlay,
        html:not(.dark) #searchBackdropGlobal,
        html:not(.dark) #successOverlay,
        html:not(.dark) #filterDrawerOverlay,
        html:not(.dark) #orderDetailsModal > div:first-child,
        html:not(.dark) #leadDetailsModal > div:first-child,
        html:not(.dark) #createLeadModal > div:first-child,
        html:not(.dark) #cartSuccessOverlay,
        html:not(.dark) .modal-backdrop,
        html:not(.dark) [onclick*="closeOrderDetailsGlobal()"],
        html:not(.dark) [onclick*="closeLeadDetailsGlobal()"],
        html:not(.dark) [onclick*="closeCreateLeadModalGlobal()"],
        html:not(.dark) [onclick*="closeApplicationPopup()"],
        html:not(.dark) [onclick*="closeContactModalGlobal()"],
        html:not(.dark) [onclick*="closeProductModalGlobal()"],
        html:not(.dark) [onclick*="closeDrawingModal()"],
        html:not(.dark) [onclick*="closeGlobalChatDrawerGlobal()"],
        html:not(.dark) [onclick*="toggleSearchGlobal()"],
        html:not(.dark) [onclick*="toggleCartDrawerGlobal()"],
        html:not(.dark) [onclick*="toggleAuthModalGlobal()"] {
            background-color: rgba(255, 255, 255, 0.45) !important;
            backdrop-filter: blur(15px) saturate(140%) !important;
            -webkit-backdrop-filter: blur(15px) saturate(140%) !important;
        }

        /* Explicit override to remove backgrounds from mobile menu panel nav items in light mode */
        html:not(.dark) #mobileMenuPanelGlobal nav button,
        html:not(.dark) #mobileMenuPanelGlobal nav a {
            background-color: transparent !important;
            background: transparent !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
        }

        /* Restore opacity settings for light mode */
        html:not(.dark) .opacity-40 { opacity: 0.4; }
        html:not(.dark) .opacity-50 { opacity: 0.5; }
        html:not(.dark) .opacity-60 { opacity: 0.6; }
        html:not(.dark) .opacity-70 { opacity: 0.7; }
        html:not(.dark) .opacity-80 { opacity: 0.8; }

        /* Prevent logo image and container from shrinking */
        #globalHeader .logo-img-container,
        #globalHeader .logo-link-hover-effect {
            flex-shrink: 0 !important;
        }

        /* --- GLOBAL LIQUID GLASS SCROLLBAR WITH PINK BAR --- */
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
        * {
            scrollbar-width: thin;
            scrollbar-color: #ca7093 transparent !important;
        }
        html.light, html.light * {
            scrollbar-color: #ca7093 transparent !important;
        }

        /* Hero Stats Premium Liquid Glass Block (50% opacity white/black) */
        #hero .liquid-glass {
            background: rgba(0, 0, 0, 0.5) !important;
            backdrop-filter: blur(40px) saturate(220%) !important;
            -webkit-backdrop-filter: blur(40px) saturate(220%) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2), inset 0 0 25px rgba(255, 255, 255, 0.05) !important;
        }
        html.light #hero .liquid-glass,
        html:not(.dark) #hero .liquid-glass {
            background: rgba(255, 255, 255, 0.5) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.03), inset 0 0 25px rgba(255, 255, 255, 0.1) !important;
        }

        /* Custom Dropdown Adaptive Styles */
        .custom-dropdown-menu {
            background-color: #1a1816 !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: #c7c5c5 !important;
        }
        
        html:not(.dark) .custom-dropdown-menu {
            background-color: #ffffff !important;
            border: 1px solid rgba(0, 0, 0, 0.08) !important;
            color: #1A1817 !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
        }
        
        .custom-dropdown-item {
            color: #c7c5c5 !important;
            transition: background-color 0.2s ease, color 0.2s ease;
        }
        
        .custom-dropdown-item:hover {
            background-color: rgba(255, 255, 255, 0.05) !important;
        }
        
        html:not(.dark) .custom-dropdown-item {
            color: #1A1817 !important;
        }
        
        html:not(.dark) .custom-dropdown-item:hover {
            background-color: rgba(202, 112, 147, 0.08) !important;
            color: #ca7093 !important;
        }
        
        /* Checkbox & Circle Border Visibility Sync */
        .custom-dropdown-menu span[class*="border-outline-variant"] {
            border-color: rgba(255, 255, 255, 0.25) !important;
        }
        
        html:not(.dark) .custom-dropdown-menu span[class*="border-outline-variant"] {
            border-color: rgba(0, 0, 0, 0.15) !important;
        }

        /* Adjust labels inside dropdowns */
        html:not(.dark) .custom-dropdown-menu div[class*="text-on-surface-variant"] {
            color: rgba(83, 77, 74, 0.7) !important;
        }

        /* Make theme toggler (sun) pink in light mode */
        html:not(.dark) .theme-toggle-btn {
            color: var(--color-primary) !important;
        }
        html:not(.dark) #globalHeader .theme-toggle-btn {
            background-color: rgba(0, 0, 0, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.5) !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.03), inset 0 0 30px rgba(255, 255, 255, 0.4) !important;
        }

        /* Prevent Material Symbols fallback text flash */
        html:not(.fonts-loaded) .material-symbols-outlined {
            color: transparent !important;
            overflow: hidden;
            width: 24px;
            height: 24px;
            display: inline-block;
        }

        /* Checkbox styling fixes in dark theme to remove white border */
        html.dark input[type="checkbox"] {
            border-color: rgba(255, 255, 255, 0.15) !important;
            background-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
        }
        html.dark input[type="checkbox"]:checked {
            border-color: var(--color-primary) !important;
            background-color: var(--color-primary) !important;
            color: var(--color-primary) !important;
            box-shadow: none !important;
            outline: none !important;
        }
        html.dark input[type="checkbox"]:focus,
        html.dark input[type="checkbox"]:active,
        html.dark input[type="checkbox"]:hover,
        html.dark input[type="checkbox"]:checked:focus,
        html.dark input[type="checkbox"]:checked:hover,
        html.dark input[type="checkbox"]:focus-within {
            border-color: var(--color-primary) !important;
            background-color: var(--color-primary) !important;
            color: var(--color-primary) !important;
            box-shadow: none !important;
            outline: none !important;
            --tw-ring-offset-width: 0px !important;
            --tw-ring-width: 0px !important;
            --tw-ring-offset-color: transparent !important;
            --tw-ring-color: transparent !important;
        }
        html.dark input[type="checkbox"]:not(:checked):focus,
        html.dark input[type="checkbox"]:not(:checked):hover,
        html.dark input[type="checkbox"]:not(:checked):active {
            border-color: rgba(255, 255, 255, 0.3) !important;
            background-color: transparent !important;
            box-shadow: none !important;
            outline: none !important;
            --tw-ring-offset-width: 0px !important;
            --tw-ring-width: 0px !important;
            --tw-ring-offset-color: transparent !important;
            --tw-ring-color: transparent !important;
        }
    `;
    document.head.appendChild(style);

    window.tailwind = window.tailwind || {};
    window.tailwind.config = {
        darkMode: "class",
        theme: {
            extend: {
                colors: {
                    "background": "var(--color-bg)",
                    "on-background": "var(--color-on-bg)",
                    "surface": "var(--color-surface)",
                    "on-surface": "var(--color-on-surface)",
                    "surface-variant": "var(--color-surface-variant)",
                    "on-surface-variant": "var(--color-on-surface-variant)",
                    "surface-container": "var(--color-surface-container)",
                    "surface-container-low": "var(--color-surface-container-low)",
                    "surface-container-lowest": "var(--color-surface-container-lowest)",
                    "surface-container-high": "var(--color-surface-container-high)",
                    "surface-container-highest": "var(--color-surface-container-highest)",
                    "surface-bright": "var(--color-surface-bright)",
                    "surface-dim": "var(--color-surface-dim)",
                    
                    "primary": "var(--color-primary)",
                    "on-primary": "var(--color-on-primary)",
                    "primary-container": "var(--color-primary-container)",
                    "on-primary-container": "var(--color-on-primary-container)",
                    "primary-fixed": "var(--color-primary-fixed)",
                    "primary-fixed-dim": "var(--color-primary-fixed-dim)",
                    "on-primary-fixed": "var(--color-on-primary-fixed)",
                    "on-primary-fixed-variant": "var(--color-on-primary-fixed-variant)",
                    "inverse-primary": "var(--color-inverse-primary)",
                    "surface-tint": "var(--color-surface-tint)",

                    "secondary": "var(--color-secondary)",
                    "on-secondary": "var(--color-on-secondary)",
                    "secondary-container": "var(--color-secondary-container)",
                    "on-secondary-container": "var(--color-on-secondary-container)",
                    "secondary-fixed": "var(--color-secondary-fixed)",
                    "secondary-fixed-dim": "var(--color-secondary-fixed-dim)",
                    "on-secondary-fixed": "var(--color-on-secondary-fixed)",
                    "on-secondary-fixed-variant": "var(--color-on-secondary-fixed-variant)",

                    "tertiary": "var(--color-tertiary)",
                    "on-tertiary": "var(--color-on-tertiary)",
                    "tertiary-container": "var(--color-tertiary-container)",
                    "on-tertiary-container": "var(--color-on-tertiary-container)",

                    "error": "var(--color-error)",
                    "on-error": "var(--color-on-error)",
                    "error-container": "var(--color-error-container)",
                    "on-error-container": "var(--color-on-error-container)",

                    "outline": "var(--color-outline)",
                    "outline-variant": "var(--color-outline-variant)",
                    "inverse-surface": "var(--color-inverse-surface)",
                    "inverse-on-surface": "var(--color-inverse-on-surface)"
                },
                spacing: {
                    "margin-edge": "64px",
                    "margin-edge-mobile": "20px",
                    "section-gap": "160px",
                    "section-gap-mobile": "80px",
                    "gutter": "24px",
                    "unit": "8px",
                    "container-max": "1440px"
                },
                fontFamily: {
                    "body-md": ["Inter", "sans-serif"],
                    "label-caps": ["Space Grotesk", "sans-serif"],
                    "headline-lg": ["Space Grotesk", "sans-serif"],
                    "display-xl": ["Space Grotesk", "sans-serif"],
                    "body-lg": ["Inter", "sans-serif"],
                    "headline-md": ["Space Grotesk", "sans-serif"]
                },
                fontSize: {
                    "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-caps": ["14px", {"lineHeight": "20px", "letterSpacing": "0.1em", "fontWeight": "500"}],
                    "headline-lg": ["64px", {"lineHeight": "72px", "letterSpacing": "-0.02em", "fontWeight": "500"}],
                    "display-xl": ["120px", {"lineHeight": "110px", "letterSpacing": "-0.04em", "fontWeight": "600"}],
                    "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                    "headline-md": ["48px", {"lineHeight": "56px", "fontWeight": "500"}]
                }
            }
        }
    };

    // Font loading detection to prevent Material Symbols ligature text flashing
    if (document.fonts) {
        document.fonts.load('1em "Material Symbols Outlined"').then(function() {
            document.documentElement.classList.add('fonts-loaded');
        });
        window.addEventListener('load', function() {
            document.documentElement.classList.add('fonts-loaded');
        });
        // Safety timeout
        setTimeout(function() {
            document.documentElement.classList.add('fonts-loaded');
        }, 1200);
    } else {
        document.documentElement.classList.add('fonts-loaded');
    }
})();
