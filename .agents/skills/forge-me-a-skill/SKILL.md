---
name: forge-me-a-skill
description: >
  Create and standardize skills for this repo, with a consistent structure,
  frontmatter, and naming convention. Trigger: creating a new skill, or
  auditing an existing one for consistency.
metadata:
  author: davecelot
  version: '1.3.0'
  changelog: >
    1.3.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.2.0: adapted for rbg-ui from ppt-make-a-thon — examples, naming table
    and agent pointers now refer to the panel's skills (panel-builder,
    rbg-taste) and agents (screen-critic, ship-check).
    1.1.0: adapted for ppt-make-a-thon from fogo-kitchen; adds agents/ guidance (.agents/reviewers/) and the upstream-vendored
    skill case (hallmark). 1.0.0: initial skill: skill structure under
    .agents/skills/, naming and frontmatter conventions, and a skill
    template; keeps SKILL.md as the single source of truth for metadata;
    affects every skill added here.
  auto-invoke: Creating a new skill
  allowed-tools: [Read, Edit, Write, Glob, Grep, Bash]
---

# Forge Me a Skill

## When to use

Create a skill when:

- A pattern is used repeatedly and an agent needs guidance to do it
  consistently (e.g. adding a screen to the panel, turning the screen inventory into
  mock data, running an accessibility audit).
- A convention of this repo differs from generic best practice for that
  technology (e.g. how _we_ lay out a screen with container queries inside a
  host-sized panel vs. a generic responsive web page).
- A workflow has enough steps or decision points that "just wing it" produces
  inconsistent results across agents/sessions.

Do not create a skill when:

- A doc already exists and a link/reference is enough — add a `references/`
  entry instead of duplicating the content into a new skill.
- The pattern is one-off or self-explanatory.
- A rule in `.agents/rules/` is enough — a short, always-on instruction
  belongs there, not in a skill an agent has to decide to invoke.
- What you need is an isolated, fresh-context reviewer or worker (e.g. a
  taste critique that must not be anchored on the author's reasoning) — that's
  a shared procedure in `.agents/reviewers/<name>.md`, with a thin
  `.claude/agents/` wrapper where needed. Pass it to a fresh subagent through
  the current host's delegation capability; it can follow a skill. See `screen-critic`
  and `ship-check`.

## Skill structure

Skills live under `.agents/skills/`, where Codex discovers them natively.
Claude discovers the same files through the `.claude/skills` symlink.
Local Work setup and fallback loading are in `docs/agent-setup.md`.

```text
.agents/skills/{skill-name}/
├── SKILL.md              # required — single source of truth (frontmatter + body)
├── assets/               # optional — templates, schemas, example configs
│   └── TEMPLATE.md
├── scripts/              # optional — executable helpers for repeatable tasks
│   └── helper.sh
├── hooks/                # optional — shared hook helpers the skill owns (see hammock)
├── modes/                # optional — one file per mode when the skill is a router
└── references/           # optional — links to LOCAL docs only, never web URLs
    └── docs.md
```

This repo does **not** use a separate `manifest.json` alongside `SKILL.md`.
`SKILL.md`'s frontmatter is the single source of truth for metadata — the
same reason `AGENTS.md` owns shared instructions and `CLAUDE.md` only
loads it: adapters must not duplicate maintained workflow content.
Keep standard `name` and `description` discovery fields concise. Tool names
in existing metadata describe capabilities, not host permission grants.
Write new procedures using capabilities and map platform calls in
`docs/agent-setup.md`; do not require optional plugins or nonexistent tools.

## Naming conventions

| Type           | Pattern                                    | Examples                             |
| -------------- | ------------------------------------------ | ------------------------------------ |
| Generic skill  | `{technology}`                             | `motion`, `playwright-worker`        |
| Repo-specific  | `{purpose}`                                | `a11y-checker`, `security-guardian`  |
| Panel-specific | `{project}-{purpose}` or `panel-{purpose}` | `rbg-taste`, `panel-builder`         |
| Workflow skill | `{action}-{target}`                        | `forge-me-a-skill`, `review-rangers` |
| Vendored skill | upstream's own name                        | `hallmark` (from Nutlope/hallmark)   |

## Decision: assets/ vs scripts/ vs references/

```text
Need a doc/code template?      -> assets/
Need a JSON/YAML schema?       -> assets/
Need an executable helper?     -> scripts/
Link to an existing local doc? -> references/
Need a different procedure per mode of one skill? -> modes/
```

Key rule: `references/` points to local files only — never a web URL. If a
skill was itself adapted from an external source (hammock from ponytail,
hallmark from Nutlope/hallmark, the motion craft standard from the Mody
plugin), note that provenance in the skill's own body or
`changelog`, not as a live `references/` link, and keep the upstream license
file if it ships one.

Scripts that parse files run with an isolated interpreter (`python3 -I`,
plain `node` with no project-local loaders) so a stray module in the working
directory can't hijack them.

## Frontmatter fields

| Field                    | Required | Format              | Description                                                                                              |
| ------------------------ | -------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `name`                   | Yes      | `lowercase-hyphens` | Matches the skill's directory name.                                                                      |
| `description`            | Yes      | String              | What the skill does, plus an explicit `Trigger: ...` clause so an agent can recognize when to invoke it. |
| `metadata.author`        | Yes      | String              | The contributor's public handle. Use `davecelot` for this repository.                                    |
| `metadata.version`       | Yes      | Semver string       | `"X.Y.Z"`.                                                                                               |
| `metadata.changelog`     | Yes      | Structured text     | `"<what changed>; <why it matters>; <where it affects>"`.                                                |
| `metadata.auto-invoke`   | Yes      | String              | Explicit trigger condition — mirrors a row in `AGENTS.md`'s auto-invoke table.                           |
| `metadata.allowed-tools` | Yes      | List                | Tools this skill actually needs.                                                                         |

## Changelog format

```text
"<what changed>; <why it matters>; <where it affects>"
```

Example: `"Added open-questions section; keeps unresolved gaps visible; affects
the review workflow"`.

## Content guidelines

Do:

- Start with the most critical rule/pattern, not background.
- Use tables for decision trees (see above).
- Include a `Commands` section with copy-paste-ready commands, if relevant.
- Keep the `Trigger:` clause specific enough that an agent wouldn't invoke
  it by accident on an unrelated task.

Don't:

- Duplicate content that already lives in `docs/` (the creative brief, the
  screen inventory) — reference it instead.
- Leave `changelog` vague ("updated stuff").
- Add a manifest.json "for consistency with some other tool" — see the
  single-source-of-truth rule above.

## Checklist before creating a skill

- [ ] The skill doesn't already exist under `.agents/skills/`.
- [ ] The pattern is genuinely reusable, not one-off, and not better as a rule.
- [ ] Name follows the conventions table above.
- [ ] `metadata.author` is the actual contributor's name, not a generic
      project/team name.
- [ ] `description` includes an explicit `Trigger: ...` clause.
- [ ] `metadata.changelog` follows the structured format.
- [ ] `metadata.allowed-tools` matches what the skill body actually asks an agent to use.
- [ ] Add a row to `AGENTS.md`'s **Skills** table (skill, one-line purpose, link to its `SKILL.md`).
- [ ] If this skill should be auto-invoked, add a matching row to `AGENTS.md`'s **Auto-invoke** table
      ("If you're asked to... / Do this") — `metadata.auto-invoke` and that row say the same thing.
- [ ] If a rule should route work to it (e.g. `ui-frontend-best-practices`), update that rule too.
- [ ] AI-facing prose is English (see `.agents/rules/docs-language-split.md`); any on-screen pt-BR copy
      it reproduces is marked as such.

## Resources

- Template: [`assets/SKILL-TEMPLATE.md`](assets/SKILL-TEMPLATE.md)
