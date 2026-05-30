const fs = require('fs');

async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const schemaProducts = {
  type: "object",
  properties: {
    category: { type: "string" },
    subcategories: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, link: { type: "string" } }
      }
    },
    products: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          price: { type: "string", description: "Цена за тонну" },
          parameters: { type: "string", description: "Вес кг/м, длина хлыста" }
        }
      }
    }
  }
};

async function extractWithFirecrawl(url, schema) {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fc-1826f5e2cc5e49738855b8df723812ef'
      },
      body: JSON.stringify({
        url: url,
        formats: ['extract'],
        extract: { schema: schema }
      })
    });
    const result = await response.json();
    if (result.success && result.data && result.data.extract) {
      return result.data.extract;
    } else {
      console.error(`Error extracting ${url}:`, result.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error(`Error extracting ${url}:`, error.message);
    return null;
  }
}

async function run() {
  const rootUrls = [
    'https://metallobazav.ru/nerzhaveyushchaya-stal/',
    'https://metallobazav.ru/specialsteel/',
    'https://metallobazav.ru/krovelnye-materialy/'
  ];

  let allData = [];
  const outputFile = 'catalog_extracted_rest.json';
  if (fs.existsSync(outputFile)) {
    try {
      allData = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    } catch(e) {}
  }
  const visited = new Set();
  
  function saveData() {
    fs.writeFileSync(outputFile, JSON.stringify(allData, null, 2));
  }

  async function scrapeCategory(name, link, parentPath = []) {
    if (visited.has(link)) return;
    
    // Only allow links that belong strictly to the 3 target categories
    const isTargetCategory = link.includes('/nerzhaveyushchaya-stal/') || 
                             link.includes('/specialsteel/') || 
                             link.includes('/krovelnye-materialy/');
    
    if (!isTargetCategory) {
      return;
    }
    visited.add(link);

    console.log(`Extracting from ${link}...`);
    await delay(1000);
    const data = await extractWithFirecrawl(link, schemaProducts);
    
    if (data && data.products && data.products.length > 0) {
      allData.push({
        category: name || data.category || 'Неизвестная',
        parentPath: parentPath,
        products: data.products
      });
      console.log(`   Added ${data.products.length} products from ${name || data.category}`);
      saveData();
    }

    if (data && data.subcategories && data.subcategories.length > 0) {
      for (const sub of data.subcategories) {
        if (sub.link && sub.link.startsWith('http') && sub.link.includes('metallobazav.ru') && !visited.has(sub.link)) {
          const isSubTarget = sub.link.includes('/nerzhaveyushchaya-stal/') || 
                              sub.link.includes('/specialsteel/') || 
                              sub.link.includes('/krovelnye-materialy/');
          if (isSubTarget) {
            await scrapeCategory(sub.name, sub.link, [...parentPath, name || data.category]);
          }
        }
      }
    }
  }

  for (const rootUrl of rootUrls) {
    console.log(`Fetching root: ${rootUrl}`);
    await delay(1000);
    const data = await extractWithFirecrawl(rootUrl, schemaProducts);
    if (data && data.subcategories) {
      for (const sub of data.subcategories) {
        if (sub.link && sub.link.startsWith('http') && sub.link.includes('metallobazav.ru') && !visited.has(sub.link)) {
          const isSubTarget = sub.link.includes('/nerzhaveyushchaya-stal/') || 
                              sub.link.includes('/specialsteel/') || 
                              sub.link.includes('/krovelnye-materialy/');
          if (isSubTarget) {
            await scrapeCategory(sub.name, sub.link, [data.category || 'Root']);
          }
        }
      }
    }
  }

  saveData();
  console.log(`Scraping complete. Saved to ${outputFile}`);
}

run();
