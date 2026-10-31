# RBG Panel

RBG is a fútbol hub redesigned as a panel inside a pixel-art host app. This repository contains the front-end experience and a local host simulator; it has no back end. The panel adapts to the available window while preserving its 16:9 layout.

## Online demo

[Open the public UI demo](https://davecelot.github.io/rbg-ui/).

GitHub Actions builds and deploys `dist/` to GitHub Pages on pushes to `main`.
Only the static demo is deployed; purchases and matchmaking remain prototype actions.
Runtime image URLs use Vite’s base path so the demo works under `/rbg-ui/`.

## Requirements

- Node.js 22 or later
- npm

## Getting started

```bash
nvm use
npm install
npx playwright install chromium
npm run dev
```

Open <http://localhost:5173> to use the host simulator. Press `Esc` to close the panel, then use the launcher in the lower-left corner to reopen it. Open a screen directly with URL parameters, for example `/?tab=ranking&sub=jogadores`.

## Development commands

| Command                | Purpose                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run dev`          | Start the Vite development server and host simulator.               |
| `npm run lint`         | Check JavaScript with ESLint.                                       |
| `npm run format`       | Check formatting with Prettier.                                     |
| `npm run test:harness` | Run harness tests.                                                  |
| `npm test`             | Run the Playwright browser tests across the configured panel sizes. |
| `npm run build`        | Create the production build in `dist/`.                             |

Capture a walkthrough of the screens and states with:

```bash
WALKTHROUGH=1 npm test -- walkthrough
```

## Project structure

- `src/panel.js` — panel shell, navigation, URL state, and open/close behavior.
- `src/screens/` — screen modules, registered in `src/screens/index.js`.
- `src/data/` — synthetic data used by the demo screens.
- `styles/` — panel tokens, shell styles, and screen styles.
- `public/` — local fonts and visual assets.
- `playwright/` — browser configuration, helpers, and tests.
- `docs/` — [creative brief](docs/creative-brief.md), [screen inventory](docs/screen-inventory.md), demo content, and verification notes.
- `.agents/` — shared agent rules, skills, and review procedures, indexed by [AGENTS.md](AGENTS.md).
- `.ai/DECISIONS.md` — cross-cutting project decisions.

## Project conventions

- The interface, accessibility labels, and other player-facing text use Brazilian Portuguese (pt-BR). Repository documentation and source code use English.
- The panel uses vanilla HTML, CSS, and JavaScript. Vite, Playwright, ESLint, and Prettier are development dependencies; the panel has no runtime dependencies.
- Use synthetic demo data and keep runtime fonts and images in `public/`. The panel does not load resources from other hosts.
- Keep the panel scoped to its host, responsive to the available window, keyboard accessible, and compatible with reduced-motion preferences.

## Repository access

`@Davecelot` owns all files through `.github/CODEOWNERS`. GitHub rules require code-owner review for contributions and reserve updates to `main` for the repository administrator (currently only Davecelot). The owner can push directly; GitHub does not allow self-approval. Force pushes and deletion of `main` are blocked, including for the owner.

Contributors can fork the public repository and propose pull requests. Granting new administrator access also grants the owner-control ruleset bypass and must be a deliberate owner decision. Deployment runs only from `main` or a manual dispatch on `main`, uses pinned GitHub Actions, and publishes only `dist/`. Dependabot checks npm packages and GitHub Actions weekly.
