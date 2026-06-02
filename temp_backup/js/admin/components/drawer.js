import { state } from '../state.js';

/**
 * Opens the product editor modal
 * @param {Object|null} product - The product to edit, or null for new product
 * @param {Function} onSave 
 */
export function openDrawer(product, onSave) {
    const isEdit = !!product;
    const data = product ? { ...product } : {
        name: '',
        parent_category: '',
        category: '',
        vid: '',
        length: '',
        width: '',
        type: '',
        price_ton: 0,
        price_unit: 0,
        unit_label: 'ЗА ТОННУ',
        weight: 1,
        description: '',
        image: '',
        specs: []
    };

    // Parse specs
    let specs = [];
    try {
        if (typeof data.specs === 'string') {
            specs = JSON.parse(data.specs);
        } else if (Array.isArray(data.specs)) {
            specs = [...data.specs];
        }
    } catch (e) {
        console.error('Error parsing specs:', e);
    }

    // Ensure database fields vid, width, length, type are present in specs for easy editing
    const existingKeys = specs.map(s => (s[0] || '').toLowerCase().trim());
    const addMissingSpec = (key, val) => {
        if (val && !existingKeys.some(k => k.includes(key.toLowerCase()))) {
            specs.push([key, val]);
            existingKeys.push(key.toLowerCase());
        }
    };

    addMissingSpec('Размер / Диаметр', data.vid);
    addMissingSpec('Толщина / Стенка', data.width);
    addMissingSpec('Длина / Формат', data.length);
    addMissingSpec('Марка / Стандарт', data.type);

    // Default unit and weight for new products
    if (!isEdit) {
        data.unit_label = 'ЗА ТОННУ';
        data.weight = 1;
        data.price_unit = data.price_ton;
    }

    let modalWrapper = document.getElementById('admin-modal-wrapper');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);
    }

    // Wizard state (4 steps for Create mode; Edit mode is single scrollable card)
    let currentStep = 1;
    const totalSteps = 4;

    // Get unique categories from state
    const l1Categories = [...new Set(state.products.map(p => p.parent_category).filter(Boolean))].sort();
    const getL2Categories = (l1) => {
        return [...new Set(state.products.filter(p => !l1 || p.parent_category === l1).map(p => p.category).filter(Boolean))].sort();
    };

    // Helper for category-based parameter suggestions (23met.ru taxonomy)
    const getCategorySuggestions = (parentCat, cat) => {
        const p = (parentCat || '').toLowerCase();
        const c = (cat || '').toLowerCase();

        if (p.includes('армат') || c.includes('армат')) {
            return ['Диаметр', 'Поверхность / Профиль', 'Длина хлыста', 'Класс / Стандарт'];
        } else if (p.includes('труб') && (c.includes('проф') || c.includes('квадр') || c.includes('прямоугол'))) {
            return ['Размер сечения', 'Толщина стенки', 'Длина трубы', 'Марка стали / ГОСТ'];
        } else if (p.includes('труб') || c.includes('труб')) {
            return ['Внешний диаметр / ДУ', 'Толщина стенки', 'Длина трубы', 'Стандарт / Марка стали'];
        } else if (p.includes('лист') || c.includes('лист')) {
            return ['Толщина листа', 'Раскрой (Ширина х Длина)', 'Формат / Длина', 'Тип листа / Стандарт'];
        } else if (p.includes('балк') || c.includes('балк') || c.includes('двутавр')) {
            return ['Номер / Профиль', 'Тип полок', 'Длина', 'Стандарт / Марка стали'];
        } else if (p.includes('швелл') || c.includes('швелл')) {
            return ['Номер швеллера', 'Тип граней полок', 'Длина', 'Стандарт / Марка стали'];
        } else if (p.includes('угол') || c.includes('угол')) {
            return ['Размер полок и толщина', 'Тип уголка', 'Длина', 'Марка стали'];
        } else if (p.includes('кровл') || c.includes('профн') || c.includes('череп')) {
            return ['Марка / Профиль', 'Толщина металла', 'Длина / Высота листа', 'Покрытие / Цвет'];
        } else {
            return ['Размер / Диаметр', 'Толщина / Стенка', 'Длина / Формат', 'Стандарт / Марка стали'];
        }
    };

    const renderStepHeader = () => {
        if (isEdit) return ''; // No steps in edit mode

        const stepsMeta = [
            { step: 1, title: 'Классификация', desc: 'Выберите категорию каталога и укажите базовое наименование', icon: 'category' },
            { step: 2, title: 'Цена и Фото', desc: 'Укажите стоимость за тонну и загрузите изображение товара', icon: 'payments' },
            { step: 3, title: 'Описание', desc: 'Добавьте подробное описание и особенности применения', icon: 'description' },
            { step: 4, title: 'Параметры', desc: 'Настройте характеристики товара и спецификации', icon: 'tune' }
        ];

        const currentMeta = stepsMeta[currentStep - 1];

        return `
            <!-- Premium Step Progress Bar (Create Mode Only) -->
            <div class="mb-8 bg-[#151311] p-4 lg:p-6 rounded-3xl border border-white/5 shadow-inner shrink-0">
                <div class="flex items-center justify-between max-w-3xl mx-auto relative z-10">
                    ${stepsMeta.map((item, idx) => `
                        <div class="flex flex-col items-center gap-2 group cursor-pointer step-direct-nav" data-step="${item.step}">
                            <div class="w-10 h-10 rounded-2xl flex items-center justify-center font-['Space Grotesk'] font-bold text-sm transition-all duration-300 ${currentStep === item.step ? 'bg-[#ffb0cc] text-[#0f0e0c] shadow-lg shadow-[#ffb0cc]/25 scale-110 ring-4 ring-[#ffb0cc]/20' : currentStep > item.step ? 'bg-[#ffb0cc]/20 text-[#ffb0cc] border border-[#ffb0cc]/30 hover:bg-[#ffb0cc]/30' : 'bg-white/5 text-[#d7c1c7] opacity-50 border border-white/10 hover:opacity-100' }">
                                ${currentStep > item.step ? '<span class="material-symbols-outlined text-base font-bold">check</span>' : item.step}
                            </div>
                            <span class="text-[11px] font-bold tracking-wider uppercase transition-colors hidden md:block ${currentStep === item.step ? 'text-[#ffb0cc]' : currentStep > item.step ? 'text-[#e7e2dd]' : 'text-[#d7c1c7] opacity-50'}">
                                ${item.title}
                            </span>
                        </div>
                        ${idx < stepsMeta.length - 1 ? `
                            <div class="flex-1 h-0.5 mx-2 lg:mx-4 rounded-full transition-colors duration-300 ${currentStep > item.step ? 'bg-[#ffb0cc]/40 shadow-[0_0_8px_rgba(255,176,204,0.4)]' : 'bg-white/10'}"></div>
                        ` : ''}
                    `).join('')}
                </div>
                
                <!-- Current Step Title & Subtitle -->
                <div class="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded-2xl bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] shrink-0 shadow-md">
                            <span class="material-symbols-outlined text-2xl">${currentMeta.icon}</span>
                        </div>
                        <div>
                            <h4 class="font-['Space Grotesk'] text-base font-bold text-[#e7e2dd] flex items-center gap-2">
                                Шаг ${currentMeta.step}. ${currentMeta.title}
                            </h4>
                            <p class="text-xs text-[#d7c1c7] opacity-70 mt-0.5">${currentMeta.desc}</p>
                        </div>
                    </div>
                    <div class="text-xs font-['Space Grotesk'] font-bold text-[#ffb0cc] uppercase tracking-widest px-4 py-2 rounded-xl bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 self-start sm:self-center shrink-0">
                        Шаг ${currentStep} из ${totalSteps}
                    </div>
                </div>
            </div>
        `;
    };

    const renderLivePreview = () => `
        <div class="bg-[#151311] border border-white/5 rounded-3xl p-6 flex flex-col gap-4 sticky top-6 shadow-xl h-fit">
            <div class="text-[10px] font-['Space Grotesk'] text-[#ffb0cc] uppercase tracking-widest font-bold pb-3 border-b border-white/5 flex items-center justify-between">
                <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-sm">preview</span> Предпросмотр карточки</span>
                <span class="px-2.5 py-0.5 rounded-full bg-white/5 text-[#d7c1c7] text-[9px] normal-case font-sans opacity-80" id="live-preview-category">${data.parent_category || 'Категория'} / ${data.category || 'Подкатегория'}</span>
            </div>
            <div class="relative w-full pt-[65%] bg-[#1d1b19] rounded-2xl overflow-hidden border border-white/5 group flex items-center justify-center shadow-inner">
                <img id="live-preview-img" src="${data.image || 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'}" class="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105" alt="Preview">
                <div class="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#0f0e0c]/80 backdrop-blur-md border border-white/10 text-[10px] font-bold text-[#ffb0cc] uppercase tracking-wider" id="live-preview-status">
                    ${data.vstatus === 'archived' ? 'АРХИВ' : 'В НАЛИЧИИ'}
                </div>
            </div>
            <div class="space-y-2 pt-2">
                <h5 class="font-['Space Grotesk'] font-bold text-base text-[#e7e2dd] line-clamp-2 leading-snug" id="live-preview-name">
                    ${data.name || 'Наименование товара...'}
                </h5>
                <div class="flex items-baseline gap-1.5 pt-1">
                    <span class="text-xl font-bold text-[#ffb0cc] font-['Space Grotesk']" id="live-preview-price">
                        ${Number(data.price_ton || 0).toLocaleString('ru-RU')} ₽
                    </span>
                    <span class="text-xs text-[#d7c1c7] font-bold opacity-60 uppercase tracking-wider" id="live-preview-unit">
                        / ЗА ТОННУ
                    </span>
                </div>
            </div>
        </div>
    `;

    const renderClassificationSection = () => `
        <div class="p-6 rounded-3xl bg-[#151311]/50 border border-white/5 space-y-6 shadow-sm">
            <h4 class="text-xs uppercase tracking-widest text-[#ffb0cc] font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-base">account_tree</span>
                Иерархия каталога
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Категория (L1)</label>
                    <div class="flex flex-col gap-2">
                        <select style="color-scheme: dark;" id="l1-select" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner">
                            <option value="">-- Выберите категорию --</option>
                            ${l1Categories.map(cat => `<option value="${cat}" ${data.parent_category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            <option value="_new_" ${!l1Categories.includes(data.parent_category) && data.parent_category ? 'selected' : ''}>➕ Создать новую категорию...</option>
                        </select>
                        <input type="text" id="l1-custom" name="parent_category" value="${data.parent_category || ''}" placeholder="Название новой категории" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner ${l1Categories.includes(data.parent_category) || !data.parent_category ? 'hidden' : ''}">
                    </div>
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Подкатегория (L2)</label>
                    <div class="flex flex-col gap-2">
                        <select style="color-scheme: dark;" id="l2-select" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner">
                            <option value="">-- Выберите подкатегорию --</option>
                            ${getL2Categories(data.parent_category).map(cat => `<option value="${cat}" ${data.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            <option value="_new_" ${!getL2Categories(data.parent_category).includes(data.category) && data.category ? 'selected' : ''}>➕ Создать новую подкатегорию...</option>
                        </select>
                        <input type="text" id="l2-custom" name="category" value="${data.category || ''}" placeholder="Название новой подкатегории" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner ${getL2Categories(data.parent_category).includes(data.category) || !data.category ? 'hidden' : ''}">
                    </div>
                </div>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Наименование товара (L3)</label>
                <input type="text" id="product-name-input" name="name" value="${data.name || ''}" placeholder="напр. Арматура А1 6 м" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner">
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 p-6 rounded-3xl bg-[#151311]/50 border border-white/5 shadow-sm">
                <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Идентификатор (ID/SKU)</label>
                <input type="text" id="product-id-input" name="id" value="${data.id || ''}" ${isEdit ? 'readonly' : ''} placeholder="напр. iron-rebar-a1 (автозаполнение)" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-mono text-[#e7e2dd] shadow-inner ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}">
                ${!isEdit ? `<p class="text-[10px] text-[#d7c1c7] opacity-60 mt-1">Оставьте пустым для автогенерации из названия</p>` : ''}
            </div>
            <div class="space-y-2 p-6 rounded-3xl bg-[#151311]/50 border border-white/5 shadow-sm">
                <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Статус в каталоге</label>
                <select style="color-scheme: dark;" name="vstatus" id="product-status-select" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-sm font-bold text-[#e7e2dd] shadow-inner">
                    <option value="active" ${data.vstatus !== 'archived' ? 'selected' : ''}>АКТИВЕН (В наличии)</option>
                    <option value="archived" ${data.vstatus === 'archived' ? 'selected' : ''}>АРХИВ (Нет в наличии)</option>
                </select>
            </div>
        </div>
    `;

    const renderPricingAndPhotoSection = () => `
        <div class="p-6 rounded-3xl bg-[#151311]/50 border border-white/5 space-y-6 shadow-sm">
            <h4 class="text-xs uppercase tracking-widest text-[#ffb0cc] font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-base">payments</span>
                Цена товара
            </h4>
            <div class="space-y-2 max-w-md">
                <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Цена за тонну, ₽</label>
                <input type="number" id="price-ton-input" name="price_ton" value="${data.price_ton || 0}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-lg text-[#ffb0cc] font-bold shadow-inner">
            </div>
        </div>

        <div class="p-6 rounded-3xl bg-[#151311]/50 border border-white/5 space-y-6 shadow-sm">
            <h4 class="text-xs uppercase tracking-widest text-[#ffb0cc] font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-base">image</span>
                Изображение товара
            </h4>

            <div id="image-dropzone" class="border-2 border-dashed border-[#534347]/60 hover:border-[#ffb0cc] rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-[#151311]/50 cursor-pointer transition-all group relative overflow-hidden min-h-[280px] shadow-inner">
                <input type="file" id="image-file-input" accept="image/*" class="hidden">
                <div id="dropzone-placeholder" class="flex flex-col items-center gap-4 ${data.image ? 'hidden' : ''}">
                    <div class="w-16 h-16 rounded-2xl bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] group-hover:scale-110 group-hover:bg-[#ffb0cc]/20 transition-all shadow-md">
                        <span class="material-symbols-outlined text-3xl">cloud_upload</span>
                    </div>
                    <div>
                        <span class="text-sm font-bold text-[#e7e2dd]">Перетащите изображение сюда</span>
                        <p class="text-xs text-[#d7c1c7] opacity-60 mt-1">или нажмите для выбора файла на компьютере</p>
                    </div>
                    <div class="flex items-center gap-2 mt-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-[#ffb0cc] font-bold uppercase tracking-widest shadow-md">
                        <span class="material-symbols-outlined text-sm">content_paste</span>
                        Поддерживается быстрая вставка (Ctrl + V / Cmd + V)
                    </div>
                </div>
                <div id="dropzone-preview" class="flex flex-col items-center gap-6 w-full ${!data.image ? 'hidden' : ''}">
                    <img id="preview-img-element" src="${data.image || ''}" class="max-h-[220px] w-auto object-contain rounded-2xl border border-white/10 shadow-2xl bg-[#151311] p-2" alt="Preview">
                    <div class="flex gap-3 z-10">
                        <button type="button" id="change-img-btn" class="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#e7e2dd] text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border border-white/10">
                            <span class="material-symbols-outlined text-sm">edit</span> Изменить
                        </button>
                        <button type="button" id="remove-img-btn" class="px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md border border-red-500/20">
                            <span class="material-symbols-outlined text-sm">delete</span> Удалить
                        </button>
                    </div>
                </div>
            </div>

            <div class="space-y-2 pt-2 border-t border-white/5">
                <label class="text-[10px] uppercase opacity-60 text-[#d7c1c7] font-bold">Или укажите прямую ссылку (URL) на изображение</label>
                <input type="text" id="drawer-image-url" name="image" value="${data.image || ''}" placeholder="https://example.com/image.jpg" class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all text-xs text-[#e7e2dd] shadow-inner">
            </div>
        </div>
    `;

    const renderDescriptionSection = () => `
        <div class="p-6 rounded-3xl bg-[#151311]/50 border border-white/5 space-y-6 shadow-sm">
            <h4 class="text-xs uppercase tracking-widest text-[#ffb0cc] font-bold flex items-center gap-2">
                <span class="material-symbols-outlined text-base">description</span>
                Подробное описание товара
            </h4>
            <div class="space-y-2">
                <textarea id="product-desc-input" name="description" rows="6" placeholder="Введите описание, особенности применения, соответствие стандартам..." class="w-full bg-[#151311] border border-[#534347]/30 rounded-2xl px-4 py-3.5 focus:border-[#ffb0cc] outline-none transition-all resize-none text-sm text-[#e7e2dd] shadow-inner">${data.description || ''}</textarea>
            </div>
        </div>
    `;

    const renderParametersSection = () => {
        const suggestions = getCategorySuggestions(data.parent_category, data.category);
        return `
            <div class="p-6 rounded-3xl bg-[#151311]/50 border border-white/5 space-y-6 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                    <div>
                        <h4 class="text-xs uppercase tracking-widest text-[#ffb0cc] font-bold flex items-center gap-2">
                            <span class="material-symbols-outlined text-base">tune</span>
                            Вкладка: Параметры и Характеристики
                        </h4>
                        <p class="text-xs text-[#d7c1c7] opacity-70 mt-1">Управляйте списком параметров товара. Ненужные строки можно удалить.</p>
                    </div>
                    <button type="button" id="add-spec-row" class="px-5 py-2.5 rounded-xl bg-[#ffb0cc]/10 hover:bg-[#ffb0cc]/20 border border-[#ffb0cc]/30 text-xs font-bold text-[#ffb0cc] transition-all flex items-center gap-1.5 shadow-md shrink-0">
                        <span class="material-symbols-outlined text-sm">add</span> Добавить параметр
                    </button>
                </div>

                <!-- Category Suggestions Bar -->
                <div class="bg-[#1d1b19] p-4 rounded-2xl border border-white/5 space-y-3 shadow-inner">
                    <div class="text-[10px] font-bold uppercase tracking-widest text-[#d7c1c7] opacity-60 flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm text-[#ffb0cc]">lightbulb</span>
                        Быстрое добавление параметров для текущей категории:
                    </div>
                    <div class="flex flex-wrap gap-2" id="category-suggestions-container">
                        ${suggestions.map(s => `
                            <button type="button" class="suggestion-add-btn px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#e7e2dd] font-bold transition-all flex items-center gap-1 shadow-sm" data-key="${s}">
                                <span class="material-symbols-outlined text-[10px] text-[#ffb0cc]">add</span> ${s}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- Specs List Container -->
                <div id="specs-container" class="space-y-2.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                    ${specs.map((spec) => `
                        <div class="flex gap-2 spec-row items-center bg-[#151311] p-2.5 rounded-2xl border border-white/5 shadow-inner">
                            <input type="text" placeholder="Название (напр. Покрытие)" value="${spec[0] || ''}" class="spec-key flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd] font-bold border-r border-white/10">
                            <input type="text" placeholder="Значение (напр. Оцинкованное)" value="${spec[1] || ''}" class="spec-value flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd]">
                            <button type="button" class="remove-spec text-red-400/60 hover:text-red-400 transition-colors p-2" title="Удалить параметр">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    `).join('')}
                </div>

                <!-- Collapsible Raw JSON Block -->
                <div class="pt-4 border-t border-white/5">
                    <details class="group">
                        <summary class="cursor-pointer list-none flex items-center justify-between p-4 rounded-2xl bg-[#1d1b19] border border-white/5 hover:border-white/10 transition-all shadow-sm">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm text-[#ffb0cc]">code</span>
                                <span class="text-xs font-bold text-[#e7e2dd]">📁 Дополнительные характеристики (Прямое редактирование JSON)</span>
                            </div>
                            <span class="material-symbols-outlined text-sm text-[#d7c1c7] opacity-60 group-open:rotate-180 transition-transform duration-300">expand_more</span>
                        </summary>
                        <div class="mt-3 p-4 rounded-2xl bg-[#151311] border border-white/5 shadow-inner space-y-2">
                            <p class="text-[10px] text-[#d7c1c7] opacity-60">Прямой доступ к массиву пар ключ-значение. Изменения здесь автоматически синхронизируются со списком выше.</p>
                            <textarea id="raw-json-textarea" rows="5" class="w-full bg-[#1d1b19] border border-[#534347]/30 rounded-xl p-3 font-mono text-xs text-[#ffb0cc] focus:border-[#ffb0cc] outline-none transition-all shadow-inner resize-none">${JSON.stringify(specs, null, 2)}</textarea>
                        </div>
                    </details>
                </div>
            </div>
        `;
    };

    const renderFormFields = () => {
        if (isEdit) {
            // Edit Mode: Single scrollable card with all sections
            return `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
                    <div class="lg:col-span-2 space-y-8">
                        ${renderClassificationSection()}
                        ${renderPricingAndPhotoSection()}
                        ${renderDescriptionSection()}
                        ${renderParametersSection()}
                    </div>
                    <div class="lg:col-span-1">
                        ${renderLivePreview()}
                    </div>
                </div>

                <!-- Footer Actions -->
                <div id="modal-footer" class="mt-8 pt-6 border-t border-[#534347]/20 flex justify-end gap-4 bg-[#1d1b19] shrink-0 relative z-10">
                    <button type="button" id="cancel-edit" class="px-7 py-3.5 rounded-2xl border border-[#534347]/30 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest text-[#d7c1c7] shadow-sm">Отмена</button>
                    <button type="button" id="save-product" class="px-7 py-3.5 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#ffb0cc]/20">Сохранить товар</button>
                </div>
            `;
        } else {
            // Create Mode: 4-step wizard
            return `
                ${renderStepHeader()}

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-2">
                    <div class="lg:col-span-2 space-y-6">
                        <div id="step-1-container" class="${currentStep !== 1 ? 'hidden' : ''}">
                            ${renderClassificationSection()}
                        </div>
                        <div id="step-2-container" class="space-y-6 ${currentStep !== 2 ? 'hidden' : ''}">
                            ${renderPricingAndPhotoSection()}
                        </div>
                        <div id="step-3-container" class="${currentStep !== 3 ? 'hidden' : ''}">
                            ${renderDescriptionSection()}
                        </div>
                        <div id="step-4-container" class="${currentStep !== 4 ? 'hidden' : ''}">
                            ${renderParametersSection()}
                        </div>
                    </div>
                    <div class="lg:col-span-1">
                        ${renderLivePreview()}
                    </div>
                </div>

                <!-- Footer Actions -->
                <div id="modal-footer" class="mt-8 pt-6 border-t border-[#534347]/20 flex justify-end gap-4 bg-[#1d1b19] shrink-0 relative z-10">
                    ${currentStep > 1 ? `
                        <button type="button" id="prev-step" class="px-7 py-3.5 rounded-2xl border border-[#534347]/30 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest text-[#d7c1c7] shadow-sm">Назад</button>
                    ` : `
                        <button type="button" id="cancel-edit" class="px-7 py-3.5 rounded-2xl border border-[#534347]/30 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-widest text-[#d7c1c7] shadow-sm">Отмена</button>
                    `}
                    
                    ${currentStep < totalSteps ? `
                        <button type="button" id="next-step" class="px-7 py-3.5 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#ffb0cc]/20">Далее</button>
                    ` : `
                        <button type="button" id="save-product" class="px-7 py-3.5 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-[11px] font-bold uppercase tracking-widest shadow-lg shadow-[#ffb0cc]/20">Создать товар</button>
                    `}
                </div>
            `;
        }
    };

    const updateLivePreview = () => {
        const nameEl = modalWrapper.querySelector('#live-preview-name');
        const priceEl = modalWrapper.querySelector('#live-preview-price');
        const imgEl = modalWrapper.querySelector('#live-preview-img');
        const catEl = modalWrapper.querySelector('#live-preview-category');
        const statusEl = modalWrapper.querySelector('#live-preview-status');

        if (nameEl) nameEl.textContent = data.name || 'Наименование товара...';
        if (priceEl) priceEl.textContent = `${Number(data.price_ton || 0).toLocaleString('ru-RU')} ₽`;
        if (imgEl) imgEl.src = data.image || 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
        if (catEl) catEl.textContent = `${data.parent_category || 'Категория'} / ${data.category || 'Подкатегория'}`;
        if (statusEl) {
            statusEl.textContent = data.vstatus === 'archived' ? 'АРХИВ' : 'В НАЛИЧИИ';
            statusEl.className = `absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#0f0e0c]/80 backdrop-blur-md border text-[10px] font-bold uppercase tracking-wider ${data.vstatus === 'archived' ? 'border-red-500/30 text-red-400' : 'border-white/10 text-[#ffb0cc]'}`;
        }
    };

    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const urlInput = modalWrapper.querySelector('#drawer-image-url');
                        const previewImg = modalWrapper.querySelector('#preview-img-element');
                        const dropzonePlaceholder = modalWrapper.querySelector('#dropzone-placeholder');
                        const dropzonePreview = modalWrapper.querySelector('#dropzone-preview');
                        data.image = reader.result;
                        if (urlInput) urlInput.value = reader.result;
                        if (previewImg) previewImg.src = reader.result;
                        if (dropzonePlaceholder && dropzonePreview) {
                            dropzonePlaceholder.classList.add('hidden');
                            dropzonePreview.classList.remove('hidden');
                        }
                        updateLivePreview();
                    };
                    reader.readAsDataURL(file);
                    break;
                }
            }
        }
    };
    document.addEventListener('paste', handlePaste);

    const close = () => {
        document.removeEventListener('paste', handlePaste);
        modalWrapper.classList.add('opacity-0');
        const content = modalWrapper.querySelector('#modal-content');
        if (content) content.classList.add('scale-95');
        setTimeout(() => modalWrapper.remove(), 300);
    };

    const updateSpecsFromRows = () => {
        const specsContainer = modalWrapper.querySelector('#specs-container');
        const jsonTextarea = modalWrapper.querySelector('#raw-json-textarea');
        if (!specsContainer) return;

        const specRows = specsContainer.querySelectorAll('.spec-row');
        const specsData = Array.from(specRows).map(row => {
            const key = row.querySelector('.spec-key').value.trim();
            const val = row.querySelector('.spec-value').value.trim();
            return [key, val];
        }).filter(s => s[0] || s[1]);

        specs = specsData;
        data.specs = JSON.stringify(specsData);

        if (jsonTextarea && document.activeElement !== jsonTextarea) {
            jsonTextarea.value = JSON.stringify(specsData, null, 2);
        }
        updateLivePreview();
    };

    const updateRowsFromJson = () => {
        const jsonTextarea = modalWrapper.querySelector('#raw-json-textarea');
        const specsContainer = modalWrapper.querySelector('#specs-container');
        if (!jsonTextarea || !specsContainer) return;

        try {
            const parsed = JSON.parse(jsonTextarea.value);
            if (Array.isArray(parsed)) {
                specs = parsed;
                data.specs = JSON.stringify(parsed);
                
                // Re-render rows
                specsContainer.innerHTML = specs.map(spec => `
                    <div class="flex gap-2 spec-row items-center bg-[#151311] p-2.5 rounded-2xl border border-white/5 shadow-inner">
                        <input type="text" placeholder="Название (напр. Покрытие)" value="${spec[0] || ''}" class="spec-key flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd] font-bold border-r border-white/10">
                        <input type="text" placeholder="Значение (напр. Оцинкованное)" value="${spec[1] || ''}" class="spec-value flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd]">
                        <button type="button" class="remove-spec text-red-400/60 hover:text-red-400 transition-colors p-2" title="Удалить параметр">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                `).join('');
                
                bindSpecRowEvents();
                updateLivePreview();
            }
        } catch (e) {
            // Invalid JSON while typing, don't update rows yet
        }
    };

    const bindSpecRowEvents = () => {
        const specsContainer = modalWrapper.querySelector('#specs-container');
        if (!specsContainer) return;

        specsContainer.querySelectorAll('.remove-spec').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.spec-row').remove();
                updateSpecsFromRows();
            };
        });

        specsContainer.querySelectorAll('input').forEach(inp => {
            inp.oninput = updateSpecsFromRows;
        });
    };

    const updateDataFromForm = () => {
        const form = modalWrapper.querySelector('#edit-product-form');
        if (!form) return;
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (key !== 'parent_category' && key !== 'category' && key !== 'vstatus' && key !== 'description') {
                data[key] = value;
            }
        }
        
        // Grab explicit elements
        const l1Select = modalWrapper.querySelector('#l1-select');
        const l1Custom = modalWrapper.querySelector('#l1-custom');
        const l2Select = modalWrapper.querySelector('#l2-select');
        const l2Custom = modalWrapper.querySelector('#l2-custom');
        const statusSelect = modalWrapper.querySelector('#product-status-select');
        const descInput = modalWrapper.querySelector('#product-desc-input');
        const priceTonInput = modalWrapper.querySelector('#price-ton-input');

        if (l1Select && l1Select.value !== '_new_') data.parent_category = l1Select.value;
        else if (l1Custom) data.parent_category = l1Custom.value;

        if (l2Select && l2Select.value !== '_new_') data.category = l2Select.value;
        else if (l2Custom) data.category = l2Custom.value;

        if (statusSelect) data.vstatus = statusSelect.value;
        if (descInput) data.description = descInput.value;
        if (priceTonInput) {
            data.price_ton = parseFloat(priceTonInput.value) || 0;
            data.price_unit = data.price_ton; // Since unit weight is 1
        }

        updateSpecsFromRows();
    };

    const updateStepView = () => {
        const form = modalWrapper.querySelector('#edit-product-form');
        if (!form) return;
        
        form.innerHTML = renderFormFields();
        bindEvents();
        bindFooterEvents();
        updateLivePreview();
    };

    const bindFooterEvents = () => {
        const cancelBtn = modalWrapper.querySelector('#cancel-edit');
        if (cancelBtn) cancelBtn.onclick = close;

        const nextBtn = modalWrapper.querySelector('#next-step');
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                updateDataFromForm();
                currentStep++;
                updateStepView();
            };
        }

        const prevBtn = modalWrapper.querySelector('#prev-step');
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                updateDataFromForm();
                currentStep--;
                updateStepView();
            };
        }

        const saveBtn = modalWrapper.querySelector('#save-product');
        if (saveBtn) {
            saveBtn.onclick = async (e) => {
                e.preventDefault();
                updateDataFromForm();
                
                const result = { ...data };
                result.price_ton = Number(result.price_ton) || 0;
                result.price_unit = result.price_ton; // Unit weight is 1
                result.unit_label = 'ЗА ТОННУ';
                result.weight = 1;

                // Extract values for catalog filtering behind the scenes
                const specsMap = new Map();
                specs.forEach(([k, v]) => {
                    if (k && v) specsMap.set(k.toLowerCase().trim(), v.trim());
                });

                const findSpecValue = (keys) => {
                    for (let key of keys) {
                        for (let [k, v] of specsMap.entries()) {
                            if (k.includes(key)) return v;
                        }
                    }
                    return '';
                };

                result.vid = findSpecValue(['диаметр', 'размер', 'сечение', 'толщина листа', 'номер']) || result.vid || '';
                result.width = findSpecValue(['стенк', 'поверхност', 'раскрой', 'ширин', 'гране']) || result.width || '';
                result.length = findSpecValue(['длин', 'формат', 'хлыст']) || result.length || '';
                result.type = findSpecValue(['стандарт', 'класс', 'марк', 'гост', 'покрыти']) || result.type || '';

                const originalText = saveBtn.textContent;
                saveBtn.disabled = true;
                saveBtn.textContent = 'Сохранение...';

                try {
                    await onSave(result);
                    close();
                } catch (err) {
                    alert('Ошибка: ' + err.message);
                    saveBtn.disabled = false;
                    saveBtn.textContent = originalText;
                }
            };
        }
    };

    const bindEvents = () => {
        const closeModalBtn = modalWrapper.querySelector('#close-modal');
        const modalBackdrop = modalWrapper.querySelector('#modal-backdrop');
        if (closeModalBtn) closeModalBtn.onclick = close;
        if (modalBackdrop) modalBackdrop.onclick = close;

        modalWrapper.querySelectorAll('.step-direct-nav').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                updateDataFromForm();
                currentStep = parseInt(btn.dataset.step);
                updateStepView();
            };
        });

        const l1Select = modalWrapper.querySelector('#l1-select');
        const l1Custom = modalWrapper.querySelector('#l1-custom');
        const l2Select = modalWrapper.querySelector('#l2-select');
        const l2Custom = modalWrapper.querySelector('#l2-custom');

        if (l1Select && l1Custom) {
            l1Select.onchange = () => {
                if (l1Select.value === '_new_') {
                    l1Custom.classList.remove('hidden');
                    l1Custom.value = '';
                    l1Custom.focus();
                    data.parent_category = '';
                } else {
                    l1Custom.classList.add('hidden');
                    l1Custom.value = l1Select.value;
                    data.parent_category = l1Select.value;
                }
                updateDataFromForm();
                
                if (l2Select) {
                    const l2Cats = getL2Categories(data.parent_category);
                    if (!l2Cats.includes(data.category)) {
                        data.category = '';
                        if (l2Custom) {
                            l2Custom.value = '';
                            l2Custom.classList.add('hidden');
                        }
                    }
                    l2Select.innerHTML = `
                        <option value="">-- Выберите подкатегорию --</option>
                        ${l2Cats.map(cat => `<option value="${cat}" ${data.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                        <option value="_new_" ${!l2Cats.includes(data.category) && data.category ? 'selected' : ''}>➕ Создать новую подкатегорию...</option>
                    `;
                    if (l2Custom) {
                        if (l2Select.value === '_new_') {
                            l2Custom.classList.remove('hidden');
                        } else {
                            l2Custom.classList.add('hidden');
                            l2Custom.value = l2Select.value;
                            data.category = l2Select.value;
                        }
                    }
                }
                
                // Update suggestions bar
                const suggestionsContainer = modalWrapper.querySelector('#category-suggestions-container');
                if (suggestionsContainer) {
                    const suggestions = getCategorySuggestions(data.parent_category, data.category);
                    suggestionsContainer.innerHTML = suggestions.map(s => `
                        <button type="button" class="suggestion-add-btn px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#e7e2dd] font-bold transition-all flex items-center gap-1 shadow-sm" data-key="${s}">
                            <span class="material-symbols-outlined text-[10px] text-[#ffb0cc]">add</span> ${s}
                        </button>
                    `).join('');
                    bindSuggestionsEvents();
                }
                updateLivePreview();
            };
            l1Custom.oninput = () => {
                data.parent_category = l1Custom.value;
                updateLivePreview();
            };
        }

        if (l2Select && l2Custom) {
            l2Select.onchange = () => {
                if (l2Select.value === '_new_') {
                    l2Custom.classList.remove('hidden');
                    l2Custom.value = '';
                    l2Custom.focus();
                    data.category = '';
                } else {
                    l2Custom.classList.add('hidden');
                    l2Custom.value = l2Select.value;
                    data.category = l2Select.value;
                }
                updateDataFromForm();

                // Update suggestions bar
                const suggestionsContainer = modalWrapper.querySelector('#category-suggestions-container');
                if (suggestionsContainer) {
                    const suggestions = getCategorySuggestions(data.parent_category, data.category);
                    suggestionsContainer.innerHTML = suggestions.map(s => `
                        <button type="button" class="suggestion-add-btn px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-[#e7e2dd] font-bold transition-all flex items-center gap-1 shadow-sm" data-key="${s}">
                            <span class="material-symbols-outlined text-[10px] text-[#ffb0cc]">add</span> ${s}
                        </button>
                    `).join('');
                    bindSuggestionsEvents();
                }
                updateLivePreview();
            };
            l2Custom.oninput = () => {
                data.category = l2Custom.value;
                updateLivePreview();
            };
        }

        const productNameInput = modalWrapper.querySelector('#product-name-input');
        const productIdInput = modalWrapper.querySelector('#product-id-input');
        const productStatusSelect = modalWrapper.querySelector('#product-status-select');

        if (productStatusSelect) {
            productStatusSelect.onchange = () => {
                data.vstatus = productStatusSelect.value;
                updateLivePreview();
            };
        }

        if (productNameInput && productIdInput && !isEdit) {
            productNameInput.addEventListener('input', () => {
                if (!data.id_modified_manually) {
                    const translit = (str) => {
                        const ru = {
                            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
                            'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
                            'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
                            'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya'
                        };
                        return str.toLowerCase().split('').map(char => ru[char] || char).join('');
                    };
                    const slug = translit(productNameInput.value)
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                    productIdInput.value = slug ? 'iron-' + slug : '';
                    data.id = productIdInput.value;
                }
                data.name = productNameInput.value;
                updateLivePreview();
            });
            productIdInput.addEventListener('input', () => {
                data.id_modified_manually = true;
                data.id = productIdInput.value;
            });
        } else if (productNameInput && isEdit) {
            productNameInput.addEventListener('input', () => {
                data.name = productNameInput.value;
                updateLivePreview();
            });
        }

        const priceTonInput = modalWrapper.querySelector('#price-ton-input');
        if (priceTonInput) {
            priceTonInput.addEventListener('input', () => {
                data.price_ton = parseFloat(priceTonInput.value) || 0;
                data.price_unit = data.price_ton;
                updateLivePreview();
            });
        }

        const dropzone = modalWrapper.querySelector('#image-dropzone');
        const fileInput = modalWrapper.querySelector('#image-file-input');
        const urlInput = modalWrapper.querySelector('#drawer-image-url');
        const previewImg = modalWrapper.querySelector('#preview-img-element');
        const dropzonePlaceholder = modalWrapper.querySelector('#dropzone-placeholder');
        const dropzonePreview = modalWrapper.querySelector('#dropzone-preview');
        const changeImgBtn = modalWrapper.querySelector('#change-img-btn');
        const removeImgBtn = modalWrapper.querySelector('#remove-img-btn');

        const setImage = (urlOrBase64) => {
            data.image = urlOrBase64;
            if (urlInput) urlInput.value = urlOrBase64;
            if (previewImg) previewImg.src = urlOrBase64;
            if (dropzonePlaceholder && dropzonePreview) {
                if (urlOrBase64) {
                    dropzonePlaceholder.classList.add('hidden');
                    dropzonePreview.classList.remove('hidden');
                } else {
                    dropzonePlaceholder.classList.remove('hidden');
                    dropzonePreview.classList.add('hidden');
                }
            }
            updateLivePreview();
        };

        if (dropzone && fileInput) {
            dropzone.onclick = (e) => {
                if (e.target === changeImgBtn || e.target === removeImgBtn || e.target.closest('#change-img-btn') || e.target.closest('#remove-img-btn')) return;
                fileInput.click();
            };

            dropzone.ondragover = (e) => {
                e.preventDefault();
                dropzone.classList.add('border-[#ffb0cc]', 'bg-[#ffb0cc]/5');
            };
            dropzone.ondragleave = () => {
                dropzone.classList.remove('border-[#ffb0cc]', 'bg-[#ffb0cc]/5');
            };
            dropzone.ondrop = (e) => {
                e.preventDefault();
                dropzone.classList.remove('border-[#ffb0cc]', 'bg-[#ffb0cc]/5');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = () => setImage(reader.result);
                    reader.readAsDataURL(file);
                }
            };

            fileInput.onchange = () => {
                const file = fileInput.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setImage(reader.result);
                    reader.readAsDataURL(file);
                }
            };
        }

        if (changeImgBtn) {
            changeImgBtn.onclick = (e) => {
                e.stopPropagation();
                if (fileInput) fileInput.click();
            };
        }

        if (removeImgBtn) {
            removeImgBtn.onclick = (e) => {
                e.stopPropagation();
                setImage('');
            };
        }

        if (urlInput) {
            urlInput.oninput = () => {
                setImage(urlInput.value);
            };
        }

        const specsContainer = modalWrapper.querySelector('#specs-container');
        const addSpecBtn = modalWrapper.querySelector('#add-spec-row');
        const jsonTextarea = modalWrapper.querySelector('#raw-json-textarea');

        if (addSpecBtn && specsContainer) {
            addSpecBtn.onclick = () => {
                const row = document.createElement('div');
                row.className = 'flex gap-2 spec-row items-center bg-[#151311] p-2.5 rounded-2xl border border-white/5 shadow-inner';
                row.innerHTML = `
                    <input type="text" placeholder="Название (напр. Покрытие)" class="spec-key flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd] font-bold border-r border-white/10">
                    <input type="text" placeholder="Значение (напр. Оцинкованное)" class="spec-value flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd]">
                    <button type="button" class="remove-spec text-red-400/60 hover:text-red-400 transition-colors p-2" title="Удалить параметр">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                `;
                specsContainer.appendChild(row);
                bindSpecRowEvents();
                updateSpecsFromRows();
            };
        }

        bindSpecRowEvents();

        if (jsonTextarea) {
            jsonTextarea.addEventListener('input', updateRowsFromJson);
        }

        const productDescInput = modalWrapper.querySelector('#product-desc-input');
        if (productDescInput) {
            productDescInput.oninput = () => {
                data.description = productDescInput.value;
            };
        }

        bindSuggestionsEvents();
    };

    const bindSuggestionsEvents = () => {
        const specsContainer = modalWrapper.querySelector('#specs-container');
        modalWrapper.querySelectorAll('.suggestion-add-btn').forEach(btn => {
            btn.onclick = () => {
                const key = btn.dataset.key;
                if (!specsContainer) return;
                
                // Check if key already exists
                const existing = Array.from(specsContainer.querySelectorAll('.spec-key')).map(inp => inp.value.trim().toLowerCase());
                if (existing.includes(key.toLowerCase())) {
                    // Focus existing value input
                    const rows = specsContainer.querySelectorAll('.spec-row');
                    for (let row of rows) {
                        if (row.querySelector('.spec-key').value.trim().toLowerCase() === key.toLowerCase()) {
                            row.querySelector('.spec-value').focus();
                            break;
                        }
                    }
                    return;
                }

                const row = document.createElement('div');
                row.className = 'flex gap-2 spec-row items-center bg-[#151311] p-2.5 rounded-2xl border border-white/5 shadow-inner';
                row.innerHTML = `
                    <input type="text" placeholder="Название (напр. Покрытие)" value="${key}" class="spec-key flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd] font-bold border-r border-white/10">
                    <input type="text" placeholder="Значение (напр. Оцинкованное)" class="spec-value flex-1 bg-transparent px-3 py-1.5 text-xs outline-none text-[#e7e2dd]">
                    <button type="button" class="remove-spec text-red-400/60 hover:text-red-400 transition-colors p-2" title="Удалить параметр">
                        <span class="material-symbols-outlined text-base">delete</span>
                    </button>
                `;
                specsContainer.appendChild(row);
                bindSpecRowEvents();
                updateSpecsFromRows();
                row.querySelector('.spec-value').focus();
            };
        });
    };

    // Initial Render
    modalWrapper.innerHTML = `
        <!-- Backdrop -->
        <div id="modal-backdrop" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
        
        <!-- Modal Content -->
        <div id="modal-content" class="relative w-full max-w-6xl max-h-[92vh] bg-[#1d1b19] border border-[#534347]/30 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0">
            <div class="p-6 lg:p-8 border-b border-[#534347]/20 flex items-center justify-between shrink-0 bg-[#1d1b19] rounded-t-3xl relative z-10">
                <div>
                    <h3 class="font-['Space Grotesk'] text-2xl font-bold uppercase tracking-tight text-[#e7e2dd]">
                        ${isEdit ? 'Редактирование товара' : 'Создание товара'}
                    </h3>
                    <div class="text-xs text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1 font-bold">
                        ${isEdit ? `ID: ${data.id}` : 'НОВЫЙ ТОВАР В КАТАЛОГЕ'}
                    </div>
                </div>
                <button id="close-modal" class="w-11 h-11 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-[#d7c1c7] hover:text-[#ffb0cc]">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <div class="flex-1 overflow-hidden flex flex-col p-6 lg:p-8 min-h-0">
                <form id="edit-product-form" class="flex-1 flex flex-col h-full min-h-0 w-full">
                    ${renderFormFields()}
                </form>
            </div>
        </div>
    `;

    // Animation
    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        modalWrapper.querySelector('#modal-content').classList.remove('scale-95');
    });

    bindEvents();
    bindFooterEvents();
    updateLivePreview();
}
