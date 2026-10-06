# TodoFlow — Architecture Specification

## 1. Overview

TodoFlow is a zero-dependency, single-page web application. There is no build
step, no server, and no external API. The entire application ships as three
static files: `index.html`, `style.css`, and `app.js`, supported by a shared
pure-logic module `task-logic.js`.

---

## 2. File Architecture

```
aws-my-kiro/
├── index.html          # Single entry point — structure + script loading
├── style.css           # All styles — dark theme, CSS custom properties
├── app.js              # DOM layer — event wiring, render, state management
├── task-logic.js       # Pure business logic — no DOM, fully testable in Node
├── assets/
│   ├── todo-background.svg
│   └── todoflow-background.svg
├── tests/
│   ├── property.test.js    # Property-based tests (fast-check)
│   ├── functional-sim.js   # Feature simulation tests
│   └── logic-audit.js      # Logic audit against IIFE copy of app.js
├── mcp-server/
│   └── todoflow-mcp.js     # MCP server (JSON-RPC 2.0 over stdio)
└── .kiro/
    ├── specs/              # Specification documents
    ├── steering/           # Steering documents
    ├── hooks/              # Hook definitions
    ├── agents/             # Custom agent definitions
    └── settings/
        └── mcp.json        # MCP server registration
```

---

## 3. Layer Separation

### 3.1 Pure Logic Layer — `task-logic.js`

Contains all business logic as pure functions with no DOM, no localStorage,
and no side effects. Exported via CommonJS for Node.js testing and via a
global `window.TodoLogic` bridge for use in the browser.

| Function | Responsibility |
|---|---|
| `createTask(text, priority, dueDate)` | Construct a new Task object with generated ID |
| `addTask(tasks, task)` | Prepend task to array, return new array |
| `deleteTask(tasks, id)` | Remove task by ID, return new array |
| `toggleTask(tasks, id)` | Flip `completed` flag, return new array |
| `editTask(tasks, id, newText)` | Update text if non-empty, return new array |
| `filterTasks(tasks, filter)` | Return subset by all/active/completed |
| `searchTasks(tasks, query)` | Case-insensitive text match, return subset |
| `getVisibleTasks(tasks, filter, search)` | Compose filter then search |
| `isOverdue(task)` | Return true if dueDate < today and not completed |
| `formatDueDate(dueDate)` | Format ISO date to human-readable string |

All functions are **immutable** — they return new arrays rather than mutating
the input, which makes them trivially testable and prevents state bugs.

### 3.2 DOM Layer — `app.js`

Runs as an IIFE (`(function() { ... }())`). Contains:

- **State object** — single source of truth: `{ tasks, filter, search }`
- **render()** — reads state, rebuilds DOM entirely on each state change
- **Event handlers** — `handleAdd`, `handleToggle`, `handleDelete`,
  `handleFilterChange`, `handleSearch`, `handleClearCompleted`
- **Inline edit** — `startEdit()` replaces a `<span>` with an `<input>`,
  commits or cancels on Enter/Escape/blur
- **Persistence** — `saveTasks()` / `loadTasks()` via `localStorage`
- **Greeting and date** — set dynamically on init

The DOM layer duplicates the pure logic functions internally (with ES5-compatible
syntax) so that `app.js` works as a standalone `<script>` without requiring
`task-logic.js` to be loaded. The `task-logic.js` module is loaded separately
for the test suite.

### 3.3 Persistence Layer — localStorage

Key: `todoflow_tasks`
Format: JSON array of Task objects
Error handling: `try/catch` on both read and write; corrupt data is filtered
by validating `id` (string), `text` (string), `completed` (boolean).

---

## 4. Data Model

```js
{
  id:        string,   // e.g. "m3wz5k2-a8f3q1x" (timestamp36 + random)
  text:      string,   // trimmed, non-empty
  completed: boolean,  // default false
  priority:  'low' | 'medium' | 'high',   // default 'medium'
  dueDate:   string | null,               // 'YYYY-MM-DD' or null
  createdAt: string,   // ISO 8601 datetime
}
```

---

## 5. State Management

State is a plain JavaScript object in the `app.js` closure:

```js
var state = {
  tasks:  [],     // full task array (source of truth)
  filter: 'all',  // current filter tab
  search: ''      // current search query
};
```

Every user action follows this pattern:
1. Handler updates `state.tasks` using a pure function from the logic layer
2. Calls `saveTasks(state.tasks)` to persist
3. Calls `render()` to rebuild the DOM from the new state

There is no incremental DOM patching — `render()` is a full rebuild. This is
intentional for simplicity; at the task count ceiling (~500 tasks) this is
imperceptible to the user.

---

## 6. Rendering

`render()` is called after every state change. It:

1. Computes derived values (activeCount, completedCount, pct)
2. Updates all counter elements (stat cards, sidebar badges, footer)
3. Updates the progress ring SVG via `strokeDashoffset`
4. Shows/hides empty state vs task list
5. Rebuilds all `<li>` elements via `buildTaskEl(task)`

`buildTaskEl(task)` creates the full task item DOM tree programmatically
with no innerHTML — all nodes are created via `document.createElement`.

---

## 7. Styling Architecture

`style.css` uses CSS Custom Properties for theming:

```css
:root {
  --c-primary:    #a78bfa;   /* violet accent */
  --c-bg:         #0a0a0f;   /* near-black background */
  --c-surface:    #111118;   /* card surface */
  --c-text:       #f1f0ff;   /* primary text */
}
```

Layout uses CSS Grid (stats row) and Flexbox (sidebar + main, task items).
All responsive breakpoints use `max-width` media queries (mobile-first order
in stylesheet, desktop-first logic in breakpoints).

---

## 8. MCP Integration

The `mcp-server/todoflow-mcp.js` server runs as a child process of Kiro.
It communicates over `stdin`/`stdout` using JSON-RPC 2.0 (MCP protocol).

```
Kiro IDE
  └── spawns → node mcp-server/todoflow-mcp.js
        ├── stdin  ← JSON-RPC requests from Kiro
        └── stdout → JSON-RPC responses to Kiro
```

Tools exposed: `get_project_info`, `get_test_status`, `get_task_statistics`.

---

## 9. Extension Points

To extend TodoFlow, a developer should:

| Goal | Where to change |
|---|---|
| Add a new task field (e.g. tags) | `task-logic.js` (createTask), `app.js` (buildTaskEl, render), `index.html` (add input), `style.css` |
| Add a new filter | `task-logic.js` (filterTasks), `app.js` (handleFilterChange), `index.html` (filter tab) |
| Add a backend sync | New `sync.js` file; hook into `saveTasks`/`loadTasks` in `app.js` |
| Add new MCP tools | `mcp-server/todoflow-mcp.js` — add to TOOLS array and handleRequest |
| Add more tests | `tests/property.test.js` — new `test()` block with `fc.assert` |
