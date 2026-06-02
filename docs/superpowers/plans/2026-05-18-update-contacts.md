# Обновление контактных номеров - План реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Заменить текущий номер телефона на два (Отдел продаж и Руководитель) по всему сайту с соблюдением правил отображения.

**Architecture:** Обновление статического контента в HTML файлах и динамического контента в глобальном JS-файле. Вертикальная компоновка для обычных блоков и одиночный номер для CTA.

**Tech Stack:** HTML, JavaScript (Vanilla), Tailwind CSS.

---

### Task 1: Обновление глобального футера в `js/shared-ui.js`

**Files:**
- Modify: `js/shared-ui.js`

- [ ] **Step 1: Найти и заменить блок контактов в футере**

Заменить текущий блок:
```javascript
                        <div class="flex gap-3">
                            <span class="material-symbols-outlined text-primary text-[20px]">call</span>
                            <a href="tel:+79930777717" class="text-sm text-on-surface hover:text-primary transition-colors no-underline">+7 (993) 077-77-17</a>
                        </div>
```
на:
```javascript
                        <div class="flex flex-col gap-4">
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

- [ ] **Step 2: Проверить визуальное отображение**
(Визуальная проверка невозможна в CLI, поэтому полагаемся на корректность HTML/Tailwind)

- [ ] **Step 3: Commit**
```bash
git add js/shared-ui.js
git commit -m "feat: update global footer with two phone numbers"
```

### Task 2: Обновление страницы контактов `contacts.html`

**Files:**
- Modify: `contacts.html`

- [ ] **Step 1: Обновить основной блок контактов**

Заменить:
```html
<div class="flex items-start gap-stack-md">
<span class="material-symbols-outlined text-primary" data-icon="call">call</span>
<div>
<p class="text-on-surface font-bold"><a href="tel:+79930777717" class="no-underline text-on-surface hover:text-primary transition-colors">+7 (993) 077-77-17</a></p>
<p>Отдел продаж и логистики</p>
</div>
</div>
```
на:
```html
<div class="space-y-4">
    <div class="flex items-start gap-stack-md">
        <span class="material-symbols-outlined text-primary" data-icon="call">call</span>
        <div>
            <p class="text-on-surface font-bold"><a href="tel:+78129825320" class="no-underline text-on-surface hover:text-primary transition-colors">+7 (812) 982-53-20</a></p>
            <p class="text-sm opacity-70">Отдел продаж</p>
        </div>
    </div>
    <div class="flex items-start gap-stack-md">
        <span class="material-symbols-outlined text-primary" data-icon="call">call</span>
        <div>
            <p class="text-on-surface font-bold"><a href="tel:+79930777717" class="no-underline text-on-surface hover:text-primary transition-colors">+7 (993) 077-77-17</a></p>
            <p class="text-sm opacity-70">Руководитель отдела продаж</p>
        </div>
    </div>
</div>
```

- [ ] **Step 2: Обновить CTA блок "Срочная консультация"**

Заменить:
```html
<a class="flex items-center gap-stack-sm bg-surface-container-lowest text-on-surface px-stack-lg py-stack-md machined-border hover:bg-surface transition-colors" href="tel:+79930777717">
```
на:
```html
<a class="flex items-center gap-stack-sm bg-surface-container-lowest text-on-surface px-stack-lg py-stack-md machined-border hover:bg-surface transition-colors" href="tel:+78129825320">
```

- [ ] **Step 3: Commit**
```bash
git add contacts.html
git commit -m "feat: update contacts page with dual phone numbers and single sales CTA"
```

### Task 3: Обновление страницы `about.html`

**Files:**
- Modify: `about.html`

- [ ] **Step 1: Обновить блок контактов**

Заменить:
```html
                     <div class="flex gap-6 items-start group">
                         <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-white/10 rounded-full group-hover:border-primary transition-all">
                             <span class="material-symbols-outlined text-primary">call</span>
                         </div>
                         <div>
                             <h4 class="font-label-caps text-[10px] text-primary mb-1 tracking-widest uppercase">ТЕЛЕФОН</h4>
                             <p class="text-lg md:text-2xl font-bold"><a class="no-underline text-on-surface hover:text-primary transition-colors" href="tel:+79930777717">+7 (993) 077-77-17</a></p>
                             <p class="text-[10px] text-on-surface-variant opacity-60 uppercase tracking-widest">Пн–Пт: 08:00 – 20:00</p>
                         </div>
                     </div>
```
на:
```html
                     <div class="flex gap-6 items-start group">
                         <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-white/10 rounded-full group-hover:border-primary transition-all">
                             <span class="material-symbols-outlined text-primary">call</span>
                         </div>
                         <div class="space-y-4">
                             <div>
                                 <h4 class="font-label-caps text-[10px] text-primary mb-1 tracking-widest uppercase">ОТДЕЛ ПРОДАЖ</h4>
                                 <p class="text-lg md:text-2xl font-bold"><a class="no-underline text-on-surface hover:text-primary transition-colors" href="tel:+78129825320">+7 (812) 982-53-20</a></p>
                             </div>
                             <div>
                                 <h4 class="font-label-caps text-[10px] text-primary mb-1 tracking-widest uppercase">РУКОВОДИТЕЛЬ</h4>
                                 <p class="text-lg md:text-2xl font-bold"><a class="no-underline text-on-surface hover:text-primary transition-colors" href="tel:+79930777717">+7 (993) 077-77-17</a></p>
                             </div>
                             <p class="text-[10px] text-on-surface-variant opacity-60 uppercase tracking-widest">Пн–Пт: 08:00 – 20:00</p>
                         </div>
                     </div>
```

- [ ] **Step 2: Commit**
```bash
git add about.html
git commit -m "feat: update about page with dual phone numbers"
```

### Task 4: Обновление демо-файлов и вариаций

**Files:**
- Modify: `_3/code.html`, `_7/code.html`, `_8/code.html`, `product-demo.html`

- [ ] **Step 1: Применить аналогичные изменения во всех файлах**
Использовать паттерн из Task 2/3 для замены одиночного номера на два в блоках контактов.

- [ ] **Step 2: Commit**
```bash
git add _3/code.html _7/code.html _8/code.html product-demo.html
git commit -m "feat: update remaining demo files with dual phone numbers"
```
