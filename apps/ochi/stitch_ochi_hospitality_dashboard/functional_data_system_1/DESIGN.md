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
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5e5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdf'
  on-secondary-container: '#626262'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1b1b'
  on-tertiary-container: '#848484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  h1:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
spacing:
  unit: 4px
  container-margin: 16px
  gutter: 12px
  stack-sm: 4px
  stack-md: 8px
  stack-lg: 16px
---

## Brand & Style

This design system is built for high-utility mobile environments where data density and speed of comprehension are the primary drivers. The personality is strictly utilitarian, clinical, and objective, removing all aesthetic "noise" to focus on information hierarchy.

The design style is a blend of **Minimalism** and **Modern Corporate** standards, optimized for small screens. It leverages a strict grayscale foundation to ensure that color is used exclusively as a functional tool for status signaling and data categorization, rather than decoration. The interface should feel like a high-performance instrument—unobtrusive, reliable, and exceptionally clear.

## Colors

The palette is restricted to a monochromatic scale to maintain high contrast and minimize cognitive load. 

- **Primary:** Pure Black (#000000) for primary text and core actionable icons.
- **Secondary:** Mid-grays for secondary information and metadata.
- **Backgrounds:** Pure white for the primary canvas, with subtle light gray (#F5F5F5) used for grouping and sectioning.
- **Functional Color:** Red, Yellow, and Green are reserved strictly for status indicators (Success, Warning, Error). These should never be used for branding or non-essential decorative elements. High-saturation shades are chosen to ensure legibility against white backgrounds.

## Typography

The design system utilizes **Inter** for its exceptional legibility in data-heavy mobile layouts. The typographic scale is compact to maximize information density.

- **Headlines:** Used sparingly to define major views.
- **Data-Mono:** While Inter is sans-serif, its tabular numeric features must be enabled to ensure columns of numbers align vertically for easy scanning.
- **Label-Caps:** Used for section headers and table column titles to provide clear distinction from the data itself without requiring excessive vertical space.
- **Contrast:** Maintain a strict ratio of black text on white backgrounds for primary content.

## Layout & Spacing

This design system employs a **Fluid Grid** model optimized for narrow viewports. 

- **Grid:** A 4-column grid for mobile, with 16px side margins and 12px gutters.
- **Rhythm:** A strict 4px baseline grid governs all vertical spacing.
- **Density:** Padding within elements is minimized (e.g., 8px or 12px) to allow for more data rows to be visible on screen simultaneously. 
- **Alignment:** All data points should be left-aligned for text and right-aligned for numerical values to facilitate rapid ocular scanning.

## Elevation & Depth

To maintain the minimalist aesthetic and maximize screen real estate, this design system avoids shadows and heavy atmospheric depth.

- **Flat Architecture:** Depth is conveyed through **Low-contrast outlines** (1px solid strokes in #E0E0E0) and tonal layering. 
- **Surface Tiers:** The base layer is white (#FFFFFF). Tertiary information or grouped backgrounds use a subtle gray (#F5F5F5).
- **Zero Shadows:** Do not use box-shadows. Modals or overlays should be defined by a solid 1px black border or a high-contrast dimming of the background to maintain the "flat" functional feel.

## Shapes

The shape language is **Sharp (0px)**. All containers, buttons, and input fields utilize hard 90-degree corners. This reinforces the "grid-like" and "technical" nature of the application, ensuring no pixels are wasted on rounded corners and maintaining a rigid, systematic structure that aligns perfectly with the device edges.

## Components

- **Buttons:** Solid black background with white text for primary actions. 1px black border with transparent background for secondary actions. No icons unless they provide immediate functional clarity.
- **Data Lists:** High-density rows with 1px bottom borders (#E0E0E0). Use 12px vertical padding. Primary data in `body-lg` (Black), secondary data in `body-sm` (Gray).
- **Status Chips:** Small, rectangular labels with subtle background tints and high-contrast text in the status colors (e.g., Light green background with Dark green text). No border-radius.
- **Input Fields:** 1px solid gray borders. Focus state is indicated by a 2px solid black border. Labels use `label-caps`.
- **Data Tables:** Horizontal scrolling for overflow. Header row uses a light gray background (#F5F5F5) with `label-caps` text.
- **Status Indicators:** Simple 8px squares or "pills" (though keeping the 0px radius) to indicate "live," "error," or "offline" states next to data points.