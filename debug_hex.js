const fs = require('fs');
const buffer = fs.readFileSync('js/shared-ui.js');
// Find the index of "const lightModeStyles"
const searchStr = 'const lightModeStyles';
const index = buffer.indexOf(searchStr);
if (index !== -1) {
    const start = Math.max(0, index - 50);
    const end = Math.min(buffer.length, index + 200);
    console.log(buffer.slice(start, end).toString('hex').match(/.{1,32}/g).join('\n'));
    console.log(buffer.slice(start, end).toString());
}
