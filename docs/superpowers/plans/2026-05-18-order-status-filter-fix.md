# Исправление фильтрации статусов заказов: План реализации

> **Для агентных исполнителей:** ТРЕБУЕМЫЙ ДОП-НАВЫК: Используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для пошагового выполнения этого плана. Шаги используют синтаксис чекбоксов (`- [ ]`) для отслеживания.

**Цель:** Настроить вкладку «Новые» в админ-панели заказов так, чтобы она отображала заказы со статусами `new` и `новый`, а также корректно отображала их в таблице.

**Архитектура:** Обновление логики фильтрации и подсчета в компоненте заказов, а также расширение маппинга стилей для поддержки кириллического статуса.

**Стек:** JavaScript (ES Modules), Tailwind CSS.

---

### Задача 1: Обновление логики подсчета и фильтрации

**Файлы:**
- Модифицировать: `js/admin/components/orders.js`

- [ ] **Шаг 1: Обновить функцию `getStatusCount`**
Изменить логику так, чтобы при поиске 'new' учитывался и статус 'новый'.

```javascript
// Найти:
const getStatusCount = (status) => {
    if (!status) return orders.length;
    return orders.filter(o => (o.status || 'new').toLowerCase().trim() === status.toLowerCase().trim()).length;
};

// Заменить на:
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

- [ ] **Шаг 2: Обновить логику фильтрации в `updateTable`**
Обновить условие в методе `filtered` внутри `renderOrdersWithFilters`.

```javascript
// Найти:
const filtered = sortedOrders.filter(o => {
    const status = (o.status || 'new').toLowerCase().trim();
    const filterStatus = (currentStatus || '').toLowerCase().trim();
    return !filterStatus || status === filterStatus;
});

// Заменить на:
const filtered = sortedOrders.filter(o => {
    const os = (o.status || 'new').toLowerCase().trim();
    const fs = (currentStatus || '').toLowerCase().trim();
    if (!fs) return true;
    if (fs === 'new') return os === 'new' || os === 'новый';
    return os === fs;
});
```

- [ ] **Шаг 3: Коммит**
```bash
git add js/admin/components/orders.js
git commit -m "fix(admin): update order status filtering to support 'новый' status in 'new' tab"
```

### Задача 2: Обновление отображения таблицы и стилей

**Файлы:**
- Модифицировать: `js/admin/components/orders.js`

- [ ] **Шаг 1: Обновить маппинги статусов в `renderOrdersTable`**
Добавить поддержку статуса `новый` для CSS-классов строк и селектов.

```javascript
// Найти и обновить statusClasses:
const statusClasses = {
    'new': 'bg-blue-500/5 border-l-4 border-l-blue-500/50',
    'новый': 'bg-blue-500/5 border-l-4 border-l-blue-500/50', // Добавлено
    'processing': 'bg-yellow-500/5 border-l-4 border-l-yellow-500/50',
    // ...
};

// Найти и обновить selectClasses:
const selectClasses = {
    'new': 'text-blue-400 border-blue-500/30',
    'новый': 'text-blue-400 border-blue-500/30', // Добавлено
    'processing': 'text-yellow-400 border-yellow-500/30',
    // ...
};
```

- [ ] **Шаг 2: Обновить логику `selected` в выпадающем списке статусов**
Обновить условие для опции `value="new"`.

```javascript
// Найти:
<option value="new" ${status === 'new' ? 'selected' : ''}>Новый</option>

// Заменить на:
<option value="new" ${status === 'new' || status === 'новый' ? 'selected' : ''}>Новый</option>
```

- [ ] **Шаг 3: Верификация**
Так как тесты UI требуют браузера, убедиться визуально или через лог в консоли (если доступно), что заказы фильтруются корректно.

- [ ] **Шаг 4: Коммит**
```bash
git add js/admin/components/orders.js
git commit -m "ui(admin): support 'новый' status visualization in orders table"
```
