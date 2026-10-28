# Motion vocabulary

A reverse-lookup glossary: converts a vague description of what motion
_looks or feels like_ into the precise term, for talking to a designer,
writing a motion proposal, or naming a `build`-mode purpose accurately.
Web-relevant terms only, plus the game/reward moments this panel uses.
Recipe references point at [`RECIPES.md`](RECIPES.md).

## Entrances & exits

- **Fade in/out** — opacity only, no transform.
- **Rise in** — opacity + a small `translateY` (4–8px) — the view enter
  (P1) and the item reveal (P8).
- **Scale in / pop in** — opacity + `scale()` together (the pop-in shape,
  recipe 1, at `scale(0.96)`).
- **Slide in/out** — `translate()` from off-screen or off-panel.
- **Sharpen out of blur** — `filter: blur()` transitioning to `blur(0)`
  alongside a scale/opacity entrance (the third leg of the pop-in shape).
- **Wipe** — a `clip-path: inset()` reveal along one axis; the basis of
  the laurel draw (P6) and hold-to-confirm (recipe 8).

## Sequencing & timing

- **Stagger** — successive elements delayed by a small fixed increment
  (P8) — decorative, never blocking, capped at 6 items.
- **Orchestration** — a parent's sequence coordinating multiple
  children's timing rather than each child animating independently.
- **Moment** — a single beat the player should notice (a reward, a rank
  change). The panel spends its motion budget on moments, not on chrome.
- **Hold** — the pause where nothing moves so the player can read; as
  important as the motion around it.

## Movement & transforms

- **Translate** — position change (`translate()`/`translateX()`/`translateY()`).
- **Scale** — size change relative to `transform-origin`.
- **Rotate** — angular change; rare in this panel (the avatar turn in
  Vestiário swaps sprites, it doesn't rotate).

## Transitions between states

- **Cut** — instant change, no motion. A valid default for any chrome.
- **Crossfade** — two elements' opacity swap in lock-step; a subtle
  `filter: blur(2px)` mid-transition can hide the overlap if it doesn't
  settle cleanly. Between views this needs a shell change (View
  Transitions or two view layers).
- **View transition** — the browser's `document.startViewTransition()`
  snapshot-and-animate between two DOM states; the candidate tool for a
  view-to-view crossfade if one is ever justified.
- **Layout animation / shared-element transition / morph** — an element
  smoothly reflowing or appearing to morph between two states. Needs FLIP
  bookkeeping or a library; vocabulary only until a real need justifies the
  cost. Never hand-roll it with `width`/`height` transitions.

## Game & reward moments

- **Count-up / ticker** — a number ticking from 0 (or its previous value)
  to its target in tabular figures, scoreboard-style (P5).
- **Fill** — a progress bar growing to its value along one axis with
  `scaleX` (P4).
- **Celebration** — the single, short moment that marks a real reward
  (claimed, level up, rank up): a scale-in plus one supporting reveal (P6).
- **Laurel draw** — the RBG laurel revealing from its center outwards with
  `clip-path` (P6). Only on achievement moments.
- **Indicator slide** — the active-tab marker moving between tabs (P2).
- **Banned here**: confetti, particles, screen shake, glow pulses, flames,
  ambient shimmer, scanlines, glyph rain, glitch. They read as generic
  gamer UI, not as the `rbg-taste` direction.

## Feedback & interaction

- **Press feedback** — the `:active` scale-down on tap/click (recipe 3).
- **Rubber-banding / overscroll damping** — resistance increasing near a
  drag boundary (see "Swipe and pointer gestures" in RECIPES.md).
- **Ripple** — an expanding-circle feedback effect from the point of touch.
  Not part of this panel's language — don't introduce it speculatively.

## Easing

- **Ease-out** — fast start, slow finish. Default for anything
  entering/exiting (`--ease-out`).
- **Ease-in** — slow start, fast finish. **Never used on UI** — delays the
  moment being watched.
- **Ease-in-out** — slow-fast-slow. For movement already on screen
  (`--ease-in-out`).
- **Linear** — constant rate. For continuous motion (an indeterminate
  loading bar, a countdown) where a curve would look like inconsistent speed.
- **Steps** — `steps(n)`: discrete jumps, no interpolation. Rarely
  right here; a pixel sprite swap (avatar turn) is the one fit.
- **Spring** — physics-based, carries velocity through interruption.
  CSS/WAAPI have no native spring; approximate with a sampled `linear()`
  curve (recipe 12) rather than a library.

## Looping & ambient motion

- **Marquee** — continuously scrolling content, `linear`, infinite.
- **Pulse** — a rhythmic opacity/scale breathing effect, usually signaling
  "live" or "waiting" (a recording dot, a "live system" status).
- **Ambient** — background motion with no informational content. **Not
  used in this panel** (`rbg-taste`: nothing loops for decoration).

## Polish & effects

- **Line drawing** — an SVG stroke revealing itself via
  `stroke-dashoffset`; a fit for pitch-line geometry or icons, sparingly.
- **Shimmer** — a moving gradient highlight across a placeholder shape.

## Performance vocabulary

- **Compositor-only / GPU-accelerated properties** — `transform` and
  `opacity`; the browser animates them without layout or paint.
- **Layout thrashing** — repeatedly triggering layout by animating
  `width`/`top` or reading layout inside a rAF loop.
- **Main-thread jank** — dropped frames because JS-driven animation
  competes with other work; why predetermined motion prefers CSS.
- **Frame budget** — the time a frame may take: 16.7ms at 60fps, 33ms at
  30fps. The panel shares the frame with the host game, so
  stay well under it.
- **Overdraw** — painting the same pixels several times per frame
  (stacked animated layers); on top of a running host game it costs more
  than it looks.
