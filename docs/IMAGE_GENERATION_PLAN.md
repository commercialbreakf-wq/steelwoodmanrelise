# План генерации изображений категорий — «Железный Дровосек»

> Инструкция для **Antigravity / Gemini Pro** (или любой image-генерации).
> Цель: сгенерировать единый, премиальный, «дорогой» набор фото для всех
> категорий каталога металлопроката, чтобы карточки на главной, в
> `catalog-select` и в карточках товаров выглядели цельно и фирменно.

---

## 0. Контекст проекта

- Сайт: металлобаза `zhelezniydrovosek.ru` (Санкт-Петербург).
- Стиль сайта: тёмная индустриальная тема, акцент `#964551` (тёмная),
  `#ca7093` (светлая). Премиум, «дорого», минимализм, промышленная эстетика.
- Картинки накладываются под градиент-оверлей (тёмный в dark, светлый в
  light), сверху — белый/тёмный заголовок категории. Поэтому изображения
  должны быть **достаточно детальными, но не пёстрыми** — текст читается
  поверх нижней трети.
- Карточки обрезаются `object-cover`. Главный объект держим по центру/верху,
  снизу оставляем «дышащее» пространство (туда ляжет заголовок).

---

## 1. Единая визуальная айдентика (применять ко ВСЕМ промптам)

Добавляй этот «стилевой суффикс» в конец каждого промпта, чтобы набор был
консистентным:

```
Style: premium industrial product photography, professional studio + warehouse
lighting, dramatic side light, shallow depth of field, fine metallic texture,
cinematic, high detail, 8k, moody dark background with subtle warm rim light,
muted desaturated palette with a faint warm crimson (#964551) accent glow,
no text, no watermark, no people in focus, realistic, photorealistic.
Composition: hero object centered/upper area, lower third darker and calmer for
text overlay. Aspect 4:5 vertical.
```

Негатив-промпт (если модель поддерживает):

```
no text, no logos, no watermark, no cartoon, no 3d render look, no neon,
no oversaturation, no clutter, no rust unless specified, no blur on main object.
```

---

## 2. Технические требования к файлам

| Параметр | Значение |
| --- | --- |
| Формат | `.png` (или `.webp`, если потом сконвертируем) |
| Соотношение сторон | **4:5 вертикальное** (карточки категорий) |
| Разрешение | минимум `1024×1280`, лучше `1600×2000` |
| Вес | оптимизировать до < 400 КБ на картинку (TinyPNG/squoosh) |
| Папка | `images/products/` |
| Имена файлов | строго латиницей, по таблице ниже (так уже ждёт код) |
| Цвет.профиль | sRGB |

> ВАЖНО: имена файлов в таблице совпадают с тем, что **уже прописано в коде**
> (`catalog-select.html` → объект `subcatImages`). Если положить файлы с этими
> именами — они подхватятся автоматически, код менять не нужно.

---

## 3. Полный список изображений к генерации

Легенда: ✅ уже есть (можно перегенерить для единообразия), 🔴 отсутствует —
сейчас показывается заглушка склада, **обязательно к генерации**.

### 3.1 Чёрный металлопрокат

| Категория | Файл | Статус | Промпт (объект) |
| --- | --- | --- | --- |
| Арматура | `steel_rebar_premium.png` | ✅ | Stack of ribbed steel reinforcement rebar bars, bundled, construction site warehouse |
| Композитная арматура | `composite_rebar_premium.png` | 🔴 | Coils and bars of ribbed basalt/fiberglass composite rebar, light grey-tan, modern |
| Балка двутавровая | `steel_beams_premium_1778423982429.png` | ✅ | Stacked steel I-beams (H-beams), heavy structural steel, warehouse |
| Закладные детали | `embedded_parts_premium.png` | 🔴 | Welded steel embedded plates with anchor studs, industrial fasteners on pallet |
| Круг | `round_steel_premium_1778423868660.png` | ✅ | Bundle of solid round steel bars, cut ends facing camera |
| Квадрат | `square_steel_premium_1778423850615.png` | ✅ | Bundle of square solid steel bars, cut ends facing camera |
| Лист стальной | `hot_rolled_sheets_premium_1778423920658.png` | ✅ | Stacked hot-rolled steel sheets/plates, dark mill finish |
| Лягушка арматурная | `rebar_clamp_premium.png` | 🔴 | Steel rebar tie wire clamps / binding connectors, small metal parts macro |
| Полоса | `steel_strip_premium.png` | 🔴 | Stacked flat steel strips/bands, mill finish, neat pile |
| Просечно-вытяжной лист | `expanded_metal_premium.png` | 🔴 | Expanded metal mesh sheet (diamond pattern), stacked, industrial |
| Проволока | `steel_wire_premium_1778423804026.png` | ✅ | Coils of steel wire, spiral metallic texture |
| Сетка стальная | `steel_mesh_premium_1778423969480.png` | ✅ | Welded steel mesh panels stacked, grid pattern |
| Швеллер | `steel_channels_premium_1778424020131.png` | ✅ | Stacked steel U-channels (C-profile), structural |
| Трубы бесшовные | `seamless_pipes_premium.png` | 🔴 | Stack of thick-wall seamless round steel pipes, cut ends, heavy industrial |
| Трубы электросварные | `welded_pipes_premium.png` | 🔴 | Stack of round electric-welded steel pipes with visible seam, warehouse |
| Трубы профильные | `profile_tubes_premium_1778423900429.png` | ✅ | Stack of square/rectangular profile steel tubes, cut ends |
| Трубы ВГП | `vgp_pipes_premium_1778423885236.png` | ✅ | Galvanized water-gas pipes bundled |
| Уголок | `steel_angles_premium_1778423996872.png` | ✅ | Stacked steel L-angles, structural profiles |

### 3.2 Кровельные материалы (🔴 ВСЕ КРИТИЧНЫ — сейчас заглушка)

| Категория | Файл | Промпт (объект) |
| --- | --- | --- |
| Профнастил | `corrugated_sheets_premium.png` (✅, можно обновить) | Stacked corrugated/profiled metal roofing sheets, ribbed, coloured coating |
| Металлочерепица | `metal_tile_premium.png` | Stacked metal roof tiles (modular metal shingles), glossy coating, pattern |
| Композитная черепица | `composite_tile_premium.png` | Composite/stone-coated metal roof tiles, textured stone granules, premium |
| Гибкая черепица | `flexible_shingle_premium.png` | Bituminous flexible shingle (soft roof tiles), hexagon/rhombus pattern, stacked bundles |
| Натуральная черепица | `natural_tile_premium.png` | Natural clay/ceramic roof tiles, terracotta, stacked rows |
| Ондулин | `ondulin_premium.png` | Corrugated bitumen ondulin roofing sheets, matte coloured, wavy profile |
| Фальцевая кровля | `seam_roof_premium.png` | Standing-seam metal roof panels, long vertical seams, modern metal roofing |
| Водостоки | `gutters_premium.png` | Metal rain gutter system parts: downpipes, gutters, brackets, coloured coating |

### 3.3 Специальные стали (низколегированные) 🔴

> Можно переиспользовать чёрный прокат, но для премиум-вида лучше отдельные
> кадры с чуть более «тёмным/синим» отливом стали (09Г2С).

| Категория | Файл | Промпт (объект) |
| --- | --- | --- |
| Балка двутавр низколегированная | `low_alloy_beam_premium.png` | Heavy structural I-beams, dark bluish low-alloy steel finish |
| Швеллер низколегированный | `low_alloy_channel_premium.png` | Stacked U-channels, low-alloy steel, dark finish |
| Уголок спецсталь | `low_alloy_angle_premium.png` | Stacked L-angles, low-alloy steel |
| Круг спецсталь | `low_alloy_round_premium.png` | Round bars, low-alloy steel, cut ends |
| Лист спецсталь | `low_alloy_sheet_premium.png` | Thick steel plates, low-alloy, dark mill finish |
| Трубы электросварные низколегированные | `low_alloy_welded_pipe_premium.png` | Welded round pipes, low-alloy steel |

### 3.4 Нержавеющая сталь 🔴 (сейчас одна общая `stainless_steel_product.png`)

| Категория | Файл | Промпт (объект) |
| --- | --- | --- |
| Лист нержавеющий | `stainless_sheet_premium.png` | Polished stainless steel sheets, mirror/brushed finish, bright |
| Трубы нержавеющие | `stainless_pipe_premium.png` | Polished stainless steel round pipes, bright reflective, stacked |
| Круг нержавеющий | `stainless_round_premium.png` | Bright stainless round bars, cut ends |
| Квадрат нержавеющий | `stainless_square_premium.png` | Bright stainless square bars |
| Полоса нержавеющая | `stainless_strip_premium.png` | Brushed stainless flat strips stacked |
| Шестигранник нержавеющий | `stainless_hex_premium.png` | Stainless hexagonal bars, cut ends, bright |
| Уголок нержавеющий | `stainless_angle_premium.png` | Stainless L-angles, brushed finish |
| Сварочные материалы нержавеющие | `stainless_welding_premium.png` | Stainless welding rods/wire spools, bright metallic |

---

## 4. Пошаговая инструкция для Antigravity / Gemini Pro

1. **Подготовка.** Создай рабочую папку `images/products/`. Все файлы класть
   туда с именами строго из таблиц раздела 3.
2. **Для каждой строки таблицы** сформируй финальный промпт по схеме:
   ```
   <Промпт объекта из таблицы>. <Стилевой суффикс из раздела 1>
   ```
   Пример для «Гибкая черепица»:
   ```
   Bituminous flexible shingle (soft roof tiles), hexagon/rhombus pattern,
   stacked bundles. Style: premium industrial product photography, professional
   studio + warehouse lighting, dramatic side light, shallow depth of field,
   fine texture, cinematic, high detail, 8k, moody dark background with subtle
   warm rim light, muted desaturated palette with a faint warm crimson (#964551)
   accent glow, no text, no watermark, realistic, photorealistic. Composition:
   hero object centered/upper area, lower third darker for text overlay. Aspect 4:5.
   ```
3. **Параметры генерации:** aspect 4:5, наивысшее доступное разрешение,
   фотореализм. Сгенерируй по 2–3 варианта на категорию, выбери лучший.
4. **Постобработка:** при необходимости слегка затемни нижнюю треть кадра
   (под текст), приведи цветовую температуру к тёплому нейтралу.
5. **Оптимизация:** прогони через squoosh/TinyPNG до < 400 КБ, формат PNG/WebP,
   sRGB. Сохрани с точным именем файла.
6. **Складывай** готовое в `images/products/`.

---

## 5. Интеграция (что уже готово в коде)

- `catalog-select.html` → объект `subcatImages` уже ссылается на эти имена для
  существующих файлов. Для НОВЫХ категорий (раздел 3.2–3.4) нужно **добавить
  записи** в `subcatImages` и в fallback-функцию `getSubcatImage()`.
  Пример записей, которые нужно дописать:
  ```js
  'Металлочерепица': '/images/products/metal_tile_premium.png',
  'Композитная черепица': '/images/products/composite_tile_premium.png',
  'Гибкая черепица': '/images/products/flexible_shingle_premium.png',
  'Натуральная черепица': '/images/products/natural_tile_premium.png',
  'Ондулин': '/images/products/ondulin_premium.png',
  'Фальцевая кровля': '/images/products/seam_roof_premium.png',
  'Водостоки': '/images/products/gutters_premium.png',
  'Трубы бесшовные': '/images/products/seamless_pipes_premium.png',
  'Трубы электросварные': '/images/products/welded_pipes_premium.png',
  'Лист нержавеющий': '/images/products/stainless_sheet_premium.png',
  'Трубы нержавеющие': '/images/products/stainless_pipe_premium.png',
  'Круг нержавеющий': '/images/products/stainless_round_premium.png',
  'Квадрат нержавеющий': '/images/products/stainless_square_premium.png',
  'Полоса нержавеющая': '/images/products/stainless_strip_premium.png',
  'Шестигранник нержавеющий': '/images/products/stainless_hex_premium.png',
  'Уголок нержавеющий': '/images/products/stainless_angle_premium.png',
  'Сварочные материалы нержавеющие': '/images/products/stainless_welding_premium.png',
  'Просечно-вытяжной лист': '/images/products/expanded_metal_premium.png',
  'Полоса': '/images/products/steel_strip_premium.png',
  'Закладные детали': '/images/products/embedded_parts_premium.png',
  'Композитная арматура': '/images/products/composite_rebar_premium.png',
  'Лягушка арматурная': '/images/products/rebar_clamp_premium.png',
  ```
- На главной (`index.html`) 4 карточки используют: `rebar.png`, `tubes.png`,
  `sheets.png`, `corrugated_sheets_premium.png`. Можно заменить на премиум-версии.
- В карточке товара (`product.html` / модалка) картинка берётся из поля
  `image`/`images` товара в БД. Категорийные фото — это fallback.

---

## 6. QA-чеклист после генерации

- [ ] Все 🔴-категории имеют собственный файл (нет дубля «склад в тумане»).
- [ ] Соотношение 4:5, объект по центру/верху, низ спокойный под текст.
- [ ] Единый стиль: тёмный фон, тёплый crimson rim-light, без пестроты.
- [ ] Нет текста/логотипов/водяных знаков на картинке.
- [ ] Вес каждого файла < 400 КБ, формат PNG/WebP, sRGB.
- [ ] Имена файлов точно совпадают с таблицей.
- [ ] После заливки — проверить `catalog-select` (тёмная и светлая темы):
      оверлей и заголовок читаются.
- [ ] Добавлены недостающие записи в `subcatImages` / `getSubcatImage()`.

---

## 7. Сводка: что критично в первую очередь

1. **Кровля (8 шт.)** — сейчас все одинаковые, бьёт по виду больше всего.
2. **Нержавейка (8 шт.)** — одна общая картинка на всё.
3. **Спецстали (6 шт.)** — дубли чёрного проката.
4. **Чёрный прокат добор (8 шт.)** — бесшовные/э/с трубы, полоса, ПВЛ,
   закладные, композитная арматура, лягушка.

Итого к генерации: **~30 новых изображений** + опционально перегенерация
~15 существующих для единого стиля.
