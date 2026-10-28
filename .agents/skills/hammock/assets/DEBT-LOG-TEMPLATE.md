# Simplicity Debt Log

Deliberate simplifications made under the decision ladder, deferred rather
than fully generalized. Not a bug tracker — only entries where scope was
intentionally cut down from what a more general solution would have done.

Copy this file to `docs/simplicity-debt.md` on first use, then append rows.

| Date       | Module/File | What was simplified                                   | Why                     | Revisit when                    |
| ---------- | ----------- | ----------------------------------------------------- | ----------------------- | ------------------------------- |
| 2026-10-26 | example     | Tab switches share one easing, no per-screen override | Only one feel requested | A screen needs its own entrance |
