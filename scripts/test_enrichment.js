// This script tests the universal product enrichment logic.

function parseUniversalSpecs(p) {
    let specs = [];
    try {
        if (typeof p.specs === 'string') specs = JSON.parse(p.specs);
        else if (Array.isArray(p.specs)) specs = p.specs;
    } catch (e) {}

    if (Array.isArray(specs)) {
        specs = specs.map(s => {
            if (Array.isArray(s)) return s;
            if (typeof s === 'string') {
                const parts = s.split(':');
                return [parts[0] ? parts[0].trim() : '', parts.slice(1).join(':') ? parts.slice(1).join(':').trim() : ''];
            }
            return ['', ''];
        }).filter(s => s[0]);
    }

    const catLow = (p.category || '').toLowerCase();
    const nameLow = (p.name || '').toLowerCase();

    const isArmatura = catLow.includes('арматур') || nameLow.includes('арматур');
    const isTube = catLow.includes('труб') || nameLow.includes('труб');
    const isBeam = catLow.includes('балк') || nameLow.includes('балк') || nameLow.includes('двутавр');
    const isChannel = catLow.includes('швеллер') || nameLow.includes('швеллер');
    const isAngle = catLow.includes('уголок') || nameLow.includes('уголок');
    const isSheet = catLow.includes('лист') || nameLow.includes('лист') || catLow.includes('профнастил') || nameLow.includes('профнастил');

    // General extractors
    const getSpec = (keywords) => {
        const found = specs.find(s => keywords.some(k => s[0].toLowerCase().includes(k.toLowerCase())));
        return found ? found[1] : null;
    };

    let len = p.length ? String(p.length) : (getSpec(['длина']) || 'Немерная');
    let mLenVal = parseFloat(len.match(/[\d\.]+/)?.[0] || (isSheet ? 0 : 6));
    let width = getSpec(['ширина']);
    let mWidthVal = parseFloat((width || '').match(/[\d\.]+/)?.[0] || 0);

    let steel = getSpec(['марка', 'сталь']) || 'Ст3';
    let gost = getSpec(['гост', 'стандарт']) || 'ГОСТ';
    
    // Determine Weight per meter or piece
    let wUnit = 0;
    const specW = getSpec(['вес', 'масса']);
    if (specW) {
        const parsedW = parseFloat(specW.match(/[\d\.]+/)?.[0]);
        if (parsedW) wUnit = parsedW;
    }

    let finalSpecs = [];
    let priceTypes = []; // ['whip', 'meter', 'ton'] or ['sheet', 'm2', 'ton']

    if (isArmatura) {
        // Armatura logic
        let diam = (nameLow.match(/(\d+)\s*мм/) || [])[1] || '10';
        let diamNum = parseFloat(diam);
        
        let cls = nameLow.includes('а1') || nameLow.includes('а240') ? 'A1' : 'A3';
        let clsArm = cls === 'A1' ? 'A240' : 'А500С';
        let surface = cls === 'A1' ? 'Гладкая' : 'Периодический профиль (рифленая)';
        gost = cls === 'A1' ? '5781, 34028' : '34028, 52544';

        if (!wUnit) {
            const weightMap = { 6: 0.222, 8: 0.395, 10: 0.617, 12: 0.888, 14: 1.21, 16: 1.58, 18: 2.0, 20: 2.47, 22: 2.98, 25: 3.85, 28: 4.83, 32: 6.31, 36: 7.99, 40: 9.87 };
            wUnit = weightMap[diamNum] || 0.617;
        }

        let metersInTon = Math.round(1000 / wUnit);
        let whipsInTon = Math.round(metersInTon / mLenVal);

        if (diamNum === 6) { metersInTon = 3996; whipsInTon = 666; }
        else if (diamNum === 8) { metersInTon = 2400; whipsInTon = 400; }
        else if (diamNum === 10) { whipsInTon = mLenVal === 6 ? 260 : 133; metersInTon = whipsInTon * mLenVal; }
        else if (diamNum === 12) { whipsInTon = mLenVal === 6 ? 183 : 94; metersInTon = whipsInTon * mLenVal; }
        else if (diamNum === 14) { whipsInTon = 70; metersInTon = whipsInTon * mLenVal; }

        finalSpecs = [
            ['ГОСТ', gost], ['Назначение', 'Для фундамента'], ['Форма', 'Круглая'],
            ['Класс арматуры', clsArm], ['Класс', cls], ['Диаметр', diam + ' мм'],
            ['Вес', wUnit + ' кг'], ['Количество метров в 1 тонне', metersInTon + ' м'],
            ['Длина', len], ['Прутов в тонне', whipsInTon + ' шт'], ['Тип поверхности', surface]
        ];
        
        p.calcParams = { lengthVal: mLenVal, weightVal: wUnit, isLinear: true };

    } else if (isTube) {
        let diam = (nameLow.match(/(\d+)[хx*](\d+(\.\d+)?)/) || [])[0] || getSpec(['диаметр']) || '-';
        if (!wUnit) wUnit = 2.0; // dummy fallback
        let metersInTon = Math.round(1000 / wUnit);
        let whipsInTon = Math.round(metersInTon / (mLenVal || 6));
        
        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Размер', diam],
            ['Вес 1 м', wUnit + ' кг'], ['Метров в 1 тонне', metersInTon + ' м'],
            ['Длина', len], ['Труб в тонне', whipsInTon + ' шт']
        ];
        p.calcParams = { lengthVal: mLenVal || 6, weightVal: wUnit, isLinear: true };

    } else if (isBeam || isChannel || isAngle) {
        let size = (nameLow.match(/\d+[а-яА-Я]?/) || [])[0] || '-';
        if (!wUnit) wUnit = 10.0; // dummy fallback
        let metersInTon = Math.round(1000 / wUnit);
        let whipsInTon = Math.round(metersInTon / (mLenVal || 12));

        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Размер/Профиль', size],
            ['Вес 1 м', wUnit + ' кг'], ['Метров в 1 тонне', metersInTon + ' м'],
            ['Длина', len], ['Хлыстов в тонне', whipsInTon + ' шт']
        ];
        p.calcParams = { lengthVal: mLenVal || 12, weightVal: wUnit, isLinear: true };

    } else if (isSheet) {
        let thick = (nameLow.match(/(\d+(\.\d+)?)\s*мм/) || [])[1] || getSpec(['толщина']) || '-';
        let dimensions = (nameLow.match(/\d+\s*[хx*]\s*\d+/) || [])[0] || getSpec(['раскрой']) || '1250х2500';
        let dParts = dimensions.replace(/х/i, 'x').split('x');
        let m2 = 1;
        if (dParts.length === 2) {
            m2 = (parseFloat(dParts[0]) * parseFloat(dParts[1])) / 1000000;
        }
        if (!wUnit) wUnit = m2 * parseFloat(thick) * 7.85; // rough steel weight
        let sheetsInTon = wUnit > 0 ? Math.round(1000 / wUnit) : 0;

        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Толщина', thick + ' мм'],
            ['Раскрой', dimensions + ' мм'], ['Площадь листа', m2.toFixed(2) + ' м2'],
            ['Вес листа', wUnit.toFixed(2) + ' кг'], ['Листов в тонне', sheetsInTon + ' шт']
        ];
        p.calcParams = { lengthVal: m2, weightVal: wUnit, isLinear: false, areaVal: m2 };

    } else {
        // Generic logic
        finalSpecs = specs;
        if (!finalSpecs.length) {
            finalSpecs = [['ГОСТ', gost], ['Марка стали', steel], ['Вес', wUnit + ' кг']];
        }
        p.calcParams = { lengthVal: mLenVal || 1, weightVal: wUnit || 1, isLinear: true };
    }

    p.specs = finalSpecs;
    return p;
}

console.log(parseUniversalSpecs({ name: 'Арматура 10 мм А500С', category: 'Черный металлопрокат' }));
console.log(parseUniversalSpecs({ name: 'Труба профильная 40х20х2', category: 'Трубы' }));
console.log(parseUniversalSpecs({ name: 'Лист горячекатаный 2.0 мм 1250х2500', category: 'Листовой прокат' }));

