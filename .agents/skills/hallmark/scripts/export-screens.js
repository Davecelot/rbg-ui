#!/usr/bin/env node
/* export-screens: writes every tab × sub × state in src/screens/index.js as a standalone HTML document
 * under .hallmark/screens/, so sloplint can read screen markup and copy that otherwise lives in JS
 * template strings. Zero dependencies, Node 18+. Usage: node export-screens.js [repo-root] */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] || '.');
const entry = join(root, 'src', 'screens', 'index.js');
if (!existsSync(entry)) {
  console.error(
    `export-screens: no ${relative(process.cwd(), entry) || entry}, the tab registry (panel-builder) doesn't exist yet, or pass the repo root`,
  );
  process.exit(2);
}
const { tabs } = await import(pathToFileURL(entry).href);
if (!Array.isArray(tabs)) {
  console.error('export-screens: src/screens/index.js must export `tabs` (see panel-builder § Tab registry contract)');
  process.exit(2);
}
const out = join(root, '.hallmark', 'screens');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
writeFileSync(join(root, '.hallmark', '.gitignore'), '*\n');

const cssIn = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.css'))
        .map((f) => join(dir, f))
    : [];
const sheets = [...cssIn(join(root, 'styles')), ...cssIn(join(root, 'styles', 'screens'))];
const links = sheets.map((f) => `    <link rel="stylesheet" href="${relative(out, f)}" />`).join('\n');
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

let count = 0;
for (const tab of tabs) {
  for (const screen of tab.subs ?? []) {
    for (const state of screen.states ?? ['default']) {
      const title = `${tab.label}, ${screen.label}`;
      const action = tab.action ?? {};
      writeFileSync(
        join(out, `${tab.id}--${screen.id}--${state}.html`),
        `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${attr(title)}</title>
    <meta name="description" content="${attr(title)}" />
${links}
    <style>
      /* Stand-in for the host page; the panel itself never styles html or body (panel-embedding). */
      html,
      body {
        overflow-x: clip;
      }
    </style>
  </head>
  <body>
    <div id="rbg" class="rbg" lang="pt-BR">
      <section class="rbg-panel" role="dialog" aria-label="${attr(title)}">
        <main class="rbg-view rbg-screen--${attr(tab.id)} rbg-sub--${attr(screen.id)}" role="tabpanel" data-tab="${attr(tab.id)}" data-sub="${attr(screen.id)}" data-state="${attr(state)}">${screen.render({ state, data: screen.data })}</main>
        <footer class="rbg-actionbar">
          <p class="rbg-actionbar__eyebrow">${attr(action.eyebrow ?? '')}</p>
          <p class="rbg-actionbar__title">${attr(action.title ?? '')}</p>
          <button type="button" data-action="primary">${attr(action.cta ?? '')}</button>
        </footer>
      </section>
    </div>
  </body>
</html>
`,
      );
      count += 1;
    }
  }
}
console.log(`export-screens: ${count} screen state(s) written to ${relative(process.cwd(), out) || out}`);
