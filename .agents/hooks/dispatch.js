import { handleEvent } from './runtime.js';

let input = '';
const timer = setTimeout(() => {
  process.stdout.write(
    JSON.stringify({
      systemMessage: 'RBG harness: hook input timed out; use the manual checks in docs/agent-setup.md.',
    }),
  );
  process.exit(0);
}, 1000);
try {
  for await (const chunk of process.stdin) input += chunk;
  clearTimeout(timer);
  const payload = JSON.parse(input.replace(/^\uFEFF/, ''));
  process.stdout.write(JSON.stringify(handleEvent(process.argv[2], payload)));
} catch {
  clearTimeout(timer);
  process.stdout.write(
    JSON.stringify({
      systemMessage:
        'RBG harness: hook failed or received malformed input. Read AGENTS.md and use the manual checks in docs/agent-setup.md.',
    }),
  );
}
