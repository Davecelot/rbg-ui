# RBG agent setup

Use this repository locally with Claude Code, Codex, or ChatGPT Work on
desktop. `AGENTS.md` is the shared entry point. All nine rules under
`.agents/rules/` apply before work begins; skills load when their routing
conditions match. The ten skills and their resources have one maintained
copy under `.agents/skills/`.

## Open the project

| Runtime                                                         | Instructions and skill discovery                                                                                                    | Automation                                                                                                                            |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Code                                                     | `CLAUDE.md` imports `AGENTS.md`; `.claude/skills` and `.claude/rules` link to the shared directories.                               | `.claude/settings.json` runs the shared dispatcher with the `claude` adapter.                                                         |
| Codex desktop / CLI                                             | Open this repository. Codex reads `AGENTS.md` and discovers `.agents/skills/`.                                                      | `.codex/hooks.json` runs the dispatcher with the `codex` adapter after project and hook trust.                                        |
| ChatGPT Work, local orchestration and execution                 | Open this local folder in Work. Use the starter prompt below if project instructions or skills are absent from the session catalog. | Uses the Codex runtime hooks when that local runtime exposes the repository configuration; verify activation rather than assuming it. |
| Cloud-orchestrated Work, including cloud Work with local access | Read the same files when repository access is available.                                                                            | Local command hooks are unavailable. Follow the manual checks below and report that automation is unavailable.                        |

Starter prompt for a session without automatic discovery:

```text
Work in this local RBG repository. Read AGENTS.md, then read all nine
mandatory rules linked there. For each task, load the matching
.agents/skills/<name>/SKILL.md and follow its linked resources. Use
.agents/reviewers/ for review procedures. Check whether the local hook
runtime is active; if it is not, run the manual checks in
docs/agent-setup.md and say that checks were manual. Apply this to my next
request without editing application files merely to test setup.
```

Keep development on `main`. The owner authorized the private GitHub remote
`Davecelot/rbg-ui`; only a sanitized snapshot may be pushed. Raw reference
captures and local secrets stay out of the remote. Opening the repository
does not authorize public publishing, creating branches/worktrees, or
changing global settings.

## Tools and invocation

Claude uses `/hammock review`; Codex CLI uses `$hammock review`; ChatGPT
uses `@hammock review` when the skill appears in its selector. Natural
language requests work through the routing table too. If a skill is not
listed, read its exact local `SKILL.md` instead of inventing a tool call.
The runtime mode parser accepts standalone `/hammock`, `$hammock`, and
`@hammock` commands. A command embedded in a larger task is still a skill
request; explicitly load the skill and do not assume a hook changed mode.

Tool labels in existing skill metadata describe needed capabilities, not
permissions or guaranteed API names:

| Skill label                       | Use the capability available in the current host                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `Read`, `Glob`, `Grep`            | Read files and locate paths/text; use `rg` where available.                                                                           |
| `Edit`, `Write`                   | Apply patches or use the host's file editing tools.                                                                                   |
| `Bash`                            | Run local commands with the host's shell tool.                                                                                        |
| `Skill`                           | Select the skill if discoverable, otherwise read its `SKILL.md`.                                                                      |
| `Agent`, `Task`, spawn a reviewer | Use an independent subagent with the shared reviewer procedure; see below.                                                            |
| Preview / browser tools           | Use available browser tools against `npm run dev`, or the Playwright CLI. Claude's launch configuration is only a Claude convenience. |

Mody can complement the local workflows if installed. It is optional:
local taste review uses `rbg-taste`, `hallmark`, and `screen-critic`;
motion uses the local `motion` skill. Do not invent Mody tool names or make
installation a prerequisite.

## Activate and verify hooks

In Codex, review project trust and use `/hooks` in the CLI to inspect and
trust the exact repository hook definitions. New or changed hook hashes
require another review. Do not bypass trust or modify user/global config.
Restart or open a fresh session after setup changes when needed. In Claude,
retain the normal project trust flow and load project settings.

An active session receives `RBG HARNESS` context on startup and
`HAMMOCK MODE ACTIVE` (default `full`) before prompts and subagent work.
Verify this through hook execution records or model-visible hook context,
not by asking the model to claim that hooks ran. If activation cannot be
observed, classify automation as unverified and use manual checks.

`lite`, `full`, `ultra`, and `off` are persisted per runtime/session;
`review`, `audit`, `debt`, `gain`, and `help` do not change that intensity.
`stop hammock` and `normal mode` deactivate the ladder only as standalone
commands. `off` persists through subsequent prompts and session resume;
motion audits and project rules still apply. Switching to `off` does not
erase a pending audit from an earlier edit made while the ladder was active.

The shared dispatcher receives a native hook JSON object on stdin, selects
the `claude` or `codex` adapter, and emits native JSON context/decisions.
It handles `SessionStart`, `UserPromptSubmit`, `SubagentStart`,
`PreToolUse`, `PostToolUse`, and `Stop`. Git-root resolution supports
sessions launched from subdirectories. No global installation is needed.

Before supported edits and shell calls, it records source content hashes;
afterward it audits changes under `src/`, `styles/`, and `main.js`, including
multi-file patches, shell writes, additions, and deletions. Motion scans
receive existing changed CSS/JS files under `styles/` and `src/`.
Read-only calls do not trigger an audit. Tool hooks are a workflow guardrail;
they cannot observe every external editor or specialized tool path.

State lives under the ignored `.ai/harness-state/<runtime>/<session-hash>/`.
Independent sessions cannot change each other's mode or pending audits.
Subagents that share the parent's session ID share its mode; audit receipts
are separated by tool-call ID to avoid overwriting concurrent edits.
Missing IDs or malformed inputs disclose the manual fallback instead of
using a shared anonymous state file.

Findings are advisory. An audit execution failure stays pending. Completion
retries the audit, then requests at most one continuation for that edit if
it still cannot run. A repeated continuation reports the unresolved check
without looping; a later user turn can retry successfully. Report any
remaining unavailable checks before handing work over.

## Manual checks

When hooks are unavailable, follow the Hammock ladder before non-trivial
coding, load task-specific skills, and run these checks after source edits:

```bash
bash .agents/skills/hammock/scripts/audit-simplicity.sh --diff
bash .agents/skills/motion/scripts/audit-motion.sh --diff
```

For handover, follow the full shared `ship-check` procedure, including:

```bash
npm run test:harness
npm run lint
npm run format
npm test
python3 -I .agents/skills/a11y-checker/scripts/audit-a11y.py
python3 -I .agents/skills/motion/scripts/audit-motion.py
bash .agents/skills/hammock/scripts/audit-simplicity.sh
bash .agents/skills/security-guardian/scripts/security-scan.sh --working
node .agents/skills/hallmark/scripts/export-screens.js
node .agents/skills/hallmark/scripts/sloplint.mjs styles .hallmark/screens --scope app
npm run build
WALKTHROUGH=1 npm test -- walkthrough
```

These audits identify candidates for review; successful execution does not
mean every heuristic finding is a product defect or that visual/keyboard
inspection happened. Security's `--working` mode includes local changes
and untracked harness files without staging them.

## Independent reviewers

Use `.agents/reviewers/screen-critic.md` and
`.agents/reviewers/ship-check.md` as the exact reviewer task instructions.
Claude's named agents load those procedures through thin wrappers.
Codex/Work callers read the procedure and pass it to their available
subagent tool; do not assume Claude agent names are native Codex roles.

For `screen-critic`, start with fresh context and give only walkthrough
frames, reference paths, and the procedure. Do not include the author's
reasoning or preceding chat history. For `review-rangers`, reviewers must
not see one another's verdicts; keep the committee and safety guard
read-only and use its existing bounded remediation rules.

If fresh independent delegation is unavailable, report "independent review
unavailable". A sequential self-review can provide useful findings but
cannot satisfy the independent-review requirement or justify a ship verdict.

## References

- [Official skill discovery and invocation](https://learn.chatgpt.com/docs/build-skills)
- [Official hooks, trust, and local/cloud limits](https://learn.chatgpt.com/docs/hooks)

Runtime smoke-test results and limitations are recorded in
`docs/harness-verification.md`.
