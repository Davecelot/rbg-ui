import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';

import { getDefaultMode, isDeactivationCommand, RUNTIME_MODES } from '../skills/hammock/hooks/hammock-config.js';
import { getHammockInstructions } from '../skills/hammock/hooks/hammock-instructions.js';

const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'apply_patch', 'Bash', 'exec_command']);
const REPORT_MODES = new Set(['review', 'audit', 'debt', 'gain', 'help']);
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const hash = (text) => createHash('sha256').update(text).digest('hex');

export function projectRoot(cwd) {
  return execFileSync('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
    timeout: 2000,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

export function snapshot(root) {
  const files = {};
  function visit(relative) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    const stat = fs.lstatSync(absolute);
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(absolute).sort()) visit(`${relative}/${entry}`);
    } else if (stat.isFile()) {
      files[relative] = hash(fs.readFileSync(absolute));
    }
  }
  for (const relative of ['src', 'styles', 'main.js']) visit(relative);
  return files;
}

function changedPaths(before, after) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((file) => before[file] !== after[file]);
}

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value), { mode: 0o600 });
  fs.renameSync(temporary, file);
}

export function sessionDirectory(root, runtime, session) {
  return path.join(root, '.ai', 'harness-state', runtime, hash(session));
}

export function runAudit(root, script, args, timeout = 7000) {
  if (timeout <= 0) return { ok: false, output: `${script} deferred: hook time budget exhausted; run it manually.` };
  try {
    return {
      ok: true,
      output: execFileSync('bash', [path.join(root, script), ...args], {
        cwd: root,
        encoding: 'utf8',
        timeout,
        maxBuffer: 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      }).replace(ANSI, ''),
    };
  } catch {
    return { ok: false, output: `${script} could not run; execute it manually from the repository root.` };
  }
}

export function handleEvent(runtime, payload, options = {}) {
  if (!['claude', 'codex'].includes(runtime)) throw new Error('Unknown harness runtime.');
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Expected a hook object.');
  const event = payload.hook_event_name;
  if (!['SessionStart', 'UserPromptSubmit', 'SubagentStart', 'PreToolUse', 'PostToolUse', 'Stop'].includes(event))
    return {};
  if (typeof payload.session_id !== 'string' || !payload.session_id.trim()) {
    return {
      systemMessage:
        'RBG harness: missing session_id; automatic checks are unavailable. Read AGENTS.md and run the manual checks in docs/agent-setup.md.',
    };
  }
  const root = options.root || projectRoot(payload.cwd || process.env.CLAUDE_PROJECT_DIR || process.cwd());
  const directory = sessionDirectory(root, runtime, payload.session_id);
  const modeFile = path.join(directory, 'mode.json');
  const receipts = path.join(directory, 'edits');
  const modeState = readJSON(modeFile, {});
  let mode = RUNTIME_MODES.includes(modeState.mode) ? modeState.mode : options.defaultMode || getDefaultMode();
  const deadline = Date.now() + 14000;
  const audit =
    options.audit || ((script, args) => runAudit(root, script, args, Math.min(7000, deadline - Date.now())));
  const context = (text) => ({ hookSpecificOutput: { hookEventName: event, additionalContext: text } });

  if (event === 'SessionStart') {
    writeJSON(modeFile, { mode });
    return context(
      `RBG HARNESS — ${runtime}. Read AGENTS.md and all mandatory rules. Setup: docs/agent-setup.md.\n\n${mode === 'off' ? 'HAMMOCK MODE OFF' : getHammockInstructions(mode)}`,
    );
  }
  if (event === 'UserPromptSubmit') {
    const prompt = typeof payload.prompt === 'string' ? payload.prompt.trim().toLowerCase() : '';
    const match = prompt.match(/^(?:\/|\$|@)hammock(?:\s+(\S+))?\s*$/);
    let header = '';
    if (isDeactivationCommand(prompt)) mode = 'off';
    else if (match && RUNTIME_MODES.includes(match[1])) mode = match[1];
    else if (match && REPORT_MODES.has(match[1]))
      header = `HAMMOCK ${match[1].toUpperCase()} REQUESTED — active level: ${mode}\n\n`;
    writeJSON(modeFile, { mode });
    return context(header + (mode === 'off' ? 'HAMMOCK MODE OFF' : getHammockInstructions(mode)));
  }
  if (event === 'SubagentStart') return mode === 'off' ? {} : context(getHammockInstructions(mode));

  function checkReceipt(file, receipt) {
    const after = snapshot(root);
    const changed = changedPaths(receipt.before, after);
    if (!changed.length) {
      fs.rmSync(file, { force: true });
      return '';
    }
    const results = [];
    if (mode !== 'off' || receipt.simplicity)
      results.push(audit('.agents/skills/hammock/scripts/audit-simplicity.sh', ['--diff']));
    const motion = changed.filter((name) => /^(styles\/.+\.css|src\/.+\.js)$/.test(name) && Object.hasOwn(after, name));
    if (motion.length) results.push(audit('.agents/skills/motion/scripts/audit-motion.sh', motion));
    if (results.every((result) => result.ok)) fs.rmSync(file, { force: true });
    else writeJSON(file, { ...receipt, error: true });
    return results
      .map((result) => result.output)
      .filter(Boolean)
      .join('\n\n');
  }

  if (event === 'PreToolUse' || event === 'PostToolUse') {
    if (!EDIT_TOOLS.has(payload.tool_name)) return {};
    if (typeof payload.tool_use_id !== 'string' || !payload.tool_use_id) {
      return {
        systemMessage: 'RBG harness: missing tool_use_id; run the manual checks in docs/agent-setup.md after edits.',
      };
    }
    const file = path.join(receipts, `${hash(payload.tool_use_id)}.json`);
    if (event === 'PreToolUse') {
      writeJSON(file, { before: snapshot(root), reminded: false, simplicity: mode !== 'off' });
      return {};
    }
    // A missing pre-hook cannot establish a baseline; scan current sources conservatively.
    const receipt = readJSON(file, { before: {}, reminded: false, simplicity: mode !== 'off' });
    const output = checkReceipt(file, receipt);
    return output ? context(`RBG AUTO-AUDIT (advisory):\n\n${output}`) : {};
  }

  const pending = fs.existsSync(receipts) ? fs.readdirSync(receipts).filter((name) => name.endsWith('.json')) : [];
  const outputs = [];
  let remind = false;
  let unresolved = false;
  for (const name of pending) {
    const file = path.join(receipts, name);
    const receipt = readJSON(file, null);
    if (!receipt) continue;
    // A continued turn must not retry forever; a later user turn may recover the audit.
    if (!receipt.reminded || !payload.stop_hook_active) outputs.push(checkReceipt(file, receipt));
    if (!fs.existsSync(file)) continue;
    unresolved = true;
    if (!receipt.reminded && !payload.stop_hook_active) remind = true;
    writeJSON(file, { ...readJSON(file, receipt), reminded: true });
  }
  const output = outputs.filter(Boolean).join('\n\n');
  const result = output ? context(`RBG COMPLETION AUDIT (advisory):\n\n${output}`) : {};
  if (remind) {
    return {
      ...result,
      decision: 'block',
      reason:
        'RBG source changed but an audit could not complete. Run the manual checks in docs/agent-setup.md, address or accept findings, and report any unavailable check. This reminder will not repeat.',
    };
  }
  return unresolved
    ? {
        ...result,
        systemMessage:
          'RBG harness: audit execution remains unresolved. Report manual-check status; automatic completion checks are not verified.',
      }
    : result;
}
