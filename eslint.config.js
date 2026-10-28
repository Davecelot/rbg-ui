import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/',
      'reference/**',
      'playwright-report/',
      'test-results/',
      '.claude/skills/**',
      '.claude/worktrees/**',
      '.ai/harness-state/**',
      '.agents/skills/hallmark/scripts/sloplint.mjs',
    ],
  },
  js.configs.recommended,
  prettier,
  { languageOptions: { globals: globals.browser } },
  {
    files: ['.agents/**/*.js', '.claude/**/*.js', 'playwright/**/*.js', 'vite.config.js'],
    languageOptions: { globals: globals.node },
    rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] },
  },
  {
    files: ['.agents/skills/a11y-checker/scripts/a11y-self-check.js'],
    languageOptions: { globals: globals.browser },
  },
];
