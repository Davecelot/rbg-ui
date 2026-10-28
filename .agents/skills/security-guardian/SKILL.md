---
name: security-guardian
description: >
  Runs advisory repository-security checks — secret scanning, npm
  dependency audit, lockfile integrity, sensitive/harness-config file review,
  a runtime-network check (the panel ships inside someone else's app and
  loads nothing from other hosts), and a
  secure contributing checklist — for this repo. Produces a structured
  go/no-go report; never blocks a commit or merge itself. Trigger: before
  committing or merging a branch into main, before adding/upgrading a
  dependency, when a change touches `package.json`/`package-lock.json` or
  `.agents/` harness files or `.claude/`/`.codex/` hooks/settings, when a screen starts loading anything from another
  host, or when someone asks "is this safe to commit/publish?".
metadata:
  author: davecelot
  version: '1.3.0'
  changelog: >
    1.3.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.2.0: adapted for rbg-ui from ppt-make-a-thon — Gate 5 now guards the
    embedding contract (the panel runs inside a host app, so any remote load
    is a leak, a privacy and a reliability risk, not just an offline risk);
    Figma-token and QR guidance dropped.
    1.1.0: adapted for ppt-make-a-thon from fogo-kitchen — diff base is main;
    GitLab npm token, .npmrc and CI-config handling dropped (local git, no
    remote, no CI); gains Gate 5, which flags runtime loads from other hosts
    (fonts, images, scripts, CSS url()/@import, fetch) that have no
    .ai/DECISIONS.md entry, since the venue may have no network; flags any
    runtime dependency. 1.0.0: initial skill for a single npm toolchain;
    secret scan, dependency audit, lockfile integrity, and sensitive-file
    review, advisory only.
  auto-invoke: 'Before a commit or merge into main, or before adding/upgrading a dependency'
  allowed-tools: [Bash, Read, Glob, Grep]
---

# Security Guardian

## When to use

Use this skill when:

- Doing an advisory security dry-run before `git commit`, or before merging
  a branch into `main`.
- Adding, upgrading, or reviewing a dependency in `package.json` or
  `package-lock.json` (the panel has no runtime dependencies; dev
  dependencies are Vite, Playwright, ESLint and Prettier).
- Reviewing a change that touches `.env*` files, `vite.config.js`,
  `playwright/playwright.config.js`, or anything under `.agents/`, `.claude/`, or `.codex/` (agent/tool
  permissions, hooks, skill scripts).
- A screen starts loading a font, image, video or script from another host —
  the panel ships inside someone else's app, so every runtime asset lives in
  `public/`.
- Someone asks "is this safe to commit / merge / publish?"

Do NOT use this skill for:

- Fixing the flagged issue yourself without saying so — report first, then
  ask before removing secrets from history, rotating keys, bumping deps, or
  vendoring a remote asset.
- Blocking a commit autonomously — this repo has no pre-commit hook wiring
  this skill in; it is report-only.
- Full dependency SCA/SBOM generation, license-compliance auditing, or
  penetration testing — flag the need, don't attempt to build that here.

---

## Critical patterns

### 1. Advisory-only contract

This skill **never** blocks a commit or merge and **never** exits non-zero
in a way meant to halt anything. It always finishes with a report so a
human decides. If the user wants a real blocking gate later, that's a
separate, explicit decision (a git hook), not something this skill
introduces on its own.

### 2. Dependency audit

```bash
npm audit
```

Any entry under `dependencies` (not `devDependencies`) is itself a finding:
[`no-frameworks`](../../rules/no-frameworks.md) says the panel ships no
runtime dependency without a `.ai/DECISIONS.md` entry.

### 3. Secret scanning: dedicated tool first, grep fallback always

```bash
# Preferred, if installed:
gitleaks detect --no-banner --source . --redact
# or
trufflehog filesystem . --only-verified

# Fallback (always run this too — dedicated tools aren't guaranteed to be
# installed in every environment): grep-based pattern scan over the diff,
# not the whole tree, to keep signal high.
git diff --cached -U0 | grep -nEi \
  '(api[_-]?key|secret|token|password|private[_-]?key|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY)\s*[:=]\s*["\x27]?[A-Za-z0-9/+_=-]{12,}'
```

Never print the matched secret value itself in the report — quote only the
file path, line number, and the variable name/pattern that matched (the
script redacts the value). MCP or service tokens are the most likely secret in this repo: they belong
in the tool's own config, never in a file here.

### 4. Scope detection

For an unstaged harness migration, use `--working`: it scans tracked and
untracked changes without staging files. `AGENTS.md`, `CLAUDE.md`, and
configuration, rules, scripts, tests, and reviewer files under `.agents/`,
`.claude/`, and `.codex/` require harness review.

```bash
# Pre-commit (staged files only)
git diff --cached --name-only --diff-filter=ACMR

# Pre-merge (full branch changes vs. main)
git diff --name-only --diff-filter=AM main...HEAD
```

Classify each changed path:

| File pattern                                                                                                                                                                                                      | Gate bucket                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `package.json`, `package-lock.json`                                                                                                                                                                               | js-deps                                     |
| `.env*`, `**/*.pem`, `**/*.key`, `.claude/settings*.json`, `.codex/config.toml`                                                                                                                                   | secrets-sensitive                           |
| `.agents/hooks/**`, `.agents/rules/**`, `.agents/reviewers/**`, `.codex/**`, `.claude/agents/**`, `.agents/skills/*/hooks/**`, `.agents/skills/*/scripts/**`, `vite.config.js`, `playwright/playwright.config.js` | harness-config                              |
| `index.html`, `main.js`, `src/**`, `styles/**`                                                                                                                                                                    | runtime (Gate 5 always scans these in full) |
| everything else                                                                                                                                                                                                   | secret-scan only                            |

If bucket `js-deps` is empty: skip the dependency audit gate entirely and
report "no dependency manifest changes — audit skipped."

### 5. Runtime network check (embedded in a host app)

The panel opens inside someone else's app. A remote load there leaks the
player's IP and context to a third party, can be blocked by the host's
CSP, and makes the panel fail when that host is slow or down. Every
font, image, video and script must be served from `public/` or bundled by
Vite. Gate 5 greps `index.html`, `main.js`, `src/` and `styles/` for loads
from another host — `src=`/`srcset=`/`poster=`, `<link href>` (stylesheets,
fonts), CSS `url()` and `@import`, `fetch()`, dynamic `import()` — and flags
each one whose host isn't named in [`.ai/DECISIONS.md`](../../../.ai/DECISIONS.md).
Plain `<a href>` links are navigation, not loads,
and are ignored. The fix is almost always to vendor the asset into
`public/` (fonts into `public/fonts/`); recording a host in DECISIONS is
the exception, needs the owner's explicit go-ahead, and writes down the
fallback when the host is unreachable.

### 6. Gate ordering

Always run in this order, and never abort early — collect every result
before reporting:

```
secret scan → dependency audit → lockfile integrity → sensitive/harness-config review → runtime network
```

---

## Decision tree

```text
User invokes security-guardian
    |
Step 0: Detect scope
    |-- pre-commit? --> git diff --cached
    +-- pre-merge?  --> git diff main...HEAD

    |
Classify changed files (table above)

    |
Step 1: Secret scan (always runs, every mode)
    |-- dedicated tool installed? --> run it
    +-- not installed? --> run grep fallback, note tool is missing

    |
Step 2: js-deps changed? --> npm audit; any runtime dependency? --> flag
Step 3: lockfile present but out of sync with manifest? --> flag drift
Step 4: secrets-sensitive or harness-config files touched? --> manual-review checklist
Step 5: always --> scan the panel for runtime loads from other hosts

    |
Produce go/no-go report (see Report Structure)
```

---

## Content guidelines

### Report structure

1. **Header**: scope (staged/branch), mode (pre-commit/pre-merge/dry-run).
2. **Gate summary table**: one row per gate — PASS / FLAGGED / SKIPPED, notes.
3. **Verdict**: single line — `GO` or `REVIEW NEEDED` (never "blocked" — this
   is advisory).
4. **Findings**: one block per flagged item (see Finding block format).
5. **Recommended next steps**: ordered, concrete, most urgent first.

### Finding block format

```
## Finding: {short title}

### Location
[path/to/file:line, or "package.json (dependency: <name>@<version>)"]

### Risk
[1–2 sentences, plain language — what could go wrong, not just "this is bad"]

### Suggested Fix
[Exact command, or exact line to remove/change — never just "fix this"]

### Severity
low | medium | high | critical
```

Never reprint the actual secret/token value in a finding — describe it
(e.g. "personal-access-token pattern") and point at the location
instead.

### GO / REVIEW NEEDED criteria

| Gate                                                      | Blocks verdict?                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| Secret scan                                               | YES — any match is `REVIEW NEEDED`                               |
| Dependency audit (`npm audit`) — critical/high advisories | YES                                                              |
| Dependency audit — moderate/low advisories                | NO (list, don't block)                                           |
| Runtime dependency present                                | NO (surfaces it; `no-frameworks` decides)                        |
| Lockfile drift                                            | YES — an out-of-sync lockfile means installs aren't reproducible |
| Sensitive/harness-config file touched                     | NO (surfaces a manual-review checklist, doesn't fail the gate)   |
| Runtime load from an unrecorded host                      | YES — the panel would leak data or break inside the host         |

---

## Commands

```bash
# Scope detection
git diff --cached --name-only --diff-filter=ACMR          # staged
git diff --name-only --diff-filter=AM main...HEAD          # branch vs main

# Gate 1: Secret scan
gitleaks detect --no-banner --source . --redact            # if installed
git diff --cached -U0 | grep -nEi '(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]'

# Gate 2: Dependency audit
npm audit
npm audit --json                                            # for precise severity parsing

# Gate 3: Lockfile integrity
npm ci --dry-run                                            # fails if lockfile is stale
git diff --stat package-lock.json                           # size of any lockfile diff, sanity-eyeball it

# Gate 5: Runtime network loads (manual equivalent)
grep -rnE "url\(['\"]?https?://|src=['\"]https?://|@import[^;]*https?://" index.html main.js src styles

# Helper script (runs gates 1-5 end-to-end, advisory only, exits 0 always)
bash .agents/skills/security-guardian/scripts/security-scan.sh            # staged
bash .agents/skills/security-guardian/scripts/security-scan.sh --branch   # branch vs main
bash .agents/skills/security-guardian/scripts/security-scan.sh --working  # all local changes
```

---

## Secure contributing, simplified

Point contributors and reviewers at
[`assets/SECURE-CONTRIBUTING-CHECKLIST.md`](assets/SECURE-CONTRIBUTING-CHECKLIST.md)
— a short, non-negotiable checklist for adding dependencies, handling
secrets, loading assets, and reviewing a branch before it merges. It's
intentionally short: a checklist nobody reads doesn't protect anyone.

---

## Resources

- [assets/SECURE-CONTRIBUTING-CHECKLIST.md](assets/SECURE-CONTRIBUTING-CHECKLIST.md) — the contributor/maintainer-facing checklist this skill enforces.
- [scripts/security-scan.sh](scripts/security-scan.sh) — advisory, exit-0 script running gates 1–5.
