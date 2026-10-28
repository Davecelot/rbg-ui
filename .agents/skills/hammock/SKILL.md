---
name: hammock
description: >
  Lazy-senior-dev discipline: lie in the hammock and think through a decision
  ladder before writing any code, review a diff for unrequested abstractions,
  audit the panel sources for over-engineering smells, and log deliberately
  deferred simplifications. Adapted from the `ponytail` agent skill
  (https://github.com/DietrichGebert/ponytail). Trigger: before implementing
  a non-trivial change to the panel (a screen, the shell, a token, a
  container query, a motion or interaction), or when asked to review a diff / audit the repo for
  over-engineering — run
  `/hammock [lite|full|ultra|off|review|audit|debt|gain|help]`.
metadata:
  author: davecelot
  version: '1.3.0'
  changelog: >
    1.3.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.2.0: adapted for rbg-ui from ppt-make-a-thon — scope is the panel
    (src/ shell, screens and data, styles/ CSS, main.js); examples now use
    screens, the shell, tokens and container queries.
    1.1.0: adapted for ppt-make-a-thon from fogo-kitchen; the gate matches
    project-relative paths so reference/ and node_modules never count; the
    audit diffs against main and also sees uncommitted and untracked files,
    and gains two CSS smells (unused custom properties, unreferenced class
    selectors). 1.0.0: initial skill, adapted from ponytail's decision ladder
    and review/audit/debt workflow; Claude Code hooks (hooks/, wired via
    .claude/settings.json) inject the ladder at session start, before every
    prompt and into every subagent, and run the simplicity audit after edits;
    affects the whole repo.
  auto-invoke: Before implementing a non-trivial change
  allowed-tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Hammock

Provenance: this skill adapts the decision ladder and review/audit/debt
workflow from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)
(MIT), by way of the fogo-kitchen repo. Ponytail is a multi-platform agent
plugin (hooks, statuslines, mode-tracking JS for
Claude/Cursor/Copilot/Codex/Qoder/Windsurf). This repo shares the discipline across Claude Code,
Codex, and local ChatGPT Work through one `SKILL.md` and a small local
hook dispatcher. Upstream plugin machinery was not ported wholesale.

The name is a nod to Rich Hickey's "Hammock Driven Development" talk: get
in the hammock, think the problem through before typing, and you'll write
far less code than if you'd started typing immediately. That's the whole
skill in one sentence.

This skill reinforces, and makes checkable, the minimalism rules already in
[`AGENTS.md`](../../../AGENTS.md) and
[`no-frameworks`](../../rules/no-frameworks.md).

---

## When to use

Use this skill when:

- About to implement a non-trivial change (a new screen module in
  `src/screens/`, a screen state, a shell feature in `src/panel.js`, a
  token, a container query, a motion recipe, mock data) and want a quick
  gut-check before writing code.
- Asked to review the **current diff** for unrequested abstractions or
  scope creep (`review` mode).
- Asked to sweep the whole panel for over-engineering smells (`audit` mode).
- A deliberate simplification was just made and is worth remembering later
  (`debt` mode).
- Wrapping up a session and want a one-line "what we avoided building"
  recap (`gain` mode).

Do NOT use this skill for:

- Skipping validation, accessibility, security, or anything this repo's
  rules require — see Non-negotiables below; this skill never trades those
  away for brevity.
- Auto-fixing findings from `review`/`audit` without asking first — report,
  then let the user decide (mirrors `security-guardian`'s
  advisory-only contract).
- Blocking a commit — there's no git hook wiring this in; it's a thinking
  aid and a reporter, not a gate on individual findings (see Enforcement
  below for what _is_ automatic).
- Judging taste or art direction — that's [`rbg-taste`](../rbg-taste/SKILL.md)
  and [`hallmark`](../hallmark/SKILL.md). Hammock asks "does this code need
  to exist", not "does this screen look right".

---

## Enforcement

Supported local runtimes use `.agents/hooks/dispatch.js`, configured in
`.claude/settings.json` or `.codex/hooks.json`. Context injection covers
session start, prompts, and subagents. Post-edit audits detect file edits,
multi-file patches, and shell writes under `src/`, `styles/`, and `main.js`.
Findings remain advisory. Completion retries missing audits and gives at
most one continuation reminder per outstanding edit; failures remain
visible without an endless stop loop.

State is isolated by runtime, session, and tool-call ID under the ignored
`.ai/harness-state/`. Runtime `off` persists across prompts and resume;
report modes do not change intensity. Motion checks still run in `off`.

Claude: `/hammock review`; Codex CLI: `$hammock review`; ChatGPT:
`@hammock review` when discoverable. Otherwise read this skill and apply
the requested mode manually. Native trust/activation and manual checks
are documented in [`docs/agent-setup.md`](../../../docs/agent-setup.md).
Hooks cannot verify that the ladder's judgment was applied.

---

## Critical patterns

### 1. The decision ladder

The single most important pattern in this skill. Before writing new code,
walk this in order and stop at the first `yes`:

```text
1. Does this need to exist at all?                  -> if not requested, skip it (YAGNI)
2. Already in this codebase?                        -> reuse it
3. Already established by this repo's conventions?  -> follow the rule/skill, don't invent
4. Built into the platform (HTML, CSS, DOM APIs)?   -> use it
5. Already a dependency?                            -> use it, don't add a new one
6. Can it be one line?                              -> stop there
7. Only then                                        -> minimum viable code, nothing speculative
```

Step 5 is strict here: the panel has **no runtime dependencies** (see
[`no-frameworks`](../../rules/no-frameworks.md)). Vite, Playwright, ESLint
and Prettier are dev-only.

Concretely, before adding a helper:

```bash
# Don't reach for a new utility or library first — grep the panel and the
# platform before writing one line:
grep -rn "replaceState\|aria-selected" src
# src/panel.js already owns the ?tab=&sub=&state= URL and tab selection — step 2 stops here.
# A layout that changes on a small panel? @container rbg (…) covers it — step 4 stops before any JS.
```

Typical panel-shaped ladder calls:

- A new screen is one module in `src/screens/<tab>/<sub>.js` exporting
  `{ id, tab, label, states, render }` plus its block in a stylesheet — not
  a component framework, a templating layer or a per-screen class.
- Screen states reuse the shell's `data-state` on `.rbg-view` and CSS
  selectors keyed on it — not a per-screen state machine.
- A new color or size is a token in `styles/tokens.css` only if a second
  place will read it; a one-off stays a one-off.
- Layout adapts with `@container rbg (…)` queries on the panel and the
  size-class tokens — not a responsive grid system, not viewport `@media`.
- Motion is CSS transitions/animations first, WAAPI second, never an
  animation library.

### 2. Non-negotiables — never simplify away

Regardless of intensity level, these are never cut:

- Input validation and error handling that prevents data loss.
- Accessibility (keyboard navigation, the live-region tab announcement,
  focus return to the host, `prefers-reduced-motion`, contrast on ink,
  paper and pitch green).
- Anything this repo's rules require.
- A feature the user explicitly asked for, even if it looks avoidable.

### 3. Advisory-only contract for `review`/`audit`

Like `security-guardian`, this skill reports findings — it does not
autonomously delete code, revert abstractions, or refactor without asking.
Mark a deliberate exception inline instead of silently "fixing" it:

```js
// Simplified: one easing for every tab switch, revisit if a screen needs its own entrance
```

Then log it via `debt` mode if it's worth tracking across sessions.

---

## Decision tree

```text
User requests hammock [mode] (no argument preserves the active level, default full)
    |
mode = "lite"?
    |-- yes --> state the ladder result for the task about to be done,
    |           suggest a simpler alternative, then implement either way
    |
mode = "full"?
    |-- yes --> enforce the ladder strictly before writing new code this session
    |
mode = "ultra"?
    |-- yes --> also push back to the user if the requirement itself looks speculative
    |
mode = "off"?
    |-- yes --> skip the ladder for this session; non-negotiables still apply
    |
mode = "review"?
    |-- yes --> git diff scope --> scan for smells (see below) --> report, don't auto-fix
    |
mode = "audit"?
    |-- yes --> run scripts/audit-simplicity.sh across src/, styles/, main.js --> report
    |
mode = "debt"?
    |-- yes --> docs/simplicity-debt.md exists? --> append entry
    |           not exists? --> create from assets/DEBT-LOG-TEMPLATE.md first
    |
mode = "gain"?
    |-- yes --> summarize this session's avoided lines/files/deps from the
    |           conversation (not a stored metric — nothing to compute)
    |
mode = "help"?
    +-- yes --> print the mode table below
```

### What `review`/`audit` scan for

- Abstractions (wrapper classes, generic helpers, screen "base" classes) used
  by exactly one caller.
- New files where the change fit in an existing one.
- New dependencies where the platform already covers it — any runtime
  dependency at all is a finding.
- Dead exports / unused options added "for flexibility."
- Deep nesting or config objects speculative beyond what the panel needs today.
- Custom properties defined in `styles/` that nothing reads (fine for a fresh
  `styles/tokens.css` defined ahead of its first screen; a smell anywhere else).
- Class selectors in `styles/` that no screen module, `src/panel.js`, `index.html` or
  `main.js` references (dead CSS, or a class built dynamically — verify).

---

## Commands

```bash
# review mode — scan the current diff vs. main, plus uncommitted and untracked files
bash .agents/skills/hammock/scripts/audit-simplicity.sh --diff

# audit mode — full sweep of src/, styles/, main.js
bash .agents/skills/hammock/scripts/audit-simplicity.sh

# debt mode — the log already exists at docs/simplicity-debt.md; append a row.
# If it's ever missing, seed it from the template first:
cp .agents/skills/hammock/assets/DEBT-LOG-TEMPLATE.md docs/simplicity-debt.md
```

| Mode (`args`)           | Does                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| _(none)_ / `lite`       | State the ladder result, suggest simpler alternative, implement either way. |
| `full` (default weight) | Enforce the ladder strictly before writing new code this session.           |
| `ultra`                 | Also question whether the requirement itself is needed.                     |
| `off`                   | Skip the ladder for this session; non-negotiables still apply.              |
| `review`                | Audit the current diff for ladder violations.                               |
| `audit`                 | Full-panel sweep via `scripts/audit-simplicity.sh`.                         |
| `debt`                  | Read/append `docs/simplicity-debt.md`.                                      |
| `gain`                  | Recap this session's avoided lines/files/dependencies.                      |
| `help`                  | Print the mode table.                                                       |

The default runtime mode is `full`; override with `HAMMOCK_DEFAULT_MODE` or
`defaultMode` in `~/.config/hammock/config.json`. "stop hammock" / "normal
mode", sent as a standalone message, turns it off.

---

## Content guidelines

### Report format for `review`/`audit`

```
## Finding: {short title}

### Location
{path/to/file:line}

### Ladder step skipped
{which of the 7 ladder steps this violates, e.g. "step 2 — already in codebase"}

### Suggested fix
{exact change — never just "simplify this"}

### Severity
low | medium | high
```

Never auto-apply a fix from a `review`/`audit` finding — ask first, per
"Do NOT use this skill for" above.

---

## Resources

- [`assets/DECISION-LADDER.md`](assets/DECISION-LADDER.md) — printable quick-reference card.
- [`assets/DEBT-LOG-TEMPLATE.md`](assets/DEBT-LOG-TEMPLATE.md) — template for `docs/simplicity-debt.md`.
- [`scripts/audit-simplicity.sh`](scripts/audit-simplicity.sh) — heuristic smell scan backing `review`/`audit` modes.
- [`hooks/`](hooks/) — shared mode configuration and ladder instructions;
  `.agents/hooks/` handles context injection and post-edit audits; see Enforcement above.
- [`docs/simplicity-debt.md`](../../../docs/simplicity-debt.md) — the debt log.
