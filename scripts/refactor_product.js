const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'product.html');
let content = fs.readFileSync(targetFile, 'utf8');

// The replacement code uses `window.parseUniversalSpecs(p)` to get unified parameters.
const newRenderLogic = `
            if (window.parseUniversalSpecs) {
                p = window.parseUniversalSpecs(p);
            }

            p.priceTon = parseFloat(p.price_ton || p.priceTonNum || 0);
            p.priceUnit = parseFloat(p.price_unit || p.priceUnitNum || 0);
            p.unitLabel = p.unitLabel || p.unit_label || (p.price_ton ? 'ЗА ТОННУ' : 'ЗА ШТ');
            p.image = p.image || p.img || (window.getProductImage ? window.getProductImage(p.category) : '');

            currentProduct = p;
            document.title = p.name + ' — Железный Дровосек';

            // UI Elements
            document.getElementById('productName').textContent = p.name;
            document.getElementById('productCategory').textContent = p.category;
            document.getElementById('productImg').src = p.image.split(',')[0];
            
            // Breadcrumbs
            document.getElementById('breadcrumbs').innerHTML = \`
                <a href="/">Главная</a> <span class="opacity-20 mx-1">/</span>
                <a href="/catalog/?cat=\${encodeURIComponent(p.category)}">\${p.category}</a> <span class="opacity-20 mx-1">/</span>
                <span class="text-primary font-bold">\${p.name}</span>\`;

            // Badges
            const isGost = p.description.toLowerCase().includes('гост');
            const steel = p.specs.find(s => s[0] && typeof s[0] === 'string' && (s[0].toLowerCase().includes('сталь') || s[0].toLowerCase().includes('марка')))?.[1];
            let badges = '<span class="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold border border-green-500/20 uppercase tracking-widest">В наличии</span>';
            if (isGost) badges += '<span class="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-[10px] font-bold border border-primary/20 uppercase tracking-widest">ГОСТ</span>';
            if (steel) badges += \`<span class="px-3 py-1.5 bg-white/5 text-white/50 rounded-lg text-[10px] font-bold border border-white/10 uppercase tracking-widest">\${steel}</span>\`;
            document.getElementById('productBadge').innerHTML = badges;

            // Gallery
            const imgs = p.image.split(',');
            if (imgs.length > 1) {
                document.getElementById('galleryContainer').innerHTML = imgs.map((src, i) => \`
                    <div onclick="document.getElementById('productImg').src='\${src}'" class="w-20 h-20 shrink-0 border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all bg-[#1e1c1a]">
                        <img src="\${src}" class="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt=""/>
                    </div>\`).join('');
            } else {
                document.getElementById('galleryContainer').innerHTML = '';
            }

            // Tabs Content Prep
            contents.desc = p.description.replace(/\\n/g, '<br>');
            contents.specs = \`
                <div class="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden max-w-4xl shadow-sm">
                    <table class="w-full text-left border-collapse">
                        <tbody>
                            \${p.specs.map(([l, v], idx) => \`
                                <tr class="\${idx % 2 === 0 ? 'bg-[#fbf9f7] dark:bg-[#1e1c1a]' : 'bg-[#ffffff] dark:bg-[#151311]'} border-b border-black/5 dark:border-white/5 last:border-b-0">
                                    <td class="px-6 py-4 text-xs font-bold text-[#1a1817]/60 dark:text-white/40 uppercase tracking-wider">\${l}</td>
                                    <td class="px-6 py-4 text-xs font-bold text-[#1a1817] dark:text-white text-right">\${v}</td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>\`;

            // Volhonka Styled Purchase Panel (Universal for all products)
            const container = document.getElementById('purchaseBlockContainer');
            
            let lengthVal = p.mLenVal || 6;
            let weightVal = p.wUnitVal || 1;
            let areaVal = p.m2Val || 1;
            
            let priceWhip = p.priceUnit > 0 ? p.priceUnit : 0;
            if (priceWhip === 0 && p.priceTon > 0) {
                priceWhip = Math.round((p.priceTon / 1000) * weightVal * (p.calcType === 'linear' ? lengthVal : 1));
            }
            
            let priceMeter = 0;
            if (p.calcType === 'linear') {
                priceMeter = priceWhip > 0 ? Math.round(priceWhip / lengthVal) : 0;
                if (priceMeter === 0 && p.priceTon > 0) {
                    priceMeter = Math.round((p.priceTon / 1000) * weightVal);
                }
            } else if (p.calcType === 'area') {
                priceMeter = priceWhip > 0 ? Math.round(priceWhip / areaVal) : 0;
                if (priceMeter === 0 && p.priceTon > 0) {
                    priceMeter = Math.round((p.priceTon / 1000) * (weightVal / areaVal)); // price per m2
                }
            }

            const priceTonFmt = p.priceTon > 0 ? p.priceTon.toLocaleString('ru-RU') : 'По запросу';
            const priceWhipFmt = priceWhip > 0 ? priceWhip.toLocaleString('ru-RU') : 'По запросу';
            const priceMeterFmt = priceMeter > 0 ? priceMeter.toLocaleString('ru-RU') : 'По запросу';

            const opt1Label = p.calcType === 'area' ? 'Цена за лист' : (p.isSheet ? 'Цена за штуку' : 'Цена за хлыст');
            const opt2Label = p.calcType === 'area' ? 'Цена за м2' : 'Цена за метр';

            container.innerHTML = \`
                <div class="space-y-4 bg-surface-container-low/30 p-5 rounded-3xl border border-outline-variant/10 shadow-sm text-on-surface">
                    <div class="flex items-center justify-between border-b border-outline-variant/10 pb-3">
                        <span class="text-lg font-bold font-display text-on-surface">Стоимость</span>
                        <div class="flex flex-col items-end gap-1">
                            <div class="flex items-center gap-1.5 text-xs text-on-surface-variant/70 select-none">
                                <span class="material-symbols-outlined text-base text-green-500 animate-pulse">visibility</span>
                                Прямо сейчас смотрят: <span class="font-bold text-on-surface">8</span>
                            </div>
                            <div class="flex items-center gap-1.5 text-[11px] text-green-500 select-none font-semibold uppercase tracking-wider font-label-caps">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                                В наличии
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2 mt-4">
                        <label id="label-opt-whip" class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                            <div class="flex items-center gap-3">
                                <input type="radio" name="price-type" value="whip" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                                <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">\${opt1Label}</span>
                            </div>
                            <span class="text-sm md:text-base font-bold text-on-surface">\${priceWhipFmt} ₽</span>
                        </label>
                        <label id="label-opt-meter" class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                            <div class="flex items-center gap-3">
                                <input type="radio" name="price-type" value="meter" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                                <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">\${opt2Label}</span>
                            </div>
                            <span class="text-sm md:text-base font-bold text-on-surface">\${priceMeterFmt} ₽</span>
                        </label>
                        <label id="label-opt-ton" class="flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt">
                            <div class="flex items-center gap-3">
                                <input type="radio" name="price-type" value="ton" checked class="w-4 h-4 text-primary bg-transparent border-primary focus:ring-0 cursor-pointer" />
                                <span class="text-xs md:text-sm font-semibold text-on-surface group-hover/opt:text-on-surface transition-colors">Цена за тонну</span>
                            </div>
                            <span class="text-sm md:text-base font-bold text-on-surface">\${priceTonFmt} ₽</span>
                        </label>
                    </div>

                    <div class="flex items-center justify-between mt-5 bg-surface-container-lowest border border-outline-variant/5 p-4 rounded-2xl shadow-inner">
                        <div class="flex items-center bg-surface-container border border-outline-variant/10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <button id="btn-qty-minus" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">-</button>
                            <input id="input-qty" type="text" class="w-12 bg-transparent border-none text-center font-bold text-on-surface outline-none text-sm h-full" value="1" />
                            <button id="btn-qty-plus" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">+</button>
                        </div>
                        <div class="text-right">
                            <div class="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant/50 font-label-caps mb-0.5">Итоговая стоимость</div>
                            <span class="text-base md:text-lg font-bold text-primary font-display-xl" id="display-total-price">= \${priceTonFmt} ₽</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 gap-2 pt-2">
                        <button id="btn-add-to-cart-volhonka" class="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-wider rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase shadow-md font-label-caps border-none cursor-pointer">
                            <span class="material-symbols-outlined text-lg">shopping_cart</span> В корзину
                        </button>
                        <button id="btn-one-click-volhonka" class="w-full text-center text-[10px] font-bold text-primary hover:underline transition-all py-1.5 uppercase tracking-widest font-label-caps bg-transparent border-none cursor-pointer">
                            Купить в 1 клик
                        </button>
                    </div>

                    <div class="mt-4 border-t border-outline-variant/10 pt-4 space-y-2.5 text-xs text-on-surface-variant">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2 opacity-80">
                                <span class="material-symbols-outlined text-base text-primary/70">local_shipping</span>
                                <span>Доставка</span>
                            </div>
                            <span class="font-semibold text-right text-on-surface">в течение дня, после предоплаты</span>
                        </div>
                        <div class="flex items-center justify-between border-t border-outline-variant/5 pt-2">
                            <div class="flex items-center gap-2 opacity-80">
                                <span class="material-symbols-outlined text-base text-primary/70">storefront</span>
                                <span>Самовывоз</span>
                            </div>
                            <span class="font-semibold text-right text-on-surface">0-48 ч.</span>
                        </div>
                        <div class="flex items-center justify-between border-t border-outline-variant/5 pt-2">
                            <div class="flex items-center gap-2 opacity-80">
                                <span class="material-symbols-outlined text-base text-primary/70">credit_card</span>
                                <span>Оплата</span>
                            </div>
                            <span class="font-semibold text-right text-on-surface">Наличными, Безналичным</span>
                        </div>
                    </div>

                    <div class="space-y-2 mt-4 text-[10px]">
                        <div class="bg-surface-container-low border border-outline-variant/10 p-3 rounded-xl text-on-surface-variant/80 font-medium leading-relaxed">
                            Внимание! Перед оплатой по безналичному / наличному счету цены уточняйте у менеджеров!
                        </div>
                        <div class="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl font-medium leading-relaxed">
                            Цена не является публичной офертой.
                        </div>
                    </div>
                </div>
            \`;

            // Add Volhonka Calculator Handlers
            let selectedPrice = p.priceTon;

            const updateVolhonkaSum = () => {
                const inputQty = document.getElementById('input-qty');
                const displayTotal = document.getElementById('display-total-price');
                if (!inputQty || !displayTotal) return;
                
                let qty = parseFloat(inputQty.value) || 1;
                if (qty < 1) {
                    qty = 1;
                    inputQty.value = '1';
                }
                
                const totalSum = Math.round(qty * selectedPrice);
                displayTotal.textContent = \`= \${totalSum.toLocaleString('ru-RU')} ₽\`;
            };

            const radios = container.querySelectorAll('input[name="price-type"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    radios.forEach(r => {
                        const lbl = r.closest('label');
                        if (lbl) {
                            lbl.className = "flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt";
                        }
                    });
                    
                    const activeLabel = e.target.closest('label');
                    if (activeLabel) {
                        activeLabel.className = "flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt";
                    }
                    
                    const val = e.target.value;
                    if (val === 'whip') selectedPrice = priceWhip;
                    else if (val === 'meter') selectedPrice = priceMeter;
                    else selectedPrice = p.priceTon;
                    
                    updateVolhonkaSum();
                });
            });

            const btnMinus = container.querySelector('#btn-qty-minus');
            const btnPlus = container.querySelector('#btn-qty-plus');
            const inputQty = container.querySelector('#input-qty');

            if (btnMinus && btnPlus && inputQty) {
                btnMinus.onclick = () => {
                    let val = parseInt(inputQty.value) || 1;
                    if (val > 1) {
                        inputQty.value = val - 1;
                        updateVolhonkaSum();
                    }
                };
                btnPlus.onclick = () => {
                    let val = parseInt(inputQty.value) || 1;
                    inputQty.value = val + 1;
                    updateVolhonkaSum();
                };
                inputQty.oninput = () => {
                    updateVolhonkaSum();
                };
            }

            // Add to Cart
            const btnAddToCart = container.querySelector('#btn-add-to-cart-volhonka');
            if (btnAddToCart) {
                btnAddToCart.onclick = () => {
                    const qty = parseInt(inputQty.value) || 1;
                    if (window.addToCartGlobal) {
                        window.addToCartGlobal(p.id, qty);
                    }
                    
                    const oldText = btnAddToCart.innerHTML;
                    btnAddToCart.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Добавлено!';
                    btnAddToCart.style.backgroundColor = '#10B981';
                    btnAddToCart.style.color = '#FFFFFF';
                    setTimeout(() => {
                        btnAddToCart.innerHTML = oldText;
                        btnAddToCart.style.backgroundColor = '#ca7093';
                        btnAddToCart.style.color = '#FFFFFF';
                    }, 2000);
                };
            }

            // One-click Order
            const btnOneClick = container.querySelector('#btn-one-click-volhonka');
            if (btnOneClick) {
                btnOneClick.onclick = () => {
                    const tel = prompt('Введите ваш телефон для заказа в 1 клик:');
                    if (tel) {
                        alert('Спасибо! Наш менеджер свяжется с вами по номеру ' + tel + ' в течение 10 минут для подтверждения заказа.');
                    }
                };
            }

            initTabFromHash();
        }
`;

const lines = content.split('\\n');
let startIndex = -1;
let endIndex = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// Normalize specs to array')) {
        startIndex = i;
    }
    if (lines[i].includes('function updateTotal() {')) {
        endIndex = i - 1;
        break;
    }
}

if (startIndex !== -1 && endIndex !== -1) {
    const before = lines.slice(0, startIndex).join('\\n');
    const after = lines.slice(endIndex).join('\\n');
    fs.writeFileSync(targetFile, before + '\\n' + newRenderLogic + '\\n' + after);
    console.log('Successfully replaced logic in product.html');
} else {
    console.error('Could not find start/end bounds in product.html', startIndex, endIndex);
}
