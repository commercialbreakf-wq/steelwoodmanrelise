const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = './database.sqlite';
const productsDataPath = './products-data.js';
const catalogDumpPath = './catalog_dump.txt';

const CATEGORY_IMAGES = {
    'Арматура': '/images/rebar.png',
    'Балка': '/images/beams.png',
    'Лист': '/images/sheets.png',
    'Труба': '/images/tubes.png',
    'Уголок': '/images/angles.png',
    'Швеллер': '/images/beams.png',
    'Сетка': '/images/rebar.png',
    'Профнастил': '/images/sheets.png',
    'Полиэстер': '/images/sheets.png'
};

const BASE_PRICES = {
    'Арматура': 58500,
    'Балка': 84200,
    'Лист': 76400,
    'Труба': 79800,
    'Уголок': 69500,
    'Швеллер': 75800,
    'Сетка': 98000,
    'Профнастил': 115000,
    'полиэстер': 125000
};

function getWeight(cat, size, type) {
    cat = cat.toLowerCase();
    size = size || '';
    type = type || '';
    
    if (cat.includes('арматура')) {
        const d = parseInt(size);
        if (!d) return 1;
        return (d * d * 0.00617);
    }
    if (cat.includes('балка')) {
        const num = parseInt(size);
        if (num === 10) return 9.46;
        if (num === 12) return 11.5;
        if (num === 14) return 13.7;
        if (num === 16) return 15.8;
        if (num === 18) return 18.8;
        if (num === 20) return 21.3;
        return 25;
    }
    if (cat.includes('лист')) {
        const t = parseFloat(size);
        return (t || 1) * 7.85;
    }
    if (cat.includes('квадратная')) {
        const s = parseInt(size);
        const t = parseFloat(type);
        if (!s || !t) return 2;
        return (s * 4 * t * 0.00785);
    }
    if (cat.includes('прямоугольная')) {
        const dims = size.split('х').map(d => parseInt(d));
        const t = parseFloat(type);
        if (dims.length < 2 || !t) return 3;
        return ((dims[0] + dims[1]) * 2 * t * 0.00785);
    }
    if (cat.includes('уголок')) {
        const s = parseInt(size);
        const t = parseFloat(type);
        if (!s || !t) return 2;
        return (s * 2 * t * 0.00785);
    }
    if (cat.includes('швеллер')) {
        const num = parseInt(size);
        if (num === 8) return 7.05;
        if (num === 10) return 8.59;
        if (num === 12) return 10.4;
        if (num === 14) return 12.3;
        if (num === 16) return 14.2;
        if (num === 18) return 16.3;
        if (num === 20) return 18.4;
        return 20;
    }
    if (cat.includes('профнастил') || cat.includes('полиэстер')) return 4.5;
    if (cat.includes('сетка')) return 3.5;
    if (cat.includes('вгп') || cat.includes('эсв')) {
        const d = parseInt(size.replace('ДУ', ''));
        const t = parseFloat(type);
        if (!d || !t) return 3;
        return ((d + t) * t * 0.02466);
    }
    return 1;
}

async function run() {
    if (!fs.existsSync(catalogDumpPath)) return;

    const content = fs.readFileSync(catalogDumpPath, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    let currentCategory = '';
    let currentParentCategory = 'Металлопрокат';
    const allProducts = [];
    let counter = 0;

    const HEADERS = [
        'арматура а1', 'арматура а3', 'балка', 'лист хк', 'профиль квадратная',
        'труба профильная прямоугольная', 'труба эсв', 'уголок', 'швеллер',
        'профнастил окрашенный', 'полиэстер односторонний 0.4мм', 'профнастил оцинкованный 0.4мм',
        'труба вгп'
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lowerLine = line.toLowerCase();
        
        // Detection logic for headers
        let isHeader = HEADERS.includes(lowerLine) || 
                       (lowerLine.startsWith('сетка') && (lowerLine.includes(' м') || lowerLine.includes('сетка сетка')));

        if (isHeader) {
            currentCategory = line.replace(/сетка сетка/i, 'Сетка').trim();
            if (currentCategory.toLowerCase() === 'полиэстер односторонний 0.4мм') {
                currentCategory = 'Профнастил окрашенный';
            }
            const low = lowerLine;
            if (low.includes('профнастил') || low.includes('полиэстер')) {
                currentParentCategory = 'Кровля и фасад';
            } else if (low.includes('лист')) {
                currentParentCategory = 'Листовой металлопрокат';
            } else if (low.includes('труба') || low.includes('профиль')) {
                currentParentCategory = 'Трубный металлопрокат';
            } else {
                currentParentCategory = 'Черный металлопрокат';
            }
            continue;
        }

        if (!currentCategory || lowerLine === 'виды:' || lowerLine === 'проф лист') continue;

        const name = line;
        let size = '', vid = '', type = '';

        if (currentCategory.toLowerCase().includes('арматура')) {
            const match = name.match(/(\d+)\s*м/i);
            if (match) { size = match[1] + " мм"; vid = currentCategory.includes('а1') ? 'А1' : 'А3'; }
        } else if (currentCategory.toLowerCase().includes('балка')) {
            const match = name.match(/(\d+)([бкуш]\d*)/i);
            if (match) { size = match[1]; vid = match[2].toUpperCase(); }
        } else if (currentCategory.toLowerCase().includes('лист хк')) {
            const match = name.match(/(\d+\.?\d*)/);
            if (match) { size = match[1] + " мм"; vid = "Х/К"; }
        } else if (currentCategory.toLowerCase().includes('профиль квадратная')) {
            const parts = name.split(/\s+/);
            if (parts.length >= 4) { size = parts[2] + "х" + parts[2]; type = parts[3] + " мм"; vid = "Квадратная"; }
        } else if (currentCategory.toLowerCase().includes('прямоугольная')) {
            const parts = name.split(/\s+/);
            if (parts.length >= 6) { size = parts[3] + "х" + parts[4]; type = parts[5] + " мм"; vid = "Прямоугольная"; }
        } else if (currentCategory.toLowerCase().includes('эсв')) {
            const match = name.match(/(\d+)\*(\d+(?:\/\d+)*)/);
            if (match) { size = match[1] + " мм"; type = match[2] + " мм"; vid = "ЭСВ"; }
        } else if (currentCategory.toLowerCase().includes('уголок')) {
            const parts = name.split(/\s+/);
            if (parts.length >= 3) { size = parts[1] + "х" + parts[1]; type = parts[2] + " мм"; vid = "Равнополочный"; }
        } else if (currentCategory.toLowerCase().includes('швеллер')) {
            const match = name.match(/(\d+)\s*([пу])/i);
            if (match) { size = match[1]; vid = match[2].toUpperCase(); }
        } else if (currentCategory.toLowerCase().includes('профнастил') || currentCategory.toLowerCase().includes('полиэстер')) {
            const match = name.match(/([СН][С]?\d+)/i);
            if (match) { vid = match[1].toUpperCase(); size = "0.4 мм"; }
        } else if (currentCategory.toLowerCase().includes('сетка')) {
            const match = name.match(/(\d+)\*(\d+)\*(\d+)/);
            if (match) { size = `${match[1]}х${match[2]}`; type = match[3] + " мм"; vid = "Сварная"; }
        } else if (currentCategory.toLowerCase().includes('вгп')) {
            const parts = name.split(/\s+/);
            if (parts.length >= 4) { size = "ДУ " + parts[2]; type = parts[3] + " мм"; vid = "ВГП"; }
        }

        let baseCat = 'Труба';
        if (currentCategory.toLowerCase().includes('арматура')) baseCat = 'Арматура';
        else if (currentCategory.toLowerCase().includes('балка')) baseCat = 'Балка';
        else if (currentCategory.toLowerCase().includes('лист')) baseCat = 'Лист';
        else if (currentCategory.toLowerCase().includes('уголок')) baseCat = 'Уголок';
        else if (currentCategory.toLowerCase().includes('швеллер')) baseCat = 'Швеллер';
        else if (currentCategory.toLowerCase().includes('сетка')) baseCat = 'Сетка';
        else if (currentCategory.toLowerCase().includes('профнастил')) baseCat = 'Профнастил';
        else if (currentCategory.toLowerCase().includes('полиэстер')) baseCat = 'полиэстер';

        const priceTon = BASE_PRICES[baseCat] || 75000;
        const weight = getWeight(currentCategory, size, type);
        const priceUnit = Math.round((priceTon / 1000) * weight);

        let unitLabel = 'ЗА МЕТР';
        if (currentCategory.includes('Лист') || currentCategory.includes('Сетка') || currentCategory.includes('Профнастил') || currentCategory.includes('полиэстер')) unitLabel = 'ЗА М.КВ';

        allProducts.push({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 50) + '-' + counter++,
            name, category: currentCategory, parent_category: currentParentCategory,
            vid: vid || 'Стандарт', length: 'Немерная', width: size || 'Стандарт', type: type || 'Стандарт',
            group_key: name, price_ton: priceTon, price_unit: priceUnit, unit_label: unitLabel, weight: weight.toFixed(3),
            description: `Металлопрокат: ${name}. Соответствует ГОСТ. Актуальные цены из 23met.ru.`,
            image: CATEGORY_IMAGES[baseCat] || '/images/tubes.png',
            specs: JSON.stringify([["Наименование", name], ["Категория", currentCategory], ["Размер", size || "Стандарт"], ["Вид", vid || "Стандарт"]])
        });
    }

    const db = new sqlite3.Database(dbPath);
    db.serialize(() => {
        db.run("DELETE FROM products");
        db.run("DELETE FROM categories");
        const stmt = db.prepare(`INSERT INTO products (id, name, category, parent_category, vid, length, width, type, group_key, price_ton, price_unit, unit_label, weight, description, image, specs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
        allProducts.forEach(p => stmt.run(p.id, p.name, p.category, p.parent_category, p.vid, p.length, p.width, p.type, p.group_key, p.price_ton, p.price_unit, p.unit_label, p.weight, p.description, p.image, p.specs));
        stmt.finalize();
        const categories = [...new Set(allProducts.map(p => p.category))];
        const catStmt = db.prepare("INSERT INTO categories (name) VALUES (?)");
        categories.forEach(c => catStmt.run(c));
        catStmt.finalize();
    });

    const jsProducts = allProducts.map(p => ({
        id: p.id, category: p.category, parentCategory: p.parent_category, name: p.name, vid: p.vid, length: p.length, width: p.width, type: p.type, groupKey: p.group_key,
        priceTon: p.price_ton.toLocaleString('ru-RU', { minimumFractionDigits: 2 }), priceTonNum: p.price_ton, priceUnit: p.price_unit.toLocaleString('ru-RU', { minimumFractionDigits: 2 }), unitLabel: p.unit_label, perTon: p.weight, desc: p.description, specs: JSON.parse(p.specs), badge: 'В НАЛИЧИИ', img: p.image
    }));
    fs.writeFileSync(productsDataPath, `const PRODUCTS = ${JSON.stringify(jsProducts, null, 2)};\nconst CATEGORIES = [...new Set(PRODUCTS.map(p => p.category))];`);
    db.close();
    console.log(`Updated ${allProducts.length} products.`);
}
run();
