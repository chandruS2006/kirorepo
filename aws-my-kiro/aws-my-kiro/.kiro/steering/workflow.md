# Development Workflow

## Environment

- **OS:** Windows (PowerShell)
- **Runtime:** Node.js (invoked as `python` for HTTP server, `node` for tests)
- **No build step** — all source files are served directly as static assets
- **No package install required** to run the app — only needed for tests

## Running the App

Start a local HTTP server from the project root:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080` in any modern browser.

> Note: Always use `python` (not `python3`) on Windows. The `package.json`
> start script is already set to `python -m http.server 8080`.

To stop the server: `Ctrl+C` in the terminal.

## Running Tests

### Property-based tests (main test suite)
```powershell
node tests/property.test.js
```
Expected output: `✅ All 22 property-based tests passed!`

### Feature simulation tests
```powershell
node tests/functional-sim.js
```
Expected output: `All XX features verified!`

### Logic audit (ES5 parity check)
```powershell
node tests/logic-audit.js
```
Expected output: `ALL XX CHECKS PASS`

### npm test shortcut
```powershell
npm test
```
Runs `node tests/property.test.js`.

> Tests run entirely in Node.js — no browser needed.
> `fast-check` must be installed: `npm install` (installs devDependencies).

## MCP Server

The MCP server runs automatically when Kiro connects to it via `.kiro/settings/mcp.json`.
To test it manually:

```powershell
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js
```

To run the test status tool:
```powershell
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_test_status","arguments":{}}}' | node mcp-server/todoflow-mcp.js
```

## Making Changes

### Changing business logic
1. Edit `task-logic.js`
2. Run `node tests/property.test.js` to verify all invariants still hold
3. Run `node tests/functional-sim.js` for feature coverage
4. If adding a new function, export it at the bottom of `task-logic.js`

### Changing the UI
1. Edit `style.css` for styles, `index.html` for structure
2. The `validate-js-on-save` hook will syntax-check `.js` files on save
3. Reload `http://localhost:8080` in the browser (no build needed)

### Changing app behaviour
1. Edit `app.js` (DOM layer — event handlers, render, state)
2. Keep the pure logic in `task-logic.js`, DOM manipulation in `app.js`
3. The internal IIFE functions in `app.js` must stay in sync with `task-logic.js`

## Git Workflow

```powershell
# Check status
git status

# Stage specific files (preferred over git add .)
git add index.html style.css app.js

# Commit
git commit -m "descriptive message"

# Push
git push origin main
```

Remote: `https://github.com/adlinsweety/aws-my-kiro.git`

> Never force-push to main without reviewing the diff.
> The `.gitignore` excludes `node_modules/` and `.DS_Store`.

## Dependency Management

The project has a single devDependency: `fast-check` (property-based testing).

```powershell
# Install devDependencies (only needed for running tests)
npm install

# Check for outdated packages
npm outdated
```

Do NOT add runtime dependencies — the app must work without `npm install`.
All runtime code is vanilla JS with no imports.

## Kiro IDE Workflow

- Steering docs in `.kiro/steering/` are always included in Kiro context
- Specs in `.kiro/specs/` describe what to build — reference them when adding features
- The `@Todo QA Agent` can be invoked to run a full compliance check
- The `@TodoFlow Dev Assistant` can be invoked for implementation help
- Hooks fire automatically: `kironomics` tracks sessions, `validate-js-on-save` checks syntax

## File Ownership

| File | Owner concern |
|---|---|
| `task-logic.js` | Pure logic — change only for new business rules |
| `app.js` | DOM + state — change for UI behaviour, event handling |
| `index.html` | Structure + a11y — change for new UI elements |
| `style.css` | Visual design — change for theme, layout, responsive |
| `tests/property.test.js` | Invariant tests — add tests for new logic |
| `mcp-server/todoflow-mcp.js` | MCP tools — add tools for new Kiro integrations |
| `.kiro/specs/` | Source of truth for features — update before coding |
| `.kiro/steering/` | Team norms — update when conventions change |
