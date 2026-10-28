# Craft

Type, colour, surfaces, motion, copy, screen openings, missing facts and
finish, read on every screen, as numbers wherever a number exists. Values
live in `styles/tokens.css`; roles live in `rbg-taste`; this file says what
reads as made and what reads as generated. Sizes are CSS px inside the
panel; check them at compact first.

## 1. Type

- **Two families,** both self-hosted, chosen in `.ai/DECISIONS.md` (`rbg-taste` § System): a neutral grotesk for UI and body, a condensed athletic display cut for headlines and figures. No third family; the pixel badge is art. A pixel font for UI text is refused (`rbg-taste` pillars).
- **Weights:** 400 and 500 for text (Nike); the display face may go heavier only at display sizes. Three weights at most in running use (F19).
- **Jumps, not steps:** the hero figure about 2.5× body or more; the screen head about 1.5 to 2× body. A view whose sizes sit 10% apart has no hierarchy.
- **Display:** tight tracking at size (−0.01 to −0.03em on a condensed cut); line-height 0.95 to 1.1, tighter as it grows; an uppercase head that can wrap never under 1.0 (55a). One weight, one style, one colour per head (38i, 38iii); stress comes from size or a second line.
- **Figures are the display face:** rank, position, score, XP, level, price, record (`39V 39D 1E`), always `tabular-nums` (F6), the unit a step smaller beside it (`49%`, `5 MVPs`).
- **Body:** 14px minimum at compact, 16px at regular; line-height 1.4 to 1.6; never all caps, never justified.
- **Labels and meta:** the body face a step smaller (12 to 13px), sentence case, untracked inside screens (67). Uppercase with tracking is chrome only: tab labels, the pill CTA, the action bar's context line, all from one tracking token.
- **Required:** `font-display: swap`; `font-synthesis: none`; `text-wrap: balance` on heads (F3), `pretty` on copy; curly quotes and a true ellipsis; a non-breaking space inside unit pairs (`R$ 5,49`, `40 PDL`, `+30 XP`, `19 h 47 min`).
- **The badges are art, not type.** Never reset the RBG mark in a font; place the asset (`brand-truth.md`).

## 2. Colour

- **Tokens only** (48). Ink and paper carry surfaces; three greys carry metadata, hairlines and disabled; pitch green carries state.
- **Ink, not black** (7a): `#111`-like ink; paper may be pure white on the record (7b waiver, SKILL.md § The stamp).
- **One brand signal.** Pitch green marks live, ready, yours, primary progress and the primary CTA when ink/paper won't do; under about 5% of a view otherwise (23). Never green text for body.
- **Semantic red** (owner-approved, 2026-10-28): `--danger` marks negative outcomes, negative statistics, and danger actions. Paired victories use pitch green; draws and zero deltas stay neutral. Keep text/sign cues and never tint full rows.
- **Data colours are data.** Rank tiers (Prata, Ouro, Platina…) and rarities (`Lendária`…) may colour a small chip, a medal or a sprite's own pixels. Rarity may instead use one static 4px strip at the artwork edge with a neutral text label (owner-approved, 2026-10-27). Never a full frame, a card fill, a glow, a background or a CTA (86, 29).
- **Contrast:** body 4.5:1, display 3:1, measured over the sprite or fill actually behind it (40). Text on green takes its paired ink token (41); grey text never sits on a coloured field.
- **Bans:** any gradient on chrome (2a, 2b); glow shadows, halos, bloom, vignettes (29); orange/gold as premium (86); alpha as a colour's definition (alpha is for overlays); red and green as the only win/loss signal (pair with V/D/E or a word).

## 3. Surfaces

- **A primary axis per screen:** left-biased, right-biased, top-heavy or split. Centre-biased is a default, not a choice (6b); Vestiário may centre the avatar, never a stack of everything.
- **The grid:** the panel's columns (`layout.md` § 1), shared gutters with the header and action bar, so every tab reads as one system while compositions change.
- **The surface ladder:** empty view, then a hairline (1px grey), then a field (one ink/paper step, no border), then a framed object (an edge or a step, never both, F24). Never a card grid by reflex, a card in a card (4), glass, or a shadowed floating panel. Different tabs climb different rungs (9).
- **Depth is ink/paper and scale,** never shadow — not on the action bar, not on hover, not on modals inside the panel.
- **Radii:** pills (CTA, tags, segmented controls) and nothing else by default; fields, rows, images and item frames square (Nike).

## 4. The first screen

Composition is `layout.md` § 6; what it shows is `imagery.md` § 1. Perfil's
default state is the panel's first impression every time it opens: the
avatar as the hero, big and crisp, with the one headline stat and rank
beside it, and the action bar's CTA as the only filled control in view.
Its entrance, if any, is one settle of 150 to 300ms from an already-visible
end state, never a fade plus a slide plus a scale on one element, never a
spinning podium or a glow pulse.

## 5. Motion

The `motion` skill owns construction. Hallmark only refuses the tells:
`transform` and `opacity` only (10a); exponential ease-out, never bounce on
state (12); tab switches near-instant; one celebratory moment per real
reward (`rbg-taste`); nothing that loops forever without stopping under
reduced motion (18, 27); nothing flashing past 3 Hz; count-ups only on
figures the player must read anyway, markup holding the final value (62).
Most game UIs have too much motion, not too little.

## 6. Copy

Brazilian Portuguese, direct and short, from the screen inventory
(`docs-language-split`). Hallmark judges the setting and any connective
copy the redesign adds.

- **The swap test:** a line that would work in any other game's panel gets a noun only RBG has (PDL, RCS Week, the club, the vestiário, the chuteira, the passe).
- **Three tests a line:** can the player picture it, could it be proven false, could only this game say it.
- **Heads** say what the player will see or do (`Entre em campo`, `Missões de hoje`), never a category label (`Informações`, `Geral`, `Dados do jogador`).
- **Rhythm:** a short line beside a longer one; verbs over adjectives; one idea a line; no triads of adjectives (`rápido, fácil, épico`).
- **Refuse the generated voice,** in both languages:
  - English (the linter catches these, and also in a pt-BR UI): seamless, epic, legendary as hype, unlock your potential, level up your game, next-level, GG, PRO, "Get started", "Learn more".
  - pt-BR (judged): `Prepare-se para…`, `Você está pronto para…?`, `Bora!`, `Desbloqueie seu potencial`, `Leve seu jogo ao próximo nível`, `Experiência única`, `Épico`/`Lendário` as praise (rarity names are data and stay), `Incrível`, `Imperdível`, `Clique aqui`, `Saiba mais`, a colon title (`RCS Week: onde lendas nascem`), the rebuttal cadence (`Não é só um jogo. É…`), exclamation marks on statements.
- **Punctuation:** no em or en dash in prose (a comma, a colon, a full stop or parentheses); decimals with a comma and thousands with a dot as pt-BR does (`5.405 XP`, `0,1`); `…` not `...`; curly quotes; a full stop on standalone sentences, none on labels or list items.
- **Buttons** carry the verb (`Jogar`, `Salvar cor`, `Ver escalação`, `Comprar por R$ 5,49`); never `Clique aqui`, never `OK` for a commit.
- **Renames are allowed, inventions are not.** The redesign may relabel a feature for clarity (and lists every rename in the handoff); it may not add a feature, reward or promise.

## 7. Opening a screen

The reflex is a small caps label above the heading, and the reflex is the
tell (54). Ask _what does the player not yet know?_ If nothing, open with
nothing. Ways in:

1. **Nothing:** the heading flush, air above. The sub-tab already named the screen.
2. **The heading announces itself:** the subject in its first two words (`Missões de hoje`).
3. **The hero first:** the avatar, the position number or the next reward opens the view; the heading sits beside or under it.
4. **A live state under the head:** a status that is true now (`Renova em 20 h`), `role="status"` only if it must be announced.
5. **A figure at graphic scale,** only when the number is real and is the point (`#38`, `Nível 7`, `0/6`).
6. **A real `<ol>`** when the sequence is genuine (ranking positions, pass levels), the number on the item itself.
7. **A caption below** the object instead of a label above it.
8. **A change of field:** an ink/paper step is the break.
9. **The shell's running head:** the action bar's context line, legal because it persists rather than announces.

Two moves may share a screen; three is noise.

## 8. Missing facts

- **A fact the inventory lacks** is a slot, never an invented value: `<span class="fill" data-fill="preço">[placeholder]</span>` in a muted tone inside a dashed outline (`patterns.md`), so it reads as a blank to fill. Each one listed in the handoff with a question to the owner.
- **A picture the panel lacks** (an item's art, a club crest) is the labelled placeholder box `panel-builder`'s assets reference names (`[item]`, `[avatar]`) or the name set in type, never a drawn stand-in (80) or an emoji (30a).
- **A link or destination the inventory does not give** is not on the screen.

## 9. Finish

- **Controls:** one pill CTA style per view, a verb as the label, `:focus-visible` instant (15, 26a); secondary actions as text buttons or the segmented control, never a second filled pill (F4).
- **Lists:** rows parted by hairlines; the row's name one step heavier; reward and progress aligned on one right edge; five to seven rows visible before scroll at regular.
- **Tables (ranking, history):** rules only, no outer frame, no zebra stripes on a dark field, positions and stats tabular, the column that names the row one step heavier, the player's own row marked once (green or an ink/paper step, not both). Pagination is a real `<nav>` with SVG chevrons and the page as text, not outlined pills with `«` and `›`.
- **Figures:** a figure carries its unit and what it counts; no icon tile, no trend arrow nobody measured (46a).
- **People:** the real pixel avatar or the name in type; never a stock face, a generic silhouette or an emoji.
- **The document:** `lang="pt-BR"` on `#rbg`, heading levels that step one at a time (F21), every `<img>` with `width`, `height`, `alt` and a file in `public/assets/` (76).
