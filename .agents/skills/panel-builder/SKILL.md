---
name: panel-builder
description: >
  How the RBG panel is built: the three 16:9 size presets that reflow to
  fit the host window, container queries, the shell (header, tabs, sub-tabs, view, action bar, announcer),
  the screen module contract, the state model, the URL contract, mock data,
  assets and file layout — plus the checklist for adding or changing a
  screen without breaking navigation, tests, or the facts the panel is
  allowed to show.
  Trigger: adding, editing, reordering or removing a tab, sub-tab or screen;
  adding a screen state; touching `src/panel.js`, `src/screens/`,
  `src/data/`, `styles/` or `index.html`; wiring an asset; or asking "how
  does the panel work".
metadata:
  author: davecelot
  version: '1.1.0'
  changelog: >
    1.1.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.0.0: Initial skill for rbg-ui, adapted from ppt-make-a-thon's
    deck-builder — the fixed 1920×1080 stage became a fluid panel embedded
    in a host app, slides/steps became tabs/sub-tabs/states.
  auto-invoke: 'Adding, editing or removing a tab, sub-tab, screen or state, or touching the panel shell'
  allowed-tools: [Read, Edit, Write, Grep, Glob, Bash]
---

# Panel builder

RBG is a fútbol game hub that opens as a **panel inside someone else's app**
(a pixel-art hotel). The panel is plain HTML/CSS/JS served by Vite (see the
`no-frameworks` rule) and must respect the `panel-embedding` rule. This skill
is the contract every screen and every shell change must keep.

## Anatomy

| Piece                        | Role                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `index.html`                 | **Host simulator** (dev only): `.host` backdrop + the panel mount `#rbg` + a launcher to reopen it.  |
| `main.js`                    | Imports `styles/*.css` and starts `mountPanel(root, tabs)`.                                          |
| `src/panel.js`               | The shell: tab/sub-tab state, keyboard, URL sync, open/close + focus, rendering, announcements.      |
| `src/screens/index.js`       | The ordered tab registry — **order here is tab order**.                                              |
| `src/screens/<tab>/<sub>.js` | One screen per file, `<tab>` and `<sub>` in kebab-case (ids in `docs/screen-inventory.md`).          |
| `src/data/<entity>.js`       | Mock data (players, clubs, ranks, missions, items…) — values only from the screen inventory.         |
| `styles/tokens.css`          | Design tokens (color, type, space, radius, easing, durations) — roles defined by `rbg-taste`.        |
| `styles/base.css`            | Panel root scope, shell layout, shared primitives, reduced-motion floor. Never styles `html`/`body`. |
| `styles/screens/<tab>.css`   | Tab-specific styles, scoped under `.rbg-screen--<tab>`. Import it from `main.js`.                    |
| `public/assets/`             | Static assets served from `/assets/…` (see [references/assets.md](references/assets.md)).            |

## The panel box

- The player picks a **`Resolução da janela` preset** in Settings (gear):
  1024×576, 1280×720 (default) or 1600×900 — `src/data/sizes.js`. The
  choice persists in `localStorage['rbg:size']`; `?size=` overrides it.
- The panel is always **16:9**: `width: min(var(--panel-w), 100cqw - 2g,
(100cqh - 2g) × 16/9)` with `aspect-ratio: 16 / 9`, where `cq*` units
  come from the `.rbg` root (`container: host / size`). When the preset
  doesn't fit the window it **reflows smaller** — never `transform: scale`.
- `.rbg-panel` is a size container (`container: rbg / size`). Layout adapts
  with **`@container rbg (…)` queries**, never `@media` on the viewport and
  never `vw`/`vh` units.
- Size classes: **compact** below 1100 px wide (the 1024 preset and shrunk
  panels), **regular**, **wide** from 1500 px (the 1600 preset) — literals
  noted in `tokens.css`. The smallest supported panel (≈992×558) is
  recorded in `.ai/DECISIONS.md`; every screen must work there without
  horizontal scroll.
- Header, tabs and action bar are fixed rows; **only the view scrolls**
  (`.rbg-view { overflow: auto }`). Nothing essential hides under the
  action bar.

## Shell markup (selectors are a contract — specs use them)

```
#rbg.rbg[lang="pt-BR"]
  section.rbg-panel[role=dialog][aria-labelledby=rbg-title]
    header.rbg-header      → #rbg-title (brand), [data-action=settings] + fieldset#rbg-settings (size radios), [data-action=close]
    nav.rbg-tabs           → [role=tablist] > button[role=tab][data-tab=<id>]
    div.rbg-subtabs        → [role=tablist] > button[role=tab][data-sub=<id>] (only when a tab has > 1 sub)
    div.rbg-view[role=tabpanel][data-tab][data-sub][data-state]   (not <main>: the host owns the landmarks)
    footer.rbg-actionbar   → .rbg-actionbar__eyebrow, .rbg-actionbar__title, [data-action=primary]
  p#rbg-status[aria-live=polite].visually-hidden
```

## Screen module contract

```js
export default {
  id: 'missoes', // kebab-case sub id; becomes .rbg-screen--<tab> .rbg-sub--missoes
  tab: 'meu-time',
  label: 'Missões', // pt-BR, literal from the inventory; sub-tab label + announcement
  states: ['default', 'empty', 'loading'], // first one is the default
  render: ({ state, data }) => `…`, // returns markup; pt-BR copy
};
```

- `render` returns static markup for one state. If a screen truly needs
  script (a count-up, a picker, rotating the avatar), export
  `enter(viewEl, panel)` and return a cleanup; the shell runs the previous
  screen's cleanup before the next render. `panel` offers `setMode(id)`,
  `announce(text)` (through `#rbg-status`), `refresh()` (re-render the
  current screen after an in-memory data change) and `close()`.
- Links between screens are plain buttons: `data-go="<tab>"` and, to land
  on a sub-tab, `data-go-sub="<sub>"`; the shell switches, announces and
  moves focus to the selected tab. A control whose destination isn't built
  yet carries `data-pending="<label>"` and announces that instead.
- Shared pieces live beside the screens: `src/screens/format.js`
  (units, chevron, `goLink`), `src/screens/icons.js` (every icon, Material
  Symbols Outlined — add new glyphs there), `src/screens/avatar.js` (the avatar stage and
  `Girar`), `src/screens/equip-picker.js` (the equip picker).
- Every screen ships at least `default`. Add `loading`, `empty`, `error`,
  `locked` whenever the inventory shows or implies them — a list screen
  without an `empty` state is not done.
- Headings: the brand is the panel's `h1`-level label; each screen starts
  at `h2`.
- Avatars and pixel art: integer scaling only, `image-rendering: pixelated`,
  pt-BR `alt` with the player name; decorative art `alt=""`.

## Tab registry contract

```js
export const tabs = [
  {
    id: 'perfil',
    label: 'Perfil',
    badge: null, // or 'Novo' — only where the inventory shows one
    subs: [perfilOverview, perfilHistorico, perfilPartidasTime],
  },
];
```

## The play bar (global, owner answer 2)

The bottom bar always shows the **chosen play mode** and its one CTA, the
same on every tab (`src/data/modes.js`). A mode is
`{ id, eyebrow, title, cta, go?, disabled?, reason?, pending? }`:

- `go: { tab, sub, mode? }` — where the CTA leads, and the mode it sets
  there (`Jogar` → the mode picker; `Confirmar` → the chosen mode).
- `disabled` + `reason` — the CTA stays focusable (`aria-disabled`), the
  reason shows under the bar title (`aria-describedby`) and is announced
  when pressed. Reasons are inventory copy, never invented.
- `pending` — the CTA announces "ainda não está no protótipo".

Only the places where modes are picked change the mode: Jogar's picker and
mode screens, RCS Week's queue. A screen that owns a mode sets it in
`enter()` with `panel.setMode(id)` guarded by `panel.mode()`; the shell
calls `enter()` last in `render()` precisely so that re-render can happen.

## Item templates (content injected at runtime)

Items come from the game; the panel ships **templates**, never hard-coded
item content. Three templates cover every item surface in the inventory:

**0. Item tile** — the slot every list is made of: the pass track (8.2),
the shop grid (9), special rewards and trophies (4.7), equip options (2.4).
One tile per **item type** (`comemoração`, `moldura`, `banner`,
`pose-mvp`, `card`, `título`, `entrada`, `apresentação-vs`, `número`,
`chuteira`), each with a fixed art slot shaped for that type (a banner is
wide, a frame is square around an avatar, a card is portrait). Shared
fields: name, type label, rarity (data only, small), state (`locked` with
its condition — pass level, club milestone, `GRÁTIS` —, `for-sale` with a
price, `owned`, `equipped`). Lists of tiles must handle any count (the pass
track has dozens) without layout changes. Built: `src/screens/item-tile.js`
(`.rbg-tiles` / `.rbg-tile` in `base.css`) — no resting frame, the art slot
is the tile; a border appears only on hover and focus; the top row carries
the level or condition and the lock, so the lock never sits on the art.

**1. Item sheet** — a dialog inside `.rbg-panel` for one item you don't
have yet: shop items (9.1, C22), pass rewards (8.1) and club rewards (4.7).
Built for the locked state: `src/screens/item-sheet.js` — a screen's
`enter()` returns `itemSheets(view, panel, find)`, and any `[data-item]`
tile opens the sheet docked over the view (the shell's tabs and play bar
stay whole). Both states are built: `locked` (pass and club rewards) and
`for-sale` (Loja: price, `Comprar por …`, gift row).

```js
{
  id, name, category, rarity, // rarity: 'comum' | 'rara' | 'épica' | 'lendária' …
  art, preview, previewCaption, // pixel art + how it looks once equipped
  state: 'for-sale' | 'locked',
  price: { brl, eur, usd }, // for-sale: `Comprar` + gift row
  unlock: { source: 'pass' | 'club', level: 8 }, // locked: unlock text, optional replay
}
```

**2. Equip picker** (built: `src/screens/equip-picker.js`) — where owned items get equipped: `Personalizar perfil`
(card, banner, frame — 2.4) and the Vestiário detail views (pose,
celebration, number, boots — 3.6). Layout: live preview + the equipped
item's detail + a grid of owned options including `Nenhum`; empty state
points to where items are earned.

- Owned items never appear in the Loja (owner); there is no "owned" state
  in the item sheet.
- Mock items in `src/data/shop.js` and `src/data/pass.js` exist only to
  exercise every type and state; test with the longest names in the
  inventory and with missing art (the slot must still read as that type).
- Both render **inside** `.rbg-panel` (never the top layer); focus moves in
  on open and back to the trigger on close; `Esc` closes them before
  anything else.

## Navigation & URL contract (tested in `playwright/tests/navigation.spec.js`)

- Tabs follow the WAI-ARIA tabs pattern: `←/→` move and activate,
  `Home`/`End` jump; same for sub-tabs. One tab stop per tablist.
- `Esc` or the close button closes the panel and returns focus to the host
  launcher; reopening focuses the active tab.
- `?tab=<id>&sub=<id>&state=<state>&mode=<id>&size=<id>` restores position
  (dev/QA deep link); unknown values fall back to the first
  tab/sub/state/mode and the stored or default size.
- `Esc` closes the settings popover first (focus back on the gear), and the
  panel only when nothing is open inside it.
- `.rbg-view[data-tab][data-sub][data-state]` and
  `.rbg-actionbar[data-mode]` always mirror state;
  `#rbg-status` announces every tab or sub-tab change
  (`"<Tab> — <Sub>"`).

Changing any of the above means updating `navigation.spec.js` in the same
change.

## Facts the panel may show

Features, labels, fields, currencies, rewards and sample values come only
from [`docs/screen-inventory.md`](../../../docs/screen-inventory.md) (read
from `reference/current-app/`) or the owner. Never invent a feature, a
reward, a price, a rank tier or a stat — see the `design-direction` rule.
The redesign may **restructure** (merge, regroup, reorder, demote) — it may
not add product scope. Missing data → a visible `[placeholder]` plus a
question to the owner.

## Adding or changing a screen — checklist

1. `hammock` ladder first; read `rbg-taste` for the tab's intent.
2. Create `src/screens/<tab>/<sub>.js` (+ `styles/screens/<tab>.css` if new);
   register it in `src/screens/index.js`.
3. Take labels and data only from the screen inventory; put sample values in
   `src/data/`.
4. `a11y-checker` before writing markup; `motion` before animating.
5. Check every state at compact, regular and wide sizes.
6. `npm test` and `npm run lint`; screenshot walkthrough via
   `playwright-worker`; hand the frames to the `screen-critic` agent.
