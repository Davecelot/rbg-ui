# RBG — Claude Code adapter

Read and follow @AGENTS.md before working in this repository. It is the
canonical project index for skills, rules, reviewers, and verification.

`.claude/skills` and `.claude/rules` are compatibility symlinks to the shared
`.agents/` core. Claude agents are thin wrappers around shared reviewers.
Hook configuration remains in `.claude/settings.json`. Runtime setup and
fallbacks are documented in `docs/agent-setup.md`.
