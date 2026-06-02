# Task 3: State Management & Product Table Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a centralized state management system and a high-performance, sortable product table for the admin dashboard.

**Architecture:** Use a reactive state store with an event-driven update mechanism. The table component will be a pure functional renderer that subscribes to state changes.

**Tech Stack:** Vanilla JavaScript (ES6 Modules), Tailwind CSS, Fetch API.

---

### Task 3.1: Central State Management (state.js)

**Files:**
- Create: `js/admin/state.js`
- Test: `tests/admin/state.test.js`

- [ ] **Step 1: Write the failing test for state initialization and event emitting**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement minimal state management logic**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Implement fetchProducts, updateProduct, and bulkUpdateProducts**
- [ ] **Step 6: Commit**

### Task 3.2: Product Table Component (table.js)

**Files:**
- Create: `js/admin/components/table.js`

- [ ] **Step 1: Create the table skeleton and rendering logic**
- [ ] **Step 2: Implement sortable columns (Name, Price, Category, Status)**
- [ ] **Step 3: Implement row selection (checkboxes)**
- [ ] **Step 4: Add Loading, Error, and Empty states**
- [ ] **Step 5: Commit**

### Task 3.3: Integration with Dashboard (app.js)

**Files:**
- Modify: `js/admin/app.js`

- [ ] **Step 1: Initialize state and subscribe the product table to state changes**
- [ ] **Step 2: Trigger initial data fetch on dashboard load**
- [ ] **Step 3: Verify the table renders real data from the API**
- [ ] **Step 4: Commit**
