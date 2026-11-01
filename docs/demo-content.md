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

- The owner approved original generated football pixel art on 2026-10-31,
  replacing the earlier CC0 character/coach stand-ins and temporary item and
  club compositions. The built-in image tool produced the replacement art;
  no third-party license is asserted for these generated illustrations.
- Eight human footballers have consistent front, right, back and left views.
  Ranking portraits are extracted from their front views. Equipment, poses,
  celebrations, entrances, VS presentations, profile collectibles, fictional
  club crests and the coach share the football-world direction.
- [Generation prompts and export notes](football-art-prompts.md) record the
  reference, provenance, exact prompts and mechanical sprite extraction.
  These are illustrative fixtures, not official game assets or final designs.

All assets are stored under `public/assets/`, with nearest-neighbor pixel
rendering. Existing RBG/RCS branding is preserved. No CDN, API, or remote image is
loaded at runtime. Replace the local paths with final game artwork when supplied.

## Profile customization

The owner-requested demo equips three banners (Gramado, Estádio, Noite) and three cards (Prata, Ouro, Lenda) through the owned-item picker. These are synthetic owned fixtures, using existing local artwork and inventory names. Card Lenda uses a distinct demo skin to make switching visible; the art is not a verified final product design. Only confirmed rarity is shown. Equipment stays in memory for the current session.
