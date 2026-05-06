---
name: Garage Logic
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c5c6cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8e9197'
  outline-variant: '#44474c'
  surface-tint: '#b9c7e0'
  primary: '#b9c7e0'
  on-primary: '#233144'
  primary-container: '#334155'
  on-primary-container: '#9eadc5'
  inverse-primary: '#515f74'
  secondary: '#89ceff'
  on-secondary: '#00344d'
  secondary-container: '#00a2e6'
  on-secondary-container: '#00344e'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#5c3800'
  on-tertiary-container: '#ef9900'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d5e3fd'
  primary-fixed-dim: '#b9c7e0'
  on-primary-fixed: '#0d1c2f'
  on-primary-fixed-variant: '#3a485c'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Work Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  section-header:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-mono:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin: 32px
---

## Brand & Style

This design system is built on the philosophy of "Garage Innovation"—where high-tech agent infrastructure meets the practical, raw utility of a mission control center. The brand personality is focused, efficient, and unpretentious. It avoids unnecessary fluff in favor of high-density information display and tactical clarity.

The visual style is a blend of **Minimalism** and **Tactile Utility**. It utilizes a "Utility-First" approach where every element serves a functional purpose. The aesthetic is inspired by engineering consoles and server racks, featuring structured card-based layouts, clear section headers, and "simulated" mode badges that indicate the operational state of the infrastructure (e.g., `STAGING`, `LIVE`, `SIMULATION`). The emotional response should be one of complete control, reliability, and technical readiness.

## Colors

The palette is strictly dark-mode, rooted in deep "Slate" and "Ink" tones to minimize eye strain during long-term monitoring. 

- **Foundation:** The background uses a near-black Navy (`#020617`), while surfaces use a slightly lighter Slate (`#0F172A`).
- **Tactical Blue:** Used for primary actions and active states, providing a professional "Mission Control" feel.
- **Utility Accents:** Amber (`#F59E0B`) and Emerald (`#10B981`) are reserved strictly for status indicators, alerts, and operational feedback.
- **Borders:** Subtle Slate-800 borders define the structure without creating visual noise.

## Typography

This design system employs a dual-font strategy to distinguish between UI controls and machine data.

- **Work Sans (Sans-Serif):** Used for the primary interface labels, navigation, and body copy. Its grounded and professional character ensures readability and a modern "SaaS" feel.
- **Space Grotesk (Monospace/Technical):** Used for log outputs, agent IDs, status badges, and section headers. The technical, geometric nature of Space Grotesk reinforces the "Mission Control" aesthetic. 

Section headers should always be in uppercase with increased letter spacing to act as structural anchors within the dashboard.

## Layout & Spacing

The system follows a **Fluid Grid** model with a strict 4px baseline rhythm. 

- **Structure:** Dashboards are composed of modular cards spanning a 12-column system. 
- **Density:** High information density is encouraged. Gutters are kept tight (20px) to maximize screen real estate for data visualization.
- **Padding:** Internal card padding should be consistent at `md` (16px) or `lg` (24px) depending on the complexity of the component.
- **Hierarchy:** Use spacing rather than color to separate groups of information. Large `xl` vertical margins should separate major functional blocks.

## Elevation & Depth

Depth in this design system is conveyed through **Tonal Layering** and **Low-Contrast Outlines** rather than traditional shadows. 

1. **Floor:** The base background (`#020617`).
2. **Plinth:** Cards and containers sit one level above the floor (`#0F172A`) with a subtle 1px border (`#1E293B`).
3. **Active/Overlay:** Popovers and modals use the same surface color but add a crisp, 1px Tactical Blue border or a very slight outer glow to indicate they are "live" or floating.

Avoid soft ambient shadows. The goal is a flat, engineered look where hierarchy is defined by clear lines and distinct value shifts in the dark palette.

## Shapes

The shape language is "Soft-Industrial." Components use a **0.25rem (4px)** base radius. This creates a "machined" look—not as harsh as sharp corners, but more disciplined and "pro" than heavily rounded systems.

- **Buttons & Inputs:** Use the base `4px` radius.
- **Cards:** Use `rounded-lg` (8px) for outer containers to provide a structural frame.
- **Badges:** Simulation/Mode badges utilize a `0px` radius or a very slight `2px` clip to mimic physical labels or printed tags.

## Components

- **Buttons:** Primary buttons use a solid Tactical Blue fill with white text. Secondary buttons use a "Ghost" style with a Slate border and no fill. Use Space Grotesk for button labels to emphasize actionability.
- **Cards:** The core container. Must include a header with a 1px bottom border and an optional "Status Dot" in the top-right corner.
- **Simulated Mode Badges:** Small, rectangular tags with monospace text. Example: `[ MODE: STAGING ]`. These should use high-contrast text on a dark background or a thin colored border (Amber for simulation, Blue for live).
- **Data Logs:** Use a dark-recessed background (darker than the card surface) with Space Grotesk text. Syntax highlighting should use the utility accents (Green/Amber).
- **Inputs:** Dark backgrounds with a 1px Slate border that brightens to Tactical Blue on focus. Labels sit above the field in uppercase monospace.
- **Status Indicators:** Small circular pips or "LED" style rectangles. Use glow effects sparingly to indicate "Power On" or "Active" states.