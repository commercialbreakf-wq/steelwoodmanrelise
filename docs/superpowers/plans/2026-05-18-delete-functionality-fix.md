# Исправление и улучшение удаления: План реализации

> **Для агентных исполнителей:** ТРЕБУЕМЫЙ ДОП-НАВЫК: Используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для пошагового выполнения этого плана. Шаги используют синтаксис чекбоксов (`- [ ]`) для отслеживания.

**Цель:** Обеспечить стабильную работу кнопок удаления в списках Лидов и Обращений, а также добавить возможность удаления прямо из интерфейса техподдержки и модальных окон.

**Архитектура:** Переход на управление подписками (cleanup pattern) в компонентах, использование актуальных ссылок на DOM-узлы, расширение UI интерфейсов удаления.

**Стек:** JavaScript, DOM API, Supabase API.

---

### Задача 1: Исправление логики в `js/admin/components/leads.js`

**Файлы:**
- Модифицировать: `js/admin/components/leads.js`

- [ ] **Шаг 1: Добавить механизм очистки слушателей**
Добавить переменную для хранения функции отписки и вызывать её перед новой подпиской.

```javascript
// В начале renderLeadsView добавить:
if (window._leadsUnsubscribe) {
    window._leadsUnsubscribe();
    window._leadsUnsubscribe = null;
}

// При подписке сохранить функцию:
window._leadsUnsubscribe = state.on('leads:updated', (newLeads) => {
    const freshTableContainer = document.getElementById('leads-table-container');
    if (!freshTableContainer) return;
    // ... логика фильтрации и рендер в freshTableContainer
});
```

- [ ] **Шаг 2: Добавить кнопку удаления в `openLeadDrawer`**
Обновить шаблон модального окна, добавив кнопку удаления в шапку рядом с кнопкой закрытия.

```javascript
// В хедер модального окна (modalWrapper.innerHTML):
<div class="flex items-center gap-2">
    <button id="delete-lead-drawer-btn" class="w-10 h-10 rounded-full hover:bg-red-500/10 flex items-center justify-center transition-colors text-red-400" title="Удалить обращение">
        <span class="material-symbols-outlined">delete</span>
    </button>
    <button id="close-lead-modal" ...>
</div>
```

- [ ] **Шаг 3: Реализовать логику удаления в Drawer**
Добавить обработчик клика для новой кнопки.

```javascript
modalWrapper.querySelector('#delete-lead-drawer-btn').onclick = async () => {
    if (confirm('Удалить это обращение безвозвратно?')) {
        try {
            await state.authenticatedFetch(`/api/admin/leads/${leadId}`, { method: 'DELETE' });
            close(); // закрыть модалку
            await state.fetchLeads(); // обновить список
        } catch(e) { alert('Ошибка: ' + e.message); }
    }
};
```

### Задача 2: Реализация удаления в `js/admin/components/support.js`

**Файлы:**
- Модифицировать: `js/admin/components/support.js`

- [ ] **Шаг 1: Добавить кнопку удаления в список чатов**
Обновить `renderChatItem`, добавив иконку корзины, которая появляется при наведении (group-hover).

```javascript
// В шаблон renderChatItem:
<div class="chat-item relative group ...">
    <button class="delete-chat-btn absolute right-2 bottom-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all z-10" data-id="${topic.id}" data-type="${topic.type}">
        <span class="material-symbols-outlined text-sm">delete</span>
    </button>
    ...
</div>
```

- [ ] **Шаг 2: Добавить кнопку удаления в окно чата**
Обновить хедер в `renderChatWindow`.

```javascript
// В хедер renderChatWindow:
<div class="flex items-center gap-2">
    <button id="delete-active-chat-btn" class="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all" title="Удалить диалог">
        <span class="material-symbols-outlined text-sm">delete</span>
    </button>
    <button id="view-source-btn" ...>
</div>
```

- [ ] **Шаг 3: Реализовать функцию `deleteTopic`**
Добавить общую функцию для удаления заказов или лидов из интерфейса саппорта.

```javascript
const deleteTopic = async (id, type) => {
    const label = type === 'order' ? 'заказ' : 'обращение';
    if (!confirm(`Удалить ${label} и всю историю переписки?`)) return;

    try {
        const endpoint = type === 'order' ? `/api/admin/orders/${id}` : `/api/admin/leads/${id}`;
        await state.authenticatedFetch(endpoint, { method: 'DELETE' });
        
        if (activeTopic && String(activeTopic.id) === String(id) && activeTopic.type === type) {
            activeTopic = null;
            document.getElementById('support-chat-window').innerHTML = '...'; // сброс окна
        }
        await fetchTopics(); // обновить список чатов
    } catch (err) {
        alert('Ошибка удаления: ' + err.message);
    }
};
```

- [ ] **Шаг 4: Привязать обработчики в `renderChatList` и `renderChatWindow`**
Использовать `e.stopPropagation()` для кнопки в списке, чтобы не открывать чат при удалении.

### Задача 3: Backend логирование (опционально для отладки)

**Файлы:**
- Модифицировать: `api/[...slug].js`

- [ ] **Шаг 1: Добавить логи в DELETE обработчики**
Добавить `console.log` для отслеживания входящих запросов на удаление.

```javascript
// В router.delete('/admin/leads/:id', ...)
console.log(`[API] Admin DELETE Lead: ${id}`);
```

---

### Верификация
1. Открыть раздел «Заявки», переключиться на другую вкладку и вернуться. Попробовать удалить лид. Кнопка должна работать.
2. Открыть лид в модальном окне, нажать на корзину в шапке. Лид должен удалиться, модалка закрыться, список обновиться.
3. Перейти в «Техподдержка» -> «Чаты». Навести на чат в списке, нажать на появившуюся корзину.
4. Открыть чат, нажать на корзину в шапке окна чата.
