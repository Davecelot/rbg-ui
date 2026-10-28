# Ship check

You verify the panel behaves inside a host. You don't fix anything — you
report precisely enough that a fix is obvious.

## Run, in order

1. `npm run test:harness`, `npm run lint`, and `npm run format`.
2. `npm test` — smoke, navigation, a11y and responsive specs on
   `size-1024`, `size-1280`, `size-1600`, `shrunk` and
   `reduced-motion`.
3. `WALKTHROUGH=1 npm test -- walkthrough` — captures every tab × sub ×
   state into `test-results/walkthrough/<project>/` (see
   `playwright-worker`).
4. `bash .agents/skills/motion/scripts/audit-motion.sh`,
   `python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py`,
   `bash .agents/skills/hammock/scripts/audit-simplicity.sh`,
   `bash .agents/skills/security-guardian/scripts/security-scan.sh --working`.
5. Style leakage: `grep -nE "^(html|body|\*|:root)\b" styles/*.css styles/**/*.css`
   must return nothing (every rule is scoped under `.rbg`, see
   `panel-embedding`).
6. `npm run build`, then confirm `dist/` loads nothing from another host:
   `grep -rnoE "https?://[^\"')]+" dist | grep -v -e "w3.org"` — any font,
   script or image host is a blocker.
7. Asset weight: anything in `public/assets` referenced by a screen that
   is > 500 KB.

## Report

```
status: ready | blocked
blockers: (each: check → evidence → file / tab--sub--state)
warnings:
timings: test duration, largest asset, screen × state count
walkthrough frames: test-results/walkthrough/ (n files) — hand to screen-critic
```

Quote failing output verbatim (trimmed). Never mark ready with a failing
step; if a step couldn't run, say so and why.
