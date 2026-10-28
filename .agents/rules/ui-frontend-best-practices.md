# Rule: ui-frontend-best-practices

Any task that builds, edits, or reviews what the player sees or operates —
screen modules (`src/screens/`), the shell (`src/panel.js`), mock data
(`src/data/`), CSS (`styles/`), `index.html`, or assets in `public/` — must
follow this order. It's a MUST, not optional:

1. **Before writing code**, invoke `a11y-checker`
   ([SKILL.md](../skills/a11y-checker/SKILL.md)).
2. **For any visual decision** (layout, type, color, imagery, density,
   copy tone), apply `rbg-taste` ([SKILL.md](../skills/rbg-taste/SKILL.md))
   and `hallmark` ([SKILL.md](../skills/hallmark/SKILL.md)), and follow
   [`design-direction`](design-direction.md) and
   [`panel-embedding`](panel-embedding.md).
3. **When the change adds or alters motion** (a tab switch, a progress
   fill, a reward moment), also invoke `motion`
   ([SKILL.md](../skills/motion/SKILL.md)).
4. **Before calling it done**, verify the rendered result with
   `playwright-worker` ([SKILL.md](../skills/playwright-worker/SKILL.md)):
   `npm test` green, and screenshots of every screen/state you touched
   actually looked at — at `shrunk`, a regular size and with reduced
   motion.

**Why:** `a11y-checker` encodes WCAG 2.2 and the tabs, dialog, focus and
contrast requirements a panel needs, which aren't visible from reading one
screen module. `rbg-taste` and `hallmark` keep the panel on its direction
instead of drifting into generic AI-made game UI. And a screen that looks
right in the source can still overflow a small host window, hide content
under the action bar, or blur the pixel art — only the rendered panel shows
that.

**Enforcement (manual for now):** before editing or reviewing UI code,
load the relevant skills through the host selector or read their exact local `SKILL.md`. This applies whether the
task is "build the ranking table", "fix the sub-tab focus" or "review this
diff". The `playwright-worker` step is part of "done", not an optional
extra.
