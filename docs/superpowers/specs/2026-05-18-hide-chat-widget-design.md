# Design: Hide Tech Support Widget in Admin Panel

**Topic:** UI Tweak to hide client-side chat button in admin view.
**Date:** 2026-05-18

## 1. Architecture & Design
The goal is to ensure the `#floatingChatBtnGlobal` element is hidden whenever the admin layout is rendered. 

### Approach
In the `renderLayout` function of `js/admin/ui.js`, we will inject a `<style>` tag into the document head.

```javascript
const style = document.createElement('style');
style.id = 'hide-chat-widget-admin';
style.textContent = '#floatingChatBtnGlobal { display: none !important; }';
document.head.appendChild(style);
```

### Why this approach?
- **Robustness:** Using CSS with `!important` ensures the widget stays hidden even if other scripts try to show it.
- **Simplicity:** It's a localized change in the admin UI logic.
- **Specific instructions:** Matches the user's requested implementation path.

## 2. Components
- `js/admin/ui.js`: The `renderLayout` function will be updated.

## 3. Data Flow
N/A (UI only change)

## 4. Error Handling
We should check if the style element already exists to avoid duplicate injections if `renderLayout` is called multiple times.

## 5. Testing
- Manual verification: Open the admin panel and ensure the chat button is not visible.
- DOM verification: Check if the style tag is present in `<head>` and if the selector is applied correctly.
