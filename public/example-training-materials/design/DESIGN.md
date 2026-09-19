---
name: Kitchen Spec Ops
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#45464c'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#575e70'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#141b2b'
  on-primary-container: '#7d8497'
  inverse-primary: '#c0c6db'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#410002'
  on-tertiary-container: '#f63a35'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#ffdad6'
  tertiary-fixed-dim: '#ffb4ab'
  on-tertiary-fixed: '#410002'
  on-tertiary-fixed-variant: '#93000b'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: 0.05em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.03em
  headline-lg-mobile:
    fontFamily: Barlow Condensed
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 19px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  body-sm:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 9.5px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
spacing:
  gutter: 0.75rem
  gutter-compact: 0.375rem
  margin: 1rem
  margin-punch: 1.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for the high-friction, wet, frantic reality of commercial back-of-house (BOH) food prep environments. It channels an industrial, utilitarian brutalist aesthetic combined with high-durability laminated procedural sheets. Visual communication is prioritized for split-second legibility under harsh fluorescent lighting, steam, grease smudges, and across a stainless steel line.

### Key Visual Pillars
- **Physical Card Metaphor:** Components evoke heavy cardstock (100lb cover) protected by 5mil matte laminate with reinforced margins for 3-hole half-sheet punch-outs.
- **Safety & Tactical Precision:** Hazard caution striping, stark contrast ratios (exceeding WCAG AAA), and industrial warning accents delineate allergen notices, critical control points (HACCP), and time/temperature limits.
- **No-Nonsense Utilitarianism:** Gratuitous decoration, soft drop shadows, and subtle low-contrast gradients are prohibited. Visual weight is carried through strict mechanical borders, bold solid color fills, and tabular data density.

## Colors

The palette reproduces flawlessly in both calibrated CMYK commercial print workflows and high-glare kitchen tablet displays.

### Palette Roles
- **Primary (`#111827` - Heavy Charcoal):** Dominates all structural framing, category banners, station headers, and heavy boundary lines. Provides ink-black contrast against pure substrates.
- **Secondary (`#D97706` - Hazard Amber):** Applied to caution borders, hazard warning blocks, critical control point (CCP) alert bars, and diagonal safety hash patterns.
- **Tertiary (`#DC2626` - Critical Biohazard / Kill-Step Red):** Reserved strictly for immediate safety hazards: cross-contamination warnings, raw meat/poultry station boundaries, severe allergens, and rapid discard alerts.
- **Neutral (`#1F2937` - Machine Gray):** Body text, field lines, tabular grids, and inactive indicators.

### Status Tokens (Operational Line Badges)
- **Safe / Line Ready (Emerald):** `#059669` (Solid), `#ECFDF5` (Substrate tint)
- **Caution / Hold Warning (Amber):** `#D97706` (Solid), `#FFFBEB` (Substrate tint)
- **Time/Temp Warning (Orange):** `#EA580C` (Solid), `#FFF7ED` (Substrate tint)
- **Critical Violation / Discard (Red):** `#DC2626` (Solid), `#FEF2F2` (Substrate tint)
- **Base Substrate:** `#FFFFFF` (Surface), `#F3F4F6` (Laminate backing / alternate row tint)

## Typography

The type system pairs condensed signage letterforms with technical monospace accents and a high-legibility sans-serif for instruction prose.

- **Barlow Condensed (Headlines & Station Titles):** Set in full uppercase (`text-transform: uppercase`) with tight vertical metrics. Emulates punchy industrial metal stamping, equipment warning placards, and high-density signage.
- **IBM Plex Sans (Prose & Prep Steps):** Engineered for technical documentation; preserves character distinction (e.g., distinguishing `1`, `l`, and `I`) under low-contrast or grease-stained conditions.
- **JetBrains Mono (Metrics, Yields, Specs, Labels):** Guarantees columnar alignment for numbers, cook times, target temperatures (°F/°C), shelf lives, and batch sizes. All numbers must use tabular figures (`font-variant-numeric: tabular-nums`).

## Layout & Spacing

The spatial model is strictly engineered for a physical **5.5" × 8.5" half-sheet vertical format** (Statement / Memo size, 2-up on standard US Letter), bound via standard 3-ring binder hardware on the left spine.

### Half-Sheet Page Grid
- **Binder Punch Zone (`margin-punch`):** When rendered as a physical sheet or bound print, the left margin reserves `1.75rem` (28px minimum / 0.5 inches physical) safe distance to accommodate mechanical 3-hole drilling without puncturing actionable text or visual framing borders.
- **Outer Canvas Safe Margin (`margin`):** `1rem` on top, right, and bottom edges to maintain edge-seal safety during lamination cutting.
- **Column Architecture:** 4-column micro-grid on half-sheet/mobile viewport; 8-column layout when viewing a two-page spread (facing prep sheets) on desktop or wide-mount kitchen display tablets.
- **Density:** Spacing is compact (`space-xs` through `space-md`) to enforce single-sheet procedural containment—prep guides must never spill over to a reverse side where dirty hands must flip the page.

## Elevation & Depth

This system intentionally eliminates blurred ambient drop shadows and soft skeuomorphic gradients. Elevation is communicated solely through **structural ink borders**, **surface tint layering**, and **tactile punch styling**.

### Elevation Rules
- **Flat Ground (Layer 0):** Pure white `#FFFFFF` surface sheet.
- **Contained Zones (Layer 1):** Solid `2px` or `3px` solid `#111827` borders enclosing distinct functional cells (e.g., Ingredient Matrix, CCP Action Box, Tool Checklist).
- **Emphasized Station Headers (Layer 2):** Solid `#111827` block fills with inverted `#FFFFFF` text. Visual weight anchors the top of each laminated section.
- **Physical "Heavy Card" Offset:** When interactive components require physical presence (e.g., clickable checklist targets or physical tab dividers), apply a hard, un-blurred offset: `box-shadow: 3px 3px 0px #111827`. No soft blur, zero spread.
- **Caution / Attention Depth:** Accent boxes receive a solid `3px` perimeter border paired with a `4px` tall diagonal hazard-striped top stripe.

## Shapes

All shapes utilize a **strictly sharp zero-radius (`0px`) geometry**.

- **Corners:** Corners terminate at exact 90-degree right angles. In physical laminates, corner trims may have an external industrial 3mm corner round for handling safety, but all UI elements, bounding containers, badges, tables, and buttons within the boundary retain razor-sharp `0px` edges.
- **Dividers & Lines:** Hairline borders are `1px solid #1F2937`; structural borders are `2px solid #111827`; high-priority hazard boundaries are `3px solid #D97706` or `#DC2626`.
- **Caution Striping Pattern:** CSS repeating linear gradient (`repeating-linear-gradient(45deg, #111827, #111827 8px, #D97706 8px, #D97706 16px)`) applied to warning header bars and critical allergen dividers.

## Components

### 1. Station Banners & Header Bars
- **Style:** Full-width `#111827` background blocks.
- **Text:** `Barlow Condensed` Bold, `headline-lg`, uppercase, white `#FFFFFF`.
- **Sub-strip:** Top or bottom edge carries a `4px` solid `#D97706` bar or continuous diagonal hazard striping for station alert identifiers.

### 2. Status Badges & Pill Tokens
- **Geometry:** Zero-radius rectangle with `1.5px` solid outline and solid indicator square (`6px × 6px`) preceding the text.
- **Typography:** `label-sm` in `JetBrains Mono`, all uppercase.
- **Variants:**
  - *Ready / Pass:* `#ECFDF5` background, `#059669` border and text.
  - *Prep Hold:* `#FFFBEB` background, `#D97706` border and text.
  - *Expiring:* `#FFF7ED` background, `#EA580C` border and text.
  - *Critical Discard:* `#DC2626` background, `#FFFFFF` text, bold `2px` black outer shadow offset (`2px 2px 0px #111827`).

### 3. Checklists & Verification Boxes
- **Box Size:** Strict `18px × 18px` square with `2px solid #111827`.
- **State Display:** Empty white fill when open. When checked, marked with a bold solid black diagonal cross (`X`) or solid square insert to support rapid dry-erase marker grease-pencil checking on laminated binders.
- **Label:** `body-md` in `IBM Plex Sans` with accompanying `label-md` time/spec requirement aligned to the right margin.

### 4. Spec & Yield Data Tables
- **Grid:** Rigid tabular presentation with `1px solid #111827` grid lines separating all columns and rows.
- **Header Row:** Light charcoal `#1F2937` with white uppercase `label-md` text.
- **Data Rows:** Alternating row striping (`#FFFFFF` and `#F3F4F6`). Numbers and measurements use `JetBrains Mono` right-aligned.

### 5. Critical Control Point (CCP) Warning Cards
- **Card Container:** `#FFFFFF` fill with `3px solid #D97706` (or `#DC2626` for allergens/pathogens).
- **Header Accent:** Caution-striped banner with the text "CRITICAL CONTROL POINT" in `label-sm` high-contrast badge.
- **Content:** Target temperatures displayed in oversized `display` or `headline-lg` `JetBrains Mono` (e.g., `HOLD TEMP: ≥ 165°F (74°C)`).

### 6. Interactive Action Buttons (KDS / Tablet Modes)
- **Resting:** Solid background (`#111827` primary, `#FFFFFF` secondary), sharp `0px` corners, `2px solid #111827`, text centered in `label-lg`.
- **Elevation:** Offset hard shadow `3px 3px 0px #111827`.
- **Active / Pressed:** Shift translate `2px 2px` with shadow reduced to `1px 1px 0px #111827` to give mechanical tactile feedback during high-speed touchscreen interaction.