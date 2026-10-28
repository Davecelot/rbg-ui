#!/usr/bin/env node
// hammock — shared configuration resolver
//
// Resolution order for default mode:
//   1. HAMMOCK_DEFAULT_MODE environment variable
//   2. Config file defaultMode field:
//      - $XDG_CONFIG_HOME/hammock/config.json (any platform, if set)
//      - ~/.config/hammock/config.json (macOS / Linux fallback)
//      - %APPDATA%\hammock\config.json (Windows fallback)
//   3. 'full'
//
// Adapted from ponytail's hooks/ponytail-config.js
// (https://github.com/DietrichGebert/ponytail), stripped of the
// multi-platform (Codex/Copilot/Qoder) and statusline branching this
// upstream installation and statusline machinery this repo doesn't need.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const DEFAULT_MODE = 'full';
export const VALID_MODES = ['off', 'lite', 'full', 'ultra', 'review'];
export const RUNTIME_MODES = ['off', 'lite', 'full', 'ultra'];

export function normalizeMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return RUNTIME_MODES.includes(normalized) ? normalized : null;
}

export function normalizeConfigMode(mode) {
  if (typeof mode !== 'string') return null;
  const normalized = mode.trim().toLowerCase();
  return VALID_MODES.includes(normalized) ? normalized : null;
}

// "stop hammock" / "normal mode" turn hammock off, but only as a standalone
// command — matching the phrase anywhere in the message would turn it off
// mid-task for an ordinary request like "add a normal mode toggle".
export function isDeactivationCommand(text) {
  const t = String(text || '')
    .trim()
    .toLowerCase()
    .replace(/[.!?\s]+$/, '');
  return t === 'stop hammock' || t === 'normal mode';
}

export function getConfigDir() {
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'hammock');
  }
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'hammock');
  }
  return path.join(os.homedir(), '.config', 'hammock');
}

export function getConfigPath() {
  return path.join(getConfigDir(), 'config.json');
}

export function getDefaultMode() {
  const envMode = process.env.HAMMOCK_DEFAULT_MODE;
  if (envMode && RUNTIME_MODES.includes(envMode.toLowerCase())) {
    return envMode.toLowerCase();
  }

  try {
    const configPath = getConfigPath();
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8').replace(/^\uFEFF/, ''));
    if (config.defaultMode && RUNTIME_MODES.includes(config.defaultMode.toLowerCase())) {
      return config.defaultMode.toLowerCase();
    }
  } catch (e) {
    // Config file doesn't exist or is invalid — fall through
  }

  return DEFAULT_MODE;
}
