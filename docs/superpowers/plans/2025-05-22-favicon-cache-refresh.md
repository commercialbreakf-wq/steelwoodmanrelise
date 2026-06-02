# Favicon Cache Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update favicon URLs in all HTML files to force a cache refresh by appending `?v=3` to the SVG path.

**Architecture:** Use sequential surgical replacements in all identified HTML files.

**Tech Stack:** HTML, Shell (grep/sed or manual replace)

---

### Task 1: Update Favicon URLs in Root HTML Files

**Files:**
- Modify: 34 root HTML files (identified by grep)

- [ ] **Step 1: Replace favicon.svg with favicon.svg?v=3 in all identified files**

Identified files:
- 404.html
- about.html
- admin.html
- cabinet.html
- calculator.html
- cart.html
- catalog.html
- certificate_carbon.html
- certificate_eco.html
- certificate_pipes.html
- certificate_stainless.html
- certificate_view.html
- certificates.html
- contacts.html
- index.html
- logistics.html
- navigation.html
- news.html
- news_market_adaptation.html
- news_sheets_2026.html
- news_trends_2026.html
- product-demo.html
- product.html
- reset-password.html
- services.html
- sitemap.html
- spravka.html
- spravka_armatura.html
- spravka_balka.html
- spravka_list.html
- spravka_shveller.html
- spravka_sort.html
- spravka_truba_krug.html
- spravka_truba_prof.html

- [ ] **Step 2: Verify changes in a few files**
Run: `grep "favicon.svg?v=3" index.html about.html`
Expected: Matches found in both files.

- [ ] **Step 3: Commit**
```bash
git add *.html
git commit -m "fix: update favicon URLs to force cache refresh (v=3)"
```

### Task 2: Check for any remaining occurrences

- [ ] **Step 1: Run a final grep to ensure no occurrences of the old URL remain**
Run: `grep -r "href=\"/images/favicon.svg\"" --include="*.html" .`
Expected: No matches (except maybe in .superpowers which is excluded).

- [ ] **Step 2: Run a final grep for logo_premium.png used as favicon**
Run: `grep -r "logo_premium.png" --include="*.html" .`
Expected: Only `img src` occurrences should remain.
