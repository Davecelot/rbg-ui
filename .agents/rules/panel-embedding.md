# Rule: panel-embedding

The RBG panel ships **inside someone else's app** — a pixel-art hotel whose
window size, styles and scripts we don't control. Everything we build must
behave as a good guest.

- **Preset-sized, host-bounded.** The panel's size comes from the host viewport
  (three 16:9 presets the player picks, reflowing smaller when the window
  is too small — never scaled). Layout responds with `@container rbg (…)`
  queries on `.rbg-panel`, never `@media` on the viewport and never
  `vw`/`vh`. Every screen works from the smallest supported panel
  (≈992×558, recorded in `.ai/DECISIONS.md`) up to the 1600×900 preset,
  without horizontal scroll.
- **Scoped styles.** The only global rule is `@font-face` for `'RBG Archivo'`
  (namespaced). Every selector lives under `.rbg` (the root) — no
  rules on `html`, `body`, `*` or bare elements outside it, no global
  resets, no `:root` custom properties the host could collide with (tokens
  are declared on `.rbg`). The host simulator's own styles in `index.html`
  stay under `.host`.
- **No leakage the other way.** Don't rely on inherited host styles: the
  root sets its own font, color, line-height, box-sizing and
  `color-scheme`.
- **Stacking.** One `z-index` for the panel, as a token; nothing inside
  escapes it. Popovers and toasts render inside the panel.
- **Non-modal.** The panel is `role=dialog` without `aria-modal` and
  without a focus trap — the host (chat, toolbar) stays usable around it.
- **Open / close.** `Esc` and the close button close the panel; focus
  returns to the element that opened it. The panel never traps the host's
  scroll.
- **Self-contained.** Fonts, icons and images ship from `public/`; nothing
  loads from another host at runtime (see `security-guardian`). No
  `localStorage` keys without an `rbg:` prefix.
- **Pixel-perfect art.** The host is pixel art; our avatars and badges are
  scaled by whole numbers only with `image-rendering: pixelated`.

**Why:** a panel that breaks at the player's window size, restyles the
host, or depends on the host's CSS fails in production in ways a
standalone page never shows. The host simulator in `index.html` exists to
catch exactly this.

**Enforcement:** `playwright-worker`'s responsive spec runs every screen
at size-1024/1280/1600 and `shrunk`, failing on horizontal overflow
or content hidden under the action bar. `review-rangers`' host-embedding
lens and `a11y-checker`'s focus checks cover the rest. Scoping is checked
by hand in review.
