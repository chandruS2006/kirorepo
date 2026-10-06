# Coding Conventions

## Stack

- **HTML5** — semantic elements, ARIA attributes for accessibility
- **CSS3** — custom properties (CSS variables), flexbox/grid layout, dark theme
- **Vanilla JavaScript (ES6+ in task-logic.js, ES5-compatible IIFE in app.js)**
- **No frameworks, no build tools** — the app runs by opening index.html

## JavaScript Conventions

### In `task-logic.js` (Node-compatible pure logic)
- Use `const` / `let`; never `var`
- Arrow functions for callbacks; named functions for exported top-level logic
- ES6+ features allowed: spread, destructuring, template literals, `includes()`
- Export via CommonJS at the bottom: `module.exports = { ... }`

### In `app.js` (browser IIFE)
- Written as an IIFE: `(function () { 'use strict'; ... }());`
- Uses `var` / `function` for broad browser compatibility inside the IIFE
- No ES6 module imports — functions are self-contained in the closure
- Internal pure functions mirror `task-logic.js` exactly (kept in sync manually)

## Task Object Shape

All task objects must follow this canonical shape:

```js
{
  id:        string,          // e.g. "m3wz5k2-a8f3q1x"
  text:      string,          // non-empty, trimmed
  completed: boolean,         // default: false
  priority:  'low' | 'medium' | 'high',  // default: 'medium'
  dueDate:   string | null,   // 'YYYY-MM-DD' or null
  createdAt: string           // ISO 8601 datetime string
}
```

Never add properties to task objects without updating:
1. `createTask()` in `task-logic.js`
2. The internal `createTask()` in `app.js`
3. The persistence validation in `loadTasks()` in `app.js`
4. The spec data model in `.kiro/specs/todoflow-requirements.md`
5. The property-based tests in `tests/property.test.js`

## State Management

State lives in a single object in the `app.js` closure:

```js
var state = { tasks: [], filter: 'all', search: '' };
```

Every mutation follows: **pure function → save → render**. Never mutate
`state.tasks` in place — always replace with the return value of the logic
function.

## CSS Conventions

- Use CSS custom properties for all colors and key spacing values
- BEM-like class naming:
  - Block: `.task-item`
  - Modifier: `.task-item--completed`
  - Element: `.task-item__text` (used as `.task-body`, `.task-text`, etc.)
- No inline `style=""` attributes — all styling via CSS classes
- Mobile-first breakpoints using `max-width` media queries

## File Structure

```
index.html              # HTML entry point, loads task-logic.js then app.js
style.css               # All styles — dark theme
app.js                  # DOM layer — IIFE, event wiring, render, state, persistence
task-logic.js           # Pure business logic — no DOM, exports for Node.js tests
assets/
  todo-background.svg
  todoflow-background.svg
tests/
  property.test.js      # fast-check property-based tests (22 tests)
  functional-sim.js     # Feature simulation / integration tests
  logic-audit.js        # ES5 logic audit (tests IIFE-compatible copy)
mcp-server/
  todoflow-mcp.js       # MCP server — JSON-RPC 2.0 over stdio
.kiro/
  specs/
    todoflow-requirements.md  # User stories, acceptance criteria
    architecture.md           # Architecture, layers, data model
    dark-theme-ui.md          # Dark theme color spec
  steering/
    product.md                # Product overview, goals, non-goals
    coding-conventions.md     # This file
    ui-ux-conventions.md      # Design language, layout, interactions
    testing-conventions.md    # Testing philosophy, property tests
    workflow.md               # How to run, develop, test, deploy
  hooks/
    kironomics.json           # Session analytics (do not remove)
    validate-js-on-save.json  # Syntax check on .js/.html/.css save
  agents/
    todo-qa-agent.md          # QA agent — spec compliance + test runner
    dev-assistant.md          # Dev assistant — implementation help
  settings/
    mcp.json                  # MCP server registration for Kiro
```

## Error Handling

- Always validate task text (non-empty after trim) before calling `createTask`
- Show inline validation messages using `#validation-msg`, never `alert()`
- Gracefully handle corrupt localStorage data with `try/catch` in `loadTasks()`
- MCP server errors: return JSON-RPC error responses, never crash the process

## Accessibility

- All interactive elements keyboard-accessible (Tab / Enter / Space / Escape)
- `aria-label` on every icon-only button
- `aria-live="assertive"` on the validation message element
- `role="tablist"` / `role="tab"` / `aria-selected` on filter tabs
- Visible focus indicators — never remove `:focus-visible` styles
- Color contrast ratio ≥ 4.5:1 for all text against their background

## No-Go Rules

- No `var` in `task-logic.js` or new code outside the `app.js` IIFE
- No inline event handlers in HTML (`onclick=`, `onchange=`, etc.)
- No `alert()`, `confirm()`, or `prompt()`
- No external runtime dependencies (CDNs, npm packages in the browser)
- No direct DOM manipulation in `task-logic.js`
- No `localStorage` access in `task-logic.js` or tests
