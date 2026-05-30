/**
 * SAFE catalog sync from scratch/sync_data/*.json into Supabase `products`.
 *
 * Design goals (per owner rules):
 *  - NEVER delete the whole catalog. Uses upsert on `id` only.
 *  - NEVER fabricate prices. Only writes price fields that exist in the source.
 *    metallobazav listing numbers are price-PER-TON -> price_ton. price_unit/price_meter
 *    are left NULL unless the source explicitly provides a per-piece/per-meter price.
 *  - Populates `l3` (third-level subgroup) so the catalog L3 filter has data.
 *  - Builds `specs` (характеристики) from parsed fields, not from name guessing.
 *
 * Usage:
 *   node sync_catalog_safe.js              # sync every *.json in scratch/sync_data
 *   node sync_catalog_safe.js armatura     # sync only armatura.json
 *   node sync_catalog_safe.js --dry-run    # show what WOULD be written, write nothing
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://drbknuvnsyonmeudoleo.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const DATA_DIR = path.join(__dirname, 'scratch', 'sync_data');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const onlyFilters = args.filter(a => !a.startsWith('--'));

// Category -> default image fallback (real per-category images live under /images/products/)
const CATEGORY_IMAGE = {
  'Арматура': '/images/products/armatura_premium.png',
  'Швеллер': '/images/products/channel_premium.png',
  'Балка': '/images/products/beam_premium.png',
  'Уголок': '/images/products/angle_premium.png',
  'Труба профильная': '/images/products/profile_tubes_premium_1778423900429.png',
  'Круг': '/images/products/round_premium.png',
  'Лист стальной': '/images/products/sheet_premium.png',
  'Профнастил': '/images/products/profnastil_premium.png',
};
const DEFAULT_IMAGE = '/images/products/profile_tubes_premium_1778423900429.png';

// Transliteration-ish slug builder so ids are stable & URL-safe.
function slugify(str) {
  const map = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',
    н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',
    ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
  };
  return String(str).toLowerCase()
    .split('').map(ch => (map[ch] !== undefined ? map[ch] : ch)).join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

// Derive a stable id from product url (preferred) or from the name.
function deriveId(p, category) {
  if (p.url) {
    const m = p.url.replace(/\/+$/, '').split('/');
    const last = m[m.length - 1];
    if (last) return last.replace(/_/g, '-');
  }
  return slugify(`${category}-${p.name}`);
}

// Build specs (характеристики) array from parsed source fields. No fabrication.
function buildSpecs(p) {
  const specs = [];
  const push = (k, v) => { if (v !== undefined && v !== null && String(v).trim() !== '' && String(v) !== 'Н/Д') specs.push([k, String(v)]); };
  push('Диаметр', p.diameter);
  push('Класс арматуры', p.steel);
  push('Класс', p.class);
  if (p.weight) push('Вес 1 м.п.', `${p.weight} кг`);
  push('ГОСТ', p.gost);
  push('Длина', p.length);
  // Extra passthrough specs if the scraper provided a specs object/array.
  if (Array.isArray(p.specs)) {
    p.specs.forEach(row => { if (Array.isArray(row) && row.length === 2) push(row[0], row[1]); });
  } else if (p.specs && typeof p.specs === 'object') {
    Object.entries(p.specs).forEach(([k, v]) => push(k, v));
  }
  return specs;
}

// Decide l3 subgroup. For armatura we group by steel class (diameter already
// covered by `vid`). Generic fallback: explicit p.l3 if the scraper set one.
function deriveL3(p, category) {
  if (p.l3) return p.l3;
  if (category === 'Арматура' && p.steel && p.steel !== 'Н/Д') {
    return `Арматура ${p.steel}`;
  }
  return '';
}

function toRow(p, file) {
  const category = file.category;
  const id = deriveId(p, category);
  const diameter = (p.diameter || '').replace(/\s*мм\s*/i, '').trim();

  // PRICES — only what exists. Source `price_ton` is the listing number (per ton).
  const row = {
    id,
    name: p.name,
    category,
    parent_category: file.parent_category || '',
    price_ton: (p.price_ton != null && p.price_ton !== '') ? Number(p.price_ton) : null,
    price_unit: (p.price_unit != null && p.price_unit !== '') ? Number(p.price_unit) : null,
    unit_label: (p.price_unit != null && p.price_unit !== '') ? (p.unit_label || 'ЗА ШТ') : 'ЗА ТОННУ',
    weight: p.weight ? `${p.weight} кг` : '',
    image: CATEGORY_IMAGE[category] || DEFAULT_IMAGE,
    description: p.description || '',
    specs: JSON.stringify(buildSpecs(p)),
    vid: diameter || (p.vid || ''),
    length: p.length || '',
    width: p.width || '',
    type: p.type || p.class || '',
    l3: deriveL3(p, category),
    vstatus: 'active'
  };
  return row;
}

async function syncFile(filePath) {
  const file = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const products = file.products || [];
  const rows = products.map(p => toRow(p, file));
  console.log(`\n=== ${path.basename(filePath)} : ${file.category} (${rows.length} products) ===`);

  if (DRY_RUN) {
    rows.slice(0, 3).forEach(r => console.log('  sample:', JSON.stringify({ id: r.id, name: r.name, price_ton: r.price_ton, price_unit: r.price_unit, unit_label: r.unit_label, l3: r.l3 })));
    console.log(`  [DRY-RUN] would upsert ${rows.length} rows (no delete).`);
    return { upserted: 0, total: rows.length };
  }

  let upserted = 0;
  const chunk = 100;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { data, error } = await supabase.from('products').upsert(slice, { onConflict: 'id' }).select('id');
    if (error) {
      console.error(`  ✗ chunk @${i}:`, error.message);
    } else {
      upserted += data ? data.length : 0;
      console.log(`  ✓ upserted ${data ? data.length : 0} (${i + slice.length}/${rows.length})`);
    }
  }
  return { upserted, total: rows.length };
}

async function run() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error('No data dir:', DATA_DIR);
    process.exit(1);
  }
  let files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  if (onlyFilters.length) {
    files = files.filter(f => onlyFilters.some(n => f.toLowerCase().includes(n.toLowerCase())));
  }
  if (!files.length) {
    console.error('No matching JSON files in', DATA_DIR);
    process.exit(1);
  }
  console.log(`SAFE SYNC — upsert only, no delete. ${DRY_RUN ? '(DRY-RUN)' : ''}`);
  console.log('Files:', files.join(', '));

  let totalUp = 0, totalAll = 0;
  for (const f of files) {
    const res = await syncFile(path.join(DATA_DIR, f));
    totalUp += res.upserted; totalAll += res.total;
  }
  console.log(`\nDone. Upserted ${totalUp}/${totalAll} products.`);
}

run().catch(e => { console.error(e); process.exit(1); });
