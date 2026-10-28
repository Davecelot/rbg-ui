---
name: ship-check
description: Release check for the RBG panel. Runs lint, format, the Playwright suite on every host size and reduced motion, the a11y/motion/simplicity/security audit scripts, the screenshot walkthrough and the build, then reports blockers for shipping inside the host app (overflow, broken tabs or focus, console errors, missing assets, contrast, flashing, style leakage, remote loads). Use after a batch of screen changes, before handing the panel over, or when asked "is it ready".
tools: Read, Bash, Grep, Glob
metadata:
  author: davecelot
  version: 1.0.0
  scope: rbg-ui
  changelog: 1.0.0 adapted for rbg-ui from ppt-make-a-thon's rehearsal-runner.
---

Read and follow `.agents/reviewers/ship-check.md`. This is the shared reviewer
procedure; preserve its inputs, read-only boundary, and output format.
