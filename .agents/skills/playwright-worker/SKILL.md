---
name: playwright-worker
description: >
  Real-browser verification of the RBG panel with Playwright, against the
  Vite dev server (the host simulator): tab and sub-tab navigation (APG
  keys, Esc/close and focus return to the launcher), the deep-link contract
  ?tab=&sub=&state=&mode=, the 16:9 size presets and the shrunk panel (no horizontal
  scroll inside .rbg-panel, only .rbg-view scrolls, nothing clipped under the
  action bar), the a11y self-check on every screen × state, reduced-motion
  runs, and a screenshot walkthrough of every screen × state for
  screen-critic and ship-check. Visual regression is deferred. Trigger:
  creating, updating, or running Playwright specs; verifying a screen, state,
  effect or shell change in a real browser; capturing the walkthrough for a
  design review; or checking how the panel behaves with reduced motion or at
  the smallest host size.
metadata:
  author: davecelot
  version: '2.1.0'
  changelog: >
    2.1.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    2.0.0: adapted for rbg-ui from ppt-make-a-thon — the 1920×1080 deck
    became a fluid panel in a host simulator: size-preset projects (size-1024,
    size-1280, size-1600, shrunk, reduced-motion),
    helpers/panel.js, the ?tab=&sub=&state=&mode= contract, panel overflow
    rules, and the smoke, navigation, a11y, responsive and opt-in
    walkthrough specs.
    1.0.0: adapted for ppt-make-a-thon from Fogo DS's playwright-worker
    (behavior specs only, visual baselines deferred).
  auto-invoke: >
    Creating, updating, or running Playwright specs; verifying a screen,
    state, effect or shell change in a real browser; capturing the screen
    walkthrough for review
  allowed-tools: [Read, Edit, Write, Grep, Bash]
---

# Playwright Worker

> **Setup:** everything lives under `playwright/` at the repo root:
> `playwright.config.js`, `helpers/panel.js`, and `tests/*.spec.js`.
> Chromium only. `npm test` runs the suite; Playwright starts `npm run dev`
> (Vite, port 5173) itself, or reuses one that's already running.

## When to use

- Verifying what reading code can't: that an arrow key actually switches
  the tab, Esc actually returns focus to the launcher, a screen fits the
  panel at a real host size without horizontal scroll, the a11y self-check
  passes on the rendered screen, and the panel still tells its story with
  reduced motion.
- Adding a spec for a new screen, state or shell change.
- Capturing screenshots of every screen × state for a design review
  (`screen-critic`) or a release check (`ship-check`).

## When NOT to use

- Accessibility auditing as the primary method → `a11y-checker` first;
  Playwright runs its self-check and the key mapping, it doesn't replace
  the live keyboard pass or a screen-reader check.
- Judging taste/art direction → `rbg-taste`, `hallmark`, `screen-critic`.
  Playwright produces the screenshots; it doesn't grade them.
- Logic-only testing → the panel has no unit test runner; don't invent one
  as a side effect of this skill.

## Prerequisites

- `npm install` done (`@playwright/test` is a dev dependency).
- Chromium installed once: `npx playwright install chromium`.

---

## The infrastructure

The contract it pins lives in [`panel-builder`](../panel-builder/SKILL.md)
(shell selectors, URL, keyboard, states, the play-mode action bar).

### `playwright/playwright.config.js`

The panel has three `Resolução da janela` presets (16:9). Each project
seeds the preset through `storageState` (`localStorage['rbg:size']`, the
same key the panel uses) and picks a window it fits in — except `shrunk`.

| Project          | Window    | Preset   | Why                                                                                                     |
| ---------------- | --------- | -------- | ------------------------------------------------------------------------------------------------------- |
| `size-1024`      | 1280×800  | 1024×576 | Smallest preset at full size — the compact layout                                                       |
| `size-1280`      | 1440×900  | 1280×720 | The default preset — the regular layout                                                                 |
| `size-1600`      | 1920×1080 | 1600×900 | Largest preset — the wide layout                                                                        |
| `shrunk`         | 1024×640  | 1600×900 | The preset doesn't fit, so the panel reflows to ≈992×558 — the **smallest supported panel** (DECISIONS) |
| `reduced-motion` | 1440×900  | 1280×720 | Every spec again with `prefers-reduced-motion: reduce`                                                  |

To force a preset in one test, pass `size` to `gotoScreen` (`?size=1024`).

Every spec runs in all five projects. `webServer` runs `npm run dev`
(`reuseExistingServer` outside CI). Reports go to `playwright-report/`,
artifacts to `test-results/` (both gitignored).

### `playwright/helpers/panel.js`

| Helper                                        | Does                                                                                                                                                                                     |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gotoScreen(page, { tab, sub, state, mode })` | Opens `/?tab=&sub=&state=&mode=` (omitted keys left out), waits for `.rbg-view` to be visible and for fonts to load                                                                      |
| `position(page)`                              | Reads `{ tab, sub, state, mode }` from `.rbg-view[data-tab][data-sub][data-state]` and `.rbg-actionbar[data-mode]`                                                                       |
| `everyScreen()`                               | Every `{ tab, sub, state }`, flattened from `src/screens/index.js` (the helper imports the registry directly in Node — the shell exposes nothing to tests)                               |
| `layoutProblems(page)`                        | List of strings: `.rbg-panel` or `.rbg-view` scrolling horizontally, or `.rbg-view` extending under `.rbg-actionbar` (extend it — e.g. per-element clipping — when real screens need it) |
| `settle(page)`                                | Resolves when every finite animation has finished (infinite loops are ignored) — call before a screenshot                                                                                |

Use these rather than re-deriving selectors. If a spec needs a new
reusable piece (e.g. "open the panel from the launcher"), add it here.

### Specs in `playwright/tests/`

| Spec                  | Covers                                                                                                                                                                                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke.spec.js`       | Loads with no console/page errors; the panel is visible inside the viewport; header, tabs, view and action bar render; no request to another host                                                                                                                       |
| `navigation.spec.js`  | APG keys on both tablists (`←/→` wrap, `Home`/`End`, one tab stop), deep-link restore and fallback (`?tab=nope&sub=nope&state=nope&mode=nope`), `#rbg-status` announcement, Esc/close → focus on the launcher, reopen → focus on the active tab, action-bar `data-mode` |
| `responsive.spec.js`  | Every screen × state: `layoutProblems()` is empty — no horizontal scroll inside `.rbg-panel`, only `.rbg-view` scrolls, nothing clipped under `.rbg-actionbar`; tabs, close and CTA ≥ 44×44                                                                             |
| `a11y.spec.js`        | Injects `.agents/skills/a11y-checker/scripts/a11y-self-check.js` (headless, `{ root: '#rbg', reflow: false }`) into every screen × state and fails on any HIGH-impact `fail`                                                                                            |
| `walkthrough.spec.js` | Opt-in (`WALKTHROUGH=1`): screenshots of every screen × state per project                                                                                                                                                                                               |

---

## Critical patterns

### 1. Navigate through the URL contract, not by clicking around

The panel's position is `?tab=&sub=&state=&mode=` (ids from
`docs/screen-inventory.md`; unknown values fall back to the first
tab/sub/state/mode). Start every test from `gotoScreen()`; use real key
presses only when the key mapping itself is what's under test.

```js
import { expect, test } from '@playwright/test';
import { gotoScreen, position } from '../helpers/panel.js';

test('arrow right moves from Ranking to RCS Week', async ({ page }) => {
  // Given
  await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
  await page.getByRole('tab', { name: /ranking/i }).focus();
  // When
  await page.keyboard.press('ArrowRight');
  // Then
  expect((await position(page)).tab).toBe('rcs-week');
  await expect(page.getByRole('tab', { name: /rcs week/i })).toBeFocused();
  await expect(page.locator('#rbg-status')).toContainText('RCS Week');
});
```

### 2. Test file naming

```
playwright/tests/
├── smoke.spec.js              # panel-wide invariants
├── navigation.spec.js         # shell behavior
├── responsive.spec.js         # host sizes and overflow
├── a11y.spec.js               # self-check on every screen × state
├── walkthrough.spec.js        # opt-in screenshots
└── screens/
    └── <tab>--<sub>.spec.js   # per-screen behavior, only when a screen has some
```

A per-screen spec exists only when the screen has behavior worth pinning
(pagination, a color picker that only saves on `SALVAR COR`, rotating the
avatar, a disabled CTA, a count-up with a reduced-motion state). Static
screens are covered by the panel-wide specs. Each spec reads standalone:
literal ids, no shared constants across files.

### 3. Given-When-Then, assert on what the player sees

```js
test.describe('Ranking › Jogadores — behavior', () => {
  test('is a real table with column headers', async ({ page }) => {
    await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
    const table = page.getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader')).not.toHaveCount(0);
  });

  test('next page keeps focus on the pagination', async ({ page }) => {
    // Given
    await gotoScreen(page, { tab: 'ranking', sub: 'jogadores' });
    const next = page.getByRole('button', { name: /próxima/i });
    // When
    await next.click();
    // Then
    await expect(page.getByRole('navigation', { name: /paginação/i }).locator('[aria-current="page"]')).toHaveText('2');
  });
});
```

Prefer role/name locators with the literal pt-BR labels. `toHaveCSS` and
other web-first assertions retry until a transition finishes. Never
`waitForTimeout` to "let an animation finish" — use web-first assertions or
`settle(page)`.

### 4. Real keys for keyboard behavior

`page.keyboard.press()` sends trusted key events, so it exercises the
shell's real handler and browser defaults (Tab moving focus, Space/Enter
activating a focused button). Use it for:

- the tabs key map on both levels (`navigation.spec.js` covers the basics);
- one tab stop per tablist (`Tab` from the selected tab leaves the
  tablist);
- Esc and the close button: the panel closes and the launcher is focused;
  reopening focuses the active tab;
- fast repeated arrow presses — assert the final `position()` and that the
  view matches it;
- a disabled CTA (`aria-disabled="true"`, e.g. `CRIAR AMISTOSO`): it is
  still focusable, Enter does nothing, and its reason is described.

### 5. Host sizes and overflow

- `responsive.spec.js` iterates `everyScreen()` in every project
  and asserts `layoutProblems(page)` is empty. A failure at `shrunk` is a
  real bug, not a flaky size — fix the container-query layout.
- Never assert pixel positions; assert containment (`boundingBox` inside
  `.rbg-panel`), scroll ownership (`.rbg-view` is the only element with
  `scrollHeight > clientHeight`) and minimum target sizes.
- The panel must never set the page's own scroll: assert
  `document.documentElement.scrollWidth <= innerWidth` in the smoke spec.

### 6. Verifying motion

- **Reduced motion:** the `reduced-motion` project runs everything with
  `prefers-reduced-motion: reduce`. To pin a specific effect's fallback,
  assert its static state there:
  ```js
  test('XP bar renders at its final value with reduced motion', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'reduced-motion');
    await gotoScreen(page, { tab: 'passe', sub: 'meu-progresso' });
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });
  ```
- **Effects stop when their screen leaves:** go to the screen, switch tab,
  and assert `document.getAnimations()` holds nothing from the previous
  view. For `requestAnimationFrame` loops, spy on it with
  `page.addInitScript` and check the count stops growing after leaving.
- **Feel** (easing, timing, whether it's on brand) isn't assertable —
  that's the walkthrough plus a human/`screen-critic` look, and the `motion`
  skill's DevTools slow-motion check.

### 7. Screenshot walkthrough (for screen-critic and ship-check)

```bash
WALKTHROUGH=1 npx playwright test --config playwright/playwright.config.js walkthrough
WALKTHROUGH=1 npx playwright test --config playwright/playwright.config.js walkthrough --project shrunk
```

Writes `test-results/walkthrough/<project>/<tab>--<sub>--<state>.png` — one
full-page PNG (panel inside the host simulator) per screen × state, after `settle()`. Hand that folder
to `screen-critic` (taste review) or read it in `ship-check`.
`test-results/` is wiped at the start of every Playwright run, so run the
walkthrough **last**, or copy the folder elsewhere (e.g. the session
scratchpad) before running other specs.

### 8. Interactive QA with the browser pane

For a quick look without a spec, run `npm run dev` and open the host
simulator with the current host's browser tools at
`http://localhost:5173/?tab=loja&sub=…&state=default`. Resize to the project
sizes, press keys, and take screenshots. Claude can use its `panel`
configuration in `.claude/launch.json`; other hosts use their own browser
or the Playwright CLI. Never assume Claude preview tool names exist on
Codex or Work. Anything worth keeping becomes a spec.

---

## Visual regression — deferred

Screenshot assertions (`toHaveScreenshot()`) compare pixels against a
committed baseline, and rendering isn't deterministic across environments
(antialiasing, font hinting, GPU rasterization differ between machines),
so a baseline from one machine produces false diffs on another. Making it
useful needs baselines generated and diffed in one consistent environment
(the official Playwright Docker image). This repo has no CI and no such
environment, so there are no `toHaveScreenshot()` assertions and no
committed snapshots. The walkthrough covers the review need without
pixel-diffing. Revisit if the repo gets a CI job.

---

## Decision tree

```
Shell behavior (tabs, keys, URL, Esc, announcements, mode)? → navigation.spec.js (extend it)
A screen's own controls/states/effect?                      → tests/screens/<tab>--<sub>.spec.js
Something overflows or hides under the action bar?          → responsive.spec.js already checks; fix the container query
Accessibility on the rendered screen?                       → a11y.spec.js (self-check); live keyboard pass stays manual
Reduced-motion fallback of an effect?                       → assert in the reduced-motion project (pattern 6)
Need screenshots for a review?                              → WALKTHROUGH=1 walkthrough spec (pattern 7)
Pixel-exact visual regression?                              → deferred — see above
```

---

## Commands

```bash
npm test                                           # whole suite, all five projects
npm run test:ui                                    # Playwright UI, step-through debugging
npm test -- --project shrunk                     # one project
npm test -- navigation                             # one spec (file-name filter)
npm test -- --headed                               # visible browser
WALKTHROUGH=1 npm test -- walkthrough              # screenshots of every screen × state
npx playwright show-report playwright-report       # open the last HTML report
npx playwright install chromium                    # first-time setup
```

---

## Relationship to other skills

| Skill                                   | Relationship                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `panel-builder`                         | Upstream — defines the shell contract (selectors, URL, keys, states, mode) these specs pin             |
| `a11y-checker`                          | Sequential — WCAG audit and live keyboard pass first; its self-check script runs inside `a11y.spec.js` |
| `motion`                                | Upstream — each recipe's reduced-motion state and self-stopping loops are what pattern 6 verifies      |
| `rbg-taste` / `hallmark`                | Upstream — define what a screen should look like; the walkthrough is how it's compared                 |
| `screen-critic` / `ship-check` (agents) | Downstream — consume the walkthrough screenshots and the test results                                  |
| `review-rangers`                        | Its Player/host-embedding and Performance lenses ask for these runs as evidence                        |

Position in the verification chain: after implementation, `a11y-checker`
and `motion`, as the check that exercises the panel in a real browser
rather than reading its source.
