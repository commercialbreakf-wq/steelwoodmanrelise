const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://drbknuvnsyonmeudoleo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODYxMDgxNiwiZXhwIjoyMDk0MTg2ODE2fQ.dnQgta6bz30KP_NWmN-LOEdccSiVUxs2ZYvvOJCY8Hk';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const categoryImageMapping = {
    'Композитная арматура': [
        '/images/products/real/armatura_gen.png'
    ],
    'Арматура': [
        '/images/products/real/Склад_арматура_прутки.jpg',
        '/images/products/real/Арматура_гнутая_уголки.jpg',
        '/images/products/real/Арматура_гнутая_хомуты.jpg'
    ],
    'Труба профильная': [
        '/images/products/real/Склад_профильная_труба.jpg',
        '/images/products/real/Склад_профильная_труба_3.jpg',
        '/images/products/real/Профильная_труба_на_улице.jpg'
    ],
    'Трубы профильные': [
        '/images/products/real/Склад_профильная_труба.jpg',
        '/images/products/real/Склад_профильная_труба_3.jpg',
        '/images/products/real/Профильная_труба_на_улице.jpg'
    ],
    'Трубы бесшовные': [
        '/images/products/real/trubi_besshovnie_gen.png'
    ],
    'Трубы электросварные': [
        '/images/products/real/Склад_труба_электросварная.jpg'
    ],
    'Трубы ВГП': [
        '/images/products/real/Склад_труба_ВГП.jpg',
        '/images/products/real/Склад_профильная_и_круглая_труба.jpg'
    ],
    'Трубы стальные': [
        '/images/products/real/Склад_труба_электросварная.jpg',
        '/images/products/real/Склад_труба_ВГП.jpg'
    ],
    'Лист': [
        '/images/products/real/sheet_realistic_1_1779883797660.png',
        '/images/products/real/sheet_realistic_2_1779883811249.png'
    ],
    'Балка': [
        '/images/products/real/beams_realistic_1_1779883702409.png',
        '/images/products/real/beams_realistic_2_1779883717206.png'
    ],
    'Двутавр': [
        '/images/products/real/beams_realistic_1_1779883702409.png',
        '/images/products/real/beams_realistic_2_1779883717206.png'
    ],
    'Швеллер': [
        '/images/products/real/channel_realistic_1_1779883730333.png',
        '/images/products/real/channel_realistic_2_1779883749651.png'
    ],
    'Профнастил': [
        '/images/products/real/profnastil_ocinkovanniy_gen.png',
        '/images/products/real/profnastil_okrashenniy_gen.png'
    ],
    'Уголок': [
        '/images/products/real/Склад_уголок_стальной.jpg',
        '/images/products/real/Склад_уголок_стальной_2.jpg'
    ],
    'Сетка': [
        '/images/products/real/Склад_лист_ПВЛ.jpg',
        '/images/products/real/Склад_лист_ПВЛ_2.jpg'
    ],
    'Просечно-вытяжной': [
        '/images/products/real/Склад_лист_ПВЛ.jpg'
    ],
    'Катанка': [
        '/images/products/real/Склад_катанка.jpg',
        '/images/products/real/Склад_катанка_2.jpg'
    ],
    'Полоса': [
        '/images/products/real/polosa_gen.png'
    ],
    'Круг': [
        '/images/products/round_steel_premium_1778423868660.png'
    ],
    'Пруток': [
        '/images/products/round_steel_premium_1778423868660.png'
    ],
    'Квадрат': [
        '/images/products/square_steel_premium_1778423850615.png'
    ],
    'Проволока': [
        '/images/products/steel_wire_premium_1778423804026.png'
    ],
    'Лягушка': [
        '/images/products/real/Арматура_гнутая_хомуты.jpg'
    ],
    'Закладные': [
        '/images/products/real/zakladnie_detali_gen.png'
    ],
    'Металлочерепица': [
        '/images/products/real/metallocherepica_gen.png'
    ],
    'Фальцевая': [
        '/images/products/real/faltsevaya_krovlya_gen.png'
    ],
    'Гибкая': [
        '/images/products/real/gibkaya_cherepica_gen.png'
    ],
    'Натуральная': [
        '/images/products/real/gibkaya_cherepica_gen.png'
    ],
    'Композитная черепица': [
        '/images/products/real/gibkaya_cherepica_gen.png'
    ],
    'Ондулин': [
        '/images/products/real/corrugated_realistic_1_1779883763240.png'
    ],
    'Шифер': [
        '/images/products/real/corrugated_realistic_1_1779883763240.png',
        '/images/products/real/corrugated_realistic_2_1779883779124.png'
    ],
    'Водостоки': [
        '/images/products/real/vodostoki_gen.png'
    ],
    'Фитинги': [
        '/images/products/real/svarochnie_materiali_gen.png'
    ],
    'Трубопроводная': [
        '/images/products/real/svarochnie_materiali_gen.png'
    ],
    'Сварочные': [
        '/images/products/real/svarochnie_materiali_gen.png'
    ],
    'Шестигранник': [
        '/images/products/real/shestigrannik_gen.png'
    ]
};

async function updateImages() {
    console.log('Fetching ALL products paginated from Supabase...');
    let products = [];
    let from = 0;
    let to = 999;
    let hasMore = true;
    while (hasMore) {
        const { data, error } = await supabase
            .from('products')
            .select('id, category, parent_category, name')
            .range(from, to);
        if (error) {
            console.error('Error loading:', error);
            return;
        }
        if (data && data.length > 0) {
            products = products.concat(data);
            from += 1000;
            to += 1000;
        } else {
            hasMore = false;
        }
    }

    console.log(`Successfully fetched ${products.length} products total.`);

    const updates = products.map(product => {
        let matchCat = null;
        for (const [key, imgs] of Object.entries(categoryImageMapping)) {
            if (product.category && product.category.toLowerCase().includes(key.toLowerCase())) {
                matchCat = key;
                break;
            }
            if (product.name && product.name.toLowerCase().includes(key.toLowerCase())) {
                matchCat = key;
                break;
            }
        }

        const imagesStr = matchCat 
            ? categoryImageMapping[matchCat].join(',') 
            : '/images/products/real/Погрузка_металлопроката.jpg';
            
        return {
            id: product.id,
            name: product.name,
            image: imagesStr
        };
    });

    console.log(`Starting bulk updates (upsert) of images in chunks of 500...`);
    const chunkSize = 500;
    for (let i = 0; i < updates.length; i += chunkSize) {
        const chunk = updates.slice(i, i + chunkSize);
        // Supabase upsert will update only the primary key 'id' and 'image' column!
        const { error: updErr } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
        if (updErr) {
            console.error(`Error in chunk starting at ${i}:`, updErr.message);
        } else {
            console.log(`Updated chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(updates.length/chunkSize)}`);
        }
    }

    console.log('Premium image mapping update completed!');
}

updateImages();
