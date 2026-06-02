const fs = require('fs');
const files = ['js/shared-ui.js', 'js/shared-ui-copy.js', 'temp_served.js'];
files.forEach(f => {
    if (fs.existsSync(f)) {
        let c = fs.readFileSync(f, 'utf8');
        
        // Use regex to replace the specific block inside toggleAuthModalGlobal
        const regex = /\} else \{\s+drawer\.style\.display = 'block';\s+drawer\.offsetHeight;/g;
        
        const repl = `} else {
        const token = localStorage.getItem('metal_token');
        if (token && (!window.isTokenExpiredGlobal || !window.isTokenExpiredGlobal(token))) {
            if (!window.location.pathname.includes('/cabinet')) {
                window.location.href = '/cabinet/';
            }
            return;
        }

        drawer.style.display = 'block';
        drawer.offsetHeight;`;
        
        if (regex.test(c)) {
            fs.writeFileSync(f, c.replace(regex, repl));
            console.log('Fixed', f);
        } else {
            console.log('Not found in', f);
        }
    }
});
