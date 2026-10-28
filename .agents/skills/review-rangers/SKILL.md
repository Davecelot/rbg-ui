---
name: review-rangers
description: >
  Multi-perspective review framework for the RBG panel using a committee of
  independent reviewers with distinct lenses (accessibility, motion,
  performance, art direction/taste, host-embedding, game-UX,
  maintainability, security-lite) and a safety guard with veto authority.
  Produces a structured HIGH/MEDIUM/LOW/VETO verdict, then runs a controlled
  remediation loop (The Mender) that iterates findings to HIGH confidence —
  with an HITL checkpoint before any change and mandatory human escalation
  for critical findings.
  Trigger: when requesting a structured multi-perspective review of screens,
  the panel shell, styles, motion, an architecture decision, or a batch
  of changes before committing it.
metadata:
  author: davecelot
  version: '1.3.0'
  changelog: >
    1.3.0: shared source and capability-based loading for Claude, Codex, and
    local ChatGPT Work; preserves workflows and audits across runtimes.
    1.2.0: adapted for rbg-ui from ppt-make-a-thon — presenter-ops lens
    replaced by host-embedding (fits any host size, no style leakage, focus
    return, no remote loads), new game-UX lens (progress, rewards, next
    action, ranked data, price clarity); taste lens points at rbg-taste and
    hallmark; Playwright projects are the host-size matrix.
    1.1.0: adapted for ppt-make-a-thon from fogo-kitchen — lenses retargeted
    to a vanilla HTML/CSS/JS slide deck (60fps compositor-only motion, asset
    weight, art direction via deck-taste and hallmark, presenter-ops for the
    venue: keyboard, fullscreen, projector contrast, offline); validation is
    lint, Playwright, and the hammock/motion/a11y audit scripts; the
    build/harness config replaces CI/deploy as a critical stop. 1.0.0:
    initial skill, adapted from an external review-rangers skill.
  auto-invoke: 'Requesting a multi-perspective review of screens, the panel shell, motion, or an architecture decision'
  allowed-tools: [Read, Grep, Glob, Bash, Edit, Write]
---

# Review Rangers Guide

## When to Use

Use this skill when:

- A change to the panel carries meaningful risk: a new tab or screen, the
  shell (`src/panel.js` — tabs, sub-tabs, states, the `?tab=&sub=&state=`
  URL, open/close and focus), a motion system, or the
  stylesheet foundations (`styles/tokens.css`, `styles/base.css`).
- A single reviewer perspective is likely to miss domain-specific edge cases
  (a screen that looks right at 1920 wide but breaks on the minimum panel, a
  reward that reads fine to the designer and confuses a player).
- You need a structured verdict, not an opinion.
- A batch of changes is about to be committed, or a redesigned tab is about
  to be called done, and needs adversarial scrutiny.
- A skill restructure, agent change, hook, or rule needs cross-domain
  validation before committing.

Do not use this skill for:

- Trivial single-file edits with no systemic impact (a typo in screen copy).
- Tasks already covered by an automated check (`npm run lint`, `npm test`,
  the audit scripts) — run those instead.
- Reviews where committee overhead exceeds the risk of getting it wrong.
- A taste-only critique of how the panel looks — use the `screen-critic` agent
  or `mody:studio` critique; review-rangers folds taste in as one lens among
  several, it doesn't replace a dedicated design critique.

---

## Runtime and independence

Use the current host's independent subagent tool, not a hardcoded Claude
API. Load shared reviewer procedures from `.agents/reviewers/` when relevant.
If fresh independent delegation is unavailable, report that limitation;
sequential self-review does not satisfy the committee requirement.
Mody is optional; use the local skills for each review lens.

## Core Workflow

1. Identify the target (screens, shell, styles, motion, decision, artifact)
   and its domain.
2. Determine committee size: 3 members for routine reviews, 5 for high-risk
   or cross-domain targets (a full-panel review before calling the redesign done is always 5).
3. Assign each member a distinct evaluation lens from the lens catalog below.
   Run them independently — no member sees another's output.
4. Determine the expert domain for the safety guard.
5. Spawn 1 safety guard. It evaluates the target from an authoritative
   expert position.
6. Run the committee and safety guard in parallel.
7. Collect all outputs.
8. Synthesize a structured verdict following the Synthesis Rules.
9. Emit the verdict with confidence tier, top findings, and recommended
   action.
10. **If the tier is below HIGH**, enter the **Remediation Loop (The
    Mender)** — see that section. The committee/safety guard remain
    read-only judges; the Mender executes fixes; the committee re-reviews
    after each round. The loop is bounded and escalates critical findings to
    a human.
11. Emit the **final report** once the committee returns HIGH, or once the
    loop hits a critical stop / bound and control returns to the human.

Lenses that judge what renders (accessibility, motion, art direction,
host-embedding, game-UX) should look at the rendered panel, not just the
source: give them the per-screen/state screenshots at every host size from
[`playwright-worker`](../playwright-worker/SKILL.md) alongside the files.

---

## Committee Protocol

### Size

| Target Risk                          | Committee Size |
| ------------------------------------ | -------------- |
| Routine (single concern)             | 3 members      |
| High-risk, cross-domain, or pre-done | 5 members      |

### Lens Catalog

Assign lenses based on what is being reviewed. Never assign the same lens to
two committee members.

| Lens                      | What It Evaluates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Accessibility**         | WCAG 2.2 Level AA for an embedded panel — the WAI-ARIA tabs pattern on tabs and sub-tabs, visible focus, focus entry and return to the host launcher, `Esc` to close, the `#rbg-status` announcement on tab change, heading order per screen, pt-BR `alt` for avatars and items, `lang="pt-BR"`, contrast on ink, paper and pitch green, color never the only signal for rank/rarity/state, reduced motion (see [`a11y-checker`](../a11y-checker/SKILL.md))                                                                                                             |
| **Motion**                | Each animation has a named purpose, GPU-safe properties only (`transform`, `opacity`, `filter`, `clip-path`), easing/duration standards, interruptibility on fast tab switching, `prefers-reduced-motion` handling, no ambient loops, consistency across similar transitions (see [`motion`](../motion/SKILL.md)'s `review` mode)                                                                                                                                                                                                                                       |
| **Performance**           | Smooth tab switches and scrolling inside the view; compositor-only animation; long lists (ranking, shop) cheap to render; pixel-art image weight and decode cost (missing `width`/`height`, oversized sprites); fonts loaded once and self-hosted; nothing that slows the host app underneath                                                                                                                                                                                                                                                                           |
| **Art direction / taste** | Fidelity to the four pillars (RBG badges × Nike discipline × fútbol culture × pixel art as photography), one hero per screen, one accent, flat surfaces, real brand assets over imitations, no AI-slop or generic gamer-UI tells (see [`rbg-taste`](../rbg-taste/SKILL.md) and [`hallmark`](../hallmark/SKILL.md))                                                                                                                                                                                                                                                      |
| **Host-embedding**        | Lives safely inside someone else's app: fits every host size from the minimum panel up with no horizontal scroll (container queries, not viewport media queries or `vw`), only the view scrolls, styles scoped under the panel root with no leakage into or from the host, no `html`/`body` assumptions, sane stacking, close/`Esc` and focus return to the launcher, deep links (`?tab=&sub=&state=`) restore exactly, **no runtime loads from other hosts** (see the `panel-embedding` rule)                                                                          |
| **Game-UX**               | The player instantly understands where they stand and what to do next: progress (XP, levels, missions) legible with clear current/next values, rewards and their conditions explicit, one obvious next action per screen in the action bar, ranked data scannable (position, tier, key stat), locked/empty/loading states honest, prices and currencies clear and never misleading (no dark patterns, no fake urgency), every feature traceable to [`docs/screen-inventory.md`](../../../docs/screen-inventory.md) (see `mody:ux-laws` for the principle behind a call) |
| **Maintainability**       | Screen modules follow the `{ id, tab, label, states, render }` contract, the tab registry stays the single source of order, cohesion and naming, duplication across screens, tokens used instead of hard-coded values, mock data in `src/data/`, no speculative abstraction (see [`hammock`](../hammock/SKILL.md))                                                                                                                                                                                                                                                      |
| **Security-lite**         | Unsafe HTML injection (`render` output built only from repo templates and mock data, never URL input interpolated into `innerHTML`), `target="_blank"` with `rel="noreferrer"`, third-party URLs and what they leak about players, secrets in the repo, dependency risk (see [`security-guardian`](../security-guardian/SKILL.md))                                                                                                                                                                                                                                      |

### Independence Rules

- Run committee members in parallel.
- Pass only the target artifact (plus screenshots for rendered lenses) and
  the member's assigned lens as context.
- Do not share intermediate findings between members before synthesis.

---

## Safety Guard Protocol

### Domain Resolution

```text
Target is src/panel.js, main.js, or index.html?         -> Domain: "Panel shell correctness: tabs/sub-tabs, states, URL state, open/close and focus return, live-region announcements, embedding safety"
Target is src/screens/**, src/data/** or styles/**?     -> Domain: "Accessible, legible, performant screens in a host-sized panel, true to rbg-taste and the screen inventory"
Target is public/assets/** or styles/tokens.css?        -> Domain: "Brand fidelity to the RBG badges, the rbg-taste palette/type roles, and asset weight"
Target is playwright/**?                                -> Domain: "Reliable browser verification of the panel across the host-size matrix (no flaky timing, real assertions)"
Target is a skill, rule, agent, or hook file?           -> Domain: "This repo's harness conventions (forge-me-a-skill conventions)"
Target is an architecture decision?                     -> Domain: "This repo's structure and conventions (no-frameworks, hammock)"
Target is unclear?                                      -> Ask before spawning
```

### Specialization

The safety guard:

- Operates as an authoritative expert, not a peer reviewer.
- Evaluates the target for correctness, safety, and conformance to domain
  standards.
- Raises blockers, not suggestions. A structural flaw from the safety guard
  is a hard finding.
- Runs in parallel with the committee, not after it.

---

## Synthesis Rules

### Confidence Tiers

| Tier       | Condition                                                      | Recommended Action                          |
| ---------- | -------------------------------------------------------------- | ------------------------------------------- |
| **HIGH**   | Safety guard passes + committee majority agrees                | Approve with noted caveats                  |
| **MEDIUM** | Safety guard passes + committee is split                       | Approve after addressing split findings     |
| **LOW**    | Safety guard raises a blocker OR committee majority flags risk | Block — require remediation before approval |
| **VETO**   | Safety guard raises a structural flaw                          | Hard block — do not proceed                 |

### Contradiction Handling

- Safety guard findings override committee findings on correctness and
  safety.
- When committee members contradict each other, count lenses: majority
  rules unless a minority finding is a security, accessibility, or
  host-embedding blocker (something that would break the panel or the host
  for a player).
- A single security or accessibility finding from any voice is sufficient
  for LOW or VETO tier.
- When art direction and another lens conflict (e.g. a celebration effect taste
  wants vs. reduced motion), the non-negotiable wins and the taste lens
  proposes an alternative — never the reverse.

### Verdict Structure

Emit exactly this structure:

```text
CONFIDENCE: {HIGH | MEDIUM | LOW | VETO}

SUMMARY:
{1–2 sentences on the overall state of the target}

TOP FINDINGS:
1. [{Lens / Safety Guard}] {Finding} — {Severity: Info | Warning | Blocker}
2. [{Lens / Safety Guard}] {Finding} — {Severity: Info | Warning | Blocker}
...

RECOMMENDED ACTION:
{Approve | Approve with caveats | Block — remediate before resubmit | Hard block}
```

---

## Decision Tree

```text
Is there a safety guard blocker?
  YES -> VETO — hard block regardless of committee output

Does the safety guard pass?
  YES -> evaluate committee output

Do 3+ of 5 committee members (or 2+ of 3) flag a risk?
  YES -> LOW — block and require remediation
  NO  -> continue

Does any committee member flag a security, accessibility, or host-embedding blocker?
  YES -> LOW at minimum — escalate to safety guard if not already covered

Does committee majority agree the target is sound?
  YES and safety guard passes -> HIGH or MEDIUM depending on split
  NO                          -> LOW
```

---

## Remediation Loop — The Mender

The committee and safety guard **judge**; they never fix. **The Mender** is
the remediation worker that **executes** the fixes for findings below HIGH
confidence, in a controlled loop with the conversation orchestrator. The
Mender never declares confidence — the committee re-judges after every
round. This makes the review _act_ on its own findings (deep autonomous
iteration) while keeping the human in the loop only for what is critical or
unresolvable.

### Roles (do not blur them)

| Role                        | Reads | Writes          | Decides confidence                |
| --------------------------- | ----- | --------------- | --------------------------------- |
| Committee (Rangers)         | ✅    | ❌              | contributes lens findings         |
| Safety Guard (expert)       | ✅    | ❌              | VETO authority                    |
| **The Mender** (worker)     | ✅    | ✅ (Edit/Write) | **never** — only executes         |
| Orchestrator (conversation) | —     | —               | runs the loop, emits final report |

### HITL Checkpoint (before The Mender acts)

After the verdict is emitted and the tier is below HIGH, the orchestrator
MUST pause at a **human-in-the-loop checkpoint**: present the findings and
ask the person to approve firing The Mender. **This checkpoint is
auto-skipped only in auto-mode** (when the caller declares
unattended/autonomous operation). In interactive mode, no file is changed
without this go-ahead — preserving the "asking for a review never silently
mutates my screens" guarantee.

### Loop Protocol

```text
1. Committee + Safety Guard emit tier (HIGH | MEDIUM | LOW | VETO).
2. If HIGH → emit final report. Done.
3. If a CRITICAL-STOP condition applies → STOP, escalate to human (no auto-fix). Done.
4. HITL checkpoint: approve firing The Mender? (auto-skipped in auto-mode)
5. The Mender remediates the open findings, then leaves the tree GREEN (see its contract below).
6. Orchestrator re-invokes the committee + safety guard on the changed target.
7. Tier improved to HIGH? → final report.
   Not yet, and within bounds? → back to step 3 (next round).
   Bound exhausted / stagnation? → STOP, escalate to human.
```

The orchestrator MAY re-invoke individual committee members or the safety
guard mid-round to help The Mender reason about a complex or ambiguous
finding before it acts.

### The Mender's Contract ("done" means)

- Remediates the specific findings handed to it — nothing out of scope.
- **Leaves the working tree green** for whatever validation applies to the
  changed surface:
  - Any change under `src/`, `styles/`, `main.js`, `index.html`, or the root
    config: `npm run lint` and `npm run format` pass.
  - Any change that can affect what renders or how the panel navigates:
    `npm test` (Playwright — size-1024, size-1280, size-1600,
    shrunk and reduced-motion projects) passes.
  - A change that can affect the bundle (imports, assets, `vite.config.js`):
    `npm run build` passes.
  - The advisory audit the finding came from is re-run and its output
    reported:
    `bash .agents/skills/hammock/scripts/audit-simplicity.sh --diff`,
    `bash .agents/skills/motion/scripts/audit-motion.sh --diff`,
    `python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py`.
    It does NOT return code it knows is broken for the committee to discover.
- When a fix changes something only a human eye can judge (art direction,
  motion feel), it states the screen, state and host size to look at (`npm run
dev`, then `?tab=<id>&sub=<id>&state=<state>`). Non-code findings route to their fitting verification
  instead.
- **Never declares confidence** and never edits the committee's verdict —
  it reports _what it changed_, the committee reports _whether it's now
  HIGH_.
- Returns a structured change summary (files touched, finding→fix mapping,
  validation status).

### Critical Stop — escalate to human (never auto-resolve)

If any of these holds, the loop STOPS and hands control to a human with a
clear report — The Mender does NOT auto-resolve it:

| Condition                                                                                                                                                                | Why it needs a human                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| **VETO persists** after a remediation round                                                                                                                              | A structural flaw the AI could not clear         |
| **Security or accessibility finding at Severity: Blocker**                                                                                                               | High user/safety impact — needs human sign-off   |
| **Change to build or harness config** (`vite.config.js`, `playwright/playwright.config.js`, `package.json` scripts, `.claude/settings.json` / `.codex/hooks.json` hooks) | Affects every run and every session — sign-off   |
| **Dependency added or upgraded** (any runtime dependency, or a dev dependency with a known critical/high advisory)                                                       | Breaks `no-frameworks` or adds supply-chain risk |
| **Screen content adds or changes a feature or fact** (a reward, price, rank tier, stat, or label not in `docs/screen-inventory.md`)                                      | Product scope comes from the owner, not the AI   |

### Loop Bounds (termination safeguard)

Independent of the critical-stop table, the loop MUST terminate:

- **Max 3 remediation rounds.** On the 3rd unresolved round → escalate to
  human.
- **Stagnation detection:** if the same finding survives **2 consecutive
  rounds** with no progress → escalate to human (the Mender is stuck; a
  person decides).

### Recursion Cut (do not nest flows)

- The Mender's "green" is satisfied by the validation commands above and
  the screen/state pointer for a human look — it does **not** spawn a nested
  review or a separate verification flow inside the loop.
- Re-review is done by the **committee itself**, not by invoking this skill
  again or delegating to another review flow (including `screen-critic` or
  `ship-check`). This prevents an unbounded
  `review-rangers → Mender → review-rangers → …` recursion.

---

## Flagging Non-Obvious Findings

[`.ai/DECISIONS.md`](../../../.ai/DECISIONS.md) is this repo's standing
decision log for cross-cutting learnings — after emitting the verdict,
append an entry (Context/Decision/Why/Watch out, following the log's own
format) **and** its one-line hook to the matching category in the log's
own `## Index` (add a new category only if none of the existing ones fit)
for any finding that's worth remembering beyond this single review:

- Confidence tier is `LOW` or `VETO`.
- Any finding carries `Severity: Blocker`.
- A committee member or safety guard identified a non-obvious pitfall that
  is likely to recur in future work (e.g. a CSS property that forces layout
  every frame, a container-query sizing quirk, a focus-return or tabs-pattern
  pitfall, a style-leak into the host, a contrast trap on pitch green).

Also call these out explicitly in the response to the user rather than
letting them get buried in the verdict table. Not every finding belongs in
the log — a one-off, screen-specific fix stays in the code (with a
comment only where `comment-minimalism` allows one); the log is for patterns
likely to recur across the panel. If a finding instead belongs in `hammock`'s
`docs/simplicity-debt.md` or a follow-up task, that's the user's call to
make, not this skill's to decide unprompted.

---

## Resources

- Committee member prompt template: [assets/committee-member-template.md](assets/committee-member-template.md)
- Safety guard prompt template: [assets/safety-guard-template.md](assets/safety-guard-template.md)
- The Mender (remediation worker) prompt template: [assets/mender-template.md](assets/mender-template.md)
