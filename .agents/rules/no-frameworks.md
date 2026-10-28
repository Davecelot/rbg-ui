# Rule: no-frameworks

The panel is plain **HTML, CSS and vanilla JavaScript** (ES modules). It
ships **no runtime dependencies**: no UI framework (React, Vue, Svelte, Lit),
no CSS framework (Tailwind, Bootstrap), no component kit, no animation
library (GSAP, Motion, anime.js), no chart library, and no CDN scripts.

The only packages in `package.json` are **dev dependencies** that never
reach the player's browser as code: Vite (dev server and static build),
`@playwright/test` (browser QA), ESLint and Prettier (lint and format).

What that means in practice:

- A screen is a module in `src/screens/<tab>/<sub>.js` exporting
  `{ id, tab, label, states, render }`, registered in
  `src/screens/index.js`. Markup is a template string; styling lives in
  `styles/`. See [`panel-builder`](../skills/panel-builder/SKILL.md).
- Tabs, sub-tabs, URL state, open/close and focus belong to the one shell,
  `src/panel.js`. Extend it; don't bring a second one.
- Motion is CSS transitions and keyframes first, the Web Animations API
  second (see [`motion`](../skills/motion/SKILL.md)).
- Progress bars, tables, segmented controls and icons are native HTML +
  CSS + inline SVG, written here.
- Fonts and images are files in `public/`, never remote URLs (see
  [`panel-embedding`](panel-embedding.md)).

**Adding a dependency** — runtime or dev — requires an entry in
[`.ai/DECISIONS.md`](../../.ai/DECISIONS.md) first (Context / Decision / Why
/ Watch out), stating what it does that the platform can't and what it
costs. A new runtime dependency also needs the owner's explicit go-ahead.

**Why:** the panel is a guest inside another app — every kilobyte and every
global a framework brings is a risk there. The UI is small enough that the
platform covers everything, and a framework or component kit pulls screens
toward its own defaults, a direct path to the generic look
[`design-direction`](design-direction.md) rules out.

**Enforcement:** `hammock`'s ladder and `security-guardian`'s dependency
gate both flag new dependencies; `review-rangers` treats a new runtime
dependency as a critical stop for a human. No hook blocks `npm install` —
ask first.
