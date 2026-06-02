const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const newPreloaderCSS = `
<style id="custom-preloader-style">
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
</style>
<script>
  document.documentElement.classList.add('js-loading');
</script>
`;

const newPreloaderHTML = `
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
            <script>
                document.body.classList.add('preloader-active');
                setTimeout(() => {
                    const bar = document.getElementById('globalPreloaderBar');
                    if (bar) bar.style.width = '30%';
                }, 100);
                setTimeout(() => {
                    const bar = document.getElementById('globalPreloaderBar');
                    if (bar) bar.style.width = '65%';
                }, 400);
            </script>
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');

  // Remove old CSS
  const oldCssStart = content.indexOf('<style id="global-preloader-style">');
  if (oldCssStart !== -1) {
    const oldCssEnd = content.indexOf('</script>', oldCssStart);
    if (oldCssEnd !== -1) {
      content = content.substring(0, oldCssStart) + content.substring(oldCssEnd + 9);
    }
  }

  // Remove old HTML
  const oldHtmlStart = content.indexOf('<div id="global-preloader">');
  if (oldHtmlStart !== -1) {
    const oldHtmlEnd = content.indexOf('</script>', oldHtmlStart);
    if (oldHtmlEnd !== -1) {
      content = content.substring(0, oldHtmlStart) + content.substring(oldHtmlEnd + 9);
    }
  }

  // Remove new preloader if it already exists so we can re-add it cleanly
  if (content.includes('<style id="custom-preloader-style">')) {
      return; // Already added
  }

  // Inject New CSS before </head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', newPreloaderCSS + '\n</head>');
  }
  // Inject New HTML after <body...>
  if (content.match(/<body[^>]*>/i)) {
    content = content.replace(/(<body[^>]*>)/i, '$1\n' + newPreloaderHTML);
  }
  
  fs.writeFileSync(f, content);
  console.log('Fixed preloader in', f);
});
