# Nike system — reference and how RBG bends it

Captured 2026-10-26 from the Refero style page
<https://styles.refero.design/style/d7ace114-0548-41f5-a2ff-2afbf32be94d>
(a summary in our own words, not a copy). Nike is the **craft reference**,
not a brand to imitate.

## What Nike does

| Area     | Nike                                                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Color    | Monochrome only: #111111 ink, #ffffff paper, #f5f5f5 soft fill, #e5e5e5 hairline, #707072 / #9e9ea0 greys. No accent in the UI — photography carries color.                          |
| Type     | Helvetica Now Text 400/500 for UI and body; Helvetica Now Display 500 for 20–24 px headings; Futura ND 500 for hero headlines only (≈76 px, line-height 1). Scale 12/14/16/20/24/76. |
| Spacing  | 4 px base, compact density; scale 4/8/12/16/20/24/36/48; 48 px between sections.                                                                                                     |
| Radius   | Pills (30 px) for buttons and tags, 24 px for search; 0 for cards, images and inputs.                                                                                                |
| Surfaces | Flat. No shadows. Depth from alternating dark/light sections, hairlines and whitespace.                                                                                              |
| Buttons  | One pill style: ink fill + white text, or white fill + ink text on dark. Hover = opacity only.                                                                                       |
| Icons    | Outline, 1.5–2 px stroke, 16–20 px, ink or grey. No filled or multicolor icons. RBG uses Material Symbols Outlined (`src/screens/icons.js`).                                         |
| Imagery  | Full-bleed, high-contrast product photography, sharp corners, no frames, minimal overlay text.                                                                                       |
| Nav      | Transparent, no shadow, no blur; centered category links.                                                                                                                            |

## How RBG bends it (a game hub needs state)

| Nike rule                        | RBG                                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No accent color                  | **One** accent: pitch green from the badge laurel, only for state (live, ready, yours, progress) and the primary CTA when ink/paper won't do.                                                       |
| Photography carries color        | **Pixel art** carries color: avatars, items, kits, the pixel badge.                                                                                                                                 |
| Futura hero headlines            | Archivo condensed (62% width, 800) for headlines and **scoreboard numbers**; Archivo normal for UI.                                                                                                 |
| No uppercase, no tracking        | Kept as is: tabs, CTA and labels are sentence case; emphasis by size and weight.                                                                                                                    |
| Weights 400/500 only             | Same for text; the display face may go heavier at display sizes only.                                                                                                                               |
| No badges/accents on links/icons | Rank tiers and rarity may color a small chip or medal; item rarity may instead use one static 2px rounded artwork outline with a neutral label (owner-approved, 2026-10-31) — data, not decoration. |
| Big editorial sections           | Small panel: hierarchy through size and space, one hero per view, no 48 px gaps at compact sizes.                                                                                                   |
| Pill buttons, square cards       | Pills for buttons and compact labels; owner-approved 16px surfaces and 8px controls (2026-10-31), per rbg-taste.                                                                                    |
| No shadows, flat surfaces        | Kept as is — including on the action bar and on hover.                                                                                                                                              |
