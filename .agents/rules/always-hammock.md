# Rule: always-hammock

Invoke the `hammock` skill ([SKILL.md](../skills/hammock/SKILL.md)) for
every non-trivial coding task in this repo — a new screen, a change to the
panel shell, a stylesheet, a motion recipe, a refactor, or a diff review —
regardless of how small or "obviously correct" the change looks going in.

**Why:** hammock enforces the decision-ladder discipline a senior engineer
applies by default — checking for an existing pattern before adding a new
one, questioning unnecessary abstraction, and flagging complexity that
doesn't earn its keep. That judgment doesn't turn off for small changes;
small changes are exactly where shortcuts get taken and where over- or
under-engineering compounds silently. A tabbed game panel is especially prone to
this: every tab and screen is a temptation to invent its own one-off system.

**Enforcement:** `.claude/settings.json` and `.codex/hooks.json` use
the shared dispatcher in `.agents/hooks/`. Supported local runtimes inject
the ladder at session start, before prompts, and into subagents; source
changes trigger the simplicity audit. Hook trust, availability, state,
completion reminders, and manual fallback are documented in
[`docs/agent-setup.md`](../../docs/agent-setup.md).

Choosing the explicit mode and applying the ladder remain judgment calls.
Use `review` for a written diff, `audit` for a broader pass, `debt`/`gain`
for tracking simplifications, and `help` for guidance. When hooks are
unavailable, load the skill and run its audit commands manually.
