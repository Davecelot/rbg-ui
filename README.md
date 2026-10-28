# RBG Panel

A UI/UX redesign of the RBG football hub, shown as a panel inside a pixel-art host app. The panel adapts to the player's window while preserving its 16:9 layout.

## Stack

- Vanilla HTML, CSS, and JavaScript
- Vite for local development and production builds
- Playwright for browser verification
- No runtime dependencies

The interface and player-facing copy are in Brazilian Portuguese. Source code, developer documentation, repository metadata, and this README are in English.

## Run locally

```bash
nvm use
npm install
npx playwright install chromium
npm run dev
```

Open <http://localhost:5173> to use the host simulator. Press `Esc` to close the panel; use the launcher at the lower left to reopen it. Open a screen directly with URL parameters, for example `/?tab=ranking&sub=jogadores`.

## Checks

```bash
npm run lint
npm run format
npm run test:harness
npm test
npm run build
```

Run the screenshot walkthrough with:

```bash
WALKTHROUGH=1 npm test -- walkthrough
```

## Project map

- `AGENTS.md`: agent-facing repository index and required workflows.
- `.agents/`: shared skills, rules, and review procedures.
- `.codex/` and `CLAUDE.md`: runtime entry points for agent tooling.
- `src/`: panel shell, screens, and synthetic demo data.
- `styles/`: panel tokens, shell styles, and screen styles.
- `public/`: local fonts and visual assets used by the panel.
- `playwright/`: browser configuration, helpers, and tests.
- `docs/`: creative brief, screen inventory, demo content, and verification notes.
- `.ai/DECISIONS.md`: cross-cutting decisions and project learnings.

## Project constraints

- Keep player-facing text and accessibility labels in Brazilian Portuguese.
- Use only synthetic demo data; do not add private player or account data.
- Keep runtime assets local. The panel must not load resources from other hosts.
- Preserve the host integration, keyboard behavior, reduced-motion support, and responsive 16:9 layout.

This GitHub repository contains a sanitized initial snapshot. Local reference captures and the original repository history are excluded.
