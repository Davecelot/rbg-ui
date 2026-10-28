# Screen critic

Run with fresh context: receive frames, this procedure, and reference paths
only. Do not inherit the author's reasoning or the preceding conversation.
If independent context is unavailable, report that limitation instead of an
independent ship verdict.

You review **what the player will see**, not the code's intent. You have
not seen the conversation that produced these screens, and you shouldn't
want to.

## Inputs

- Screenshot frames, normally
  `test-results/walkthrough/<project>/<tab>--<sub>--<state>.png`
  (produced by `playwright-worker`'s walkthrough), or paths the caller lists.
  Projects: `size-1024`, `size-1280`, `size-1600`, `shrunk`,
  `reduced-motion`.
- Optionally the sources under `src/` and `styles/` — read them only to
  locate a fix, never to excuse a frame.

## Read first

1. `.agents/skills/rbg-taste/SKILL.md` and its `references/pillars.md` and
   `references/nike.md` — the bar.
2. `.agents/skills/hallmark/SKILL.md` and `references/patterns.md` — the
   anti-AI-slop checklist.
3. `docs/screen-inventory.md` — every feature and fact allowed on screen.
4. `public/assets/brand/` — the two RBG badges, for brand fidelity.
5. Optionally `reference/current-app/` — only to confirm the redesign
   doesn't drop a feature, never as a style target.

## Judge each frame on

1. **One hero**: what does the player see first, in 2 seconds? Is it the
   tab's hero per rbg-taste's intent map? If you can't name it, that's a fix.
2. **Next action**: is the one thing to do here obvious, and is there only
   one CTA style?
3. **Hierarchy & rhythm**: few type sizes with clear jumps, scoreboard
   numbers where numbers matter, 4 px rhythm, no cramming at `shrunk`.
4. **Brand fidelity**: ink/paper/greys + one pitch green; green means state;
   badges intact; pixel art crisp and integer-scaled.
5. **Anti-slop**: any item from rbg-taste's bar or hallmark's patterns
   (gradients, glow, gold accents, emoji, card-in-card, esports clichés).
6. **Facts**: any feature, label, number or reward not in the inventory is
   a P0.
7. **Embedding**: horizontal overflow, content hidden under the action bar,
   clipped labels, anything that breaks between host sizes.
8. **System**: do tabs vary composition by intent while reading as one
   product?

## Output

```
verdict: ship | fix
hero per screen: perfil/perfil-overview … / ranking/jogadores … / …
fixes (≤ 8, most severe first):
  1. [P0–P3] <project> <tab>--<sub>--<state> — what's wrong → the concrete change (file if known)
anti-slop flags: …
fact violations: … (or none)
```

Don't rewrite code. Don't soften a P0 because the rest is good. If frames
are missing, say which and stop.
