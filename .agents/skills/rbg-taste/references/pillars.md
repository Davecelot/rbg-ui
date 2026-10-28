# Pillars — sources and do/don't

Sources: the two RBG badges (`public/assets/brand/`), the Nike system
([nike.md](nike.md)) and the current app (`reference/current-app/`, mapped in
[`docs/screen-inventory.md`](../../../../docs/screen-inventory.md)). Look at
the badges and the relevant screenshots before deciding anything visual —
this file summarizes, the sources decide.

## RBG badges

Two variants: a **flat badge** (white "RBG" on a black rounded square with a
white outline, green laurel underneath, on pitch green) and a **pixel
badge** (mint/white pixel letters with a dark outline, a ball, the green
laurel).

- **Do:** derive the palette from them — ink, paper, pitch green, laurel
  green; use the flat badge in the header at small sizes and the pixel badge
  where the pixel world speaks (rank-up, rewards, empty states); keep the
  laurel as a meaning ("earned"), used only on achievement moments.
- **Don't:** recolor, outline, glow or animate-distort the badges; rebuild
  them in CSS; scale the pixel badge by non-integer factors; repeat the
  laurel as a pattern.

## Nike discipline

- **Do:** monochrome chrome; one pill CTA style per view; hairlines and
  whitespace instead of boxes and shadows; imagery (here: pixel art) given
  the room; confident, few type sizes; 4 px grid; quiet nav.
- **Don't:** import Nike's brand (swoosh, Futura ND, product photography,
  slogans); go so minimal that game state (progress, live, locked) gets
  lost — game UI needs state, Nike's restraint decides how it's shown.

## Fútbol culture

- **Do:** scoreboard numerals (tabular, condensed, big) for rank, score, XP,
  level, price; kit-number styling for player identity; pitch-line geometry
  (center circle, box lines) as structural rules sparingly; matchday rhythm
  in copy (`Entre em campo`, short and direct pt-BR).
- **Don't:** clip-art balls, trophies, flames; fake broadcast tickers;
  grass textures; stadium photos; English sports slang in pt-BR UI.

## Pixel art as photography

- **Do:** treat avatars/items as the product shots — large, centered or
  bleed-to-edge of their field, on a flat ink or paper ground, integer
  scaled; let them provide the color.
- **Don't:** pixel fonts for UI text; pixel borders, dithers or scanlines
  on chrome; framing every avatar in a glowing ring; cropping pixel art
  mid-sprite.
