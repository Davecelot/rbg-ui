# Assets

Everything the panel shows ships from `public/` and is served from `/…`.
Nothing loads from another host (see `panel-embedding` and
`security-guardian`).

| Path                                      | What                                                                                                                            | Status                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `public/assets/brand/rbg-badge.png`       | Flat RBG badge — white "RBG" on black, green laurel.                                                                            | Pending — owner to add                          |
| `public/assets/brand/rbg-badge-pixel.png` | Pixel-art RBG badge — pixel letters, ball, laurel.                                                                              | Pending — owner to add                          |
| `public/assets/brand/rcs-logo.png`        | RCS (Rebug Champions Series) logo — 254×240 crop from a screenshot, the only copy that exists.                                  | Placeholder quality — use as is or leave a slot |
| `public/fonts/archivo-latin(-ext).woff2`  | Archivo variable (`wdth` 62–125, `wght` 400–800), declared as `'RBG Archivo'` in `styles/fonts.css`; licence `archivo-OFL.txt`. | In use                                          |
| `public/assets/avatars/`                  | Pixel avatars for mock data.                                                                                                    | Empty                                           |
| `public/assets/items/`                    | Item / reward art for the shop and the battle pass.                                                                             | Empty                                           |

## Rules

- Brand marks are used as delivered: never redrawn, recolored, traced or
  AI-generated. The pixel badge is shown at its native size or an integer
  multiple, with `image-rendering: pixelated`.
- Avatars and item art are the only "photography" — no stock images, no
  emoji standing in for an item, no AI-generated illustrations.
- If an asset doesn't exist yet, use a neutral, labelled placeholder box
  (`[avatar]`, `[item]`, `[logo RCS]`), never a stand-in drawing. Logo
  slots keep their final size and aspect so the file can drop in later
  (owner, 2026-10-26: there are no source logo files).
- `reference/current-app/` screenshots are design input only — never ship
  them or crop assets out of them.
