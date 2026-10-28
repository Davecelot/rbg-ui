import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

import { handleEvent, projectRoot, runAudit, sessionDirectory } from './runtime.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function fixture(t, runtime = 'codex', session = 'one') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rbg-hooks-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'src'));
  fs.mkdirSync(path.join(root, 'styles'));
  fs.writeFileSync(path.join(root, 'src/panel.js'), 'export const panel = 1;');
  fs.writeFileSync(path.join(root, 'styles/base.css'), '.rbg { color: black; }');
  const calls = [];
  const options = {
    root,
    defaultMode: 'full',
    audit: (script, args) => {
      calls.push({ script, args });
      return { ok: true, output: 'advisory findings' };
    },
  };
  const event = (name, fields = {}, overrides = {}) =>
    handleEvent(
      runtime,
      {
        hook_event_name: name,
        session_id: session,
        cwd: root,
        tool_use_id: 'edit-one',
        ...fields,
      },
      { ...options, ...overrides },
    );
  const edit = (file, text) => fs.writeFileSync(path.join(root, file), text);
  return { root, event, edit, calls, options };
}

for (const runtime of ['claude', 'codex']) {
  test(`${runtime}: startup, prompts, and subagents receive context`, (t) => {
    const { event } = fixture(t, runtime);
    for (const name of ['SessionStart', 'UserPromptSubmit', 'SubagentStart']) {
      const output = event(name).hookSpecificOutput;
      assert.equal(output.hookEventName, name);
      assert.match(output.additionalContext, /HAMMOCK MODE ACTIVE/);
    }
  });

  test(`${runtime}: direct edits audit simplicity and motion`, (t) => {
    const { event, edit, calls } = fixture(t, runtime);
    const fields = { tool_name: 'Edit', tool_input: { file_path: 'src/panel.js' } };
    event('PreToolUse', fields);
    edit('src/panel.js', 'export const panel = 2;');
    assert.match(event('PostToolUse', fields).hookSpecificOutput.additionalContext, /advisory findings/);
    assert.equal(calls.length, 2);
    assert.deepEqual(calls[1].args, ['src/panel.js']);
    assert.equal(event('Stop').decision, undefined);
  });
}

test('off persists across prompts and resume; motion still runs', (t) => {
  const { event, edit, calls } = fixture(t);
  event('SessionStart');
  event('UserPromptSubmit', { prompt: '$hammock off' });
  for (const name of ['UserPromptSubmit', 'SessionStart']) {
    assert.match(event(name).hookSpecificOutput.additionalContext, /HAMMOCK MODE OFF/);
  }
  assert.deepEqual(event('SubagentStart'), {});
  const fields = { tool_name: 'Write' };
  event('PreToolUse', fields);
  edit('styles/base.css', '.rbg { transition: all 1s; }');
  event('PostToolUse', fields);
  assert.equal(calls.length, 1);
  assert.match(calls[0].script, /motion/);
});

test('all invocation spellings and report modes preserve runtime intensity', (t) => {
  const { event } = fixture(t);
  for (const prefix of ['/', '$', '@']) {
    event('UserPromptSubmit', { prompt: `${prefix}hammock ultra` });
    assert.match(
      event('UserPromptSubmit', { prompt: `${prefix}hammock review` }).hookSpecificOutput.additionalContext,
      /active level: ultra/,
    );
    event('UserPromptSubmit', { prompt: `${prefix}hammock off` });
    assert.match(
      event('UserPromptSubmit', { prompt: `${prefix}hammock audit` }).hookSpecificOutput.additionalContext,
      /active level: off/,
    );
  }
  event('UserPromptSubmit', { prompt: '@hammock lite' });
  assert.match(
    event('UserPromptSubmit', { prompt: 'add a normal mode toggle' }).hookSpecificOutput.additionalContext,
    /level: lite/,
  );
  assert.match(event('UserPromptSubmit', { prompt: 'stop hammock!' }).hookSpecificOutput.additionalContext, /MODE OFF/);
});

test('runtime and session state are isolated, including path-like IDs', (t) => {
  const { root, event, options } = fixture(t);
  event('UserPromptSubmit', { prompt: '$hammock off' });
  for (const [runtime, session] of [
    ['claude', 'one'],
    ['codex', '../two'],
  ]) {
    const result = handleEvent(runtime, { hook_event_name: 'SessionStart', session_id: session }, options);
    assert.match(result.hookSpecificOutput.additionalContext, /level: full/);
    assert.ok(sessionDirectory(root, runtime, session).startsWith(path.join(root, '.ai/harness-state', runtime)));
  }
  assert.match(event('SessionStart').hookSpecificOutput.additionalContext, /MODE OFF/);
});

test('multi-file patches audit all changed files, including new files', (t) => {
  const { event, edit, calls } = fixture(t);
  const fields = {
    tool_name: 'apply_patch',
    tool_input: {
      command: '*** Begin Patch\n*** Update File: src/panel.js\n*** Add File: styles/new.css\n*** End Patch',
    },
  };
  event('PreToolUse', fields);
  edit('src/panel.js', 'export const panel = 3;');
  edit('styles/new.css', '.rbg { animation: spin 1s; }');
  event('PostToolUse', fields);
  assert.deepEqual(calls[1].args.sort(), ['src/panel.js', 'styles/new.css']);
});

test('shell and unified exec edits are detected without parsing shell text', (t) => {
  const { event, root, calls } = fixture(t);
  for (const tool of ['Bash', 'exec_command']) {
    const fields = { tool_name: tool, tool_use_id: tool, tool_input: { command: 'opaque shell command' } };
    event('PreToolUse', fields);
    execFileSync(process.execPath, [
      '-e',
      'require("fs").writeFileSync(process.argv[1], process.argv[2])',
      path.join(root, 'src/panel.js'),
      tool,
    ]);
    event('PostToolUse', fields);
  }
  assert.equal(calls.length, 4);
});

test('read-only calls and unrelated files do not trigger audits', (t) => {
  const { event, edit, calls } = fixture(t);
  const fields = { tool_name: 'Bash' };
  event('PreToolUse', fields);
  edit('notes.md', 'not panel source');
  assert.deepEqual(event('PostToolUse', fields), {});
  assert.deepEqual(event('PreToolUse', { tool_name: 'Read' }), {});
  assert.equal(calls.length, 0);
});

test('deletions audit simplicity without passing missing files to motion', (t) => {
  const { event, root, calls } = fixture(t);
  const fields = { tool_name: 'apply_patch' };
  event('PreToolUse', fields);
  fs.unlinkSync(path.join(root, 'src/panel.js'));
  event('PostToolUse', fields);
  assert.equal(calls.length, 1);
});

test('interleaved tool calls retain independent audit receipts', (t) => {
  const { event, edit, root } = fixture(t);
  event('PreToolUse', { tool_name: 'Bash', tool_use_id: 'a' });
  event('PreToolUse', { tool_name: 'Write', tool_use_id: 'b' });
  edit('src/panel.js', 'changed');
  event('PostToolUse', { tool_name: 'Write', tool_use_id: 'b' });
  const receipts = path.join(sessionDirectory(root, 'codex', 'one'), 'edits');
  assert.equal(fs.readdirSync(receipts).length, 1);
  event('PostToolUse', { tool_name: 'Bash', tool_use_id: 'a' });
  assert.equal(fs.readdirSync(receipts).length, 0);
});

test('stop recovers an edit whose post-hook never ran', (t) => {
  const { event, edit, calls } = fixture(t);
  event('PreToolUse', { tool_name: 'Write' });
  edit('src/panel.js', 'changed');
  assert.match(event('Stop').hookSpecificOutput.additionalContext, /COMPLETION AUDIT/);
  assert.equal(calls.length, 2);
  assert.equal(event('Stop').decision, undefined);
});

test('audit failures remain pending, remind once, and never loop', (t) => {
  const { event, edit, root } = fixture(t);
  const failed = { audit: () => ({ ok: false, output: 'audit unavailable' }) };
  event('PreToolUse', { tool_name: 'Write' });
  edit('src/panel.js', 'changed');
  event('PostToolUse', { tool_name: 'Write' }, failed);
  assert.equal(event('Stop', {}, failed).decision, 'block');
  assert.equal(event('Stop', {}, failed).decision, undefined);
  assert.match(event('Stop', {}, failed).systemMessage, /unresolved/);
  assert.equal(fs.readdirSync(path.join(sessionDirectory(root, 'codex', 'one'), 'edits')).length, 1);
});

test('stop_hook_active prevents another continuation; a later turn can recover', (t) => {
  const { event, edit } = fixture(t);
  event('PreToolUse', { tool_name: 'Write' });
  edit('src/panel.js', 'changed');
  event('PostToolUse', { tool_name: 'Write' }, { audit: () => ({ ok: false, output: 'unavailable' }) });
  assert.equal(
    event('Stop', { stop_hook_active: true }, { audit: () => ({ ok: false, output: 'unavailable' }) }).decision,
    undefined,
  );
  assert.equal(event('Stop').decision, undefined);
  assert.equal(event('Stop').systemMessage, undefined);
});

test('successful completion retry clears a failed post-edit audit', (t) => {
  const { event, edit, root } = fixture(t);
  event('PreToolUse', { tool_name: 'Write' });
  edit('src/panel.js', 'changed');
  event('PostToolUse', { tool_name: 'Write' }, { audit: () => ({ ok: false, output: 'unavailable' }) });
  assert.equal(event('Stop').decision, undefined);
  assert.equal(fs.readdirSync(path.join(sessionDirectory(root, 'codex', 'one'), 'edits')).length, 0);
});

test('post-hook without pre-hook conservatively scans sources', (t) => {
  const { event, calls } = fixture(t);
  event('PostToolUse', { tool_name: 'apply_patch' });
  assert.equal(calls.length, 2);
});

test('malformed events disclose manual fallback without sharing state', (t) => {
  const { root, event } = fixture(t);
  assert.match(event('SessionStart', { session_id: '' }).systemMessage, /missing session_id/);
  assert.match(event('PreToolUse', { tool_name: 'Write', tool_use_id: '' }).systemMessage, /missing tool_use_id/);
  assert.equal(fs.existsSync(path.join(root, '.ai')), false);
  const result = spawnSync(process.execPath, [path.join(repo, '.agents/hooks/dispatch.js'), 'codex'], {
    input: 'not json',
    encoding: 'utf8',
  });
  assert.equal(result.status, 0);
  assert.match(JSON.parse(result.stdout).systemMessage, /malformed/);
});

test('dispatch emits native JSON context for both runtimes', (t) => {
  const { root } = fixture(t);
  execFileSync('git', ['init', '-q', root]);
  for (const runtime of ['claude', 'codex']) {
    const output = execFileSync(process.execPath, [path.join(repo, '.agents/hooks/dispatch.js'), runtime], {
      input: JSON.stringify({ hook_event_name: 'SessionStart', session_id: runtime, cwd: root }),
      encoding: 'utf8',
    });
    assert.equal(JSON.parse(output).hookSpecificOutput.hookEventName, 'SessionStart');
  }
});

test('repository discovery works from nested working directories', (t) => {
  const { root } = fixture(t);
  execFileSync('git', ['init', '-q', root]);
  assert.equal(fs.realpathSync(projectRoot(path.join(root, 'src'))), fs.realpathSync(root));
});

test('real audit execution distinguishes findings from execution failures', (t) => {
  const { root } = fixture(t);
  fs.writeFileSync(path.join(root, 'audit.sh'), 'printf "findings remain advisory\\n"\nexit 0\n');
  assert.equal(runAudit(root, 'audit.sh', []).ok, true);
  fs.writeFileSync(path.join(root, 'audit.sh'), 'exit 1\n');
  assert.equal(runAudit(root, 'audit.sh', []).ok, false);
  assert.equal(runAudit(root, 'missing.sh', []).ok, false);
  assert.equal(runAudit(root, 'audit.sh', [], 0).ok, false);
});

test('off mode does not erase a previously failed simplicity audit', (t) => {
  const { event, edit, root, calls } = fixture(t);
  event('PreToolUse', { tool_name: 'Write' });
  edit('main.js', 'changed');
  const failed = { audit: () => ({ ok: false, output: 'unavailable' }) };
  event('PostToolUse', { tool_name: 'Write' }, failed);
  event('UserPromptSubmit', { prompt: '$hammock off' });
  assert.equal(event('Stop', {}, failed).decision, 'block');
  const receipts = path.join(sessionDirectory(root, 'codex', 'one'), 'edits');
  assert.equal(fs.readdirSync(receipts).length, 1);
  event('Stop');
  assert.equal(calls.length, 1);
  assert.match(calls[0].script, /hammock/);
  assert.equal(fs.readdirSync(receipts).length, 0);
});
