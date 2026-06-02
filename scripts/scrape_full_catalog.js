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
  { name: 'Трубы стальные', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/truby-stalnye/' },
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
  { name: 'Профнастил', parent: 'Чёрный металлопрокат', url: 'https://metallobazav.ru/catalog/profnastil/' },

  // Нержавеющая сталь
  { name: 'Лист нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/list-nerzhaveyushhij/' },
  { name: 'Лист нержавеющий рифленый', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/list-nerzhaveyushhij-riflenyj/' },
  { name: 'Трубы нержавеющие', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/truby-nerzhaveyushhie/' },
  { name: 'Круг нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/krug-nerzhaveyushhij/' },
  { name: 'Уголок нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/ugolok-nerzhaveyushhij/' },
  { name: 'Полоса нержавеющая', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/polosa-nerzhaveyushhaya/' },
  { name: 'Квадрат нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/kvadrat-nerzhaveyushhij/' },
  { name: 'Шестигранник нержавеющий', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/shestigrannik-nerzhaveyushhij/' },
  { name: 'Фитинги нержавеющие', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/fitingi-nerzhaveyushhie/' },
  { name: 'Трубопроводная арматура нержавеющая', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/truboprovodnaya-armatura-nerzhaveyushhaya/' },
  { name: 'Сварочные материалы нержавеющие', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/svarochnye-materialy-nerzhaveyushhie/' },
  { name: 'Лист алюминиевый', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/list-alyuminievyj/' },
  { name: 'Плита алюминиевая', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/plita-alyuminievaya/' },
  { name: 'Пруток алюминиевый', parent: 'Нержавеющая сталь', url: 'https://metallobazav.ru/nerzhaveyushchaya-stal/prutok-alyuminievyj/' },

  // Специальные стали
  { name: 'Балка двутавр низколегированная', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/balki-dvutavr-nizkolegirovannye/' },
  { name: 'Круг спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/krug-spetsstal/' },
  { name: 'Лист спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/list-spetsstal/' },
  { name: 'Трубы электросварные низколегированные', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/truby-elektrosvarnye-nizkolegirovannye/' },
  { name: 'Уголок спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/ugolok-spetsstal/' },
  { name: 'Швеллер низколегированный', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/shveller-nizkolegirovannyy/' },
  { name: 'Шестигранник спецсталь', parent: 'Специальные стали', url: 'https://metallobazav.ru/specialsteel/shestigrannik-goryachekatanyy-konstruktsionnyy/' },

  // Кровельные материалы
  { name: 'Металлочерепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/metallocherepitsa/' },
  { name: 'Фальцевая кровля', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/faltsevaya_krovlya/' },
  { name: 'Гибкая черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/gibkaya_cherepitsa/' },
  { name: 'Натуральная черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/naturalnaya_cherepitsa/' },
  { name: 'Композитная черепица', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/kompozitnaya_cherepitsa/' },
  { name: 'Наплавляемая кровля', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/rulonnye_krovelnye_materialy/' },
  { name: 'Ондулин', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/ondulin/' },
  { name: 'Шифер', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/shifer/' },
  { name: 'Водостоки', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/Vodostoki/' },
  { name: 'Доборные элементы', parent: 'Кровельные материалы', url: 'https://metallobazav.ru/krovelnye-materialy/dobornye_elementy/' }
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

function extractSizeFromName(name, category) {
  if (!name) return '';
  const catLower = (category || '').toLowerCase();
  
  // 1. Profile dimensions
  let m = name.match(/(\d+(?:[.,]\d+)?\s*[xх]\s*\d+(?:[.,]\d+)?(?:\s*[xх]\s*\d+(?:[.,]\d+)?)?)/i);
  if (m) {
    return m[1].replace(/\s+/g, '').replace(/х/g, 'x').replace(/,/g, '.');
  }
  
  // 2. Round dimensions (Armatura, Wire, etc.)
  if (catLower.includes('арматур') || catLower.includes('круг') || catLower.includes('проволок') || catLower.includes('квадрат') || catLower.includes('шестигран') || catLower.includes('пруток')) {
    let m2 = name.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:мм|mm)/i);
    if (m2) return m2[1].replace(/,/g, '.');
    let m3 = name.match(/\d+(?:[.,]\d+)?/);
    if (m3) return m3[0].replace(/,/g, '.');
  }
  
  // 3. Beams
  if (catLower.includes('балка')) {
    let m2 = name.match(/(?:Балка|Двутавр)\s+([0-9a-zA-Zа-яА-Я]+)/i);
    if (m2) return m2[1].toUpperCase();
    let m3 = name.match(/(\d+[БШК]\d+|\d+[БШК]|\d+)/i);
    if (m3) return m3[1].toUpperCase();
  }
  
  // 4. Shveller
  if (catLower.includes('швеллер')) {
    let m2 = name.match(/Швеллер\s+([0-9a-zA-Zа-яА-Я]+)/i);
    if (m2) return m2[1].toUpperCase();
    let m3 = name.match(/(\d+[а-яА-Яa-zA-Z]|\d+)/);
    if (m3) return m3[0].toUpperCase();
  }

  let m_gen = name.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:мм|mm)/i);
  if (m_gen) return m_gen[1].replace(/,/g, '.');

  let m_num = name.match(/\d+(?:[.,]\d+)?/);
  if (m_num) return m_num[0].replace(/,/g, '.');

  return '';
}

function parseProduct($, el, category, parentCategory, idCounter) {
  const name = $(el).find('.product-item-title, .name, a[href*="/catalog/"]').first().text().trim();
  if (!name) return null;

  // Image extraction
  let imgUrl = $(el).find('.product-item-image img, .image-colum img, img').first().attr('src') || '';
  if (imgUrl && imgUrl.startsWith('/')) {
    imgUrl = 'https://metallobazav.ru' + imgUrl;
  }

  // Price
  let priceText = $(el).find('.product-item-price-current, .price-colum .price, .price').first().text().trim();
  if (!priceText) {
    priceText = $(el).find('*').filter((i, e) => $(e).text().includes('₽')).first().text().trim();
  }
  const rawPriceNum = cleanPrice(priceText);

  // Specs map
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

  // Default fallbacks for length and weight if not found in table
  if (!lengthStr) {
    const lenMatch = name.match(/(?:\s|^)(\d+(?:\.\d+)?)\s*м(?:\s|$)/i);
    if (lenMatch) lengthStr = lenMatch[1] + ' м';
  }
  if (!lengthStr) {
    const catLower = category.toLowerCase();
    if (catLower.includes('балк') || catLower.includes('швеллер') || catLower.includes('уголок')) {
      lengthStr = '12 м';
    } else if (catLower.includes('арматур') || catLower.includes('труб')) {
      lengthStr = '6 м';
    } else {
      lengthStr = '6 м';
    }
  }

  // Normalize steel type (grade / class)
  let steelType = '';
  const nameLower = name.toLowerCase();
  
  if (category === 'Арматура') {
    if (nameLower.includes('а500с') || nameLower.includes('а500') || nameLower.includes('а3')) {
      steelType = 'А3 / А500С';
    } else if (nameLower.includes('а240') || nameLower.includes('а1')) {
      steelType = 'А1 / А240';
    } else {
      steelType = 'А3 / А500С'; // Standard default for rebar
    }
  } else {
    // Other products steel grade parsing
    const match = name.match(/(09Г2С|Ст3|Ст5|Ст3сп|3сп|пс|AISI\s*304|AISI\s*430|12Х18Н10Т|10Х17Н13М2Т)/i);
    if (match) {
      steelType = match[1].toUpperCase();
    } else {
      steelType = 'Ст3'; // Default steel grade
    }
  }

  // Calculate pricing metrics
  let priceTonNum = 0;
  let priceUnitNum = 0;
  let unitLabel = 'за метр';

  const priceLower = priceText.toLowerCase();
  if (priceLower.includes('м²') || priceLower.includes('кв.м')) {
    unitLabel = 'ЗА М²';
    priceUnitNum = rawPriceNum;
  } else if (priceLower.includes('шт') || priceLower.includes('штуку')) {
    unitLabel = 'ЗА ШТ';
    priceUnitNum = rawPriceNum;
  } else {
    if (priceLower.includes('метр') || priceLower.includes('п.м')) {
      priceUnitNum = rawPriceNum;
      const weightNum = parseFloat(weightStr.replace(',', '.'));
      if (weightNum > 0) {
        priceTonNum = Math.round((priceUnitNum / weightNum) * 1000);
      }
    } else {
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

  // Generate size dimensions (vid, width)
  const sizeVal = extractSizeFromName(name, category);

  // Specs as key-value pairs (JSON array format)
  const finalSpecs = [];
  finalSpecs.push(['Наименование', name]);
  if (sizeVal) {
    finalSpecs.push(['Диаметр / Размер', sizeVal + ' мм']);
  }
  finalSpecs.push(['Марка стали / Материал', steelType]);
  if (lengthStr) {
    finalSpecs.push(['Длина хлыста', lengthStr]);
  }
  
  // Set default specific properties
  const catLower = category.toLowerCase();
  if (catLower.includes('арматур')) {
    finalSpecs.push(['ГОСТ', '5781, 34028']);
    finalSpecs.push(['Назначение', 'Для фундамента']);
    finalSpecs.push(['Форма', 'Круглая']);
    
    let classVal = '';
    let surface = 'Гладкая';
    if (nameLower.includes('а500с') || nameLower.includes('а500') || nameLower.includes('а3')) {
      classVal = 'А3';
      surface = 'Рифленая';
    } else if (nameLower.includes('а240') || nameLower.includes('а1')) {
      classVal = 'А1';
      surface = 'Гладкая';
    }
    if (steelType) finalSpecs.push(['Класс арматуры', steelType.split(' / ')[1] || steelType]);
    if (classVal) finalSpecs.push(['Класс', classVal]);
    finalSpecs.push(['Тип поверхности', surface]);
  } else if (catLower.includes('труб')) {
    finalSpecs.push(['ГОСТ', catLower.includes('профил') ? '8639-82, 13663-86' : '10704-91']);
    finalSpecs.push(['Назначение', 'Строительство, машиностроение']);
    let shape = 'Круглая';
    if (nameLower.includes('прямоуг')) shape = 'Прямоугольная';
    else if (nameLower.includes('квадр') || nameLower.includes('профил')) shape = 'Квадратная';
    finalSpecs.push(['Форма', shape]);
  } else if (catLower.includes('балк')) {
    finalSpecs.push(['ГОСТ', '8239-89, 535-88']);
    finalSpecs.push(['Назначение', 'Несущие строительные конструкции']);
    finalSpecs.push(['Форма', 'Двутавровая']);
  } else if (catLower.includes('швеллер')) {
    finalSpecs.push(['ГОСТ', '8240-97']);
    finalSpecs.push(['Назначение', 'Строительное и машиностроительное']);
    finalSpecs.push(['Форма', 'П-образная']);
  } else if (catLower.includes('уголок')) {
    finalSpecs.push(['ГОСТ', '8509-93']);
    finalSpecs.push(['Назначение', 'Строительные металлоконструкции']);
    finalSpecs.push(['Форма', 'Г-образная']);
  }

  const weightNum = parseFloat(weightStr.replace(',', '.'));
  if (weightNum > 0) {
    finalSpecs.push(['Вес', weightNum + ' кг']);
    let metersInTon = Math.round(1000 / weightNum);
    finalSpecs.push(['Количество метров в 1 тонне', metersInTon + ' м']);
    const lengthNum = parseFloat(lengthStr.replace(/[^\d\.]/g, '').replace(',', '.'));
    if (lengthNum > 0) {
      const pcsInTon = Math.round(metersInTon / lengthNum);
      if (pcsInTon > 0) {
        finalSpecs.push(['Прутов в тонне', pcsInTon + ' шт']);
      }
    }
  }

  // Generate clean ID
  const baseId = generateId(name) + '-' + idCounter;

  // Descriptions
  const description = `Высококачественный промышленный металлопрокат: ${name} (категория: ${category}). Продукция произведена в строгом соответствии с государственными стандартами (ГОСТ/ТУ) на ведущих металлургических комбинатах. Отличается превосходными прочностными характеристиками, долговечностью, надежностью под нагрузкой и отличной свариваемостью. Гарантия стабильного качества и точной геометрии изделий.`;

  return {
    id: baseId,
    name: name,
    category: category,
    parentCategory: parentCategory,
    vid: sizeVal || null,
    width: sizeVal || null,
    length: lengthStr || null,
    type: steelType || null,
    priceTon: priceTonNum > 0 ? priceTonNum.toString() : '',
    priceTonNum: priceTonNum,
    priceUnit: priceUnitNum > 0 ? priceUnitNum.toString() : '',
    priceUnitNum: priceUnitNum,
    unitLabel: unitLabel.toUpperCase(),
    weight: weightStr || '1',
    description: description,
    image: imgUrl || '',
    specs: finalSpecs,
    isPopular: Math.random() > 0.85
  };
}

async function scrapeAll() {
  const allProducts = [];
  let totalIdCounter = 1;

  console.log(`Starting exhaustive catalog scrape of ${CATEGORIES.length} categories...`);

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
          timeout: 15000
        });

        const $ = cheerio.load(res.data);
        const containers = $('.product-item-container, .product-item, .catalog-item');

        if (containers.length === 0) {
          console.log(`    No product containers found. Stopping.`);
          break;
        }

        // Loop detection
        const firstProductName = $(containers[0]).find('.product-item-title, .name, a[href*="/catalog/"]').first().text().trim();
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
        await delay(300); // polite rate limiting (300ms delay between pages)

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
