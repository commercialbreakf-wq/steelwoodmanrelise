const fs = require('fs');
const path = require('path');

// 1. In-memory fetch cache injection in shared-ui.js
const sharedUiFile = path.join(__dirname, '..', 'js', 'shared-ui.js');
let uiContent = fs.readFileSync(sharedUiFile, 'utf8');

const cacheLogic = `
// --- API IN-MEMORY CACHE FOR PERFORMANCE ---
(function() {
    if (window._apiCacheInstalled) return;
    window._apiCacheInstalled = true;
    
    const apiCache = new Map();
    const originalFetch = window.fetch;
    
    window.fetch = async function(resource, config) {
        const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : '');
        const method = config?.method || (resource instanceof Request ? resource.method : 'GET');
        
        // Cache only GET requests to /api/products
        if (method.toUpperCase() === 'GET' && url.includes('/api/products')) {
            if (apiCache.has(url)) {
                // Return a cloned response from cache so .json() can be called multiple times
                const cachedData = apiCache.get(url);
                return new Response(cachedData, {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
            const response = await originalFetch(resource, config);
            if (response.ok) {
                // Clone response to read text and cache it
                const clone = response.clone();
                try {
                    const text = await clone.text();
                    apiCache.set(url, text);
                    
                    // Optional: limit cache size
                    if (apiCache.size > 50) {
                        const firstKey = apiCache.keys().next().value;
                        apiCache.delete(firstKey);
                    }
                } catch(e) {}
            }
            return response;
        }
        
        return originalFetch(resource, config);
    };
})();
`;

if (!uiContent.includes('window._apiCacheInstalled = true;')) {
    // Insert after the first IIFE or at the top
    const insertPos = uiContent.indexOf('// --- GLOBAL API REWRITE INTERCEPTOR');
    if (insertPos !== -1) {
        uiContent = uiContent.substring(0, insertPos) + cacheLogic + '\\n' + uiContent.substring(insertPos);
    } else {
        uiContent = cacheLogic + '\\n' + uiContent;
    }
    fs.writeFileSync(sharedUiFile, uiContent);
    console.log('API cache injected into shared-ui.js');
}

// 2. Add preconnect and defer to HTML files
const htmlFiles = ['index.html', 'catalog.html', 'product.html'];
const preconnectTags = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
`;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add preconnect before first google font
    if (!content.includes('rel="preconnect" href="https://fonts.googleapis.com"')) {
        content = content.replace(
            /<link\s+href="https:\/\/fonts\.googleapis\.com/i,
            preconnectTags.trim() + '\\n    <link href="https://fonts.googleapis.com'
        );
    }
    
    // Add defer to all scripts pointing to /js/ that don't have it
    content = content.replace(
        /<script\s+src="(\/js\/[^"]+)"(?!.*defer)><\/script>/g,
        '<script src="$1" defer></script>'
    );
    
    // Also inline some critical css or add preload? Too complex right now, defer and preconnect is enough for task
    fs.writeFileSync(filePath, content);
    console.log('Optimized HTML head in ' + file);
});
