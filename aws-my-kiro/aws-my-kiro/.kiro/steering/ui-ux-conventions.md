# UI/UX Conventions

## Design Language

- **Style:** Premium dark dashboard — inspired by Linear and Vercel
- **Color scheme:** Near-black background (`#0a0a0f`), violet primary (`#a78bfa`), dark surfaces
- **Typography:** Inter (loaded from Google Fonts) with system-ui fallback
- **Spacing:** 8px grid system
- **Theme:** Dark — do NOT revert to light theme without updating this doc

## Color Tokens

All colors are defined as CSS custom properties in `style.css` `:root`:

```css
--c-primary:    #a78bfa;   /* violet accent */
--c-bg:         #0a0a0f;   /* page background */
--c-surface:    #111118;   /* card/panel */
--c-surface-2:  #16161f;   /* inputs, secondary panels */
--c-surface-3:  #1c1c27;   /* focused inputs, edit fields */
--c-text:       #f1f0ff;   /* primary text */
--c-text-2:     #c4c0e8;   /* secondary text */
--c-text-3:     #8b87b0;   /* muted / placeholder */
--c-text-4:     #504d6e;   /* very muted / disabled */
--c-border:     rgba(255,255,255,.07);
--c-border-2:   rgba(255,255,255,.12);
--c-green:      #34d399;   /* low priority / complete */
--c-amber:      #fbbf24;   /* medium priority */
--c-red:        #f87171;   /* high priority / overdue / danger */
```

## Layout

- Sidebar (240px) + main content — flex row layout
- On mobile (≤720px): sidebar becomes horizontal top nav bar
- Main content max-width: 860px
- Stats row: 4-column CSS grid (collapses to 2 on tablet)
- All spacing uses multiples of `--spacing-unit: 8px`

## Sidebar

- Background: `#0d0d14` (slightly darker than page bg)
- Brand logo: violet gradient SVG icon + "TodoFlow" wordmark
- Nav items: active state `rgba(167,139,250,.15)` bg + `#c4b5fd` text
- Progress ring: animated SVG circle with violet gradient stroke
- Tip card: violet tint background at bottom

## Task Item Design

- Checkbox on left (20×20px, custom styled, rounded corners)
- Checkbox checked state: green gradient + checkmark
- Task text center (strikethrough + reduced opacity when completed)
- Left accent bar (3px): color-coded by priority on hover
  - High → `#f87171` (red)
  - Medium → `#fbbf24` (amber)
  - Low → `#34d399` (green)
- Priority badge (colored pill): Low=green, Medium=amber, High=red
- Due date display with `⚠` and red styling when overdue
- Edit and Delete icon buttons — opacity 0.4 default, 1.0 on hover/focus
- Completed tasks: 45% opacity, strikethrough text

## Interaction Patterns

- Add task: press Enter or click Add button
- Edit task: click ✏️ icon → inline `<input>` replaces text span → Enter/blur to save, Escape to cancel
- Delete: click 🗑️ icon → immediate removal (no confirmation)
- Complete: click checkbox → immediate toggle
- Search: real-time filtering as user types (no debounce needed at this scale)
- Filter tabs: single-click switching — All / Active / Completed
- Sidebar nav: clicking a nav item also changes the filter

## Empty States

- No tasks at all: dark SVG illustration + "No tasks yet" + "Add a task above to get started!"
- No results for search/filter: "No tasks match" + "Try a different filter or search term."

## Responsive Breakpoints

```
≥1100px  : Full sidebar + 4-col stats
≤1100px  : 2-col stats
≤900px   : Narrower sidebar (200px), tip hidden
≤720px   : Sidebar → horizontal top nav bar
≤520px   : Vertical add row, full-width filter tabs, always-visible action buttons
≤360px   : Stat card labels/icons hidden
```

## Validation

- Empty task text: inline red message "Task cannot be empty" (prefixed with ⚠)
- Message auto-dismisses after 3 seconds or on next input keystroke
- Never use `alert()` — always use the `#validation-msg` element

## Accessibility Requirements

- All interactive elements keyboard-accessible (Tab, Enter, Space, Escape)
- `aria-label` on all icon-only buttons (edit, delete, checkbox)
- `aria-live="assertive"` on validation message element
- `role="list"` on task list, `role="tablist"` on filter tabs
- Visible focus indicators: 2px violet outline, 2px offset
- Color contrast ratio ≥ 4.5:1 for all text (verified in dark-theme-ui.md spec)
- `prefers-reduced-motion` disables all CSS animations and transitions

## Animation

- Task entry: `taskSlideIn` keyframe — 220ms, translateY(-8px) → 0, cubic-bezier spring
- Progress ring: `stroke-dashoffset` transition 600ms ease
- All hover/focus transitions: 120ms–180ms ease
- Reduced motion: all animations/transitions set to 0.01ms via media query
