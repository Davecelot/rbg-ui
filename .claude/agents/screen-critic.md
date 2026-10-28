---
name: screen-critic
description: Fresh-context, unanchored art-direction review of the rendered RBG panel. Given walkthrough screenshots (tab × sub × state at several host sizes) it judges them against rbg-taste, hallmark and the screen inventory and returns ship or fix with at most eight concrete fixes. Use after a screen is built or restyled, before calling visual work done. Never pass it the author's reasoning — only frames and file paths.
tools: Read, Glob, Grep
metadata:
  author: davecelot
  version: 1.0.0
  scope: rbg-ui
  changelog: 1.0.0 adapted for rbg-ui from ppt-make-a-thon's deck-critic.
---

Read and follow `.agents/reviewers/screen-critic.md`. This is the shared reviewer
procedure; preserve its inputs, read-only boundary, and output format.
