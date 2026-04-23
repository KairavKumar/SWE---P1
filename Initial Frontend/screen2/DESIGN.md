---
name: Academic Excellence System
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#454652'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#4355b9'
  on-secondary: '#ffffff'
  secondary-container: '#8596ff'
  on-secondary-container: '#11278e'
  tertiary: '#001944'
  on-tertiary: '#ffffff'
  tertiary-container: '#002c6e'
  on-tertiary-container: '#6b95f3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#dee0ff'
  secondary-fixed-dim: '#bac3ff'
  on-secondary-fixed: '#00105c'
  on-secondary-fixed-variant: '#293ca0'
  tertiary-fixed: '#d9e2ff'
  tertiary-fixed-dim: '#b0c6ff'
  on-tertiary-fixed: '#001945'
  on-tertiary-fixed-variant: '#00429c'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  h1:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is engineered for the rigors of academic administration and the pursuit of scholarly excellence. The brand personality is grounded in **authority, precision, and reliability**. It avoids fleeting trends in favor of a **Corporate / Modern** aesthetic that emphasizes information density without sacrificing clarity. 

The target audience—comprising registrars, faculty, and students—requires an environment that minimizes cognitive load while handling complex data sets. The visual language utilizes a "Content-First" approach, where the UI recedes to highlight academic records, schedules, and performance metrics. The emotional response is one of institutional stability and professional efficiency.

## Colors

The color palette is anchored by a traditional **Deep Navy**, evoking the heritage of prestigious institutions. This is complemented by **Scholarly Blue**, used for interactive elements and primary actions to ensure high visibility and accessibility.

The neutral palette transitions from a pure white surface to a very light "Cool Gray" for background scaffolding, creating a subtle contrast that helps define layout boundaries. Semantic colors are strictly reserved for status indicators:
- **Success:** Passing grades, completed enrollments, or active statuses.
- **Warning:** Probationary alerts, pending approvals, or upcoming deadlines.
- **Danger:** Failing grades, expired credentials, or critical system errors.

## Typography

The design system utilizes **Inter** for all typographic needs, chosen for its exceptional legibility in data-heavy environments and its neutral, systematic character.

- **Headlines:** Use a tighter tracking and heavier weight to establish a clear information hierarchy.
- **Body Text:** Optimized for long-form reading of research or administrative notes, maintaining a comfortable 1.5 line height.
- **Labels:** Small caps or medium-weight uppercase styles are used for table headers and metadata to differentiate them from actionable text.
- **Numerical Data:** Where possible, use tabular figures to ensure that grades, dates, and IDs align vertically in lists and tables.

## Layout & Spacing

This design system follows a **Fixed Grid** model for centralized content areas to ensure readability, while navigation and utility bars remain fluid. A strict 8px spacing rhythm ensures consistency across all components.

The layout utilizes a 12-column grid system. For complex dashboards, the grid is used to organize "Academic Modules" (cards) into logical groupings. Margins are generous (32px+) to prevent the interface from feeling cramped, which is essential when displaying dense scholarly data.

## Elevation & Depth

To maintain a sense of high trust and professionalism, the design system avoids aggressive shadows. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines**.

- **Surface Level 0 (Background):** Soft Gray (#f5f7fa).
- **Surface Level 1 (Cards/Modules):** Pure White with a 1px border (#e0e4e8).
- **Surface Level 2 (Modals/Popovers):** Pure White with an ambient, highly diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.05)) to suggest floating without feeling "heavy."
- **Interactive States:** Buttons and clickable cards use a subtle "lift" effect (moving from 1px to 4px shadow) upon hover to provide tactile feedback.

## Shapes

The shape language is conservative and **Soft (0.25rem)**. This slight rounding removes the harshness of sharp corners—making the system feel modern—while maintaining a professional, structured appearance that sharp corners traditionally provide in government or academic software.

- **Buttons & Inputs:** 4px radius.
- **Cards & Containers:** 8px radius.
- **Status Pills:** 16px (fully rounded) to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Scholarly Blue background, white text. No gradients.
- **Secondary:** Deep Navy border, Navy text, white background.
- **Tertiary:** No border, Navy text. Used for low-priority actions like "Cancel."

### Cards
Cards are the primary vehicle for academic data. Every card must have a 1px soft gray border. For "Course Cards," use a top-border accent in the primary color or a semantic color to indicate status.

### Status Indicators
Small, pill-shaped chips used for "Enrollment Status" or "Grading Progress." They use a low-opacity version of the semantic color for the background and a high-contrast version for the text (e.g., light green background with dark green text).

### Form Fields
Inputs use a white background with a 1px border. On focus, the border transitions to Scholarly Blue with a 2px outer "glow" of the same color at 20% opacity. Labels are always positioned above the field for maximum legibility.

### Data Visualizations
Charts should utilize the primary and secondary blue palette. For comparative data, use shades of navy. Grid lines in charts should be kept to a minimum and colored in the lightest soft gray.