---
name: Functional Data System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5f5e5a'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2dc'
  on-secondary-container: '#656460'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1c16'
  on-tertiary-container: '#86847c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e5e2dc'
  secondary-fixed-dim: '#c9c6c1'
  on-secondary-fixed: '#1c1c18'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#e6e2d9'
  tertiary-fixed-dim: '#cac6be'
  on-tertiary-fixed: '#1c1c16'
  on-tertiary-fixed-variant: '#484740'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is a sophisticated fusion of utilitarian minimalism and organic warmth. It is engineered for high-density data environments where prolonged focus is required. By replacing sterile pure whites with a "beachy" sand-toned foundation, the system reduces ocular fatigue while maintaining a sharp, professional edge.

The aesthetic follows a **High-Contrast Minimalism** approach. It leverages the stark authority of black typography and accents against a soft, parchment-like canvas. The result is a UI that feels like a premium technical document—clear, authoritative, and intentionally calm.

## Colors

The palette is anchored by a warm, beachy neutral that serves as the primary surface color. This "Sand" base provides a natural, low-glare environment for complex data visualization.

- **Main Surface:** A soft, desaturated parchment (#F2EFE9) that replaces pure white.
- **Accents:** Pure black (#000000) is used for primary text, iconography, and structural borders to maintain maximum legibility.
- **Functional Colors:** Standard semantic hues (Success, Warning, Error, Info) are preserved but slightly adjusted in saturation to ensure they pop effectively against the warm background without vibrating.
- **Secondary Surfaces:** Subtle darkening of the base sand (#E5E1D8) is used to create nested containers or sidebar areas.

## Typography

This design system utilizes a dual-font strategy to balance character with utility. **Manrope** is used for headlines to provide a modern, slightly geometric warmth that complements the beachy palette. **Inter** is the workhorse for all data and body text, chosen for its exceptional legibility in dense spreadsheets and technical readouts.

Text color is strictly black for primary content, with a 60% opacity variation for secondary metadata. Ensure all labels use the "label-bold" style with slight letter-spacing for maximum clarity at small sizes.

## Layout & Spacing

The system employs a **Fluid Grid** model with a base-8 rhythmic scale. Layouts should feel expansive yet structured, utilizing generous margins to prevent the warm background from feeling cluttered.

- **Grid:** 12-column system with 24px gutters.
- **Margins:** 32px page margins as a minimum to frame the content.
- **Density:** While the color palette is "beachy" and soft, the layout density remains high for data-heavy views, relying on 1px black dividers rather than whitespace alone to separate complex information.

## Elevation & Depth

To maintain the high-contrast, minimal aesthetic, this design system avoids heavy shadows. Depth is achieved through **Tonal Layering** and **Bold Outlines**.

1.  **Level 0 (Base):** The main "Sand" surface (#F2EFE9).
2.  **Level 1 (Containers):** Slightly darker "Dune" surfaces (#E5E1D8) or 1px solid black borders.
3.  **Level 2 (Popovers/Modals):** Elements are lifted using a crisp, 1px black border and a very small, high-opacity sharp shadow (2px offset) to mimic the look of physical cards on a desk.
4.  **Dividers:** Hairline strokes (1px) in black at 10% opacity for soft separation, or 100% opacity for primary structural breaks.

## Shapes

The shape language is **Soft**. A 0.25rem (4px) corner radius is applied to most functional elements like buttons, input fields, and data cards. This subtle rounding takes the "edge" off the high-contrast black accents, aligning the geometry with the organic warmth of the parchment background without veering into a playful or consumer-focused aesthetic.

## Components

### Buttons
- **Primary:** Solid black background with sand-colored text. 4px border radius.
- **Secondary:** Transparent background with a 1px black border and black text.
- **Ghost:** Black text, no border, with a subtle sand-darkening effect on hover.

### Data Tables
- Header rows use a slightly darker sand tint (#E5E1D8) with uppercase "label-bold" typography.
- Row separators are 1px hairline strokes.
- Hover states on rows should use a 5% black tint to maintain the beachy tone while providing feedback.

### Input Fields
- Background is a 5% darker tint of the surface color to create a "well" effect.
- 1px black border on focus. 
- Labels always sit above the field in "label-bold" style.

### Chips & Tags
- Used for status and filtering. 
- High-contrast black text on a very pale version of the functional status color, or a simple black outline for neutral tags.

### Cards
- No shadows. Use 1px black borders or a subtle tonal shift for container definition. 
- Padding within cards should be a consistent 24px (md) to allow the data to breathe.