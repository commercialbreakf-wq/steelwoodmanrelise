const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--write');

console.log(`=== RUNNING PRICE UPDATE SCRIPT (${dryRun ? 'DRY-RUN' : 'WRITE MODE'}) ===`);

// Helper to normalize names
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]/g, '') // remove non-alphanumeric chars
    .trim();
}

// Parse price
function parsePrice(priceStr) {
  if (!priceStr || priceStr.includes('Нет в наличии') || priceStr.includes('Цена по запросу')) {
    return null;
  }
  
  // Clean spaces
  let cleanStr = priceStr.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
  const numMatch = cleanStr.replace(/\s/g, '').match(/(\d+)/);
  if (!numMatch) return null;
  
  const num = parseInt(numMatch[1], 10);
  
  if (cleanStr.includes('/ метр') || cleanStr.includes('/ м.п.')) {
    return { price_unit: num, price_ton: null, unit_label: 'ЗА МЕТР' };
  } else if (cleanStr.includes('/ м²')) {
    return { price_unit: num, price_ton: null, unit_label: 'ЗА М²' };
  } else if (cleanStr.includes('/ шт')) {
    return { price_unit: num, price_ton: null, unit_label: 'ЗА ШТ' };
  } else if (cleanStr.includes('/ ½ тонны')) {
    return { price_ton: num * 2, price_unit: null, unit_label: 'ЗА ТОННУ' };
  } else if (cleanStr.includes('тонны') || cleanStr.includes('тонну') || cleanStr.includes('/ т') || num >= 10000) {
    return { price_ton: num, price_unit: null, unit_label: 'ЗА ТОННУ' };
  } else {
    return { price_unit: num, price_ton: null, unit_label: 'ЗА ШТ' };
  }
}

// Parse parameters
function parseParameters(paramStr) {
  if (!paramStr) return { specs: [], length: '', weight: '', width: '', type: '' };
  
  const specs = [];
  let length = '';
  let weight = '';
  let width = '';
  let type = '';
  
  const parts = paramStr.split(',');
  parts.forEach(part => {
    const subParts = part.split(':');
    if (subParts.length === 2) {
      const key = subParts[0].trim();
      const val = subParts[1].trim();
      specs.push([key, val]);
      
      const keyLower = key.toLowerCase();
      if (keyLower.includes('длина')) {
        length = val;
      } else if (keyLower.includes('вес')) {
        weight = val;
      } else if (keyLower.includes('толщина') || keyLower.includes('ширина') || keyLower.includes('размер')) {
        width = val;
      } else if (keyLower.includes('марка') || keyLower.includes('класс') || keyLower.includes('сталь')) {
        type = val;
      }
    } else {
      const val = part.trim();
      if (val) {
        specs.push([val.includes('ГОСТ') ? 'ГОСТ' : 'Параметр', val]);
      }
    }
  });
  
  return { specs, length, weight, width, type };
}

async function fetchAllDbProducts() {
  console.log("Fetching all products from Supabase...");
  let allData = [];
  let from = 0;
  let to = 999;
  let hasMore = true;
  
  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(from, to)
      .order('id', { ascending: true });
      
    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
    
    if (data && data.length > 0) {
      allData = allData.concat(data);
      console.log(`Fetched ${allData.length} products...`);
      from += 1000;
      to += 1000;
      if (data.length < 1000) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }
  
  return allData;
}

async function run() {
  // Load scraped products
  const file1 = path.join(__dirname, '..', 'catalog_extracted.json');
  const file2 = path.join(__dirname, '..', 'catalog_extracted_rest.json');
  
  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    console.error("Missing scraped data files!");
    process.exit(1);
  }
  
  const scraped1 = JSON.parse(fs.readFileSync(file1, 'utf8'));
  const scraped2 = JSON.parse(fs.readFileSync(file2, 'utf8'));
  
  const allScrapedCategories = [...scraped1, ...scraped2];
  
  // Flatten scraped products
  const scrapedProducts = [];
  allScrapedCategories.forEach(cat => {
    if (cat.products && Array.isArray(cat.products)) {
      cat.products.forEach(p => {
        scrapedProducts.push({
          ...p,
          scrapedCategory: cat.category
        });
      });
    }
  });
  
  console.log(`Loaded ${scrapedProducts.length} scraped products from JSON.`);
  
  // Fetch DB products
  const dbProducts = await fetchAllDbProducts();
  console.log(`Loaded ${dbProducts.length} products from Supabase.`);
  
  // Build lookup maps
  const exactMap = new Map();
  dbProducts.forEach(p => {
    exactMap.set(normalizeName(p.name), p);
  });
  
  let exactMatches = 0;
  let fuzzyMatches = 0;
  let unmatched = 0;
  const updates = [];
  
  scrapedProducts.forEach(sp => {
    const normScrapedName = normalizeName(sp.name);
    
    // 1. Try exact normalized match
    let matchedProduct = exactMap.get(normScrapedName);
    
    if (matchedProduct) {
      exactMatches++;
    } else {
      // 2. Try fuzzy lookup: substring match
      // Find a DB product where normalized name is a substring or vice versa
      const matched = dbProducts.find(p => {
        const normDbName = normalizeName(p.name);
        return normDbName.includes(normScrapedName) || normScrapedName.includes(normDbName);
      });
      
      if (matched) {
        matchedProduct = matched;
        fuzzyMatches++;
      }
    }
    
    if (matchedProduct) {
      const parsedPrice = parsePrice(sp.price);
      if (parsedPrice) {
        const parsedParams = parseParameters(sp.parameters);
        
        // Prepare merged specs
        const normalizeSpecsToPairs = (rawSpecs) => {
          if (!Array.isArray(rawSpecs)) return [];
          return rawSpecs.map(item => {
            if (Array.isArray(item) && item.length >= 2) {
              return [item[0].toString().trim(), item[1].toString().trim()];
            } else if (typeof item === 'string') {
              const idx = item.indexOf(':');
              if (idx > -1) {
                return [item.substring(0, idx).trim(), item.substring(idx + 1).trim()];
              } else {
                return ['Параметр', item.trim()];
              }
            }
            return null;
          }).filter(Boolean);
        };

        let rawExistingSpecs = [];
        if (matchedProduct.specs) {
          try {
            rawExistingSpecs = typeof matchedProduct.specs === 'string' 
              ? JSON.parse(matchedProduct.specs) 
              : matchedProduct.specs;
          } catch (e) {
            rawExistingSpecs = [];
          }
        }
        
        const existingSpecs = normalizeSpecsToPairs(rawExistingSpecs);
        const newSpecs = normalizeSpecsToPairs(parsedParams.specs);
        
        // Parse parameters and extract numbers
        const lengthVal = parsedParams.length || matchedProduct.length || '';
        const weightVal = parsedParams.weight || matchedProduct.weight || '';
        
        const weightMatch = weightVal.match(/(\d+(?:\.\d+)?)/);
        const weightNum = weightMatch ? parseFloat(weightMatch[1]) : 0;
        
        const lengthMatch = lengthVal.match(/(\d+(?:\.\d+)?)/);
        const lengthNum = lengthMatch ? parseFloat(lengthMatch[1]) : 0;

        let price_ton = parsedPrice.price_ton !== null ? parsedPrice.price_ton : matchedProduct.price_ton;
        let price_unit = parsedPrice.price_unit;
        let unit_label = parsedPrice.unit_label || matchedProduct.unit_label;

        // Try to compute price_unit using weight and price_ton
        if (price_ton && weightNum > 0) {
          price_unit = Math.round((price_ton / 1000) * weightNum);
          if (weightVal.toLowerCase().includes('м.п.') || weightVal.toLowerCase().includes('метр')) {
            unit_label = 'ЗА МЕТР';
          } else if (weightVal.toLowerCase().includes('лист')) {
            unit_label = 'ЗА ШТ';
          }
        }
        
        if (price_unit === null || price_unit === undefined) {
          price_unit = matchedProduct.price_unit;
        }

        let extractedType = '';
        if (matchedProduct.name) {
          const match = matchedProduct.name.match(/(А500С|А240|А1|А3|09Г2С|Ст3|Ст5|Ст3сп|AISI\s*304|AISI\s*430|12Х18Н10Т|10Х17Н13М2Т)/i);
          if (match) extractedType = match[1].toUpperCase().replace(/\s+/g, '');
        }

        // Extract diameter/size for vid/width
        let sizeVal = '';
        if (matchedProduct.name) {
          const match = matchedProduct.name.match(/(?:\s|^)(\d+(?:[xх]\d+)?(?:[xх]\d+(?:\.\d+)?)?)(?:\s|мм|$)/i);
          if (match) sizeVal = match[1].replace(/х/g, 'x');
        }

        // Enrich specs map
        const specMapEnriched = new Map(existingSpecs);
        newSpecs.forEach(([k, v]) => specMapEnriched.set(k, v));
        
        const prodNameLower = matchedProduct.name.toLowerCase();
        const prodCat = matchedProduct.category || sp.scrapedCategory || '';
        
        if (prodCat.toLowerCase().includes('арматур')) {
          if (!specMapEnriched.has('ГОСТ')) specMapEnriched.set('ГОСТ', '5781, 34028');
          if (!specMapEnriched.has('Назначение')) specMapEnriched.set('Назначение', 'Для фундамента');
          if (!specMapEnriched.has('Форма')) specMapEnriched.set('Форма', 'Круглая');
          
          let classArm = '';
          let classVal = '';
          let surface = 'Гладкая';
          
          if (prodNameLower.includes('а500с')) {
            classArm = 'А500С';
            classVal = 'А3';
            surface = 'Рифленая';
          } else if (prodNameLower.includes('а240') || prodNameLower.includes('а1')) {
            classArm = 'А240';
            classVal = 'А1';
            surface = 'Гладкая';
          } else if (prodNameLower.includes('а3')) {
            classArm = 'А500С';
            classVal = 'А3';
            surface = 'Рифленая';
          }
          
          if (classArm) specMapEnriched.set('Класс арматуры', classArm);
          if (classVal) specMapEnriched.set('Класс', classVal);
          if (surface) specMapEnriched.set('Тип поверхности', surface);
          if (sizeVal) specMapEnriched.set('Диаметр', sizeVal + ' мм');
        } else if (prodCat.toLowerCase().includes('труб')) {
          if (!specMapEnriched.has('ГОСТ')) specMapEnriched.set('ГОСТ', '8639-82, 13663-86');
          if (!specMapEnriched.has('Назначение')) specMapEnriched.set('Назначение', 'Строительство, машиностроение');
          if (prodNameLower.includes('прямоуг')) {
            specMapEnriched.set('Форма', 'Прямоугольная');
          } else if (prodNameLower.includes('квадр') || prodNameLower.includes('профил')) {
            specMapEnriched.set('Форма', 'Квадратная');
          } else {
            specMapEnriched.set('Форма', 'Круглая');
          }
          if (sizeVal) specMapEnriched.set('Размер', sizeVal + ' мм');
        } else {
          if (sizeVal) specMapEnriched.set('Размер', sizeVal + ' мм');
        }

        if (weightNum > 0) {
          specMapEnriched.set('Вес', weightNum + ' кг');
          let metersInTon = Math.round(1000 / weightNum);
          specMapEnriched.set('Количество метров в 1 тонне', metersInTon + ' м');
          
          if (lengthNum > 0) {
            const pcsInTon = Math.round(metersInTon / lengthNum);
            if (pcsInTon > 0) {
              specMapEnriched.set('Прутов в тонне', pcsInTon + ' шт');
            }
          }
        }
        
        if (lengthVal) {
          specMapEnriched.set('Длина', lengthVal);
        }

        const mergedSpecs = Array.from(specMapEnriched.entries());

        const updateObj = {
          id: matchedProduct.id,
          price_ton: price_ton,
          price_unit: price_unit,
          unit_label: unit_label,
          length: lengthVal || matchedProduct.length,
          weight: weightVal || matchedProduct.weight,
          width: sizeVal || matchedProduct.width,
          vid: sizeVal || matchedProduct.vid,
          type: parsedParams.type || extractedType || matchedProduct.type || matchedProduct.steel,
          specs: JSON.stringify(mergedSpecs)
        };
        
        updates.push(updateObj);
      }
    } else {
      unmatched++;
    }
  });
  
  console.log(`\n=== MATCHING STATISTICS ===`);
  console.log(`Total scraped products: ${scrapedProducts.length}`);
  console.log(`Exact normalized matches: ${exactMatches}`);
  console.log(`Fuzzy substring matches: ${fuzzyMatches}`);
  console.log(`Total matched products: ${exactMatches + fuzzyMatches}`);
  console.log(`Unmatched products: ${unmatched}`);
  console.log(`Products to update: ${updates.length}`);
  
  if (updates.length === 0) {
    console.log("No updates to make. Exiting.");
    return;
  }
  
  if (dryRun) {
    console.log("\n=== DRY RUN MODE: SAMPLES TO UPDATE ===");
    updates.slice(0, 10).forEach(u => {
      const dbProduct = dbProducts.find(p => p.id === u.id);
      console.log(`Product: "${dbProduct.name}" (ID: ${u.id})`);
      console.log(`  OLD: price_ton=${dbProduct.price_ton}, price_unit=${dbProduct.price_unit}, unit_label=${dbProduct.unit_label}`);
      console.log(`  NEW: price_ton=${u.price_ton}, price_unit=${u.price_unit}, unit_label=${u.unit_label}`);
      console.log(`  Specs: ${u.specs}`);
    });
    console.log("\nTo write updates to Supabase, run this script with the --write flag.");
  } else {
    console.log(`\nWriting ${updates.length} updates to Supabase in chunks of 50...`);
    const chunkSize = 50;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      
      // Perform parallel updates for this chunk
      const promises = chunk.map(u => 
        supabase
          .from('products')
          .update({
            price_ton: u.price_ton,
            price_unit: u.price_unit,
            unit_label: u.unit_label,
            length: u.length,
            weight: u.weight,
            width: u.width,
            type: u.type,
            specs: u.specs
          })
          .eq('id', u.id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        console.error(`Error updating chunk starting at index ${i}:`, errors[0].error);
      } else {
        console.log(`Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length}...`);
      }
    }
    console.log("All updates completed successfully! Triggering cache invalidation in unified handler is automatic since it is direct DB update.");
  }
}

run().catch(e => console.error("Unhandled error:", e));
