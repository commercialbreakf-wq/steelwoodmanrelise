const fs = require('fs');
const path = require('path');

const logic = `
// Универсальная логика обогащения параметров
window.parseUniversalSpecs = function(p) {
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

    const getSpec = (keywords) => {
        const found = specs.find(s => keywords.some(k => s[0].toLowerCase().includes(k.toLowerCase())));
        return found ? found[1] : null;
    };

    let len = p.length ? String(p.length) : (getSpec(['длина']) || (isSheet ? '-' : 'Немерная'));
    let mLenVal = parseFloat(len.replace(',', '.').match(/[\\d\\.]+/)?.[0] || (isSheet ? 0 : 6));
    let width = getSpec(['ширина']);

    let steel = getSpec(['марка', 'сталь']) || 'Ст3';
    let gost = getSpec(['гост', 'стандарт']) || 'ГОСТ';
    
    let wUnit = 0;
    const specW = getSpec(['вес', 'масса']);
    if (specW) {
        const parsedW = parseFloat(specW.replace(',', '.').match(/[\\d\\.]+/)?.[0]);
        if (parsedW) wUnit = parsedW;
    }

    let finalSpecs = [];
    let calcType = 'linear'; // linear or area
    let m2 = 0;

    if (isArmatura) {
        let diam = (nameLow.match(/(\\d+)\\s*мм/) || [])[1] || '10';
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
        calcType = 'linear';

    } else if (isTube) {
        let diam = (nameLow.match(/(\\d+)[хx*](\\d+(\\.\\d+)?)/) || [])[0] || getSpec(['диаметр', 'размер']) || '-';
        if (!wUnit) wUnit = 2.0; 
        let metersInTon = Math.round(1000 / wUnit);
        let whipsInTon = Math.round(metersInTon / (mLenVal || 6));
        
        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Размер', diam],
            ['Вес 1 м', wUnit + ' кг'], ['Метров в 1 тонне', metersInTon + ' м'],
            ['Длина', len], ['Труб в тонне', whipsInTon + ' шт']
        ];
        calcType = 'linear';

    } else if (isBeam || isChannel || isAngle) {
        let size = (nameLow.match(/\\d+[а-яА-Я]?/) || [])[0] || '-';
        if (!wUnit) wUnit = 10.0; 
        let metersInTon = Math.round(1000 / wUnit);
        let whipsInTon = Math.round(metersInTon / (mLenVal || 12));

        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Размер/Профиль', size],
            ['Вес 1 м', wUnit + ' кг'], ['Метров в 1 тонне', metersInTon + ' м'],
            ['Длина', len], ['Хлыстов в тонне', whipsInTon + ' шт']
        ];
        calcType = 'linear';

    } else if (isSheet) {
        let thick = (nameLow.match(/(\\d+(\\.\\d+)?)\\s*мм/) || [])[1] || getSpec(['толщина']) || '-';
        let dimensions = (nameLow.match(/\\d+\\s*[хx*]\\s*\\d+/) || [])[0] || getSpec(['раскрой']) || '1250х2500';
        let dParts = dimensions.replace(/х/i, 'x').split('x');
        m2 = 1;
        if (dParts.length === 2) {
            m2 = (parseFloat(dParts[0]) * parseFloat(dParts[1])) / 1000000;
        }
        if (!wUnit) wUnit = m2 * parseFloat(thick) * 7.85; 
        let sheetsInTon = wUnit > 0 ? Math.round(1000 / wUnit) : 0;

        finalSpecs = [
            ['ГОСТ', gost], ['Марка стали', steel], ['Толщина', thick + ' мм'],
            ['Раскрой', dimensions + ' мм'], ['Площадь листа', m2.toFixed(2) + ' м2'],
            ['Вес листа', wUnit.toFixed(2) + ' кг'], ['Листов в тонне', sheetsInTon + ' шт']
        ];
        calcType = 'area';

    } else {
        finalSpecs = specs;
        if (!finalSpecs.length) {
            finalSpecs = [['ГОСТ', gost], ['Марка стали', steel], ['Вес', wUnit + ' кг']];
        }
        calcType = 'linear';
    }

    p.specs = finalSpecs;
    p.calcType = calcType;
    p.mLenVal = mLenVal || 1;
    p.m2Val = m2 || 1;
    p.wUnitVal = wUnit || 1;
    p.isSheet = isSheet;
    
    return p;
};
`;

const filesToUpdate = ['js/shared-ui.js', 'js/shared-ui-copy.js'];
filesToUpdate.forEach(file => {
    const fullPath = path.join(__dirname, '..', file);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (!content.includes('parseUniversalSpecs')) {
        fs.writeFileSync(fullPath, content + '\\n' + logic);
        console.log('Injected logic into ' + file);
    } else {
        console.log('Logic already exists in ' + file);
    }
});
