# Motion recipes

Ready-to-build snippets in this repo's actual shape: plain CSS in `styles/`
(using the tokens in `styles/tokens.css`), screen markup returned by
`render()` in `src/screens/<tab>/<sub>.js`, vanilla JS, no animation
library. Every recipe states three things: its **reduced-motion fallback**,
that it uses **GPU-safe properties** only, and **what happens when the
player clicks again mid-animation**.

Once a recipe is adopted on one screen, the next similar element reuses its
exact values; record the first adoption in `.ai/DECISIONS.md`.

Shell facts the recipes rely on (see SKILL.md, "How motion meets the panel
shell"): every tab or sub-tab change re-renders `.rbg-view` from scratch and
runs the previous screen's `enter()` cleanup; a state change updates
`.rbg-view[data-state]` and re-renders the view; header, tabs and action bar
persist across changes.

Character (from `rbg-taste`): **athletic — fast, decisive, no wobble.** No
ambient loops, no glow, no bounce for its own sake.

---

# Panel recipes

## P1. View enter (tab / sub-tab switch)

Every switch is a fresh mount of `.rbg-view`'s content. Keep it near-instant
— the player is navigating, not watching.

```css
.rbg-view > * {
  animation: rbg-view-in var(--dur-fast) var(--ease-out) both;
}

@keyframes rbg-view-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
}

@keyframes rbg-view-fade {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rbg-view > * {
    animation-name: rbg-view-fade;
  }
}
```

`rbg-view-fade` is shared by P3, P6 and P8's reduced-motion fallbacks.

- GPU-safe: `opacity` + `transform`.
- Click again mid-animation: the node is replaced; the new one starts its own
  entrance. Nothing depends on `animationend`.

## P2. Tab / sub-tab indicator

The active marker (underline or pill) slides between tabs instead of
teleporting — spatial consistency. The shell sets the target geometry as
custom properties on the tablist; CSS animates `transform` only.

```js
const setIndicator = (tablist, tab) => {
  tablist.style.setProperty('--ind-x', `${tab.offsetLeft}px`);
  tablist.style.setProperty('--ind-w', `${tab.offsetWidth}`);
};
```

```css
.rbg-tabs__indicator {
  position: absolute;
  inset-block-end: 0;
  inset-inline-start: 0;
  inline-size: 1px;
  block-size: 2px;
  transform-origin: left;
  transform: translateX(var(--ind-x, 0)) scaleX(var(--ind-w, 0));
  transition: transform var(--dur-base) var(--ease-in-out);
}

@media (prefers-reduced-motion: reduce) {
  .rbg-tabs__indicator {
    transition: none;
  }
}
```

- Recompute on resize of the panel (`ResizeObserver` on the tablist), since
  container queries can change tab widths.
- Fast arrow-key presses retarget the transition from where it is.
- If an indicator adds no clarity (the active tab already reads clearly),
  skip it — instant is a valid answer.

## P3. State change inside a screen

`default ↔ loading ↔ empty ↔ error` swaps content in place. A short opacity
crossfade prevents a jarring jump; no movement.

```css
.rbg-view[data-state] > * {
  animation: rbg-view-fade var(--dur-fast) linear both;
}
```

Loading: a static skeleton in the final layout's shape, or a single
functional indeterminate bar while a request is genuinely pending. **No
shimmer loops** — they're ambient decoration. Reduced motion: no animation,
the indeterminate bar becomes a static label (`Carregando…`).

## P4. Progress-bar fill

XP, battle-pass level, mission progress. The bar fills from 0 to its value
on screen enter so the player reads progress as progress.

```css
.rbg-progress__fill {
  transform-origin: left;
  transform: scaleX(var(--value)); /* 0–1, set inline from data */
  animation: rbg-fill var(--dur-slow) var(--ease-out) both;
}

@keyframes rbg-fill {
  from {
    transform: scaleX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rbg-progress__fill {
    animation: none;
  }
}
```

- The numeric value (`455 / 860 XP`) is in the DOM from the first frame;
  the bar is decoration on top of it, `aria-hidden` or a native `<progress>`.
- Only on enter — re-rendering the same value on a state toggle does not
  replay it if nothing changed (key the animation on a class the shell adds
  only on tab entry, or accept the replay at `--dur-fast`).

## P5. Number count-up (scoreboard)

Rank points, XP gained, win rate — a big number ticking to its value, in
tabular figures so the width never jumps. Use sparingly: one hero number
per screen at most.

```js
export function countUp(el, to, duration = 600) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const visual = el.querySelector('[data-count]');
  const start = performance.now();
  let raf = requestAnimationFrame(function tick(now) {
    if (!el.isConnected) return;
    const t = Math.min((now - start) / duration, 1);
    visual.textContent = Math.round(to * (1 - (1 - t) ** 3)).toLocaleString('pt-BR');
    if (t < 1) raf = requestAnimationFrame(tick);
  });
  return () => cancelAnimationFrame(raf);
}
```

```html
<p class="rbg-stat">
  <span class="visually-hidden">49%</span>
  <span aria-hidden="true"><span data-count>49</span>%</span>
</p>
```

- Screen readers get the final value immediately; the ticking layer is
  `aria-hidden`.
- Called from the screen's `enter()`; its return value is the cleanup the
  shell runs on the next switch. The `isConnected` check is the safety net.
- `font-variant-numeric: tabular-nums` on the number.

## P6. Reward claimed / rank up — the celebration

The one place the delight budget lives: a mission claimed, a pass level
reached, a new rank. **One moment, under 1 s total, never looping, at most
one flash.** The pixel badge or the item art is the hero; the laurel (from
the RBG badge) may draw itself in under it.

```css
.rbg-reward {
  animation: rbg-reward-in 420ms var(--ease-out) both;
}

.rbg-reward__laurel {
  clip-path: inset(0 50% 0 50%);
  animation: rbg-laurel 480ms var(--ease-out) 180ms both;
}

@keyframes rbg-reward-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
}

@keyframes rbg-laurel {
  to {
    clip-path: inset(0 0 0 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .rbg-reward,
  .rbg-reward__laurel {
    animation: rbg-view-fade var(--dur-fast) linear both;
    clip-path: none;
  }
}
```

- Pixel art scales only by integers: animate the **wrapper's** opacity and a
  0.92→1 scale, and keep the sprite itself at its integer size with
  `image-rendering: pixelated` — a brief sub-pixel scale is acceptable, a
  resting non-integer scale is not.
- The reward text (`+100 XP`, the item name) is in the DOM immediately and
  announced through `#rbg-status`.
- No confetti, particles, flames, glow or screen shake.

## P7. CTA press feedback

The pill CTA (`JOGAR`) confirms the press physically; hover follows Nike —
opacity only.

```css
.rbg-cta {
  transition:
    transform 100ms var(--ease-out),
    opacity var(--dur-fast) ease;
}

.rbg-cta:active {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .rbg-cta:hover {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rbg-cta:active {
    transform: none;
  }
}
```

## P8. Item grid / list reveal (shop, ranking)

A short stagger tells the eye "these arrived together, in this order".
Only on first view enter, only for the first visible rows, never on
filtering or pagination.

```css
.rbg-shop__item {
  animation: rbg-view-in var(--dur-base) var(--ease-out) both;
  animation-delay: calc(min(var(--i, 0), 5) * 30ms);
}
```

- Cap the stagger at 6 items (total ≤ 200ms); everything after item 6 shares
  item 6's delay.
- Reduced motion: plain fade, no delay.
- Long ranking tables: no stagger at all — rows appear instantly.

## P9. Panel open / close inside the host

Opening comes from the host's launcher; it should feel quick and solid.
Closing is faster than opening.

```css
.rbg-panel {
  transition:
    opacity var(--dur-base) var(--ease-out),
    transform var(--dur-base) var(--ease-out),
    display var(--dur-base) allow-discrete;
}

@starting-style {
  .rbg-panel {
    opacity: 0;
    transform: translateY(8px) scale(0.985);
  }
}

.rbg[hidden] .rbg-panel {
  opacity: 0;
  transition-duration: var(--dur-fast);
}

@media (prefers-reduced-motion: reduce) {
  .rbg-panel {
    transform: none;
  }
}
```

- Focus moves into the panel **immediately** on open and back to the
  launcher immediately on close — never after `transitionend`.
- No backdrop blur over the host (the host is a game the player is still
  in); a plain scrim only if the host needs one.

---

# General UI recipes

For the panel shell and any interactive element inside a screen (settings
popover, tooltips, confirmation dialogs).

## 1. Floating-panel pop-in

For a panel absent from the visible flow or fully hidden until triggered —
a popover, the settings menu, a filter menu:

```css
[popover] {
  opacity: 1;
  transform: scale(1);
  filter: blur(0);
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out,
    filter 150ms ease-out;
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.96);
    filter: blur(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  [popover] {
    transition: none;
  }
}
```

Close stays instant (no exit transition) unless there's an explicit reason
to add one — see `build` mode step 6. `transform-origin: center` unless
the panel only ever opens from one corner.

## 2. Grid-template reveal

For in-flow content toggling collapsed ↔ intrinsic size:

```css
.reveal {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease-out;
}

.reveal > .reveal__inner {
  overflow: hidden;
  min-height: 0;
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.reveal[data-expanded] {
  grid-template-rows: 1fr;
}

.reveal[data-expanded] > .reveal__inner {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal > .reveal__inner {
    transition: none;
  }
}
```

`min-height: 0` (or `min-width: 0` for the horizontal variant) is required:
without it the grid item won't shrink below its content size. Never
animate rows and columns on the same element.

## 3. Button press

`:active` scale only — instant tactile feedback:

```css
button:active {
  transform: scale(0.97);
  transition: transform 100ms ease-out;
}

@media (prefers-reduced-motion: reduce) {
  button:active {
    transition: none;
  }
}
```

## 4. Tooltip (faster pop-in variant)

Same shape as recipe 1, shorter, no blur:

```css
[popover] {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 120ms ease-out,
    transform 120ms ease-out;
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: scale(0.96);
  }
}
```

If several tooltips can appear in quick succession, consider an instant
transition for the second and later ones in the same interaction — a
judgment call, only when the sequential case is actually visible.

## 5. Modal / dialog

Centered scale (a modal isn't spatially connected to one trigger), backdrop
fades in lock-step:

```css
dialog {
  opacity: 1;
  transform: scale(1);
  transition:
    opacity 200ms ease-out,
    transform 200ms ease-out;
}

dialog::backdrop {
  opacity: 1;
  transition: opacity 200ms ease-out;
}

@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.96);
  }
  dialog[open]::backdrop {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  dialog,
  dialog::backdrop {
    transition: none;
  }
}
```

## 6. Toast / notice

A transition, not `@keyframes` — a second notice queued while one is
animating must retarget, not restart:

```css
.toast {
  opacity: 1;
  transition: opacity 150ms ease-out;
}

@starting-style {
  .toast[data-open] {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast {
    transition: none;
  }
}
```

If a richer entrance is genuinely needed later, extend this transition
rather than starting a second convention.

## 7. Stagger (generic)

See P8 for the panel version. For a dynamic list whose count isn't known
ahead of time, set the index inline:

```js
items.forEach((el, i) => el.style.setProperty('--i', i));
```

## 8. Hold-to-confirm

`clip-path` fill, `linear` easing (a countdown, not an entrance):

```css
.fill {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 2000ms linear;
}

.fill--holding {
  clip-path: inset(0 0 0 0);
}
```

Early release retargets back to 0% — a transition, not keyframes.

## 9. Indicator (generic)

Animate the indicator's own `transform` computed from the active item's
offset — never `left`/`width`:

```css
.indicator {
  transform: translateX(var(--offset));
  transition: transform var(--dur-base) var(--ease-in-out);
}
```

`ease-in-out`: on-screen movement between two visible positions. P2 is the
panel's tab/sub-tab version.

## 10. Reveal on visibility

Only `.rbg-view` scrolls. Use this sparingly for long views (battle-pass
track, shop) where content below the fold benefits from arriving; pass the
view as the observer `root`. `clip-path` + opacity, fired once per element.

```js
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.2 },
);
```

```css
.reveal-on-view {
  opacity: 0;
  clip-path: inset(20% 0 0 0);
  transition:
    opacity 300ms ease-out,
    clip-path 300ms ease-out;
}

.reveal-on-view.revealed {
  opacity: 1;
  clip-path: inset(0 0 0 0);
}
```

## 11. Programmatic, without a library (WAAPI)

```js
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
element.getAnimations().forEach((animation) => animation.cancel());
element.animate(
  [
    { opacity: 0, transform: 'scale(0.96)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  { duration: reduced ? 0 : 150, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' },
);
```

Cancel running animations on the element before starting a new one, and
check reduced motion in JS — WAAPI has no media-query equivalent.

## 12. Spring-like feel without a library

- **CSS `linear()` easing** can encode a sampled spring curve — no JS.
  Generate the point list once from a spring simulator and paste it in as a
  token:
  ```css
  --ease-spring: linear(0, 0.35 15%, 0.82 36%, 0.95 52%, 1.01 68%, 0.998 80%, 1);
  ```
- A minimal damped-spring rAF loop only for truly gesture-driven motion.
  Keep it under ~20 lines; this is a real gap in the tool tier, not a
  default reach.

## Swipe and pointer gestures

The panel has no swipe navigation today. If a screen needs a drag
interaction (rotating the avatar in Vestiário, scrolling the battle-pass
track by drag):

- **Momentum** — dismiss on a flick, not only past a distance:
  `velocity = Math.abs(distance) / elapsed; if (distance >= THRESHOLD ||
velocity > 0.11) commit();`
- **Damping at boundaries** — past an edge, move less: `resisted =
overshoot * 0.35`.
- **Pointer capture** once dragging starts: `el.setPointerCapture(e.pointerId)`.
- **Multi-touch protection** — ignore extra pointers after a drag begins.
- Never block the host's own pointer handling outside the panel
  (listeners stay on panel elements, never on `document`/`window`).

## Not worth building speculatively

- Shared-element/layout morphing between screens (FLIP bookkeeping or a
  library) — vocabulary only until a screen genuinely needs it.
- Particle systems, shaders and WebGL backgrounds — out of scope for this
  panel's tool tier (see the `no-frameworks` rule) and for `rbg-taste`.
- Ripple feedback — not part of the panel's language; don't introduce it
  speculatively.
