# Layout

The panel box, the sizes, the screen and its compositions, the first
screen and the panel as a set of tabs. A screen looks made when it holds
one job at the right size. Every number is CSS px inside the panel, which
the host sizes (`panel-builder` § The panel box); layout answers to
`@container rbg`, never to the viewport (6a).

## 1. The panel box

- **Three 16:9 presets** (1024×576, 1280×720, 1600×900), down to the smallest supported panel (≈992×558, the `shrunk` project). Design at compact first; regular and wide earn more room, never more boxes.
- **Fixed rows:** header, tabs, (sub-tabs), the scrolling view, the action bar. Only the view scrolls; nothing essential sits under the action bar (34).
- **Columns:** the view uses one gutter token shared with the header and action bar, so left edges line up across every tab; inside it, a 12-column grid at wide, 8 at regular, 4 at compact.
- **Shared axes:** where screen heads sit, where content starts, where the CTA lives (always the action bar). A panel that keeps them reads as one system; a panel that keeps everything else too reads as a template (8, 9).

## 2. Sizes

`rbg-taste` sets the roles; Hallmark checks the jumps.

| Role                    | Rule                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| Hero figure             | the largest type in the view; 2.5× body or more                   |
| Screen head (`h2`)      | 1.5 to 2× body; under about 24px at regular reads unfinished (78) |
| Object title / row name | body, one weight step heavier                                     |
| Body                    | 14px at compact, 16px at regular and up                           |
| Label, caption, meta    | 12 to 13px, nothing essential smaller (75)                        |

- A head and its one line sit 4 to 8px apart; the head block and the view's object 16 to 24px (compact) or 24 to 32px (regular and up).
- A field takes 12 to 16px of padding (72); rows 12px block padding at least.
- Touch and click targets 32px tall at least, 40px for the primary CTA.

## 3. Rhythm across the tabs

- Tabs change composition, hero type and opening move from one to the next (32); they keep the grid, the type roles, the palette and the action bar.
- A dense tab (Ranking, Meu Time) sits beside a quiet one (Vestiário, Jogar); the reflex to box everything is strongest on the dense ones.
- Height is the host's, so fullness comes from mass: an empty-looking view wants a bigger hero or a figure set large, never more boxes (77, 79).

## 4. A screen

A screen is one job shown at its best: who I am, dress the avatar, run my
club, pick a mode, where I stand, join the week, what unlocks next, what
to buy. Decide the job first (`rbg-taste`'s intent map), then the
composition that shows it.

- **The head block:** an `h2` of five words or fewer, at most one line beneath it, or no head at all when the sub-tab already names the view (`craft.md` § 7).
- **The hero has mass:** a sprite at the largest integer scale its field allows, a figure at hero size, a table or list across the full width. A head and a paragraph are a head block, never a screen.
- **A split balances:** text and object centre on each other; neither column leaves more than a fifth of the row empty at regular.
- **Words:** about 40 of prose at once at most (58), usually under 20.
- **Every state is a screen:** `empty`, `loading`, `locked`, `error` get the same composition care as `default`, not a centred grey sentence.

## 5. Compositions

Layouts, not components: build each in the panel's material. Use several
different ones across the eight tabs, never the same one on two
neighbouring tabs.

1. **Hero + ledger.** The sprite or a hero figure on one side, a quiet ledger of facts (rank, record, next match) on the other, parted by a hairline: Perfil.
2. **Fitting room.** The avatar large on a plain field, the choices (colour, item) as a single row of selectable swatches or a list beside it, the save action in the action bar: Vestiário.
3. **Table.** Full-width rows parted by rules: position, name with sprite, tier, stats; the player's row marked once: Ranking, Histórico.
4. **Roster.** Club identity at the top as type at scale, members as rows with sprite, role and status: Meu Time.
5. **Track.** Levels or tiers along one axis with the current one marked in green. Passe de Batalha leads with the season's final reward and keeps current/next progress adjacent; a rank ladder leads with the current tier.
6. **Shelf.** Items in one row or a short grid of equal, square, unframed slots, art first, name and price under, rarity as a small chip: Loja.
7. **Choice.** Two to four modes as large selectable rows or a segmented control, the description of the selected one beside it, the CTA in the action bar: Jogar.
8. **Figure.** One real number at hero size with what it counts (46b): a rank-up, `0/6` missions done.
9. **Status board.** One edition's state (open, enrolled, live, closed) as type, with the one date or count the inventory gives: RCS Week.

Never: equal tiles with an icon over a heading (3), a rarity card grid as
the whole shop, stat tiles with icons, a card in a card (4).

## 6. The first screen

Perfil's default state, the view every opening lands on. Pick a posture,
stamp it in the Picks line, and keep it unlike the inner tabs.

| Posture        | Content                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| **Portrait**   | the avatar large on the left third, name and rank as type at scale beside it, the record as one quiet row |
| **Scoreboard** | rank and position as a broadcast figure across the top, the avatar beside it, the record under            |
| **Locker**     | the avatar centred on a plain field with name and kit number under, facts in a narrow column to one side  |

- **The avatar is big:** it is the panel's photography (`rbg-taste`); it never shrinks to a badge-sized circle.
- **The text:** the player's name, rank, one headline stat. Everything else is a sub-tab or a row.
- **At `shrunk`:** the posture survives; the facts column drops under the avatar, never squeezes into a sliver (F17).

## 7. Before shipping

Look at the walkthrough frames one screen at a time, `shrunk` first: is
something in each view big enough to be its reason? Then squint: with the
words blurred, each tab still has a shape, and the panel a rhythm of
dense and quiet. Then read only the heads and CTAs in order: if they tell
the player what each tab is for, the rest is the right length.
