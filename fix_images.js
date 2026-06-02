const fs = require('fs');
let data = fs.readFileSync('products-data.js', 'utf8');
data = data.replace(/\/images\/armatura_real\.jpg/g, '/images/products/real/armatura_gen.png');
data = data.replace(/\/images\/ugolok_real\.jpg/g, '/images/products/real/ugolok_gen.png');
fs.writeFileSync('products-data.js', data);
console.log('Updated products-data.js');
