# CSS Theory Questions

## 1. Explain the CSS Box Model and how `box-sizing: border-box` changes it

The CSS Box Model is the structural foundation of design on the web. Every element is represented as a rectangular box consisting of four nested boxes:

1. **Content**: The core area where text, images, or child elements reside.
2. **Padding**: Transparent space immediately surrounding the content.
3. **Border**: The line surrounding the padding.
4. **Margin**: Transparent space separating the element's border from other elements.

### How `box-sizing` changes calculations:
- **`content-box` (Default)**: The width and height properties define only the Content area. Padding and borders are added *on top* of the width/height.
  - *Formula*: Total element width = `width` + `padding-left` + `padding-right` + `border-left` + `border-right`.
- **`border-box`**: The width and height properties define the outer boundary of the element, including content, padding, and borders.
  - *Formula*: Total element width = `width` property. The content area shrinks automatically to make room for padding and borders.

Using `border-box` makes layout math and grid alignments significantly easier to manage.

---

## 2. What is CSS Specificity and how is it calculated?

CSS Specificity is a weight-based algorithm that browsers use to determine which CSS rules are applied to an element when multiple selectors target it.

### The Specificity Hierarchy (A, B, C):
1. **A: ID Selector** (e.g. `#my-id`): Has the highest weight. (Score: `1,0,0`)
2. **B: Class, Attribute, and Pseudo-classes** (e.g. `.my-class`, `[type="text"]`, `:hover`): Medium weight. (Score: `0,1,0`)
3. **C: Element and Pseudo-elements** (e.g. `div`, `p`, `::before`): Lowest weight. (Score: `0,0,1`)

*Note*:
- Universal selector `*` and combinators (`+`, `>`, `~`) have **no specificity** (`0,0,0`).
- **Inline styles** override all stylesheet rules (Score: `1,0,0,0`).
- **`!important`** is not a selector, but it overrides all specificity scores immediately.

---

## 3. Explain Flexbox vs CSS Grid and when to use each

- **Flexbox (1D - One-Dimensional)**: Designed for laying out items in a single axis (either a row OR a column) at a time. It excels at distributing space, alignment, and wrapping items dynamically based on content size.
- **CSS Grid (2D - Two-Dimensional)**: Designed for laying out items in both columns AND rows simultaneously. It excels at complex, structured page layouts and source-order-independent designs.

### When to use:
- **Use Flexbox**: For navbar items, card media alignments, horizontal tag lists, or simple form controls.
- **Use CSS Grid**: For main dashboard dashboards, page outlines, galleries, or grids where items must align perfectly in both axes.

---

## 4. What are CSS Custom Properties (Variables) and what are their advantages?

CSS Custom Properties allow you to store values (like colors, spacing, or fonts) in a reusable variable defined directly in your stylesheets.

### Advantages:
1. **Dynamic Updating**: Unlike Sass variables (which compile down to static values at build time), CSS variables remain in the browser, allowing you to update them dynamically via JavaScript or CSS overrides.
2. **Inheritance**: Custom properties inherit down the DOM tree, allowing you to easily override theme values globally or within specific sub-containers.
3. **Fallback Values**: You can define safe fallbacks: `color: var(--accent-color, purple);`.

### Example:
```css
:root {
  --primary-color: #3178c6;
}
.card {
  border-color: var(--primary-color);
}
```

---

## 5. Explain the difference between `position: absolute`, `relative`, `fixed`, `sticky`, and `static`

The `position` property defines how an element is positioned within the document flow:

- **`static` (Default)**: Normal document flow. Top/bottom/left/right properties have no effect.
- **`relative`**: Positioned relative to its normal position. It remains in the normal document flow (does not affect other elements' positions).
- **`absolute`**: Removed from the normal document flow. Positioned relative to its closest **positioned ancestor** (any ancestor with a position other than `static`). If none exists, it positions relative to the initial containing block.
- **`fixed`**: Removed from the normal document flow. Positioned relative to the **viewport**, staying in the same place even when the page is scrolled.
- **`sticky`**: Hybrid model. Acts as `relative` until the viewport scroll reaches a defined threshold (e.g. `top: 0`), at which point it acts as `fixed` within its parent container.

---

## 6. What is stacking context and how does `z-index` work?

A Stacking Context is a three-dimensional conceptual grouping of HTML elements along the Z-axis (pointing towards the user).

### How it works:
- By default, elements are painted in source order.
- To use `z-index`, an element must be a **positioned element** (have a position other than `static`).
- A new stacking context is created by:
  - Positioned elements with a `z-index` other than `auto`.
  - Elements with `opacity` less than `1`.
  - Elements with `transform`, `filter`, or `perspective` properties set.
  - Flex or grid child elements with `z-index`.

Once a stacking context is created, all of its child elements are stacked *internally* within that context. A child cannot render above an external element if its parent stacking context has a lower priority score.

---

## 7. Explain the difference between `display: none`, `visibility: hidden`, and `opacity: 0`

These properties hide elements in different ways:

- **`display: none`**: Removes the element entirely from the layout flow. It occupies **0px of space**, and is completely invisible. The DOM element still exists but is not rendered.
- **`visibility: hidden`**: The element is invisible, but it still **occupies its original space** in the layout. It remains interactive-blocked (cannot be clicked).
- **`opacity: 0`**: The element is fully transparent, but **occupies its space** and is **still interactive** (can receive hover states, clicks, and keyboard focus).

---

## 8. What are CSS pseudo-classes and pseudo-elements? Give examples

- **Pseudo-classes (`:`)**: Selectors that target elements based on their **state** or relationship within the DOM.
  - *Examples*: `:hover`, `:focus`, `:active`, `:first-child`, `:nth-child(2)`, `:not(.active)`.
- **Pseudo-elements (`::`)**: Selectors that allow you to target or style **specific parts** of an element, or inject cosmetic virtual elements.
  - *Examples*: `::before`, `::after`, `::first-letter`, `::placeholder`, `::selection`.

---

## 9. Explain CSS transitions vs keyframe animations

- **CSS Transitions**: Used to smoothly animate a change in property values over time. They require a **trigger** (like a hover state `:hover` or class change via JS). They only animate from state A to state B.
- **Keyframe Animations (`@keyframes`)**: Do not require an interactive trigger to start. They can loop infinitely, run in multiple cycles, and define complex intermediate states (0% to 100% keyframes) with detailed timelines.

---

## 10. What is BEM (Block Element Modifier) methodology?

BEM is a popular CSS class naming convention that makes code structure predictable, reusable, and modular.

### BEM Breakdown:
- **Block**: Standalone entity that is meaningful on its own (e.g. `.menu`, `.card`, `.button`).
- **Element**: A part of a block that has no standalone meaning and is semantically tied to its block (denoted by `__`). E.g. `.card__title`, `.card__button`.
- **Modifier**: A flag on a block or element used to change appearance, state, or behavior (denoted by `--`). E.g. `.card--featured`, `.card__button--disabled`.

Using BEM prevents CSS specificity issues because it encourages flat selector structures (only single class names used).

---

## 11. What are CSS preprocessors (Sass/Less) and how do they differ from native CSS?

CSS preprocessors are scripting languages that extend CSS, compiling down to standard CSS files.

### Key Differences:
- **Variables**: Sass variables (`$color`) compile statically at build-time. CSS custom properties (`--color`) are dynamic and resolvable in the browser.
- **Nesting**: Preprocessors allow nesting selectors out-of-the-box (though modern native CSS now supports nesting natively too).
- **Mixins and Functions**: Preprocessors provide powerful programming utilities like `@mixin` and custom loop functions that native CSS cannot run.

---

## 12. Explain container queries (`@container`) and how they differ from media queries (`@media`)

- **Media Queries (`@media`)**: Apply styles based on the dimensions of the **viewport** (entire screen width).
- **Container Queries (`@container`)**: Apply styles based on the dimensions of a **parent container** element.

### Why Container Queries are a game changer:
They allow components to be truly modular. A card component can display as a single grid-column if placed in a narrow sidebar, or shift to side-by-side flex layouts if placed in a wide main body panel, without needing to know anything about the browser viewport width.

---

## 13. What is the `:has()` parent selector in CSS and how is it used?

The `:has()` pseudo-class (also known as the "parent selector") allows you to style an element based on the presence of specific descendant elements or selectors.

### Example:
Style a card block only if it contains an image:
```css
.card:has(img) {
  padding: 0; /* Remove padding if there's a card image */
}
```
Style a form label only if the input inside is focused or invalid:
```css
.form-group:has(input:invalid) {
  border-color: red;
}
```

---

## 14. Explain CSS containment (`content-visibility` and `contain`)

CSS containment is a performance feature that allows you to isolate parts of a page from the rest of the document.

- **`contain`**: Isolates layout, style, and paint calculations for a sub-tree, telling the browser that changes inside will not affect the rest of the page layout.
- **`content-visibility: auto`**: Instructs the browser to skip rendering (layout and paint) for off-screen elements until they come close to entering the viewport. This dramatically boosts initial page load speeds on long documents.

---

## 15. What is the difference between CSS variables (`var()`) and Sass variables?

## 15. What is the difference between CSS variables (`var()`) and Sass variables?

- **Sass Variables (`$color`)**: Compiled at build time. Once the website is loaded, they do not exist in the browser, making them static. They cannot be updated dynamically by JavaScript or responsive classes.
- **CSS Variables (`var(--color)`)**: Dynamic runtime properties evaluated in the browser. They can be updated on the fly using JS (`element.style.setProperty`), change dynamically inside media queries, and inherit values naturally through the DOM cascade.

---

## 16. What are Cascade Layers (`@layer`) and how do they work?

Cascade Layers (`@layer`) are a modern native CSS feature that allows developers to control the cascade priority of style rules independent of selector specificity.

### How they work:
You define layers using the `@layer` keyword. Styles declared in later layers override styles in earlier layers. However, any styling defined outside of a layer completely overrides layered styles, regardless of selector specificity.

### Example:
```css
@layer base, components, utilities;

@layer utilities {
  .text-red { color: red !important; }
}

@layer base {
  /* This has lower priority than components and utilities layers */
  body { font-family: sans-serif; }
}
```
This is extremely useful when integrating third-party UI libraries (which might have high specificity selectors) and wanting to override their styles safely using low-specificity rules.

---

## 17. Explain CSS Grid Subgrid and its use-cases

By default, grid item children do not participate in the grid defined on the parent container; they have their own independent flow. **Subgrid** allows child grid containers to inherit and align perfectly with the grid tracks (rows or columns) of their parent container.

### Use-Case:
Aligning card items (headers, bodies, footers) in a multi-column card grid so they all share identical row heights.

### Example:
```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto auto;
}

.card {
  display: grid;
  grid-row: span 3; /* Card spans 3 rows of parent */
  grid-template-rows: subgrid; /* Card rows align to parent rows */
}
```

---

## 18. What are CSS logical properties and values?

CSS Logical Properties and Values provide mapping of layout attributes to the writing mode of the document (e.g. left-to-right LTR vs right-to-left RTL) rather than relying on physical screen directions (top, bottom, left, right).

### Mappings:
- **`margin-left`** -> `margin-inline-start`
- **`margin-right`** -> `margin-inline-end`
- **`padding-top`** -> `padding-block-start`
- **`padding-bottom`** -> `padding-block-end`
- **`width`** -> `inline-size`
- **`height`** -> `block-size`

Using logical properties ensures that layouts adapt automatically when the document `dir` attribute changes (e.g., `<html dir="rtl">`), without writing separate overrides.

---

## 19. Explain Scroll-driven animations using CSS

Scroll-driven animations link the progression of an animation directly to the scroll position of a scroll container, rather than using an elapsed wall-clock time duration.

### Key Constructs:
1. **`scroll()`**: Links animation to the scroll position of the nearest scrollable ancestor.
2. **`view()`**: Links animation to the visibility of the element inside its scroll container (e.g., scroll reveals).

### Example:
Add a scroll-linked reading progress indicator at the top of a page:
```css
@keyframes grow-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

.progress-bar {
  animation: grow-progress auto linear;
  animation-timeline: scroll();
}
```

---

## 20. What is CSS aspect-ratio and how does it prevent Layout Shift?

The `aspect-ratio` property allows you to define a preferred width-to-height ratio for an element, letting the browser calculate the auto dimension dynamically.

### Example:
```css
.video-card {
  width: 100%;
  aspect-ratio: 16 / 9;
}
```

### Preventing Layout Shift:
Before `aspect-ratio`, browsers couldn't know the height of responsive media elements (like images or video cards) until they fully downloaded. This caused the page content to jump dynamically (Cumulative Layout Shift - CLS). Specifying an `aspect-ratio` allows the browser to reserve the exact layout space beforehand during DOM parsing.

---

## 21. How do mathematical functions `clamp()`, `min()`, and `max()` work in CSS?

These functions allow dynamic, responsive mathematical calculations directly inside CSS stylesheets:

1. **`min(val1, val2)`**: Selects the smallest value.
   - Example: `width: min(800px, 100%)` (width will never exceed 800px, but shrinks on small screens).
2. **`max(val1, val2)`**: Selects the largest value.
   - Example: `padding: max(2rem, 4vw)` (ensures minimum padding of 2rem, scaling larger on huge screens).
3. **`clamp(min, preferred, max)`**: Sets a responsive value that stays within defined minimum and maximum boundaries.
   - Example: `font-size: clamp(1.5rem, 5vw, 3rem)`.

---

## 22. What is the difference between `em`, `rem`, `ch`, and `lh` units?

These are relative CSS units whose actual pixel values are computed dynamically based on font metrics:

- **`rem` (Root Em)**: Relative to the font-size of the root element (usually `<html>`, defaulting to 16px).
- **`em`**: Relative to the font-size of the element itself (for properties like `width`, `padding`) or the parent element (for `font-size`).
- **`ch` (Character)**: Relative to the width of the "0" (zero) glyph of the element's current font. Extremely useful for limiting text line lengths (e.g. `max-width: 60ch` for perfect readability).
- **`lh` (Line Height)**: Relative to the computed line-height of the element. Useful for matching icons or lines alignments.

---

## 23. How does the browser paint cycle work, and what triggers reflow/repaint?

To render pixels, the browser translates HTML/CSS through the rendering pipeline.

- **Reflow (Layout)**: The browser calculates the size and position of elements.
  - *Triggered by*: Modifying layout properties (e.g. `width`, `height`, `margin`, `padding`, `display`, `position`). Reading properties like `offsetHeight` or `getBoundingClientRect` forces synchronous reflow.
- **Repaint**: The browser draws colors, borders, shadows, and text.
  - *Triggered by*: Modifying cosmetic properties (e.g. `color`, `background-color`, `visibility`, `box-shadow`) without changing geometry. Repaint is cheaper than Reflow.
- **Composition**: The browser sends pre-painted layers to the GPU to merge.
  - *Triggered by*: Modifying transform properties (`transform: translate`, `opacity`). This is the most performance-optimal animation path.

---

## 24. Explain GPU acceleration in CSS

GPU Acceleration shifts rendering work from the main CPU thread to the device's Graphics Processing Unit (GPU). This enables 60fps animations by compositing pre-painted layers rather than recalculating reflow/repaint on the CPU.

### How to trigger:
1. **Using 3D Transforms**: `transform: translate3d(0, 0, 0);` or `transform: translateZ(0);` (historically known as the "null transform hack" to force layer creation).
2. **`will-change` property**: Informs the browser in advance that a property will change, letting it optimize:
   ```css
   .animated-card {
     will-change: transform, opacity;
   }
   ```
   *Caution*: Overusing `will-change` consumes extensive memory and causes performance degradation.

---

## 25. What is the difference between CSS variables inheritance and fallback values?

- **Inheritance**: CSS custom variables inherit from parent elements down to children through the DOM cascade.
- **Fallback**: The second argument inside the `var()` function, used if the specified custom property is undefined in the environment.
  ```css
  /* If --accent-color is not defined anywhere in the hierarchy, color falls back to blue */
  .title {
    color: var(--accent-color, blue);
  }
  ```
  Note: If a variable is defined but holds an invalid CSS value (e.g., `--accent-color: 20px`), the browser does **not** use the fallback. Instead, it resets the property to its inherited or initial value.

---

## 26. What is the `@media (prefers-reduced-motion)` media feature?

The `prefers-reduced-motion` media feature detects if the user has enabled OS-level accessibility options to minimize non-essential motion/animations.

### Best Practice Implementation:
Disable animations or replace transitions with simple fades for users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 27. Explain CSS containment using the `contain` property

The `contain` property allows developers to declare that an element's subtree is completely isolated from the rest of the page layout. This allows the browser to optimize paint, layout, and rendering calculations.

### Values:
- **`contain: layout`**: Tells the browser that changes inside the element will never affect the size or position of external elements.
- **`contain: paint`**: Prevents children from painting outside the element's bounds (acts like an explicit clip). Off-screen elements can skip painting.
- **`contain: strict`**: Enforces full containment (layout, style, and paint), requiring fixed width and height.

---

## 28. How do `object-fit` and `object-position` work for responsive media?

`object-fit` controls how replaced elements (like `<img>` or `<video>`) scale and crop within their defined content boxes:

- **`fill` (Default)**: Stretches/squishes the image to fit the box, distorting aspect ratio.
- **`contain`**: Scales the image to fit the box while preserving aspect ratio (adds letterboxes/black bars if ratios differ).
- **`cover`**: Scales the image to fill the box while preserving aspect ratio, cropping parts of the image.
- **`none`**: Renders the image at its original size, ignoring the box dimensions.

`object-position` aligns the image alignment within the box (similar to `background-position`), e.g., `object-position: center top`.

---

## 29. Explain CSS mask-image and clip-path

These properties crop or hide parts of an element visually:

- **`clip-path`**: Defines a vector-based clipping region. The area inside the shape is visible, and the area outside is hidden.
  - Example: `clip-path: polygon(50% 0%, 0% 100%, 100% 100%);` (clips element into a triangle).
- **`mask-image`**: Uses an image/gradient as a alpha-transparency mask. Transparent pixels in the mask hide corresponding parts of the element, and solid pixels display it.
  - Example: Creating a fade-out edge transition:
    ```css
    mask-image: linear-gradient(to right, black, transparent);
    ```

---

## 30. How do style encapsulation scopes work in modern frameworks?

Since CSS stylesheets are global by default, class name collisions represent a major challenge. Modern frameworks solve this via encapsulation:

1. **CSS Modules**: At compile time, classes are renamed to include a hash (e.g. `.button` becomes `.button_x8f9a`). The hash ensures the class is globally unique.
2. **Scoped CSS (Svelte/Vue)**: A unique hash attribute (e.g. `data-v-12345`) is appended to components' HTML tags, and selectors are compiled to target that attribute:
   ```css
   .button[data-v-12345] { color: red; }
   ```
3. **CSS-in-JS (Styled-Components)**: Generates random global class names dynamically at runtime and injects them into `<style>` blocks in the document header.
