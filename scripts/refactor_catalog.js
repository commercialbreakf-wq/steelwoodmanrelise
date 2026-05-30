const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'catalog.html');
let content = fs.readFileSync(targetFile, 'utf8');

const newRenderLogic = `
function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = products.map((p, i) => {
    // Apply universal logic
    if (window.parseUniversalSpecs) {
        p = window.parseUniversalSpecs(p);
    }
    
    const id = p.id || '';
    const name = p.name || 'Товар без названия';
    const category = p.category || '';
    const priceTonNum = parseFloat(p.price_ton || p.priceTonNum || 0);
    const priceUnitNum = parseFloat(p.price_unit || p.priceUnitNum || 0);
    const priceTonFmt = p.priceTon || (priceTonNum > 0 ? priceTonNum.toLocaleString('ru-RU') : '');
    const priceUnitFmt = p.priceUnit || (priceUnitNum > 0 ? priceUnitNum.toLocaleString('ru-RU') : '');
    const unitLabel = p.unitLabel || p.unit_label || (priceTonNum > 0 ? 'ЗА ТОННУ' : 'ЗА ЕД.');
    const imgUrl = p.image || p.img || (window.getProductImage ? window.getProductImage(category) : '/images/products/hot_rolled_sheets_premium_1778423920658.png');
    
    // Extract key specs safely
    const getSpecVal = (keyStr) => {
        if (!p.specs || !Array.isArray(p.specs)) return null;
        const s = p.specs.find(arr => arr[0] && arr[0].toLowerCase().includes(keyStr));
        return s ? s[1] : null;
    };
    
    const standard = getSpecVal('гост') || 'ГОСТ';
    const steel = getSpecVal('марка') || getSpecVal('сталь') || 'Ст3';
    
    // Pick appropriate dimension to display
    let sizeDesc = '';
    if (p.isSheet) {
        sizeDesc = getSpecVal('раскрой') || getSpecVal('размер') || 'Раскрой';
    } else {
        sizeDesc = getSpecVal('длина') || 'Немерная';
    }

    return \`
    <div class="group relative overflow-hidden border border-outline-variant/10 bg-surface-container-lowest hover:border-primary/20 hover:bg-white/[0.02] transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between p-5 gap-6 rounded-2xl cursor-pointer card-enter shadow-lg shadow-black/5" style="animation-delay:\${i * 20}ms" onclick="window.location.href='/product?id=\${id}'">
      
      <div class="flex items-center gap-5 flex-1 min-w-0 pointer-events-none">
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-surface-container border border-outline-variant/10 flex-shrink-0">
            <img src="\${imgUrl}" alt="\${name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"/>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[9px] font-label-caps uppercase tracking-widest text-primary/80">\${category}</span>
            </div>
            <h4 class="font-headline-md text-base md:text-lg font-semibold text-on-surface group-hover:text-primary transition-colors truncate">\${name}</h4>
            <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                <p class="text-on-surface-variant text-[10px] flex items-center gap-1.5 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px] opacity-40">verified</span> \${steel}
                </p>
                <p class="text-on-surface-variant text-[10px] flex items-center gap-1.5 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px] opacity-40">straighten</span> \${sizeDesc}
                </p>
                <p class="text-on-surface-variant text-[10px] flex items-center gap-1.5 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px] opacity-40">inventory_2</span> \${standard}
                </p>
            </div>
        </div>
      </div>

      <div class="w-full md:w-auto flex flex-row md:flex-col items-end justify-between md:justify-center gap-4 md:text-right z-10 pointer-events-none \${priceTonNum <= 0 && priceUnitNum <= 0 ? 'hidden md:flex' : 'flex'}">
        <div class="whitespace-nowrap">
            <p class="font-label-caps text-[9px] text-on-surface-variant mb-0.5 uppercase tracking-widest">\${priceTonNum > 0 ? 'ЦЕНА ЗА ТОННУ' : 'ЦЕНА'}</p>
            <p class="text-primary text-xl font-bold tracking-tight leading-none">\${priceTonNum > 0 ? priceTonFmt + ' ₽' : 'По запросу'}</p>
        </div>
        <div class="md:border-t md:border-outline-variant/10 md:pt-2 whitespace-nowrap">
            <p class="font-label-caps text-[9px] text-on-surface-variant mb-0.5 uppercase tracking-widest">\${unitLabel}</p>
            <p class="text-on-surface font-semibold text-sm leading-none">\${priceUnitNum > 0 ? priceUnitFmt + ' ₽' : 'По запросу'}</p>
        </div>
      </div>

      <div class="w-full md:w-64 flex items-center gap-2 z-10" onclick="event.stopPropagation()">
        <div class="qty-selector-container flex-1 flex items-center bg-surface-container border border-outline-variant/10 overflow-hidden h-11 rounded-xl">
            <input type="text" id="qty-\${id}" value="1.00" inputmode="decimal" onblur="window.validateCatalogQtyInput(this, \${priceTonNum > 0})" onchange="window.validateCatalogQtyInput(this, \${priceTonNum > 0})" class="w-16 bg-transparent border-none text-left pl-3 font-bold text-on-surface outline-none text-sm h-full"/>
            <span class="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-widest flex-1 opacity-60">\${priceTonNum > 0 ? 'Т' : 'ШТ'}</span>
            <div class="flex flex-col h-full w-10 border-l border-white/5 bg-white/5">
                <button onclick="changeQty('\${id}', 1)" class="flex-1 flex items-center justify-center hover:bg-primary/20 transition-colors border-b border-white/5 group">
                    <span class="material-symbols-outlined text-primary text-[18px] group-hover:scale-125 transition-transform">expand_less</span>
                </button>
                <button onclick="changeQty('\${id}', -1)" class="flex-1 flex items-center justify-center hover:bg-primary/20 transition-colors group">
                    <span class="material-symbols-outlined text-primary text-[18px] group-hover:scale-125 transition-transform">expand_more</span>
                </button>
            </div>
        </div>
        <button onclick="addToCart('\${id}')" class="catalog-cart-btn w-12 h-11 bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 transition-all pink-glow rounded-xl border border-primary cursor-pointer active:scale-95">
            <span class="material-symbols-outlined">shopping_cart</span>
        </button>
      </div>
    </div>
    \`;
  }).join('');
}
`;

const lines = content.split('\\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function renderProducts(products) {')) startIndex = i;
    if (lines[i].includes('function renderPagination(nav) {')) { endIndex = i; break; }
}

if (startIndex !== -1 && endIndex !== -1) {
    const before = lines.slice(0, startIndex).join('\\n');
    const after = lines.slice(endIndex).join('\\n');
    fs.writeFileSync(targetFile, before + '\\n' + newRenderLogic + '\\n' + after);
    console.log('Successfully replaced logic in catalog.html');
} else {
    console.error('Could not find boundaries in catalog.html');
}
