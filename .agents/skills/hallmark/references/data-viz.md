# Data viz: figures that read as set, not generated

Loaded when a screen shows a stat, a record, a rank, progress, a timer or a
comparison. A game panel is full of numbers; the made version picks the
one that matters per view, sets it large, and lets the rest sit quietly in
rows.

## Form first

| The data is                                | The form is                                                                              |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| one value (rank, win rate, level)          | the figure at graphic scale with what it counts (46b), never a one-bar chart or a gauge  |
| a record (V/D/E, gols, assistências)       | a row of figures parted by hairlines, each with its label under it; no tile per stat     |
| progress toward a goal (XP, missions, PDL) | a flat bar with the current and target figures (`455 / 860 XP`); never a ring or a donut |
| a sequence (pass levels, rank tiers)       | a track of steps with the current one marked (`layout.md` § 5)                           |
| a ranked list                              | a table: position, name, tier, stats (`craft.md` § 9)                                    |
| a countdown                                | the time as text with tabular numerals (`19 h 47 min`), no animated clock                |
| parts of a whole                           | a stacked horizontal bar; never a pie, a donut or a gauge                                |

The most underused form is emphasis: the player's own figure or row in
green because it is theirs, everything else in grey.

## Construction (HTML/CSS or inline SVG written for the data, no chart library)

- **Bars:** flat fill, one colour, no gradient (2b), no glow; the track a hairline-weight grey field; animated with `transform: scaleX()` (10a), never `width`.
- **Use semantics:** `<progress>` or `role="progressbar"` with `aria-valuenow/min/max` and a text equivalent (`a11y-checker`).
- **Gridlines:** 1px grey, three to five at most, only if a chart exists at all.
- **Labels** in the body face, the figure in the display face with tabular numerals (F6), never dyed in a rarity or tier colour.
- **No shadows, no 3D, no gradients in marks, no glow.**

## Honesty (46a binds here hardest)

- Only figures the inventory shows or `src/data/` draws from it, each with its unit and what it counts. A fabricated stat is worse than an empty slot.
- Bars start at zero; progress reflects the real ratio, not a flattering one.
- A count-up counts to the real value and holds it; the markup holds the final value, so it reads with the effect skipped (62).
- Win/loss never by colour alone: V, D, E or the word goes with it.

## The anti-dashboard

No KPI wall, no gauges, no confetti of stat tiles with icons and trend
arrows nobody measured — the current Perfil's "identity" box is the
reference failure. One figure, set large, that the player can repeat;
the rest in a quiet row.
