# Реализация светлой темы и переключателя DARK/LIGHT

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Внедрить светлую тему «Champagne & Graphite» и индустриальный переключатель в шапку сайта без изменения UI.

**Architecture:** 
- Глобальное управление через `js/shared-ui.js` (инъекция кнопки, сохранение состояния в `localStorage`).
- Переключение классов `dark`/`light` на теге `<html>`.
- Обновление инлайновых конфигураций Tailwind в HTML файлах для поддержки светлых оттенков.

**Tech Stack:** JavaScript (Vanilla), Tailwind CSS, LocalStorage.

---

### Task 1: Подготовка shared-ui.js

**Files:**
- Modify: `js/shared-ui.js`

- [ ] **Step 1: Добавить логику инициализации темы**
Добавить в начало файла код, который проверяет `localStorage` или системные настройки и устанавливает соответствующий класс на `html`.

- [ ] **Step 2: Создать функцию переключения темы**
Реализовать функцию `toggleThemeGlobal()`, которая меняет классы и сохраняет состояние.

- [ ] **Step 3: Реализовать инъекцию кнопки-переключателя**
Обновить код инъекции хедера в `shared-ui.js`, чтобы добавить HTML-код индустриального ползунка.

- [ ] **Step 4: Добавить стили для ползунка**
Добавить CSS-стили для анимации и внешнего вида ползунка в блок стилей хедера.

---

### Task 2: Обновление конфигурации Tailwind в ключевых файлах

**Files:**
- Modify: `index.html`, `catalog.html`, `about.html`, `contacts.html`, `product.html`

- [ ] **Step 1: Обновить tailwind.config в index.html**
Добавить поддержку `light` цветов.
```javascript
theme: {
  extend: {
    colors: {
      // Существующие цвета...
      "light-background": "#F2EFED",
      "light-surface": "#EBE8E6",
      "light-on-surface": "#151311",
      "light-primary": "#CA7093",
    }
  }
}
```
*Примечание: Поскольку используется `darkMode: "class"`, стандартные классы `bg-background` будут заменены на `bg-background dark:bg-background light:bg-light-background` или аналогично через CSS переменные.*

- [ ] **Step 2: Применить классы тем ко всем ключевым секциям**
Пройтись по основным контейнерам и добавить префиксы `dark:` и `light:`.

- [ ] **Step 3: Повторить для остальных страниц**
Обновить конфигурации в `catalog.html`, `about.html`, `contacts.html`, `product.html`.

---

### Task 3: Тонкая настройка CSS и Иконок

**Files:**
- Modify: `js/shared-ui.js` (блок стилей)

- [ ] **Step 1: Добавить глобальные CSS-правила для светлой темы**
Добавить в `shared-ui.js` (или отдельный файл) стили, которые инвертируют иконки Material Symbols в светлой теме, если это необходимо.

- [ ] **Step 2: Настройка прозрачности и размытия**
Обновить класс `.liquid-glass`, чтобы он выглядел премиально и в светлой теме (изменить прозрачность белого на прозрачность серого/графитового).

---

### Task 4: Верификация и Финализация

- [ ] **Step 1: Проверить работу переключателя на всех страницах**
- [ ] **Step 2: Убедиться в сохранении состояния после перезагрузки**
- [ ] **Step 3: Проверить мобильную версию (меню и ползунок)**
- [ ] **Step 4: Проверить доступность (контрастность текста в светлой теме)**
