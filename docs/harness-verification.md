# Harness verification

This record distinguishes automated adapter checks from native host
activation. A direct dispatcher invocation proves its JSON contract, not
that a desktop host has trusted or loaded the hooks.

## Automated checks

Verified locally on 2026-10-26:

| Check                                                | Observed result                                                                                                                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:harness`                               | 27 passed: native JSON context, mode persistence, runtime/session isolation, patch and shell edits, missing post-hook recovery, failed-audit reminders, discovery paths, links, reviewer wrappers, and security redaction. |
| Official Skill Creator `quick_validate.py`           | All 10 skills passed. PyYAML was installed only in a temporary validation directory; project dependencies were unchanged.                                                                                                  |
| `npm run lint`, `npm run format`, `git diff --check` | Passed.                                                                                                                                                                                                                    |
| Python AST parsing and `bash -n`                     | All shared Python and shell scripts passed syntax checks.                                                                                                                                                                  |
| `npm test`                                           | 110 passed across all five projects; 5 walkthrough tests intentionally skipped without `WALKTHROUGH=1`.                                                                                                                    |
| `WALKTHROUGH=1 npm test -- walkthrough`              | 5 passed; 140 frames captured, covering 28 screen states across all five projects. Capture is not a fresh independent visual review.                                                                                       |
| `npm run build`                                      | Passed.                                                                                                                                                                                                                    |
| Motion shell/Python audits                           | Executed; Python score 100, no findings.                                                                                                                                                                                   |
| Hallmark export and sloplint                         | 28 screen states exported; 0 FAIL, 0 WARN, 64 DISMISSED. Upstream linter and MIT license preserved byte-for-byte.                                                                                                          |
| Security `--working` scan                            | GO. No secret-shaped diff matches, lockfile in sync, no runtime remote loads. Harness paths surfaced for review.                                                                                                           |
| Registry-backed `npm audit --json`                   | Zero vulnerabilities at every severity. The first sandboxed attempt could not reach the registry; the network-enabled retry succeeded.                                                                                     |
| Application preservation                             | No diff in `src/`, `styles/`, `main.js`, `index.html`, `public/`, or `package-lock.json`. Work remains local on `main`.                                                                                                    |

The static accessibility scanner executed and reported **78 findings**
(64 HIGH, 14 MEDIUM). Running the original scanner from `HEAD` against the
same source produced exactly the same findings. Live Playwright
accessibility self-checks passed across every screen state and host preset.
These static findings remain advisory review candidates; this harness
migration does not resolve or certify the UI's existing accessibility.

The simplicity audit also surfaced existing heuristic candidates, including
an apparently unimported data module and unused CSS token/class reports.
Its executable is unchanged apart from canonical documentation paths.
No application fixes were made as part of the portability work.

## Native runtime checks

| Runtime                      | Discovery                                                                                                                                                            | Hook activation                                                                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code 2.1.310          | Compatibility paths and named wrappers resolve in automated tests. Fresh read-only session attempted; returned `Not logged in · Please run /login` before inference. | Native activation unverified because authentication is unavailable. Dispatcher and configured command contracts passed direct integration tests.                          |
| Codex CLI 0.163.0-alpha.11.1 | Fresh read-only session loaded `AGENTS.md`, read the mandatory rules, and found all ten repository skills.                                                           | Definitions found; no injected hook context or execution records observed. Requires project/hook trust review before activation can be claimed. No trust bypass was used. |
| ChatGPT Work desktop         | Unverified in a fresh local Work session; bootstrap procedure provided for sessions without discovery.                                                               | Local runtime activation remains unverified; cloud orchestration uses manual checks.                                                                                      |

See `docs/agent-setup.md` for activation and fallback procedures. Native
host activation and independent review remain distinct from automated
adapter tests; neither is claimed where it could not be observed.
