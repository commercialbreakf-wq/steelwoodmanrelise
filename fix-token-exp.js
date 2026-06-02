const fs = require('fs');
const files = ['js/shared-ui.js', 'js/shared-ui-copy.js', 'temp_served.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let c = fs.readFileSync(f, 'utf8');
        
        const target = `window.isTokenExpiredGlobal = function(token) {
    const payload = window.parseJwtGlobal(token);
    if (!payload) return true;
    if (!payload.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};`;
        const repl = `window.isTokenExpiredGlobal = function(token) {
    const payload = window.parseJwtGlobal(token);
    if (!payload) return true;
    // Client-side expiration is disabled because the backend "sliding session" logic
    // allows tokens to persist forever until explicitly logged out.
    return false;
};`;
        
        if (c.includes(target)) {
            fs.writeFileSync(f, c.replace(target, repl));
            console.log('Fixed', f);
        } else {
            console.log('Not found in', f);
        }
    }
});
