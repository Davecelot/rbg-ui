# Audit and polish

Loaded only when the user names Hallmark with `audit` or `polish`
(`/hallmark audit panel`, `/hallmark polish ranking/jogadores`). A change to
an existing screen that does not name Hallmark never loads this file: it is
done as asked, in the panel's own system, and the Floor still binds it.

## What a polish keeps

- **The facts,** every one, as the inventory gives them. Nothing is added: no feature, field, picture or action the screen did not have, beyond what a gate requires (a reduced-motion fallback, a focus ring, an `empty` state the inventory implies).
- **The wiring:** the screen's `id`, `tab`, `label`, `states`, any `enter` hook, the shell selectors and `data-*` attributes `panel-builder` lists, and everything `playwright/tests/` reads. Never edit a test to make a polish pass.
- **The brand:** tokens and the RBG badges as delivered (`brand-truth.md`).
- **The words,** unless a copy gate names them (19, 54, 58, 63, 69). Wording that fails is tightened from the screen's own facts, and the handoff lists every changed line, before and after. An eyebrow is never just deleted: where its heading is vague, the label's meaning moves into the heading.

## Depth

| Depth       | Stays                        | Changes                                                         | Only when the request says                        |
| ----------- | ---------------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| **audit**   | everything                   | nothing: a report                                               | `audit`                                           |
| **polish**  | the composition and the copy | only what a gate names: tokens, contrast, states, motion, tells | `polish`                                          |
| **rebuild** | the facts and the wiring     | the composition (a new screen built by SKILL.md's flow)         | `rebuild`, or the user approves it after an audit |

The depths do not blend: a polish that finds the composition wrong says so
and recommends a rebuild; it never smuggles one in.

## Before

1. Run the sweep (SKILL.md § Sweep) on the screens as they stand and keep the output.
2. Look at the walkthrough frames (`shrunk` and `size-1280` at least) before weighing the findings, so the linter does not write the verdict.
3. The read, four lines per screen or one block for the panel: what it is for; what works and stays (at least one thing); what reads as generated (the worst tells, by gate); what is broken.

**`audit` stops here.** It loads `gates.md` § 1, § 4 and § 5, walks the
judged gates from the frames, and reports findings by tier with
`file:line`, the read, and the lightest depth that settles each. It
changes no file.

Auditing the current app from `reference/current-app/` is allowed and
useful before a redesign: the same read, by screenshot number, with no
`file:line` (there is no source) and no polish.

## After a polish

1. The sweep again: 0 `FAIL`, every `REFLEX` fixed or waived.
2. `npm test` and `npm run lint`. A polish that breaks one is not finished.
3. The finish review in fresh context, given the before and after frames; ask it one thing: does anything still read as machine-made? At most five findings.
4. The handoff:

```
Polish   ranking/jogadores · 1 screen, 3 states
Before   Floor 3 FAIL · Reflex 2
After    Floor 0 · Reflex 1 waived (7b)
Kept     every fact · states 3/3 · id and label · tests green
Changed  tokens, contrast, the eyebrow folded into the heading, pagination pills → nav
Words    1 line reworded (listed below)
Layout   findings only a rebuild would settle: 8 (shares Meu Time's table skeleton)
```
