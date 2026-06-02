const fs = require('fs');
const files = ['js/shared-ui.js', 'js/shared-ui-copy.js', 'temp_served.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let c = fs.readFileSync(f, 'utf8');
        const target = "    } else {\n        drawer.style.display = 'block';\n        drawer.offsetHeight; // Force reflow";
        const repl = `    } else {
        const token = localStorage.getItem('metal_token');
        if (token && (!window.isTokenExpiredGlobal || !window.isTokenExpiredGlobal(token))) {
            if (!window.location.pathname.includes('/cabinet')) {
                window.location.href = '/cabinet/';
            }
            return;
        }

        drawer.style.display = 'block';
        drawer.offsetHeight; // Force reflow`;
        
        if (c.includes(target)) {
            fs.writeFileSync(f, c.replace(target, repl));
            console.log('Fixed', f);
        } else {
            console.log('Not found in', f);
        }
    }
});
