const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'catalog.html');
let content = fs.readFileSync(targetFile, 'utf8');

// The easiest way is to find `<img src="\${imgUrl}" alt="\${name}" class=` and inject `loading="lazy" decoding="async"`
content = content.replace(
    /<img src="\$\{imgUrl\}" alt="\$\{name\}" class="([^"]+)"\/>/g,
    '<img src="${imgUrl}" alt="${name}" class="$1" loading="lazy" decoding="async"/>'
);

// Do the same for catalog.html static images if they don't have it
content = content.replace(
    /<img src="\/images\/products([^"]+)" alt="([^"]+)" class="([^"]+)"(?!.*loading=)/g,
    '<img src="/images/products$1" alt="$2" class="$3" loading="lazy" decoding="async"'
);

fs.writeFileSync(targetFile, content);
console.log('Lazy loading added to catalog.html');

const sharedUiFile = path.join(__dirname, '..', 'js', 'shared-ui.js');
let uiContent = fs.readFileSync(sharedUiFile, 'utf8');

uiContent = uiContent.replace(
    /<img src="\$\{img\}" class="w-full h-full object-cover" alt="Миниатюра"\/>/g,
    '<img src="${img}" class="w-full h-full object-cover" alt="Миниатюра" loading="lazy" decoding="async"/>'
);

fs.writeFileSync(sharedUiFile, uiContent);
console.log('Lazy loading added to shared-ui.js');
