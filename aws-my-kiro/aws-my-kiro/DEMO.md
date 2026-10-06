# TodoFlow — 3-Minute Demo Script

## Quick Setup (30 seconds before recording)

```powershell
cd C:\Users\ADLIN\aws-my-kiro
python -m http.server 8080
# Open http://localhost:8080 in browser
```

---

## Demo Script (~2 minutes)

### Scene 1 — App Opens (10 sec)
- Open http://localhost:8080
- Show the dark theme UI: sidebar, stats cards, add form, empty state
- Point out: "No backend, loads instantly, dark theme"

### Scene 2 — Add Tasks (25 sec)
- Type "Buy groceries" → set Priority: High → Add
- Type "Read Kiro docs" → set Priority: Medium → set Due date (today) → Add
- Type "Review pull request" → Priority: High → Add
- Show the task list with priority badges and colored left accent bars
- Counter updates to "3 active"

### Scene 3 — Complete a Task (10 sec)
- Click the checkbox on "Buy groceries"
- Show strikethrough, reduced opacity, counter drops to "2 active"
- Progress ring in sidebar updates

### Scene 4 — Search (10 sec)
- Type "kiro" in the search box
- Show only "Read Kiro docs" appears
- Clear search → all tasks return

### Scene 5 — Filter (10 sec)
- Click "Completed" tab → shows only "Buy groceries"
- Click "Active" tab → shows remaining 2 tasks
- Click "All" → all 3 tasks

### Scene 6 — Edit a Task (10 sec)
- Hover over "Review pull request" → click ✏️
- Change text to "Review pull request — URGENT"
- Press Enter → text updates inline

### Scene 7 — Delete a Task (5 sec)
- Click 🗑️ on "Read Kiro docs"
- Task disappears immediately

### Scene 8 — Persistence (10 sec)
- Refresh the browser (F5)
- Tasks are still there — "Persisted in localStorage!"

---

## Kiro University Features (30–60 sec — screen share of Kiro IDE)

Show each feature in the `.kiro/` folder:

1. `.kiro/specs/` → 3 spec files
   - `todoflow-requirements.md` — "Every feature traces back to an acceptance criterion"
   - `architecture.md` — "Layer separation: pure logic vs DOM vs persistence"
   - `dark-theme-ui.md` — "Dark theme color palette spec"

2. `.kiro/steering/` → 5 steering docs
   - "Guided every implementation decision — coding conventions, UI, testing, workflow"

3. `.kiro/hooks/` → 4 hooks
   - `validate-js-on-save.json` — "Syntax check fires on every .js/.html/.css save"
   - `run-tests-after-task.json` — "Tests run automatically after each spec task completes"
   - `spec-first-reminder.json` — "Agent reminded to check specs before coding"
   - `kironomics.json` — "Session analytics tracking"

4. `tests/property.test.js` → run it live:
   ```powershell
   node tests/property.test.js
   ```
   → "22 property-based tests pass — 200–500 random inputs each"

5. `mcp-server/todoflow-mcp.js` → test it live:
   ```powershell
   echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js
   ```
   → "4 MCP tools: project info, test status, task stats, spec reader"

6. `.kiro/agents/` → 2 agents
   - `todo-qa-agent.md` — "QA agent: runs tests, checks a11y, verifies spec compliance"
   - `dev-assistant.md` — "Dev assistant: guides feature implementation and code review"

---

## Commands Reference

```powershell
# Start the app
python -m http.server 8080

# Run property-based tests
node tests/property.test.js

# Run all tests
node tests/property.test.js; node tests/functional-sim.js; node tests/logic-audit.js

# Test MCP server (list tools)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server/todoflow-mcp.js

# Test MCP server (run tests via MCP)
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_test_status","arguments":{}}}' | node mcp-server/todoflow-mcp.js

# Test MCP server (read requirements spec)
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_spec_summary","arguments":{"document":"requirements"}}}' | node mcp-server/todoflow-mcp.js
```

---

## GitHub Repository

`https://github.com/adlinsweety/aws-my-kiro`
