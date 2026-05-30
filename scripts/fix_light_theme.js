const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');

// 1. Fix shared-ui.js
const sharedUiPath = path.join(dir, 'js', 'shared-ui.js');
let sharedUi = fs.readFileSync(sharedUiPath, 'utf8');
sharedUi = sharedUi.replace(/\/\* --- CUSTOM PALETTE[\s\S]*?(?=<\/style>)/g, '');
// Also remove any remaining html.light rules before CUSTOM PALETTE (like apple-toggle)
sharedUi = sharedUi.replace(/html\.light\s+[^{]+\{[^}]+\}/g, '');
fs.writeFileSync(sharedUiPath, sharedUi, 'utf8');
console.log('Fixed shared-ui.js');

// 2. Fix product.html
const productPath = path.join(dir, 'product.html');
let productHtml = fs.readFileSync(productPath, 'utf8');
productHtml = productHtml.replace(/\/\* Light Theme Fixes for Product Card \*\/[\s\S]*?<\/style>/g, '</style>');
fs.writeFileSync(productPath, productHtml, 'utf8');
console.log('Fixed product.html');

// 3. Fix catalog.html
const catalogPath = path.join(dir, 'catalog.html');
let catalogHtml = fs.readFileSync(catalogPath, 'utf8');
catalogHtml = catalogHtml.replace(/html\.light\s+[^{]+\{[^}]+\}/g, '');
fs.writeFileSync(catalogPath, catalogHtml, 'utf8');
console.log('Fixed catalog.html');
