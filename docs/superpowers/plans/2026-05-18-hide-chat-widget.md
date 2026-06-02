# Hide Tech Support Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide the client-side floating chat button (#floatingChatBtnGlobal) when in the admin panel.

**Architecture:** Inject a CSS style block into `document.head` during the `renderLayout` phase of the admin UI.

**Tech Stack:** JavaScript, CSS.

---

### Task 1: Modify js/admin/ui.js

**Files:**
- Modify: `js/admin/ui.js`

- [ ] **Step 1: Inject CSS into document.head**

In `js/admin/ui.js`, update the `renderLayout` function to inject the hiding style.

```javascript
export function renderLayout() {
    // Add this part:
    if (!document.getElementById('hide-chat-widget-admin')) {
        const style = document.createElement('style');
        style.id = 'hide-chat-widget-admin';
        style.textContent = '#floatingChatBtnGlobal { display: none !important; }';
        document.head.appendChild(style);
    }

    const app = document.getElementById('admin-app');
    if (!app) return;
    // ... rest of existing code
```

- [ ] **Step 2: Commit changes**

```bash
git add js/admin/ui.js
git commit -m "style: hide tech support widget in admin panel"
```
