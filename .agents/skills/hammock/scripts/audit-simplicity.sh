#!/bin/bash
# hammock advisory audit
# Advisory-only: always exits 0. Greps for common over-engineering smells
# in the panel sources (the shell, screens, data, page CSS, the entry point).
# Adapted from ponytail's ponytail-audit command
# (https://github.com/DietrichGebert/ponytail) via fogo-kitchen.
#
# Usage: bash .agents/skills/hammock/scripts/audit-simplicity.sh [--diff]
#   (no flag)  -> scope = src/, styles/, main.js
#   --diff     -> scope = branch diff vs. main + uncommitted + untracked (review mode)

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_ROOT" || exit 0

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCOPE_RE='^(src/.*\.js|styles/.*\.css|main\.js)$'

MODE="repo"
if [ "${1:-}" = "--diff" ]; then
  MODE="diff"
fi

echo ""
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo -e "${BLUE}|  Hammock -- Simplicity Audit                    |${NC}"
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo ""
echo "Mode: $MODE"
echo ""

if [ "$MODE" = "diff" ]; then
  # Union of committed branch work, uncommitted edits and new files, so the
  # post-edit hook sees a change before it is committed (and before the first commit exists).
  FILES=$(
    {
      git diff --name-only --diff-filter=ACMR main...HEAD 2>/dev/null
      git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null
      git ls-files --others --exclude-standard 2>/dev/null
    } | grep -E "$SCOPE_RE" | sort -u | while read -r f; do [ -f "$f" ] && echo "$f"; done
  )
else
  FILES=$( { find src -type f -name '*.js'; find styles -type f -name '*.css'; [ -f main.js ] && echo main.js; } 2>/dev/null | sort -u)
fi

if [ -z "$FILES" ]; then
  echo -e "${GREEN}No matching files in scope.${NC}"
  exit 0
fi

JS_FILES=$(echo "$FILES" | grep -E '\.js$' || true)
CSS_FILES=$(echo "$FILES" | grep -E '\.css$' || true)

echo "Files in scope: $(echo "$FILES" | grep -c ".")"
echo ""

# --- Smell 1: TODO/FIXME left in place ---
echo "Smell 1: deferred work markers"
HITS=$(echo "$FILES" | xargs grep -nE 'TODO|FIXME' 2>/dev/null || true)
if [ -n "$HITS" ]; then
  echo -e "  ${YELLOW}found -- review whether these are stale or should be in docs/simplicity-debt.md:${NC}"
  echo "$HITS" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 2: single-use generic-sounding abstractions ---
echo "Smell 2: modules with exports but no in-repo importer"
for f in $JS_FILES; do
  NAME=$(basename "$f" | sed -E 's/\.js$//')
  EXPORT_COUNT=$(grep -cE "^export " "$f" 2>/dev/null)
  if [ "$EXPORT_COUNT" -gt 0 ]; then
    CALLERS=$(grep -rlE "(from |import\()['\"].*/$NAME(\.js)?['\"]" src main.js 2>/dev/null | grep -v "^$f$" | wc -l | tr -d '[:space:]')
    if [ -z "$CALLERS" ] || [ "$CALLERS" -eq 0 ] 2>/dev/null; then
      echo -e "  ${YELLOW}$f${NC} -- exported but no in-repo importer found (verify manually, this is a heuristic)"
    fi
  fi
done
echo ""

# --- Smell 3: deep nesting (proxy for speculative config/branching) ---
echo "Smell 3: deeply nested blocks (>4 levels, proxy for speculative branching)"
DEEP=$(echo "$JS_FILES" | grep . | xargs -I{} sh -c 'awk "{ if (match(\$0, /^\\t{5,}|^ {20,}/)) print FILENAME\":\"NR }" {}' 2>/dev/null || true)
if [ -n "$DEEP" ]; then
  echo -e "  ${YELLOW}found -- worth a second look:${NC}"
  echo "$DEEP" | sed 's/^/    /' | head -20
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Smell 4: custom properties defined in styles/ but never read ---
# Always checked against every stylesheet and source file, since a property
# defined in one file is usually read in another. A property set from JS
# (style.setProperty in src/) counts as a use.
echo "Smell 4: CSS custom properties defined but never used"
if [ -n "$CSS_FILES" ]; then
  ALL_USES=$( { cat styles/*.css styles/**/*.css 2>/dev/null; cat index.html main.js 2>/dev/null; find src -name '*.js' -exec cat {} + 2>/dev/null; } )
  UNUSED_PROPS=""
  for prop in $(echo "$CSS_FILES" | xargs grep -ohE '(^|[{;[:space:]])--[a-zA-Z0-9_-]+[[:space:]]*:' 2>/dev/null | grep -oE -- '--[a-zA-Z0-9_-]+' | sort -u); do
    if ! echo "$ALL_USES" | grep -qE "var\(\s*$prop[,) ]|['\"]$prop['\"]"; then
      UNUSED_PROPS="$UNUSED_PROPS $prop"
    fi
  done
  if [ -n "$UNUSED_PROPS" ]; then
    echo -e "  ${YELLOW}found -- tokens nothing reads yet (fine for a fresh tokens.css, a smell elsewhere):${NC}"
    for p in $UNUSED_PROPS; do echo "    $p"; done
  else
    echo -e "  ${GREEN}none${NC}"
  fi
else
  echo -e "  ${GREEN}no stylesheets in scope${NC}"
fi
echo ""

# --- Smell 5: class selectors in styles/ never referenced by markup or JS ---
echo "Smell 5: CSS class selectors with no reference in src/, index.html or main.js"
if [ -n "$CSS_FILES" ]; then
  MARKUP=$( { cat index.html main.js 2>/dev/null; find src -name '*.js' -exec cat {} + 2>/dev/null; } )
  UNUSED_CLASSES=""
  for cls in $(echo "$CSS_FILES" | xargs sed -E 's#/\*.*\*/##g; s/url\([^)]*\)//g' 2>/dev/null | grep -v '^\s*--' | grep -oE '\.[a-zA-Z_][a-zA-Z0-9_-]*' | sed 's/^\.//' | sort -u); do
    case "$cls" in [0-9]*) continue ;; esac
    if ! echo "$MARKUP" | grep -qE "(^|[^a-zA-Z0-9_-])$cls([^a-zA-Z0-9_-]|$)"; then
      UNUSED_CLASSES="$UNUSED_CLASSES $cls"
    fi
  done
  if [ -n "$UNUSED_CLASSES" ]; then
    echo -e "  ${YELLOW}found -- dead selectors or classes built dynamically (verify manually):${NC}"
    for c in $UNUSED_CLASSES; do echo "    .$c"; done
  else
    echo -e "  ${GREEN}none${NC}"
  fi
else
  echo -e "  ${GREEN}no stylesheets in scope${NC}"
fi
echo ""

echo -e "${BLUE}--------------------------------------------------${NC}"
echo -e "${BLUE}This audit is advisory only and heuristic-based -- confirm findings manually.${NC}"
echo -e "${BLUE}See .agents/skills/hammock/SKILL.md for the decision ladder these smells map to.${NC}"
echo ""

exit 0
