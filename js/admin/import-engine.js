/**
 * Import Engine — парсинг CSV и нормализация импортируемых товаров.
 *
 * Публичные функции:
 *   parseCSV(text) — парсит CSV-текст в массив объектов
 *   normalizeImportedProduct(row) — нормализует строку CSV в формат товара
 *   mergePriceListData(currentProducts, incomingData) — мержит импорт с текущими товарами
 */

/**
 * Парсит CSV-текст (разделитель ; или ,) в массив объектов.
 * Первая строка — заголовки.
 * @param {string} text - CSV содержимое
 * @returns {Array<Object>} массив объектов с ключами из заголовков
 */
export function parseCSV(text) {
    if (!text || !text.trim()) return [];

    const lines = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length < 2) return [];

    // Определяем разделитель: ; или ,
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';

    const headers = parseCsvLine(firstLine, separator).map(h => h.trim().replace(/^\uFEFF/, ''));
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCsvLine(line, separator);
        const obj = {};
        headers.forEach((header, idx) => {
            obj[header] = (values[idx] || '').trim();
        });
        result.push(obj);
    }

    return result;
}

/**
 * Парсит одну строку CSV с учётом кавычек
 */
function parseCsvLine(line, separator) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === separator && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Нормализует строку из CSV в формат товара для импорта.
 * Поддерживает различные варианты названий колонок.
 * @param {Object} row - объект из parseCSV
 * @returns {Object} нормализованный товар
 */
export function normalizeImportedProduct(row) {
    const name = row['Наименование'] || row['name'] || row['vname'] || row['Название'] || row['Товар'] || '';
    const price_ton = parseFloat(row['Цена за тонну'] || row['price_ton'] || row['vprice'] || row['Цена'] || 0) || 0;
    const price_unit = parseFloat(row['Цена за ед.'] || row['price_unit'] || row['Цена за единицу'] || 0) || 0;
    const parent_category = row['Группа (L1)'] || row['Группа (parent_category)'] || row['parent_category'] || row['Группа'] || '';
    const category = row['Категория (L2)'] || row['Категория (category)'] || row['category'] || row['Категория'] || '';
    const unit_label = row['Ед. изм.'] || row['unit_label'] || row['Единица'] || '';
    const vstatus = row['Статус'] || row['vstatus'] || 'active';
    const description = row['Описание'] || row['description'] || '';
    const length = row['Длина'] || row['length'] || '';
    const width = row['Ширина'] || row['width'] || '';
    const type = row['Тип'] || row['type'] || '';
    const weight = row['Вес'] || row['weight'] || '';
    const id = row['ID'] || row['id'] || row['vid'] || '';

    return {
        id,
        name,
        price_ton,
        price_unit,
        parent_category,
        category,
        unit_label,
        vstatus,
        description,
        length,
        width,
        type,
        weight
    };
}

/**
 * Мержит импортированные данные с текущими товарами.
 * Обновляет существующие (по id или name) и создаёт новые.
 * @param {Array} currentProducts - текущие товары из БД
 * @param {Array} incomingData - импортированные товары (нормализованные)
 * @returns {{ updates: Array, newProducts: Array }}
 */
export function mergePriceListData(currentProducts, incomingData) {
    const updates = [];
    const newProducts = [];

    incomingData.forEach(item => {
        // Ищем существующий товар по id или по имени
        let existing = null;
        if (item.id) {
            existing = currentProducts.find(p => p.id === item.id || p.vid === item.id);
        }
        if (!existing && item.name) {
            existing = currentProducts.find(p =>
                (p.name || '').toLowerCase().trim() === item.name.toLowerCase().trim()
            );
        }

        if (existing) {
            const changes = {};
            let hasChanges = false;

            // Обновляем цену если указана и отличается
            if (item.price_ton && item.price_ton !== Number(existing.price_ton || 0)) {
                changes.price_ton = item.price_ton;
                hasChanges = true;
            }
            if (item.price_unit && item.price_unit !== Number(existing.price_unit || 0)) {
                changes.price_unit = item.price_unit;
                hasChanges = true;
            }
            if (item.vstatus && item.vstatus !== existing.vstatus) {
                changes.vstatus = item.vstatus;
                hasChanges = true;
            }
            if (item.parent_category && item.parent_category !== existing.parent_category) {
                changes.parent_category = item.parent_category;
                hasChanges = true;
            }
            if (item.category && item.category !== existing.category) {
                changes.category = item.category;
                hasChanges = true;
            }
            if (item.unit_label && item.unit_label !== existing.unit_label) {
                changes.unit_label = item.unit_label;
                hasChanges = true;
            }

            if (hasChanges) {
                updates.push({ id: existing.id || existing.vid, ...changes });
            }
        } else if (item.name) {
            // Новый товар
            newProducts.push({
                id: item.id || ('import_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)),
                name: item.name,
                price_ton: item.price_ton,
                price_unit: item.price_unit,
                parent_category: item.parent_category,
                category: item.category,
                unit_label: item.unit_label,
                vstatus: item.vstatus || 'active',
                description: item.description,
                length: item.length,
                width: item.width,
                type: item.type,
                weight: item.weight
            });
        }
    });

    return { updates, newProducts };
}
