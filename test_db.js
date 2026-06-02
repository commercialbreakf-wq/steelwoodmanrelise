const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.all("SELECT id, name FROM products WHERE id LIKE '%armatura%' AND (id LIKE '%10%' OR name LIKE '%10%') LIMIT 50", [], (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
    db.close();
});
