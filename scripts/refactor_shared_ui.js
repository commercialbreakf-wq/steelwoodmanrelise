const fs = require('fs');
const path = require('path');

const newFunction = `
window.openProductCardModal = async function(productId) {
    if (!productId) return;
    
    let overlay = document.getElementById('product-card-modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'product-card-modal-overlay';
        overlay.className = 'fixed inset-0 z-[7000] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-auto';
        overlay.innerHTML = \`
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" id="product-card-modal-backdrop"></div>
            <div class="relative w-full max-w-2xl bg-surface-container border border-outline/20 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col transform scale-95 transition-transform duration-300 min-h-0 text-on-surface p-6 md:p-8">
                <button id="close-product-card-modal" class="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-all text-on-surface-variant hover:text-primary hover:scale-110 active:scale-90 z-20" title="Закрыть">
                    <span class="material-symbols-outlined text-xl">close</span>
                </button>
                <div class="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant opacity-50">
                    <span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
                    <span class="font-label-caps text-xs uppercase tracking-widest mt-2">Загрузка карточки товара...</span>
                </div>
            </div>
        \`;
        document.body.appendChild(overlay);
    }
    
    if (typeof window.lockScrollGlobal === 'function') window.lockScrollGlobal();
    
    requestAnimationFrame(() => {
        overlay.classList.remove('opacity-0');
        overlay.querySelector('div.relative').classList.remove('scale-95');
    });

    const close = () => {
        overlay.classList.add('opacity-0');
        overlay.querySelector('div.relative').classList.add('scale-95');
        setTimeout(() => {
            overlay.remove();
            if (typeof window.unlockScrollGlobal === 'function') window.unlockScrollGlobal();
        }, 300);
    };

    overlay.querySelector('#close-product-card-modal').onclick = close;
    overlay.querySelector('#product-card-modal-backdrop').onclick = close;

    try {
        const res = await fetch(\`/api/products/\${productId}\`);
        if (!res.ok) throw new Error('Товар не найден в базе данных');
        let p = await res.json();

        if (window.parseUniversalSpecs) {
            p = window.parseUniversalSpecs(p);
        }

        const name = p.name || '';
        const category = p.category || p.parent_category || 'Металлопрокат';
        const description = p.description || p.desc || 'Описание для данного товара временно отсутствует.';
        const vstatus = p.vstatus || 'active';
        const rawImage = p.image || p.img || '';
        const images = rawImage ? rawImage.split(',') : [''];
        const mainImage = images[0] || '';
        const specs = p.specs || [];

        const isGost = description.toLowerCase().includes('гост');
        const isSteelGrade = specs.find(s => s[0] && (s[0].toLowerCase().includes('стали') || s[0].toLowerCase().includes('марка')))?.[1];

        let galleryHtml = '';
        if (images.length > 1) {
            galleryHtml = \`
            <div class="flex gap-2 mt-3 overflow-x-auto custom-scrollbar pb-2">
                \${images.map((img, i) => \`
                    <div class="w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 \${i === 0 ? 'border-primary' : 'border-transparent'} cursor-pointer hover:border-primary/50 transition-all" onclick="document.getElementById('main-modal-image-\${p.id}').src='\${img}'; Array.from(this.parentElement.children).forEach(c => c.classList.replace('border-primary', 'border-transparent')); this.classList.replace('border-transparent', 'border-primary');">
                        <img src="\${img}" class="w-full h-full object-cover" alt="Миниатюра"/>
                    </div>
                \`).join('')}
            </div>\`;
        }

        let lengthVal = p.mLenVal || 6;
        let weightVal = p.wUnitVal || 1;
        let areaVal = p.m2Val || 1;
        
        let priceTon = parseFloat(p.price_ton || p.priceTonNum || 0);
        let priceUnitInput = parseFloat(p.price_unit || p.priceUnitNum || 0);
        
        let priceWhip = priceUnitInput > 0 ? priceUnitInput : 0;
        if (priceWhip === 0 && priceTon > 0) {
            priceWhip = Math.round((priceTon / 1000) * weightVal * (p.calcType === 'linear' ? lengthVal : 1));
        }
        
        let priceMeter = 0;
        if (p.calcType === 'linear') {
            priceMeter = priceWhip > 0 ? Math.round(priceWhip / lengthVal) : 0;
            if (priceMeter === 0 && priceTon > 0) {
                priceMeter = Math.round((priceTon / 1000) * weightVal);
            }
        } else if (p.calcType === 'area') {
            priceMeter = priceWhip > 0 ? Math.round(priceWhip / areaVal) : 0;
            if (priceMeter === 0 && priceTon > 0) {
                priceMeter = Math.round((priceTon / 1000) * (weightVal / areaVal));
            }
        }

        const priceTonFmt = priceTon > 0 ? priceTon.toLocaleString('ru-RU') : 'По запросу';
        const priceWhipFmt = priceWhip > 0 ? priceWhip.toLocaleString('ru-RU') : 'По запросу';
        const priceMeterFmt = priceMeter > 0 ? priceMeter.toLocaleString('ru-RU') : 'По запросу';

        const opt1Label = p.calcType === 'area' ? 'Цена за лист' : (p.isSheet ? 'Цена за штуку' : 'Цена за хлыст');
        const opt2Label = p.calcType === 'area' ? 'Цена за м2' : 'Цена за метр';

        const purchaseBlockHtml = \`
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
                    <label class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="whip" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">\${opt1Label}</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">\${priceWhipFmt} ₽</span>
                    </label>
                    <label class="flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="meter" class="w-4 h-4 text-primary bg-transparent border-outline-variant/30 focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface-variant group-hover/opt:text-on-surface transition-colors">\${opt2Label}</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">\${priceMeterFmt} ₽</span>
                    </label>
                    <label class="flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt">
                        <div class="flex items-center gap-3">
                            <input type="radio" name="price-type" value="ton" checked class="w-4 h-4 text-primary bg-transparent border-primary focus:ring-0 cursor-pointer" />
                            <span class="text-xs md:text-sm font-semibold text-on-surface group-hover/opt:text-on-surface transition-colors">Цена за тонну</span>
                        </div>
                        <span class="text-sm md:text-base font-bold text-on-surface">\${priceTonFmt} ₽</span>
                    </label>
                </div>

                <div class="flex items-center justify-between mt-5 bg-surface-container-lowest border border-outline-variant/5 p-4 rounded-2xl shadow-inner">
                    <div class="flex items-center bg-surface-container border border-outline-variant/10 h-10 rounded-xl overflow-hidden shadow-sm">
                        <button id="btn-qty-minus-modal" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">-</button>
                        <input id="input-qty-modal" type="text" class="w-12 bg-transparent border-none text-center font-bold text-on-surface outline-none text-sm h-full" value="1" />
                        <button id="btn-qty-plus-modal" class="w-9 h-full hover:bg-primary/15 hover:text-primary text-on-surface transition-colors flex items-center justify-center font-bold text-base select-none border-none bg-transparent cursor-pointer">+</button>
                    </div>
                    <div class="text-right">
                        <div class="text-[9px] uppercase font-bold tracking-widest text-on-surface-variant/50 font-label-caps mb-0.5">Итоговая стоимость</div>
                        <span class="text-base md:text-lg font-bold text-primary font-display-xl" id="display-total-price-modal">= \${priceTonFmt} ₽</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-2 pt-2">
                    <button id="btn-add-to-cart-modal" class="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold tracking-wider rounded-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 text-[11px] uppercase shadow-md font-label-caps border-none cursor-pointer">
                        <span class="material-symbols-outlined text-lg">shopping_cart</span> В корзину
                    </button>
                    <button id="btn-one-click-modal" class="w-full text-center text-[10px] font-bold text-primary hover:underline transition-all py-1.5 uppercase tracking-widest font-label-caps bg-transparent border-none cursor-pointer">
                        Купить в 1 клик
                    </button>
                </div>
            </div>
        \`;

        const modalContent = overlay.querySelector('div.relative');
        modalContent.innerHTML = \`
            <button id="close-product-card-modal" class="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-all text-on-surface-variant hover:text-primary hover:scale-110 active:scale-90 z-20" title="Закрыть">
                <span class="material-symbols-outlined text-xl">close</span>
            </button>

            <div class="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4 max-h-[75vh] overflow-y-auto custom-scrollbar pr-2 pb-6">
                <div class="space-y-5">
                    <div class="aspect-[4/3] w-full overflow-hidden border border-outline-variant/10 bg-surface-container-low shadow-md rounded-2xl relative group">
                        <img id="main-modal-image-\${p.id}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="\${mainImage}" alt="\${name}"/>
                        <div class="absolute top-3 left-3 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 border border-outline-variant/20 rounded-lg flex gap-2 shadow-sm">
                            \${isGost ? \`<span class="font-label-caps text-[9px] text-primary tracking-[0.2em] font-bold">ГОСТ</span>\` : ''}
                            \${isSteelGrade ? \`<span class="font-label-caps text-[9px] text-on-surface tracking-[0.2em] font-bold">\${isSteelGrade}</span>\` : ''}
                        </div>
                    </div>
                    \${galleryHtml}
                    
                    <div class="bg-surface-container-low/40 p-4 rounded-2xl border border-outline/5 space-y-2">
                        <span class="text-[9px] uppercase tracking-widest text-on-surface-variant/60 font-bold font-label-caps block">Доступность</span>
                        <div class="flex items-center gap-2">
                            \${vstatus === 'active' 
                                ? \`<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl font-label-caps"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> В наличии</span>\`
                                : \`<span class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-xl font-label-caps"><span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> Нет в наличии</span>\`
                            }
                        </div>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <span class="text-[10px] text-primary uppercase font-label-caps tracking-widest font-bold block">\${category.toUpperCase()}</span>
                        <h3 class="font-display-xl text-xl md:text-2xl font-bold uppercase tracking-tight text-on-surface mt-2 leading-snug">\${name}</h3>
                        <div class="text-[10px] text-on-surface-variant opacity-40 font-mono mt-1">ID: \${productId}</div>
                    </div>

                    \${purchaseBlockHtml}
                </div>

                <div class="col-span-full mt-6 border-t border-outline-variant/10 pt-6">
                     <div class="flex border-b border-outline-variant/10 overflow-x-auto scroll-hide pb-0.5">
                         <button id="modal-tab-specs" class="px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-all bg-transparent cursor-pointer font-label-caps border-none">Характеристики</button>
                         <button id="modal-tab-desc" class="px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all bg-transparent cursor-pointer font-label-caps border-none">Описание</button>
                     </div>
                     <div id="modal-tab-content" class="py-5 text-on-surface-variant leading-relaxed text-xs md:text-sm font-body-md">
                     </div>
                </div>
            </div>
        \`;

        window.closeProductCardModal = close;

        const tabContentDesc = description.replace(/\\n/g, '<br>');
        const tabContentSpecs = specs.length > 0 ? \`
            <div class="border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden max-w-4xl shadow-sm bg-white dark:bg-[#1e1c1a]">
                <table class="w-full text-left border-collapse">
                    <tbody>
                        \${specs.map(([l, v], idx) => \`
                            <tr class="\${idx % 2 === 0 ? 'bg-[#fbf9f7] dark:bg-[#1e1c1a]' : 'bg-[#ffffff] dark:bg-[#151311]'} border-b border-black/5 dark:border-white/5 last:border-b-0">
                                <td class="px-5 py-3 text-xs font-bold text-[#1a1817]/60 dark:text-white/40 uppercase tracking-wider">\${l}</td>
                                <td class="px-5 py-3 text-xs font-bold text-[#1a1817] dark:text-white text-right">\${v}</td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            </div>\` : '<p>Характеристики для данного товара не указаны.</p>';

        const switchModalTab = (tabName) => {
            ['specs', 'desc'].forEach(name => {
                const btn = overlay.querySelector(\`#modal-tab-\${name}\`);
                if (btn) {
                    if (name === tabName) {
                        btn.className = "px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-all bg-transparent cursor-pointer font-label-caps border-none";
                    } else {
                        btn.className = "px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 border-transparent text-on-surface-variant hover:text-on-surface transition-all bg-transparent cursor-pointer font-label-caps border-none";
                    }
                }
            });
            const contentDiv = overlay.querySelector('#modal-tab-content');
            if (contentDiv) {
                contentDiv.innerHTML = tabName === 'specs' ? tabContentSpecs : tabContentDesc;
            }
        };

        const contentDiv = overlay.querySelector('#modal-tab-content');
        if (contentDiv) contentDiv.innerHTML = tabContentSpecs;

        overlay.querySelector('#modal-tab-specs').onclick = () => switchModalTab('specs');
        overlay.querySelector('#modal-tab-desc').onclick = () => switchModalTab('desc');

        let selectedPrice = priceTon;
        const updateVolhonkaSum = () => {
            const inputQty = overlay.querySelector('#input-qty-modal');
            const displayTotal = overlay.querySelector('#display-total-price-modal');
            if (!inputQty || !displayTotal) return;
            
            let qty = parseFloat(inputQty.value) || 1;
            if (qty < 1) { qty = 1; inputQty.value = '1'; }
            
            const totalSum = Math.round(qty * selectedPrice);
            displayTotal.textContent = \`= \${totalSum.toLocaleString('ru-RU')} ₽\`;
        };

        const radios = overlay.querySelectorAll('input[name="price-type"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                radios.forEach(r => {
                    const label = r.closest('label');
                    if (label) label.className = "flex items-center justify-between p-3.5 border border-outline-variant/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all select-none group/opt";
                });
                const activeLabel = e.target.closest('label');
                if (activeLabel) activeLabel.className = "flex items-center justify-between p-3.5 border border-primary/40 bg-primary/5 rounded-2xl cursor-pointer transition-all select-none group/opt";
                
                const val = e.target.value;
                if (val === 'whip') selectedPrice = priceWhip;
                else if (val === 'meter') selectedPrice = priceMeter;
                else selectedPrice = priceTon;
                
                updateVolhonkaSum();
            });
        });

        const btnMinus = overlay.querySelector('#btn-qty-minus-modal');
        const btnPlus = overlay.querySelector('#btn-qty-plus-modal');
        const inputQty = overlay.querySelector('#input-qty-modal');

        if (btnMinus && btnPlus && inputQty) {
            btnMinus.onclick = () => { let val = parseInt(inputQty.value) || 1; if (val > 1) { inputQty.value = val - 1; updateVolhonkaSum(); } };
            btnPlus.onclick = () => { let val = parseInt(inputQty.value) || 1; inputQty.value = val + 1; updateVolhonkaSum(); };
            inputQty.oninput = updateVolhonkaSum;
        }

        const btnAddToCart = overlay.querySelector('#btn-add-to-cart-modal');
        if (btnAddToCart) {
            btnAddToCart.onclick = () => {
                const qty = parseInt(inputQty.value) || 1;
                if (window.addToCartGlobal) window.addToCartGlobal(p.id, qty);
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

        const btnOneClick = overlay.querySelector('#btn-one-click-modal');
        if (btnOneClick) {
            btnOneClick.onclick = () => {
                const tel = prompt('Введите ваш телефон для заказа в 1 клик:');
                if (tel) alert('Спасибо! Наш менеджер свяжется с вами по номеру ' + tel + ' в течение 10 минут для подтверждения заказа.');
            };
        }

        modalContent.querySelector('#close-product-card-modal').onclick = close;

    } catch(err) {
        alert("Извините, данный товар больше не существует. Для подробностей свяжитесь с нами.");
        const modalContent = overlay.querySelector('div.relative');
        modalContent.innerHTML = \`
            <button id="close-product-card-modal" class="absolute top-6 right-6 w-10 h-10 rounded-full hover:bg-surface-variant/40 flex items-center justify-center transition-colors text-on-surface-variant z-10">
                <span class="material-symbols-outlined">close</span>
            </button>
            <div class="flex flex-col items-center justify-center py-12 text-red-400 gap-4 text-center px-6">
                <span class="material-symbols-outlined text-4xl animate-bounce">error</span>
                <div class="text-sm font-medium">Извините, данный товар больше не существует.</div>
                <div class="text-xs opacity-60">Для подробностей свяжитесь с нами.</div>
            </div>
        \`;
        modalContent.querySelector('#close-product-card-modal').onclick = close;
    }
};
`;

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const startString = 'window.openProductCardModal = async function(productId) {';
    const endString = '};\\n\\n// Cookie Banner Logic';
    
    let startIndex = content.indexOf(startString);
    if (startIndex === -1) {
        console.error('Cannot find start string in', filePath);
        return;
    }
    
    // We will look for // Cookie Banner Logic
    let cookieIndex = content.indexOf('// Cookie Banner Logic', startIndex);
    if (cookieIndex === -1) {
        // Fallback for copy js
        cookieIndex = content.length;
    }

    const before = content.substring(0, startIndex);
    const after = content.substring(cookieIndex);
    
    fs.writeFileSync(filePath, before + newFunction + '\\n\\n' + after);
    console.log('Replaced in ' + filePath);
}

replaceInFile(path.join(__dirname, '..', 'js', 'shared-ui.js'));
replaceInFile(path.join(__dirname, '..', 'js', 'shared-ui-copy.js'));
