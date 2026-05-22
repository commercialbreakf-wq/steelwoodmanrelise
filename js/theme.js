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
            --color-primary: #d6336c; 
            --color-on-primary: #FFFFFF;
            --color-primary-container: #FFD9E2;
            --color-on-primary-container: #400015;
            --color-primary-fixed: #FFD9E2;
            --color-primary-fixed-dim: #FFB0C8;
            --color-on-primary-fixed: #3B0013;
            --color-on-primary-fixed-variant: #721634;
            --color-inverse-primary: #FFB0C8;
            --color-surface-tint: #d6336c;

            --color-secondary: #c82b5e;
            --color-on-secondary: #FFFFFF;
            --color-secondary-container: #FFD9E2;
            --color-on-secondary-container: #3E0017;
            --color-secondary-fixed: #FFD9E2;
            --color-secondary-fixed-dim: #FFB1C0;
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

            --color-secondary: #ffb1c0;
            --color-on-secondary: #660029;
            --color-secondary-container: #8e093d;
            --color-on-secondary-container: #ff96ad;
            --color-secondary-fixed: #ffd9df;
            --color-secondary-fixed-dim: #ffb1c0;
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
        .theme-transitioning * {
            transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                        color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                        border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                        opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* --- LIQUID GLASS & LIGHT THEME MAGIC --- */
        html:not(.dark) .bg-surface,
        html:not(.dark) .bg-surface-container,
        html:not(.dark) .bg-surface-container-lowest,
        html:not(.dark) .glass-panel,
        html:not(.dark) .price-block {
            background-color: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(25px) saturate(200%);
            -webkit-backdrop-filter: blur(25px) saturate(200%);
            border: 1px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.5);
        }

        /* Hero Stats Liquid Glass & Divider Overrides */
        html:not(.dark) #hero .bg-surface/50,
        html:not(.dark) #hero .bg-surface-container-low/50,
        html:not(.dark) #hero .liquid-glass,
        html:not(.dark) #hero [class*="bg-surface"],
        html:not(.dark) #hero [class*="bg-surface-container-low"] {
            background-color: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(25px) saturate(200%);
            -webkit-backdrop-filter: blur(25px) saturate(200%);
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.5);
        }

        html:not(.dark) #hero .border-primary/30,
        html:not(.dark) #hero .border-l {
            border-color: rgba(150, 69, 81, 0.25);
        }

        /* Light Theme Header (Liquid Glass 70%) */
        html:not(.dark) #globalHeader {
            background-color: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(20px) saturate(190%);
            -webkit-backdrop-filter: blur(20px) saturate(190%);
            border-bottom: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
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
        html:not(.dark) .pink-glow:hover,
        html:not(.dark) .group:hover .pink-glow {
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
            text-shadow: 0 4px 20px rgba(150, 69, 81, 0.2);
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

        /* Premium Header Button Animations (Hover & Click) */
        #globalSearchBtn, 
        #authBtnGlobal, 
        nav button[onclick="toggleCartDrawerGlobal()"],
        #mobileMenuBtnGlobal {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #globalSearchBtn:hover, 
        #authBtnGlobal:hover, 
        nav button[onclick="toggleCartDrawerGlobal()"]:hover,
        #mobileMenuBtnGlobal:hover {
            transform: scale(1.12);
            background-color: var(--color-primary-container);
            color: var(--color-primary);
            box-shadow: 0 4px 12px rgba(150, 69, 81, 0.15);
        }
        #globalSearchBtn:active, 
        #authBtnGlobal:active, 
        nav button[onclick="toggleCartDrawerGlobal()"]:active,
        #mobileMenuBtnGlobal:active {
            transform: scale(0.92);
            background-color: var(--color-primary);
            color: var(--color-on-primary);
            transition: all 0.1s ease;
        }
        
        .apple-toggle-container {
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .apple-toggle-container:hover {
            transform: scale(1.08);
            box-shadow: 0 4px 12px rgba(150, 69, 81, 0.12);
        }
        .apple-toggle-container:active {
            transform: scale(0.95);
            transition: all 0.1s ease;
        }

        /* === PREMIUM PINK #d6336c OVERRIDES FOR LIGHT MODE === */
        html:not(.dark) .pink-slide::after {
            background-color: #d6336c;
        }
        html:not(.dark) .mega-cat-link:hover,
        html:not(.dark) .mega-cat-item.is-active .mega-cat-link {
            background-color: #d6336c;
            color: #ffffff;
        }
        html:not(.dark) .mega-cat-item.is-active .mega-cat-link::before {
            background-color: #ffffff;
        }
        html:not(.dark) .tab-btn.active,
        html:not(.dark) .tab-active {
            background-color: rgba(150, 69, 81, 0.15);
            color: #964551;
            border-color: #964551;
        }
        html:not(.dark) .active-shape-card {
            border-color: #d6336c;
            background-color: rgba(150, 69, 81, 0.08);
            box-shadow: 0 0 20px rgba(150, 69, 81, 0.15);
        }
        html:not(.dark) input:focus,
        html:not(.dark) select:focus,
        html:not(.dark) textarea:focus {
            border-bottom-color: #d6336c;
            border-color: #d6336c;
        }
        html:not(.dark) .industrial-glow:hover {
            border-color: #d6336c;
            box-shadow: inset 0 0 25px rgba(150, 69, 81, 0.1);
        }

        /* Premium hover animation for catalog cards in light theme */
        html:not(.dark) .card-enter:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 35px rgba(214, 51, 108, 0.25), inset 0 0 20px rgba(255, 255, 255, 0.6);
            border-color: rgba(214, 51, 108, 0.4);
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
        html:not(.dark) .qty-selector-container .bg-white/5,
        html:not(.dark) .calc-input-container .bg-white/[0.03] {
            background-color: rgba(0, 0, 0, 0.05);
        }

        /* Shopping cart button styling in catalog card in light theme */
        html:not(.dark) .catalog-cart-btn {
            background-color: #EAEAEB;
            color: #1A1817;
        }
        html:not(.dark) .catalog-cart-btn * {
            color: #1A1817;
        }
        html:not(.dark) .catalog-cart-btn:hover {
            background-color: #D9D9DA;
        }

        /* Calculator low container border and background overrides */
        html:not(.dark) .bg-surface-container-low {
            background-color: #F5F5F7;
            border-color: rgba(0, 0, 0, 0.15);
        }
        html:not(.dark) .bg-surface-container-low .border-white/10,
        html:not(.dark) .bg-surface-container-low .border-r,
        html:not(.dark) .bg-surface-container-low .border-b {
            border-color: rgba(0, 0, 0, 0.15);
        }

        /* Restore opacity settings for light mode */
        html:not(.dark) .opacity-40 { opacity: 0.4; }
        html:not(.dark) .opacity-50 { opacity: 0.5; }
        html:not(.dark) .opacity-60 { opacity: 0.6; }
        html:not(.dark) .opacity-70 { opacity: 0.7; }
        html:not(.dark) .opacity-80 { opacity: 0.8; }
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
})();
