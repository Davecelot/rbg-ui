# Secure Contributing Checklist

Short on purpose. If it's long, nobody reads it before committing.

## Before you commit

- [ ] No secrets in the diff: API keys, tokens, passwords, private keys,
      `.env` files with real values. Run
      `git diff --cached -U0 | grep -nEi '(api[_-]?key|secret|token|password|private[_-]?key)\s*[:=]'`
      if unsure.
- [ ] No personal access tokens or internal URLs hard-coded into screens,
      scripts, or config — use environment variables or a placeholder
      instead. MCP and service tokens live in their tool's configuration,
      never in this repo.
- [ ] `.env*` files stay untracked (don't force-add one with `git add -f`).
- [ ] Mock data in `src/data/` uses only the public sample values from
      `docs/screen-inventory.md` — no real player emails, IDs or payment data.

## Before you add or upgrade a dependency

- [ ] Ask first whether it's needed at all: the panel has **no runtime
      dependencies** by design (see `.agents/rules/no-frameworks.md`). A new
      one needs an entry in `.ai/DECISIONS.md`.
- [ ] Check the package is actively maintained (recent releases, not a
      single maintainer with no commits in 2+ years) before adding it.
- [ ] Run `npm audit` after adding — resolve or explicitly accept any
      critical/high advisory before merging (note the acceptance and why in
      the commit body).
- [ ] Never install a package you haven't reviewed without checking its
      install scripts first — `preinstall`/`postinstall` scripts run arbitrary
      code (npm already asks before running them; don't approve blindly).
- [ ] Commit the updated `package-lock.json` in the same commit as the
      manifest change — never let them drift.
- [ ] Never vendor a dependency's source directly into this repo to "avoid
      the audit" — that hides it from every future scan.

## Rendering content and loading assets

- [ ] A screen's `render` builds markup from repo-authored templates and mock
      data only. Never
      interpolate URL parameters, `location`, or any other input you don't
      control into `innerHTML`.
- [ ] External links opened in a new tab use `rel="noopener noreferrer"`.
- [ ] Fonts, images, videos and scripts load from `public/` (or are bundled
      by Vite), not from another host — the panel runs inside someone else's app. If a
      remote load is truly unavoidable, get the owner's go-ahead and record
      the host and the fallback in `.ai/DECISIONS.md`.
- [ ] Assets come from this repo, the owner, or a source you recognize — not a URL pasted in from somewhere unfamiliar.

## Reviewing a batch of changes on main

- [ ] Run `security-guardian` (or
      `bash .agents/skills/security-guardian/scripts/security-scan.sh`)
      against the uncommitted changes before committing them.
- [ ] Any change to `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json`, `.claude/settings.local.json`,
      `.codex/`, `.agents/hooks/`, `.agents/rules/`, `.agents/reviewers/`, `.claude/agents/`, or a skill's `hooks/`/`scripts/`
      gets read in full — these control what tools, permissions and
      automatic commands agents have. A one-line diff here can silently widen
      access.
- [ ] Any new external URL fetched by a script or config is a URL you
      recognize.
- [ ] Don't rewrite `main`'s history.

## If a secret was already committed

Don't just delete it in a new commit — it's still in git history.

1. Rotate/revoke the credential immediately (assume it's compromised the
   moment it hit a commit, even though the repo is local).
2. Then decide with the user whether history needs rewriting
   (`git filter-repo` / BFG) — this is a destructive, hard-to-reverse
   operation and needs explicit confirmation before anyone runs it,
   especially once the repo has been shared or pushed anywhere.

## Why this exists

The panel is meant to ship inside a live game used by many players at once.
A leaked token or a remote load shows up for every one of them. This checklist is deliberately cheap to run so it actually
gets run.
