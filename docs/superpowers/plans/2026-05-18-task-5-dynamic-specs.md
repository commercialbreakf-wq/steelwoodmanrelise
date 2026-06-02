# CRM Admin Upgrade - Task 5: Dynamic Specs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement dynamic product characteristics rendering in the Admin Wizard based on the selected category.

**Architecture:** Define a static mapping of categories to required fields. When Step 3 of the Wizard is active, render input fields based on this mapping and store the values in the `wizardData.specs` object.

**Tech Stack:** Vanilla JavaScript, Tailwind CSS.

---

### Task 1: Define `catSpecs` and Step 3 Initialization

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add `catSpecs` mapping and `renderSmartSpecs` function**

In the `<script>` section of `admin.html`, before `initAdmin` function, add the `catSpecs` object and the `renderSmartSpecs` function.

```javascript
const catSpecs = {
    'Трубы': ['Диаметр', 'Стенка', 'Длина'],
    'Листы': ['Толщина', 'Ширина', 'Длина'],
    'Сортовой прокат': ['Размер', 'Марка стали'],
    'Арматура': ['Диаметр', 'Класс'],
    'Балка': ['Размер', 'Длина'],
    'Швеллер': ['Размер', 'Длина'],
    'Уголок': ['Размер', 'Стенка', 'Длина'],
    'Круг': ['Диаметр', 'Марка стали'],
    'Квадрат': ['Размер', 'Марка стали'],
    'Проволока': ['Диаметр', 'Тип'],
    'Сетка': ['Ячейка', 'Диаметр', 'Размер'],
};

function renderSmartSpecs(category) {
    const container = document.getElementById('wizard-step-3');
    container.innerHTML = '';
    container.className = 'wizard-step space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300';
    
    const title = document.createElement('h3');
    title.className = 'font-display font-bold uppercase tracking-widest text-sm text-center mb-6';
    title.textContent = 'Характеристики: ' + category;
    container.appendChild(title);

    const fields = catSpecs[category] || ['Характеристика 1', 'Характеристика 2', 'Характеристика 3'];
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    
    fields.forEach(field => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label class="text-[10px] font-display uppercase tracking-widest opacity-50 mb-1 block">\${field}</label>
            <input type="text" 
                   data-spec-key="\${field}" 
                   value="\${(wizardData.specs && wizardData.specs[field]) || ''}" 
                   oninput="updateWizardSpec('\${field}', this.value)"
                   class="w-full bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"/>
        `;
        grid.appendChild(div);
    });
    
    container.appendChild(grid);
}

function updateWizardSpec(key, value) {
    if (!wizardData.specs) wizardData.specs = {};
    wizardData.specs[key] = value;
}
```

- [ ] **Step 2: Update `nextStep` to call `renderSmartSpecs`**

Modify the `nextStep` function to call `renderSmartSpecs` when moving to Step 3.

```javascript
        function nextStep() {
            if (currentWizardStep === 2) {
                saveWizardStep2();
                renderSmartSpecs(wizardData.category);
            }
            
            if (currentWizardStep < 5) {
                currentWizardStep++;
                showWizardStep(currentWizardStep);
            } else {
                handleWizardSubmit();
            }
        }
```

- [ ] **Step 3: Update `wizard-step-3` placeholder in HTML**

Locate the `wizard-step-3` div and remove the "Шаг 3" placeholder text.

```html
<!-- Step 3: Характеристики -->
<div id="wizard-step-3" class="wizard-step hidden"></div>
```

- [ ] **Step 4: Update `selectCloneProduct` to handle specs**

Ensure that when cloning, `specs` are also handled (they should be already in `wizardData` if the source product has them).

- [ ] **Step 5: Commit changes**

```bash
git add admin.html
git commit -m "feat: implement dynamic specs rendering in admin wizard"
```
