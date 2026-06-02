# CRM Admin SPA Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `admin.html` into a fully functional SPA structure with enhanced navigation and integrated modules for Leads and Analytics.

**Architecture:** Single Page Application (SPA) using hidden/visible sections controlled by JavaScript. Centralized state for products, orders, and users.

**Tech Stack:** Vanilla JS, Tailwind CSS, Lucide-like Material Symbols.

---

### Task 1: Refactor Sidebar and Header

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update Sidebar Navigation**
Add data-tab attributes and ensure navigation buttons call `switchTab`.

- [ ] **Step 2: Update Header Title Mapping**
Ensure `currentTabTitle` is updated correctly in `switchTab`.

- [ ] **Step 3: Commit**
```bash
git add admin.html
git commit -m "feat(admin): update sidebar and header for SPA structure"
```

### Task 2: Enhance switchTab Functionality

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update `switchTab` in script**
Improve the logic to handle all tabs, update active classes, and trigger data loading.

- [ ] **Step 2: Make Dashboard Cards Clickable**
Update dashboard stat cards to navigate to respective tabs.

- [ ] **Step 3: Commit**
```bash
git add admin.html
git commit -m "feat(admin): enhance switchTab and dashboard navigation"
```

### Task 3: Add Placeholder Sections for Leads and Analytics

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Ensure sections exist**
Add `<section id="tab-leads">` and `<section id="tab-analytics">` with placeholder content.

- [ ] **Step 2: Commit**
```bash
git add admin.html
git commit -m "feat(admin): add placeholder sections for leads and analytics"
```
