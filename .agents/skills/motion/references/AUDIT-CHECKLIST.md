# Motion audit checklist

Backs `audit` mode (full repo sweep) and `review` mode (diff scope). Eight
categories condensed from Emil Kowalski's `improve-animations` `AUDIT.md`,
plus a ninth for the panel's reward moments, retargeted at this repo:
duration/easing tokens live in `styles/tokens.css`, so category 7 audits
both token use and consistency-by-copy across screens.

Scope: CSS in `styles/`, screen modules in `src/screens/`, the shell in
`src/panel.js`, other DOM-facing JS in `src/` (including rAF loops), and
`index.html`.

## 1. Purpose & frequency

- Does every animated element answer "why animate?" with one of `build`
  mode's named purposes (feedback, spatial consistency, state indication,
  preventing a jarring change, progress, celebration)?
- Does anything that fires on every click (tabs, sub-tabs, the action bar,
  header) move? Automatic finding — instant or ≤ `--dur-fast` opacity only.
- Are celebrations confined to real reward events (claimed, level up, rank
  up), and is there no ambient loop anywhere?

## 2. Easing & duration

- Any `ease-in` on a UI element?
- Any view enter or state change over `--dur-base` with no stated reason?
- Any progress fill or count-up over `--dur-slow`, or a celebration over 1 s?
- Any bare `ease`/`linear` used on an entrance (should be `--ease-out`)?
- Any literal duration/curve where a `--dur-*`/`--ease-*` token exists?

## 3. Physicality & origin

- Any `scale(0)` entrance instead of `scale(0.9–0.97)`?
- Does a trigger-anchored popover use `transform-origin` at the trigger,
  and a non-anchored one stay centered?
- Do the CTA and other pressable controls have press feedback, and hover
  only changes opacity (Nike rule)?
- Are rise distances small (≤ 8px — the panel is small)?
- Any bounce, overshoot or wobble? The character is "athletic: fast,
  decisive, no wobble".

## 4. Interruptibility

- Does anything depend on an entrance finishing (`animationend` handlers
  that enable behavior)? The shell can replace the view at any click.
- Does every rAF loop stop itself when its node is gone (`isConnected`),
  cancel its frame, and return a cleanup from the screen's `enter()`?
- Do in-place toggles (indicator, expanded rows) use transitions that
  retarget, not `@keyframes` that restart?
- Does focus move immediately on open/close, never after `transitionend`?

## 5. Performance

- Any `transition: all`?
- Any animated `width`/`height`/`margin`/`padding`/`top`/`left` outside the
  grid-reveal shape's `grid-template-*`?
- Any WAAPI call driving a property other than `transform`/`opacity`/
  `clip-path`?
- Any animated `filter`, `backdrop-filter` or `box-shadow`?
- Long lists (ranking, shop) animating every row?
- `will-change` used only while something runs, never left on statically?
- Anything animating while the panel is closed or the host tab is hidden?

## 6. Accessibility

- Does every file declaring a `transition`/`animation`/`@keyframes`/
  `@starting-style` also have a `@media (prefers-reduced-motion: reduce)`
  block, and does every JS effect check `matchMedia` itself?
- Does every `:hover` transform rule sit behind
  `@media (hover: hover) and (pointer: fine)`?
- Does reduced motion keep opacity transitions (comprehension aids) while
  dropping movement, rather than removing everything?
- No flashing above 3 per second, no large-area flashes (WCAG 2.3.1)?
- Is the real value in the DOM from the first frame (count-ups on an
  `aria-hidden` layer, rewards announced through `#rbg-status`), so screen
  readers never get intermediate numbers?

## 7. Cohesion

- Does an element that fits a panel recipe (P1–P9), the pop-in or the
  grid-reveal shape use those exact values, or did it drift?
- Do similar elements on different screens (progress bars, stats, item
  cards) share the same duration and curve?
- Are tokens used by name rather than copied as literals?

## 8. Missed opportunities

- Is there a moment (progress reached, a mission claimed, a rank change,
  the indicator jumping between tabs) that currently teleports and would
  read better with motion, per `find` mode's gates? Report as a `find`
  candidate, don't implement during an `audit` pass.

## 9. Celebration discipline

- At most one celebration per event, under 1 s, never looping, at most one
  flash?
- No confetti, particles, glow, shake, flames or lens flares?
- Pixel art at rest on an integer scale with `image-rendering: pixelated`?
- A reduced-motion state that still reads as the reward (the final frame,
  faded in)?
