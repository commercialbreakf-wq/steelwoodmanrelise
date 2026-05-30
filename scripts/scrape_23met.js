const fs = require('fs');
const cheerio = require('cheerio');

const BASE_URL = 'https://23met.ru';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrape23met() {
  console.log('Fetching 23met.ru main page...');
  const res = await fetch(BASE_URL);
  const html = await res.text();
  const $ = cheerio.load(html);

  let categories = [];
  $('ul.katalog-list > li > a').each((i, el) => {
    const link = $(el).attr('href');
    const name = $(el).text().trim();
    if (link) {
      categories.push({ name, link: link.startsWith('http') ? link : BASE_URL + link });
    }
  });

  // Fallback if ul.katalog-list doesn't match
  if (categories.length === 0) {
    $('a').each((i, el) => {
      const link = $(el).attr('href');
      const name = $(el).text().trim();
      // Match typical category links if any
      if (link && link.startsWith('/price/')) {
        categories.push({ name, link: BASE_URL + link });
      }
    });
  }

  // Deduplicate
  const seen = new Set();
  categories = categories.filter(c => {
    if (seen.has(c.link)) return false;
    seen.add(c.link);
    return true;
  });

  console.log(`Found ${categories.length} categories on 23met.ru`);

  let prices = [];

  for (const cat of categories) {
    console.log(`Scraping category: ${cat.name} (${cat.link})`);
    try {
      const catRes = await fetch(cat.link);
      const catHtml = await catRes.text();
      const $cat = cheerio.load(catHtml);

      // Example parsing for a generic table on 23met.ru
      // The table often has columns like: Product name, Size/Steel, Price per ton, Price per meter
      $cat('table.price-table tr, table tr').each((i, row) => {
        const cols = $cat(row).find('td');
        if (cols.length >= 3) {
          const name = $cat(cols[0]).text().trim();
          let priceTon = $cat(cols).filter((_, el) => $cat(el).text().includes('т')).text() || $cat(cols[cols.length - 2]).text();
          let priceMeter = $cat(cols).filter((_, el) => $cat(el).text().includes('м')).text() || $cat(cols[cols.length - 1]).text();

          // Extract digits
          const ptMatch = priceTon.replace(/\s+/g, '').match(/\d+/);
          const pmMatch = priceMeter.replace(/\s+/g, '').match(/\d+/);

          if (name && (ptMatch || pmMatch)) {
            prices.push({
              name: name,
              category: cat.name,
              priceTon: ptMatch ? ptMatch[0] : null,
              priceMeter: pmMatch ? pmMatch[0] : null
            });
          }
        }
      });
    } catch (e) {
      console.error(`Error fetching ${cat.link}:`, e.message);
    }
    await delay(1000); // polite delay
  }

  fs.writeFileSync('prices_23met.json', JSON.stringify(prices, null, 2));
  console.log(`Scraping complete. Extracted ${prices.length} prices to prices_23met.json`);
}

scrape23met();
