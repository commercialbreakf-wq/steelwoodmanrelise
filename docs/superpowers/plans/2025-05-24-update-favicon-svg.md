# Update Favicon to SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace existing PNG favicon tags with new SVG favicon tags in the `<head>` section of all HTML files.

**Architecture:** Use a subagent to perform batch replacements across all HTML files in the project. The replacement will target specific `<link>` tags with `rel="icon"`, `rel="apple-touch-icon"`, and `rel="mask-icon"`.

**Tech Stack:** HTML

---

### Task 1: Identify all HTML files and perform batch replacement

**Files:**
- Modify: All `*.html` files in the repository (excluding potential backups/internal folders if appropriate, but the user said "ALL HTML files in the root directory and its subdirectories").

- [ ] **Step 1: Define the replacement strings**

Old strings to look for (example from index.html):
```html
<link rel="icon" type="image/png" href="/images/logo_premium.png">
<link rel="apple-touch-icon" href="/images/logo_premium.png">
<link rel="mask-icon" href="/images/logo_premium.png" color="#ffb0cc">
```
Note: Some files might use `/images/logo_icon.png`.

New strings:
```html
<link rel="icon" type="image/svg+xml" href="/images/favicon.svg">
<link rel="apple-touch-icon" href="/images/favicon.svg">
<link rel="mask-icon" href="/images/favicon.svg" color="#ffb0cc">
```

- [ ] **Step 2: Dispatch subagent to perform replacements**

Use a subagent to find and replace these blocks in all HTML files.

- [ ] **Step 3: Verify the changes**

Check a few files (index.html, catalog.html, spravka_armatura.html) to ensure the replacement was successful and didn't affect unrelated tags.

---

### Task 2: Final Verification

- [ ] **Step 1: Grep for any remaining old favicon paths in <link> tags**

Run: `grep -r "rel=\"icon\".*logo_premium\.png" .` and `grep -r "rel=\"icon\".*logo_icon\.png" .`
Expected: No matches in HTML files.

- [ ] **Step 2: Grep for new favicon paths to ensure they are present**

Run: `grep -r "favicon\.svg" .`
Expected: Matches in all relevant HTML files.
