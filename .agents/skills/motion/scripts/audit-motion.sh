#!/bin/bash
# motion advisory audit
# Advisory-only: always exits 0. Greps for common motion-quality smells in
# the panel's CSS and JavaScript. Mirrors hammock's own audit-simplicity.sh
# (same --diff vs. repo-wide scope shape, same main...HEAD diff base).
#
# Usage: bash .agents/skills/motion/scripts/audit-motion.sh [--diff | <file>...]
#   (no args)  -> scope = index.html, src/ and styles/
#   --diff     -> scope = current diff vs. main plus the working tree (review mode)
#   <file>...  -> scope = exactly these files (used by .agents/hooks/dispatch.js)

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_ROOT" || exit 0

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

MODE="repo"
if [ "${1:-}" = "--diff" ]; then
  MODE="diff"
elif [ $# -gt 0 ]; then
  MODE="files"
fi

echo ""
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo -e "${BLUE}|  Motion -- Audit                                |${NC}"
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo ""
echo "Mode: $MODE"
echo ""

if [ "$MODE" = "diff" ]; then
  FILES=$( { git diff --name-only --diff-filter=ACMR main...HEAD 2>/dev/null; git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null; } | sort -u | grep -E '^((src|styles)/.*\.(js|css)|index\.html)$' || true)
elif [ "$MODE" = "files" ]; then
  FILES=""
  for f in "$@"; do
    rel="${f#"$REPO_ROOT"/}"
    [ -f "$rel" ] && FILES="$FILES$rel"$'\n'
  done
  FILES=$(echo "$FILES" | sed '/^$/d')
else
  FILES=$( { find src styles -type f \( -name '*.js' -o -name '*.css' \) 2>/dev/null; [ -f index.html ] && echo index.html; } || true)
fi

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No matching files in scope.${NC}"
  exit 0
fi

# Only files that actually touch motion are worth scanning further.
MOTION_FILES=$(echo "$FILES" | xargs grep -lE 'transition|@keyframes|\.animate\(|@starting-style|requestAnimationFrame' 2>/dev/null || true)

if [ -z "$MOTION_FILES" ]; then
  echo -e "${GREEN}No motion-related code in scope.${NC}"
  exit 0
fi

echo "Files touching motion: $(echo "$MOTION_FILES" | grep -c ".")"
echo ""

# --- Smell 1: transition: all ---
echo "Smell 1: transition: all"
HITS=$(echo "$MOTION_FILES" | xargs grep -nE 'transition:\s*all' 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- name the exact properties instead:${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 2: ease-in on UI ---
echo "Smell 2: ease-in easing (never on UI)"
HITS=$(echo "$MOTION_FILES" | xargs grep -nE 'ease-in\b' 2>/dev/null | grep -vE 'ease-in-out' || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- confirm this isn't a UI entrance/exit (should be ease-out or a strong custom curve):${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 3: scale(0) entrance ---
echo "Smell 3: scale(0) entrance"
HITS=$(echo "$MOTION_FILES" | xargs grep -nE 'scale\(0[,)]|scale\(0\.0*[,)]' 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- use scale(0.9-0.97) + opacity: 0 instead:${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 4: animating non-GPU-safe properties ---
echo "Smell 4: transitions on width/height/margin/padding/top/left"
HITS=$(echo "$MOTION_FILES" | xargs grep -nE 'transition(-property)?:\s*[^;]*\b(width|height|margin|padding|top|left|right|bottom)\b' 2>/dev/null | grep -v 'grid-template' || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- confirm this is the grid-reveal shape or an intentional bespoke reflow; otherwise switch to transform/opacity:${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 5: @keyframes on rapidly re-triggered elements ---
echo "Smell 5: @keyframes in a rapidly re-triggered element (toast/snackbar/toggle)"
HITS=$(echo "$MOTION_FILES" | grep -iE 'toast|snackbar|toggle' | xargs grep -lE '@keyframes' 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- prefer a CSS transition here so re-triggering retargets instead of restarting:${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 6: missing prefers-reduced-motion ---
echo "Smell 6: motion declared without a prefers-reduced-motion block in the same file"
MISSING=""
for f in $MOTION_FILES; do
  if ! grep -q 'prefers-reduced-motion' "$f" 2>/dev/null; then
    MISSING="$MISSING$f"$'\n'
  fi
done
if [ -n "$MISSING" ]; then
  echo -e "  ${YELLOW}found -- every file with a transition/animation/@keyframes/@starting-style/rAF loop needs a reduced-motion fallback (CSS media query, or a matchMedia check in JS):${NC}"
  echo "$MISSING" | sed '/^$/d; s/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 7: ungated :hover transform ---
echo "Smell 7: :hover transform without a (hover: hover) and (pointer: fine) gate"
HOVER_FILES=$(echo "$MOTION_FILES" | xargs grep -lE ':hover\s*\{[^}]*transform' 2>/dev/null || true)
MISSING=""
for f in $HOVER_FILES; do
  if ! grep -q 'hover: hover' "$f" 2>/dev/null; then
    MISSING="$MISSING$f"$'\n'
  fi
done
if [ -n "$MISSING" ]; then
  echo -e "  ${YELLOW}found -- a touch tap fires a false :hover without this gate:${NC}"
  echo "$MISSING" | sed '/^$/d; s/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 8: rAF loop without a self-stop ---
echo "Smell 8: requestAnimationFrame loop with no isConnected / cancelAnimationFrame stop"
MISSING=""
for f in $(echo "$MOTION_FILES" | grep -E '\.js$' || true); do
  if grep -q 'requestAnimationFrame' "$f" 2>/dev/null && ! grep -qE 'isConnected|cancelAnimationFrame' "$f" 2>/dev/null; then
    MISSING="$MISSING$f"$'\n'
  fi
done
if [ -n "$MISSING" ]; then
  echo -e "  ${YELLOW}found -- the shell re-renders the view on every change; return a cleanup from enter() and stop on !isConnected (RECIPES P5):${NC}"
  echo "$MISSING" | sed '/^$/d; s/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 9: infinite flicker/glitch loops ---
echo "Smell 9: glitch/flicker animation set to loop (flash risk, WCAG 2.3.1)"
HITS=$(echo "$MOTION_FILES" | xargs grep -nE 'animation:[^;]*(glitch|flicker|flash)[^;]*infinite' 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- no looping flashes; celebrations are one-shot with at most one flash (RECIPES P6):${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}This audit is advisory only and heuristic-based -- confirm findings manually.${NC}"
echo -e "${BLUE}See .agents/skills/motion/SKILL.md and references/AUDIT-CHECKLIST.md for the full checklist.${NC}"
echo ""

exit 0
