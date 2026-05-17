# Spec: Image Upload Support in Product Wizard

**Date:** 2025-05-24
**Topic:** Image Upload Support
**Files to modify:** `admin.html`

## 1. Overview
Add the ability for administrators to upload local images when creating or editing products in the Product Wizard. The uploaded image will be converted to a Base64 string and stored in the product's image field.

## 2. Requirements
- Add a "Загрузить файл" (Upload file) button in Step 2 of the Product Wizard.
- Support selecting image files from the local filesystem.
- Convert selected images to Base64 Data URLs.
- Provide immediate visual feedback via the preview image.
- Ensure the Base64 string is correctly saved to the product data.

## 3. UI Design (Step 2)
- Existing "Изображение (URL)" input will be paired with a new "Upload" button.
- A hidden `<input type="file" id="wiz-image-file" accept="image/*">` will be added.
- The layout will be updated to a horizontal flex container for the URL input and the upload button.

## 4. Technical Implementation
- **`handleFileSelect(event)`**:
    - Triggered by the `change` event on the hidden file input.
    - Uses `FileReader.readAsDataURL()` to read the file.
    - Updates `wizardData.image` with the Base64 result.
    - Updates the text input (`wiz-image`) with a placeholder text "[Файл загружен]" to indicate a local file is being used.
    - Calls `updateWizPreview()` to refresh the preview image.
- **`updateWizPreview()`**:
    - Update to handle both URLs and Base64 strings (existing logic should work as it just sets `src`).
- **`saveWizardStep2()`**:
    - Ensure it doesn't overwrite `wizardData.image` with the placeholder text "[Файл загружен]" if a file was recently uploaded.

## 5. Verification Plan
- **Manual Test 1: URL Image**:
    - Enter a URL in the text input.
    - Verify preview updates.
    - Complete wizard and verify image is saved as URL.
- **Manual Test 2: File Upload**:
    - Click upload button and select a local image.
    - Verify preview updates immediately.
    - Complete wizard and verify image is saved as Base64 string.
- **Manual Test 3: Wizard Persistence**:
    - Upload an image in Step 2.
    - Move to Step 3, 4, and 5.
    - Verify image is still present in the preview at Step 5.
