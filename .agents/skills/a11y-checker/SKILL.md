---
name: a11y-checker
description: >
  Check the embedded RBG panel against WCAG 2.2 in POUR order using static
  audits, in-page self-checks, and live keyboard validation. Trigger: before
  building, editing, or reviewing screen content, shell navigation, controls,
  images, tables, progress, or effects; or when auditing accessibility.
metadata:
  author: davecelot
  version: '2.1.0'
  changelog: >
    2.1.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    2.0.0: adapted for rbg-ui from ppt-make-a-thon — the 1920×1080 slide
    deck became a fluid panel embedded in a host app: dialog + two-level
    tabs + action bar, focus return to the host launcher, #rbg-status,
    pt-BR copy, ranking tables, progress bars, pixel-art alt policy,
    container-query sizes instead of a scaled canvas (reflow now applies).
    1.0.0: adapted for ppt-make-a-thon from fogo-kitchen's a11y-checker,
    merged with the Mody a11y-checker's APCA guidance, static scanner and
    in-page self-check.
  auto-invoke: >
    Writing, reviewing, or auditing a screen, the panel shell, navigation,
    or any screen content (images, tables, progress, controls, effects) for
    accessibility
  allowed-tools: [Read, Edit, Write, Glob, Grep, Bash]
---

# Accessibility Checker (WCAG 2.2)

## When to use

**Use this skill when:**

- Building or editing a screen in `src/screens/` — copy, images, tables,
  progress, buttons, states (`loading`, `empty`, `error`, `locked`).
- Changing the shell (`index.html`, `src/panel.js`, `styles/base.css`):
  tabs, sub-tabs, the action bar, open/close, focus, the live region.
- Adding an effect from the `motion` skill (tab transition, progress fill,
  count-up, rank-up or reward celebration) — it needs a reduced-motion
  state and must respect the flash limit.
- Auditing the panel against WCAG 2.2 Level A + AA.
- Resolving accessibility issues flagged by the scanners, Playwright, or a
  reviewer.

**Don't use this skill for:**

- Motion craft (easing, duration, GPU-safe properties) — use `motion`.
  This skill owns only the accessibility rationale for motion (reduced
  motion, no auto-playing loops, no flashing).
- Art direction and taste — `rbg-taste` / `hallmark`. Accessibility can
  veto a look (contrast, flashing, tiny targets), but doesn't choose one.
- Performance — `review-rangers`' Performance lens.

---

## Source of truth

All patterns reference the **WCAG 2.2** standard (W3C Recommendation,
October 2023, updated December 2024):

| Resource                     | URL                                                    |
| ---------------------------- | ------------------------------------------------------ |
| WCAG 2.2 Standard            | https://www.w3.org/TR/WCAG22/                          |
| Quick Reference              | https://www.w3.org/WAI/WCAG22/quickref/                |
| Understanding WCAG 2.2       | https://www.w3.org/WAI/WCAG22/Understanding/           |
| WAI-ARIA Authoring Practices | https://www.w3.org/WAI/ARIA/apg/                       |
| APG Tabs pattern             | https://www.w3.org/WAI/ARIA/apg/patterns/tabs/         |
| APG Dialog pattern           | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ |

**Target conformance: Level AA** (all Level A + AA success criteria) for
every player using the panel inside the host — keyboard, screen reader,
low vision, small windows.

---

## The panel in one paragraph (what you're auditing)

`index.html` is a **host simulator**: a `.host` backdrop, a launcher button
that opens RBG, and the mount `#rbg.rbg[lang="pt-BR"]`. Inside,
`section.rbg-panel[role=dialog][aria-labelledby=rbg-title]` holds
`header.rbg-header` (brand `#rbg-title`, `[data-action=close]`),
`nav.rbg-tabs` (`[role=tablist]` of `button[role=tab][data-tab]`), an
optional `div.rbg-subtabs` (`[role=tablist]` of `button[role=tab][data-sub]`),
`div.rbg-view[role=tabpanel][data-tab][data-sub][data-state]` (the only
scrolling region) and `footer.rbg-actionbar[data-mode]` (eyebrow, title,
primary CTA `[data-action=primary]`). The action bar follows a shell-level
play **mode** (`src/data/modes.js`), not the active tab — it shows the same
context on every tab, and its CTA can be **disabled** (e.g. `CRIAR
AMISTOSO`). `p#rbg-status[aria-live=polite]` announces every
tab or sub-tab change as `"<Tab> — <Sub>"`. Tabs follow the APG pattern
(`←/→` move and activate, `Home`/`End`), Esc or close returns focus to the
launcher, reopening focuses the active tab. `?tab=&sub=&state=&mode=`
restores position. The panel is a 16:9 size preset that reflows to fit the host; layout adapts with
`@container rbg` queries (compact / regular / wide). Copy is pt-BR. See
[`panel-builder`](../panel-builder/SKILL.md) for the full contract.

---

## Critical patterns

### Pattern 1: Audit in POUR order

1. **Perceivable** — text alternatives, structure, contrast.
2. **Operable** — keyboard, focus, target size, motion and flashing.
3. **Understandable** — language, predictable behavior, clear copy.
4. **Robust** — semantic roles/states, live regions, AT compatibility.

### Pattern 2: Native controls first

**Use native HTML elements before ARIA-heavy custom widgets.**

```html
<!-- ❌ DON'T — custom widget with manual ARIA -->
<div role="button" tabindex="0" class="item-buy">Comprar</div>

<!-- ✅ DO — native element; keyboard, focus, and semantics are free -->
<button type="button" class="item-buy">Comprar</button>
```

A ranking is a `<table>`, a mission's progress is `<progress>` (or a
`role="progressbar"` with values), a color picker is a group of radio
buttons, a toggle is a `<button aria-pressed>`. The shell's tabs are the one
place where ARIA roles are required — follow the APG tabs pattern exactly.
If a custom widget is unavoidable, define its **role**, **keyboard
behavior**, **accessible name**, **state** and **relationships**. Never
remove a focus indicator without a visible replacement.

### Pattern 3: Prioritize by user impact

| Priority   | Category                                                      | Examples                                                                                                                                    |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **HIGH**   | Blocks a keyboard or screen-reader user, or endangers someone | Tabs unreachable by keyboard, focus lost to the host on close, a CTA with no name, a focus trap, a rank-up effect flashing above 3/s        |
| **MEDIUM** | Degrades the experience                                       | Tab changes not announced, low contrast on grey metadata, green as the only "completed" signal, ranking as div soup, progress with no value |
| **LOW**    | Best practice / informational                                 | Heading level skips inside a screen, decorative pixel art with chatty alt text, redundant `title` attributes                                |

### Pattern 4: Structured audit finding format

Every finding uses this format (the scanners emit it too):

```text
[SC {number}] {Finding title} — {HIGH | MEDIUM | LOW}
Location: {file path}:{line, if known}
Issue: {What is wrong and why it fails WCAG}
Fix: {Specific recommended change}
```

Example:

```text
[SC 1.3.1] Ranking rendered as divs — MEDIUM
Location: src/screens/ranking/jogadores.js:14
Issue: Position, player, tier and matches are laid out with <div>s, so a
screen reader can't announce the column a value belongs to.
Fix: <table> with <caption>, <th scope="col"> per column and the position
cell as <th scope="row">.
```

---

## POUR audit sequence

### P — Perceivable

#### 1.1 — Text alternatives (SC 1.1.1 · Level A)

**Alt text policy for the panel** (enforced by `audit-a11y.py`'s
`decorative-asset-alt` / `informative-asset-alt` rules):

| Asset                                   | Folder                   | Alt                                                                                                                           |
| --------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| RBG badges (flat, pixel)                | `public/assets/brand/`   | `"RBG"` once (the header brand); decorative repeats `alt=""`                                                                  |
| Player avatars (pixel art)              | `public/assets/avatars/` | pt-BR, with the player name: `"Avatar de Atleta Exemplo"`; `alt=""` if the name is adjacent text **and** the avatar adds nothing |
| Item / reward art                       | `public/assets/items/`   | What the item is, in pt-BR (`"Coroa dourada"`); rarity and price stay visible text                                            |
| Rank tier medals                        | inline SVG or `assets/`  | The tier as text (`"Prata IV"`); if the tier is also visible text next to it, `alt=""`                                        |
| Pitch lines, laurel ornaments, patterns | inline SVG / CSS         | Decorative: `alt=""` / `aria-hidden="true"`                                                                                   |
| Icons inside a labelled button          | inline SVG               | `aria-hidden="true"`; the button carries the name                                                                             |

```html
<!-- ✅ informative -->
<img src="/assets/avatars/Atleta Exemplo.png" alt="Avatar de Atleta Exemplo" class="pixel" />
<!-- ✅ decorative -->
<svg class="pitch-lines" aria-hidden="true" focusable="false">…</svg>
```

Text set as an image fails SC 1.4.5 — numbers, ranks and prices are real
text. Emoji are never item art or icons (taste and a11y both: screen
readers read their Unicode names).

#### 1.3 — Info and relationships (SC 1.3.1, 1.3.2 · Level A)

- **Headings:** the brand label `#rbg-title` names the dialog; each screen
  starts at `h2` (`.visually-hidden` if the design has no visible title);
  sections use `h3`. Never skip levels to get a size.
- **Reading order = DOM order.** Container-query layouts that move the hero
  (avatar, big number) with `order`/grid areas must not reverse the logical
  order — write the DOM in the order a player reads it.
- **Tables for tabular data:** ranking, match history, roster with stats →
  `<table>` with `<caption>` (can be visually hidden), `<th scope="col">`,
  row headers where meaningful. Pagination (`Anterior`/`Próxima`) is a
  `<nav aria-label="Paginação">` of buttons, current page with
  `aria-current="page"`.
- **Progress:** missions, battle-pass XP, rank PDL → `<progress
value max>` or `role="progressbar"` with `aria-valuenow/min/max` and
  `aria-valuetext` in pt-BR (`"455 de 860 XP"`), plus the same numbers as
  visible text.
- Lists are `<ol>`/`<ul>` (missions, rewards, items). Key/value stats are
  `<dl>`.
- Content of inactive tabs is not in the DOM (the shell renders one view);
  states like `locked` say why in text, not only with a lock icon.

#### 1.4 — Distinguishable (SC 1.4.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12 · Level AA) — WCAG and APCA

Evaluate every text/background pair against **both** metrics — they
disagree often enough to matter. WCAG 2.x is what SC 1.4.3/1.4.11 require;
APCA (the basis of the emerging WCAG 3 contrast method) also accounts for
size and weight.

**WCAG 2.2 Level AA minimum contrast ratios:**

| Element                                       | Ratio   |
| --------------------------------------------- | ------- |
| Normal text (< 18pt or < 14pt bold)           | ≥ 4.5:1 |
| Large text (≥ 18pt or ≥ 14pt bold)            | ≥ 3:1   |
| UI components & graphical objects (SC 1.4.11) | ≥ 3:1   |

**APCA Lc reference** ([APCA easy intro](https://git.apcacontrast.com/documentation/APCAeasyIntro.html)):

| Lc  | Minimum use case                                           |
| --- | ---------------------------------------------------------- |
| 90  | Preferred minimum for fluent body text (~14px/weight 400+) |
| 75  | Minimum for body text (~18px/weight 400+)                  |
| 60  | Content text needing readability (~24px/400 or 16px/700)   |
| 45  | Headlines and pictograms (~36px/400 or 24px/700)           |
| 30  | Other text: placeholders, disabled elements                |
| 15  | Non-text discernible elements (5px+ dimension)             |

APCA's Lc runs roughly −108 to 106 and is signed: positive = dark text on
light, negative = light text on dark. Compare `abs(Lc)` against the table.

**Panel rules (the palette is ink, paper, three greys and pitch green —
see `rbg-taste`):**

- Body and metadata text on ink or paper meets **≥ 4.5:1 and |Lc| ≥ 75**;
  the lightest grey is for disabled/hairlines only, never for text a player
  needs.
- **Pitch green** is checked in both directions: green text on ink, ink or
  paper text on a green CTA, and green progress fills against their track
  (≥ 3:1, SC 1.4.11). Hairlines that separate meaning (table rows, tab
  underline for the selected tab) are ≥ 3:1 or the meaning has another cue.
- **Rank and rarity colors are data:** each tier/rarity chip still names
  itself in text; check its text contrast like any other pair.
- **Color is never the only signal (SC 1.4.1):** the selected tab (also
  `aria-selected` + a shape/underline), a completed mission (also text or a
  check icon with a label), "live/online" (also a word), win/loss in match
  history (also `V`/`D`/`E` text).
- **Reflow and text spacing (SC 1.4.10, 1.4.12):** the panel is fluid, so
  these apply. Every screen works at the `shrunk` size without horizontal
  scroll inside `.rbg-panel`, and survives the text-spacing bookmarklet
  values without clipping (watch tab labels, CTA, table cells).

Literal pairs declared in the same rule are computed exactly by
`audit-a11y.py`; anything through `var(...)` or over pixel art needs the
rendered check (`a11y-self-check.js` resolves computed colors) or a manual
picker — the [APCA Contrast Calculator](https://apcacontrast.com/) and
[achecks.org's checker](https://www.achecks.org/apca-accessible-colour-contrast-checker/)
both work.

---

### O — Operable

#### 2.1 — Keyboard accessible (SC 2.1.1, 2.1.2, 2.1.4 · Level A)

- **Open:** the host launcher is a `<button>`; activating it opens the
  panel and moves focus to the active tab.
- **Tabs (two levels):** each tablist is **one Tab stop** (roving
  `tabindex`: `0` on the selected tab, `-1` on the others). `←/→` move and
  activate (automatic activation), `Home`/`End` jump, wrap at the ends.
  Tab from the main tablist goes to the sub-tablist (if any), then into the
  view, then the action bar CTA, then the header controls per DOM order.
- **Close:** Esc anywhere in the panel and the close button close it and
  return focus to the launcher. Esc inside an inner open widget (a menu, a
  confirm) closes that widget first.
- **No keyboard trap (SC 2.1.2):** the panel is non-modal toward the host
  unless `panel-embedding` decides otherwise; if it is ever made modal, the
  trap is complete (Tab cycles inside) and Esc always exits.
- **Single-character shortcuts (SC 2.1.4):** none. If one is ever added, it
  is disabled while a text field has focus or is remappable.
- **Focus after a view change:** switching tab/sub-tab keeps focus on the
  tab that was activated (APG); the view is not auto-focused. Actions that
  replace content inside the view (pagination, a state change) move focus to
  the new content's heading (`tabindex="-1"`) or keep it on the control if
  the control still exists.

#### 2.2 — Enough time / pause (SC 2.2.1, 2.2.2 · Level A)

Nothing in the panel moves for more than 5 seconds on its own. Countdown
text (`Vira em 19 h 47 min`) updates at most once a minute and is not a
live region. No auto-rotating carousels in the shop.

#### 2.3 — Seizures (SC 2.3.1 · Level A)

**No more than 3 flashes per second, anywhere.** Celebration effects
(rank-up, reward claimed, level up) are one-shot, under 1 s, confined to
their element, and never flash the whole panel. A strobing full-panel
transition is a HIGH finding regardless of how good it looks.

#### 2.3.3 / reduced motion (guidance)

Honor `prefers-reduced-motion: reduce`: tab transitions become instant or a
short opacity fade, count-ups show the final number, progress fills render
at their final value, celebrations become a static state change. The
`reduced-motion` Playwright project runs the whole suite in that mode.

#### 2.4 — Navigable (SC 2.4.2, 2.4.3, 2.4.4, 2.4.6, 2.4.7, 2.4.11 · Level A/AA)

- The dialog has an accessible name (`aria-labelledby="rbg-title"`), each
  tab and sub-tab a visible pt-BR label (SC 2.4.6).
- Focus order follows reading order (SC 2.4.3).
- Button and link text names the action on its own: `Ver passe`, not `Ver
mais`; an arrow icon after the text is `aria-hidden` (SC 2.4.4).
- Focus is visible: `:focus-visible` gets a ≥ 2px outline with offset that
  is ≥ 3:1 against ink, paper **and** pitch green (SC 2.4.7, 1.4.11).
- A focused element is never hidden under the action bar or the header —
  the view's `scroll-padding` covers both (SC 2.4.11).

#### 2.5 — Input modalities (SC 2.5.3, 2.5.7, 2.5.8 · Level A/AA)

- Targets are ≥ 24×24 CSS px everywhere and ≥ 44×44 for the primary CTA,
  tabs and close — **check at the `shrunk` size**, where compact layouts
  tend to shrink tabs into icons.
- Dragging (e.g. rotating the avatar) always has a button alternative
  (`Girar avatar`) (SC 2.5.7).
- Visible label is contained in the accessible name (SC 2.5.3) — icon-only
  tabs at compact sizes keep the label as `aria-label` matching the text
  label shown at larger sizes.

---

### U — Understandable

#### 3.1 — Readable (SC 3.1.1, 3.1.2 · Level A/AA)

- `#rbg` has `lang="pt-BR"`; the host simulator's `<html>` also declares
  `lang="pt-BR"` (the real host owns its own `<html>` — never rely on it).
- **Language of parts:** English product terms used as names (`RCS Week`,
  `MVP`) don't need `lang="en"`; whole English phrases do.
- Abbreviations a player may not know (`PDL`, `V/D/E`) are explained once
  per screen in text or with `<abbr title>` plus a visible legend.

#### 3.2 — Predictable (SC 3.2.1, 3.2.2 · Level A)

Focusing a tab with Tab never switches it; arrow keys do (APG automatic
activation is the expected behavior there). A color choice or a radio
doesn't save until the player presses the save button. The action bar CTA
says what it will do in the current context.

#### 3.3 — Input assistance (SC 3.3.1, 3.3.2 · Level A)

Forms (club identity, invites) have visible labels, error text tied with
`aria-describedby`, `aria-invalid` on the field, and errors in pt-BR.

---

### R — Robust

#### 4.1 — Compatible (SC 4.1.2, 4.1.3 · Level A/AA)

- **Dialog:** `role="dialog"` + `aria-labelledby="rbg-title"`. Don't add
  `aria-modal="true"` unless the panel really traps focus.
- **Tabs:** `role="tablist"` (with `aria-label`: `"Seções"`,
  `"Subseções"`), `role="tab"` with `aria-selected`, `aria-controls`
  pointing at the view's id, `tabindex` roving; the view has
  `role="tabpanel"` and `aria-labelledby` pointing at the selected tab
  (sub-tab when present). A `Novo` badge is part of the tab's name
  (`"Loja, novo"`), not a separate focus stop.
- **Status messages (SC 4.1.3):** `#rbg-status` (`aria-live="polite"`)
  announces every tab or sub-tab change. Don't add a second live region for
  the same event, don't make it `assertive`. Other status messages (item
  bought, color saved, mission completed) go through the same region or a
  local `role="status"` — once, briefly.

| Widget             | Role                               | Key attributes                                              |
| ------------------ | ---------------------------------- | ----------------------------------------------------------- |
| The panel          | `dialog`                           | `aria-labelledby`, no `aria-modal` unless it traps focus    |
| Tabs / sub-tabs    | `tablist` + `tab` + `tabpanel`     | `aria-selected`, `aria-controls`, roving `tabindex`         |
| Segmented control  | radio group (`fieldset` + `radio`) | native `checked`, `legend`                                  |
| Toggle             | `button`                           | `aria-pressed`                                              |
| Progress           | `progress` / `progressbar`         | `value`/`max` or `aria-valuenow/min/max`, `aria-valuetext`  |
| Pagination         | `nav` + buttons                    | `aria-label`, `aria-current="page"`                         |
| Status/toast       | `status`                           | `aria-live="polite"`                                        |
| Confirm (buy item) | `dialog` (native `<dialog>`)       | `aria-labelledby`, focus trap while open, return to trigger |

#### The action bar CTA (SC 4.1.2, 1.4.3, 2.4.6)

- The CTA is a native `<button>` whose name is its visible pt-BR text
  (`JOGAR`, `VER ESCALAÇÃO`, `CRIAR AMISTOSO`) — the eyebrow and title stay
  outside the button and are linked with `aria-describedby` if the label
  alone is ambiguous.
- **Disabled CTA:** prefer `aria-disabled="true"` over the `disabled`
  attribute so the button stays focusable and its name reaches screen
  readers; activating it does nothing (or announces why through
  `#rbg-status`). The **reason** it is disabled is visible text in the
  action bar (`aria-describedby` points at it). Disabled text is exempt
  from SC 1.4.3, but the player still has to read it: keep it ≥ |Lc| 45 and
  never signal "disabled" by color alone — add the reason text or a shape
  change.
- A mode change updates `.rbg-actionbar[data-mode]` and the CTA label in
  place; it is announced once through `#rbg-status` only if the player
  triggered it from Jogar.

### Pattern 5: ARIA ID references must resolve in the rendered DOM

`aria-labelledby`/`aria-describedby`/`aria-controls` only work when the ID
exists, is unique and is in the same DOM. Only one view is rendered at a
time, but prefix screen IDs with the tab and sub id
(`id="ranking-jogadores-caption"`) so two states or a future side panel
can't collide, and so they never collide with the **host's** IDs.

### Pattern 6: The panel needs a live, hands-on keyboard pass — not just source inspection

Reading a screen module or running a scanner can look clean while a tab is
unreachable, arrows don't wrap, or Esc drops focus on `<body>`. **Before
calling accessibility work done**, run `npm run dev` and:

1. From the launcher, open the panel: focus lands on the active tab.
2. Walk every tab with `←/→`, `Home`, `End`; then every sub-tab. Each
   change is announced once and focus stays on the tab.
3. Tab through the whole panel once: tablists are one stop each, every
   control in the view and the action bar CTA are reachable, the focus ring
   is visible on ink, paper and green.
4. Use pagination and any in-view control; focus lands somewhere sensible.
5. Press Esc (and the close button): the panel closes, focus returns to the
   launcher; reopen.
6. Repeat 1–5 at the `shrunk` size.

[`references/self-validation-checklist.md`](references/self-validation-checklist.md)
§4 is the mandatory checklist version. `playwright/tests/navigation.spec.js`
automates the key mapping, but not the judgement calls above.

### Pattern 7: The panel lives inside someone else's app

1. **Sizes:** check compact, regular and wide container sizes — targets,
   truncation (never truncate a player or club name without the full name
   available), text spacing.
2. **Zoom:** browser zoom at 200% on a 1280×720 host shrinks the panel to
   the compact class — it must still work (SC 1.4.4).
3. **No leaking styles:** nothing in `styles/` targets `html`, `body`, `*`
   or bare element selectors outside `.rbg` — a global `outline: none` or
   `font-size` would break the host's accessibility. `audit-a11y.py`'s
   `global-style-leak` rule flags it.
4. **Focus boundary:** opening and closing never leaves focus on an element
   that no longer exists.
5. **Flashing and motion:** no effect exceeds 3 flashes/s; reduced motion
   still tells the whole story (rank up, reward unlocked).
6. **Audio:** if a screen ever plays sound, it never auto-plays and has a
   keyboard-operable mute that exposes its state (`aria-pressed`) (SC 1.4.2).

---

## Decision tree

```text
Is it an <img>?                                → Needs alt (1.1.1) — apply the alt policy table
Is it an avatar or item?                       → pt-BR alt naming the player/item
Is it a laurel, pitch line, pattern or icon?   → alt="" / aria-hidden="true"
Is it an emoji standing in for an item/icon?   → Replace it with real art or an SVG icon
Is it text or a number drawn as an image?      → Set it as real text (1.4.5)

Does the screen start at h2?                   → #rbg-title labels the dialog; h2 per screen (1.3.1)
Is it ranked/columnar data?                    → <table> + caption + th scope (1.3.1)
Is it progress?                                → <progress> or progressbar + valuetext (1.3.1, 4.1.2)
Does DOM order match reading order?            → Reorder the DOM, place with grid areas (1.3.2)

Is it interactive?                             → Native element? (<button>, <a href>, input)
  YES → Use it (Pattern 2)
  NO  → role + tabindex + keyboard + aria state (2.1.1, 4.1.2)
Is it a tab?                                   → APG tabs: roving tabindex, ←/→ Home End (2.1.1)
Is its size ≥ 24px (≥ 44px for CTA/tabs/close) → Check at shrunk (2.5.8)
at shrunk?
Does it require dragging?                      → Add a button alternative (2.5.7)

Does the CSS remove :focus outline?            → Must have a visible :focus-visible style (2.4.7)
Is the focus ring ≥ 3:1 on ink, paper, green?  → (1.4.11)
Does the text meet ≥ 4.5:1 / |Lc| ≥ 75?        → (1.4.3)
Is color (green, tier, rarity) the only signal?→ Add text/shape/position (1.4.1)
Does it work at shrunk with no h-scroll?     → (1.4.10)
Does any selector escape .rbg?                 → Scope it (panel-embedding)

Does anything flash?                           → ≤ 3/s, small area, one-shot (2.3.1)
Does anything loop for > 5s?                   → Don't; or pausable and off under reduced motion (2.2.2)
Does it animate at all?                        → Reduced-motion state that tells the same story

Is a tab change announced?                     → #rbg-status only, polite (4.1.3)
Does Esc/close return focus to the launcher?   → (2.4.3)
Is the action-bar CTA disabled?                → Name + reason still perceivable (4.1.2, 1.4.3 note)
Do aria-* ID references resolve?               → Unique, tab/sub-prefixed IDs (Pattern 5)
```

---

## Automated checks

Three layers, cheapest first. None replaces Pattern 6's live pass.

### 1. Static scanner — `scripts/audit-a11y.py`

```bash
python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py              # index.html, src/, styles/
python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py src/screens --json
python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py --min-confidence medium
```

Stdlib-only. Reads `index.html`, the template strings in `src/**/*.js` and
`styles/**/*.css`, and checks: missing `alt`, the panel's alt policy
(decorative vs. informative asset folders), emoji used as content, a
heading per screen, icon-only controls without a name, unlabeled form
controls, heading sequence, `outline: none` without `:focus-visible`,
clickable `div`/`span`, tab/ARIA widget state, progress without values,
tables without headers, small targets, error inputs, global style leaks and
color contrast. When text and background are both literal colors in the
same rule it computes the **exact WCAG ratio and APCA Lc** (SA98G 0.0.98G,
ported from the W3-licensed [apca-w3](https://github.com/Myndex/apca-w3)); a
lone literal text color is flagged for a manual check.

Every check carries a confidence level, printed before the findings:

| Confidence | Meaning                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| **HIGH**   | Purely syntactic — if it fires, the finding is correct.                     |
| **MEDIUM** | Contextual heuristic — usually right, can miss runtime or cross-file cases. |
| **LOW**    | Suggestive only — confirm every hit by hand.                                |

Score: 100 minus `impact_weight × confidence_multiplier` per finding
(HIGH=10/MEDIUM=5/LOW=2 × HIGH=1.0/MEDIUM=0.6/LOW=0.3), floored at 0.

| Score  | Verdict                                                        |
| ------ | -------------------------------------------------------------- |
| 90–100 | Strong — spot-check the flagged items, not a certification.    |
| 75–89  | Needs attention — review HIGH/MEDIUM findings before shipping. |
| 50–74  | Significant gaps — fix every HIGH finding first.               |
| 0–49   | Not ready — multiple high-impact blockers.                     |

It cannot see: colors via `var(...)` or over pixel art; real keyboard
behavior; screen-reader output; anything set at runtime.

### 2. In-page self-check — `scripts/a11y-self-check.js`

Runs inside the rendered page, so it sees computed colors, the real Tab
order, element sizes, the tabs' ARIA state and how the shell answers key
presses.

- **Automated:** `playwright/tests/a11y.spec.js` injects it into every
  screen × state (`/?tab=&sub=&state=&mode=`, with
  `window.A11Y_SELF_CHECK_HEADLESS = true`, so no floating button) and
  fails on any `status: "fail"` with `impact: "HIGH"`. Runs in every
  Playwright project with `npm test`.
- **By hand:** paste the file into the DevTools console on `npm run dev`;
  click the floating **A11y** button → **Run checks** → **Copy report**.
  **Record keyboard walk** logs real key presses — the evidence for the
  "verify live" items. Console API:
  `await A11ySelfCheck.run({ root: '#rbg' })` →
  `{ results: [{ section, sc, check, status, impact, detail, elements }], report }`.
- Never ship it in `index.html`.

MEDIUM/LOW self-check failures don't fail the suite; triage them into the
priority table during an audit.

### 3. Browser tooling

axe DevTools or Lighthouse (Accessibility) on `npm run dev`, scoped to
`#rbg`, mapped `critical`/`serious` → HIGH, `moderate` → MEDIUM, `minor` →
LOW, filed in the Pattern 4 format.

When reporting, keep the evidence kinds apart: computed by a script, seen
in a live walk, still needs a person. Never report a `manual` item as
passed.

---

## Resources

- **Self-validation checklist**: [references/self-validation-checklist.md](references/self-validation-checklist.md)
  — box-by-box by area, with the mandatory live keyboard section and the
  embedded-panel section.
- **WCAG checklist**: [references/wcag-checklist.md](references/wcag-checklist.md)
  — full Level A + AA checklist with panel notes.
- **Static scanner**: [scripts/audit-a11y.py](scripts/audit-a11y.py).
- **In-page self-check**: [scripts/a11y-self-check.js](scripts/a11y-self-check.js).
- **Panel contract**: [`panel-builder`](../panel-builder/SKILL.md).
- **Playwright**: [`playwright-worker`](../playwright-worker/SKILL.md) owns the
  specs that run these checks.
- **Motion**: [`motion`](../motion/SKILL.md) — the recipes' reduced-motion
  states and flash limits.
- **W3C WCAG 2.2**: https://www.w3.org/TR/WCAG22/ · **Quick Reference**:
  https://www.w3.org/WAI/WCAG22/quickref/ · **WAI-ARIA APG**:
  https://www.w3.org/WAI/ARIA/apg/
- **APCA**: [easy intro](https://git.apcacontrast.com/documentation/APCAeasyIntro.html) ·
  [calculator](https://apcacontrast.com/) ·
  [ruitina.com guide](https://ruitina.com/apca-accessible-colour-contrast/) ·
  [achecks.org checker](https://www.achecks.org/apca-accessible-colour-contrast-checker/) ·
  [reference implementation](https://github.com/Myndex/apca-w3)
