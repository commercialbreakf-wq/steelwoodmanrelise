# Inline Price Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement inline price editing in the product table of `admin.html`.

**Architecture:** Use a simple input field replacement for the price text in the table, with "Save" and "Cancel" buttons. Handle price recalculation (ton to unit) on the frontend before sending the update.

**Tech Stack:** Vanilla JS, Tailwind CSS, Supabase API.

---

### Task 1: Modify `renderProducts` and Add Inline Edit Handlers

**Files:**
- Modify: `admin.html`

- [ ] **Step 1: Update `renderProducts` in `admin.html`**
    - Find the price column in the table row template.
    - Wrap the price content in a div that triggers `startInlineEdit`.
    - Add a unique ID to the price container for easy replacement.

- [ ] **Step 2: Add `startInlineEdit` function**
    - This function should replace the innerHTML of the price cell with an input and buttons.
    - It should use `event.stopPropagation()` to avoid triggering row selection.

- [ ] **Step 3: Add `cancelInlineEdit` function**
    - Simply call `renderProducts(getFilteredProducts())` to reset the table state.

- [ ] **Step 4: Add `saveInlinePrice` function**
    - Get the new price from the input.
    - Calculate the new `price_unit` using the product's weight.
    - Send a `PUT` request to `/api/admin/products/:id`.
    - On success, call `loadDashboardData()` to refresh the state and show a success popup.

- [ ] **Step 5: Verify manually**
    - Open `admin.html` (simulated or real).
    - Test the edit -> save and edit -> cancel flows.

- [ ] **Step 6: Commit**
```bash
git add admin.html
git commit -m "feat: implement inline price editing in products table"
```

### Task 2: Create Verification Script

**Files:**
- Create: `test_inline_price_edit.js`

- [ ] **Step 1: Write the verification script**
    - The script should simulate a price update and verify it via the API.
    - Use environment variables for authentication if needed.

- [ ] **Step 2: Run the script**
    - Run: `node test_inline_price_edit.js`
    - Expected: PASS

- [ ] **Step 3: Commit**
```bash
git add test_inline_price_edit.js
git commit -m "test: add verification script for inline price editing"
```
