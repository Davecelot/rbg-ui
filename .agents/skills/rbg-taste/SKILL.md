---
name: rbg-taste
description: >
  Art direction for the RBG panel: premium and sporty, Nike's discipline
  applied to a fútbol game hub that lives inside a pixel-art host. The four
  pillars (RBG badges, Nike craft, fútbol culture, pixel art as photography),
  how they combine without sliding into generic "gamer UI", palette and type
  roles, the scoreboard number style, pixel-art framing, density rules for a
  small panel, motion character, the per-tab intent map, and the anti-slop
  bar every screen is judged against.
  Trigger: any visual or copy decision on a screen — composing, restyling,
  choosing color/type/imagery/motion, "make it look better", "more
  premium/sporty/Nike", "too generic", "looks AI-made", or before handing
  frames to screen-critic.
metadata:
  author: davecelot
  version: '1.1.0'
  changelog: >
    1.1.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.0.0: Initial skill for rbg-ui, adapted from ppt-make-a-thon's
    deck-taste. Sources: the two RBG badges, the Nike DESIGN.md
    (references/nike.md) and the current app's screenshots.
  auto-invoke: 'Any visual, layout, motion-character or copy-tone decision on a screen'
  allowed-tools: [Read, Grep, Glob]
---

# RBG taste — "Matchday, quiet luxury"

RBG should feel like **a premium sports brand's matchday app that happens
to live inside a pixel hotel**: flat, monochrome, confident type, big
numbers, one green that means "on the pitch / live / yours", and the pixel
art — avatars, items, the badge — as the only colorful imagery. Tension =
_Nike-clean chrome × chunky pixel culture_. Neither side decorates the
other.

Read [`docs/creative-brief.md`](../../../docs/creative-brief.md) for who plays
and why, [references/pillars.md](references/pillars.md) for each pillar's
do/don't, and [references/nike.md](references/nike.md) for the Nike system
and how we bend it. Features and facts come only from
[`docs/screen-inventory.md`](../../../docs/screen-inventory.md).

## The four pillars — what each one may contribute

| Pillar                       | Contributes                                                                                                     | Never                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **RBG badges**               | Black/white/pitch-green palette; the laurel as the one ornament (rank/reward moments); the pixel badge's voice. | Redrawn or recolored logos; laurels sprinkled as decoration; the badge as wallpaper.   |
| **Nike discipline**          | Monochrome chrome, flat surfaces, hairlines, pill CTA, 4 px grid, imagery-first, confident display type.        | Copying Nike branding (swoosh, Futura ND, "Just Do It" voice); shadows; extra accents. |
| **Fútbol culture**           | Scoreboard/broadcast numerals, kit numbers, pitch-line geometry as structure, matchday language and rhythm.     | Clip-art balls, trophies and flames; stadium photos; fake commentary copy.             |
| **Pixel art as photography** | Avatars, items, kits and the pixel badge carry all the color and personality — shown big, crisp, uncropped.     | Pixel fonts for UI text; pixel borders on chrome; blurry (non-integer) scaling.        |

One screen = **one hero**: the avatar, a number, or the next action. The
rest steps back.

## System

- **Palette roles** (values in `styles/tokens.css`): `ink` (near-black) and
  `paper` (white) as the two surfaces — the panel may be dark or light, but
  one mode per surface, separated by hairlines, not shadows; three greys for
  metadata, hairlines and disabled; **pitch green** (from the badge laurel)
  as the brand signal — live, ready, yours, primary progress, the main CTA
  when not ink/paper. Rank-tier and rarity colors exist **only as data**
  (a tier chip, a medal, or one static 4px rarity strip at an artwork edge),
  never as full frames, glows or backgrounds. The strip has a neutral text
  rarity label; paid access uses ink/paper contrast, not a rarity color.
- **Negative state exception** (owner-approved, 2026-10-28): `--danger` red marks defeats, abandonment, lost PDL, negative statistics, and danger actions. Paired wins use pitch green; draws and zero deltas stay neutral. Keep labels and signs; never tint entire rows or use red as decoration.
- **Type**: **Archivo**, one self-hosted variable family (DECISIONS). The
  **display** cut — `--display-stretch: 62%`, `--display-weight: 800` — sets
  headlines and **numbers** (rank, score, XP, level, price); the normal
  width at 400/500 sets UI and body. Never mix in a second family. Tabular figures for every stat. Big jumps:
  hero number ≥ 2.5× body. Body ≥ 14 px at the smallest panel; nothing
  essential under 12 px.
- **No uppercase.** Tabs, the CTA, the action bar's context line and every
  label are sentence case and untracked, as Nike's nav and buttons are
  (hallmark gate 67 enforces it). Emphasis comes from size and weight.
- **Grid & density**: 4 px base, spacing scale from tokens. Small panel ⇒
  fewer, larger things: one primary list or one hero per view; tables over
  card mosaics for ranked data.
- **Surfaces**: flat. Hairlines and whitespace separate; radius only for
  pills (CTA, tags, segmented controls) and avatar frames if any. No card
  inside a card. No shadows, no glass, no gradients behind text.
- **Pixel art**: integer scaling only (`image-rendering: pixelated`), on a
  plain field, never under a filter, glow or vignette.

## Motion character

Motion is **athletic: fast, decisive, no wobble**. It confirms an action,
shows progress or celebrates a real reward — nothing loops for decoration.
Tab switches near-instant (≤ 180 ms); progress fills and count-ups ≤ 600 ms
with `--ease-out`; one celebratory moment (rank up, reward claimed) may be
bigger but stays under 1 s and has a reduced-motion alternative. Build with
the `motion` skill.

## Tab intent map

| Tab              | The player comes here to…                          | Hero                                            |
| ---------------- | -------------------------------------------------- | ----------------------------------------------- |
| Perfil           | See who they are and how they're doing             | Avatar + rank + one headline stat               |
| Vestiário        | Dress the avatar for the next match                | The avatar, big, on a plain field               |
| Meu Time         | Run their club: squad, identity, missions, history | Club identity + roster                          |
| Jogar            | Pick a mode and get into a match fast              | The mode choice + the CTA                       |
| Ranking          | Know where they stand                              | The table — position numbers, tiers             |
| RCS Week         | Join and follow the weekly competition             | Edition status + the call to enrol              |
| Passe de Batalha | See the season goal, progress and the next unlock  | Final reward, with level + next reward adjacent |
| Loja             | Browse today's items and buy                       | The item art + price                            |

Confirm every row against `docs/screen-inventory.md`; the inventory wins.

## Anti-slop bar (block on any of these)

- Purple/neon night gradients, glow borders, bloom, lens flares, vignettes.
- Gold/orange "premium" accents, rainbow rarity frames, `LENDÁRIA` chips
  everywhere — rarity is data, shown once, small.
- Card grids standing in for composition; card-in-card; every element boxed.
- Emoji or Unicode glyphs as icons or item art (`🎉 👑 → ✓ ↗`) — use inline
  SVG from Material Symbols Outlined (the one set, see DECISIONS) or show the
  real pixel asset.
- More than one CTA style per view; more than one accent per view.
- Drop shadows, glassmorphism, 3D/skeuomorphic buttons, beveled chips.
- Invented features, rewards, stats or copy; lorem; placeholder text that
  could ship.
- Text over busy art without a solid field; anything under AA contrast.
- Generic esports clichés: angled slashes everywhere, hexagon frames,
  "GG"/"EPIC" copy, flames and lightning.
- Every tab using the same layout.

Run [`hallmark`](../hallmark/SKILL.md) for the detailed anti-AI-slop pass,
and `mody:studio critique` or the `screen-critic` agent for an unanchored
review of rendered frames. Use `mody:ux-laws` to justify a hierarchy call
and `mody:roaster` to stress-test a direction before building it.
