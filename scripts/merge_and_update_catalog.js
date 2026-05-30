const fs = require('fs');
const path = require('path');

function parseWeight(paramsStr) {
  // e.g., "11.7 м, 1.21 кг/м" -> weight = 1.21
  const match = paramsStr.match(/([\d\.]+)\s*кг\/м/);
  return match ? parseFloat(match[1]) : 1;
}

function parseLength(paramsStr) {
  const match = paramsStr.match(/([\d\.]+)\s*м/);
  return match ? parseFloat(match[1]) : 1;
}

function cleanPrice(priceStr) {
  if (!priceStr) return null;
  const match = priceStr.replace(/\s+/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function generateId(name) {
  return name.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function mergeAndUpdate() {
  console.log('Loading scraped data...');
  
  let extracted = [];
  if (fs.existsSync('catalog_extracted.json')) {
    extracted = extracted.concat(JSON.parse(fs.readFileSync('catalog_extracted.json', 'utf8')));
  }
  if (fs.existsSync('catalog_extracted_rest.json')) {
    extracted = extracted.concat(JSON.parse(fs.readFileSync('catalog_extracted_rest.json', 'utf8')));
  }
  
  let prices23 = [];
  if (fs.existsSync('prices_23met.json')) {
    prices23 = JSON.parse(fs.readFileSync('prices_23met.json', 'utf8'));
  }

  // Create a map of 23met prices for faster lookup
  // We can normalize names for better matching
  const normalize = (str) => str.toLowerCase().replace(/[^а-яa-z0-9]/g, '');
  const priceMap = new Map();
  for (const p of prices23) {
    priceMap.set(normalize(p.name), p);
  }

  const newProducts = [];
  
  let idCounter = 1;

  for (const group of extracted) {
    const parentCat = group.parentPath && group.parentPath.length > 0 ? group.parentPath[0] : group.category;
    
    for (const prod of group.products) {
      if (!prod.name) continue;
      
      const normName = normalize(prod.name);
      
      let priceTon = cleanPrice(prod.price);
      let priceMeter = null;

      // Try exact or fuzzy match with 23met
      const matchedPrice = priceMap.get(normName);
      if (matchedPrice && matchedPrice.priceTon) {
        priceTon = cleanPrice(matchedPrice.priceTon);
      }
      if (matchedPrice && matchedPrice.priceMeter) {
        priceMeter = cleanPrice(matchedPrice.priceMeter);
      }

      // If price per meter is not available from 23met, calculate it
      const weightPerMeter = parseWeight(prod.parameters || "");
      const length = parseLength(prod.parameters || "");
      
      let priceUnitNum = priceMeter;
      if (!priceUnitNum && priceTon) {
        priceUnitNum = Math.ceil((priceTon / 1000) * weightPerMeter * length);
      }

      newProducts.push({
        id: generateId(prod.name) + '-' + idCounter++,
        name: prod.name,
        category: group.category,
        parentCategory: "Чёрный металлопрокат", // Using this as main category for all scraped items since we excluded others
        length: length ? `${length} м` : null,
        priceTon: priceTon ? priceTon.toString() : null,
        priceTonNum: priceTon,
        priceUnit: priceUnitNum ? priceUnitNum.toString() : null,
        priceUnitNum: priceUnitNum,
        unitLabel: "ЗА ШТ",
        weight: weightPerMeter ? weightPerMeter.toString() : "1",
        description: prod.parameters || "",
        specs: prod.parameters ? prod.parameters.split(',').map(s => s.trim()) : [],
        isPopular: Math.random() > 0.8 // Randomly assign popular for demo, or refine logic
      });
    }
  }

  // Overwrite products-data.js
  const jsContent = `// Product catalog - Restructured and updated automatically\n\nconst PRODUCTS = ${JSON.stringify(newProducts, null, 2)};\n\nif (typeof window !== 'undefined') {\n  window.PRODUCTS = PRODUCTS;\n}\nif (typeof module !== 'undefined') {\n  module.exports = { PRODUCTS };\n}`;
  
  fs.writeFileSync('products-data.js', jsContent, 'utf8');
  console.log(`Updated products-data.js with ${newProducts.length} products.`);
  
  // Optionally update sqlite
  console.log('To sync with sqlite, run: node sync_catalog.js');
}

mergeAndUpdate().catch(console.error);
