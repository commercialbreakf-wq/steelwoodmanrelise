# 100vh Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set the height of main sections to `100vh - header height` (80px) on targeted pages (About, Services, Calculator) to create a consistent, slide-like navigation experience.

**Architecture:** 
1. Define a global CSS variable `--header-height: 80px` in the shared JS.
2. Update hero and content sections across targeted HTML files to use `h-[calc(100vh-var(--header-height))]` or `min-h-[calc(100vh-var(--header-height))]`.
3. Ensure consistent `scroll-mt-20` for all target sections.

**Tech Stack:** HTML, Tailwind CSS, JavaScript.

---

### Task 1: Global CSS Variable

**Files:**
- Modify: `js/shared-ui.js`

- [ ] **Step 1: Add --header-height to global styles**
Add `:root { --header-height: 80px; }` to the `style` block injected in `js/shared-ui.js`.

- [ ] **Step 2: Commit**
```bash
git add js/shared-ui.js
git commit -m "style: add global --header-height CSS variable"
```

### Task 2: Update About Company Pages

**Files:**
- Modify: `about.html`, `logistics.html`, `certificates.html`, `contacts.html`

- [ ] **Step 1: Update about.html**
Change heights for `#hero`, `#about-hero-target`, and `#access-points`.
- [ ] **Step 2: Update logistics.html**
Change height for `#hero`.
- [ ] **Step 3: Update certificates.html**
Change heights for `#hero` and `#certs-hero-target`.
- [ ] **Step 4: Update contacts.html**
Change height for `#hero`.

- [ ] **Step 5: Commit**
```bash
git add about.html logistics.html certificates.html contacts.html
git commit -m "style: update About pages sections to 100vh - header height"
```

### Task 3: Update Services Page

**Files:**
- Modify: `services.html`

- [ ] **Step 1: Update services.html sections**
Change heights for `#hero`, `#services-hero-target`, `#laser-variants`, `#tech-matrix`, and `#cta-footer-merged`. Ensure `scroll-mt-20` is consistent.

- [ ] **Step 2: Commit**
```bash
git add services.html
git commit -m "style: update Services page sections to 100vh - header height"
```

### Task 4: Update Calculator Page

**Files:**
- Modify: `calculator.html`

- [ ] **Step 1: Update calculator.html sections**
Change heights for `#hero` and `#calculator-content`.

- [ ] **Step 2: Commit**
```bash
git add calculator.html
git commit -m "style: update Calculator page sections to 100vh - header height"
```

### Task 5: Verification

- [ ] **Step 1: Visual check (Inquiry)**
Review the changes in the browser if possible, or confirm class changes across all modified files.
