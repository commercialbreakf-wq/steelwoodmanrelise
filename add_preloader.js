const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const preloaderCSS = `
<style id="global-preloader-style">
  html { background-color: #FAFAFA; }
  html.dark { background-color: #151311; }
  body.preloader-active { overflow: hidden !important; }
  #global-preloader {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: #FAFAFA;
    z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center;
    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
  }
  html.dark #global-preloader { background-color: #151311; }
  .preloader-spinner {
    width: 48px; height: 48px;
    border: 3px solid rgba(202, 112, 147, 0.2);
    border-top-color: #ca7093;
    border-radius: 50%;
    animation: spin 0.8s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite;
  }
  html.dark .preloader-spinner {
    border: 3px solid rgba(150, 69, 81, 0.2);
    border-top-color: #964551;
  }
  @keyframes spin { 100% { transform: rotate(360deg); } }
  .preloader-hidden { opacity: 0 !important; visibility: hidden !important; pointer-events: none; }
</style>
<script>
  // Block rendering until DOM is ready to prevent FOUC
  document.documentElement.classList.add('js-loading');
</script>
`;

const preloaderHTML = `
<div id="global-preloader">
  <div class="preloader-spinner"></div>
</div>
<script>
  document.body.classList.add('preloader-active');
  window.addEventListener('load', function() {
    // Add small delay to ensure rendering is complete
    requestAnimationFrame(() => {
      setTimeout(() => {
        const p = document.getElementById('global-preloader');
        if (p) {
          p.classList.add('preloader-hidden');
          document.body.classList.remove('preloader-active');
          document.documentElement.classList.remove('js-loading');
          setTimeout(() => p.remove(), 600);
        }
      }, 150); // slight delay for smooth visual transition
    });
  });
</script>
`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('global-preloader')) return; // skip
  
  if (content.includes('</head>')) {
    content = content.replace('</head>', preloaderCSS + '\n</head>');
  }
  if (content.match(/<body[^>]*>/i)) {
    content = content.replace(/(<body[^>]*>)/i, '$1\n' + preloaderHTML);
  }
  
  fs.writeFileSync(f, content);
  console.log('Added preloader to', f);
});
