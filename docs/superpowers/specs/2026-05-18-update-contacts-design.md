# Дизайн-спецификация: Обновление контактных номеров

**Дата:** 2026-05-18
**Статус:** На утверждении

## 1. Цель
Обновить контактную информацию на сайте, заменив один номер телефона на два, с разделением по ролям: Отдел продаж и Руководитель отдела продаж.

## 2. Данные
*   **Номер 1:** `+7 (812) 982-53-20` (Отдел продаж)
*   **Номер 2:** `+7 (993) 077-77-17` (Руководитель отдела продаж)

## 3. Логика размещения
### 3.1 Секции "Срочная линия" (CTA блоки)
В блоках быстрой связи (например, "Нужна срочная консультация?") указывается **только** номер отдела продаж.
*   **Текст:** ПРЯМАЯ ЛИНИЯ
*   **Номер:** `+7 (812) 982-53-20`

### 3.2 Основные контактные блоки (Footer, Contacts, About)
Во всех остальных местах отображаются оба номера, расположенные вертикально (Вариант С).

#### Формат в футере (js/shared-ui.js):
```html
<div class="flex flex-col gap-2">
    <div class="flex gap-3">
        <span class="material-symbols-outlined text-primary text-[20px]">call</span>
        <div class="flex flex-col">
            <a href="tel:+78129825320" class="text-sm text-on-surface hover:text-primary transition-colors no-underline font-bold">+7 (812) 982-53-20</a>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">Отдел продаж</span>
        </div>
    </div>
    <div class="flex gap-3">
        <span class="material-symbols-outlined text-primary text-[20px]">call</span>
        <div class="flex flex-col">
            <a href="tel:+79930777717" class="text-sm text-on-surface hover:text-primary transition-colors no-underline font-bold">+7 (993) 077-77-17</a>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-widest opacity-60">Руководитель</span>
        </div>
    </div>
</div>
```

#### Формат на странице Контакты (contacts.html):
Аналогичная структура с использованием CSS-классов Tailwind для вертикального стека.

## 4. Список файлов для изменения
1.  `js/shared-ui.js` — Глобальный футер (внедряется через JS).
2.  `contacts.html` — Основная страница контактов.
3.  `about.html` — Блок контактов внизу страницы.
4.  `_3/code.html`, `_7/code.html`, `_8/code.html`, `product-demo.html` — Локальные копии/демо страниц.

## 5. План тестирования
1.  Проверить корректность ссылок `tel:` для обоих номеров.
2.  Проверить адаптивность футера (номера не должны "слипаться" на мобильных).
3.  Убедиться, что в CTA-блоке "Срочная линия" остался только один правильный номер.
