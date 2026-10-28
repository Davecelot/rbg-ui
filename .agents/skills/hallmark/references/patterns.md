# Patterns

The parts screens repeat, written to pass the gates, then the game-UI slop
catalogue every screen is checked against. Take the code's shape; names,
copy and values come from the screen and the inventory. Every colour, size
and duration is a token (48); `panel-builder` owns the shell, module and
state contract. Token names below (`--ink`, `--paper`, `--grey-*`,
`--signal`, `--hairline`, `--space-*`, `--text-*`, `--font-display`,
`--dur-*`, `--ease-out`, `--focus`) follow the roles in `rbg-taste`; a role
with no token yet is added to `styles/tokens.css` first, never typed inline.

## A state that survives a failed effect

State lives on `.rbg-view[data-state]` (`panel-builder`). Hide nothing at
rest that only script shows (62): entrances animate from a script-set class
and the resting markup is the final state.

```css
.rbg-view.is-entering .rbg-hero {
  opacity: 0;
  transform: translateY(var(--space-2));
}
.rbg-hero {
  transition:
    opacity var(--dur-fast) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}
@media (prefers-reduced-motion: reduce) {
  .rbg-hero {
    transition: opacity var(--dur-fast) linear;
    transform: none;
  }
}
```

## A ranked table

```html
<table class="ranking">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Jogador</th>
      <th scope="col">Elo</th>
      <th scope="col">Partidas</th>
    </tr>
  </thead>
  <tbody>
    <tr aria-current="true">
      <td class="pos">1</td>
      <th scope="row"><img src="/assets/avatars/elmo.png" width="32" height="32" alt="" /> Elmo</th>
      <td>Platina II <span class="unit">40&nbsp;PDL</span></td>
      <td class="stats">73V 31D 3E</td>
    </tr>
  </tbody>
</table>
```

```css
.ranking td,
.ranking th {
  padding-block: var(--space-3);
  border-bottom: 1px solid var(--hairline);
}
.ranking .pos,
.ranking .stats {
  font-family: var(--font-display);
  font-variant-numeric: tabular-nums;
}
.ranking [aria-current='true'] .pos {
  color: var(--signal);
}
```

Rules only, no outer frame, no zebra, no pill tags beside every name. The
tier and its PDL are two settings, not a middle-dot string (63). The
player's own row is marked once. Values come from `src/data/`, drawn from
the inventory.

## Pagination

```html
<nav class="pager" aria-label="Páginas do ranking">
  <a href="?tab=ranking&amp;page=1" aria-label="Página anterior"><svg aria-hidden="true">…</svg></a>
  <span>Página 1 de 3</span>
  <a href="?tab=ranking&amp;page=2" aria-label="Próxima página"><svg aria-hidden="true">…</svg></a>
</nav>
```

SVG chevrons from the panel's one icon set; no `«`, `‹`, `›` glyphs (30a),
no outlined pill per control.

## Progress toward a goal

```html
<div class="progress">
  <p class="progress__label">Nível 7</p>
  <progress max="860" value="455">455 de 860 XP</progress>
  <p class="progress__figure">455&nbsp;/&nbsp;860&nbsp;XP</p>
</div>
```

```css
.progress progress {
  appearance: none;
  inline-size: 100%;
  block-size: var(--space-1);
  background: var(--grey-100);
}
.progress progress::-webkit-progress-value,
.progress progress::-moz-progress-bar {
  background: var(--signal);
}
```

One flat fill, no gradient (2b), no glow (29); the figure as text beside it,
tabular. A mission row uses the same part at a smaller size with its
reward (`+30 XP`) right-aligned.

## A pixel sprite

```html
<figure class="sprite">
  <img src="/assets/avatars/Atleta Exemplo.png" width="128" height="256" alt="Atleta Exemplo" />
  <figcaption>Atleta Exemplo</figcaption>
</figure>
```

```css
.sprite img {
  image-rendering: pixelated;
}
```

The `width`/`height` are an integer multiple of the source; the field
under it is flat ink or paper. No ring, no podium, no glow.

## A price

```html
<p class="price"><span class="currency">R$</span>&nbsp;5,49</p>
```

The display face, tabular; the currency a step smaller; pt-BR decimal
comma. The buy action is the verb with the price (`Comprar por R$ 5,49`).

## The one CTA

The primary action lives in the action bar (`[data-action=primary]`) as a
pill: ink on paper or paper on ink, or the signal green when the action is
"go play". One per view; secondary actions are text buttons or the
segmented control (F4). No italic, no gradient, no shadow, no shimmer.

## A fact the inventory does not give

```html
<p>Vira em <span class="fill" data-fill="tempo-vitrine">[placeholder]</span></p>
```

```css
.fill {
  padding-inline: var(--space-1);
  border: 1px dashed var(--grey-400);
  color: var(--grey-400);
}
```

Each one listed in the handoff with a question to the owner.

## An empty state

A list screen's `empty` state names what is missing in the screen's own
nouns and offers the one real action that fills it, if the inventory has
one (`Nenhuma partida de time ainda`, action bar: `Jogar`). No sad-face
emoji, no drawn illustration (80), no invented incentive.

## The game-UI slop catalogue

Check every screen against this list. The current app
(`reference/current-app/`) shows most of them; screenshot numbers in
`docs/screen-inventory.md` § Current UI problems.

| Tell                                              | Gate         | What the made version does                                                                  |
| ------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| Purple, navy or neon night gradients behind views | 2a           | flat ink or paper surfaces                                                                  |
| Glowing borders, halos around avatars and cards   | 29           | hairlines; depth by ink/paper steps                                                         |
| Orange or gold as the "premium" accent and CTA    | 86, 23       | ink/paper pill, pitch green only for "go play"                                              |
| Emoji as item art or icons (`🎉 👑`)              | 30a, 80      | the real pixel asset, an SVG icon, or `[item]`                                              |
| Card inside a card; every block boxed             | 4, 3         | one containment layer; rows and rules                                                       |
| Rarity rainbow frames on every shop slot          | 29, 86       | unframed slots, one small rarity chip or static 4px artwork-edge strip with a neutral label |
| `LENDÁRIA` / `NOVO` chips everywhere              | 66, 67       | one chip where it matters, sentence case, untracked                                         |
| Angled esports slashes, clipped corners           | direction    | square fields, pills only for controls                                                      |
| Hexagon frames, shields, HUD brackets             | 80, 47c      | the real rank medal asset or the tier as type                                               |
| Fake 3D / bevelled / italic buttons               | 38ii, 47c    | the flat pill, roman type                                                                   |
| Every-stat-in-a-box dashboards                    | 3, data-viz  | one hero figure, the rest in a quiet row                                                    |
| Cramped tables with outlined pills for pagination | 72, 30a      | rules-only table, `<nav>` with SVG chevrons                                                 |
| Small tracked caps eyebrows over every block      | 54, 67       | the heading says it, or nothing                                                             |
| Middle-dot meta strings                           | 63           | two settings, columns or line breaks                                                        |
| Gradient progress bars, ring gauges               | 2b, data-viz | one flat bar with the figure as text                                                        |
| Glow pulses, shimmer sweeps, rotating rays        | 18, 29       | no loop; one settle on a real reward                                                        |
| A banner repeated on every tab                    | 69           | say it once, in its own tab or the action bar                                               |
| CSS-drawn pitch, net or stadium behind the avatar | 47c, 84      | a flat field; pitch lines only as structure (`texture.md`)                                  |
