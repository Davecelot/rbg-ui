# Rule: comment-minimalism

Default to writing no comments. Only add one when it explains a **why**
that isn't obvious from the code itself — a hidden constraint, a subtle
invariant, a workaround for a specific bug, or behavior that would
surprise a reader. Never add a comment that restates **what** the code
already says (well-named identifiers do that), or that summarizes a
getter/method whose behavior is already legible in its own body.

This applies to every file in this repo — screen modules, the panel shell,
CSS, Playwright specs, and this repo's own docs/skills/rules alike — not just
`src/**`.

## What survives

- A note explaining why an API is called in a specific order or with a
  specific value (a documented browser quirk, a spec edge case, a container-query
  or host-embedding behavior, a CSS property chosen to stay on the
  compositor) — a workaround needs its reason on record, since nothing else
  in the code explains why the "obvious" version would be wrong.
- A short pointer to the source of truth for a magic number or a design
  decision (e.g. `/* smallest supported panel, see DECISIONS */`, or a token's
  role name from `rbg-taste` in `styles/tokens.css`) — as long as it doesn't also
  restate the _behavior_ that source already documents.
- A `TODO`/deferred-work marker, tracked per [`hammock`](../skills/hammock/SKILL.md)'s
  `debt` mode.

## What doesn't

- A function-level doc comment that summarizes behavior an adjacent doc or
  rule already documents — the doc is the source of truth; a comment
  restating it is a second copy that can silently drift out of sync the
  moment behavior changes and only one of the two gets updated.
- A comment on a getter/property that just narrates what its one-line body
  already says.
- A file header describing how a build step compiles it, what conventions
  it follows, or how its parts are laid out — if that's not visible in the
  code itself, it belongs in an adjacent doc, not a comment no one is
  guaranteed to keep in sync.

**Why:** a comment that duplicates what the code or an adjacent doc already
says is a second copy that can drift silently the moment behavior changes and
only one copy gets updated. Minimal comments also keep code review focused on
behavior instead of prose.

**Enforcement (manual for now):** before adding a comment, ask "would a
reader be surprised by this without the comment?" — if not, don't write
it. When reviewing a diff, flag any comment that just restates the code or
an adjacent doc, the same way [`hammock`](../skills/hammock/SKILL.md)'s
`review` mode already flags other unrequested-complexity smells. There is
no automated linter for this yet.
