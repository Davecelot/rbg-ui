# Self-validation checklist

A set of actual checkboxes to run through before calling a screen's (or the
panel shell's) accessibility work done, organized by **area of the panel
you're touching** rather than by WCAG guideline number.
[`wcag-checklist.md`](wcag-checklist.md) has the full per-criterion detail;
this file is the other axis — "what do I actually check, in what order, for
the thing in front of me" — and it exists specifically to make one category
(Keyboard navigation) an explicit, mandatory, separately checked-off item
instead of an implied afterthought to automated scanning.

## Who checks what

Each item is tagged with what verifies it:

| Tag          | Checked by                                                                                      | How                                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `[source]`   | [`scripts/audit-a11y.py`](../scripts/audit-a11y.py), or a careful read of the screen module/CSS | `python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py`                                          |
| `[rendered]` | [`scripts/a11y-self-check.js`](../scripts/a11y-self-check.js) in the running panel              | `npm test` (the a11y spec runs it on every screen × state), or pasted into the console on `npm run dev` |
| `[walk]`     | A person (or an agent with browser tools) pressing real keys                                    | The self-check's **Record keyboard walk**, or a Playwright walk with real `page.keyboard` presses       |
| `[person]`   | A person only                                                                                   | Screen reader, zoom, plain-language copy. Never marked done without someone doing it.                   |

## How to use this

Run the relevant section(s) for the change — not every section applies to
every change (a screen with no form has no Forms section; the shell has
most of them). Check each box against the running panel (`npm run dev`), not
against the source alone — items marked **(verify live)** cannot be
confirmed by reading a screen module or by an automated scan.

## 1. Document, dialog and screen structure

- [ ] `[source]` The host simulator's `index.html` has a descriptive
      `<title>` and `lang="pt-BR"`; `#rbg` also carries `lang="pt-BR"` —
      2.4.2 / 3.1.1, Level A.
- [ ] `[rendered]` `.rbg-panel` is `role="dialog"` with
      `aria-labelledby="rbg-title"` resolving to the brand label — 4.1.2.
- [ ] `[source]` Every screen starts at `h2` (`.visually-hidden` if the
      design shows none); sub-sections use `h3` without skipping — 1.3.1 /
      2.4.6.
- [ ] `[rendered]` `.rbg-view` is `role="tabpanel"`, labelled by the
      selected tab (sub-tab when present) — 1.3.1 / 4.1.2.
- [ ] `[source]` DOM order matches reading order at every container size,
      even when grid areas move the hero — 1.3.2.

## 2. Semantic markup — HTML and ARIA

See [Pattern 2](../SKILL.md#pattern-2-native-controls-first) for the full
native-first rule; the checklist version:

- [ ] `[source]` Native elements wherever one exists for the job
      (`<button>`, `<a href>`, `<table>`, `<progress>`, `<ol>`/`<ul>`,
      `<dl>`, `<fieldset>` + radios, `<dialog>`) — 4.1.2, Level A.
- [ ] `[source]` Ranking, match history and roster stats are `<table>` with
      `<caption>` and `<th scope>` — 1.3.1.
- [ ] `[source]` Every progress bar (missions, XP, PDL) exposes its value
      (`value`/`max` or `aria-valuenow/min/max`) and a pt-BR
      `aria-valuetext`, with the numbers also visible — 1.3.1 / 4.1.2.
- [ ] `[source]` ARIA only where native HTML genuinely can't express the
      semantics (the tabs are the expected exception).
- [ ] `[rendered]` Every `aria-labelledby`/`aria-describedby`/`aria-controls`
      points at an ID that exists and is unique; screen IDs are prefixed
      with tab and sub id — see [Pattern 5](../SKILL.md#pattern-5-aria-id-references-must-resolve-in-the-rendered-dom).

## 3. Content clarity and language

- [ ] `[source]` Button and link text names the action on its own
      (`Ver passe`, `Comprar`); arrows/icons after the text are
      `aria-hidden` — 2.4.4.
- [ ] `[source]` Abbreviations (`PDL`, `V/D/E`, `MMR`) are explained once
      per screen (visible legend or `<abbr title>`) — 3.1.4.
- [ ] `[person]` Copy is plain pt-BR the players use, literal from
      `docs/screen-inventory.md` where it exists — 3.1.5.
- [ ] `[source]` Instructions don't rely only on shape, position or color
      ("o botão verde") — 1.3.3.
- [ ] `[person]` Nothing on the screen invents features, rewards, prices or
      stats (see the `design-direction` rule).

## 4. Keyboard navigation — mandatory, verify live

This is the section this checklist exists to make impossible to skip.

### Why keyboard navigation gets its own mandatory section

Two things that normally catch accessibility regressions both miss
keyboard bugs completely:

- Reading the source — tabs can look correct while the roving `tabindex`
  leaves two stops, arrows don't wrap, or Esc drops focus on `<body>`.
- An automated scanner — it can confirm a role exists, not that a key
  press actually does the right thing. (The Fogo DS incident that created
  this rule: a `tabindex="-1"` made every row of a list unreachable, and
  neither template review nor a DOM scanner caught it.)

They are only found by someone physically operating the running panel.

### Checklist

- [ ] `[walk]` **(verify live)** The host launcher opens the panel and
      focus lands on the active tab — 2.4.3.
- [ ] `[walk]` **(verify live)** In the main tablist, `←/→` move and
      activate, wrap at the ends, `Home`/`End` jump; the tablist is one Tab
      stop — 2.1.1, Level A.
- [ ] `[walk]` **(verify live)** Same for the sub-tablist on every tab that
      has one.
- [ ] `[walk]` **(verify live)** Tab reaches every control in the view in
      reading order, then the action-bar CTA (also when it is
      `aria-disabled`), then leaves the panel — 2.1.1 / 2.4.3.
- [ ] `[walk]` **(verify live)** Pagination and in-view actions leave focus
      somewhere sensible (the control, or the new content's heading) —
      2.4.3.
- [ ] `[walk]` **(verify live)** Esc and the close button close the panel
      and return focus to the launcher; an inner open widget (confirm,
      menu) closes first — 2.1.2 / 2.4.3.
- [ ] `[walk]` **(verify live)** Any drag interaction (rotate avatar) has a
      button alternative — 2.5.7.
- [ ] `[source]` No single-letter shortcuts; if one is added it can't fire
      while typing — 2.1.4.
- [ ] `[rendered]` The `:focus-visible` indicator is visible on every
      focusable element and ≥ 3:1 against ink, paper and pitch green —
      2.4.7 / 1.4.11.
- [ ] `[rendered]` A focused element is never hidden under the header or
      the action bar (`scroll-padding` on `.rbg-view`) — 2.4.11.

## 5. Color and contrast

- [ ] `[rendered]` Text ≥ 4.5:1 (AA) and |Lc| ≥ 75 for body/metadata on
      ink and paper; large text ≥ 3:1 — 1.4.3.
- [ ] `[rendered]` Pitch green checked both ways: green text on its
      surface, text on a green CTA, green fill vs. its progress track —
      1.4.3 / 1.4.11.
- [ ] `[rendered]` Tier and rarity chips: their text meets contrast; the
      chip names itself — 1.4.3 / 1.4.1.
- [ ] `[rendered]` Text over pixel art has a solid field — 1.4.3.
- [ ] `[rendered]` Non-text UI (focus ring, selected-tab indicator,
      meaningful hairlines, icons) ≥ 3:1 — 1.4.11.
- [ ] `[source]` Color is never the only signal (selected tab, completed
      mission, online/offline, win/loss, disabled CTA) — 1.4.1.
- [ ] `[rendered]` A disabled CTA's label and reason stay readable
      (|Lc| ≥ 45) and "disabled" is also said in text — 1.4.1.

## 6. Forms and fields

Club identity, invites and kit colors are forms:

- [ ] `[source]` Every field has an associated `<label>`; option groups are
      `<fieldset>` + `<legend>` — 1.3.1 / 3.3.2.
- [ ] `[source]` Required fields are marked in text and with `required` —
      3.3.2.
- [ ] `[source]` Invalid fields set `aria-invalid` and point at a pt-BR
      correction message with `aria-describedby` — 3.3.1 / 3.3.3.
- [ ] `[walk]` A choice doesn't save until the save button is pressed —
      3.2.2.

## 7. Images and pixel art

- [ ] `[source]` Every `<img>` follows the alt policy: avatars and items
      with pt-BR alt naming the player/item; brand repeats, laurels, pitch
      lines and patterns `alt=""` / `aria-hidden` — 1.1.1.
- [ ] `[source]` No emoji standing in for items or icons; icons inside
      labelled buttons are `aria-hidden` — 1.1.1.
- [ ] `[source]` No numbers, prices or ranks drawn as images — 1.4.5.
- [ ] `[source]` Any audio never auto-plays and has a keyboard-operable mute
      exposing `aria-pressed` — 1.4.2.

## 8. Host sizes and embedding

- [ ] `[rendered]` `npm test` passes in every host project (`size-1024`,
      `size-1280`, `size-1600`, `shrunk`): no horizontal
      scroll inside `.rbg-panel`, only `.rbg-view` scrolls, nothing clipped
      under `.rbg-actionbar` — 1.4.10.
- [ ] `[rendered]` Targets ≥ 24×24 everywhere and ≥ 44×44 for tabs, close
      and the primary CTA at `shrunk` — 2.5.8.
- [ ] `[person]` Browser zoom 200% on a 1280×720 window still works
      (compact layout) — 1.4.4.
- [ ] `[rendered]` Text-spacing override (line-height 1.5, letter 0.12em,
      word 0.16em, paragraph 2em) clips nothing — 1.4.12.
- [ ] `[source]` No selector in `styles/` escapes `.rbg` (`html`, `body`,
      `*`, bare elements) — panel-embedding.
- [ ] `[source]` Visible labels are contained in accessible names when tabs
      collapse to icons at compact sizes — 2.5.3.

## 9. Shell behavior and motion

See [Pattern 7](../SKILL.md#pattern-7-the-panel-lives-inside-someone-elses-app).

- [ ] `[rendered]` Each tab or sub-tab change is announced once, politely,
      by `#rbg-status` (`"<Tab> — <Sub>"`) — 4.1.3.
- [ ] `[rendered]` `.rbg-view[data-tab][data-sub][data-state]` and
      `.rbg-actionbar[data-mode]` mirror the deep link
      `?tab=&sub=&state=&mode=`.
- [ ] `[source]` Nothing loops or auto-rotates for > 5 s; countdowns are
      not live regions — 2.2.2.
- [ ] `[rendered]` Under `prefers-reduced-motion: reduce` (the
      `reduced-motion` project), tab transitions are instant or a fade,
      count-ups show the final value, celebrations are a static state —
      and the story still reads — 2.3.3.
- [ ] `[source]` + `[person]` No effect flashes more than 3 times per
      second; celebrations are one-shot and element-sized — 2.3.1.

## 10. Manual verification (beyond automated scanning)

`audit-a11y.py`, the Playwright self-check and axe/Lighthouse cannot see
everything. Before calling accessibility work done:

- [ ] Section 4 (Keyboard navigation) has been verified live, at a regular
      size and at `shrunk`, not assumed from source.
- [ ] The panel has been operated with a screen reader at least once
      (VoiceOver on macOS) for anything genuinely novel — a new widget, a
      new ARIA pattern, a new kind of screen.
- [ ] Every scanner, self-check and axe finding has been triaged into the
      [priority table](../SKILL.md#pattern-3-prioritize-by-user-impact) and
      either fixed or explicitly deferred with a reason. `manual` items are
      reported as "needs a person", never as passed.
