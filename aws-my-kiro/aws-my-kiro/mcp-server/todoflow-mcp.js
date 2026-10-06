#!/usr/bin/env node
/**
 * TodoFlow MCP Server
 * Kiro University Build-Along
 *
 * A Model Context Protocol server that exposes TodoFlow project
 * information, test status, task statistics, and spec content to Kiro.
 *
 * Protocol: JSON-RPC 2.0 over stdio (MCP spec)
 * Run:      node mcp-server/todoflow-mcp.js
 * Config:   .kiro/settings/mcp.json
 *
 * Tools exposed:
 *   get_project_info    — app name, version, stack, Kiro features list
 *   get_test_status     — runs property tests, returns pass/fail counts
 *   get_task_statistics — parses a tasks JSON export for stats
 *   get_spec_summary    — reads and returns spec/steering file contents
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = path.resolve(__dirname, '..');

/* =========================================
   SERVER METADATA
   ========================================= */

const SERVER_INFO = {
  name: 'todoflow-mcp',
  version: '1.1.0',
};

const TOOLS = [
  {
    name: 'get_project_info',
    description: 'Returns TodoFlow project metadata: name, version, tech stack, file listing, and registered Kiro features.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_test_status',
    description: 'Runs the TodoFlow property-based test suite (tests/property.test.js) and returns pass/fail results with output.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_task_statistics',
    description: 'Returns task statistics from a tasks export JSON file. Export tasks from the browser console first (see instructions in result). Pass filePath to analyse a specific export.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Absolute path to a JSON file containing an array of TodoFlow tasks. Optional — omit to get export instructions.',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_spec_summary',
    description: 'Reads and returns the content of a TodoFlow spec or steering document. Useful for checking requirements, architecture, or conventions without leaving Kiro chat.',
    inputSchema: {
      type: 'object',
      properties: {
        document: {
          type: 'string',
          description: 'Which document to read. One of: "requirements", "architecture", "dark-theme", "product", "coding", "ui-ux", "testing", "workflow". Defaults to "requirements".',
          enum: [
            'requirements',
            'architecture',
            'dark-theme',
            'product',
            'coding',
            'ui-ux',
            'testing',
            'workflow',
          ],
        },
      },
      required: [],
    },
  },
];

/* =========================================
   TOOL IMPLEMENTATIONS
   ========================================= */

function getProjectInfo() {
  let pkg = { version: 'unknown', repository: {} };
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  } catch (e) {
    // non-fatal
  }

  const files = fs.readdirSync(PROJECT_ROOT)
    .filter(f => !f.startsWith('.') && f !== 'node_modules')
    .sort();

  const specsDir = path.join(PROJECT_ROOT, '.kiro', 'specs');
  const steeringDir = path.join(PROJECT_ROOT, '.kiro', 'steering');
  const hooksDir = path.join(PROJECT_ROOT, '.kiro', 'hooks');

  const specs    = fs.existsSync(specsDir)    ? fs.readdirSync(specsDir)    : [];
  const steering = fs.existsSync(steeringDir) ? fs.readdirSync(steeringDir) : [];
  const hooks    = fs.existsSync(hooksDir)    ? fs.readdirSync(hooksDir)    : [];

  return {
    name: 'TodoFlow',
    version: pkg.version,
    description: 'Kiro University Build-Along — client-side To-Do list web application',
    stack: ['HTML5', 'CSS3', 'Vanilla JavaScript (ES6+)', 'localStorage', 'No backend', 'No build step'],
    repository: pkg.repository && pkg.repository.url,
    projectFiles: files,
    kiro: {
      specs: specs,
      steering: steering,
      hooks: hooks,
      agents: fs.existsSync(path.join(PROJECT_ROOT, '.kiro', 'agents'))
        ? fs.readdirSync(path.join(PROJECT_ROOT, '.kiro', 'agents'))
        : [],
      mcpServer: 'mcp-server/todoflow-mcp.js',
      mcpConfig: '.kiro/settings/mcp.json',
    },
    howToRun: {
      app: 'python -m http.server 8080  →  open http://localhost:8080',
      tests: 'node tests/property.test.js',
      allTests: 'node tests/property.test.js && node tests/functional-sim.js && node tests/logic-audit.js',
    },
  };
}

function getTestStatus() {
  try {
    const output = execSync('node tests/property.test.js 2>&1', {
      cwd: PROJECT_ROOT,
      timeout: 30000,
      encoding: 'utf8',
    });

    const passMatch = output.match(/(\d+) passed/);
    const failMatch = output.match(/(\d+) failed/);
    const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
    const failed = failMatch ? parseInt(failMatch[1], 10) : 0;

    return {
      status: failed === 0 ? 'PASS' : 'FAIL',
      passed,
      failed,
      total: passed + failed,
      testFile: 'tests/property.test.js',
      output: output.slice(-1000),
    };
  } catch (err) {
    // execSync throws on non-zero exit — still extract output
    const rawOut = (err.stdout || '') + (err.stderr || '');
    const passMatch = rawOut.match(/(\d+) passed/);
    const failMatch = rawOut.match(/(\d+) failed/);
    const passed = passMatch ? parseInt(passMatch[1], 10) : 0;
    const failed = failMatch ? parseInt(failMatch[1], 10) : 0;

    if (passed > 0 || failed > 0) {
      return {
        status: failed === 0 ? 'PASS' : 'FAIL',
        passed,
        failed,
        total: passed + failed,
        testFile: 'tests/property.test.js',
        output: rawOut.slice(-1000),
      };
    }

    return {
      status: 'ERROR',
      error: err.message,
      output: rawOut.slice(-500),
      hint: 'Make sure node_modules exists: run "npm install" in the project root.',
    };
  }
}

function getTaskStatistics(filePath) {
  if (!filePath) {
    return {
      note: 'No tasks file provided.',
      howToExport: [
        '1. Open the TodoFlow app in your browser (http://localhost:8080)',
        '2. Open DevTools console (F12)',
        '3. Run: copy(JSON.stringify(JSON.parse(localStorage.getItem("todoflow_tasks")||"[]"),null,2))',
        '4. Paste into a file, e.g. C:\\Users\\ADLIN\\tasks-export.json',
        '5. Call this tool again with filePath set to that path',
      ],
      example: 'get_task_statistics({ filePath: "C:\\\\Users\\\\ADLIN\\\\tasks-export.json" })',
    };
  }

  if (!fs.existsSync(filePath)) {
    return { error: `File not found: ${filePath}` };
  }

  let tasks;
  try {
    tasks = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return { error: `Could not parse JSON file: ${e.message}` };
  }

  if (!Array.isArray(tasks)) {
    return { error: 'File does not contain a JSON array of tasks.' };
  }

  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active    = total - completed;
  const today     = new Date().toISOString().slice(0, 10);

  const byPriority = { low: 0, medium: 0, high: 0, unknown: 0 };
  const overdue = [];

  tasks.forEach(t => {
    const p = t.priority;
    if (byPriority[p] !== undefined) byPriority[p]++;
    else byPriority.unknown++;

    if (t.dueDate && t.dueDate < today && !t.completed) {
      overdue.push({ id: t.id, text: t.text, dueDate: t.dueDate, priority: t.priority });
    }
  });

  return {
    total,
    active,
    completed,
    completionRate: total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%',
    byPriority,
    overdueCount: overdue.length,
    overdueTasks: overdue,
    analysedFile: filePath,
    analysedAt: new Date().toISOString(),
  };
}

const SPEC_DOCUMENT_MAP = {
  'requirements': path.join(PROJECT_ROOT, '.kiro', 'specs', 'todoflow-requirements.md'),
  'architecture': path.join(PROJECT_ROOT, '.kiro', 'specs', 'architecture.md'),
  'dark-theme':   path.join(PROJECT_ROOT, '.kiro', 'specs', 'dark-theme-ui.md'),
  'product':      path.join(PROJECT_ROOT, '.kiro', 'steering', 'product.md'),
  'coding':       path.join(PROJECT_ROOT, '.kiro', 'steering', 'coding-conventions.md'),
  'ui-ux':        path.join(PROJECT_ROOT, '.kiro', 'steering', 'ui-ux-conventions.md'),
  'testing':      path.join(PROJECT_ROOT, '.kiro', 'steering', 'testing-conventions.md'),
  'workflow':     path.join(PROJECT_ROOT, '.kiro', 'steering', 'workflow.md'),
};

function getSpecSummary(document) {
  const key = (document || 'requirements').toLowerCase();
  const filePath = SPEC_DOCUMENT_MAP[key];

  if (!filePath) {
    return {
      error: `Unknown document "${document}".`,
      available: Object.keys(SPEC_DOCUMENT_MAP),
    };
  }

  if (!fs.existsSync(filePath)) {
    return {
      error: `Document file not found at: ${filePath}`,
      hint: 'The file may not have been created yet.',
    };
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return {
    document: key,
    filePath: path.relative(PROJECT_ROOT, filePath),
    characterCount: content.length,
    content,
  };
}

/* =========================================
   JSON-RPC 2.0 OVER STDIO
   ========================================= */

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result }) + '\n');
}

function sendError(id, code, message) {
  process.stdout.write(
    JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }) + '\n'
  );
}

function handleRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    return sendResponse(id, {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: SERVER_INFO,
    });
  }

  if (method === 'tools/list') {
    return sendResponse(id, { tools: TOOLS });
  }

  if (method === 'tools/call') {
    const { name, arguments: args = {} } = params || {};

    try {
      if (name === 'get_project_info') {
        return sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(getProjectInfo(), null, 2) }],
        });
      }

      if (name === 'get_test_status') {
        return sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(getTestStatus(), null, 2) }],
        });
      }

      if (name === 'get_task_statistics') {
        return sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(getTaskStatistics(args.filePath), null, 2) }],
        });
      }

      if (name === 'get_spec_summary') {
        return sendResponse(id, {
          content: [{ type: 'text', text: JSON.stringify(getSpecSummary(args.document), null, 2) }],
        });
      }

      return sendError(id, -32601, `Unknown tool: ${name}`);
    } catch (err) {
      return sendError(id, -32603, `Tool execution error: ${err.message}`);
    }
  }

  // Notifications (no id) — ignore silently
  if (id === null || id === undefined) return;

  return sendError(id, -32601, `Method not found: ${method}`);
}

/* =========================================
   STDIO LOOP
   ========================================= */

let buffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop(); // retain incomplete line
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      handleRequest(JSON.parse(trimmed));
    } catch (e) {
      process.stderr.write(`[todoflow-mcp] JSON parse error: ${e.message}\n`);
    }
  }
});

process.stdin.on('end', () => process.exit(0));

process.on('uncaughtException', (err) => {
  process.stderr.write(`[todoflow-mcp] Uncaught exception: ${err.message}\n`);
});

process.stderr.write('[todoflow-mcp] TodoFlow MCP server v1.1.0 started\n');
