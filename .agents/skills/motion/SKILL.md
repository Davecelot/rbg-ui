---
name: motion
description: >
  Build, review, audit, and find opportunities for animation in the RBG
  panel — tab and sub-tab switches, the active-tab indicator, view and state
  changes, progress fills, scoreboard count-ups, the reward / rank-up
  celebration, CTA press feedback, item reveals, and the panel opening and
  closing inside the host — as four modes of one skill: construction
  guidance (should it animate, named purpose, cheapest tool, GPU-safe
  properties, easing/duration, interruption on fast clicks, reduced motion),
  a diff-scoped review checklist, a repo-wide audit sweep, and a read-only
  opportunity finder. Emil Kowalski's animation philosophy (animations.dev)
  is the craft standard; rbg-taste sets the character ("athletic: fast,
  decisive, no wobble"). Trigger: adding motion to a screen or the panel
  shell (`build`); reviewing a diff that touches transitions/animations/
  keyframes/rAF loops (`review`); auditing `src` and `styles` for motion
  quality (`audit`); asked where motion could help a screen (`find`).
metadata:
  author: davecelot
  version: '1.2.0'
  changelog: >
    1.2.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.1.0: adapted for rbg-ui from ppt-make-a-thon — the deck recipes
    (slide entrance, step reveal, glyph rain, glitch, typing, scanlines,
    scramble, HUD cursor) are replaced by panel recipes P1–P9 (view enter,
    tab indicator, state change, progress fill, count-up, celebration, CTA
    press, item reveal, panel open/close); the frequency gate is counted per
    player session; interruption is defined against the shell re-rendering
    the view on every tab/sub-tab/state change; ambient loops are banned.
    1.0.0: adapted for ppt-make-a-thon, merging fogo-kitchen's motion skill
    with Mody's HTML-artifact motion skill. Both audit scripts take a single
    file; the shared hook dispatcher runs the shell one after changes to
    styles/ or src/.
  auto-invoke: >
    Adding motion/animation to a screen or the panel shell (build mode,
    default); reviewing a diff touching transitions/animations/rAF loops
    (review mode); auditing src and styles for motion quality (audit mode);
    asked where motion could help a screen (find mode)
  allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
---

# Motion

Four modes, one skill, the same shape `hammock` uses for its own
review/audit split: `build` (default) constructs an animation, `review`
critiques a diff, `audit` sweeps the whole repo, `find` scouts for
opportunities without implementing anything.

The panel is plain HTML/CSS/vanilla JS, sized by the host and laid out with
container queries (see `panel-builder`). There is no animation library and
there won't be one without a `.ai/DECISIONS.md` entry (see the
`no-frameworks` rule). Every technique below runs with zero imports.

**Character** (from [`rbg-taste`](../rbg-taste/SKILL.md)): athletic — fast,
decisive, no wobble. Motion confirms an action, shows progress or
celebrates a real reward. Nothing loops for decoration.

## How motion meets the panel shell

Know these before writing any animation — they decide how interruption works:

- `src/panel.js` **re-renders `.rbg-view`** on every tab, sub-tab or state
  change. A screen's entrance `@keyframes` therefore restarts on every
  visit, and a fast click simply discards the old content mid-animation.
  There is no exit phase: an exit or crossfade between views needs a shell
  change (View Transitions or two view layers) — a `panel-builder`
  decision, not something to fake in CSS.
- **Header, tabs, sub-tabs and the action bar persist.** Motion on them
  (the indicator, the CTA press) uses transitions that retarget smoothly
  when the player clicks or arrows quickly.
- **JS effects live in a screen's `enter(viewEl, panel)`** and return a
  cleanup; the shell runs it before the next render. Every rAF loop also
  checks `element.isConnected` on each tick as a safety net (recipe P5).
- `#rbg-status` announces every tab change and every reward. Motion never
  delays that announcement or the content it describes.
- The panel runs **on top of a live host game**. Every animated frame
  competes with the host's own rendering; keep it cheap and short.

## When to use

- Adding a transition, `@keyframes`, WAAPI call, or `requestAnimationFrame`
  effect to a screen or the shell (`build`).
- Reviewing a diff that touches `transition`/`animation`/`@starting-style`/
  `element.animate()`/a rAF loop (`review`) — this is what `review-rangers`'
  Motion lens points at.
- Sweeping `src` and `styles` for motion quality drift (`audit`).
- Asked where motion could help a screen, without being asked to build it
  yet (`find`).

Do NOT use this skill for:

- The general WCAG 2.2 pass — that's `a11y-checker`. This skill owns only
  the motion slice of accessibility: `prefers-reduced-motion`, hover gating,
  and the **no more than 3 flashes per second** limit (WCAG 2.3.1).
- Art direction (is this moment _on brand_ — RBG badges × Nike discipline ×
  fútbol culture × pixel art) — that's `rbg-taste`, and `hallmark` for
  "does this read as AI slop". This skill decides _how_ it moves, not
  _whether the look belongs_.
- The tab/sub-tab/state machine itself — `panel-builder` owns it; this
  skill covers only the motion on top.

## Check what already exists first — the reuse layer

Before anything below:

1. **Tokens.** `styles/tokens.css` defines `--ease-out`, `--ease-in-out`,
   `--dur-fast` (≈120ms), `--dur-base` (≈180ms), `--dur-slow` (≈600ms). Use
   them by name. A new duration or curve is a new token with a reason, never
   a literal in a screen's CSS.
2. **A similar element.** Does another screen already animate the same
   shape (a progress bar, a stat, an item card)? Reuse its exact recipe and
   values — hammock's decision-ladder steps 2–3 ("already in the codebase"
   / "already established") applied to motion.
3. **The canonical shapes.** If nothing similar exists, check these before
   inventing anything:

| Shape                     | Applies to                                                  | Recipe                                                                                                                                                            |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **View enter**            | Every tab/sub-tab switch                                    | opacity + 4px rise, `--dur-fast` `--ease-out` — [RECIPES P1](references/RECIPES.md#p1-view-enter-tab--sub-tab-switch)                                             |
| **Progress fill**         | XP, pass level, mission progress                            | `scaleX` 0→value, `--dur-slow` `--ease-out` — [RECIPES P4](references/RECIPES.md#p4-progress-bar-fill)                                                            |
| **Celebration**           | Reward claimed, level up, rank up                           | scale 0.92→1 + laurel `clip-path`, < 1 s, one-shot — [RECIPES P6](references/RECIPES.md#p6-reward-claimed--rank-up--the-celebration)                              |
| **Floating-panel pop-in** | A popover or menu hidden until triggered (settings, filter) | fade + `scale(0.96)` + sharpen out of blur, 150ms `ease-out`, `@starting-style`, close stays instant — [RECIPES 1](references/RECIPES.md#1-floating-panel-pop-in) |
| **Grid-template reveal**  | In-flow content toggling collapsed ↔ intrinsic size         | `grid-template-rows` 0fr → 1fr 200ms `ease-out` + opacity 150ms — [RECIPES 2](references/RECIPES.md#2-grid-template-reveal)                                       |

When a shape gets adopted for the first time, record the choice in
`.ai/DECISIONS.md` so the next screen reuses it verbatim.

## Mode table

| Mode (`args`)      | Does                                                                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| _(none)_ / `build` | Construct: gate → purpose → tool → properties → easing/duration → interruption → reduced motion. Writes the implementation.                                                                                                                      |
| `review`           | Audit the current diff against the standards below. Report, don't auto-fix.                                                                                                                                                                      |
| `audit`            | Full sweep of `index.html`, `src` and `styles` via [`scripts/audit-motion.sh`](scripts/audit-motion.sh) and [`scripts/audit-motion.py`](scripts/audit-motion.py), checklist in [`references/AUDIT-CHECKLIST.md`](references/AUDIT-CHECKLIST.md). |
| `find`             | Read-only opportunity scout — proposes candidates with exact values, implements nothing.                                                                                                                                                         |
| `help`             | Print this table.                                                                                                                                                                                                                                |

---

## `build` mode

Two failure modes, and the first is worse: animating something that
shouldn't animate at all, and animating the right thing with the wrong
ingredients. Never present motion as a menu of options — make the call,
state the reasoning in one line, write the code.

### 1. Should this animate at all?

Frequency is counted per **player session** (opening the panel, checking a
few tabs, starting a match — tens of clicks):

| Frequency               | Examples                                                    | Decision                                                                                           |
| ----------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Every click             | tabs, sub-tabs, header, the action bar, filters, pagination | **Instant, or near-imperceptible (≤ `--dur-fast` opacity).** No movement beyond the tab indicator. |
| Every screen visit      | view enter, state change, list reveal                       | Subtle and fast: ≤ `--dur-base`, ≤ 8px, no blur                                                    |
| A few times per session | progress fills, a hero count-up, the panel opening          | Standard animation, up to `--dur-slow`                                                             |
| Rare, earned            | reward claimed, pass level up, rank up                      | The delight budget lives here — one celebration, < 1 s                                             |

A celebration on something the player sees every visit is noise. Fails the
gate? Say so, don't write it, offer the instant state change.

### 2. Name the purpose

One of: **feedback** (the panel heard the click), **spatial consistency**
(where something came from/went — the tab indicator moving), **state
indication** (loading, locked, ready), **preventing a jarring change**
(content that would otherwise teleport), **progress** (a value moving
toward a goal), **celebration** (rare, earned tier only). Can't name it?
Don't build it. Also check **function**: numbers and labels the player is
reading never move for style.

### 3. Pick the tool — cheapest that works

| Need                                                                  | Tool                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| A state keyed off a class/attribute (`[aria-selected]`, `data-state`) | **CSS transition**                                                |
| Entry animation on mount (every view render is a mount)               | **CSS `@keyframes`** with `both` fill, or **`@starting-style`**   |
| Panel/popover appearing from `display: none`                          | **`@starting-style`** + `transition-behavior: allow-discrete`     |
| Programmatic control (sequencing with JS state, cancel on re-click)   | **WAAPI** (`element.animate()`)                                   |
| Per-frame number updates (count-up)                                   | **rAF loop writing `textContent`** on an `aria-hidden` layer — P5 |

If a need (springs, layout morphing between views, shared elements across
tabs) can't be built from this tier, that's a real gap — flag it as a
decision for the user. Recipe 12 covers spring-like _feel_ with `linear()`,
but the character rules out overshoot in most places.

### 4. Pick the properties

- **`transform` and `opacity` only** — they skip layout and paint. Never
  animate `width`/`height`/`margin`/`padding`/`top`/`left` directly.
- **`clip-path`** is the sanctioned third property (the laurel draw, wipe
  reveals).
- **`filter`** only for the 150ms pop-in blur on a small popover; never on
  the panel, the view or pixel art.
- **No `box-shadow`, `backdrop-filter` or glow animation** — flat surfaces
  are a `rbg-taste` rule anyway.
- **`grid-template-rows`/`columns`** are tolerated _only_ for the
  grid-reveal shape.
- **Never `scale(0)`.** Start from `scale(0.9–0.97)` + `opacity: 0`.
- **`transform-origin` at the trigger** for anything anchored to one;
  centered otherwise; `left` for progress fills.
- **Pixel art rests at an integer scale.** Animate a wrapper; never leave a
  sprite at a fractional scale after the animation ends.

### 5. Easing and duration

**Tokens first**: `--ease-out` for entrances, `--ease-in-out` for movement
already on screen, `--dur-fast`/`--dur-base`/`--dur-slow`.

| Situation                                   | Easing               |
| ------------------------------------------- | -------------------- |
| Entering or exiting                         | `var(--ease-out)`    |
| Moving on screen (tab indicator)            | `var(--ease-in-out)` |
| Hover / color change                        | `ease`               |
| Constant motion (indeterminate loading bar) | `linear`             |

**Never `ease-in` on UI** — it delays the moment being watched. **No
bounce/overshoot** by default — athletic, not playful.

**Duration ceilings**: per-click feedback ≤ `--dur-fast`; view enter, state
change and the indicator ≤ `--dur-base`; progress fills and count-ups ≤
`--dur-slow`; a celebration < 1 s total with its content readable within
`--dur-slow`. A stagger's total (`items × increment`) stays ≤ 200ms.

### 6. Interruption — the player's fast click

- **Persistent chrome: transitions, never `@keyframes`.** Arrowing across
  tabs must see the indicator retarget from where it is.
- **Views: entrance `@keyframes` are fine** because the shell replaces the
  content — but nothing may _depend_ on an entrance finishing (no
  `animationend` → enable something).
- **JS loops are cleaned up** by the cleanup returned from `enter()`, and
  stop themselves (`if (!el.isConnected) return;`) as a safety net; WAAPI
  animations are cancelled with `el.getAnimations().forEach((a) => a.cancel())`
  before starting a new one on the same element.
- **Focus never waits for motion**: opening moves focus in immediately,
  closing returns it to the host launcher immediately.

### 7. Reduced motion and hover gating

Ships with the animation, every time — the `reduced-motion` Playwright
project runs the whole panel with `prefers-reduced-motion: reduce`.

```css
@media (prefers-reduced-motion: reduce) {
  /* same selector as the rule above */
  animation: none;
  transition-property: opacity; /* keep the comprehension aid, drop movement */
}

@media (hover: hover) and (pointer: fine) {
  .element:hover {
    opacity: 0.85; /* Nike: hover changes opacity only */
  }
}
```

Reduced motion means **fewer and gentler**, not zero: view enters become
plain opacity fades, progress bars render at their value, count-ups show
the final number immediately, celebrations become a fade of the final
frame. JS effects check `matchMedia('(prefers-reduced-motion: reduce)').matches`
themselves — WAAPI and rAF don't see the media query. `styles/base.css`
also carries a global reduced-motion safety net; don't rely on it — each
recipe declares its own fallback.

### Never ship

Each of these is an automatic finding in `review`/`audit`:

| Never                                                             | Instead                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------ |
| `transition: all`                                                 | Name the exact properties                                    |
| `transform: scale(0)` entrance                                    | `scale(0.9–0.97)` + `opacity: 0`                             |
| `ease-in` on a UI element                                         | `var(--ease-out)`                                            |
| Movement on every-click chrome (tabs, action bar, header)         | Instant or ≤ `--dur-fast` opacity (the indicator excepted)   |
| View/state duration over `--dur-base` with no stated reason       | `--dur-base` or less                                         |
| Any ambient loop (shimmer, pulse, glow, rain, floating particles) | Static; a loop only for a genuinely pending request          |
| Bounce, overshoot or shake                                        | `--ease-out`, no overshoot                                   |
| Animating `width`/`height`/`margin`/`padding`/`top`/`left`        | `transform`/`opacity`/`clip-path`                            |
| Animated `box-shadow`, `filter` on large areas, `backdrop-filter` | `opacity`/`transform` on a flat surface                      |
| Ungated `:hover` transform                                        | `@media (hover: hover) and (pointer: fine)`, opacity only    |
| Missing `prefers-reduced-motion` fallback                         | The gentler variant above                                    |
| More than 3 flashes per second, or a panel-wide flash             | One-shot, small area — P6                                    |
| A rAF loop with no cleanup and no `isConnected` stop              | Recipe P5's loop shape, returned from `enter()`              |
| Motion that hides a value from `#rbg-status` or screen readers    | Real value in the DOM immediately; effects are visual layers |
| A literal duration/curve where a token exists                     | `var(--dur-*)` / `var(--ease-*)`                             |

### Output

Write the code, then in a few lines: the gate result (frequency tier +
named purpose, and what was rejected), the ingredients (tool, properties,
curve, duration — one line each), the interruption story (what happens on
a fast click), and what needs a feel-check that can't be judged from code:
play it at 2–5× duration in DevTools' animation inspector, and walk the
screen with `playwright-worker`'s walkthrough at the host sizes and with
reduced motion.

Start from a recipe in [`references/RECIPES.md`](references/RECIPES.md)
rather than a blank file. For converting a vague sensation ("snappier",
"ticks up like a scoreboard", "feels heavy") into exact terminology, see
[`references/VOCABULARY.md`](references/VOCABULARY.md).

---

## `review` mode

Diff-scoped (`main...HEAD` plus the working tree). Advisory only — report,
don't auto-fix (mirrors `hammock`'s and `security-guardian`'s posture);
this is the mode `review-rangers`' Motion lens invokes.

```
## Finding: {short title}

### Location
{path/to/file:line}

### Rule violated
{which "Never ship" row, or which established shape was reinvented instead of reused}

### Suggested fix
{exact change}

### Severity
low | medium | high
```

A single reduced-motion-missing, flash-rate, or `ease-in`-on-UI finding is
enough to flag the diff — these read as unfinished, not stylistic.

## `audit` mode

Full sweep of `index.html`, `src` and `styles`. Two advisory scanners,
both always exit 0:

```bash
bash .agents/skills/motion/scripts/audit-motion.sh            # repo-wide, human-readable
bash .agents/skills/motion/scripts/audit-motion.sh --diff     # diff vs. main
bash .agents/skills/motion/scripts/audit-motion.sh styles/base.css   # one or more files
python3 -I .agents/skills/motion/scripts/audit-motion.py --json      # structured, scored
python3 -I .agents/skills/motion/scripts/audit-motion.py styles --min-severity medium
```

`audit-motion.py` emits one machine-readable payload (`files_scanned`, a
0–100 `score`, the rule catalog with each rule's severity, confidence and
_why_ it has that confidence, and a `findings` array) — use it when another
agent (`ship-check`, `review-rangers`) needs to parse results rather
than read colored text. Both are static, regex-based first passes, not a
certification: anything below "high" confidence needs the judgment calls
above. Findings map to the 8 categories in
[`references/AUDIT-CHECKLIST.md`](references/AUDIT-CHECKLIST.md).

The shared `.agents/hooks/dispatch.js` PostToolUse handler runs
`audit-motion.sh` on changed CSS/JS under `styles/` and `src/`, including
patch and shell edits. Treat findings like a reviewer's comment. When
hooks are unavailable, run the commands above manually; see
[`docs/agent-setup.md`](../../../docs/agent-setup.md).

## `find` mode

Read-only. A filter as much as a finder — most candidates should be
rejected; a short high-conviction list beats a wishlist. Same gates as
`build` steps 1–2 applied to screens that currently have no motion. In this
panel the strongest candidates are usually **progress and reward moments**
(XP filling, a mission claimed, a rank change, the tab indicator) — never
ambient decoration.

Output:

- An opportunities table: screen + element, exact proposed values (tool,
  property, curve token, duration token), which shape or recipe it fits
  (or "new shape").
- A rejected-candidates section: which gate disqualified each one.
- A one-paragraph verdict naming the highest-leverage suggestion.

Never implements — hand off to `build` once a candidate is chosen.

---

## Resources

- [`references/RECIPES.md`](references/RECIPES.md) — ready-to-build
  snippets: the panel recipes (P1–P9) first, then the general UI recipes.
- [`references/VOCABULARY.md`](references/VOCABULARY.md) — reverse-lookup
  glossary, sensation → exact term, including the game/reward moments.
- [`references/AUDIT-CHECKLIST.md`](references/AUDIT-CHECKLIST.md) — the
  checklist backing `audit`/`review`.
- [`scripts/audit-motion.sh`](scripts/audit-motion.sh) — grep-based sweep
  (repo, `--diff`, or file arguments); also what the hook runs.
- [`scripts/audit-motion.py`](scripts/audit-motion.py) — stdlib-only scored
  scanner with `--json`.
- [`a11y-checker`](../a11y-checker/SKILL.md) — the general WCAG 2.2 pass.
- [`playwright-worker`](../playwright-worker/SKILL.md) — the walkthrough
  and reduced-motion runs that verify motion in a real browser.
- [`review-rangers`](../review-rangers/SKILL.md) — its Motion lens invokes
  `review` mode.

Provenance: fogo-kitchen's `motion` and Mody's HTML-artifact `motion`, both
adapted from [emilkowalski/skills](https://github.com/emilkowalski/skills)'
`animate`/`review-animations`/`improve-animations`/
`find-animation-opportunities`/`animation-vocabulary`.
