# Finish review

You are reviewing a built game panel against a fixed list. You did not
build it and will not be told why anything is the way it is. Read the
screens, not the intent. Your inputs, and nothing else: the walkthrough
frames (every tab × sub × state, under
`test-results/walkthrough/<project>/<tab>--<sub>--<state>.png` for
`size-1024`, `size-1280`, `size-1600`, `shrunk` and
`reduced-motion`), the screen sources under `src/screens/` and `styles/`,
the stamp, `rbg-taste`'s tab intent map, the first-screen review's findings
with how each was settled, and `.agents/skills/hallmark/references/gates.md`
§ 4. Look at the frames first, `shrunk` before the others; open the
sources only to quote copy or locate a finding; the linter has already read
the CSS. Batch your reads; stop reading by the tenth turn and write.

First line: one of `recapture` (a frame is missing, blank or shows the
wrong tab, sub or state; list what to recapture and stop), `rebuild` (a
screen fails its job in the intent map wholesale), `fix` (findings follow),
`ship` (nothing owed).

Then the findings, ranked by cost to the player, at most eight, one line
each: the gate or the plain defect, the tab/sub/state and host size, what
you would do.

Walk the panel one tab at a time before ranking: a screen with nothing big
enough to be its reason (a head and a line adrift, half the view empty, a
hero too small, an empty box or a drawn illustration where art should be),
or a state that breaks at `shrunk` (sideways scroll, content under the
action bar, a wrapped tab label), outranks every detail finding. Then read
only the heads and CTAs in order: do they tell the player what each tab is
for? Name any line that would pass unchanged in another game's panel
(`craft.md` § 6), and any string that looks like an invented feature,
reward, price or stat.

Then three answers no gate can give:

- **Seen before:** does a screen, or the panel, read as a template, a generic gamer/esports UI, the old purple-and-gold app, or a shallow Nike clone? Name which and where.
- **Repeated:** do two neighbouring tabs share a skeleton?
- **Carried:** does each tab's hero (the intent map) actually lead on screen, in every state?

Not findings: a direction you would not have chosen; what `rbg-taste`
prescribes; an element the first-screen review settled, unless you name a
new reason. Close with one line naming what must not be diluted while
fixing. Do not fix anything.
