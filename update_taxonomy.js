const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

const mapping = {
  'Черный металлопрокат': [
    'Арматура а1', 'Арматура а3', 'Балка', 'Уголок', 'Швеллер', 'Круг', 'Квадрат', 'Полоса', 'Шестигранник', 'Сетка 3 м', 'Сетка 4 м', 'Сетка 5 м', 'Сетка 8 м'
  ],
  'Листовой металлопрокат': [
    'Лист хк', 'Лист гк', 'Лист оцинкованный', 'Лист ПВЛ', 'Лист рифленый'
  ],
  'Трубный металлопрокат': [
    'профиль квадратная', 'Труба профильная прямоугольная', 'Труба эсв', 'Труба вгп', 'Труба бш'
  ],
  'Кровля и фасад': [
    'Профнастил окрашенный', 'Профнастил оцинкованный 0.4мм', 'Металлочерепица', 'Доборные элементы'
  ]
};

db.serialize(() => {
  for (const [parent, cats] of Object.entries(mapping)) {
    const placeholders = cats.map(() => '?').join(',');
    db.run(`UPDATE products SET parent_category = ? WHERE category IN (${placeholders})`, [parent, ...cats], (err) => {
      if (err) console.error(`Error updating ${parent}:`, err.message);
      else console.log(`Updated parent_category to ${parent}`);
    });
  }
});

db.close();
