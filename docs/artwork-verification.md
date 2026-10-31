# Football artwork verification — 2026-10-31

## Final status

**Review-rangers: HIGH.** All five independent committee members approve, the
safety guard passes, and no findings remain open after the owner-approved
Mender round 1. The separate fresh-context screen-critic returned **ship** for
the initial artwork replacement; it was not nested inside the remediation loop.

## Implementation

- 133 PNGs replaced in place; 609,792 bytes total, largest 7,948 bytes.
- Eight four-direction human players and matching portraits, ten item
  categories, boot/celebration aliases, fictional club crests and coach.
- The approved correction round matches club-kit colors and named item themes,
  selects named pass/shop artwork through existing data helpers, and gives
  banner-preview identity an opaque token-based backing.
- Branding, rank crests, layouts, labels, prices, rarity, features, dependencies,
  shell behavior and configuration remain unchanged. Source edits are limited
  to artwork selection in two data modules and four banner identity CSS declarations.
- Exact prompts and provenance: [football-art-prompts.md](football-art-prompts.md).

## Final checks

| Check                                               | Result                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| ESLint                                              | Passed                                                              |
| Prettier                                            | Passed                                                              |
| Vite production build                               | Passed                                                              |
| Playwright, all five projects                       | 400 passed, 25 skipped                                              |
| Refreshed screenshot walkthrough, all five projects | 20 passed, 290 frames                                               |
| Banner identity contrast and containment            | 18.13:1 and contained at all five presets                           |
| Hallmark                                            | 0 FAIL, 2 WARN, 66 DISMISSED                                        |
| Hammock diff audit and manual diff review           | Executed on three source files; no introduced simplicity issue      |
| Motion diff audit                                   | Executed; no flagged motion smells, no motion added                 |
| Git whitespace check                                | Passed                                                              |
| Static accessibility audit                          | Executed; 118 heuristic findings, not a clean accessibility verdict |

Hammock's existing `--equip-art` and selector warnings were checked against
actual uses; the token is read in multiple declarations and the selectors are
used by existing templates. No speculative helper, new abstraction, unused
runtime asset collection or dependency was added. The two Hallmark warnings
concern existing repeated container recipes and pill radii.

The accessibility reviewer found no outstanding issue within this change's
scope. The computed banner check measures the actual rendered paper foreground
against opaque ink at every preset. Existing browser tests cover keyboard/focus,
responsive containment, reduced motion and runtime requests. These checks do not
constitute a complete manual WCAG certification or a new live screen-reader
pass. No frame-time profiling or nested-deployment run was performed.

Runtime artwork remains local under existing asset URLs. Oversized source
atlases stay in the generation archive and do not ship.

## Independent review

Five reviewers and a separate safety guard worked independently in isolated
batches within available concurrency, without seeing one another's findings.
The same committee re-reviewed the corrected target.

| Reviewer                          | Final verdict | Evidence                                                                                 |
| --------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| Accessibility                     | Approve       | Banner warning resolved; 18.13:1 contrast and containment in five presets                |
| Performance                       | Approve       | ~596 KiB total PNG payload; negligible mapping and static painting cost                  |
| Host-embedding                    | Approve       | Backing, sheet controls and action bar remain contained across presets                   |
| Art direction                     | Approve       | Human football world and named kit/item identities are consistent                        |
| Game-UX                           | Approve       | Blue reward, named shop themes and progression semantics agree                           |
| Safety guard                      | Pass          | Kit-color blocker and provenance note resolved; no open findings                         |
| Screen-critic, before remediation | Ship          | All 290 initial frames inspected via contact sheets plus selected full-resolution frames |

Final evidence: `test-results/walkthrough/<project>/` contains 58 refreshed
frames for each of size-1024, size-1280, size-1600, shrunk and reduced-motion.
Additional correction captures and computed contrast are in
`/tmp/rbg-art-round1/`. These are local QA artifacts, not shipped content.

## Review-rangers synthesis

**CONFIDENCE: HIGH**

**SUMMARY:** The human football artwork meets the approved illustrative-demo
scope. The approved correction round resolved the initial kit-color blocker,
named-artwork caveats and banner identity legibility warning.

**TOP FINDINGS:**

1. [Safety Guard] Club-kit colors now match all unchanged labels. Severity: Info.
2. [Art direction / Game-UX] Named shop themes and blue/silver reward frames now
   agree with their identities. Severity: Info.
3. [Accessibility] Banner identity has opaque backing and 18.13:1 contrast at
   all presets. Severity: Info.

**RECOMMENDED ACTION: Approve.**

The initial LOW verdict and its safety-guard blocker triggered the required
interactive checkpoint. The owner approved Mender round 1. Specific fixes were
implemented, checks and frames refreshed, then the same committee re-reviewed.
No further remediation round or critical-stop escalation was needed.
