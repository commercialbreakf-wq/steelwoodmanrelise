const sqlite3 = require('sqlite3').verbose();
const dbPath = './database.sqlite';
const db = new sqlite3.Database(dbPath);

const CATEGORY_IMAGES_LIKE = {
    'Арматура%': '/images/products/real/armatura_gen.png',
    'Уголок%': '/images/products/real/ugolok_gen.png',
    'Труба вгп%': '/images/products/real/Склад_труба_ВГП.jpg',
    'Труба профильная%': '/images/products/real/Склад_профильная_труба.jpg',
    'профиль квадратная%': '/images/products/real/Склад_профильная_труба.jpg',
    'Лист хк%': '/images/products/real/Склад_лист_ПВЛ.jpg',
    'Профнастил%': '/images/products/real/corrugated_realistic_1_1779883763240.png',
    'Сетка%': '/images/products/steel_mesh_premium_1778423969480.png',
    'Труба эсв%': '/images/products/real/Склад_труба_ВГП.jpg'
};

db.serialize(() => {
    for (const [category, imgPath] of Object.entries(CATEGORY_IMAGES_LIKE)) {
        db.run('UPDATE products SET image = ? WHERE category LIKE ?', [imgPath, category], function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log(`Row(s) updated for ${category}: ${this.changes}`);
            }
        });
    }
});

db.close();
