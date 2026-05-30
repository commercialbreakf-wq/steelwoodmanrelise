const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '..', 'Stitch_first — копия (3) — копия');

function searchFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'images') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchFiles(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('.json') || file.endsWith('.env')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.toLowerCase().includes('ssh') || content.toLowerCase().includes('reg.ru')) {
                    console.log(`Found in: ${fullPath}`);
                    const lines = content.split('\\n');
                    lines.forEach((l, i) => {
                        if (l.toLowerCase().includes('ssh') || l.toLowerCase().includes('reg.ru')) {
                            console.log(`  Line ${i+1}: ${l.trim()}`);
                        }
                    });
                }
            } catch(e) {}
        }
    }
}

searchFiles(targetDir);
