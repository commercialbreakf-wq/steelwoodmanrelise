const fs = require('fs');

const d1 = JSON.parse(fs.readFileSync('./catalog_extracted.json', 'utf8'));
const d2 = JSON.parse(fs.readFileSync('./catalog_extracted_rest.json', 'utf8'));
const allData = [...d1, ...d2];

function generateId(name) {
    const from = "а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я".split(' ');
    const to = "a b v g d e yo zh z i y k l m n o p r s t u f h c ch sh shch '' y '' e yu ya".split(' ');
    let res = name.toLowerCase();
    for (let i = 0; i < from.length; i++) {
        res = res.split(from[i]).join(to[i]);
    }
    return res.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseParameters(paramStr) {
    const params = {};
    if (!paramStr) return params;
    const parts = paramStr.split(/[;,]/);
    parts.forEach(p => {
        const kv = p.split(':');
        if (kv.length === 2) {
            params[kv[0].trim()] = kv[1].trim();
        }
    });
    return params;
}

const PRODUCTS = [];
let idCounter = 1;

for (const catData of allData) {
    const category = catData.category || 'Без категории';
    let parentCategory = 'Черный металлопрокат';
    if (catData.parentPath && catData.parentPath.length > 0) {
        parentCategory = catData.parentPath[0];
    } else {
        if (category === 'Нержавеющая сталь') parentCategory = 'Нержавеющая сталь';
        else if (category === 'Спецстали') parentCategory = 'Спецстали';
        else if (category === 'Кровельные материалы') parentCategory = 'Кровельные материалы';
    }

    const products = catData.products || [];
    for (const p of products) {
        if (!p.name || !p.price) continue;
        const name = p.name.trim();
        const priceStr = p.price.trim().replace(/[^\d]/g, '');
        const priceNum = parseInt(priceStr, 10) || 0;
        
        const params = parseParameters(p.parameters);
        const lengthStr = params['Длина'] || params['Максимальная длина'] || '';
        const weightStr = params['Вес 1 м.п.'] || params['Вес 1м'] || params['Вес'] || '';
        
        // Try to figure out price per unit if possible
        let weightNum = parseFloat(weightStr.replace(',', '.'));
        let priceUnitNum = 0;
        let unitLabel = 'за метр';
        let priceTonNum = priceNum;
        
        if (p.price.includes('м²')) {
            unitLabel = 'за м²';
            priceUnitNum = priceNum;
            priceTonNum = 0;
        } else if (p.price.includes('шт')) {
            unitLabel = 'за шт';
            priceUnitNum = priceNum;
            priceTonNum = 0;
        } else {
            // Assume price is per ton
            if (weightNum > 0 && priceTonNum > 0) {
                // ton = 1000kg
                priceUnitNum = Math.ceil((priceTonNum / 1000) * weightNum);
            }
        }

        const id = generateId(name) + '-' + (idCounter++);
        
        const specs = [];
        specs.push(['Наименование', name]);
        for (const [k, v] of Object.entries(params)) {
            specs.push([k, v]);
        }

        PRODUCTS.push({
            id: id,
            name: name,
            category: category,
            parentCategory: parentCategory,
            length: lengthStr,
            priceTon: priceTonNum > 0 ? priceTonNum.toString() : '',
            priceTonNum: priceTonNum,
            priceUnit: priceUnitNum > 0 ? priceUnitNum.toString() : '',
            priceUnitNum: priceUnitNum,
            unitLabel: unitLabel,
            weight: weightStr,
            desc: `${name}. Цена: ${p.price}. ${p.parameters || ''}`,
            specs: specs,
            img: '' // Set empty img for now, or add default
        });
    }
}

// Write the file in proper format
const fileContent = `// Product catalog - Generated from scraped data - ${new Date().toISOString()}
const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PRODUCTS };
}
`;

fs.writeFileSync('./products-data.js', fileContent, 'utf8');
console.log('Successfully wrote products-data.js with ' + PRODUCTS.length + ' products.');
