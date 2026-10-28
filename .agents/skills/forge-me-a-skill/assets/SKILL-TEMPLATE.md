---
name: '{skill-name}'
description: >
  {What the skill does}. Trigger: {explicit condition that should cause an
  agent to invoke this skill}.
metadata:
  author: davecelot
  version: '0.1.0'
  changelog: 'Initial skill authored; {why it matters}; {where it affects}'
  auto-invoke: "{explicit trigger condition, mirrored into AGENTS.md's auto-invoke table}"
  allowed-tools: [{ tools this skill actually uses }]
---

# {Name of the Skill}

Load this skill through the host selector or read this `SKILL.md` directly.
Use capabilities exposed by the current runtime; metadata tool labels do
not grant permissions. Optional plugins must have a local fallback.

## When to use

Use this skill when:

- {Condition 1}.
- {Condition 2}.

Do not use this skill for:

- {Condition 1}.
- {Condition 2}.

---

## Critical patterns

{The most important rule(s) an agent must follow — lead with this, not background.}

### Pattern 1: {Name}

```{language}
{code example}
```

---

## Decision tree

```text
{Question 1}? -> {Action A}
{Question 2}? -> {Action B}
Otherwise     -> {Default action}
```

---

## Commands

```bash
{command 1} # {description}
{command 2} # {description}
```

---

## Resources

- Place reusable templates/schemas/examples in `assets/`.
- Place executable helpers in `scripts/`.
- Link to local docs only in `references/` — never a web URL.
