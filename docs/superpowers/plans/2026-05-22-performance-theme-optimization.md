# Performance & Theme Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate theme switching lag/FOUC and optimize overall site loading speed.

**Architecture:** Use an inline "Theme Guard" script for instant theme application, refactor CSS variables to remove blocking `!important` rules, and optimize the critical rendering path via script deferring and asset prioritization.

**Tech Stack:** Vanilla JS, CSS Variables, HTML5.

---

### Task 1: Refactor `js/theme.js` for Performance

**Files:**
- Modify: `js/theme.js`

- [ ] **Step 1: Clean up CSS variables and remove `!important`** (Completed)
- [ ] **Step 2: Verify light/dark variables are applied correctly in devtools** (Completed)
- [ ] **Step 3: Commit** (In Progress)

### Task 2: Optimize Theme Switching in `js/shared-ui.js`

**Files:**
- Modify: `js/shared-ui.js`

- [ ] **Step 1: Simplify `toggleThemeGlobal`** (Completed)
- [ ] **Step 2: Test toggle speed and smoothness** (Completed)
- [ ] **Step 3: Commit** (In Progress)

### Task 3: Implement Theme Guard & Script Optimization in HTML

**Files:**
- Modify: All `.html` files

- [ ] **Step 1: Inject Theme Guard and update script loading** (Completed)
- [ ] **Step 2: Add `fetchpriority="high"` to Hero image** (Completed)
- [ ] **Step 3: Test for FOUC on page reload (Shift+F5)** (Completed)
- [ ] **Step 4: Commit** (In Progress)
