const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'products-data.js');
let content = fs.readFileSync(filePath, 'utf8');

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

// Extremely simple and potentially slow but safe for this specific structure
for (const [parent, cats] of Object.entries(mapping)) {
  for (const cat of cats) {
    // Look for the specific category and update the parentCategory right above or below it
    const regex = new RegExp(`("category":\\s*"${cat}",\\s*"parentCategory":\\s*")[^"]*(")`, 'g');
    content = content.replace(regex, `$1${parent}$2`);
    
    // Also handle reverse order if present
    const regexRev = new RegExp(`("parentCategory":\\s*")[^"]*(",\\s*"category":\\s*"${cat}")`, 'g');
    content = content.replace(regexRev, `$1${parent}$2`);
  }
}

fs.writeFileSync(filePath, content);
console.log('Updated products-data.js taxonomy');
