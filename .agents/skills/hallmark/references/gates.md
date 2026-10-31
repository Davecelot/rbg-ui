# Gates

The one list of what Hallmark refuses on a screen. § 1 to § 4 load before
building (§ 1 to § 3 drive the pre-emit pass, § 4 the build); § 5, the
Finish checks and the judged clauses, waits for the sweep; § 6 for the two
reviews. Gate numbers and tiers match upstream Hallmark so
`scripts/sloplint.mjs` findings map one to one; where this file and the
linter disagree on a screen, this file wins and the finding is dismissed on
the record.

**Panel pixels.** The panel is one of three 16:9 presets (reflowing smaller when the window is too small), laid out with
`@container rbg` queries in three classes: **compact**, **regular**,
**wide** (`panel-builder` § The panel box; breakpoints in `tokens.css`).
Pixels here are CSS px inside the panel, roughly 1:1 with upstream's
1440-wide page but in a far smaller box: read upstream's thresholds as-is
for type and focus rings, and about half for gaps and section spacing
(a 120px gap becomes 48 to 64px at regular, less at compact). Every
rendered check is judged at `shrunk` first, where the panel is
tightest, then at `size-1280`.

## 1. How a gate binds

- **Floor.** Never waivable. Correctness, access, honesty, the bans, and four **house rules** (54 the eyebrow, 58 the word budget, 63 template punctuation, 67 the tracked-caps label), reflexes so reliably machine-made that Hallmark is stricter than the field.
- **Reflex.** A default a model falls into. A screen with a real reason may waive one on the record (§ 2); the same gate waived on three screens is a house style and belongs in `rbg-taste`.
- **Finish.** Craft detail a player would feel more than see: the F-checks (§ 5). Reported and answered, never blocking.
- **Ledger.** Repetition bookkeeping (32). A `NOTE`, never a verdict.

**Class** says who checks it: **M** sloplint's static tier (on `styles/` and `.hallmark/screens/`); **R** a rendered check, which in this repo means Playwright (`npm test`) or the walkthrough frames; **J** judged during the sweep; combinations mean both halves.

**Grades:** `FAIL` (Floor) · `REFLEX` (an unanswered Reflex: fix or waive) · `WAIVED` · `WARN` (confirm or dismiss) · `ANSWERED` (a Finish finding with a reason) · `NOTE`. "0 FAIL" stays a true statement about the Floor.

**\*Floor in this panel:** 29 (glow and wash) is Reflex upstream and sloplint grades it `REFLEX`; `rbg-taste` blocks it outright, so here it is never waived. The same holds for 3 (card tells) whenever entire cards are rarity-framed. The owner-approved static 2px outline around item artwork is allowed (2026-10-31); it does not frame the text or card.

**Not in panel scope** (landing-page gates upstream keeps; the stamp's `shape: app screen` makes sloplint skip most of them): 6b's fold half, 8's landing template half, 42 (nav and footer), 44a to 44d (the fold), 56 (stacked sticky), 59 (section gaps), 76's photo-library credit, 83 (the photo wall), 85 (the email close). Retired numbers (5, 13, 14, 21, 31, 35, 36, 43, 45, 51, 52, 57, 60, 61) are never reused.

## 2. Waivers and answers

A Reflex gate is waived in its own comment below the stamp in
`styles/base.css`:

```css
/* Hallmark · waive 7b · paper is pure white because Nike's system and the RBG flat badge's letters both set it so, and ink is #111, not black */
```

Three fields: the gate (by clause: `38iii`, not `38`), the guard evidence,
the reason. The reason is about this panel and shares a word with it; one
under 24 characters, boilerplate, or reused word for word is rejected. A
waiver naming a Floor gate is rejected and the gate fires. A Finish finding
is answered the same way (`answered F3 · …`), a `WARN` dismissed on the
record (`dismissed 54 · the action bar's Ranqueada is persistent chrome …`).

Words that must stay as given are material: a label quoted verbatim from
the screen inventory is not rewritten to pass a copy gate unless the
redesign deliberately renames it (and the handoff says so); its _setting_
changes instead (a price set with a non-breaking space rather than
reworded).

## 3. Pre-emit critique

Before building a screen, score it 1 to 5 on six axes; under 3 revises first.

| Axis            | 3                                       | 5                                                         |
| --------------- | --------------------------------------- | --------------------------------------------------------- |
| **P**hilosophy  | has a tone                              | does one job the player could name after closing it       |
| **H**ierarchy   | needs a second look                     | the hero reads in one second at `shrunk`                  |
| **E**xecution   | two or three loose details              | passes the gates first time, every state                  |
| **S**pecificity | fits any game's profile/shop/ranking    | could only be RBG: fútbol, pixel players, this club world |
| **R**estraint   | one box, glow or accent too many        | lost something you liked                                  |
| **V**ariety     | differs from its neighbours on one axis | shares no skeleton with the tabs beside it                |

Stamp line: `pre-emit critique: P4 H5 E4 S4 R5 V3 · weakest: V, Ranking and Meu Time shared a table skeleton; Meu Time now leads with the club identity`. Name the weakest axis and the fix taken; never invent a weakness.

## 4. The gates

One line each. `a`/`b` clauses share a number and carry their own tier.

### Colour and surface

| Gate | Tier   | Class | The tell                                                                                                                                                                   | The fix                                       |
| ---- | ------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 2a   | Floor  | M     | Purple-to-blue, purple-to-pink, cyan-on-dark or any night/neon gradient anywhere, `background-clip: text` included; the current app's purple wash is the reference failure | flat ink or paper                             |
| 2b   | Reflex | M     | Gradient text, gradient buttons or gradient progress fills in any hue. Guard: a single-hue ramp, both stops tokens, contrast passes                                        | solid ink; weight or size                     |
| 7a   | Floor  | M     | `#000`, `#fff`, pure black or white as a colour outside the token block                                                                                                    | the ink and paper tokens                      |
| 7b   | Reflex | M     | A surface token that is a pure absolute (the expected waiver if paper is `#fff`, SKILL.md § The stamp)                                                                     | ink `#111`-like; paper waived or tinted       |
| 22   | Reflex | M     | Zero-chroma greys beside a committed hue. Guard: Nike's neutral greys, kept neutral on purpose and recorded in `rbg-taste`                                                 | the grey tokens                               |
| 23   | Reflex | M/R   | Pitch green past about 5% of a view (the primary CTA excepted), or green used for anything but live, ready, yours or primary progress                                      | retreat to the one live element               |
| 29   | Floor* | M/J   | Glow and wash: glowing borders, text-shadow halos, a ring of light around an avatar or a rarity card, bloom, a radial spotlight behind the avatar, a vignette              | flat surface; depth by ink/paper steps        |
| 65   | Reflex | M/J   | The named look: cream paper, high-contrast serif, clay accent                                                                                                              | not this panel's material                     |
| 74   | Reflex | M     | A framework's stock swatch (Tailwind indigo-500, slate-900 and kin) as a token                                                                                             | the badge-derived value, in `tokens.css`      |
| 86   | Floor  | J     | Orange or gold as a "premium" accent: gold frames, amber CTAs, golden numbers. Gold exists only as a rank-tier or rarity datum, small, once                                | ink, paper or pitch green; the tier as a chip |

Gate 86 is this panel's house extension, judged only; sloplint does not
emit it.

### Type

| Gate  | Tier   | Class | The tell                                                                                                                                                                                                                                                                                   | The fix                                                         |
| ----- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1     | Reflex | M     | Inter, Roboto or a system face as display. Guard: the display face chosen in `.ai/DECISIONS.md`; Inter as the UI/body fallback `rbg-taste` names                                                                                                                                           | the chosen athletic display face                                |
| 25    | Reflex | M/R   | Running prose outside 45 to 75ch                                                                                                                                                                                                                                                           | `max-width: 60ch`; in a panel, usually fewer words              |
| 37    | Reflex | M     | More than three families. `rbg-taste` sets two; the pixel badge is art, not a family                                                                                                                                                                                                       | display, body, nothing else                                     |
| 38i   | Floor  | M     | One italic word inside a roman heading                                                                                                                                                                                                                                                     | a line break, or the whole head one way                         |
| 38ii  | Reflex | M     | An italic display system (the current app's slanted `JOGAR` is the reference)                                                                                                                                                                                                              | roman display                                                   |
| 38iii | Reflex | M/J   | The accented word: one word in a head set apart by colour, weight, a highlight or an underline. The single green word is this panel's likeliest tell                                                                                                                                       | the whole head one way; green moves to the element that is live |
| 55a   | Floor  | M     | An uppercase display head that can wrap with `line-height` under 1.0                                                                                                                                                                                                                       | 1.0 or more                                                     |
| 55b   | Reflex | M     | A single-line caps lockup under 1.02. Guard: it cannot wrap                                                                                                                                                                                                                                | leave it                                                        |
| 64    | Reflex | M     | Mono as costume: a mono face on labels, stats or captions. This panel has no mono; figures are the display face with tabular numerals                                                                                                                                                      | the display face, `tabular-nums`                                |
| 67    | Floor  | M     | The tracked-caps label inside a screen: a label, caption, tag, chip or status set uppercase _and_ letter-spaced past 0.03em, or in small caps, at 14px or under. Legal: tab labels, the pill CTA, the action bar's context line — shell chrome `rbg-taste` allows, tracking from one token | sentence case inside screens                                    |
| 75    | Reflex | R     | Text that strains: body under 14px, anything essential under 12px, multi-line copy leaded under 1.2, at any supported size                                                                                                                                                                 | `rbg-taste` sizes                                               |

### Structure and layout

| Gate | Tier   | Class | The tell                                                                                                                                                                                                                               | The fix                                                        |
| ---- | ------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 3    | Reflex | M/R   | Card tells: equal tiles of icon-above-heading, an icon in a rounded tile, a thick coloured side stripe (the current Perfil's rank card), every item in its own bordered box                                                            | rows, rules and fields; vary widths                            |
| 4    | Floor  | M     | A card inside a card, a bordered box inside a panel section (mission rows boxed inside a boxed list, a stats box inside an identity box)                                                                                               | one containment layer                                          |
| 6a   | Floor  | M     | Panel layout in `vw`, `vh`, `dvh`, `svh`, or by viewport `@media`, instead of `@container rbg`                                                                                                                                         | container queries; sizes from tokens                           |
| 6b   | Reflex | J     | Title, line, art and action all stacked on one centred axis                                                                                                                                                                            | at most two centred elements; break one alignment              |
| 8    | Reflex | J     | The generated game hub: profile = avatar in a circle + stat tiles, shop = rarity card grid, ranking = striped table with pills; or one skeleton repeated tab after tab                                                                 | build from the tab's job and hero in `rbg-taste`               |
| 9    | Reflex | J     | Every screen climbs the same rung: heading top-left, boxed blocks below, same margins, same border                                                                                                                                     | different seams in different places (`craft.md` § 3)           |
| 24a  | Floor  | M     | A raw `padding`, `margin` or `gap` length where a `--space-*` token exists                                                                                                                                                             | the token                                                      |
| 24b  | Reflex | M     | Off-scale spacing (the 4px grid). Guard: three at most, each an optical nudge                                                                                                                                                          | the scale                                                      |
| 34   | Floor  | M/R   | Horizontal scroll at any supported size; a second scroller besides `.rbg-view` without reason; content under the action bar or clipped by the panel edge; styles on `html`/`body`; a `100vw` width                                     | reflow at the container class; `min-width: 0`; scope to `.rbg` |
| 50   | Floor  | M     | A grid track on bare `1fr`; a display head or player/club name without `overflow-wrap: break-word; min-width: 0`                                                                                                                       | `minmax(0, 1fr)`; `break-word`                                 |
| 58   | Floor  | M/R   | More than about 40 words of prose in a view at once (data rows and control labels excluded), or a view with two competing jobs. House rule                                                                                             | one job; move the rest to a sub-tab or cut                     |
| 71   | Reflex | R     | The crowded head: a head nearer what precedes it than what it heads                                                                                                                                                                    | twice the space above as below                                 |
| 72   | Reflex | R     | The cramped box: text in a filled or bordered field closer than about 12px to its edges (16px for a text block)                                                                                                                        | pad the field, or drop the field                               |
| 77   | Reflex | R/J   | The thin view: a head and a line adrift in the view, or a narrow block with half the view empty and no reason, at regular or wide                                                                                                      | a larger hero, a figure set large, or merge sub-tabs           |
| 78   | Reflex | R     | Screen heads too small: the median `h2` under about 24px at regular                                                                                                                                                                    | the display step `rbg-taste` sets                              |
| 79   | Reflex | R/J   | The dead band: more than about 120px of nothing between the lowest content and the action bar on a top-anchored view at regular                                                                                                        | grow the hero or anchor the composition                        |
| 80   | Reflex | R/J   | The drawn illustration: an SVG or CSS figure of a trophy, ball, shield, kit, stadium, goal or player past icon size. Guard: a diagram of a real system, pitch-line geometry as structure (`texture.md`), the real badge or pixel asset | the pixel asset, type at scale, or nothing (`imagery.md`)      |
| 81   | Reflex | R     | The empty picture: an item slot or a gradient block showing nothing but its wash                                                                                                                                                       | the asset, the name set in type, or cut the slot               |
| 82   | Reflex | R     | The counting device: a row of identical marks standing for a number (pips for 3/3 games, stars for a level)                                                                                                                            | set the number; a bar if progress matters                      |
| 84   | Reflex | J     | The fake product: a built mock of something that exists and could be shown for real (the host app's chrome, the hotel, a real item's art redrawn in CSS)                                                                               | the real asset from `public/assets/`, or nothing               |

### Chrome and copy

| Gate | Tier   | Class | The tell                                                                                                                                                                                                                                                                                             | The fix                                                              |
| ---- | ------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 19   | Floor  | M/J   | Copy tells: placeholder names, hype in English or Portuguese (`craft.md` § 6), the rebuttal cadence ("Não é só um jogo. É uma lenda."), em or en dashes in prose, filler openers, exclamation marks on statements, a stock second action. The linter reads English only; the pt-BR list is judged    | say what happens, in the inventory's own nouns                       |
| 20   | Floor  | M     | The panel stamp missing from the first line of `styles/base.css`                                                                                                                                                                                                                                     | write it                                                             |
| 46a  | Floor  | M/J   | An invented feature, reward, price, rank tier, stat, name, timer or link                                                                                                                                                                                                                             | the inventory's fact, a slot, or nothing                             |
| 46b  | Reflex | J     | A bare figure as a screen's only headline (`49%` with no "aproveitamento")                                                                                                                                                                                                                           | pair it with what it counts                                          |
| 47a  | Floor  | M     | A hand-drawn browser bar (traffic lights, URL pill) or OS window                                                                                                                                                                                                                                     | no chrome                                                            |
| 47b  | Reflex | M     | A phone, laptop, TV or monitor frame around content. Guard: one frame, real content inside                                                                                                                                                                                                           | one frame or none                                                    |
| 47c  | Reflex | J     | Imitation material: a CSS-drawn pitch, net, stadium lights or grass behind the avatar; bevels faking a 3D button; a grid background with nothing under it                                                                                                                                            | a flat field and the real asset, or pitch lines as structure only    |
| 54   | Floor  | M     | The eyebrow inside a screen: short inert type before a heading that announces it — a category tag (`DESAFIOS DIÁRIOS`), a pill, an ordinal, a section label in caps. House rule. Legal: `<th>`, `<label>`, `<time>`, a unit after its figure, a live state, the action bar's persistent context line | fold it into the heading, or let the heading say it (`craft.md` § 7) |
| 63   | Floor  | M/J   | Template punctuation: middle-dot strings (`Platina II · 40 PDL`, `Temporada 1 · termina em 45 dias`), an arrow glued to link text, decorative status dots, `WORD - fragment` labels. House rule. Legal: one dot in a byline                                                                          | columns, line breaks, rules, a second line at a second size          |
| 66   | Reflex | J     | Decoration text: fake season codes, version badges, `LIVE` tags on nothing live, a `#12` that identifies nothing, a `NOVO` badge with no new thing behind it                                                                                                                                         | delete it; a real fact becomes a caption                             |
| 68   | Reflex | M     | The wireframe screen: four or more empty frames in a row (blank item boxes, blank avatars)                                                                                                                                                                                                           | the real assets, or set the names in type                            |
| 69   | Reflex | J     | The echo: one fact printed in four or more places at once (the battle-pass banner on every tab), or a screen's last line restating its head                                                                                                                                                          | say it once, where it works                                          |
| 70   | Floor  | M/J   | The fake send: a control that prints success (`Cor salva`, `Comprado!`, `Recompensa resgatada`) with nothing behind it                                                                                                                                                                               | no success state until the mock state actually changes               |

### Motion and interaction

| Gate | Tier   | Class | The tell                                                                                                                                    | The fix                                                      |
| ---- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 10a  | Floor  | M     | `transition: all`; animating `width`, `height`, `top` or `left` (a progress bar grown by `width` included)                                  | `transform: scaleX()` and `opacity`                          |
| 10b  | Reflex | M     | Transitioning `margin` or `padding`                                                                                                         | `transform`                                                  |
| 11   | Reflex | M/J   | Hover as decoration: the same lift on every card, an item scaling on hover, a shadow appearing, hover on something not interactive          | Nike's hover: an opacity or ink/paper step, on controls only |
| 12   | Reflex | M     | Bounce or overshoot easing on state                                                                                                         | exponential ease-out                                         |
| 15   | Floor  | M     | A focus ring that fades in                                                                                                                  | instant                                                      |
| 18   | Floor  | M     | An endless loop (shimmer on a CTA, a pulsing badge, a spinning ray behind a reward) with no reduced-motion stop and no pause past 5 seconds | none; the `motion` skill's one stoppable loop if ever        |
| 26a  | Floor  | M/R   | A link or control with no `:focus-visible`, a ring under 3:1, an outline removed with nothing in its place                                  | a ring at 3:1, instant                                       |
| 27   | Floor  | M     | A keyframe or transform transition without a `prefers-reduced-motion: reduce` fallback                                                      | add it                                                       |
| 28a  | Floor  | M     | A video autoplaying without `muted`                                                                                                         | `autoplay muted loop playsinline`                            |
| 53   | Reflex | M     | Tabs built from CSS radio hacks instead of the shell's real `role=tab` buttons                                                              | the shell tablist (`panel-builder`)                          |
| 62   | Floor  | M     | Content hidden at rest that only script reveals, so a state is blank when its effect fails                                                  | visible by default; animate from a script-set class          |
| —    | Floor  | J     | Flashing faster than 3 times a second (WCAG 2.3.1), reward bursts included                                                                  | slower, smaller, or a single change                          |

### Assets and access

| Gate | Tier   | Class | The tell                                                                                                        | The fix                                      |
| ---- | ------ | ----- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 30a  | Floor  | M     | An emoji or Unicode glyph (`🎉 👑 ✓ ↗ ← « ›`) standing in for an icon or for item art                           | an SVG from one set, the real asset, or type |
| 30b  | Reflex | M     | Two icon sets in one panel, or mixed strokes                                                                    | one set, 1.5–2px stroke (`rbg-taste`)        |
| 33   | Floor  | M     | A decorative `<svg>` or `<canvas>` with neither `aria-hidden="true"` nor a label                                | hide it or name it                           |
| 76   | Floor  | M/R   | A broken image: no source, a file that does not load, a hotlinked remote image (nothing loads from other hosts) | the file in `public/assets/`                 |
| 73   | Floor  | R     | Text painted over a sprite, an item or another element                                                          | its own field beside or under the art        |
| 40   | Floor  | M/R   | Text, icon or ring under contrast against its computed background, measured over the art behind it              | fix the pair                                 |
| 41   | Floor  | M/R   | Text on a green fill without its paired ink token; grey text on a coloured field; text on a rarity colour       | the paired ink token                         |
| 48   | Floor  | M     | A colour or `font-family` literal outside `tokens.css`                                                          | lift it into the tokens                      |
| 49a  | Floor  | M/R   | A link, tab or control label wrapping at any supported size                                                     | shorten it; reflow the tablist at compact    |
| 32   | Ledger | J     | Two tabs sharing composition, hero type and opening move                                                        | change one; say the delta in the Picks line  |

## 5. Finish checks and judged clauses

### Finish (F-checks, never block)

F1 straight quotes in copy · F2 `...` for an ellipsis · F3 no `text-wrap: balance` on display heads · F4 two filled buttons side by side (two pill CTAs in one view) · F5 an icon in a coloured coin · F6 stats, prices, times and positions without tabular numerals · F11 an underline thicker than 2px or offset past 0.25em · F12 a flex row of unequal heights without `align-items` · F13 the display face carrying body text · F16 no `::selection` colour on a panel with a committed palette · F17 a text block squeezed into a sliver at compact · F19 more than three weights in running use · F20 one item alone on a grid's last row (the shop shelf) · F21 a heading level skipped · F22 justified text · F23 no `lang="pt-BR"` or title on the panel · F24 a hairline border under a wide soft shadow · F26 a paragraph or head ending on one stranded word.

### Judged clauses

**6b, the centred stack.** Perfil built around the avatar is a composition; avatar, name, rank, stats and CTA all on the centre line is a default.

**8, 9 and 32, the generated hub.** Open every tab in order with the words blurred. If each one is a heading top-left over a grid of bordered boxes, the panel is the template however good each box is. Each screen's composition comes from its job and hero in `rbg-taste`, not from the previous tab.

**23, green.** Green marks what is live, ready, yours or primary progress. Count the green in a view: more than one live thing means nothing is live.

**29, glow.** The halo is the tell whether drawn with `box-shadow`, `text-shadow`, a filter or a gradient. Depth comes from ink/paper steps and hairlines; rarity is a datum, not a light source.

**38iii, the accented word.** "Entre em **campo**" with the last word in green is the most common machine-made head after the eyebrow. A head is one weight, one style and one colour.

**46a, facts.** Every string on screen is in `docs/screen-inventory.md`, or it is a slot (`craft.md` § 8). A price, reward, tier, timer or count that is not there is invented, however plausible.

**54, the eyebrow test.** Delete the small line above the heading and read the screen: if nothing was lost but a name for what comes next, it was an eyebrow. `DESAFIOS DIÁRIOS` over `Missões do clube` is the current app's signature eyebrow; the heading can carry it (`Missões diárias do clube`) or the sub-tab already says it.

**58, the word budget.** A player opens the panel between matches. One job, the fewest words that carry it; explanations live behind a help affordance or nowhere.

**63, punctuation.** The middle dot as a universal separator (the current app uses it in every meta line), the arrow as a universal suffix and the coloured dot as a universal prefix are the punctuation of generated UI.

**66, decoration text.** A badge, tag or code is wayfinding when it says something true and current about this screen; when it locates nothing, it is costume.

**77 to 79, a full view.** The failure is small things in a large view. The fix is mass: a bigger hero (the avatar, the rank figure), never more boxes.

**80 and 84, pictures.** The pixel world has the art; draw nothing it already has. A CSS stadium behind the avatar reads as generated at a glance.

## 6. The reviews, in fresh context

The thread that built the screen is its weakest reviewer. Two reviews run
with no inherited transcript: the **first-screen review** once, on Perfil's
default state before the other tabs exist, and the **finish review** after
the sweep. Start a subagent with _Read
`.agents/skills/hallmark/references/review-first.md` (or
`review-finish.md`) and follow it_ and pass only paths and quoted lines:
for the first screen, its walkthrough frames at every host size, the
stamp's first two lines and the Picks line's material and signature; for
the finish, the walkthrough frames (every tab × sub × state, every host
project), the screen sources, the stamp, `rbg-taste`'s intent map and § 4
of this file. The `screen-critic` agent is the finish reviewer when it is
available. Run it in the foreground and act on its first word.

`recapture` means the frames were wrong: retake them and review again.
Otherwise fix what is real, recapture, and score each finding yourself:
`resolved`, `partial` or `unresolved`, with a reason. Send recaptures back
for one scoring round only when the first word was `rebuild` or a finding
named a Floor gate.

**Nothing ships with an open `FAIL` or an open `REFLEX`.**
