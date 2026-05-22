# Spec: Performance & Theme Optimization

**Status:** Draft
**Author:** Gemini CLI
**Date:** 2026-05-22

## 1. Executive Summary
Optimize the site's performance and theme switching experience. The goal is to eliminate Flash of Unstyled Content (FOUC), ensure buttery smooth theme transitions, and improve general page load speed ("make it fly").

## 2. Goals & Success Criteria
- **Zero FOUC:** The user should never see the wrong theme during page load.
- **Smooth Transitions:** Theme switching should feel premium, fast (~250ms), and lag-free.
- **Speed Optimization:** Reduce blocking scripts, optimize asset loading, and improve FPS during interactions.
- **Maintainability:** Refactor `theme.js` and `shared-ui.js` to be more modular and efficient.

## 3. Architecture & Approach

### 3.1. Theme Guard (FOUC Prevention)
A minimal, blocking inline script in the `<head>` of every HTML file will:
1. Check `localStorage` for the saved theme.
2. Check `prefers-color-scheme` if no saved theme exists.
3. Apply the correct class (`dark` or `light`) to `document.documentElement` immediately.
4. Remove hardcoded `class="dark"` from `<html>` tags.

### 3.2. Optimized Theme Switching ("Snap & Fade")
The current 600ms transition with `!important` overrides is too heavy.
- **CSS Variables:** Move all theme colors to pure CSS variables in `:root` and `.dark` scopes.
- **Transition Strategy:** 
    - Transition only `background-color`, `color`, `border-color`, and `opacity`.
    - Set `transition-duration: 250ms`.
    - Use `cubic-bezier(0.4, 0, 0.2, 1)`.
    - Exclude expensive properties like `backdrop-filter` and `box-shadow` from transitions to maintain 600 FPS.

### 3.3. Performance Boost
- **Script Loading:** Move `shared-ui.js` and other non-critical scripts to `defer`.
- **Image Priority:** Add `fetchpriority="high"` to hero images.
- **Critical Path:** Ensure `theme.js` (variable definitions) is loaded early but efficiently.
- **Refactoring:** Split `shared-ui.js` (currently 5000+ lines) into logical parts if possible, or at least optimize the theme-related functions.

## 4. Detailed Design

### 4.1. Theme Init (Inline Script)
```javascript
(function() {
    const theme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
    // Remove the other class just in case
    document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
})();
```

### 4.2. Refactored `theme.js`
- Clean up variable definitions.
- Remove redundant `!important`.
- Define the global `transition` class for theme switching.

### 4.3. Refactored `shared-ui.js`
- Optimize `toggleThemeGlobal` to use the new transition class.
- Ensure only necessary DOM operations are performed.

## 5. Testing Strategy
- **Visual Regression:** Manually check light/dark mode for consistency.
- **Performance Audit:** Use Lighthouse/PageSpeed Insights to verify "flying" speed.
- **FOUC Check:** Throttled network testing to ensure the correct theme is applied before first paint.
- **Transition Smoothness:** Check for FPS drops using browser devtools during theme toggle.

## 6. Anti-Patterns (Banned)
- No `setTimeout` hacks for theme switching.
- No `!important` in CSS variables unless absolutely necessary for external overrides.
- No blocking third-party scripts in the critical path.
