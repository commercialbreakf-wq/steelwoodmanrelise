# Update Favicon and Apple-Touch-Icon to Premium Logo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all HTML files in the root directory to use `images/logo_premium.png` for favicon, apple-touch-icon, and mask-icon.

**Architecture:** Bulk replacement using PowerShell command to ensure consistency across all HTML files.

**Tech Stack:** PowerShell, HTML

---

### Task 1: Research and Verification

**Files:**
- Root directory `*.html`

- [ ] **Step 1: Verify existence of target image**
Check if `images/logo_premium.png` exists in the workspace.

- [ ] **Step 2: Identify all HTML files with the old logo tags**
Use grep to confirm which files need updating.

### Task 2: Bulk Replacement

**Files:**
- Root directory `*.html`

- [ ] **Step 1: Run PowerShell command to replace favicon tags**
Run a command to replace:
  - `/images/logo_icon.png` with `/images/logo_premium.png`
  specifically in the tags provided by the user.

```powershell
Get-ChildItem -Path . -Filter *.html | ForEach-Object {
    (Get-Content $_.FullName) | ForEach-Object {
        $_ -replace 'href="/images/logo_icon.png"', 'href="/images/logo_premium.png"'
    } | Set-Content $_.FullName
}
```

- [ ] **Step 2: Run PowerShell command to replace any other occurrences if necessary (e.g. mask-icon)**
Actually, the previous command covers `href="/images/logo_icon.png"` which is used in all three tags.

### Task 3: Final Verification

**Files:**
- Root directory `*.html`

- [ ] **Step 1: Verify no occurrences of old favicon path remain in root HTML files**
Run `grep` again to search for `logo_icon.png` in root HTML files.

- [ ] **Step 2: Verify the new logo path is present**
Run `grep` to search for `logo_premium.png` in root HTML files.
