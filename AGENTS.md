# RBG panel — Agent Instructions

This is the canonical, agent-facing entry point for this repo. **This file
is an index, not documentation.** Knowledge lives in `.agents/skills/`,
`.agents/rules/`, `.agents/reviewers/`, `docs/` and `.ai/` — this file's job is
to point you to the right one. If you're about to write more than a link and
a one-line reason here, that content belongs in the target file instead.

Before acting, read all nine files in `.agents/rules/` once, then follow
the auto-invoke table for the current task. To invoke a skill, select it in
the host or read its exact local `SKILL.md`; never assume Claude tool names
exist on another host. Setup, capability mappings, hook trust, and manual
fallbacks: [`docs/agent-setup.md`](docs/agent-setup.md).

## What this repo is

A UI/UX redesign of **RBG**, a fútbol (soccer) game hub that opens as a
panel inside a pixel-art host app, sized by the player's window. Plain
HTML, CSS and vanilla JavaScript served by Vite, verified with Playwright.
UI only — no back-end. Look and feel: **premium and sporty** — Nike's
discipline × the RBG badges × fútbol culture × pixel art as photography.

| Path                       | What it is                                                                                          |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `index.html`               | Host simulator (dev only): pixel backdrop, the `#rbg` mount, a launcher to reopen the panel.        |
| `main.js`                  | Entry point — imports styles, mounts the panel with the tab registry and play modes.                |
| `src/panel.js`             | The shell: tabs, sub-tabs, states, play mode, URL sync, open/close, focus, announcements.           |
| `src/screens/`             | One module per screen (`<tab>/<sub>.js`); `index.js` is the tab registry and order.                 |
| `src/data/`                | Mock data drawn only from the screen inventory (`modes.js` = action-bar variants).                  |
| `styles/`                  | `tokens.css` (on `.rbg`, never `:root`), `base.css` (shell + primitives), `screens/<tab>.css`.      |
| `public/`                  | Brand badges, fonts, avatars, items — inventory in panel-builder's `assets.md`.                     |
| `playwright/`              | Config (five size-preset projects), `helpers/panel.js`, `tests/`.                                   |
| `reference/current-app/`   | Local-only screenshots of the current app — excluded from the private remote; never a style source. |
| `docs/creative-brief.md`   | Why the redesign exists, the player, constraints, success criteria.                                 |
| `docs/screen-inventory.md` | Every tab, sub-view, field, action and state of the current app — the allowed-facts list.           |
| `docs/simplicity-debt.md`  | hammock's deferred-simplification log.                                                              |
| `.ai/DECISIONS.md`         | Log of cross-cutting decisions and learnings.                                                       |
| `.agents/skills/<n>/`      | Reusable skills — see table below.                                                                  |
| `.agents/reviewers/`       | Subagents — see table below.                                                                        |
| `.agents/rules/`           | Mandatory shared rules — see table below.                                                           |
| `.agents/hooks/`           | Shared hook dispatcher, runtime, and tests; configured separately for Claude and Codex.             |

## Skills

| Skill               | Purpose                                                                                                                     | Location                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `panel-builder`     | The panel's contract: size presets, shell selectors, screen module, states, play mode, URL, assets, add-a-screen checklist. | [SKILL.md](.agents/skills/panel-builder/SKILL.md)     |
| `rbg-taste`         | Art direction: four pillars, Nike adaptation, palette/type roles, pixel art, tab intent map, anti-slop bar.                 | [SKILL.md](.agents/skills/rbg-taste/SKILL.md)         |
| `hallmark`          | Anti-AI-slop quality gate for design and copy (vendored from Nutlope/hallmark), with a game-UI slop catalogue.              | [SKILL.md](.agents/skills/hallmark/SKILL.md)          |
| `hammock`           | Decision-ladder discipline before writing code; review a diff, audit the repo, or track deferred simplifications.           | [SKILL.md](.agents/skills/hammock/SKILL.md)           |
| `motion`            | Build, review, audit or find opportunities for tab switches, progress fills, count-ups and reward moments.                  | [SKILL.md](.agents/skills/motion/SKILL.md)            |
| `a11y-checker`      | WCAG 2.2 check of the panel (POUR order, dialog, two-level tabs, focus return, contrast, reduced motion); MUST invoke.      | [SKILL.md](.agents/skills/a11y-checker/SKILL.md)      |
| `playwright-worker` | Real-browser QA on every size preset: navigation, overflow, a11y self-check, screenshot walkthroughs for review.            | [SKILL.md](.agents/skills/playwright-worker/SKILL.md) |
| `review-rangers`    | Multi-perspective committee review (a11y, motion, performance, taste, host-embedding, game-UX…) with a fix loop.            | [SKILL.md](.agents/skills/review-rangers/SKILL.md)    |
| `security-guardian` | Advisory dry-run before commit: secrets, npm audit, lockfile, nothing loaded from other hosts.                              | [SKILL.md](.agents/skills/security-guardian/SKILL.md) |
| `forge-me-a-skill`  | Create or audit a skill for this repo — structure, naming, frontmatter conventions.                                         | [SKILL.md](.agents/skills/forge-me-a-skill/SKILL.md)  |

Optional user-level Mody skills complement these: `mody:studio` (critique/polish),
`mody:ux-laws` (justify hierarchy), `mody:roaster` (stress-test a plan),
`mody:motion` (motion craft). Fudo/Fogo skills do **not** apply here.

## Reviewers

Use the shared procedures below with an independent subagent. Claude has
named wrappers; Codex/Work callers pass the procedure to their available
subagent tool. `screen-critic` must receive fresh context and frames, without
the author's reasoning. If independent delegation is unavailable, disclose
that limitation; self-review does not count as an independent verdict.

| Agent           | Purpose                                                                                                                | Location                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `screen-critic` | Fresh-context taste review of walkthrough frames against rbg-taste + hallmark + inventory; ship/fix (≤ 8 fixes).       | [screen-critic.md](.agents/reviewers/screen-critic.md) |
| `ship-check`    | Release check: lint, tests on every host size, audits, walkthrough, build, style leakage, remote loads; ready/blocked. | [ship-check.md](.agents/reviewers/ship-check.md)       |

## Rules

| Rule                            | Description                                                                                                                     | Location                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `read-agent-instructions-first` | `AGENTS.md` is the mandatory first entry point for orientation — follow its links, don't improvise.                             | [.agents/rules/read-agent-instructions-first.md](.agents/rules/read-agent-instructions-first.md) |
| `always-hammock`                | Invoke `hammock` for every non-trivial coding task, regardless of size.                                                         | [.agents/rules/always-hammock.md](.agents/rules/always-hammock.md)                               |
| `ui-frontend-best-practices`    | UI work invokes `a11y-checker` first, `rbg-taste` + `hallmark`, `motion` when animating, `playwright-worker`.                   | [.agents/rules/ui-frontend-best-practices.md](.agents/rules/ui-frontend-best-practices.md)       |
| `design-direction`              | The four pillars, the badges as brand truth, the inventory as feature truth, no invented facts, no AI-slop.                     | [.agents/rules/design-direction.md](.agents/rules/design-direction.md)                           |
| `panel-embedding`               | A good guest in the host: 16:9 presets that reflow, container queries, scoped styles, non-modal, focus return, no remote loads. | [.agents/rules/panel-embedding.md](.agents/rules/panel-embedding.md)                             |
| `no-frameworks`                 | Vanilla HTML/CSS/JS, no runtime dependencies; a new dependency needs a DECISIONS entry.                                         | [.agents/rules/no-frameworks.md](.agents/rules/no-frameworks.md)                                 |
| `git-workflow`                  | Private sanitized snapshot may be pushed only to `Davecelot/rbg-ui`; no raw captures, sensitive data or prior history.          | [.agents/rules/git-workflow.md](.agents/rules/git-workflow.md)                                   |
| `docs-language-split`           | Code and repository content are English; UI copy, aria and alt are pt-BR.                                                       | [.agents/rules/docs-language-split.md](.agents/rules/docs-language-split.md)                     |
| `comment-minimalism`            | Default to no comments; only add one for a non-obvious why.                                                                     | [.agents/rules/comment-minimalism.md](.agents/rules/comment-minimalism.md)                       |

## Auto-invoke table

| If you're asked to...                                                                 | Do this                                                                    |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Add, edit, reorder or remove a tab, sub-tab, screen or state, or touch `src/panel.js` | Invoke `panel-builder`, then `hammock`.                                    |
| Make any visual, layout, copy-tone or "looks generic / AI-made" decision              | Invoke `rbg-taste`, then run `hallmark` on the result.                     |
| Implement a non-trivial change, or review a diff for over-engineering                 | Invoke `hammock` (`review`/`audit`/`debt`/`gain`/`help` modes).            |
| Build, edit, or review screen markup or styles                                        | Invoke `a11y-checker` (mandatory — see `ui-frontend-best-practices`).      |
| Add, review, or audit a transition, progress fill or reward moment                    | Invoke `motion` (`build`/`review`/`audit`/`find`).                         |
| Test behavior, check overflow at host sizes, or capture screenshots                   | Invoke `playwright-worker`.                                                |
| Check what a feature shows or whether a field/reward/label exists                     | Read [`docs/screen-inventory.md`](docs/screen-inventory.md); never invent. |
| Get an unbiased visual review of finished screens                                     | Spawn the `screen-critic` agent with walkthrough frames only.              |
| Check whether the panel is ready to hand over                                         | Spawn the `ship-check` agent.                                              |
| Run a structured multi-perspective review of risky code or a direction                | Invoke `review-rangers`.                                                   |
| Run a security dry-run before commit, or add/review a dependency                      | Invoke `security-guardian` (and see `no-frameworks`).                      |
| Create a new skill                                                                    | Invoke `forge-me-a-skill`.                                                 |
| Check why something was decided, or record a decision/learning                        | Read or append to [`.ai/DECISIONS.md`](.ai/DECISIONS.md).                  |

## Development

```bash
nvm use         # Node version pinned in .nvmrc
npm install
npx playwright install chromium   # first time only
npm run dev     # Vite dev server + host simulator on :5173
npm run test:harness # shared harness checks
npm test        # Playwright (size-1024/1280/1600, shrunk, reduced-motion)
npm run build   # static build to dist/
npm run lint    # eslint
npm run format  # prettier --check  (use format:write to fix)
```

Deep link any screen: `/?tab=<id>&sub=<id>&state=<state>&mode=<id>&size=1024|1280|1600`.
Walkthrough for review: `WALKTHROUGH=1 npm test -- walkthrough`.
