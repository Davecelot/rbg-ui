# Creative brief — RBG panel redesign

The _why_ behind the redesign. Features and facts live in
[`screen-inventory.md`](screen-inventory.md); taste lives in
[`rbg-taste`](../.agents/skills/rbg-taste/SKILL.md).

## The product

RBG is a fútbol (soccer) game hub that opens as a **panel inside a host
app**: a pixel-art social hotel. From the panel a player checks their
profile and rank, dresses their avatar, runs their club, picks a mode and
queues for a match, follows the rankings and the weekly RCS competition,
progresses the battle pass and buys items. The hotel stays visible around
it; the panel's size depends on the player's window.

## The player

Brazilian players (pt-BR) who live in the hotel and open the panel many
times per session — between matches, while chatting, while queueing. They
know the game; they want their status, their progress and the next match
**fast**. They read a dense pixel world all day, so the panel has to be the
calm, clear thing on screen.

## What the panel must do

1. Get a player from "open" to "in a match" in as few steps as possible.
2. Make progress legible at a glance: rank and PDL, pass level and XP,
   mission progress, club standing.
3. Make the avatar and items feel like the product — big, crisp, desirable.
4. Work at every host window size from the smallest supported panel up,
   without horizontal scroll or hidden actions.
5. Feel premium and sporty — a brand, not a template.

## Look and feel

**Matchday, quiet luxury.** Nike's discipline (monochrome, flat, pill CTA,
confident type, imagery first) × the RBG badges (ink, paper, one pitch
green, the laurel) × fútbol culture (scoreboard numerals, kit numbers,
pitch geometry) × pixel art as the only photography. Details in `rbg-taste`.

## Where the current UI falls short (why we redesign)

From the screenshots in `reference/current-app/` (full list in the
inventory's "Current UI problems"):

- A generic "AI game UI": purple night gradients, orange glows, gold
  accents, glowing reward cards.
- Emoji used as item art, so items are indistinguishable.
- Card inside card inside panel; every element boxed.
- Four different tab styles and six button styles; disabled CTAs look
  enabled.
- Clipped and wrapped labels, typos, inconsistent number formats.
- Low-contrast secondary text on purple.

## Success criteria

- Every feature in the inventory is reachable; nothing is invented.
- `screen-critic` returns **ship** and hallmark's gates pass on every tab.
- `npm test` green on every host size and reduced motion; no overflow, no
  content under the action bar.
- WCAG 2.2 AA (contrast, keyboard tabs, focus return, announcements).
- A player can name each screen's hero in two seconds.

## Out of scope

Back-end, real data, real purchases, the host app itself, and any feature
the inventory doesn't show. Open product questions are listed at the end
of the inventory and answered by the owner.
