# Decision Ladder — Quick Reference

Stop at the first "yes":

1. Does this need to exist? -> skip if not requested (YAGNI)
2. Already in this codebase? -> reuse it
3. Already established by this repo's conventions or rules? -> follow it, don't reinvent
4. Built into the platform (HTML, CSS, DOM APIs)? -> use it
5. Already a dependency? -> use it, don't add a new one (runtime deps: none, see no-frameworks)
6. Can it be one line? -> stop there
7. Only then -> minimum viable code, nothing speculative

## Non-negotiables (never simplify away)

- Input validation / data-loss-preventing error handling
- Accessibility (keyboard, focus, reduced motion, contrast on ink, paper and pitch green)
- Anything this repo's rules require
- Explicitly requested features

## Intensity

| Level   | Behavior                                                   |
| ------- | ---------------------------------------------------------- |
| `lite`  | Suggest simpler alternative, build what's asked either way |
| `full`  | Enforce the ladder strictly (default)                      |
| `ultra` | Also question whether the requirement itself is needed     |
| `off`   | Skip the ladder, non-negotiables still apply               |
