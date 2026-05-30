/**
 * Export Engine — мультиформатный экспорт (XML / CSV / Excel / PDF)
 * с фирменной айдентикой «Железный Дровосек».
 *
 * Публичные функции:
 *   showExportFormatModal(dataToExport, type, options)
 *     type: 'products' | 'l1' | 'l2' | 'parameters'
 *     options: { allProducts?: [], title?: string }
 */

const BRAND = {
    name: 'ЖЕЛЕЗНЫЙ ДРОВОСЕК',
    tagline: 'Металлопрокат в Санкт-Петербурге и Ленинградской области',
    site: 'zhelezniydrovosek.ru',
    phone: '8 (812) 604-32-68',
    accent: [150, 69, 81],      // #964551 — акцент тёмной темы (фирменный)
    dark: [20, 18, 16],         // #141210
    darker: [21, 19, 17],       // #151311
    light: [231, 226, 221],     // #e7e2dd
    rowAlt: [247, 240, 242]     // светлый бордовый оттенок для чётных строк
};

function ensureModalRoot() {
    let modalWrapper = document.getElementById('export-modal-wrapper');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'export-modal-wrapper';
        document.body.appendChild(modalWrapper);
    }
    return modalWrapper;
}

function closeModalRoot() {
    const m = document.getElementById('export-modal-wrapper');
    if (m) m.innerHTML = '';
    if (window.unlockScrollGlobal) window.unlockScrollGlobal();
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Шаг 1. Выбор формата
 * ──────────────────────────────────────────────────────────────────────── */
export function showExportFormatModal(dataToExport, type, options = {}) {
    if (!dataToExport || dataToExport.length === 0) {
        if (window.showToast) window.showToast('Нет данных для экспорта', 'error', 'Экспорт');
        else alert('Нет данных для экспорта');
        return;
    }

    const modalWrapper = ensureModalRoot();
    if (window.lockScrollGlobal) window.lockScrollGlobal();

    const isProducts = type === 'products';
    const pdfLabel = isProducts ? 'Прайс-лист (PDF)' : 'Таблица (PDF)';

    modalWrapper.innerHTML = `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 opacity-0 transition-opacity duration-300" id="export-format-backdrop">
            <div class="bg-surface-container border border-outline/20 rounded-t-[2rem] sm:rounded-[2rem] p-6 md:p-8 w-full sm:max-w-lg shadow-2xl relative transform translate-y-full sm:translate-y-0 sm:scale-95 transition-transform duration-300 max-h-[92vh] overflow-y-auto custom-scrollbar" id="export-format-modal-content">
                <button type="button" id="close-export-modal" class="absolute top-5 right-5 w-10 h-10 rounded-full bg-surface-container-lowest border border-outline/20 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors z-10">
                    <span class="material-symbols-outlined">close</span>
                </button>
                <div class="flex items-center gap-4 mb-6 pr-10">
                    <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span class="material-symbols-outlined text-2xl">download</span>
                    </div>
                    <div>
                        <h2 class="text-lg md:text-2xl font-bold font-display-xl text-on-surface uppercase tracking-tight">Экспорт данных</h2>
                        <p class="text-xs md:text-sm text-on-surface-variant opacity-80 mt-0.5">Выберите формат выгрузки</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-5">
                    <button class="export-format-btn flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-outline/20 bg-surface-container-lowest hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all text-on-surface active:scale-95" data-format="xlsx">
                        <span class="material-symbols-outlined text-3xl text-green-500">table_view</span>
                        <span class="font-bold text-xs sm:text-sm tracking-wide">Excel (XLSX)</span>
                    </button>
                    <button class="export-format-btn flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-outline/20 bg-surface-container-lowest hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all text-on-surface active:scale-95" data-format="csv">
                        <span class="material-symbols-outlined text-3xl text-blue-400">csv</span>
                        <span class="font-bold text-xs sm:text-sm tracking-wide">CSV</span>
                    </button>
                    <button class="export-format-btn flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-outline/20 bg-surface-container-lowest hover:bg-primary/5 hover:border-primary/40 hover:text-primary transition-all text-on-surface active:scale-95" data-format="xml">
                        <span class="material-symbols-outlined text-3xl text-orange-400">code</span>
                        <span class="font-bold text-xs sm:text-sm tracking-wide">XML</span>
                    </button>
                    <button class="export-format-btn flex flex-col items-center justify-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all text-on-surface active:scale-95" data-format="pdf">
                        <span class="material-symbols-outlined text-3xl text-red-500">picture_as_pdf</span>
                        <span class="font-bold text-xs sm:text-sm tracking-wide">${pdfLabel}</span>
                    </button>
                </div>
                <div class="text-[10px] text-on-surface-variant opacity-60 text-center font-mono uppercase tracking-widest">
                    К выгрузке: ${dataToExport.length} ${isProducts ? 'товаров' : 'строк'}
                </div>
            </div>
        </div>
    `;

    const backdrop = modalWrapper.querySelector('#export-format-backdrop');
    const content = modalWrapper.querySelector('#export-format-modal-content');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('translate-y-full', 'sm:scale-95', 'scale-95');
    });

    backdrop.onclick = (e) => { if (e.target.id === 'export-format-backdrop') closeModalRoot(); };
    modalWrapper.querySelector('#close-export-modal').onclick = closeModalRoot;

    modalWrapper.querySelectorAll('.export-format-btn').forEach(btn => {
        btn.onclick = () => {
            const format = btn.dataset.format;
            if (format === 'pdf' && isProducts) {
                // Прайс-лист → дополнительно уточняем категории
                showPriceListCategoryModal(dataToExport, options);
            } else {
                closeModalRoot();
                generateExport(dataToExport, type, format, options);
            }
        };
    });
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Шаг 2 (только PDF-прайс товаров). Выбор категорий
 * ──────────────────────────────────────────────────────────────────────── */
function showPriceListCategoryModal(products, options = {}) {
    const modalWrapper = ensureModalRoot();

    // Собираем дерево L1 → [L2]
    const tree = {};
    products.forEach(p => {
        const l1 = p.parent_category || 'Без группы';
        const l2 = p.category || '';
        if (!tree[l1]) tree[l1] = new Set();
        if (l2) tree[l1].add(l2);
    });
    const l1Names = Object.keys(tree).sort((a, b) => a.localeCompare(b));

    const l1ListHtml = l1Names.map((l1, idx) => {
        const count = products.filter(p => (p.parent_category || 'Без группы') === l1).length;
        return `
            <label class="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                <div class="flex items-center gap-3 min-w-0">
                    <input type="checkbox" class="pricelist-cat-cb w-5 h-5 rounded border-outline/30 text-primary cursor-pointer shrink-0" value="${escapeHtmlAttr(l1)}" checked>
                    <span class="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate uppercase tracking-tight">${escapeHtmlAttr(l1)}</span>
                </div>
                <span class="text-[10px] font-mono text-on-surface-variant opacity-60 shrink-0">${count} шт.</span>
            </label>
        `;
    }).join('');

    modalWrapper.innerHTML = `
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 opacity-0 transition-opacity duration-300" id="pricelist-backdrop">
            <div class="bg-surface-container border border-outline/20 rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-lg shadow-2xl relative transform translate-y-full sm:translate-y-0 sm:scale-95 transition-transform duration-300 flex flex-col max-h-[92vh]" id="pricelist-content">
                <div class="p-6 md:p-8 border-b border-outline/10 flex items-center justify-between shrink-0">
                    <div class="flex items-center gap-4 pr-4">
                        <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <span class="material-symbols-outlined text-2xl">picture_as_pdf</span>
                        </div>
                        <div>
                            <h2 class="text-lg md:text-xl font-bold font-display-xl text-on-surface uppercase tracking-tight">Прайс-лист PDF</h2>
                            <p class="text-xs text-on-surface-variant opacity-80 mt-0.5">Выберите категории для прайса</p>
                        </div>
                    </div>
                    <button type="button" id="pricelist-close" class="w-10 h-10 rounded-full bg-surface-container-lowest border border-outline/20 flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors shrink-0">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="px-6 md:px-8 pt-4 flex items-center gap-2 shrink-0">
                    <button id="pricelist-select-all" class="flex-1 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all">Выбрать все</button>
                    <button id="pricelist-deselect-all" class="flex-1 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface-variant border border-outline/10 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant transition-all">Снять все</button>
                </div>

                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-2 min-h-0">
                    ${l1ListHtml || '<div class="text-center opacity-50 py-10 text-sm">Нет категорий</div>'}
                </div>

                <div class="p-6 md:p-8 border-t border-outline/10 flex items-center gap-3 shrink-0">
                    <button type="button" id="pricelist-cancel" class="px-5 py-3.5 rounded-xl border border-outline/20 hover:bg-surface-variant transition-all text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Назад</button>
                    <button type="button" id="pricelist-generate" class="flex-1 py-3.5 rounded-xl bg-primary text-on-primary hover:brightness-110 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined text-base">download</span>
                        Сформировать прайс
                    </button>
                </div>
            </div>
        </div>
    `;

    const backdrop = modalWrapper.querySelector('#pricelist-backdrop');
    const content = modalWrapper.querySelector('#pricelist-content');
    requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        content.classList.remove('translate-y-full', 'sm:scale-95');
    });

    backdrop.onclick = (e) => { if (e.target.id === 'pricelist-backdrop') closeModalRoot(); };
    modalWrapper.querySelector('#pricelist-close').onclick = closeModalRoot;
    modalWrapper.querySelector('#pricelist-cancel').onclick = () => showExportFormatModal(products, 'products', options);

    const getCheckboxes = () => Array.from(modalWrapper.querySelectorAll('.pricelist-cat-cb'));
    modalWrapper.querySelector('#pricelist-select-all').onclick = () => getCheckboxes().forEach(cb => cb.checked = true);
    modalWrapper.querySelector('#pricelist-deselect-all').onclick = () => getCheckboxes().forEach(cb => cb.checked = false);

    modalWrapper.querySelector('#pricelist-generate').onclick = async () => {
        const selected = getCheckboxes().filter(cb => cb.checked).map(cb => cb.value);
        if (selected.length === 0) {
            if (window.showToast) window.showToast('Выберите хотя бы одну категорию', 'error', 'Прайс-лист');
            else alert('Выберите хотя бы одну категорию');
            return;
        }
        const filtered = products.filter(p => selected.includes(p.parent_category || 'Без группы'));
        closeModalRoot();
        await generatePDF(filtered, 'products', `pricelist_${new Date().toISOString().split('T')[0]}`, options);
    };
}

/* ──────────────────────────────────────────────────────────────────────────
 *  Диспетчер генерации
 * ──────────────────────────────────────────────────────────────────────── */
async function generateExport(dataToExport, type, format, options = {}) {
    const today = new Date().toISOString().split('T')[0];
    const filename = `${type}_export_${today}`;

    try {
        if (format === 'xml') generateXML(dataToExport, type, filename);
        else if (format === 'xlsx') generateXLSX(dataToExport, type, filename);
        else if (format === 'csv') generateCSV(dataToExport, type, filename);
        else if (format === 'pdf') await generatePDF(dataToExport, type, filename, options);
        if (window.showToast) window.showToast('Файл сформирован', 'success', 'Экспорт');
    } catch (e) {
        console.error('[EXPORT] error', e);
        if (window.showToast) window.showToast('Ошибка экспорта: ' + e.message, 'error', 'Экспорт');
        else alert('Ошибка экспорта: ' + e.message);
    }
}

/* ── helpers ───────────────────────────────────────────────────────────── */
function escapeHtmlAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeXml(unsafe) {
    if (typeof unsafe === 'number') return unsafe;
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe.toString().replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function getRowsForExport(dataToExport, type) {
    if (type === 'products') {
        return dataToExport.map(p => ({
            'ID': p.id,
            'Статус': p.vstatus || 'active',
            'Группа (L1)': p.parent_category || '',
            'Категория (L2)': p.category || '',
            'Наименование': p.name || '',
            'Цена за тонну': Number(p.price_ton) || 0,
            'Цена за ед.': Number(p.price_unit) || 0,
            'Ед. изм.': p.unit_label || '',
            'Длина': p.length || '',
            'Ширина': p.width || '',
            'Тип': p.type || '',
            'Вес': p.weight || '',
            'Описание': p.description || '',
            'Характеристики': (typeof p.specs === 'string') ? p.specs : JSON.stringify(p.specs || []),
            'Фото': Array.isArray(p.images) ? p.images.join(', ') : (p.images || '')
        }));
    } else if (type === 'l1') {
        return dataToExport.map(item => ({ 'Группа (L1)': item.name || '' }));
    } else if (type === 'l2') {
        return dataToExport.map(item => ({
            'Группа (L1)': item.parent || '',
            'Подкатегория (L2)': item.name || ''
        }));
    } else if (type === 'parameters') {
        return dataToExport.map(p => ({
            'Название': p.name || '',
            'Ед. изм.': p.unit || '',
            'Тип': p.type || 'string',
            'Обязательный': p.required ? 'Да' : 'Нет',
            'Список значений': p.options || '',
            'Категории': p.category_hint || '',
            'Описание': p.description || ''
        }));
    }
    return dataToExport;
}

/* ── XLSX ──────────────────────────────────────────────────────────────── */
function generateXLSX(dataToExport, type, filename) {
    if (!window.XLSX) { alert('Библиотека Excel (SheetJS) не загружена.'); return; }
    const rows = getRowsForExport(dataToExport, type);
    const ws = XLSX.utils.json_to_sheet(rows);
    // авто-ширина столбцов
    const cols = Object.keys(rows[0] || {}).map(k => {
        const maxLen = Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length));
        return { wch: Math.min(60, Math.max(10, maxLen + 2)) };
    });
    ws['!cols'] = cols;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ── CSV ───────────────────────────────────────────────────────────────── */
function generateCSV(dataToExport, type, filename) {
    const rows = getRowsForExport(dataToExport, type);
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    let csv = '\uFEFF' + headers.join(';') + '\r\n';
    rows.forEach(row => {
        csv += headers.map(h => {
            let v = row[h];
            if (v === null || v === undefined) v = '';
            v = String(v).replace(/"/g, '""');
            return `"${v}"`;
        }).join(';') + '\r\n';
    });
    downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
}

/* ── XML (Excel 2003 SpreadsheetML) ───────────────────────────────────── */
function generateXML(dataToExport, type, filename) {
    const rows = getRowsForExport(dataToExport, type);
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#534347" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="StringCell"><NumberFormat ss:Format="@"/></Style>
  <Style ss:ID="NumberCell"><NumberFormat ss:Format="0.00"/></Style>
 </Styles>
 <Worksheet ss:Name="Данные">
  <Table>
   <Row ss:Height="28">${headers.map(h => `<Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}</Row>`;

    rows.forEach(row => {
        xml += `\n   <Row ss:Height="20">` + headers.map(h => {
            const v = row[h];
            const isNum = typeof v === 'number';
            return `<Cell ss:StyleID="${isNum ? 'NumberCell' : 'StringCell'}"><Data ss:Type="${isNum ? 'Number' : 'String'}">${escapeXml(v)}</Data></Cell>`;
        }).join('') + `</Row>`;
    });

    xml += `\n  </Table>\n </Worksheet>\n</Workbook>`;
    downloadBlob(new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' }), `${filename}.xls`);
}

/* ── PDF (фирменный) ──────────────────────────────────────────────────── */
let _pdfFontLoaded = false;
async function loadPdfFont(doc) {
    if (_pdfFontLoaded && window._robotoFontCache) {
        doc.addFileToVFS('Roboto-Regular.ttf', window._robotoFontCache.regular);
        doc.addFileToVFS('Roboto-Medium.ttf', window._robotoFontCache.bold);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');
        return true;
    }
    try {
        const fetchFont = async (url) => {
            const res = await fetch(url);
            const buffer = await res.arrayBuffer();
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            return window.btoa(binary);
        };
        const regular = await fetchFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf');
        const bold = await fetchFont('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf');
        window._robotoFontCache = { regular, bold };
        doc.addFileToVFS('Roboto-Regular.ttf', regular);
        doc.addFileToVFS('Roboto-Medium.ttf', bold);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        doc.addFont('Roboto-Medium.ttf', 'Roboto', 'bold');
        doc.setFont('Roboto');
        _pdfFontLoaded = true;
        return true;
    } catch (e) {
        console.warn('[EXPORT] Не удалось загрузить кириллический шрифт', e);
        return false;
    }
}

function drawPdfHeader(doc, subtitle) {
    const pageW = doc.internal.pageSize.getWidth();
    // Тёмная плашка-шапка
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, pageW, 34, 'F');
    // Тонкая акцентная линия снизу шапки
    doc.setFillColor(...BRAND.accent);
    doc.rect(0, 34, pageW, 1.2, 'F');

    doc.setTextColor(...BRAND.accent);
    doc.setFontSize(17);
    doc.setFont('Roboto', 'bold');
    doc.text(BRAND.name, 14, 15);

    doc.setTextColor(...BRAND.light);
    doc.setFontSize(7.5);
    doc.setFont('Roboto', 'normal');
    doc.text(BRAND.tagline, 14, 22);

    doc.setTextColor(...BRAND.accent);
    doc.setFontSize(8.5);
    doc.text(`${BRAND.site}   ${BRAND.phone}`, pageW - 14, 15, { align: 'right' });
    doc.setTextColor(170, 170, 170);
    doc.setFontSize(7.5);
    doc.text(`${subtitle} · ${new Date().toLocaleDateString('ru-RU')}`, pageW - 14, 22, { align: 'right' });
}

function drawPdfFooter(doc) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(225, 215, 218);
        doc.setLineWidth(0.2);
        doc.line(14, pageH - 11, pageW - 14, pageH - 11);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.setFont('Roboto', 'normal');
        doc.text(`${BRAND.name} · ${BRAND.site}`, 14, pageH - 6.5);
        doc.text(`${BRAND.phone}`, pageW / 2, pageH - 6.5, { align: 'center' });
        doc.text(`${i} / ${pageCount}`, pageW - 14, pageH - 6.5, { align: 'right' });
    }
}

// Титульная страница прайс-листа
function drawCoverPage(doc, totalItems, categoriesCount) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Тёмный фон
    doc.setFillColor(...BRAND.dark);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Акцентные полосы
    doc.setFillColor(...BRAND.accent);
    doc.rect(0, 70, pageW, 0.8, 'F');
    doc.rect(0, 110, pageW, 0.8, 'F');

    doc.setTextColor(...BRAND.accent);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(13);
    doc.text(BRAND.name, pageW / 2, 50, { align: 'center' });

    doc.setTextColor(...BRAND.light);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(40);
    doc.text('ПРАЙС-ЛИСТ', pageW / 2, 92, { align: 'center' });

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(190, 190, 190);
    doc.text('Металлопрокат · Санкт-Петербург и ЛО', pageW / 2, 104, { align: 'center' });

    // Инфо-блок
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.light);
    const infoY = 140;
    doc.text(`Дата формирования:  ${new Date().toLocaleDateString('ru-RU')}`, pageW / 2, infoY, { align: 'center' });
    doc.text(`Позиций в прайсе:  ${totalItems}`, pageW / 2, infoY + 8, { align: 'center' });
    doc.text(`Категорий:  ${categoriesCount}`, pageW / 2, infoY + 16, { align: 'center' });

    // Контакты внизу
    doc.setTextColor(...BRAND.accent);
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(12);
    doc.text(BRAND.phone, pageW / 2, pageH - 40, { align: 'center' });
    doc.setTextColor(170, 170, 170);
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(9);
    doc.text(BRAND.site, pageW / 2, pageH - 32, { align: 'center' });
    doc.setFontSize(7.5);
    doc.text('Цены указаны без НДС и не являются публичной офертой.', pageW / 2, pageH - 20, { align: 'center' });
}

async function generatePDF(dataToExport, type, filename, options = {}) {
    if (!window.jspdf || !window.jspdf.jsPDF) { alert('Библиотека PDF (jsPDF) не загружена.'); return; }

    const isProducts = type === 'products';
    const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    await loadPdfFont(doc);

    const subtitle = isProducts ? 'Прайс-лист' : (type === 'parameters' ? 'Справочник параметров' : 'Категории каталога');

    if (!doc.autoTable) {
        drawPdfHeader(doc, subtitle);
        doc.setTextColor(0, 0, 0);
        doc.text('Плагин autotable не загружен.', 14, 60);
        doc.save(`${filename}.pdf`);
        return;
    }

    // jsPDF outline API (PDF-закладки для навигации по категориям)
    const outline = (doc.outline && typeof doc.outline.add === 'function') ? doc.outline : null;

    let head, body, columnStyles;

    if (isProducts) {
        // Группируем товары по категориям
        const grouped = {};
        dataToExport.forEach(p => {
            if (p.vstatus === 'archived') return;
            const cat = p.parent_category || p.category || 'Без категории';
            (grouped[cat] = grouped[cat] || []).push(p);
        });
        const catNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
        const totalItems = catNames.reduce((s, c) => s + grouped[c].length, 0);

        // ── Титульная страница ──
        drawCoverPage(doc, totalItems, catNames.length);

        // ── Страница оглавления (навигация по категориям) ──
        doc.addPage();
        drawPdfHeader(doc, subtitle);
        doc.setTextColor(40, 40, 40);
        doc.setFont('Roboto', 'bold');
        doc.setFontSize(16);
        doc.text('Содержание', 14, 50);
        doc.setDrawColor(...BRAND.accent);
        doc.setLineWidth(0.5);
        doc.line(14, 53, 60, 53);

        // Карта «категория → номер позиции в общем списке» для проставления страниц
        const tocStartY = 62;
        let tocY = tocStartY;
        doc.setFontSize(10);
        const tocEntries = []; // {name, count, yOnTocPage, pageNumberPlaceholderX}
        catNames.forEach((cat, idx) => {
            if (tocY > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage();
                drawPdfHeader(doc, subtitle);
                tocY = 50;
            }
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(...BRAND.accent);
            doc.setFontSize(10);
            doc.text(`${String(idx + 1).padStart(2, '0')}`, 14, tocY);
            doc.setTextColor(40, 40, 40);
            doc.setFont('Roboto', 'normal');
            doc.text(cat, 26, tocY);
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(9);
            doc.text(`${grouped[cat].length} поз.`, doc.internal.pageSize.getWidth() - 14, tocY, { align: 'right' });
            // пунктир
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.1);
            doc.line(26 + doc.getTextWidth(cat) + 3, tocY - 1, doc.internal.pageSize.getWidth() - 30, tocY - 1);
            tocEntries.push({ cat, y: tocY, page: doc.internal.getCurrentPageInfo().pageNumber });
            tocY += 9;
        });

        // ── Таблицы по категориям (каждая со своим заголовком + закладкой) ──
        head = [['Наименование', 'Цена', 'Ед. изм.']];
        columnStyles = { 0: { cellWidth: 122 }, 1: { cellWidth: 40, halign: 'right' }, 2: { cellWidth: 20 } };

        catNames.forEach((cat, idx) => {
            doc.addPage();
            drawPdfHeader(doc, subtitle);

            // PDF-закладка на категорию
            if (outline) {
                try { doc.outline.add(null, cat, { pageNumber: doc.internal.getNumberOfPages() }); } catch (e) {}
            }

            // Заголовок категории-плашка
            doc.setFillColor(...BRAND.accent);
            doc.roundedRect(14, 44, doc.internal.pageSize.getWidth() - 28, 11, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('Roboto', 'bold');
            doc.setFontSize(11);
            doc.text(`${String(idx + 1).padStart(2, '0')}   ${cat.toUpperCase()}`, 19, 51.5);
            doc.setFontSize(8.5);
            doc.text(`${grouped[cat].length} позиций`, doc.internal.pageSize.getWidth() - 19, 51.5, { align: 'right' });

            const rows = grouped[cat].map(p => {
                const ton = Number(p.price_ton) || 0;
                return [
                    p.name || '—',
                    ton > 0 ? `${ton.toLocaleString('ru-RU')} ₽` : 'По запросу',
                    p.unit_label || 'тонна'
                ];
            });

            doc.autoTable({
                startY: 59,
                head,
                body: rows,
                theme: 'striped',
                styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8.5, cellPadding: 2.5, lineColor: [225, 215, 218], lineWidth: 0.1, textColor: [40, 40, 40] },
                headStyles: { fillColor: BRAND.darker, textColor: 255, fontStyle: 'bold', fontSize: 9, halign: 'left' },
                alternateRowStyles: { fillColor: BRAND.rowAlt },
                columnStyles,
                margin: { top: 44, bottom: 16 },
                didDrawPage: () => drawPdfHeader(doc, subtitle)
            });
        });

        drawPdfFooter(doc);
        doc.save(`${filename}.pdf`);
        return;
    }

    // ── Не-товарные типы (параметры, категории) — простая таблица ──
    drawPdfHeader(doc, subtitle);
    if (type === 'parameters') {
        head = [['Параметр', 'Ед. изм.', 'Тип', 'Категории']];
        body = dataToExport.map(p => [
            p.name || '—',
            p.unit || '—',
            p.type === 'number' ? 'Число' : (p.type === 'select' ? 'Список' : (p.type === 'boolean' ? 'Логич.' : 'Строка')),
            p.category_hint || '—'
        ]);
        columnStyles = { 0: { cellWidth: 60 }, 1: { cellWidth: 25 }, 2: { cellWidth: 25 }, 3: { cellWidth: 72 } };
    } else if (type === 'l1') {
        head = [['#', 'Категория (L1)']];
        body = dataToExport.map((item, i) => [i + 1, item.name || '—']);
        columnStyles = { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 167 } };
    } else if (type === 'l2') {
        head = [['#', 'Группа (L1)', 'Подкатегория (L2)']];
        body = dataToExport.map((item, i) => [i + 1, item.parent || '—', item.name || '—']);
        columnStyles = { 0: { cellWidth: 15, halign: 'center' }, 1: { cellWidth: 85 }, 2: { cellWidth: 82 } };
    }

    doc.autoTable({
        startY: 44,
        head,
        body,
        theme: 'striped',
        styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 8.5, cellPadding: 2.5, lineColor: [225, 215, 218], lineWidth: 0.1, textColor: [40, 40, 40] },
        headStyles: { fillColor: BRAND.darker, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        alternateRowStyles: { fillColor: BRAND.rowAlt },
        columnStyles,
        margin: { top: 44, bottom: 16 },
        didDrawPage: () => drawPdfHeader(doc, subtitle)
    });

    drawPdfFooter(doc);
    doc.save(`${filename}.pdf`);
}

function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
