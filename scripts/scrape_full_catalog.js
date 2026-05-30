const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

const CATEGORIES = [
  // Чёрный металлопрокат
  { name: 'Арматура', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/armatura/' },
  { name: 'Композитная арматура', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/kompozitnaya-armatura/' },
  { name: 'Трубы профильные', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/truby-profilnye/' },
  { name: 'Трубы бесшовные', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/truby-besshovnye/' },
  { name: 'Трубы электросварные', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/truby-elektrosvarnye/' },
  { name: 'Трубы ВГП', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/truby-vgp/' },
  { name: 'Уголок', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/ugolok/' },
  { name: 'Балка двутавровая', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/dvutavr/' },
  { name: 'Швеллер', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/shveller/' },
  { name: 'Лист стальной', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/list-stalnoj/' },
  { name: 'Сетка стальная', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/setka-stalnaya/' },
  { name: 'Квадрат', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/kvadrat/' },
  { name: 'Проволока', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/provoloka/' },
  { name: 'Просечно-вытяжной лист', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/prosechno-vytyazhnoj-list/' },
  { name: 'Полоса', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/polosa/' },
  { name: 'Круг', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/krug/' },
  { name: 'Лягушка арматурная', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/lyagushka-armaturnaya/' },
  { name: 'Закладные детали', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/zakladnye-detali/' },

  // Нержавеющая сталь
  { name: 'Лист нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/list-nerzhaveyushhij/' },
  { name: 'Лист нержавеющий рифленый', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/list-nerzhaveyushhij-riflenyj/' },
  { name: 'Трубы нержавеющие', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/truby-nerzhaveyushhie/' },
  { name: 'Круг нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/krug-nerzhaveyushhij/' },
  { name: 'Уголок нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/ugolok-nerzhaveyushhij/' },
  { name: 'Полоса нержавеющая', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/polosa-nerzhaveyushhaya/' },
  { name: 'Квадрат нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/kvadrat-nerzhaveyushhij/' },
  { name: 'Шестигранник нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/shestigrannik-nerzhaveyushhij/' },
  { name: 'Сварочные материалы нержавеющие', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/svarochnye-materialy-nerzhaveyushhie/' },

  // Специальные стали
  { name: 'Балка двутавр низколегированная', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/balki-dvutavr-nizkolegirovannye/' },
  { name: 'Круг спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/krug-spetsstal/' },
  { name: 'Лист спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/list-spetsstal/' },
  { name: 'Трубы электросварные низколегированные', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/truby-elektrosvarnye-nizkolegirovannye/' },
  { name: 'Уголок спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/ugolok-spetsstal/' },
  { name: 'Швеллер низколегированный', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/shveller-nizkolegirovannyy/' },

  // Кровельные материалы
  { name: 'Металлочерепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/metallocherepitsa/' },
  { name: 'Металлочерепица Classic', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/metallocherepitsa_classic/' },
  { name: 'Профнастил', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/profnastil/' },
  { name: 'Фальцевая кровля', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/faltsevaya_krovlya/' },
  { name: 'Гибкая черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/gibkaya_cherepitsa/' },
  { name: 'Натуральная черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/naturalnaya_cherepitsa/' },
  { name: 'Композитная черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/kompozitnaya_cherepitsa/' },
  { name: 'Ондулин', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/ondulin/' },
  { name: 'Водостоки', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/Vodostoki/' }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function generateId(name) {
  const from = "а б в г д е ё ж з и й к л м н о п р с т у ф х ц ч ш щ ъ ы ь э ю я".split(' ');
  const to = "a b v g d e yo zh z i y k l m n o p r s t u f h c ch sh shch '' y '' e yu ya".split(' ');
  let res = name.toLowerCase();
  for (let i = 0; i < from.length; i++) {
    res = res.split(from[i]).join(to[i]);
  }
  return res.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.replace(/\s+/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function generateDetailedDescription(name, category, parentCategory, specs) {
  const specsList = specs.join(', ');
  if (parentCategory === 'Чёрный металлопрокат') {
    return `Высококачественный промышленный металлопрокат: ${name} (категория: ${category}). Продукция произведена в строгом соответствии с государственными стандартами (ГОСТ/ТУ) на ведущих металлургических комбинатах. Отличается превосходными прочностными характеристиками, долговечностью, надежностью под нагрузкой и отличной свариваемостью. Широко применяется в гражданском и промышленном строительстве, при возведении несущих металлоконструкций и в машиностроении. Основные параметры: ${specsList}. Гарантия стабильного качества и точной геометрии изделий.`;
  } else if (parentCategory === 'Нержавеющая сталь') {
    return `Нержавеющий металлопрокат премиального сегмента: ${name} (категория: ${category}). Изготовлен из высококачественной коррозионностойкой стали с оптимальным легированием. Обладает исключительной устойчивостью к окислению, агрессивным химическим средам, резким перепадам температур и повышенной влажности. Рекомендуется для применения в пищевой, химической и медицинской промышленности, а также в архитектурно-отделочных работах и ландшафтном дизайне. Основные параметры: ${specsList}. Долговечность, гигиеничность и премиальный внешний вид изделия.`;
  } else if (parentCategory === 'Специальные стали') {
    return `Специальный конструкционный и инструментальный металлопрокат: ${name} (категория: ${category}). Отличается особым химическим составом и специализированной термической обработкой, обеспечивающими повышенную твердость, износостойкость, упругость или жаропрочные свойства. Разработан специально для эксплуатации в условиях экстремальных механических и температурных нагрузок, ответственных узлов машин, приборов и высоконагруженных промышленных конструкций. Основные параметры: ${specsList}. Полный пакет сертификатов соответствия и паспортов качества.`;
  } else if (parentCategory === 'Кровельные материалы') {
    return `Современный кровельный материал профессионального класса: ${name} (категория: ${category}). Обеспечивает надежную защиту от осадков, ветра и ультрафиолетового излучения, гарантируя комфорт и долговечность вашего дома. Прочное защитное покрытие (оцинковка или многослойный полимер) предохраняет металл от сквозной коррозии и выцветания в течение десятилетий. Отличается эстетичным внешним видом, простотой монтажа и экологической безопасностью. Основные параметры: ${specsList}. Идеальный выбор для надежной кровли жилых, коммерческих и промышленных зданий.`;
  } else {
    return `Высококачественная продукция металлопроката: ${name}. Полное соответствие техническим регламентам и высоким требованиям промышленной безопасности. Предназначено для широкого спектра строительных и монтажных работ. Параметры: ${specsList}.`;
  }
}

function parseProduct($, el, category, parentCategory, idCounter) {
  const name = $(el).find('.product-item-title, .name').first().text().trim();
  if (!name) return null;

  // Extract price text
  let priceText = $(el).find('.product-item-price-current, .price-colum .price, .price').first().text().trim();
  if (!priceText) {
    priceText = $(el).find('*').filter((i, e) => $(e).text().includes('₽')).first().text().trim();
  }

  const rawPriceNum = cleanPrice(priceText);

  // Extract specs from whip_length-colum & weight-colum
  const specsMap = new Map();
  let lengthStr = '';
  let weightStr = '';

  const whipLengthText = $(el).find('.whip_length-colum').text().trim();
  if (whipLengthText) {
    const val = whipLengthText.replace('Длина', '').trim();
    lengthStr = val;
    specsMap.set('Длина', val);
  }

  const weightColumText = $(el).find('.weight-colum').text().trim();
  if (weightColumText) {
    const val = weightColumText.replace('Вес 1 м.п.', '').replace('Вес', '').trim();
    weightStr = val;
    specsMap.set('Вес 1 м.п.', val);
  }

  // Extract specs from dl.product-item-properties
  $(el).find('dl.product-item-properties dt').each((i, dtEl) => {
    const key = $(dtEl).text().trim().replace(':', '');
    const val = $(dtEl).next('dd').text().trim();
    if (key && val) {
      specsMap.set(key, val);
      if (key.toLowerCase().includes('длина') && !lengthStr) {
        lengthStr = val;
      }
      if ((key.toLowerCase().includes('вес') || key.toLowerCase().includes('масса')) && !weightStr) {
        weightStr = val;
      }
    }
  });

  const specs = [];
  for (const [k, v] of specsMap.entries()) {
    specs.push(`${k}: ${v}`);
  }

  // Calculate pricing metrics
  let priceTonNum = 0;
  let priceUnitNum = 0;
  let unitLabel = 'за метр';

  const priceLower = priceText.toLowerCase();
  if (priceLower.includes('м²') || priceLower.includes('кв.м')) {
    unitLabel = 'за м²';
    priceUnitNum = rawPriceNum;
  } else if (priceLower.includes('шт') || priceLower.includes('штуку')) {
    unitLabel = 'ЗА ШТ';
    priceUnitNum = rawPriceNum;
  } else {
    // Standard metal pricing - default to tons vs meters
    // Check if price text mentions meter/метр
    if (priceLower.includes('метр') || priceLower.includes('п.м')) {
      priceUnitNum = rawPriceNum;
      // Calculate price per ton if weight is available
      const weightNum = parseFloat(weightStr.replace(',', '.'));
      if (weightNum > 0) {
        priceTonNum = Math.round((priceUnitNum / weightNum) * 1000);
      }
    } else {
      // Otherwise assume price is per ton
      priceTonNum = rawPriceNum;
      const weightNum = parseFloat(weightStr.replace(',', '.'));
      const lengthNum = parseFloat(lengthStr.replace(/[^\d\.]/g, '').replace(',', '.'));
      if (weightNum > 0 && lengthNum > 0) {
        priceUnitNum = Math.ceil((priceTonNum / 1000) * weightNum * lengthNum);
        unitLabel = 'ЗА ШТ';
      } else if (weightNum > 0) {
        priceUnitNum = Math.ceil((priceTonNum / 1000) * weightNum);
        unitLabel = 'за метр';
      }
    }
  }

  // Generate clean ID
  const baseId = generateId(name) + '-' + idCounter;

  // Compile detailed description
  const description = generateDetailedDescription(name, category, parentCategory, specs);

  return {
    id: baseId,
    name: name,
    category: category,
    parentCategory: parentCategory,
    length: lengthStr || null,
    priceTon: priceTonNum > 0 ? priceTonNum.toString() : '',
    priceTonNum: priceTonNum,
    priceUnit: priceUnitNum > 0 ? priceUnitNum.toString() : '',
    priceUnitNum: priceUnitNum,
    unitLabel: unitLabel.toUpperCase(),
    weight: weightStr || '1',
    description: description,
    specs: specs,
    isPopular: Math.random() > 0.85 // Select ~15% popular products
  };
}

async function scrapeAll() {
  const allProducts = [];
  let totalIdCounter = 1;

  console.log(`Starting full catalog scrape of ${CATEGORIES.length} categories...`);

  for (const cat of CATEGORIES) {
    console.log(`\nCategory: ${cat.name} (${cat.parent})`);
    let page = 1;
    let firstProductPage1 = null;
    let categoryProductCount = 0;

    while (true) {
      const url = page === 1 ? cat.url : `${cat.url}?PAGEN_1=${page}`;
      console.log(`  Fetching page ${page}: ${url}`);

      try {
        const res = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          timeout: 10000
        });

        const $ = cheerio.load(res.data);
        const containers = $('.product-item-container');

        if (containers.length === 0) {
          console.log(`    No product containers found. Stopping.`);
          break;
        }

        // Loop detection
        const firstProductName = $(containers[0]).find('.product-item-title, .name').first().text().trim();
        if (page === 1) {
          firstProductPage1 = firstProductName;
        } else if (firstProductName === firstProductPage1) {
          console.log(`    Loop detected (page ${page} fell back to page 1). Stopping.`);
          break;
        }

        let parsedOnPage = 0;
        containers.each((i, el) => {
          const prodObj = parseProduct($, el, cat.name, cat.parent, totalIdCounter++);
          if (prodObj) {
            allProducts.push(prodObj);
            parsedOnPage++;
            categoryProductCount++;
          }
        });

        console.log(`    Parsed ${parsedOnPage} products.`);
        page++;
        await delay(500); // polite rate limiting (500ms delay between pages)

      } catch (err) {
        console.error(`    Error on page ${page}:`, err.message);
        break;
      }
    }
    console.log(`  Finished category: ${cat.name}. Crawled ${categoryProductCount} products total.`);
  }

  console.log(`\nScraping finished! Total products scraped: ${allProducts.length}`);

  // Deduplicate products by name + length + weight to prevent any duplicate items
  const seenKeys = new Set();
  const uniqueProducts = [];
  for (const p of allProducts) {
    const key = `${p.name}_${p.length}_${p.weight}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueProducts.push(p);
    }
  }
  console.log(`Deduplicated products: ${uniqueProducts.length} unique items.`);

  // Format and save output
  const fileContent = `// Product catalog - Restructured and updated automatically\n\nconst PRODUCTS = ${JSON.stringify(uniqueProducts, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.PRODUCTS = PRODUCTS;\n}\nif (typeof module !== 'undefined') {\n  module.exports = { PRODUCTS };\n}`;
  fs.writeFileSync('./products-data.js', fileContent, 'utf8');
  console.log('Successfully updated products-data.js');
}

scrapeAll().catch(console.error);
