#!/bin/bash
# security-guardian advisory scan
# Advisory-only: always exits 0. Prints a condensed security summary.
# Not wired into any git hook — run manually or from an agent before
# commit or before merging a branch into main.
#
# Usage: bash .agents/skills/security-guardian/scripts/security-scan.sh [--branch | --working]
#   (no flag)  -> scope = staged files (pre-commit style)
#   --branch   -> scope = current branch vs. main (pre-merge style)
#   --working  -> tracked and untracked local changes, without staging
# Gate 5 (runtime network) always scans the whole panel, whatever the scope.

set -uo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)"
cd "$REPO_ROOT" || exit 0

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

OUT_DIR="${TMPDIR:-/tmp}"

MODE="staged"
if [ "${1:-}" = "--branch" ]; then
  MODE="branch"
elif [ "${1:-}" = "--working" ]; then
  MODE="working"
fi

echo ""
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo -e "${BLUE}|  Security Guardian -- Advisory Scan             |${NC}"
echo -e "${BLUE}+------------------------------------------------+${NC}"
echo ""

if [ "$MODE" = "branch" ]; then
  CHANGED_FILES=$(git diff --name-only --diff-filter=AM main...HEAD 2>/dev/null || echo "")
  DIFF_CMD=(git diff -U0 main...HEAD)
elif [ "$MODE" = "working" ]; then
  CHANGED_FILES=$({ git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null; git ls-files --others --exclude-standard; } | sort -u)
  DIFF_CMD=(git diff -U0 HEAD)
else
  CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || echo "")
  DIFF_CMD=(git diff --cached -U0)
fi

echo "Mode: $MODE"
echo "Files in scope: $(echo "$CHANGED_FILES" | grep -c "." || true)"
echo ""

FLAGGED=0

# --- Gate 1: Secret scan ---
echo "Gate 1: Secret scan"
if command -v gitleaks >/dev/null 2>&1; then
  if gitleaks detect --no-banner --source . --redact --exit-code 1 >"$OUT_DIR/gitleaks-out.txt" 2>&1; then
    echo -e "  ${GREEN}gitleaks: no findings${NC}"
  else
    echo -e "  ${RED}gitleaks: findings detected -- see $OUT_DIR/gitleaks-out.txt${NC}"
    FLAGGED=1
  fi
else
  echo -e "  ${YELLOW}gitleaks not installed -- falling back to grep pattern scan${NC}"
fi

emit_diff() {
  "${DIFF_CMD[@]}" 2>/dev/null || true
  if [ "$MODE" = "working" ]; then
    while IFS= read -r -d '' file; do
      git diff --no-index -U0 -- /dev/null "$file" 2>/dev/null || true
    done < <(git ls-files --others --exclude-standard -z)
  fi
}

PATTERN_HITS=$(emit_diff 2>/dev/null | grep -nEi '(api[_-]?key|secret|token|password|private[_-]?key|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY)\s*[:=]\s*["'"'"']?[A-Za-z0-9/+_=-]{12,}' || true)
if [ -n "$PATTERN_HITS" ]; then
  echo -e "  ${RED}grep fallback: possible secret-shaped strings in diff${NC}"
  # Never print source lines: portable sed must not depend on a whitespace regex to hide values.
  echo "$PATTERN_HITS" | sed -E 's/^([0-9]+):.*/    diff line \1: <redacted secret-shaped match>/'
  FLAGGED=1
else
  echo -e "  ${GREEN}grep fallback: no secret-shaped strings in diff${NC}"
fi
echo ""

# --- Gate 2: JS dependency audit ---
JS_DEPS_CHANGED=$(echo "$CHANGED_FILES" | grep -E "(^|/)(package\.json|package-lock\.json)$" || true)
echo "Gate 2: JS dependency audit"
if [ -n "$JS_DEPS_CHANGED" ]; then
  if command -v npm >/dev/null 2>&1; then
    if npm audit --audit-level=high --json >"$OUT_DIR/npm-audit-out.txt" 2>&1; then
      echo -e "  ${GREEN}npm audit: no high/critical advisories${NC}"
    elif node -e 'try { const r=JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); const v=r.metadata?.vulnerabilities; process.exit(v && (v.high || v.critical) ? 0 : 1); } catch { process.exit(1); }' "$OUT_DIR/npm-audit-out.txt"; then
      echo -e "  ${RED}npm audit: high/critical advisories found -- see $OUT_DIR/npm-audit-out.txt${NC}"
      FLAGGED=1
    else
      echo -e "  ${YELLOW}npm audit: unavailable or incomplete -- see $OUT_DIR/npm-audit-out.txt${NC}"
      FLAGGED=1
    fi
  else
    echo -e "  ${YELLOW}npm not on PATH -- skipped${NC}"
  fi
  RUNTIME_DEPS=$(node -e "const p=require('./package.json');process.stdout.write(Object.keys(p.dependencies||{}).join(' '))" 2>/dev/null || true)
  if [ -n "$RUNTIME_DEPS" ]; then
    echo -e "  ${YELLOW}runtime dependencies present ($RUNTIME_DEPS) -- the panel is meant to have none; check .ai/DECISIONS.md for an entry${NC}"
  fi
else
  echo -e "  ${GREEN}no package.json/package-lock.json changes -- skipped${NC}"
fi
echo ""

# --- Gate 3: Lockfile integrity ---
echo "Gate 3: Lockfile integrity"
if [ -n "$JS_DEPS_CHANGED" ] && command -v npm >/dev/null 2>&1; then
  if npm ci --dry-run >"$OUT_DIR/npm-ci-out.txt" 2>&1; then
    echo -e "  ${GREEN}package-lock.json is in sync with package.json${NC}"
  else
    echo -e "  ${RED}package-lock.json is OUT OF SYNC -- installs would not be reproducible${NC}"
    FLAGGED=1
  fi
else
  echo -e "  ${GREEN}no relevant changes -- skipped${NC}"
fi
echo ""

# --- Gate 4: Sensitive/harness-config file review ---
SENSITIVE=$(echo "$CHANGED_FILES" | grep -E '(^|/)\.env|\.pem$|\.key$|^(AGENTS|CLAUDE)\.md$|^\.claude/(settings|hooks/|agents/|skills$|rules$)|^\.codex/|^\.agents/(hooks/|rules/|reviewers/|tests/|skills/[^/]+/(SKILL\.md$|hooks/|scripts/))|^vite\.config\.js$|^playwright/playwright\.config\.js$' || true)
echo "Gate 4: Sensitive/harness-config files touched"
if [ -n "$SENSITIVE" ]; then
  echo -e "  ${YELLOW}Manual review recommended for:${NC}"
  echo "$SENSITIVE" | sed 's/^/    /'
else
  echo -e "  ${GREEN}none${NC}"
fi
echo ""

# --- Gate 5: Runtime network loads (the panel is embedded in a host app) ---
# Anything the panel fetches at runtime from another host: script/img/video
# sources, stylesheet/font links, CSS url()/@import, fetch()/import(). Plain
# <a href> navigation links are not loads and are ignored. A host is allowed
# only if .ai/DECISIONS.md names it.
echo "Gate 5: Runtime network loads"
RUNTIME_FILES=$( { [ -f index.html ] && echo index.html; [ -f main.js ] && echo main.js; find src styles -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) 2>/dev/null; } | sort -u)
LOAD_HITS=""
if [ -n "$RUNTIME_FILES" ]; then
  LOAD_HITS=$(echo "$RUNTIME_FILES" | xargs grep -nEo \
    "(src|srcset|poster)=[\"']https?://[^\"' ]+|<link[^>]+href=[\"']https?://[^\"' ]+|url\([\"']?https?://[^)\"' ]+|@import[^;]*https?://[^;\"' )]+|(fetch|import)\([\"'\`]https?://[^\"'\` )]+|from [\"']https?://[^\"']+" \
    2>/dev/null || true)
fi
UNAPPROVED=""
if [ -n "$LOAD_HITS" ]; then
  while IFS= read -r hit; do
    HOST=$(echo "$hit" | grep -oE 'https?://[^/"'"'"' )]+' | head -1 | sed -E 's#https?://##')
    if [ -z "$HOST" ] || ! grep -qF "$HOST" .ai/DECISIONS.md 2>/dev/null; then
      UNAPPROVED="$UNAPPROVED
$hit"
    fi
  done <<<"$LOAD_HITS"
fi
UNAPPROVED=$(echo "$UNAPPROVED" | grep . || true)
if [ -n "$UNAPPROVED" ]; then
  echo -e "  ${RED}external runtime loads with no .ai/DECISIONS.md entry for their host -- vendor them into public/ or record the decision:${NC}"
  echo "$UNAPPROVED" | sed 's/^/    /'
  FLAGGED=1
elif [ -n "$LOAD_HITS" ]; then
  echo -e "  ${GREEN}external runtime loads found, every host is recorded in .ai/DECISIONS.md${NC}"
else
  echo -e "  ${GREEN}none -- the panel loads nothing from other hosts${NC}"
fi
echo ""

echo -e "${BLUE}--------------------------------------------------${NC}"
if [ "$FLAGGED" -eq 1 ]; then
  echo -e "${YELLOW}Verdict: REVIEW NEEDED -- see flagged gates above${NC}"
else
  echo -e "${GREEN}Verdict: GO -- no blocking findings${NC}"
fi
echo -e "${BLUE}This scan is advisory only. It does not block a commit or merge.${NC}"
echo ""

# Always exit 0 -- advisory only
exit 0
