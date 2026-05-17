# Image Upload Support in Product Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add file upload support to Step 2 of the Product Wizard in `admin.html` to allow local image selection and storage as Base64.

**Architecture:** Use `FileReader` API in the browser to convert selected image files to Base64 Data URLs. Update the existing `wizardData.image` state and provide immediate visual feedback.

**Tech Stack:** HTML5, JavaScript (FileReader API), Tailwind CSS (for UI).

---

### Task 1: Update UI in Step 2

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add upload button and hidden file input**

In Step 2 of the wizard, replace the existing image URL input group with a flex container that includes an upload button.

```html
<!-- Inside wizard-step-2 -->
<div>
    <label class="text-[10px] font-display uppercase tracking-widest opacity-50 mb-1 block">Изображение (URL или файл)</label>
    <div class="flex gap-2">
        <input type="text" id="wiz-image" oninput="updateWizPreview()" class="flex-1 bg-surface-container border border-outline-variant/20 rounded-xl px-4 py-3 outline-none focus:border-primary text-sm"/>
        <button type="button" onclick="document.getElementById('wiz-image-file').click()" class="px-4 py-3 bg-white/5 border border-outline-variant/20 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2" title="Загрузить файл">
            <span class="material-symbols-outlined text-[18px]">upload</span>
        </button>
    </div>
    <input type="file" id="wiz-image-file" accept="image/*" class="hidden" onchange="handleFileSelect(event)">
</div>
```

- [ ] **Step 2: Commit UI changes**

```bash
git add admin.html
git commit -m "ui: add upload button and hidden file input to product wizard"
```

---

### Task 2: Implement Logic for File Selection

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Add handleFileSelect function**

Add the `handleFileSelect` function to the script section of `admin.html`.

```javascript
// Add this function near other wizard functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения (png, jpg, webp, etc.)');
        return;
    }

    // Optional: Size limit check (e.g., 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер 2МБ');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        wizardData.image = base64;
        
        // Visual indicator in the text input
        const input = document.getElementById('wiz-image');
        input.value = '[Файл загружен: ' + file.name + ']';
        
        updateWizPreview();
    };
    reader.readAsDataURL(file);
}
```

- [ ] **Step 2: Update saveWizardStep2 to handle the placeholder**

Modify `saveWizardStep2` to avoid overwriting `wizardData.image` with the placeholder text if it starts with `[Файл загружен`.

```javascript
function saveWizardStep2() {
    const name = document.getElementById('wiz-name').value.trim();
    const category = document.getElementById('wiz-cat').value;
    const slug = document.getElementById('wiz-slug').value.trim();
    const imageInput = document.getElementById('wiz-image').value.trim();

    if (!name) {
        alert('Введите наименование');
        return false;
    }
    if (!category) {
        alert('Выберите категорию');
        return false;
    }

    wizardData.name = name;
    wizardData.category = category;
    wizardData.id = slug;
    
    // Only update image if it's NOT the placeholder text
    if (!imageInput.startsWith('[Файл загружен')) {
        wizardData.image = imageInput;
    }
    
    return true;
}
```

- [ ] **Step 3: Commit logic changes**

```bash
git add admin.html
git commit -m "feat: implement file selection logic and base64 conversion"
```

---

### Task 3: Verification

- [ ] **Step 1: Test picking a local image**
- [ ] **Step 2: Verify preview updates immediately**
- [ ] **Step 3: Verify image persists to Step 5 (Preview)**
- [ ] **Step 4: Verify saving works and image is stored as Base64 in the database**
- [ ] **Step 5: Final Commit**

```bash
git add admin.html
git commit -m "test: verify image upload functionality in wizard"
```
