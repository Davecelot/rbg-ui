#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'DECISION-LADDER.md');

export function getFallbackInstructions(mode) {
  return (
    'HAMMOCK MODE ACTIVE — level: ' +
    mode +
    '\n\n' +
    'Before writing new code, walk this ladder and stop at the first step that holds:\n' +
    '1. Does this need to exist at all? (YAGNI)\n' +
    '2. Already in this codebase? Reuse it.\n' +
    "3. Already established by this repo's conventions or rules? Follow them, don't invent.\n" +
    '4. Built into the framework/stdlib? Use it.\n' +
    "5. Already a dependency? Use it, don't add a new one.\n" +
    '6. Can it be one line? Stop there.\n' +
    '7. Only then: minimum viable code, nothing speculative.\n\n' +
    'Never simplify away: input validation/error handling that prevents data loss, ' +
    "accessibility, anything this repo's rules require, or a feature the user " +
    'explicitly asked for.\n\n' +
    'Report review/audit findings, don\'t auto-fix. Deactivate with "stop hammock" / "normal mode".'
  );
}

export function getHammockInstructions(mode) {
  try {
    const raw = fs.readFileSync(SKILL_PATH, 'utf8');
    const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();
    return (
      'HAMMOCK MODE ACTIVE — level: ' +
      mode +
      '\n\n' +
      body +
      '\n\nLoad .agents/skills/hammock/SKILL.md for the requested workflow; apply AGENTS.md and mandatory rules.'
    );
  } catch (e) {
    return getFallbackInstructions(mode);
  }
}
