const fs = require('fs');
const content = fs.readFileSync('js/shared-ui.js', 'utf8');
const lines = content.split(/\r?\n/);
for (let i = 6995; i < 7015 && i < lines.length; i++) {
    console.log(`${i + 1}: [${lines[i]}]`);
    console.log(Buffer.from(lines[i]).toString('hex'));
}
