require('dotenv').config();
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://drbknuvnsyonmeudoleo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log('Reading products-data.js...');
  const code = fs.readFileSync('products-data.js', 'utf8');
  
  // Extract the JSON part from const PRODUCTS = [ ... ];
  const jsonMatch = code.match(/const PRODUCTS = (\[.*\]);/s);
  if (!jsonMatch) {
    console.error('Could not parse PRODUCTS from products-data.js');
    process.exit(1);
  }
  
  const products = eval(jsonMatch[1]);
  console.log(`Found ${products.length} products.`);

  console.log('Cleaning up existing products in Supabase to prevent filter clutter...');
  const { error: deleteErr } = await supabase.from('products').delete().neq('id', '_none_');
  if (deleteErr) {
    console.warn('Warning during products cleanup:', deleteErr.message);
  } else {
    console.log('Successfully cleared old products from database.');
  }

  console.log('Uploading new products to Supabase...');
  const chunkSize = 200;
  for (let i = 0; i < products.length; i += chunkSize) {
    const chunk = products.slice(i, i + chunkSize).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      parent_category: p.parentCategory || p.parent_category,
      price_ton: p.priceTonNum || p.price_ton || 0,
      price_unit: p.priceUnitNum || p.price_unit || 0,
      unit_label: p.unitLabel || p.unit_label,
      weight: p.weight,
      description: p.description,
      image: p.image || p.img || '/images/products/profile_tubes_premium_1778423900429.png',
      specs: typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs),
      vid: p.vid || '',
      length: p.length || '',
      width: p.width || '',
      type: p.type || '',
      l3: p.l3 || p.subcategory_l3 || ''
    }));
    
    const { error } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`Error in chunk ${i}:`, error.message);
    } else {
      console.log(`Uploaded chunk ${Math.floor(i/chunkSize) + 1}/${Math.ceil(products.length/chunkSize)}`);
    }
  }
  
  console.log('Upload complete!');
}

run().catch(console.error);
