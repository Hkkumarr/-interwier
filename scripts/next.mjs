// Portable alternative to POSIX-only VAR=value commands (works on Windows too).
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { checkNode } from './runtime.mjs';
checkNode();
const require = createRequire(import.meta.url);
const [command, ...args] = process.argv.slice(2);
if (!['dev', 'build', 'start'].includes(command)) {
  console.error('Expected dev, build, or start.');
  process.exit(1);
}
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), command, ...args], {
  stdio: 'inherit',
  env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
