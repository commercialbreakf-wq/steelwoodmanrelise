const fs = require('fs');
const files = ['js/shared-ui.js', 'js/shared-ui-copy.js', 'temp_served.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let c = fs.readFileSync(f, 'utf8');
        
        const regex = /window\.isTokenExpiredGlobal = function\(token\) \{[\s\S]*?return payload\.exp < now;\s*\};/g;
        
        const repl = `window.isTokenExpiredGlobal = function(token) {
    const payload = window.parseJwtGlobal(token);
    if (!payload) return true;
    return false;
};`;
        
        if (regex.test(c)) {
            fs.writeFileSync(f, c.replace(regex, repl));
            console.log('Fixed', f);
        } else {
            console.log('Not found in', f);
        }
    }
});
