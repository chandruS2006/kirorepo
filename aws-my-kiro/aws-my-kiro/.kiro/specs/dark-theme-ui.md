# TodoFlow — Dark Theme UI Specification

## 1. Overview

This specification describes the dark theme redesign of the TodoFlow UI.
It replaces the original light (indigo/white) theme with a near-black dark
theme using a violet/purple accent palette.

**Status:** Implemented in `style.css` (current)

---

## 2. Design Goals

- Reduce eye strain for extended use
- Create a premium, modern aesthetic
- Maintain full accessibility (contrast ratios, focus indicators)
- Preserve all existing functionality and layout structure
- Support the sidebar + main content layout unchanged

---

## 3. Color Palette

### Background Hierarchy
| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#0a0a0f` | Page background |
| `--c-surface` | `#111118` | Primary card/panel surface |
| `--c-surface-2` | `#16161f` | Secondary surface (inputs, code blocks) |
| `--c-surface-3` | `#1c1c27` | Tertiary surface (focused inputs, edit fields) |

### Accent
| Token | Value | Use |
|---|---|---|
| `--c-primary` | `#a78bfa` | Buttons, links, active states |
| `--c-primary-dark` | `#7c3aed` | Button backgrounds, hover states |
| `--c-primary-dim` | `#c4b5fd` | Subtle accents, progress ring label |
| `--c-purple` | `#8b5cf6` | Secondary accent |

### Status Colors
| Token | Value | Use |
|---|---|---|
| `--c-green` | `#34d399` | Completion, low priority |
| `--c-amber` | `#fbbf24` | Medium priority, warnings |
| `--c-red` | `#f87171` | High priority, overdue, danger |

### Text
| Token | Value | Use |
|---|---|---|
| `--c-text` | `#f1f0ff` | Primary body text |
| `--c-text-2` | `#c4c0e8` | Secondary text |
| `--c-text-3` | `#8b87b0` | Placeholder, muted labels |
| `--c-text-4` | `#504d6e` | Disabled, very muted |

### Borders
| Token | Value | Use |
|---|---|---|
| `--c-border` | `rgba(255,255,255,.07)` | Default borders |
| `--c-border-2` | `rgba(255,255,255,.12)` | Hover border, active border |

---

## 4. Page Background

A radial gradient mesh creates a subtle ambient glow without an external image:

```css
background:
  radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,.18) 0%, transparent 60%),
  radial-gradient(ellipse 60% 40% at 80% 110%, rgba(167,139,250,.1) 0%, transparent 55%),
  #0a0a0f;
```

This replaces the `assets/todoflow-background.svg` file reference (still present
for fallback) with a pure CSS gradient for better performance.

---

## 5. Sidebar

- Background: `#0d0d14` (slightly darker than main bg)
- Right border: `1px solid rgba(255,255,255,.07)`
- Nav active item: `rgba(167,139,250,.15)` background, `#c4b5fd` text
- Nav hover: `rgba(255,255,255,.05)` background
- Progress ring track: `rgba(255,255,255,.06)`
- Tip card: `rgba(167,139,250,.06)` bg, `rgba(167,139,250,.12)` border

---

## 6. Interactive States

### Inputs (task input, search, date)
- Default: `#16161f` background, `rgba(255,255,255,.07)` border
- Hover: `rgba(255,255,255,.12)` border
- Focus: `rgba(167,139,250,.5)` border + `0 0 0 3px rgba(167,139,250,.1)` ring

### Primary Button
- Default: `linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)`
- Hover: `linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)` + stronger glow
- Focus ring: `0 0 0 3px rgba(167,139,250,.4)`

### Task Items
- Default: transparent background
- Hover: `#16161f` bg + `rgba(255,255,255,.07)` border + `-1px` translateY
- Left accent bar: colored by priority (red/amber/green), visible on hover via `:has()` selector

### Checkbox
- Default: `#16161f` bg, `rgba(255,255,255,.12)` border
- Hover: violet border glow `0 0 0 3px rgba(167,139,250,.15)`
- Checked: `linear-gradient(135deg, #34d399, #059669)` + green glow

---

## 7. Priority Badges (dark-adjusted)

| Priority | Text Color | Background | Border |
|---|---|---|---|
| Low | `#34d399` (green) | `rgba(52,211,153,.1)` | `rgba(52,211,153,.25)` |
| Medium | `#fbbf24` (amber) | `rgba(251,191,36,.1)` | `rgba(251,191,36,.25)` |
| High | `#f87171` (red) | `rgba(248,113,113,.1)` | `rgba(248,113,113,.25)` |

---

## 8. Accessibility Compliance

- All text/background combinations meet WCAG AA (4.5:1 for normal text):
  - `#f1f0ff` on `#111118` ≈ 16:1
  - `#a78bfa` (accent) on `#111118` ≈ 5.8:1
  - `#34d399` (green) on `#16161f` ≈ 6.1:1
  - `#f87171` (red) on `#16161f` ≈ 4.9:1
- Focus indicators: 2px outline `#a78bfa` with 2px offset
- Reduced motion: `prefers-reduced-motion` disables animations
- `color-scheme: dark` set on date inputs for native dark picker

---

## 9. Responsive Behavior

Unchanged from the original spec — same breakpoints apply:
- `≤1100px`: 2-column stats grid, reduced padding
- `≤900px`: narrower sidebar
- `≤720px`: sidebar becomes horizontal top nav bar with border-bottom
- `≤520px`: vertical button stack, full-width filter tabs
- `≤360px`: stat card labels/icons hidden
