# Дизайн-документ: Исправление фильтрации заказов

## Проблема
Во вкладке «Новые» раздела заказов не отображаются все заказы, если их статус записан по-разному (например, `new` или `новый`). Пользователь ожидает, что оба варианта будут сгруппированы в этой вкладке.

## Цели
1. Настроить вкладку «Новые» для отображения заказов со статусом `new` или `новый`.
2. Обеспечить корректный подсчет количества заказов для этой вкладки.
3. Привести логику фильтрации в соответствие с разделом «Заявки» (Leads), где, по мнению пользователя, всё работает корректно.

## Изменения

### 1. Файл `js/admin/components/orders.js`

#### Функция `getStatusCount`
Обновить логику подсчета так, чтобы при запросе статуса `new` учитывались оба варианта:
```javascript
const getStatusCount = (status) => {
    if (!status) return orders.length;
    const s = status.toLowerCase().trim();
    return orders.filter(o => {
        const os = (o.status || 'new').toLowerCase().trim();
        if (s === 'new') return os === 'new' || os === 'новый';
        return os === s;
    }).length;
};
```

#### Функция `updateTable` (внутри `renderOrdersWithFilters`)
Обновить фильтрацию списка:
```javascript
const filtered = sortedOrders.filter(o => {
    const os = (o.status || 'new').toLowerCase().trim();
    const fs = (currentStatus || '').toLowerCase().trim();
    if (!fs) return true;
    if (fs === 'new') return os === 'new' || os === 'новый';
    return os === fs;
});
```

#### Функция `renderOrdersTable`
1. Обновить `statusClasses` и `selectClasses`, чтобы они корректно обрабатывали статус `новый`.
2. Обновить логику выбора текущего значения в `<select>`, чтобы пункт «Новый» был выбран, если статус равен `new` или `новый`.

## План реализации
1. Модификация `js/admin/components/orders.js` согласно дизайну.
2. Проверка работоспособности: выбор вкладки «Новые» должен отображать заказы с обоими типами статусов.
3. Проверка счетчиков во вкладках.
