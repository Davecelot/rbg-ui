# Rule: docs-language-split

Repository-authored content uses English, while player-facing panel content
uses Brazilian Portuguese (pt-BR):

- **Repository content — English.** `README.md`, `AGENTS.md`, the `CLAUDE.md` adapter, runtime setup docs, everything under
  `.agents/rules/`, every `.agents/skills/*/SKILL.md` (plus its
  `references/`/`assets/` docs), every `.agents/reviewers/*.md` and `.claude/agents/*.md` wrapper,
  `.ai/DECISIONS.md`, everything under `docs/` (the creative brief, the
  screen inventory, the debt log), code identifiers, and commit messages.
- **Player-facing content — Brazilian Portuguese (pt-BR).** Everything a
  player reads or hears: the copy rendered in the panel, `aria-label`s and
  alt text, `#rbg-status` announcements, `lang="pt-BR"`, and mock data
  labels. Match the current app's register (`Entre em campo`, `Jogar`,
  `Vestiário`) — direct, short, você.

**Mixed content is allowed and sometimes correct.** A file whose
instructions are AI-first (English) may quote literal pt-BR strings that
must match the panel or the current app — for example the screen inventory
transcribing labels, or a Playwright spec asserting `Ranking`. Keep the
literal strings exactly as they appear, in backticks, never translated.

Some English in the panel is intentional: product names the current app
already uses (`RCS Week`), and the position codes **`GK`, `DEF`, `MID`,
`ATK`** (owner's choice, 2026-10-26) — keep those as the inventory records
them.

**Why:** repository conventions, code, and developer documentation use
English; player-facing content uses the language of the Brazilian audience.

**Enforcement (manual for now):** write repository documentation, source
identifiers, comments, and metadata in English. Keep player-facing copy,
accessibility labels, announcements, and mock display values in pt-BR. An
English developer document may quote exact pt-BR interface labels. There is
no automated language linter yet.
