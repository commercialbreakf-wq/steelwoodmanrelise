# Image Generation Plan

This document outlines the strategy, aesthetic guidelines, and specific prompts for generating high-quality, premium images for the "Stitch_first" industrial metal catalog web application using the `generate_image` tool.

## 1. Aesthetic Guidelines

To achieve the "WOW" factor and premium feel required for a modern web application:
- **Style:** Photorealistic, high-end industrial, cinematic lighting.
- **Lighting:** Dark mode friendly. Deep shadows with bright, vibrant highlights reflecting off metal surfaces (e.g., orange sparks, cool blue neon, or warm amber rim lighting).
- **Composition:** Macro shots for textures (close-ups of steel grain), dramatic wide shots for backgrounds, and isolated clean shots for product icons.
- **Color Palette:** Slate gray, brushed steel, deep blacks, accented with vibrant brand colors (e.g., electric blue, safety orange, or gold).

## 2. Required Image Assets & Prompts

### 2.1 Brand & UI Elements
* **`logo_icon.png` / `logo_premium.png`**
  * *Prompt:* `Sleek minimalist industrial logo featuring stylized steel beams forming geometric shapes, metallic silver and electric blue on dark background, premium 3d render`
* **`industrial_404_bg`**
  * *Prompt:* `Cinematic dark industrial warehouse interior, moody atmospheric lighting, steel structures disappearing into shadows, blue volumetric light`
* **`loader-logo`**
  * *Prompt:* `Abstract glowing metallic sphere wireframe, high tech industrial loader icon, neon blue accents, dark background, 8k resolution`

### 2.2 Product Category Headers (Spravka Pages)
For pages like `spravka_armatura.html`, `spravka_balka.html`, etc.
* **Rebar (`spravka_armatura` / `rebar.png`)**
  * *Prompt:* `Close up macro photography of steel rebar texture, dramatic rim lighting, dark moody industrial background, high contrast metallic reflections`
* **Steel Beams (`spravka_balka`)**
  * *Prompt:* `Heavy steel I-beams stacked in a modern warehouse, cinematic blue and amber lighting, photorealistic industrial metal textures, depth of field`
* **Sheet Metal (`spravka_list` / `sheets.png`)**
  * *Prompt:* `Polished stainless steel sheets stacked, catching vibrant neon light reflections, sleek modern industrial aesthetic, dark background, 8k`
* **Channel / U-beams (`spravka_shveller`)**
  * *Prompt:* `Steel channel bars neatly arranged, metallic surface reflecting cool studio lights, premium industrial catalog photography, dark mode`
* **Long Products (`spravka_sort`)**
  * *Prompt:* `Assortment of long steel rods and bars, dynamic diagonal composition, dramatic spotlighting on metallic surfaces, high end industrial`
* **Round Pipes (`spravka_truba_krug`)**
  * *Prompt:* `Perfectly round steel pipes stacked in a hexagon shape, glowing edges from cinematic lighting, dark moody warehouse setting, hyperrealistic`
* **Profile Pipes (`spravka_truba_prof`)**
  * *Prompt:* `Square and rectangular steel profile pipes, industrial metal texture, dramatic contrast lighting with blue and orange hues, macro`
* **Angles (`spravka_ugolok`)**
  * *Prompt:* `Steel angle bars in a row, sharp metallic edges catching bright highlights against a dark shadowy background, premium product photography`

### 2.3 News & Informational Assets
* **News Cover 1 (`news_1.png` / Trends 2026)**
  * *Prompt:* `Futuristic steel manufacturing plant, glowing hot metal, sparks flying, modern industrial technology, cinematic wide shot, highly detailed`
* **News Cover 2 (`news_2.png` / GOST Standards)**
  * *Prompt:* `High tech quality control of steel products, blue laser scanning a metal beam, dark futuristic industrial environment, macro detail`
* **Certificates (`cert_carbon.png`, `cert_eco.png`, etc.)**
  * *Prompt:* `Premium minimalist document template, silver metallic foil stamp on dark slate paper, elegant industrial certificate design mockup`

## 3. Execution Plan

If approved, the agent will:
1. Run the `generate_image` tool using the exact prompts above.
2. Save the resulting images with standardized names.
3. Move the generated files into the `/images/` directory.
4. Verify that HTML pages (`index.html`, `catalog.html`, `spravka_*.html`) are referencing the new filenames correctly.
5. Provide a walkthrough showcasing the visual upgrade to the user.

---
*Please review this plan. If you are satisfied, simply reply "Approve" or provide any adjustments, and I will begin generating the images!*
