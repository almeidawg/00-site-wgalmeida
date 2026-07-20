import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const vitestCli = path.join(root, 'node_modules', 'vitest', 'vitest.mjs');
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [vitestCli, ...args], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test',
  },
});

if (result.error) {
  console.error(`Falha ao iniciar Vitest: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status ?? 1);
