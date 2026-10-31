# Decisions

Chronological log of cross-cutting decisions and learnings for this repo.
Newest entries at the top. Each entry: Context / Decision / Why / Watch
out. Read this before any change likely to recur (a browser or motion
pitfall, an accessibility pattern, a tooling/process convention) to avoid
re-litigating something already settled — or to find where to amend it if
new information invalidates it.

Append an entry (and its Index line) whenever a non-obvious pitfall or a
cross-cutting choice surfaces — from a `review-rangers` run, a manual
review, a `ship-check`, or an owner answer to one of the inventory's open
questions.

---

## Index

Skim this index first; open only the entries relevant to your task. Each
line is `**date** — one-line hook`; find the full entry below by its date
and heading text.

### Stack & process

- **2026-10-26** — Harness ported from ppt-make-a-thon; vanilla HTML/CSS/JS on Vite
- **2026-10-28** — A sanitized snapshot may be pushed to the private `Davecelot/rbg-ui` repository
- **2026-10-26** — No Figma: the screenshot inventory is the source of truth for features
- **2026-10-28** — Language split: English repository content, pt-BR player-facing UI

### Panel & layout

- **2026-10-27** — Jogar selection starts empty; RCS play lives on RCS Week › Fila
- **2026-10-26** — Three 16:9 size presets that reflow to fit the host window
- **2026-10-26** — A global play bar: the chosen mode + one CTA on every tab (superseded 2026-10-27)
- **2026-10-26** — RCS Week is one tab; the RCS queue moved out of Jogar
- **2026-10-26** — Rank ladder: LoL-style tiers with football names at the top
- **2026-10-26** — Items use runtime-filled templates: item tile, item sheet, equip picker
- **2026-10-26** — Position codes are `GK`, `DEF`, `MID`, `ATK`
- **2026-10-26** — No logo source files: use what exists or leave sized slots

### Brand & type

- **2026-10-31** — Owner-approved original human football pixel art replaces all temporary content artwork
- **2026-10-31** — Full rounded rarity outlines replace artwork-edge strips
- **2026-10-31** — Panel-wide softer shapes: 16px surfaces, 8px controls, original typography retained
- **2026-10-27** — Paid products use ink/paper contrast; confirmed rarity gets one static artwork-edge strip and a neutral label
- **2026-10-26** — Palette from the RBG badges + Nike discipline; values provisional
- **2026-10-26** — Typeface: Archivo (condensed for display, normal for UI), self-hosted

### CSS

- **2026-10-27** — Test host CSS isolation with an outside sentinel, and await native rail scrolling before screenshots
- **2026-10-19** — Animate a registered `@property`, not a plain custom property (carried over)

---

## 2026-10-31 — Original human football pixel art

**Context:** The owner requested human football-world pixel art inspired by an attached Brazilian football / Habbo-style promotional image, replacing the temporary character and item stand-ins throughout the panel. The owner explicitly chose original reference-inspired artwork and approved built-in image generation.

**Decision:** Replace 133 content PNGs in place: eight four-direction players and their portraits, all ten existing item categories and aliases, fictional club crests and the coach. Generate five initial transparent source sheets and one corrective sheet with the built-in image tool, then mechanically export final sprites without smoothing. Reuse existing renderers and filenames; apply small exact-name artwork selections in the existing pass/shop data modules and an opaque token-based backing to banner identity. Preserve layouts, labels, RBG/RCS branding and rank crests. Record provenance and exact prompts in `docs/football-art-prompts.md`.

**Why:** Human footballers, recognizable equipment and football-world collectibles make the prototype closer to the intended game without adding features, dependencies or a new asset-loading system. This owner-approved task is an explicit exception to the earlier prohibition on generated illustrations; it does not authorize generated brand marks.

**Watch out:** Generated sheet dimensions and spacing may differ from the prompt: inspect cell boundaries before extraction. These images remain fictional demo illustrations, not verified product designs or official game assets. The old CC0 source licenses do not describe the replacement artwork. Small identity slots still use the existing panel sizing; inspect their pixel rendering at every host preset.

**Review learning:** The first review-rangers pass returned LOW because replacement club-kit colors contradicted existing fixture labels. Reusing filenames alone does not preserve semantic identity: compare every declared color and named theme with the replacement image before acceptance. The owner approved Mender round 1; corrected artwork, named mappings and banner backing passed re-verification. The same five reviewers approved and the safety guard passed, yielding HIGH confidence. `docs/artwork-verification.md` records the independent verdicts and limits of the passing checks.

## 2026-10-31 — Full rounded rarity outlines

**Context:** The owner found the rounded bottom rarity strips awkward and
requested a full mark around the artwork.

**Decision:** Replace the 4px bottom strip with a static 2px outline on all
four sides of the existing item-art field, following its corner radius.
Reuse the confirmed rarity color and neutral label across tiles and sheets;
unknown rarity stays unmarked. The overlay does not resize or clip artwork
and does not intercept pointer input.

**Why:** A continuous outline follows the new shape treatment cleanly.

**Watch out:** This supersedes the bottom-strip-only decision below. Keep
rarity as item data, with no glow, colored fill or change to paid-access
styling. Typography and layout remain unchanged.

## 2026-10-31 — Panel-wide softer shapes with original typography

**Context:** The owner requested more expressive shapes using
[Champions4good](https://styles.refero.design/style/e02671e1-ba31-465f-bb7f-b124bf91ab5e)
as a reference. After reviewing a three-screen pilot, the owner rejected
larger text and asked to change shapes only, then authorized extending
that treatment across the whole panel.

**Decision:** Use `--radius-feature: 16px` for the shell, settings, avatar
stages, feature choices, final reward and bordered customization detail.
Use `--radius-control: 8px` for inputs, equipment options, item interaction
frames, product-art fields, number choices and queue seats. Round exposed
sheet corners to 16px; use pills for small position/result labels, color
choices and progress tracks. Keep tables, list separators and tab structure.
Retain original typography, padding, spacing and composition throughout.

The full-panel review also exposed two layout defects: reward-sheet focus
could scroll the shell's `overflow: hidden` container, and regular/wide
lineups used three columns for four player fields. Use `overflow: clip`
on the shell to keep scrolling inside the view; align player name and rank
in an explicit identity column at every size. A final-reward regression
check preserves header and action-bar positions on sheet open and close.

**Why:** Selective soft corners add character without making text dominate
the panel or changing its established density.

**Watch out:** This supersedes the earlier pill-only surface rule. Keep
the palette, Archivo, pixel artwork, content, interactions and motion
unchanged. Round surface backgrounds without clipping pixel artwork or
focus rings. Do not introduce boxes around previously unboxed content.

## 2026-10-27 — Review evidence for CSS isolation and native scrolling

**Context:** Independent Pass/Loja review found new screen rules styling an
outside host element, a free reward using the shared paid unlock message, and
a walkthrough frame captured before native smooth scrolling completed. The
owner approved one scoped remediation round after the safety guard's veto.

**Decision:** Scope both touched screen stylesheets and modified shared rules
under `.rbg`. Exercise a matching host element outside the root in Playwright;
checking only for `html`/`body` selectors cannot prove isolation. Free Pass
details honor `item.free` and omit the purchase action. Before capturing a
paged rail, assert its intended scroll position rather than relying on
`document.getAnimations()`, which does not await native smooth scrolling.

**Why:** These checks verify the host boundary, entitlement clarity and the
rendered evidence directly, without extra application abstractions.

**Watch out:** Existing unrelated stylesheets retain separate scoping debt.
Static accessibility scans also flag spans inside native buttons; validate
those findings in the rendered UI instead of adding redundant ARIA roles.

## 2026-10-27 — Paid-product hierarchy and compact rarity markers

**Context:** The owner approved a more expressive Pass and Loja while retaining
the Nike/RBG direction, with independent reviews before handover.

**Decision:** Lead the pass with its level-50 reward and a compact current/next
progress block. Use ink/paper contrast for the paid offer. Confirmed item rarity
may use one static 4px strip at the artwork edge plus a neutral text label,
shared by pass tiles, Loja and item sheets. Blue/purple/gold mean rare/epic/legendary;
common and unknown stay neutral. Tier names remain data, never marketing praise.

**Why:** Product scale and contrast communicate desirability; the small strip
makes rarity recognizable without turning the shell into a rarity-colored UI.

**Watch out:** This supersedes the earlier prohibition on any rarity edge,
not the bans on full frames, colored surfaces, glow, or gold premium accents.
Do not infer rarity from reward names, level, price, or paid access. Existing
demo fixtures remain examples under docs/demo-content.md. No purchase behavior,
new rewards, rank changes, or claim events are introduced.

## 2026-10-26 — The pass sells through structure: two lanes, the final reward up front, missions toward the next level

**Context:** The owner wants the Passe de Batalha to persuade players to buy it, as LoL, Valorant and CoD passes do. Research and the mapping to inventory facts are in `docs/references/battle-pass.md`.

**Decision:** (owner) Build three patterns: a free lane and a pass lane per level, grouped in chapters of ten; the level-50 reward as the tab's hero; and a goal line that turns the remaining daily missions into XP toward the next level. Buying the pass mid-season unlocks the pass rewards of the levels already passed (retroactive, as in Valorant). The art direction does not change for this tab: no rarity frames, glow, gold or fake timers.

**Why:** The empty free slot beside a pass reward is what shows a free player what they miss; the final reward gives the season a goal; and missions read as progress on the pass instead of a separate checklist.

**Watch out:** The pass price, the claim flow and the art are still unknown; the "level jump" pattern (5 levels on purchase) was not picked and stays as copy only.

## 2026-10-26 — Harness ported from ppt-make-a-thon; vanilla HTML/CSS/JS on Vite

**Context:** The owner asked to reuse the agent harness of
`~/Desktop/ppt-make-a-thon` (rules, skills, agents, hooks, Playwright) for a
different project: redesigning the RBG panel's UI.

**Decision:** Copied and retargeted the harness: `deck-builder` →
`panel-builder`, `deck-taste` → `rbg-taste`, `deck-critic` →
`screen-critic`, `rehearsal-runner` → `ship-check`; `figma-worker`
dropped; new rule `panel-embedding`. Plain HTML/CSS/vanilla JS, no runtime
dependencies; Vite, Playwright, ESLint and Prettier as dev dependencies.

**Why:** The harness already encodes the anti-slop, a11y, motion and
simplicity discipline the owner wants; a UI-only redesign has no state
worth a framework, and the panel is a guest in another app.

**Watch out:** Some retargeted skills may still carry deck-era wording; fix
it when you find it rather than working around it.

## 2026-10-28 — Private remote authorized for a sanitized snapshot

**Context:** The owner requested a private GitHub repository and removal of the local-only restriction.

**Decision:** See the `git-workflow` rule. Only a sanitized snapshot may be pushed to `Davecelot/rbg-ui`.

**Why:** The project needs a private remote while preserving local-only source captures and keeping captured account data, credentials, and old history out of the upload.

**Watch out:** Do not push the original history or raw `reference/current-app/` captures.

## 2026-10-26 — No Figma: the screenshot inventory is the source of truth for features

**Context:** There is no design file; the current app exists only as 38
screenshots, moved to `reference/current-app/NN-HMMSS.png` (NN = capture
order).

**Decision:** `docs/screen-inventory.md` maps every screenshot to tabs,
sub-views, fields, actions and states. It is the "allowed facts" list for
the redesign. Its "Open questions" are answered by the owner and recorded
here.

**Why:** Prevents invented features and keeps the redesign honest about
scope.

**Watch out:** Screenshot #32/#33 contain a battle-pass purchase link with
the user's id and a token — never copy that URL anywhere. The current UI's
style is not a reference.

## 2026-10-26 — Language split: English docs, pt-BR UI, Spanish README (superseded)

**Context:** Players are Brazilian; the owner writes in Spanish.

**Decision:** See the `docs-language-split` rule.

**Status:** Superseded on 2026-10-28. The README and all repository-authored content are now English; player-facing panel content remains pt-BR.

**Why:** Audience-driven.

**Watch out:** Inventory strings are literal pt-BR and must not be
"corrected" silently — the known typos (`TTemporada 1`) are bugs to fix in
the redesign, not copy to reproduce.

## 2026-10-26 — Three 16:9 size presets that reflow to fit the host window

**Context:** The current app's settings (gear) offers `Resolução da janela`:
1024×576, 1280×720 (default) and 1600×900; a size that doesn't fit "shrinks
until it fits". Owner: keep the three presets; shrink by **reflowing**, not
by scaling. This replaces the earlier "fully fluid panel" assumption.

**Decision:** `.rbg` is a size container (`host`). The panel is
`aspect-ratio: 16 / 9` with
`width: min(var(--panel-w), 100cqw - 2g, (100cqh - 2g) × 16/9)`; the
preset sets `--panel-w`. Layout inside responds to `@container rbg`
queries. The chosen preset persists in `localStorage` (`rbg:size`) and can
be forced with `?size=1024|1280|1600`. Playwright projects: `size-1024`
(1280×800 window), `size-1280` (1440×900), `size-1600` (1920×1080),
`shrunk` (1600 preset in a 1024×640 window → ≈992×558) and
`reduced-motion`. **Smallest supported panel ≈ 992×558**; windows smaller
than 1024×640 still shrink, but aren't a design target.

**Why:** Fixed presets give each screen three known canvases to design
for; reflow (instead of `transform: scale`) keeps type legible and pixel art
crisp when the window is small.

**Watch out:** No `vw`/`vh` — use `cqw`/`cqh` of the `host` container. If
the owner wants windows below 1024×640 supported, lower `shrunk` and record
it here.

## 2026-10-27 — Jogar selection starts empty; RCS play lives on Fila

**Context:** The Jogar picker preselected Solo and included RCS Week even
though RCS Week already has its own first-level tab.

**Decision:** Jogar offers only Ranqueada Solo and Amistosos, with no
selection on entry. Selecting a mode enables `Confirmar`; leaving Jogar
clears the selection. The default action-bar shortcut opens the empty
picker. RCS Week's existing gate, lineup and queue action are presented in
the RCS Week › Fila play panel.

**Why:** Selection belongs to Jogar, while the RCS competition remains in
its own tab.

**Watch out:** Preserve active Solo queue behavior across tabs and keep the
RCS queue action attached to Fila.

## 2026-10-26 — A global play bar: the chosen mode + one CTA on every tab

**Context:** In the current app the bottom bar shows the last mode picked
in Jogar on every tab, and the RCS variant (`VER ESCALAÇÃO`) felt stuck.
Owner chose a global play bar.

**Decision:** The bar always shows the chosen play mode and its CTA
(`src/data/modes.js`), the same on every tab. Only the places where modes
are picked (Jogar, RCS Week) change it.

**Why:** One predictable shortcut to a match from anywhere in the panel.

**Watch out:** Per-tab primary actions (buy, claim) belong inside the
screen, never in the bar.

## 2026-10-26 — RCS Week is one tab; the RCS queue moved out of Jogar

**Context:** The current app has an `RCS WEEK` tab and a separate Jogar ›
RCS Week queue. Owner: merge.

**Decision:** The queue is the `fila` sub of the `rcs-week` tab; Jogar
keeps Ranqueada Solo and Amistosos and links to RCS Week.

**Why:** One home for the weekly competition.

**Watch out:** The sub label `Fila` is ours (from the CTA `Entrar na fila
RCS`), not from the current app.

## 2026-10-26 — Rank ladder: LoL-style tiers with football names at the top

**Context:** Only Prata, Ouro and Platina were visible. Owner: use a
LoL/Valorant ladder adapted to football.

**Decision:** `Ferro` → `Bronze` → `Prata` → `Ouro` → `Platina` →
`Esmeralda` → `Diamante` (divisions IV–I, 100 PDL each), then `Craque`,
`Lenda`, `Fenômeno` (apex). Single source: `src/data/ranks.js`.

**Why:** Familiar structure for players; the apex names give the football
voice.

**Watch out:** Tier colors are data (a small medal/chip), never frames or
glows — see `rbg-taste`.

## 2026-10-26 — Items use runtime-filled templates: item tile, item sheet, equip picker

**Context:** The current app opens a dialog for a shop item (`Banner
Vulcão`: preview, price in BRL/EUR/USD, `Comprar`, gift) and for a pass
reward (`Moldura Azul`: preview, `Libera com o Passe de Batalha, no nível
8`). Owner: build the dialogs; the content is added dynamically.

**Decision:** Per-type **item tiles** make up every list (pass track, shop,
rewards, equip options — owner: "slots by type, content loaded
dynamically"). Then two dialogs (`panel-builder` § Item templates): the **item
sheet** for items you don't have (shop `for-sale`, pass and club rewards
`locked`) and the **equip picker** for owned items (`Personalizar perfil`
and the Vestiário details). Owned items never show in the Loja (owner).
`src/data/items.js` only holds mock items to exercise the states.

**Why:** Same preview pattern in both places; one component keeps them
consistent and lets the game inject any item.

**Watch out:** Never design around a specific item's art or name length —
test with the longest names in the inventory (`Entrada temática da
temporada`).

## 2026-10-26 — Position codes are `GK`, `DEF`, `MID`, `ATK`

**Context:** The current app mixes `GK`/`MID`/`ATK`, `GOL`/`ZAG`/`MEI`/`ATA`
and `GOLEIRO`/`ZAGUEIRO`/`Atacante`.

**Decision:** Owner chose `GK`, `DEF`, `MID`, `ATK` everywhere.

**Why:** One vocabulary; short codes fit tiles, tables and lineup slots.

**Watch out:** They are English inside a pt-BR UI on purpose
(`docs-language-split`); give each an accessible pt-BR name
(`aria-label="Goleiro"` etc.).

## 2026-10-26 — No logo source files: use what exists or leave sized slots

**Context:** The owner has no vector or high-res files for RCS (only a
254×240 crop) and hasn't saved the RBG badges yet.

**Decision:** Use the files we have; otherwise a labelled slot at the
final size and aspect.

**Why:** Layout shouldn't wait on assets, and nobody redraws a brand mark.

**Watch out:** Never upscale the RCS crop beyond its native size.

## 2026-10-26 — Palette from the RBG badges + Nike discipline; values provisional

**Context:** The owner shared two RBG badges (flat: white "RBG" on black,
green laurel, pitch green; pixel: mint pixel letters, ball, laurel) and the
Nike DESIGN.md as the reference.

**Decision:** Ink / paper / three greys + **one pitch green** as the only
signal. Rank and rarity colors exist only as data. Token values in
`styles/tokens.css` are provisional until sampled from the badge files.

**Why:** Nike's monochrome restraint plus the badge's own green gives
"premium and sporty" without a second accent.

**Watch out:** Re-sample the greens once `public/assets/brand/` has the
badge files; check pitch green against ink and paper for AA before using it
for text.

## 2026-10-26 — Typeface: Archivo (condensed for display, normal for UI), self-hosted

**Context:** Four pairs were compared on real panel content at the 1024×576
preset (`docs/specimens/typefaces.html`). Big Shoulders Display has no
tabular figures (`1111` 41 px vs `8888` 75 px at 40 px); Inter Tight as
display fails hallmark gate 1. Archivo and Barlow passed; the owner chose
Archivo.

**Decision:** One variable family, **Archivo** (OFL, files in
`public/fonts/` with `archivo-OFL.txt`): `wdth` 62–125, `wght` 400–800,
`latin` + `latin-ext` subsets (88 + 84 KB). Declared as `'RBG Archivo'` in
`styles/fonts.css`. Display = `--display-stretch: 62%` +
`--display-weight: 800` for headlines and scoreboard numbers; UI/body =
normal width, 400/500. `.rbg` sets `font-variant-numeric: tabular-nums`.

**Why:** Athletic and technical without shouting, real tabular figures, full
pt-BR coverage, and one font file per subset instead of two families.

**Watch out:** `@font-face` is the one global rule the panel adds — keep the
`RBG ` prefix so it never collides with a host font. The specimen page still
loads Google Fonts for comparison; it's dev-only and never part of the
build.

## 2026-10-26 — One local harness for Claude, Codex, and ChatGPT Work

**Context:** Skills, rules, reviewers, and automatic checks were discoverable
only through Claude-specific paths and hook payloads. Maintaining separate
copies for each host would let workflow requirements drift.

**Decision:** `AGENTS.md` is the canonical index; `.agents/` holds shared
skills, rules, reviewers, and a dependency-free Node hook dispatcher.
Claude keeps its native settings and relative skill/rule symlinks. Codex
uses repository hook configuration; local Work uses the same core and an
explicit bootstrap/manual fallback when discovery or hooks are unavailable.
Runtime/session state and per-tool audit receipts are gitignored.

**Why:** The same design constraints, source audits, and review standards
apply to all three hosts without a plugin package or global installation.

**Watch out:** New hooks require host trust review. Cloud-orchestrated Work
does not run local command hooks. Missing independent delegation must be
reported rather than replaced with a claimed independent self-review.
See `docs/agent-setup.md` for activation and `docs/harness-verification.md`
for observed validation and limitations. No application behavior changes.

## 2026-10-19 — Animate a registered `@property`, not a plain custom property

**Context:** (from fogo-kitchen, via ppt-make-a-thon) A wipe effect
animated a custom property used inside a `mask`/gradient; it jumped instead
of interpolating.

**Decision:** Register animated custom properties with
`@property --name { syntax: '<length-percentage>'; inherits: false; initial-value: 0%; }`
before transitioning them.

**Why:** Unregistered custom properties are strings to the browser, so it
can't interpolate them — the transition snaps at the end.

**Watch out:** Relevant for progress fills and reveals driven by a custom
property; keep the registration next to the rule that animates it.

## 2026-10-26 — Rank identifiers, directional avatars, and session queue

**Context:** Elo was text-only, ranking identity images had no slots, avatar rotation toggled two placeholder labels, and finding a match was a pending action. The owner clarified the selection and queue interactions in the implementation plan.

**Decision:** Use ten original, flat SVG football crests keyed by the existing tier IDs, shared by Perfil and Ranking. Ranking data uses `tierId` and `division` rather than a combined display string. Optional `headSrc` and `crestSrc` refer only to local `/assets/` files; absent artwork stays explicitly labelled. Optional `player.avatarFrames` contains `{ angle, src }` directional frames. The shared stage selects the closest circular angle during dragging or 45° button steps, without CSS rotation or inertia.

Keep the Solo queue in the shell separately from play mode/navigation, as a start timestamp plus primary/secondary snapshot. Expose `queue()` and `startQueue()` to screens. Search survives navigation and closing the panel, and is cleared by cancellation or page reload. One shell interval updates visible elapsed text from the timestamp, without view replacement or per-second live announcements. The global active-search bar owns cancellation. The mode picker uses three radio choices with explicit selection and confirmation. `Encontrar partida` navigates only; `Entrar na fila` starts searching.

**Why:** Rank crests establish identity; existing native radios and pointer events cover the requested controls. A shell-owned search avoids resetting it when a screen unmounts and ensures cancellation remains available everywhere. Timestamp-based elapsed time survives delayed browser ticks.

**Watch out:** Real heads, club crests, and directional sprites are still absent. Do not fabricate them or crop reference screenshots. Active queue state is never serialized into URLs or storage. No backend matchmaking, simulated opponents, new dependencies, remote assets, or publishing are introduced. Nested screen entry can request another render; preserve the cleanup from the latest render so abandoned views release their listeners.

## 2026-10-27 — Football pitch crests and apex entrance

**Context:** The owner asked for stronger rank crests inspired by the original
ranking reference and open emblem resources, with motion for higher ranks.

**Decision:** Keep the ten local SVG crests, add top-down pitch markings and
stronger upper-tier framing, and use a one-shot 600 ms rise-and-settle on apex
crests. The animation stops under reduced motion and never loops.

**Why:** The pitch geometry signals football without adding a clip-art ball;
the crest carrier and tier hierarchy take cues from open emblem kits while
preserving RBG's flat badge palette.

**Watch out:** Keep tier colors as data, keep the apex entrance to one small
crest, and do not add glow, repeat motion, or remote runtime assets.

## 2026-10-26 — Start Solo searching from the global play bar

**Context:** The owner requested one start action when viewing Jogar's Solo queue, replacing the separate in-view start button.

**Decision:** On Jogar › Ranqueada Solo the idle global CTA reads `Entrar na fila` and starts searching. On other screens its existing mode-specific navigation remains intact, including `Encontrar partida` opening the mode picker. Active searching still shows `Sair da fila` everywhere. The screen API no longer exposes the unused `startQueue()` method.

**Why:** The primary action stays at the panel's established bottom-right location and avoids two competing match buttons.

**Watch out:** Confirming a mode still does not start searching. Cancellation restores keyboard focus to the same persistent global CTA.

## 2026-10-26 — Populated example content by default

**Context:** The owner requested complete fictional content and temporary pixel
art for first-glance testing, including previously uncaptured fields and
empty-only screens.

**Decision:** Populate the existing mock-data modules and add filled default
states, retaining explicit empty/pending/locked QA URLs. Mark the shell “Dados de
exemplo”. Sources, license notes, and the boundary between example fixtures and
product facts live in `docs/demo-content.md`.

**Why:** A fully populated panel exposes composition, density, and interaction
problems that placeholder art and empty lists hide. Existing renderers and native
controls are sufficient; no runtime dependencies or backend are needed.

**Watch out:** Sample rewards, club progress, RCS results, TOPs, and temporary
artwork are not verified game facts. Do not copy them into the screen inventory
as evidence. Data resets on reload; final game integration must replace fixtures.

## 2026-10-27 — Material Symbols Outlined as the icon set

**Context:** The owner approved Google's Material Symbols, Outlined style
(fonts.google.com/icons), as a free source for panel icons. Until now each
icon was hand-drawn inline SVG.

**Decision:** New icons come from Material Symbols Outlined, one set for the
whole panel. Copy the glyph's SVG path into inline markup (`viewBox="0 -960
960 960"`, `fill="currentColor"`, `aria-hidden="true"`), at weight 300–400 so
the stroke reads 1.5–2 px at 20–24 px. Every glyph lives in
`src/screens/icons.js`; the owner asked for a full sweep the same day, so no
hand-drawn icons remain (rank crests are artwork, not icons).

**Why:** A maintained, licensed set (Apache 2.0) keeps icons consistent
without drawing each one, and inline SVG needs no font, request or dependency.

**Watch out:** Never load the Material Symbols web font or any CDN URL — the
panel loads nothing from other hosts. Don't use Filled, Rounded or Sharp
variants, and don't mix in hand-drawn icons once a screen migrates. Icons
stay decorative next to a visible pt-BR label, or carry an `aria-label` on
their control.

## 2026-10-28 — Subtle bottom-third ambient background

**Context:** The owner requested a barely visible floating brand gradient,
fading upward from the panel bottom, and selected continuous drift with a
pause control rather than a one-shot entrance.

**Decision:** Allow one shell-owned decorative layer as a specific exception
to the flat-background and no-ambient-loop guidance in rbg-taste, hallmark
texture, and motion. Two pitch-green radial gradients share a 14% opacity
cap and a stationary mask that clears the upper two-thirds. Only transform
animates: independent 18- and 24-second wave cycles translate and gently
stretch the two gradient areas, with opposite directions and an offset
phase. No blur, glow, images, or dependencies.

**Why:** The requested movement adds a quiet variation to the background
without competing with content. A native `Animar fundo` checkbox in settings
pauses at the current frame, independently of resolution. Its preference
persists under `rbg:ambient-motion`, or in memory when storage is unavailable.

**Watch out:** System reduced motion always wins and renders a static wash;
the disabled checkbox explains why. System preference changes apply live
without overwriting the saved choice. Navigation does not recreate the
layer; hiding the panel removes its animation from rendering. All other
ambient-motion and gradient restrictions remain in force.

**Tuning:** Raised the opacity from 6% to 14% after the owner found the
first version too faint to notice. The owner then requested a visible soft
wave instead of the initial tiny 36-second alternating drift. The two areas
now travel 12% horizontally over each cycle with a gentle vertical swell;
their shared opacity cap and stationary bottom-third mask remain unchanged.

## 2026-10-28 — Semantic red for negative information

**Context:** Defeats and lost PDL were neutral while positive outcomes used pitch green. The owner requested red for all negative information and danger actions.

**Decision:** Add `--danger: #ffc2c2` for negative outcomes, aggregate loss/conceded-goal statistics, own goals, negative goal difference, and the leave-club action. Paired victories use existing pitch green; draws and zero deltas stay neutral. This is an owner-approved semantic exception to the brand palette, not a sampled badge color. The light red is chosen for readable small text on the dark green panel surfaces.

**Why:** Make positive and negative outcomes equally easy to identify while retaining labels, letters, and signs as non-color cues.

**Watch out:** Do not recolor full rows, neutral metadata, ordinary cancel/close controls, or the brand badges. Outcome mapping must distinguish draws from losses.

## 2026-10-28 — Orchestrated content entrances

**Context:** The owner requested subtle appearances across every main tab,
ordered left to right and top to bottom, without overloading navigation.

**Decision:** The shell binds one shared content-reveal helper after screen
entry. Native content groups (headings, paragraphs, paired stats, list items,
table rows, controls, avatar stages and item tiles) fade in with a 4px rise.
Groups enter in measured visual rows, then left to right within each row.
The reveal duration is 240ms with the existing ease-out; a stagger spanning
the fast duration (120ms) keeps the entire entrance within 360ms, independent
of list size. This is an owner-requested exception to the usual 180ms view
ceiling: the owner explicitly asked for gentle, soft motion without trending
fast, while avoiding a slow sequence.
Entrances run on the initial mount and first-level tab changes only. Sub-tab
changes, filters, pagination, mode selection and other in-tab updates stay
instant. Jogar mode selection updates the native radio state, action bar and
URL without replacing the view. Persistent chrome and content outside the
visible view are excluded.

**Why:** A single choreography makes content changes easier to follow across
all screens without individual screen timers, dependencies, layout animation,
or nested effects on a group and its contents.

**Watch out:** Content is visible by default and remains immediately usable.
Focus and pointer interaction finish the target's entrance immediately.
Screen cleanup cancels pending frames and running reveals on navigation.
System reduced motion skips the effect and cancels it live when enabled.
Keep later content units semantic so labels and values enter together.

## 2026-10-31 — Public GitHub Pages demo

**Context:** The owner requested a public GitHub Pages deployment of the new UI.

**Decision:** Publish the sanitized `Davecelot/rbg-ui` repository publicly and deploy its Vite `dist/` output using GitHub Actions on `main`. This supersedes the earlier private-visibility restriction for this repository. Resolve validated runtime image paths through Vite’s base URL, matching the existing `vite build --base ./` output.

**Why:** The UI has no backend and needs only static hosting. Reuse the existing build without adding dependencies or a second hosting service.

**Watch out:** The remote history is a separate sanitized snapshot. Publish changes on top of that history; never push the local reference captures or local history. Pages serves synthetic demo data and local assets publicly. Real purchases, gifting, redemption, and matchmaking remain prototype actions.

## 2026-10-31 — Owner-controlled public contributions

**Context:** The owner requested sole authority over contribution approval and repository writes when publishing publicly.

**Decision:** Assign all files to `@Davecelot` using CODEOWNERS; require code-owner approval for contributions; restrict `main` updates to the repository admin, currently only Davecelot. Preserve owner direct pushes because GitHub disallows self-approval. Block force pushes and deletion even for the owner. Remove the existing non-owner collaborator’s write access; contributions can use forks and pull requests. This extends the earlier main-only workflow to permit external contribution PRs at the owner’s request.

**Why:** CODEOWNERS identifies the reviewer; server-side rules and collaborator permissions enforce control. Pin deployment actions, disable persisted checkout credentials, limit Actions to approved GitHub actions, use read-only tokens by default, and enable available GitHub secret/dependency protections.

**Watch out:** Repository admin bypass is role-based; granting another admin would extend bypass authority. Public readers can copy and fork published code. Keep private source captures and the original local history excluded. Owner account authentication settings are managed separately by the owner.
