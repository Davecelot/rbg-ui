# Populated demo fixtures

Fictional content and temporary art exercise every screen on first load. These fixtures are examples, not verified product facts. Captured account values and raw screenshots are excluded from this repository snapshot.

## Synthetic demo data

The existing `src/data/` modules provide deterministic examples without network
requests or a demo switch. They reset on reload. Ranking uses fictional player examples across multiple pages and fictional clubs.
Profile and ranking share the signed-in player; club identity and progress share
one club object. RCS uses five clubs, six played matches, and four remaining
fixtures. Its standings, scoring totals, and TOPs
are derived from those results. Earlier editions are fictional examples.

The pass has all 50 levels with owned/free, claimed, next, and locked examples.
Uncaptured reward names and progress are demonstration values. Temporary shop
art illustrates item categories rather than promising the item's final design.

Explicit `?state=empty`, `?state=pending`, and `?state=locked` URLs retain the
previous alternate screens where supported. First-load defaults are populated.
Purchases, gifting, redemption, and RCS matchmaking remain prototype actions.

## Art sources

- [Bennyboi_hack, Basic 16x16 character sprites, 4 directional](https://opengameart.org/content/basic-16x16-character-sprites-4-directional),
  CC0. Standing front/back/side frames and raised-arm poses were extracted;
  magenta was made transparent. Clothing colors vary by fixture. Head crops
  supply the ranking portraits. Frame selection uses existing avatar rotation.
- [Kenney, Roguelike Characters](https://kenney.nl/assets/roguelike-characters),
  CC0. Civilian sprite used for the coach. The supplied license is retained at
  `public/assets/demo/kenney-license.txt`.
- Club crests, kits, boots, banners, frames, cards, and title plaques are original
  temporary raster compositions. Pose and celebration previews use the CC0
  character poses. They are fixtures, not RBG branding or final game artwork.

All assets are stored under `public/assets/`, with nearest-neighbor integer
scaling. Existing RBG/RCS branding is preserved. No CDN, API, or remote image is
loaded at runtime. Replace the local paths with final game artwork when supplied.
