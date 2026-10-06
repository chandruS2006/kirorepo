# Kiro University Build-Along — Evidence File

**Project:** TodoFlow — Client-side To-Do list web application
**Repository:** https://github.com/adlinsweety/aws-my-kiro
**Challenge:** Kiro University Build-Along 2026
**Participant:** adlinsweety

---

## Project Description

TodoFlow is a polished, responsive To-Do list web application built with HTML,
CSS, and Vanilla JavaScript. It runs entirely in the browser with no backend,
no build step, and no external APIs. Tasks persist via localStorage and include
priority levels, due dates, search, filtering, task counters, and a dark theme
dashboard UI with sidebar navigation.

---

## How to Run the Project

```powershell
# From the project root:
python -m http.server 8080
# Open http://localhost:8080
```

## How to Run Tests

```powershell
# Property-based tests (main suite — 22 tests)
node tests/property.test.js

# Feature simulation tests
node tests/functional-sim.js

# Logic audit (ES5 IIFE parity)
node tests/logic-audit.js

# npm shortcut
npm test
```

## How to Test the MCP Server

```powershell
# List available tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js

# Get project info
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_project_info","arguments":{}}}' | node mcp-server/todoflow-mcp.js

# Run tests via MCP
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_test_status","arguments":{}}}' | node mcp-server/todoflow-mcp.js

# Read a spec via MCP
echo '{"jsonrpc":"2.0","id":4,"method":"tools/call","params":{"name":"get_spec_summary","arguments":{"document":"requirements"}}}' | node mcp-server/todoflow-mcp.js
```

---

## Kiro University Lesson Evidence

### 1. Spec-Driven Development

**Evidence files:**
- `.kiro/specs/todoflow-requirements.md` — user stories, functional/non-functional requirements, 10 acceptance criteria in GIVEN/WHEN/THEN format, data model
- `.kiro/specs/architecture.md` — layer separation, file structure, state management, rendering, MCP integration, extension points
- `.kiro/specs/dark-theme-ui.md` — dark theme color palette, CSS token spec, interactive states, accessibility compliance

**How it was used:** A full specification was written before implementation covering
user stories US-1 through US-10, 12 functional requirements, 7 non-functional
requirements, and 10 testable acceptance criteria. Every feature — add, edit,
delete, complete, search, filter, priority, due dates, persistence — traces back
to a specific acceptance criterion. The architecture spec defines layer separation
that every code change must follow. The dark theme spec documents the exact color
tokens and contrast ratios used in `style.css`.

---

### 2. Steering Documents

**Evidence files:**
- `.kiro/steering/product.md` — project purpose, target users, key features, non-goals
- `.kiro/steering/coding-conventions.md` — Task shape, file ownership, no-go rules, accessibility requirements
- `.kiro/steering/ui-ux-conventions.md` — dark theme color tokens, layout, interaction patterns, responsive breakpoints, animations
- `.kiro/steering/testing-conventions.md` — property-based testing philosophy, what to test, fast-check patterns
- `.kiro/steering/workflow.md` — Windows-specific run/test/git/MCP/Kiro development workflow

**How it was used:** Five steering documents are always injected into Kiro's context,
guiding every implementation decision. `coding-conventions.md` specifies the canonical
Task shape and the no-go rules (no `var`, no inline handlers, no `alert()`).
`workflow.md` documents all commands for Windows PowerShell including `python`
(not `python3`). `ui-ux-conventions.md` was updated to reflect the actual dark
theme implementation.

---

### 3. Hooks

**Evidence files:**
- `.kiro/hooks/kironomics.json` — session analytics (preserved, not modified)
- `.kiro/hooks/validate-js-on-save.json` — PostFileSave syntax check on .js/.html/.css
- `.kiro/hooks/run-tests-after-task.json` — PostTaskExec: runs property + simulation tests after each spec task completes
- `.kiro/hooks/spec-first-reminder.json` — PreTaskExec agent hook: reminds Kiro to check specs before implementing

**How it was used:** Four hooks are active. The `validate-js-on-save` hook fires on
every file save and catches JavaScript syntax errors immediately. The `run-tests-after-task`
hook runs the full test suite automatically after each spec task is marked complete,
catching regressions without manual intervention. The `spec-first-reminder` hook
injects a prompt to check acceptance criteria before any implementation begins.
The Kironomics hook was preserved untouched throughout.

---

### 4. Property-Based Testing

**Evidence file:** `tests/property.test.js`

**How it was used:** 22 property-based tests using `fast-check` test 8 invariant
categories against `task-logic.js`: (1) adding always increases count by 1;
(2) deleting removes exactly that task; (3) double-toggling restores original state;
(4) filter active + completed always sums to total; (5) search results are always
a subset; (6) all task IDs remain unique across bulk adds; (7) JSON round-trip
preserves all fields exactly; (8) editing with empty string leaves text unchanged.
Each property runs 200–500 random inputs. Also includes `tests/functional-sim.js`
(feature-by-feature simulation) and `tests/logic-audit.js` (ES5 IIFE parity check).

---

### 5. Powers

**Evidence:** The Kiro `bundled://investigate` workflow Power was used to perform
an automated spec compliance investigation. It verified script loading order in
`index.html`, confirmed `window.TodoLogic` bridge correctness, validated AC-6
(filter) and AC-7 (search) logic, and identified 5 minor issues (none runtime-breaking).
Documented in `.agents/todoflow-spec-investigation.md`.

---

### 6. Model Context Protocol (MCP)

**Evidence files:**
- `mcp-server/todoflow-mcp.js` — MCP server v1.1.0
- `.kiro/settings/mcp.json` — server registration

**How it was used:** A custom MCP server exposes 4 tools over JSON-RPC 2.0 stdio:

| Tool | What it does |
|---|---|
| `get_project_info` | Returns name, version, stack, file listing, Kiro feature inventory |
| `get_test_status` | Runs `tests/property.test.js` and returns pass/fail counts + output |
| `get_task_statistics` | Parses a tasks JSON export for completion rate, priority breakdown, overdue list |
| `get_spec_summary` | Reads any spec or steering doc by name and returns its full content |

The server is registered in `.kiro/settings/mcp.json` so Kiro spawns it
automatically. Includes `uncaughtException` handler and robust error recovery
in `getTestStatus` (extracts counts even from non-zero exit codes).

---

### 7. Custom Agents

**Evidence files:**
- `.kiro/agents/todo-qa-agent.md` — QA agent: spec compliance, test runner, accessibility audit, code quality checks, structured report output
- `.kiro/agents/dev-assistant.md` — Dev assistant: feature implementation guidance, code review, architecture explanation, MCP extension help, test writing guidance

**How it was used:** Two agents cover complementary roles. The QA agent verifies
what exists meets spec. The dev assistant guides safe implementation of new features,
enforcing layer separation, task shape requirements, and no-go rules. Both agents
define exactly which files to read first, what to check, and how to report results.

---

## Complete File Map

| File | Kiro Lesson |
|---|---|
| `.kiro/specs/todoflow-requirements.md` | Spec-Driven Development |
| `.kiro/specs/architecture.md` | Spec-Driven Development |
| `.kiro/specs/dark-theme-ui.md` | Spec-Driven Development |
| `.kiro/steering/product.md` | Steering Documents |
| `.kiro/steering/coding-conventions.md` | Steering Documents |
| `.kiro/steering/ui-ux-conventions.md` | Steering Documents |
| `.kiro/steering/testing-conventions.md` | Steering Documents |
| `.kiro/steering/workflow.md` | Steering Documents |
| `.kiro/hooks/kironomics.json` | Hooks (preserved) |
| `.kiro/hooks/validate-js-on-save.json` | Hooks |
| `.kiro/hooks/run-tests-after-task.json` | Hooks |
| `.kiro/hooks/spec-first-reminder.json` | Hooks |
| `.agents/todoflow-spec-investigation.md` | Powers |
| `mcp-server/todoflow-mcp.js` | MCP |
| `.kiro/settings/mcp.json` | MCP |
| `.kiro/agents/todo-qa-agent.md` | Custom Agents |
| `.kiro/agents/dev-assistant.md` | Custom Agents |
| `tests/property.test.js` | Property-Based Testing |
| `tests/functional-sim.js` | Testing |
| `tests/logic-audit.js` | Testing |
| `index.html` | Application |
| `style.css` | Application (dark theme) |
| `app.js` | Application (DOM layer) |
| `task-logic.js` | Application (pure logic) |

---

## Demo Instructions

See `DEMO.md` for the full step-by-step demo script.

**Quick demo path:**
1. `python -m http.server 8080` → open http://localhost:8080
2. Add 3 tasks with different priorities and a due date
3. Complete one, search, filter, edit, delete
4. Refresh → data persists
5. Show `.kiro/` folder in Kiro IDE → specs, steering, hooks, agents
6. Run `node tests/property.test.js` → 22 tests pass
7. Test MCP: `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js`
