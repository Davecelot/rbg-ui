#!/usr/bin/env python3
"""
audit-motion.py -- static motion-quality scanner for the rbg-ui panel
(index.html, src/ and styles/), backing the `motion` skill's `review`/`audit`
modes and references/AUDIT-CHECKLIST.md. Adapted from Mody's HTML-artifact
scanner; MOTION-10/11 cover rAF loops (count-ups) and looping flashes.

Scans one or more files (or directories) for the patterns this skill's
SKILL.md documents under "Never ship" and reports:

  1. Findings in a structured format (rule id, title, severity, confidence,
     file:line, issue, fix) -- same shape as the a11y-checker skill's
     scripts/audit-a11y.py, so a human or another agent session can read
     either one's output the same way.
  2. A 0-100 motion-craft score with a plain-language verdict.

Static and regex-based -- it reads source text, it does not render the
page or measure actual timing/feel. It is a fast first pass, not a
certification: every finding needs the judgment calls in SKILL.md (is this
really a rapidly-retriggered component, does this duration have a stated
reason) before being treated as final either way. Machine-readable output
(--json) is meant to be consumed programmatically -- by an agent session
running this as an eval step over generated artifacts, a CI check, or
another skill -- without re-parsing colored text.

Usage:
  python3 -I audit-motion.py                      # index.html, src/, styles/
  python3 -I audit-motion.py styles/base.css
  python3 -I audit-motion.py --json
  python3 -I audit-motion.py styles --min-severity medium
  python3 -I audit-motion.py src/screens --json --min-severity high

Run from the repo root (default paths are relative to it).

Exit code is always 0 (advisory only, matches audit-a11y.py's convention) --
a caller that wants pass/fail gating should inspect the JSON `findings`
array (or `score`) itself rather than relying on the process exit code.

No third-party dependencies -- standard library only.
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, asdict

SCAN_EXTENSIONS = {".html", ".htm", ".js", ".css"}
SKIP_DIRS = {"node_modules", "dist", "build", ".git", "coverage", "reference",
             "public", "playwright-report", "test-results"}
DEFAULT_PATHS = ["index.html", "src", "styles"]

SEVERITY_WEIGHT = {"HIGH": 10, "MEDIUM": 5, "LOW": 2}
SEVERITY_RANK = {"low": 0, "medium": 1, "high": 2}

RETRIGGER_KEYWORDS = re.compile(r"toast|snackbar|toggle", re.IGNORECASE)
NON_GPU_PROPS = r"(width|height|margin|padding|top|left|right|bottom)"


@dataclass
class Finding:
    rule_id: str
    title: str
    category: str
    severity: str
    confidence: str
    file: str
    line: int
    issue: str
    fix: str


# rule_id, title, category (matches AUDIT-CHECKLIST.md's 8 categories),
# severity, confidence, why_this_confidence
RULES = [
    ("MOTION-01", "transition: all", "2. Easing & duration", "HIGH", "high",
     "Purely syntactic -- `transition: all` is never the intended scope."),
    ("MOTION-02", "ease-in on a UI element", "2. Easing & duration", "MEDIUM", "medium",
     "Syntactic match on the token; can't tell from text alone whether this "
     "is genuinely a UI entrance/exit vs. e.g. a marketing/explanatory "
     "animation where a slower start is an intentional choice."),
    ("MOTION-03", "scale(0) entrance", "3. Physicality & origin", "MEDIUM", "high",
     "Purely syntactic -- `scale(0)` (or `scale(0.0...)`) as a literal value "
     "is unambiguous."),
    ("MOTION-04", "non-GPU property animated directly", "5. Performance", "HIGH", "medium",
     "Syntactic match on width/height/margin/padding/top/left/right/bottom "
     "in a transition/animation-property declaration; excludes "
     "grid-template-* (the sanctioned grid-reveal shape) but can still "
     "false-positive on a legitimately narrow, deliberate exception."),
    ("MOTION-05", "@keyframes near a rapidly re-triggered component", "4. Interruptibility", "MEDIUM", "low",
     "Heuristic only -- flags a file containing both `@keyframes` and a "
     "toast/snackbar/toggle keyword; doesn't confirm the keyframes actually "
     "animate that component. Confirm by hand."),
    ("MOTION-06", "motion with no prefers-reduced-motion block in the file", "6. Accessibility", "HIGH", "medium",
     "Syntactic presence/absence check at file scope, not per-rule -- a "
     "large file with an unrelated reduced-motion block elsewhere reads as "
     "compliant even if the specific animation isn't actually covered."),
    ("MOTION-07", ":hover transform without a (hover: hover) gate", "6. Accessibility", "MEDIUM", "medium",
     "Syntactic presence/absence check at file scope, same caveat as "
     "MOTION-06."),
    ("MOTION-08", ".animate() call with no reduced-motion check in the file", "6. Accessibility", "MEDIUM", "medium",
     "File-scope heuristic -- WAAPI has no CSS media-query equivalent, so "
     "this looks for a matchMedia('prefers-reduced-motion') check anywhere "
     "in the file, not necessarily guarding this specific call."),
    ("MOTION-09", "duration over 300ms on UI motion", "2. Easing & duration", "LOW", "low",
     "Purely a number threshold -- a progress fill, count-up or reward "
     "celebration can legitimately run longer with a stated reason; this finding is a "
     "prompt to confirm that reason exists, not a violation by itself. "
     "Token declarations (`--dur-*:`) are skipped."),
    ("MOTION-10", "requestAnimationFrame loop with no self-stop", "4. Interruptibility", "HIGH", "medium",
     "File-scope heuristic -- looks for `isConnected` or `cancelAnimationFrame` "
     "anywhere in a file that calls requestAnimationFrame. The panel shell "
     "re-renders the view on every tab/state change, so a loop that never "
     "stops keeps running after its screen is gone."),
    ("MOTION-11", "glitch/flicker/flash animation that loops", "6. Accessibility", "HIGH", "high",
     "Syntactic -- an `animation` shorthand naming glitch/flicker/flash with "
     "`infinite`. Looping flashes risk exceeding 3 per second (WCAG 2.3.1)."),
]
RULES_BY_ID = {r[0]: r for r in RULES}


def line_at(text, offset):
    return text.count("\n", 0, offset) + 1


def collect_files(paths):
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
        elif os.path.isdir(p):
            for root, dirs, names in os.walk(p):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                for name in names:
                    if os.path.splitext(name)[1].lower() in SCAN_EXTENSIONS:
                        files.append(os.path.join(root, name))
        else:
            print(f"warning: path not found: {p}", file=sys.stderr)
    return sorted(files)


def make_finding(rule_id, file, line, issue, fix):
    r = RULES_BY_ID[rule_id]
    return Finding(rule_id=r[0], title=r[1], category=r[2], severity=r[3],
                    confidence=r[4], file=file, line=line, issue=issue, fix=fix)


def scan_file(path, text):
    findings = []
    has_motion = bool(re.search(r"transition|@keyframes|\.animate\(|@starting-style|requestAnimationFrame", text))
    if not has_motion:
        return findings

    # MOTION-01: transition: all
    for m in re.finditer(r"transition\s*:\s*all\b", text):
        findings.append(make_finding(
            "MOTION-01", path, line_at(text, m.start()),
            "`transition: all` animates unintended properties, including "
            "non-GPU-safe ones.",
            "Name the exact properties: `transition: transform 180ms var(--ease-out)`."))

    # MOTION-02: ease-in (excluding ease-in-out)
    for m in re.finditer(r"ease-in\b", text):
        if text[m.end():m.end() + 4].lower().startswith("-out"):
            continue
        findings.append(make_finding(
            "MOTION-02", path, line_at(text, m.start()),
            "`ease-in` delays the exact moment a UI change is being watched.",
            "Use `ease-out` (entering/exiting), `ease-in-out` (on-screen "
            "movement), or a strong custom cubic-bezier -- confirm this "
            "isn't intentionally a marketing/explanatory animation first."))

    # MOTION-03: scale(0) entrance
    for m in re.finditer(r"scale\(\s*0(\.0*)?\s*[,)]", text):
        findings.append(make_finding(
            "MOTION-03", path, line_at(text, m.start()),
            "Nothing appears from nothing -- `scale(0)` reads as the "
            "element coming out of nowhere.",
            "Start from `scale(0.9-0.97)` + `opacity: 0` (0.96 matches "
            "the pop-in recipe)."))

    # MOTION-04: non-GPU properties, excluding grid-template-*
    for m in re.finditer(
            r"transition(-property)?\s*:\s*[^;]*\b" + NON_GPU_PROPS + r"\b", text):
        line_text = text[text.rfind("\n", 0, m.start()) + 1: text.find("\n", m.start())]
        if "grid-template" in line_text:
            continue
        findings.append(make_finding(
            "MOTION-04", path, line_at(text, m.start()),
            f"Animating a layout property ({m.group(2)}) forces layout and "
            "paint, not just composite.",
            "Switch to `transform`/`opacity`, or use the grid-template "
            "reveal shape (grid-template-rows/columns 0fr -> 1fr) for a "
            "real collapse/expand."))

    # MOTION-05: @keyframes + toast/snackbar/toggle keyword in same file
    if re.search(r"@keyframes", text) and RETRIGGER_KEYWORDS.search(text):
        for m in re.finditer(r"@keyframes\s+[\w-]+", text):
            findings.append(make_finding(
                "MOTION-05", path, line_at(text, m.start()),
                "This file has both `@keyframes` and a toast/snackbar/"
                "toggle keyword -- keyframes restart from zero on rapid "
                "re-trigger.",
                "If this keyframes rule animates the rapidly-retriggered "
                "element, switch to a CSS transition so it retargets "
                "instead of restarting."))

    # MOTION-06: motion present, no prefers-reduced-motion anywhere in file
    if "prefers-reduced-motion" not in text:
        m = re.search(r"transition\s*:|@keyframes|\.animate\(|@starting-style|requestAnimationFrame", text)
        findings.append(make_finding(
            "MOTION-06", path, line_at(text, m.start()) if m else 1,
            "No `@media (prefers-reduced-motion: reduce)` block found "
            "anywhere in a file that declares motion.",
            "Add a reduced-motion block covering every transition/"
            "animation in this file -- ships in the same pass as the "
            "animation, not a follow-up."))

    # MOTION-07: :hover { ... transform ... } without a hover:hover gate
    if re.search(r":hover\s*\{[^}]*transform", text) and "hover: hover" not in text:
        m = re.search(r":hover\s*\{[^}]*transform", text)
        findings.append(make_finding(
            "MOTION-07", path, line_at(text, m.start()),
            "A `:hover` rule animates `transform` with no "
            "`@media (hover: hover) and (pointer: fine)` gate.",
            "Wrap hover-triggered transform rules in that media query -- "
            "touch devices fire a false `:hover` on tap."))

    # MOTION-08: .animate( present, no reduced-motion check anywhere in file
    if ".animate(" in text and "prefers-reduced-motion" not in text:
        m = re.search(r"\.animate\(", text)
        findings.append(make_finding(
            "MOTION-08", path, line_at(text, m.start()),
            "WAAPI `.animate()` call with no "
            "`matchMedia('(prefers-reduced-motion: reduce)')` check found "
            "in the file.",
            "WAAPI has no CSS-media-query equivalent -- check "
            "`matchMedia('(prefers-reduced-motion: reduce)').matches` in "
            "JS and shorten/skip the animation when it's true."))

    # MOTION-09: duration over 300ms
    for m in re.finditer(r"(\d{3,})ms", text):
        ms = int(m.group(1))
        line_start = text.rfind("\n", 0, m.start()) + 1
        if re.match(r"\s*--dur", text[line_start:m.start()]):
            continue
        if ms > 300:
            findings.append(make_finding(
                "MOTION-09", path, line_at(text, m.start()),
                f"{ms}ms duration on declared motion exceeds the 300ms UI "
                "ceiling.",
                "Confirm this is a progress fill, count-up or celebration "
                "with a stated reason (or use `--dur-slow`); view enters, "
                "state changes and the tab indicator stay at or under `--dur-base`."))

    # MOTION-10: rAF loop with no self-stop
    if "requestAnimationFrame" in text and not re.search(r"isConnected|cancelAnimationFrame", text):
        m = re.search(r"requestAnimationFrame", text)
        findings.append(make_finding(
            "MOTION-10", path, line_at(text, m.start()),
            "A requestAnimationFrame loop with no `isConnected` check or "
            "`cancelAnimationFrame` -- it outlives its screen.",
            "Check `el.isConnected` each tick and cancel the frame when the "
            "node is gone; return the cancel as enter()'s cleanup (RECIPES.md P5)."))

    # MOTION-11: looping glitch/flicker/flash
    for m in re.finditer(r"animation\s*:[^;]*(glitch|flicker|flash)[^;]*infinite", text):
        findings.append(make_finding(
            "MOTION-11", path, line_at(text, m.start()),
            "A glitch/flicker/flash animation loops forever -- a flash "
            "hazard above 3 per second.",
            "Make it one-shot with at most one flash (RECIPES.md P6)."))

    return findings


def compute_score(findings):
    score = 100
    for f in findings:
        score -= SEVERITY_WEIGHT[f.severity]
    return max(0, score)


def verdict(score):
    if score >= 90:
        return "clean -- no notable motion smells found"
    if score >= 70:
        return "mostly clean -- a few findings worth a look"
    if score >= 40:
        return "several findings -- review before shipping"
    return "many findings -- treat this as not yet reviewed"


def filter_findings(findings, min_severity):
    if not min_severity:
        return findings
    return [f for f in findings if SEVERITY_RANK[f.severity.lower()] >= SEVERITY_RANK[min_severity]]


def print_report(findings, score, min_severity, files_scanned):
    findings = filter_findings(findings, min_severity)
    print(f"Scanned {files_scanned} file(s).\n")

    print("Rule confidence legend:")
    print("  high   -- purely syntactic pattern; if it fires, the rule is correct")
    print("  medium -- contextual heuristic; can false-positive on a real exception")
    print("  low    -- suggestive only; confirm every hit by hand")
    print()

    if not findings:
        print("No findings from the automated checks.\n")
    else:
        by_sev = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for f in findings:
            by_sev[f.severity] += 1
        print(f"{len(findings)} finding(s) -- HIGH: {by_sev['HIGH']}  "
              f"MEDIUM: {by_sev['MEDIUM']}  LOW: {by_sev['LOW']}\n")

        for f in sorted(findings, key=lambda x: (-SEVERITY_WEIGHT[x.severity], x.file, x.line)):
            print(f"[{f.rule_id}] {f.title} -- {f.severity} (confidence: {f.confidence})")
            print(f"Category: {f.category}")
            print(f"Location: {f.file}:{f.line}")
            print(f"Issue: {f.issue}")
            print(f"Fix: {f.fix}")
            print()

    print(f"Motion score: {score}/100 -- {verdict(score)}\n")

    print("This is advisory and heuristic-based -- confirm findings manually")
    print("against SKILL.md and references/AUDIT-CHECKLIST.md before treating")
    print("any of them as final either way.")


def print_json(findings, score, min_severity, files_scanned):
    findings = filter_findings(findings, min_severity)
    payload = {
        "files_scanned": files_scanned,
        "score": score,
        "verdict": verdict(score),
        "severity_legend": {
            "HIGH": "Automatic finding per SKILL.md's 'Never ship' table.",
            "MEDIUM": "Contextual heuristic -- likely real, confirm by hand.",
            "LOW": "Suggestive only -- a prompt to check reasoning, not a violation by itself.",
        },
        "rules": [
            {"id": r[0], "title": r[1], "category": r[2], "severity": r[3],
             "confidence": r[4], "why_this_confidence": r[5]}
            for r in RULES
        ],
        "findings": [asdict(f) for f in findings],
    }
    print(json.dumps(payload, indent=2))


def main():
    parser = argparse.ArgumentParser(
        description="Static motion-quality scanner for the rbg-ui panel.")
    parser.add_argument("paths", nargs="*", default=DEFAULT_PATHS,
                         help="Files or directories to scan (default: index.html src styles).")
    parser.add_argument("--json", action="store_true",
                         help="Emit machine-readable JSON instead of the text report.")
    parser.add_argument("--min-severity", choices=["low", "medium", "high"], default=None,
                         help="Only show findings at or above this severity.")
    args = parser.parse_args()

    files = collect_files(args.paths)
    all_findings = []
    for path in files:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
        except OSError as e:
            print(f"warning: could not read {path}: {e}", file=sys.stderr)
            continue
        all_findings.extend(scan_file(path, text))

    score = compute_score(filter_findings(all_findings, args.min_severity))

    if args.json:
        print_json(all_findings, score, args.min_severity, len(files))
    else:
        print_report(all_findings, score, args.min_severity, len(files))

    # Advisory only -- always exits 0. A caller that wants pass/fail gating
    # should inspect --json's `findings`/`score` instead of the exit code.
    sys.exit(0)


if __name__ == "__main__":
    main()
