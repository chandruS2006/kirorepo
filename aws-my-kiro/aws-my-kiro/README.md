# TodoFlow

A lightweight, client-side To-Do list web application built for the
**Kiro University Build-Along 2026** challenge.

**Live features:** Add, edit, delete, and complete tasks · Priority levels ·
Due dates with overdue detection · Search · Filters · localStorage persistence ·
Dark theme dashboard UI · No backend, no signup, no build step.

**Repository:** https://github.com/adlinsweety/aws-my-kiro

---

## Quick Start

```powershell
# 1. Clone
git clone https://github.com/adlinsweety/aws-my-kiro.git
cd aws-my-kiro

# 2. Start the app (no install needed)
python -m http.server 8080

# 3. Open in browser
# http://localhost:8080
```

> Requires Python 3 (installed as `python` on Windows) and any modern browser.
> No `npm install` needed to run the app.

---

## Running Tests

Install the single dev dependency first:

```powershell
npm install
```

Then run any of:

```powershell
# Property-based tests (22 tests, main suite)
node tests/property.test.js

# Feature simulation tests
node tests/functional-sim.js

# Logic audit (ES5 IIFE parity check)
node tests/logic-audit.js

# Run all three
npm run test:all

# npm shortcut for property tests
npm test
```

All tests run in Node.js — no browser required.

---

## Project Structure

```
aws-my-kiro/
├── index.html              # App entry point
├── style.css               # Dark theme styles (CSS custom properties)
├── app.js                  # DOM layer — IIFE, state, render, events
├── task-logic.js           # Pure business logic — no DOM, testable in Node
├── package.json            # npm scripts, devDependency: fast-check
├── assets/
│   ├── todo-background.svg
│   └── todoflow-background.svg
├── tests/
│   ├── property.test.js    # Property-based tests (fast-check)
│   ├── functional-sim.js   # Feature simulation tests
│   └── logic-audit.js      # Logic audit vs IIFE copy
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

## Architecture

TodoFlow uses a strict two-layer architecture:

**Pure logic layer — `task-logic.js`**
All business logic as pure, side-effect-free functions. No DOM, no
localStorage. Exported via CommonJS for Node.js testing. Functions:
`createTask`, `addTask`, `deleteTask`, `toggleTask`, `editTask`,
`filterTasks`, `searchTasks`, `getVisibleTasks`, `isOverdue`, `formatDueDate`.

**DOM layer — `app.js`**
Runs as an IIFE. Owns the single state object `{ tasks, filter, search }`.
Every user action follows: pure function → `saveTasks()` → `render()`.
Renders the full task list on every state change — no incremental DOM patching.

**Persistence — localStorage**
Key: `todoflow_tasks`. Format: JSON array of Task objects. Validated on load
with `try/catch`; corrupt entries are silently dropped.

**Task shape:**
```js
{
  id:        string,    // timestamp36 + random
  text:      string,    // trimmed, non-empty
  completed: boolean,
  priority:  'low' | 'medium' | 'high',
  dueDate:   string | null,   // 'YYYY-MM-DD'
  createdAt: string           // ISO 8601
}
```

See `.kiro/specs/architecture.md` for the full architecture specification.

---

## Kiro Features

This project demonstrates all major Kiro IDE features.

### Spec-Driven Development — `.kiro/specs/`

| File | Contents |
|---|---|
| `todoflow-requirements.md` | User stories US-1–US-10, 12 functional requirements, 10 acceptance criteria |
| `architecture.md` | Layer separation, data model, state flow, rendering, MCP, extension points |
| `dark-theme-ui.md` | Dark theme color palette, CSS tokens, contrast ratios, interactive states |

Every feature traces back to an acceptance criterion. The architecture spec
defines which file owns which concern — enforced by the dev assistant agent.

### Steering Documents — `.kiro/steering/`

| File | Contents |
|---|---|
| `product.md` | Project purpose, target users, key features, non-goals |
| `coding-conventions.md` | Task shape, file ownership, no-go rules, accessibility |
| `ui-ux-conventions.md` | Dark theme tokens, layout, interactions, breakpoints, animations |
| `testing-conventions.md` | Property-based testing philosophy, fast-check patterns |
| `workflow.md` | Windows PowerShell commands for running, testing, git, and MCP |

All steering files are always included in Kiro's context, guiding every
implementation decision automatically.

### Hooks — `.kiro/hooks/`

| File | Trigger | What it does |
|---|---|---|
| `kironomics.json` | PostToolUse / UserPromptSubmit / Stop | Session analytics tracking |
| `validate-js-on-save.json` | PostFileSave (`.js\|.html\|.css`) | Node.js syntax check on every save |
| `run-tests-after-task.json` | PostTaskExec | Runs property + simulation tests after each spec task completes |
| `spec-first-reminder.json` | PreTaskExec | Reminds Kiro to check specs before implementing |

### MCP Server — `mcp-server/todoflow-mcp.js`

A custom Model Context Protocol server (JSON-RPC 2.0 over stdio) registered
in `.kiro/settings/mcp.json`. Kiro spawns it automatically.

**4 tools:**

| Tool | Description |
|---|---|
| `get_project_info` | Name, version, stack, file listing, Kiro feature inventory |
| `get_test_status` | Runs `tests/property.test.js`, returns pass/fail counts + output |
| `get_task_statistics` | Parses a tasks JSON export — completion rate, priority breakdown, overdue list |
| `get_spec_summary` | Returns full content of any spec or steering doc by name |

**Test the MCP server manually:**

```powershell
# List tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js

# Get project info
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_project_info","arguments":{}}}' | node mcp-server/todoflow-mcp.js

# Run tests via MCP
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_test_status","arguments":{}}}' | node mcp-server/todoflow-mcp.js

# Read the requirements spec via MCP
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_spec_summary","arguments":{"document":"requirements"}}}' | node mcp-server/todoflow-mcp.js
```

### Custom Agents — `.kiro/agents/`

**Todo QA Agent** (`todo-qa-agent.md`)
Verifies spec compliance against all 10 acceptance criteria, runs property tests,
checks accessibility attributes, validates coding conventions, and produces a
structured QA report.

```
@Todo QA Agent run a full QA check on the TodoFlow app
```

**TodoFlow Dev Assistant** (`dev-assistant.md`)
Guides feature implementation, enforces layer separation and task shape,
reviews code against conventions, explains the architecture, and helps
extend the MCP server or test suite.

```
@TodoFlow Dev Assistant add a "tags" field to tasks
@TodoFlow Dev Assistant review my change to app.js
@TodoFlow Dev Assistant how do I add a new MCP tool?
```

---

## Testing

### Property-Based Tests (`tests/property.test.js`)

22 tests using `fast-check` verify invariants across 8 categories:

1. **Add** — count increases by exactly 1; task appears in result
2. **Delete** — count decreases by exactly 1; task is gone
3. **Toggle** — double-toggle restores original state; identity preserved
4. **Filter** — active + completed always sums to total; each filter correct
5. **Search** — results always a subset; empty query returns all
6. **Uniqueness** — all IDs unique across bulk adds
7. **Persistence** — JSON round-trip preserves every field exactly
8. **Edit** — ID preserved; empty edit rejected

Each property runs against 200–500 randomly generated inputs.

### Feature Simulation (`tests/functional-sim.js`)

Step-by-step simulation of every user-facing feature: add, complete, filter,
search, combine filter+search, priority, overdue detection, edit, delete,
persistence round-trip, clear completed, empty states, validation, corrupt
localStorage recovery.

### Logic Audit (`tests/logic-audit.js`)

Runs the same scenarios against the ES5-compatible IIFE copy of the logic
functions (as they appear in `app.js`) to verify parity.

---

## Development

### Making a change

1. Read the relevant spec in `.kiro/specs/` first
2. Change `task-logic.js` for business logic changes
3. Mirror the change in the internal copy inside `app.js`
4. Change `index.html` / `style.css` for UI changes
5. Run `node tests/property.test.js` to catch regressions
6. Reload `http://localhost:8080` to verify in browser

### Extending the MCP server

Add a new tool to `mcp-server/todoflow-mcp.js`:
1. Add an entry to the `TOOLS` array
2. Implement the function above `handleRequest`
3. Add an `if (name === 'your_tool')` branch in `handleRequest`

### Adding a steering rule

Edit the relevant file in `.kiro/steering/`. Changes take effect in the next
Kiro session (steering files are injected at session start).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements, ARIA) |
| Styling | CSS3 (custom properties, flexbox, grid, dark theme) |
| Logic | Vanilla JavaScript ES6+ (`task-logic.js`) |
| DOM | Vanilla JavaScript ES5 IIFE (`app.js`) |
| Persistence | localStorage (no backend) |
| Testing | Node.js + fast-check (property-based) |
| MCP | Node.js (JSON-RPC 2.0 over stdio) |
| Dev server | Python `http.server` |

**No frameworks. No build tools. No runtime npm dependencies.**

---

## License

ISC
