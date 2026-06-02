const sqlite3 = require('sqlite3').verbose();
const dbPath = './database.sqlite';
const db = new sqlite3.Database(dbPath);

const CATEGORY_IMAGES = {
    'Уголок': '/images/products/real/ugolok_gen.png',
    'Арматура': '/images/products/real/armatura_gen.png',
    'Катанка': '/images/products/real/Склад_катанка.jpg',
    'Труба ВГП': '/images/products/real/Склад_труба_ВГП.jpg',
    'Труба профильная': '/images/products/real/Склад_профильная_труба.jpg',
    'Лист горячекатаный': '/images/products/real/Склад_лист_ПВЛ.jpg',
    'Лист г/к риф': '/images/products/real/Склад_лист_ПВЛ_2.jpg',
    'Лист холоднокатаный': '/images/products/real/Склад_лист_ПВЛ.jpg',
    'Балка': '/images/products/real/beams_realistic_1_1779883702409.png',
    'Швеллер': '/images/products/real/channel_realistic_1_1779883730333.png',
    'Профнастил': '/images/products/real/corrugated_realistic_1_1779883763240.png'
};

db.serialize(() => {
    for (const [category, imgPath] of Object.entries(CATEGORY_IMAGES)) {
        db.run('UPDATE products SET image = ? WHERE category = ?', [imgPath, category], function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`Row(s) updated for ${category}: ${this.changes}`);
            }
        });
    }
});

db.close();
