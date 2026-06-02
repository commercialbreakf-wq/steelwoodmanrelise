# Design Spec: Inline Price Editing in Admin Table

**Goal:** Implement inline price editing in the product table of `admin.html`, replacing browser `prompt()` or modal popups for simple price updates.

## Approaches

1.  **Simple Input Field (Recommended):**
    - Replace the price text with an `<input type="number">`.
    - Show "Save" (check) and "Cancel" (close) icons.
    - Robust and easy to handle events.
2.  **Contenteditable Span:**
    - Use `contenteditable="true"` on the price span.
    - Saves space but more complex to handle focus, blur, and "Cancel" behavior.

**Recommendation:** Approach 1 (Simple Input Field) for better user feedback and reliability.

## Architecture & Data Flow

- **Frontend (`admin.html`):**
    - `renderProducts`: Modified to add `onclick="startInlineEdit(event, '${p.id}')"` to the price column.
    - `startInlineEdit(event, id)`: Replaces static text with an input field.
    - `saveInlinePrice(id, newPrice)`: Sends `PUT /api/admin/products/:id` with recalculated `price_unit`.
    - `cancelInlineEdit(id)`: Re-renders the table to discard changes.
- **Backend (`api/[...slug].js`):**
    - Existing `PUT /admin/products/:id` endpoint will handle the update.

## Implementation Details

- **Price Recalculation:** If `price_ton` changes, `price_unit` MUST be updated: `price_unit = (price_ton / 1000) * weight`.
- **Event Handling:** Prevent row click selection when editing the price.

## Testing Strategy

- **Manual Verification:**
    - Click price -> input appears.
    - Enter value -> Save -> Verify update in table and DB.
    - Enter value -> Cancel -> Verify no change.
- **Automated Test:**
    - A script to simulate the API call and verify the database state.
