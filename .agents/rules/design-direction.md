# Rule: design-direction

Every visual decision on the RBG panel serves one art direction —
**premium and sporty**, Nike's discipline applied to a fútbol game hub that
lives inside a pixel-art host. Four pillars, in this order of authority:

1. **RBG badges** — the brand: the flat badge (white "RBG" on black, white
   outline, green laurel, pitch green) and the pixel badge (pixel letters,
   ball, laurel). They define the palette: ink, paper, greys and **one pitch
   green**.
2. **Nike discipline** — the craft: monochrome chrome, flat surfaces,
   hairlines, one pill CTA, few confident type sizes, 4 px grid, imagery
   first.
3. **Fútbol culture** — the content's voice: scoreboard numerals, kit
   numbers, pitch-line geometry, matchday copy.
4. **Pixel art as photography** — avatars, items and the pixel badge carry
   all the color and personality; the UI around them stays quiet.

The full direction — palette and type roles, Nike adaptation table, tab
intent map, do/don't — lives in [`rbg-taste`](../skills/rbg-taste/SKILL.md)
and the creative brief ([`docs/creative-brief.md`](../../docs/creative-brief.md)).
This rule sets the boundaries; that skill holds the detail.

Owner-approved semantic red (`--danger`) marks negative outcomes, negative statistics, and danger actions. It supplements pitch green for success; it is not a decorative brand accent.

## Sources of truth

- **Brand:** the two RBG badges in `public/assets/brand/`. Use them as
  delivered; never redraw, recolor, trace or AI-generate a brand mark.
- **Craft reference:** the Nike system summarized in
  [`rbg-taste/references/nike.md`](../skills/rbg-taste/references/nike.md).
  Nike is a reference for discipline, not a brand to copy — no swoosh,
  Futura ND or Nike copy.
- **Features and facts:** [`docs/screen-inventory.md`](../../docs/screen-inventory.md),
  transcribed from the current app. Raw captures in `reference/current-app/`
  stay local and are excluded from the remote. The redesign may restructure,
  merge, regroup and demote — it may **never
  invent** a feature, reward, currency, price, rank tier, stat or name. If
  something is missing, leave a visible placeholder and ask the owner.
- **The current UI is not a style source.** Its purple gradients, orange
  glows, emoji items and boxed layouts are what we are replacing.

## No AI-slop

The panel must not read as AI-generated or as a generic "gamer UI". Before a
screen counts as done, it passes [`hallmark`](../skills/hallmark/SKILL.md)'s
checks and `rbg-taste`'s anti-slop bar — no neon/purple gradients, no glow,
no gold "premium" accents, no card grids standing in for composition, no
card-in-card, no emoji as icons or items, no filler copy, no decorative
motion, no esports clichés.

The owner-approved rarity exception is one static 2px rounded outline around
item artwork plus a neutral text label (2026-10-31; replaces the bottom
strip). It marks confirmed rarity, never paid access or state; unknown
rarity stays neutral. Full-card rarity frames, tinted
product surfaces and glow remain excluded.

## Where to route

| Need                                         | Go to                                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Art direction for a screen                   | [`rbg-taste`](../skills/rbg-taste/SKILL.md)                                                           |
| Anti-slop gate on design and copy            | [`hallmark`](../skills/hallmark/SKILL.md)                                                             |
| Shell, screen contract, states, data         | [`panel-builder`](../skills/panel-builder/SKILL.md)                                                   |
| Living inside the host app                   | [`panel-embedding`](panel-embedding.md)                                                               |
| An unanchored critique of the rendered panel | the shared `screen-critic` reviewer (`.agents/reviewers/screen-critic.md`), or `mody:studio` critique |
| UX principle behind a layout or flow choice  | `mody:ux-laws`                                                                                        |
| Stress-test a plan before building it        | `mody:roaster`                                                                                        |

**Why:** players open the panel dozens of times a day inside a busy pixel
world. A generic, glowing game UI blends into noise and feels cheap; a
quiet, confident, sporty one makes the pixel art and the player's progress
the stars. Invented features would also mislead the owner about what the
product actually does.

**Enforcement (manual for now):** [`ui-frontend-best-practices`](ui-frontend-best-practices.md)
routes every visual task through `rbg-taste` and `hallmark`;
`review-rangers` has a taste lens; `screen-critic` reviews rendered frames
with a fresh context. No automated check verifies taste.
