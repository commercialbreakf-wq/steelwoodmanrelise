const fs = require('fs');

const API_KEY = 'fc-1826f5e2cc5e49738855b8df723812ef';
const BASE_URL = 'https://api.firecrawl.dev/v1/scrape';
const START_URL = 'https://metallobazav.ru/catalog';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function extractWithFirecrawl(url, schema) {
  try {
    console.log(`Extracting from ${url}...`);
    const data = {
      url: url,
      formats: ['extract'],
      extract: { schema }
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(data)
    });

    const json = await response.json();
    if (!json.success) {
      console.error(`Error extracting ${url}:`, json.error);
      return null;
    }
    return json.data.extract;
  } catch (error) {
    console.error(`Fetch error on ${url}:`, error);
    return null;
  }
}

async function scrape() {
  const schemaCategories = {
    type: 'object',
    properties: {
      categories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            link: { type: 'string' }
          }
        }
      }
    }
  };

  const schemaProducts = {
    type: 'object',
    properties: {
      subcategories: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            link: { type: 'string' }
          }
        }
      },
      products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'string', description: 'Price' },
            parameters: { type: 'string', description: 'Parameters like length, weight, grade' }
          }
        }
      }
    }
  };

  console.log('Fetching main categories...');
  const mainData = await extractWithFirecrawl(START_URL, schemaCategories);
  if (!mainData || !mainData.categories) {
    console.log('Failed to fetch main categories.');
    return;
  }

  let categories = mainData.categories.filter(c => 
    !c.name.toLowerCase().includes('металлоконструкци') &&
    !c.name.toLowerCase().includes('цветной') && 
    c.link && c.link.includes('metallobazav.ru')
  );

  console.log(`Found ${categories.length} valid categories.`);

  let allData = [];
  const visited = new Set();

  // Recursive function to scrape categories and subcategories
  async function scrapeCategory(name, link, parentPath = []) {
    if (visited.has(link)) return;
    visited.add(link);

    await delay(1000); // rate limiting
    const data = await extractWithFirecrawl(link, schemaProducts);
    
    if (data && data.products && data.products.length > 0) {
      allData.push({
        category: name,
        parentPath: parentPath,
        url: link,
        products: data.products
      });
      console.log(`   Added ${data.products.length} products from ${name}`);
    }

    if (data && data.subcategories && data.subcategories.length > 0) {
      for (const sub of data.subcategories) {
        if (sub.link && sub.link !== link && sub.link.startsWith('http')) {
          await scrapeCategory(sub.name, sub.link, [...parentPath, name]);
        }
      }
    }
  }

  for (const cat of categories) {
    console.log(`\nProcessing category: ${cat.name}`);
    await scrapeCategory(cat.name, cat.link, []);
  }

  fs.writeFileSync('catalog_extracted.json', JSON.stringify(allData, null, 2));
  console.log('Scraping complete. Saved to catalog_extracted.json');
}

scrape();
