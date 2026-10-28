# Rule: read-agent-instructions-first

At the start of any task in this repo, treat [`AGENTS.md`](../../AGENTS.md)
as the first and only entry point for orientation — it is the index of
where everything else lives (skills, agents, rules, decisions, the creative
brief, the screen inventory).

This applies even when `AGENTS.md` is already loaded automatically into
context: don't skip following its links because the file itself is
present. The file is deliberately a pure index — its value is in the links
it points to (the relevant `.agents/skills/*/SKILL.md`, an agent under
`.agents/reviewers/`, a rule under `.agents/rules/`, `.ai/DECISIONS.md`,
`docs/creative-brief.md`, `docs/screen-inventory.md`), not in its own body text.

**Why:** `AGENTS.md` is deliberately a pure index specifically so agents
follow it to the authoritative source instead of assuming the index itself
is documentation or improvising from general knowledge of similar repos —
or of generic game UIs, which is exactly how a panel drifts into
template-looking output.

**Enforcement (manual for now):** before acting on a task, check
`AGENTS.md`'s auto-invoke table for a matching row, and follow the link
there rather than answering from memory or assumption — especially for
tooling, conventions, art direction, facts on screen, or past-decision
questions, where the authoritative file is only one link away.
