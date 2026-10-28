---
name: hallmark
description: >
  Apply the RBG panel's anti-AI-slop gates to design and copy, run vendored
  sloplint, and request fresh-context visual review. Trigger: building or
  restyling a screen, writing UI copy, polishing a screen, checking whether
  it looks generic, or before calling visual work done. Supports audit and
  polish modes. Adapted from Nutlope/hallmark (MIT).
metadata:
  author: 'Nutlope/hallmark (Hallmark contributors, Together AI), MIT; adapted by davecelot'
  version: '1.2.0'
  changelog: >
    1.2.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.1.0: adapted for rbg-ui from ppt-make-a-thon — Floor, gates, craft,
    layout, imagery, texture, data-viz, patterns, brand-truth, direction,
    audit and both review prompts retargeted from slides on a fixed
    1920×1080 stage to screens in a fluid embedded panel under the
    "Matchday, quiet luxury" direction (RBG badges × Nike discipline ×
    fútbol culture × pixel art as photography); export-slides.js became
    export-screens.js (tab × sub × state from src/screens/index.js); the
    cover review became the first-screen review (review-first.md); a
    game-UI slop catalogue added to patterns.md; sloplint.mjs unchanged.
    1.0.0: adapted for ppt-make-a-thon from Nutlope/hallmark v2.0.0
    (commit 7ec8682).
  auto-invoke: 'Building, restyling or reviewing a screen, writing UI copy, or before calling visual work done'
  allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, Agent]
---

# Hallmark (panel edition)

Makes the panel look made, not generated: a hard floor against the
defaults every model was trained into — and against the "gamer UI" defaults
the current app already shows — one hero per screen, and a cold reviewer
with the last word. Above the floor the screen is yours.

Provenance: adapted from [Nutlope/hallmark](https://github.com/Nutlope/hallmark)
v2.0.0 (MIT, [`LICENSE`](LICENSE), Hallmark contributors, made by Together
AI). Upstream is a landing-page skill; this copy keeps its gates, numbering
and linter and retargets the wording to an app panel that lives inside
someone else's app. Gate numbers match upstream so `scripts/sloplint.mjs`
findings map one to one.

## Where it sits

| Skill / agent                                | Owns                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| [`rbg-taste`](../rbg-taste/SKILL.md)         | The direction: pillars, palette and type roles, the tab intent map, each screen's hero.           |
| [`panel-builder`](../panel-builder/SKILL.md) | The contract: panel box, shell, screen modules, states, navigation, the facts the panel may show. |
| [`motion`](../motion/SKILL.md)               | Every animation and micro-interaction.                                                            |
| `a11y-checker`                               | WCAG detail beyond the Floor's contrast and focus lines.                                          |
| **hallmark**                                 | What reads as machine-made: the Floor, the gates, the sweep, the cold reviews.                    |

Where hallmark and `rbg-taste` disagree, the stricter one binds; where a
gate and the RBG badges disagree on brand (a colour, the mark), the badges
win and the stamp says so (`references/brand-truth.md`).

## The Floor

Binds every screen and every state, never waivable, even when nothing else
is read. Gate numbers in brackets.

1. Every colour and font goes through a token in `styles/tokens.css`. No literal colour or `font-family` past the token block. (48, 7a)
2. Never `transition: all`; never animate `width`, `height`, `top` or `left`. (10a)
3. Never one word in a heading set apart by colour, weight or italic: the single green word is this panel's most likely tell. (38i; 38iii is Reflex, `rbg-taste` blocks it)
4. Nothing scrolls sideways at any supported panel size, nothing essential hides under the action bar, and only `.rbg-view` scrolls; no `vw`, `vh`, `dvh` or viewport `@media` inside the panel (layout answers to `@container rbg`); no styles on `html` or `body` (`panel-embedding`). (34, 6a)
5. Grid tracks use `minmax(0, 1fr)`; display heads and long names carry `overflow-wrap: break-word; min-width: 0`. (50)
6. Every link or control has `:focus-visible`, appearing instantly. (26a, 15)
7. Every animation has a `prefers-reduced-motion: reduce` fallback, and every state reads complete with its effect skipped. (27, 62)
8. Never an invented fact: every feature, label, reward, price, rank tier, stat and name comes from `docs/screen-inventory.md` or `src/data/` drawn from it. (46a)
9. Never an eyebrow inside a screen: no small line above a heading that announces it (`DESAFIOS DIÁRIOS` over `Missões do clube`); and never a tracked-caps label inside a screen. The panel sets nothing in uppercase: tabs, the CTA and the action bar's context line are sentence case (`gates.md` § 4, 54 and 67). (54, 67)
10. Never middle-dot meta strings, arrows glued to text (`Ver o Passe →`), Unicode glyphs or emoji as icons or item art (`🎉 👑 ✓ ↗ « ›`), or decorative status dots. (63, 30a)
11. Never a purple, neon or night gradient, a glow border or halo, a card inside a card, an orange or gold "premium" accent, or a hand-drawn browser or OS window. (2a, 4, 29, 47a)
12. About 40 words of prose in a view at once, data rows and control labels excluded; most views carry under 20. (58)
13. Text contrast 4.5:1 against what it is actually painted over (3:1 at display size), measured over pixel art and fills, never over the flat token. (40, 41)
14. The first non-empty line of `styles/base.css` is the panel stamp (§ The stamp). (20)
15. Before calling a screen done, run the sweep (§ Sweep). Fix every `FAIL`; fix or waive every `REFLEX`.

Above the Floor, a **Reflex** gate is a default a model falls into,
waivable on the record with a real reason; a **Finish** check is craft
detail, answered, never blocking ([`references/gates.md`](references/gates.md) § 1, § 2).

## Flow

0. **Pre-flight.** Read `styles/tokens.css`, `rbg-taste` (the tab's row in the intent map), the tab's section of `docs/screen-inventory.md` and its screenshots in `reference/current-app/`. Name what you keep and what you introduce, one line each.
1. **Material.** One line: _real_ (features and fields from the inventory for this screen), _pictures_ (pixel avatars, item art, the RBG badges in `public/assets/`), _absent_ (what the screen will not have). Nothing absent is invented; a missing fact is a slot (`references/craft.md` § 8).
2. **Shape.** The screen's one job, its hero (`rbg-taste`), its composition (`references/layout.md` § 5) and its **signature**: the one thing the player remembers. Mirror test: would the neighbouring tab get this exact layout? If yes, change one decision.
3. **Picks line**, once, before code: `Ranking/jogadores · job: know where I stand · hero: my position and tier · composition: Table · signature: the position column set as scoreboard numerals · absent: per-row avatars beyond the sprite`. Score the pre-emit critique (`gates.md` § 3); anything under 3 is revised first.
4. **Build** with `panel-builder`'s checklist. The first screen first: build Perfil's default state alone, sweep it, run the first-screen review (`references/review-first.md`) before the other tabs exist. Then one screen at a time, every state, at compact, regular and wide.
5. **Sweep** (below), then the finish review in fresh context, then report.

Load per task: `references/gates.md` § 1 to § 4 and `references/craft.md` always; `references/layout.md` when composing; `references/imagery.md` when a screen shows an avatar, an item or a badge; `references/direction.md` when the screen drifts toward the gamer or "Nike clone" cliché; `references/texture.md` before any pattern, line art or fill that is not a flat token; `references/data-viz.md` for stats, progress, ranks or any figure row; `references/patterns.md` for tables, progress, slots, CTAs and the game-UI slop catalogue; `references/brand-truth.md` before touching brand colour or the badges. `gates.md` § 5 waits for the sweep, § 6 for the reviews.

### Verbs

- `/hallmark <screen brief>`: the flow above for one screen.
- `/hallmark audit [<tab>|<tab>/<sub>|panel]`: a report, no edits (`references/audit.md`).
- `/hallmark polish <tab>/<sub>`: fix the tells in place, keep layout and copy (`references/audit.md` § Depth).

A change to an existing screen that does not name Hallmark is done as
asked, in the panel's own system; the Floor still binds it.

## The stamp

Line 1 of `styles/base.css` (sloplint gate 20 reads it; it is also the
durable memory across long sessions):

```css
/* Hallmark · panel: RBG · direction: Matchday, quiet luxury (rbg-taste) · posture: restrained · shape: app screen · hallmark 1.1.0
 * pre-emit critique: P4 H4 E4 S4 R4 V3 · weakest: V, Ranking and Meu Time shared a table skeleton; Meu Time now leads with the club identity */
/* Hallmark · waive 7b · paper is pure white because Nike's system and the RBG flat badge's letters both set it so, and ink is #111, not black */
```

`shape: app screen` makes sloplint skip landing-page gates (hero, fold,
section rhythm). One waiver per comment, as `gates.md` § 2 describes; the
waiver above is the one this panel is expected to need, and only if the
paper token is set to pure white.

## Sweep

From the repo root:

```bash
node .agents/skills/hallmark/scripts/export-screens.js
```

```bash
node .agents/skills/hallmark/scripts/sloplint.mjs styles .hallmark/screens --scope app
```

`export-screens.js` writes every tab × sub × state from
`src/screens/index.js` as a standalone HTML document under
`.hallmark/screens/<tab>--<sub>--<state>.html` (git-ignored by the
`.gitignore` it writes) so the linter can read markup and copy that live in
JS template strings. The linter is upstream's static tier, unchanged: never
pass `--render` (its puppeteer tier was not vendored; rendered checks are
Playwright's job: `npm test` for overflow, navigation and axe on every host
size, `playwright-worker`'s walkthrough
(`WALKTHROUGH=1 npm test -- walkthrough`) for frames at
`test-results/walkthrough/<project>/<tab>--<sub>--<state>.png` across
`size-1024`, `size-1280`, `size-1600`, `shrunk` and
`reduced-motion`).

Then:

1. Fix every `FAIL`; fix or waive every `REFLEX`; confirm or dismiss every `WARN`. Re-run until clean.
2. Walk the judged gates (`gates.md` § 4, class J and R/J) against the walkthrough frames — `shrunk` first, where the panel is tightest — and the pt-BR copy tells in `craft.md` § 6, which the linter cannot read.
3. Finish review in fresh context: the `screen-critic` agent, or a subagent told to read `references/review-finish.md` and follow it. Act on its first word.
4. Report: `Floor 0 FAIL · Reflex 1 (waived: 7b) · finish-review: screen-critic, 4 fixes, 4 resolved`. A fabricated pass is itself slop.

Sloplint's fix lines sometimes cite upstream files this copy does not ship
(`fonts.md`, `direction.md`'s custom route, `design.md`,
`scroll-choreography.md`, the photo library in `imagery.md` § 2): read
them as `craft.md` § 1, `references/direction.md`, `styles/tokens.css`,
the `motion` skill and `references/imagery.md` § 2 respectively.

## Model tics to refuse

Every element in a bordered box; an outline-only "ghost card" as filler;
an icon in a rounded tile beside every heading; a glow ring around every
avatar; rarity colours framing everything; emoji standing in for items;
gradient progress bars; a stat tile wall with tiny labels and trend arrows;
uppercase tracked labels on every block; drawn SVG trophies, balls and
shields as filler (80); a tight grotesk on near-black with one neon accent
and a 1px border under a soft shadow; a first tab that commits and a third
that quietly becomes the old card grid. If you have restated the plan
twice, stop narrating and build; never write a gate count you did not
verify.
