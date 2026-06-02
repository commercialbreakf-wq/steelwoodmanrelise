const fs = require('fs');
const path = 'admin.html';
let content = fs.readFileSync(path, 'utf8');
const search = '<style>';
const replacement = '<style>\n        html, body {\n            max-width: 100vw;\n            overflow-x: hidden !important;\n        }';
if (content.includes(search) && !content.includes('overflow-x: hidden !important;')) {
    content = content.replace(search, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully patched admin.html');
} else {
    console.log('Already patched or search token not found');
}
