# Texture: a near-zero budget

Loaded before any pattern, line art, fill or overlay that is not a flat
token. The direction is Nike-flat: surfaces are ink or paper, separated by
hairlines and whitespace. The pixel art already carries all the texture
the panel needs. Texture here is a rare structural device, never ambience;
grain, noise or scanlines smeared over a screen because it felt flat is the
tic this file refuses.

## The budget (binds every artifact)

- **One device per screen at most,** and most screens have none.
- **Structural, not atmospheric:** it must organise something on the screen (divide, frame, mark a zone), not decorate a background.
- **Tokened:** stroke colour from the hairline/grey tokens, 1px, opacity only through a token.
- **Never** under text at a contrast that changes (40), never on a sprite, the badges or an item, never animated.
- **`pointer-events: none` and `aria-hidden="true"`** on any overlay; CSS or inline SVG, no image requests.

## 1 · Pitch-line geometry (the one allowed device)

The lines of a fútbol pitch — the halfway line, the centre circle, the box,
the penalty arc — drawn as 1px hairlines, used **as layout structure**: the
halfway line as the divider of a split, the centre circle behind a hero
figure at low weight, the box outlining the avatar's field in Vestiário.
One per screen, never a full pitch diagram as wallpaper, never with grass
colour, stripes or shading (47c).

## 2 · Pixel material

Dither, pixel edges and chunky outlines belong **inside pixel assets
only**. Never on chrome: no pixel borders on buttons, no dithered
backgrounds, no pixel font on UI text (`rbg-taste` pillars).

## Never

Grain, noise, scanlines, halftone, carbon fibre, hex meshes, stadium-light
flares, glow or bloom as texture (29); a gradient pretending to be a
surface (2a); two devices on one screen; texture as a fix for a screen
that has no hero.
