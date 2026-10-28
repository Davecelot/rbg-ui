import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const skills = [
  'a11y-checker',
  'forge-me-a-skill',
  'hallmark',
  'hammock',
  'motion',
  'panel-builder',
  'playwright-worker',
  'rbg-taste',
  'review-rangers',
  'security-guardian',
];

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file) : entry.isFile() ? [file] : [];
  });
}

test('all ten skills and nine rules are reachable through both discovery paths', () => {
  assert.deepEqual(fs.readdirSync(path.join(root, '.agents/skills')).sort(), skills);
  assert.equal(fs.readdirSync(path.join(root, '.agents/rules')).length, 9);
  for (const name of ['skills', 'rules']) {
    assert.ok(fs.lstatSync(path.join(root, '.claude', name)).isSymbolicLink());
    assert.equal(fs.realpathSync(path.join(root, '.claude', name)), fs.realpathSync(path.join(root, '.agents', name)));
  }
  for (const name of skills) {
    const source = fs.readFileSync(path.join(root, '.agents/skills', name, 'SKILL.md'), 'utf8');
    assert.match(source, new RegExp(`^---\\nname: ${name}\\n`));
    assert.match(source, /\ndescription: >\n/);
    assert.equal(fs.readFileSync(path.join(root, '.claude/skills', name, 'SKILL.md'), 'utf8'), source);
  }
});

test('all local Markdown references resolve after relocation', () => {
  const documents = ['AGENTS.md', 'CLAUDE.md', 'README.md'].map((name) => path.join(root, name));
  documents.push(...files(path.join(root, '.agents')), ...files(path.join(root, 'docs')));
  for (const file of documents.filter((name) => name.endsWith('.md'))) {
    for (const [, link] of fs.readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
      if (link.includes('://') || /^[#]/.test(link) || /[{}<>*|]/.test(link)) continue;
      const target = link.split('#')[0];
      assert.ok(fs.existsSync(path.resolve(path.dirname(file), target)), `${path.relative(root, file)} → ${link}`);
    }
  }
});

test('native hook configurations resolve the shared dispatcher from a subdirectory', () => {
  for (const [runtime, config] of [
    ['claude', '.claude/settings.json'],
    ['codex', '.codex/hooks.json'],
  ]) {
    const { hooks } = JSON.parse(fs.readFileSync(path.join(root, config), 'utf8'));
    assert.deepEqual(Object.keys(hooks).sort(), [
      'PostToolUse',
      'PreToolUse',
      'SessionStart',
      'Stop',
      'SubagentStart',
      'UserPromptSubmit',
    ]);
    for (const [event, groups] of Object.entries(hooks)) {
      for (const group of groups) {
        if (['PreToolUse', 'PostToolUse'].includes(event)) {
          for (const tool of ['apply_patch', 'Bash', 'Edit', 'Write', 'MultiEdit'])
            assert.match(tool, new RegExp(group.matcher));
        }
        for (const hook of group.hooks) {
          const output = execFileSync('bash', ['-c', hook.command], {
            cwd: path.join(root, 'src'),
            input: JSON.stringify({ hook_event_name: 'SessionStart', session_id: '' }),
            encoding: 'utf8',
          });
          assert.match(JSON.parse(output).systemMessage, /missing session_id/, runtime);
        }
      }
    }
  }
});

test('shared reviewers retain read-only procedures and Claude wrappers resolve them', () => {
  assert.deepEqual(fs.readdirSync(path.join(root, '.agents/reviewers')).sort(), ['screen-critic.md', 'ship-check.md']);
  for (const name of ['screen-critic', 'ship-check']) {
    const wrapper = fs.readFileSync(path.join(root, '.claude/agents', `${name}.md`), 'utf8');
    assert.ok(wrapper.includes(`.agents/reviewers/${name}.md`));
    const tools = wrapper.match(/^tools: (.+)$/m)[1].split(', ');
    assert.ok(!tools.includes('Write') && !tools.includes('Edit'));
    const procedure = fs.readFileSync(path.join(root, '.agents/reviewers', `${name}.md`), 'utf8');
    assert.match(procedure, name === 'screen-critic' ? /fresh context/ : /You don't fix anything/);
  }
});

test('security working mode includes new configuration and redacts secret-shaped values', (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rbg-security-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', temp]);
  fs.mkdirSync(path.join(temp, '.codex'));
  const value = 'test-value-' + 'x'.repeat(20);
  fs.writeFileSync(path.join(temp, '.codex/hooks.json'), `api_key = ${value}\n`);
  const output = execFileSync(
    'bash',
    [path.join(root, '.agents/skills/security-guardian/scripts/security-scan.sh'), '--working'],
    { cwd: temp, encoding: 'utf8' },
  );
  assert.match(output, /\.codex\/hooks.json/);
  assert.match(output, /redacted/);
  assert.ok(!output.includes(value));
});
