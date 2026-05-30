// Algorithm logic for GOST calculations
function parseUniversalSpecs(p) {
    if (!p) return p;
    let name = (p.name || '').toLowerCase();
    
    // Default assignments
    p.calcType = 'linear'; // default linear (meters, whips, tons)
    p.mLenVal = 6;
    p.wUnitVal = 1;
    p.m2Val = 1;
    p.isSheet = false;

    // Helper to extract numbers
    const extractDim = (regex) => {
        const m = name.match(regex);
        return m ? parseFloat(m[1].replace(',', '.')) : 0;
    };
    
    const extractLen = () => {
        const tokens = name.split(/\s+/);
        for (let i = tokens.length - 1; i >= 0; i--) {
            const t = tokens[i];
            if (t.endsWith('м') && !t.endsWith('мм') && !t.endsWith('см')) {
                const val = parseFloat(t.replace('м', '').replace(',', '.'));
                if (!isNaN(val) && val > 0) return val;
            }
            if (t === 'м' && i > 0) {
                const val = parseFloat(tokens[i-1].replace(',', '.'));
                if (!isNaN(val) && val > 0) return val;
            }
        }
        return 0;
    }

    // 1. АРМАТУРА
    if (name.includes('арматура')) {
        let d = extractDim(/арматура.*?(\d+(?:[.,]\d+)?)/);
        if (d > 0) {
            p.wUnitVal = (d * d * 0.617) / 100; // Вес 1 метра
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 11.7;
    }
    // 2. ТРУБА КРУГЛАЯ (ВГП, Эсв, Бесшовная)
    else if (name.includes('труба') && !name.includes('профиль') && !name.includes('проф')) {
        // Ожидаем формат Труба ... 57х3.5
        let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
        if (m) {
            let D = parseFloat(m[1].replace(',', '.')); // Наружный диаметр
            let s = parseFloat(m[2].replace(',', '.')); // Толщина стенки
            // ГОСТ вес трубы: M = 3.14 * (D - s) * s * 7.85 / 1000 = 0.02466 * s * (D - s)
            p.wUnitVal = 0.02466 * s * (D - s);
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 12;
    }
    // 3. ТРУБА ПРОФИЛЬНАЯ (Квадратная, Прямоугольная)
    else if (name.includes('труба') && (name.includes('профиль') || name.includes('проф'))) {
        // Ожидаем формат 40х20х2
        let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
        if (m) {
            let A = parseFloat(m[1].replace(',', '.'));
            let B = parseFloat(m[2].replace(',', '.'));
            let s = parseFloat(m[3].replace(',', '.'));
            // Формула веса профильной трубы (прибл): M = 0.0157 * s * (A + B - 2.86 * s) 
            p.wUnitVal = 0.0157 * s * (A + B - 2.86 * s);
        } else {
            // Если квадратная 40х2
            let m2 = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
            if (m2) {
                let A = parseFloat(m2[1].replace(',', '.'));
                let s = parseFloat(m2[2].replace(',', '.'));
                p.wUnitVal = 0.0157 * s * (A + A - 2.86 * s);
            }
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 6;
    }
    // 4. БАЛКА (Двутавр)
    else if (name.includes('балка') || name.includes('двутавр')) {
        // Табличные значения сложны, используем эвристику или ставим заглушку.
        // Балка 20Б1 ~ 21.3 кг/м
        let size = name.match(/(\d+)[бкшм]/);
        if (size) {
            let num = parseInt(size[1]);
            p.wUnitVal = num * 1.1; // Очень грубо, лучше если сервер отдает вес
        } else {
            p.wUnitVal = 20; 
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 12;
    }
    // 5. ШВЕЛЛЕР
    else if (name.includes('швеллер')) {
        // Швеллер 10П ~ 8.59 кг/м
        let size = extractDim(/швеллер\s*(\d+(?:[.,]\d+)?)/);
        if (size > 0) {
            p.wUnitVal = size * 0.85; 
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 12;
    }
    // 6. УГОЛОК
    else if (name.includes('уголок')) {
        // Уголок 50х50х5 -> 3.77 кг/м
        let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
        if (m) {
            let a = parseFloat(m[1].replace(',', '.'));
            let b = parseFloat(m[2].replace(',', '.'));
            let s = parseFloat(m[3].replace(',', '.'));
            // Формула веса уголка: M = (A + B - s) * s * 7.85 / 1000
            p.wUnitVal = (a + b - s) * s * 0.00785;
        }
        let l = extractDim(/(\d+(?:[.,]\d+)?)\s*м/);
        p.mLenVal = l > 0 ? l : 12;
    }
    // 7. ЛИСТ И ПРОФНАСТИЛ
    else if (name.includes('лист') || name.includes('профнастил') || name.includes('черепица')) {
        p.calcType = 'area';
        p.isSheet = true;
        // Лист г/к 2х1250х2500
        let m = name.match(/(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)\s*[хx*]\s*(\d+(?:[.,]\d+)?)/);
        if (m) {
            let t = parseFloat(m[1].replace(',', '.'));
            let w = parseFloat(m[2].replace(',', '.'));
            let l = parseFloat(m[3].replace(',', '.'));
            if (t > 50) { // Перепутаны ширина и толщина (например 1250х2500х2)
                let temp = t; t = l; l = temp; // 1250(w) x 2500(l) x 2(t) ?
            }
            // w, l в миллиметрах -> переводим в метры
            let widthM = (w > 100 ? w / 1000 : w);
            let lengthM = (l > 100 ? l / 1000 : l);
            
            p.m2Val = widthM * lengthM; // Площадь 1 листа в кв.м.
            p.wUnitVal = p.m2Val * t * 7.85; // Вес листа в кг
        } else {
            // Обычный профнастил
            p.m2Val = 1;
            p.wUnitVal = 5;
        }
    }

    // Если в specs уже есть значения веса или длины (пришли с бэкенда), используем их
    if (p.specs && Array.isArray(p.specs)) {
        p.specs.forEach(s => {
            let k = (s[0] || '').toLowerCase();
            let v = (s[1] || '').toLowerCase();
            if (k.includes('длина') || k.includes('раскрой')) {
                let m = v.match(/(\d+(?:[.,]\d+)?)/);
                if (m) {
                    let val = parseFloat(m[1].replace(',', '.'));
                    if (val > 100) val = val / 1000;
                    if (p.calcType === 'linear') p.mLenVal = val;
                }
            }
            if (k.includes('вес') || k.includes('масса')) {
                let m = v.match(/(\d+(?:[.,]\d+)?)/);
                if (m) {
                    p.wUnitVal = parseFloat(m[1].replace(',', '.'));
                }
            }
        });
    }

    return p;
}
module.exports = parseUniversalSpecs;
