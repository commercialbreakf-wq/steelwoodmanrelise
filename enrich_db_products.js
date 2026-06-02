const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY/ANON_KEY must be set in env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const dryRun = !process.argv.includes('--write');

console.log(`=== RUNNING DATABASE ENRICHMENT SCRIPT (${dryRun ? 'DRY-RUN' : 'WRITE MODE'}) ===`);

function extractSizeFromName(name, category) {
  if (!name) return '';
  const nameLower = name.toLowerCase();
  const catLower = (category || '').toLowerCase();
  
  // 1. Profile tubes/angles/sheets with AxBxC dimensions
  // Match 20х20х2, 50х50х5, 40х4, etc.
  let m = name.match(/(\d+(?:[.,]\d+)?\s*[xх]\s*\d+(?:[.,]\d+)?(?:\s*[xх]\s*\d+(?:[.,]\d+)?)?)/i);
  if (m) {
    return m[1].replace(/\s+/g, '').replace(/х/g, 'x').replace(/,/g, '.');
  }
  
  // 2. Armatura, round pipes, wire, round bars: e.g. "Арматура 8 мм", "Круг 12 мм", "Проволока 4"
  if (catLower.includes('арматур') || catLower.includes('круг') || catLower.includes('проволок') || catLower.includes('квадрат') || catLower.includes('шестигран')) {
    let m2 = name.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:мм|mm)/i);
    if (m2) return m2[1].replace(/,/g, '.');
    let m3 = name.match(/\d+(?:[.,]\d+)?/);
    if (m3) return m3[0].replace(/,/g, '.');
  }
  
  // 3. Beams: "Балка 10", "Балка 20Б1", "Балка 30Ш2"
  if (catLower.includes('балка')) {
    let m2 = name.match(/(?:Балка|Двутавр)\s+([0-9a-zA-Zа-яА-Я]+)/i);
    if (m2) return m2[1].toUpperCase();
    let m3 = name.match(/(\d+[БШК]\d+|\d+[БШК]|\d+)/i);
    if (m3) return m3[1].toUpperCase();
  }
  
  // 4. Shveller: "Швеллер 10", "Швеллер 12У"
  if (catLower.includes('швеллер')) {
    let m2 = name.match(/Швеллер\s+([0-9a-zA-Zа-яА-Я]+)/i);
    if (m2) return m2[1].toUpperCase();
    let m3 = name.match(/(\d+[а-яА-Яa-zA-Z]|\d+)/);
    if (m3) return m3[0].toUpperCase();
  }

  // 5. Generic fallback for sheet/mesh/others: look for dimensions in mm
  let m_gen = name.match(/(?:^|\s)(\d+(?:[.,]\d+)?)\s*(?:мм|mm)/i);
  if (m_gen) return m_gen[1].replace(/,/g, '.');

  let m_num = name.match(/\d+(?:[.,]\d+)?/);
  if (m_num) return m_num[0].replace(/,/g, '.');

  return '';
}

function normalizeSpecs(rawSpecs) {
  if (!rawSpecs) return [];
  let parsed = [];
  try {
    parsed = typeof rawSpecs === 'string' ? JSON.parse(rawSpecs) : rawSpecs;
  } catch (e) {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  
  return parsed.map(item => {
    if (Array.isArray(item) && item.length >= 2) {
      return [item[0].toString().trim(), item[1].toString().trim()];
    } else if (typeof item === 'string') {
      const idx = item.indexOf(':');
      if (idx > -1) {
        return [item.substring(0, idx).trim(), item.substring(idx + 1).trim()];
      } else {
        const spaceIdx = item.indexOf(' ');
        if (spaceIdx > -1) {
          return [item.substring(0, spaceIdx).trim(), item.substring(spaceIdx + 1).trim()];
        }
        return ['Параметр', item.trim()];
      }
    }
    return null;
  }).filter(Boolean);
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
  const dbProducts = await fetchAllDbProducts();
  console.log(`Loaded ${dbProducts.length} products from Supabase.`);
  
  const updates = [];
  let skipped = 0;
  
  dbProducts.forEach(p => {
    const normalizedSpecsList = normalizeSpecs(p.specs);
    
    // Clean length column and extract steel grade if length has garbage
    let lengthVal = '';
    let steelType = p.type || '';
    
    if (p.length && !p.length.toLowerCase().includes('марк') && !p.length.toLowerCase().includes('ст') && !p.length.toLowerCase().includes('\n')) {
      lengthVal = p.length;
    }
    
    if (p.length && (p.length.toLowerCase().includes('марк') || p.length.toLowerCase().includes('ст') || p.length.toLowerCase().includes('\n'))) {
      const match = p.length.match(/(Ст\d+|09Г2С|3сп|пс|A500C|А500С|А240|А1|А3)/i);
      if (match) {
        steelType = match[1].trim();
      }
    }
    
    if (!lengthVal) {
      const lenSpec = normalizedSpecsList.find(s => s[0].toLowerCase().includes('длина'));
      if (lenSpec && !lenSpec[1].toLowerCase().includes('марк') && !lenSpec[1].toLowerCase().includes('ст') && !lenSpec[1].toLowerCase().includes('\n')) {
        lengthVal = lenSpec[1];
      }
    }
    
    if (!lengthVal && p.name) {
      const lenMatch = p.name.match(/(?:\s|^)(\d+(?:\.\d+)?)\s*м(?:\s|$)/i);
      if (lenMatch) lengthVal = lenMatch[1] + ' м';
    }
    
    if (!lengthVal) {
      const catLower = (p.category || '').toLowerCase();
      if (catLower.includes('балк') || catLower.includes('швеллер') || catLower.includes('уголок')) {
        lengthVal = '12 м';
      } else if (catLower.includes('арматур') || catLower.includes('труб')) {
        lengthVal = '6 м';
      }
    }
    
    if (!steelType && p.name) {
      const match = p.name.match(/(А500С|А240|А1|А3|09Г2С|Ст3|Ст5|Ст3сп|3сп|пс|AISI\s*304|AISI\s*430|12Х18Н10Т|10Х17Н13М2Т)/i);
      if (match) {
        steelType = match[1].toUpperCase();
      }
    }

    let weightVal = '';
    if (p.weight) {
      weightVal = p.weight;
    } else {
      const weightSpec = normalizedSpecsList.find(s => s[0].toLowerCase().includes('вес'));
      if (weightSpec) weightVal = weightSpec[1];
    }
    
    const weightMatch = weightVal.match(/(\d+(?:\.\d+)?)/);
    const weightNum = weightMatch ? parseFloat(weightMatch[1]) : 0;
    
    const lengthMatch = lengthVal.match(/(\d+(?:\.\d+)?)/);
    const lengthNum = lengthMatch ? parseFloat(lengthMatch[1]) : 0;
    
    let price_ton = p.price_ton;
    let price_unit = p.price_unit;
    let unit_label = p.unit_label || 'шт.';
    
    const catLower = (p.category || '').toLowerCase();
    
    if (price_ton && weightNum > 0 && (!price_unit || price_unit === 0)) {
      price_unit = Math.round((price_ton / 1000) * weightNum);
      if (catLower.includes('лист')) {
        unit_label = 'ЗА ШТ';
      } else {
        unit_label = 'ЗА МЕТР';
      }
    }
    
    const specMap = new Map();
    normalizedSpecsList.forEach(([k, v]) => {
      if (k.toLowerCase().includes('длина') && (v.toLowerCase().includes('марк') || v.toLowerCase().includes('ст') || v.toLowerCase().includes('\n'))) {
        return;
      }
      specMap.set(k, v);
    });
    
    if (lengthVal) {
      specMap.set('Длина', lengthVal);
    }
    
    const sizeVal = extractSizeFromName(p.name, p.category);
    
    if (catLower.includes('арматур')) {
      if (!specMap.has('ГОСТ')) specMap.set('ГОСТ', '5781, 34028');
      if (!specMap.has('Назначение')) specMap.set('Назначение', 'Для фундамента');
      if (!specMap.has('Форма')) specMap.set('Форма', 'Круглая');
      
      let classArm = '';
      let classVal = '';
      let surface = 'Гладкая';
      
      const nameLower = p.name.toLowerCase();
      if (nameLower.includes('а500с') || nameLower.includes('а500') || nameLower.includes('а3')) {
        classArm = 'А500С';
        classVal = 'А3';
        surface = 'Рифленая';
      } else if (nameLower.includes('а240') || nameLower.includes('а1')) {
        classArm = 'А240';
        classVal = 'А1';
        surface = 'Гладкая';
      }
      
      if (classArm) specMap.set('Класс арматуры', classArm);
      if (classVal) specMap.set('Класс', classVal);
      if (surface) specMap.set('Тип поверхности', surface);
      if (sizeVal) specMap.set('Диаметр', sizeVal + ' мм');
    } else if (catLower.includes('труб')) {
      if (!specMap.has('ГОСТ')) {
        if (catLower.includes('профил')) {
          specMap.set('ГОСТ', '8639-82, 13663-86');
        } else {
          specMap.set('ГОСТ', '10704-91');
        }
      }
      if (!specMap.has('Назначение')) specMap.set('Назначение', 'Строительство, машиностроение');
      
      const nameLower = p.name.toLowerCase();
      if (nameLower.includes('прямоуг')) {
        specMap.set('Форма', 'Прямоугольная');
      } else if (nameLower.includes('квадр') || nameLower.includes('профил')) {
        specMap.set('Форма', 'Квадратная');
      } else {
        specMap.set('Форма', 'Круглая');
      }
      if (sizeVal) specMap.set('Размер', sizeVal + ' мм');
    } else if (catLower.includes('балк')) {
      if (!specMap.has('ГОСТ')) specMap.set('ГОСТ', '8239-89, 535-88');
      if (!specMap.has('Назначение')) specMap.set('Назначение', 'Несущие строительные конструкции');
      if (!specMap.has('Форма')) specMap.set('Форма', 'Двутавровая');
      if (sizeVal) specMap.set('Размер', sizeVal);
    } else if (catLower.includes('швеллер')) {
      if (!specMap.has('ГОСТ')) specMap.set('ГОСТ', '8240-97');
      if (!specMap.has('Назначение')) specMap.set('Назначение', 'Строительное и машиностроительное');
      if (!specMap.has('Форма')) specMap.set('Форма', 'П-образная');
      if (sizeVal) specMap.set('Размер', sizeVal);
    } else if (catLower.includes('уголок')) {
      if (!specMap.has('ГОСТ')) specMap.set('ГОСТ', '8509-93');
      if (!specMap.has('Назначение')) specMap.set('Назначение', 'Строительные металлоконструкции');
      if (!specMap.has('Форма')) specMap.set('Форма', 'Г-образная');
      if (sizeVal) specMap.set('Размер', sizeVal + ' мм');
    } else {
      if (sizeVal) specMap.set('Размер', sizeVal + ' мм');
    }

    if (weightNum > 0) {
      specMap.set('Вес', weightNum + ' кг');
      let metersInTon = Math.round(1000 / weightNum);
      specMap.set('Количество метров в 1 тонне', metersInTon + ' м');
      
      if (lengthNum > 0) {
        const pcsInTon = Math.round(metersInTon / lengthNum);
        if (pcsInTon > 0) {
          specMap.set('Прутов в тонне', pcsInTon + ' шт');
        }
      }
    }
    
    const mergedSpecs = Array.from(specMap.entries());
    const specsJson = JSON.stringify(mergedSpecs);
    
    // Check if changes are needed
    const oldSpecsJson = typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs || []);
    
    const sizeValStr = sizeVal || null;
    const hasChanges = 
      oldSpecsJson !== specsJson ||
      p.vid !== sizeValStr ||
      p.width !== sizeValStr ||
      p.length !== lengthVal ||
      p.type !== steelType ||
      p.price_unit !== price_unit ||
      p.unit_label !== unit_label;
      
    if (hasChanges) {
      updates.push({
        id: p.id,
        name: p.name,
        vid: sizeValStr,
        width: sizeValStr,
        length: lengthVal,
        type: steelType,
        price_unit: price_unit,
        unit_label: unit_label,
        specs: specsJson
      });
    } else {
      skipped++;
    }
  });
  
  console.log(`\n=== STATISTICS ===`);
  console.log(`Total products checked: ${dbProducts.length}`);
  console.log(`Products already enriched/unchanged: ${skipped}`);
  console.log(`Products to update: ${updates.length}`);
  
  if (updates.length === 0) {
    console.log("No updates needed. Exiting.");
    return;
  }
  
  if (dryRun) {
    console.log("\n=== DRY RUN MODE: SAMPLES TO UPDATE ===");
    updates.slice(0, 5).forEach(u => {
      const orig = dbProducts.find(p => p.id === u.id);
      console.log(`Product: "${u.name}" (ID: ${u.id})`);
      console.log(`  OLD: vid="${orig.vid}", length="${orig.length}", type="${orig.type}", price_unit=${orig.price_unit}, unit_label="${orig.unit_label}"`);
      console.log(`  NEW: vid="${u.vid}", length="${u.length}", type="${u.type}", price_unit=${u.price_unit}, unit_label="${u.unit_label}"`);
      console.log(`  Specs: ${u.specs}`);
    });
    console.log("\nTo write updates to Supabase, run this script with the --write flag.");
  } else {
    console.log(`\nWriting ${updates.length} updates to Supabase in chunks of 50...`);
    const chunkSize = 50;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      
      const promises = chunk.map(u => 
        supabase
          .from('products')
          .update({
            vid: u.vid,
            width: u.width,
            length: u.length,
            type: u.type,
            price_unit: u.price_unit,
            unit_label: u.unit_label,
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
    console.log("All updates completed successfully!");
  }
}

run().catch(e => console.error("Unhandled error:", e));
