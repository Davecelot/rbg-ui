# Rule: git-workflow

This repo's authorized remote is the private GitHub repository
`Davecelot/rbg-ui`. Keep development on `main`; no merge requests or CI are
needed unless the owner asks for them.

**Private remote (owner's instruction, 2026-10-28).** The owner authorized
creating this private repository and uploading a sanitized project snapshot.
Never make it public or push local reference captures, private player data,
credentials, or old history containing them. Other publishing destinations
still require the owner's explicit request.

## Commits

- [Conventional Commits](https://www.conventionalcommits.org/) titles, in
  English, imperative and concise: `feat: add the ranking table`,
  `fix: keep the action bar above the view on short hosts`,
  `chore: scaffold rbg-ui harness`.
- The body explains the _why_, not the what.
- Small, atomic commits — one screen, one shell change, one token change.
- Before committing: `npm run lint`, `npm run format`, and `npm test` pass.
  Run [`security-guardian`](../skills/security-guardian/SKILL.md) when the
  commit touches dependencies, `.agents/` harness files or `.claude/`/`.codex/` hooks/settings, or loads anything
  from another host.

## One branch: `main`

There are no feature branches (owner's instruction, 2026-10-26). All work
happens and gets committed directly on `main`. Don't create a branch, a
worktree, or a stash to park work. If you find another branch, ask before
deleting it.

A fix for something you just committed is a new commit. Don't amend or
rebase `main` unless the owner asks for it.

**Why:** this is a one-person redesign. Branches add merge and cleanup steps
with nobody else to coordinate with. Small commits on `main` still make it
easy to go back to the last version that looked right.

**Enforcement (manual):** no hook enforces any of this. Follow it by
convention, and ask before any history rewrite on `main`.
