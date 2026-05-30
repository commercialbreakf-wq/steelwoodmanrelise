const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

const replaceThemeScript = (html) => {
    // Regular expression to match both variants:
    // 1. <script id="tailwind-config">...</script>
    // 2. <script>\s*tailwind.config = { ... }\s*</script>
    
    // Replace <script id="tailwind-config">...</script>
    let newHtml = html.replace(/<script\s+id="tailwind-config"[\s\S]*?<\/script>/gi, '<script src="/js/theme.js?v=2"></script>');
    
    // Replace <script>tailwind.config = ... </script>
    newHtml = newHtml.replace(/<script>\s*(?:window\.)?tailwind\.config\s*=[\s\S]*?<\/script>/gi, '<script src="/js/theme.js?v=2"></script>');

    return newHtml;
};

const processDir = (currentDir) => {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const fullPath = path.join(currentDir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Ignore node_modules, .git, etc.
            if (!['node_modules', '.git', '.agents'].includes(file)) {
                processDir(fullPath);
            }
        } else if (fullPath.endsWith('.html')) {
            const html = fs.readFileSync(fullPath, 'utf8');
            const newHtml = replaceThemeScript(html);
            if (html !== newHtml) {
                fs.writeFileSync(fullPath, newHtml, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
};

console.log('Applying theme.js to all HTML files...');
processDir(dir);
console.log('Done!');
