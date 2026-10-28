# Imagery

What a screen shows. A screen looks made when it shows the real thing (the
player's pixel avatar, the item's art, the badge, the real number) and
generated when it shows a gradient box, an emoji where an item should be,
or a CSS stadium behind a sprite.

## 1. What fills a screen

In order, the first that fits:

1. **Pixel art as photography:** the avatar, kits, chuteiras, items, celebrations and the pixel badge, from `public/assets/` (`panel-builder` assets reference). They win every slot and carry the panel's colour (`rbg-taste`).
2. **The RBG badges** in `public/assets/brand/`, as delivered (`brand-truth.md`).
3. **Type at full scale,** when the screen is about a number, a name or a state (rank, position, level, price).
4. **A labelled placeholder** (`[avatar]`, `[item]`) when the asset does not exist yet — never a stand-in drawing.

Generated images, stock photographs and illustration packs are not
sources. Nothing is hotlinked: the panel loads nothing from other hosts
(76, `panel-embedding`).

## 2. Assets

- Every asset comes from the owner or the host's own sprites the owner supplies, recorded in `panel-builder`'s `references/assets.md`; never a file guessed from memory or a URL, never cropped out of `reference/current-app/` screenshots.
- Pixel art scales by **integers only** with `image-rendering: pixelated`; `width` and `height` attributes on every `<img>` at the scaled size.
- Never crop a sprite mid-figure; frame with `object-fit: contain` on a flat field.
- Avatars and items get a pt-BR `alt` (the player's name, the item's name); purely decorative art `alt=""` (`panel-builder`).

## 3. Slots

A slot is a picture a human will supply: `data-slot="<name>"`, `data-alt`,
and a real size. A slot always shows something: the asset, or the name set
in type with the `[placeholder]` treatment. A slot showing only its wash is
an empty picture (81); four empty item frames in a row are a wireframe
(68).

## 4. The host

The panel lives over the host's pixel hotel. Never imitate the host's
chrome or scene inside the panel (84); the host simulator in `index.html`
is a dev backdrop, not design material.

## 5. Placing and treating art

- **Big or not at all.** The hero sprite takes the largest integer scale that fits its field at each container class; a sprite at icon size next to a wall of text reads as clip art. Delete it in your head: if the screen still says the same thing, it is too small or in the wrong place.
- **One subject a field,** on a flat ink or paper ground; no podium, ring, spotlight, glow or vignette under it (29).
- **Text never over a sprite** (73); names and stats sit beside or under, on their own field.
- **Rarity and tier** may tint a thin edge or a chip next to the art, once, small (86); never a glowing frame around it.

## 6. Never

- **A drawn illustration** (80): an SVG or CSS trophy, ball, shield, net, goal, kit, stadium or player past icon size. SVG is for icons from one set and diagrams of a real system.
- **Emoji as item art** (30a): `🎉 👑` standing in for a celebration or a crown is the current shop's reference failure.
- **An empty picture** (81) or **a counting device** (82).
- Illustration packs, 3D renders, blobs, mascots, Lottie characters, AI-generated sprites.

## 7. Icons, logos, video

- **Icons:** one outline set — Material Symbols Outlined from `src/screens/icons.js` (DECISIONS 2026-10-27) — 1.5–2px stroke, 16–20px, `currentColor`, aligned to the first line of text, never in a coloured coin (F5), never an emoji or Unicode glyph (30a).
- **Logos:** the RBG badges as delivered; no partner wall, no invented sponsor marks (46a).
- **Video:** a local file, `autoplay muted loop playsinline` with a `poster`, stopped under reduced motion (28a, 18) — and only if the inventory has one.
