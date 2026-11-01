import { copyFileSync, constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkNode } from './runtime.mjs';
checkNode();
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const npmCLI = process.env.npm_execpath;
if (!npmCLI) {
  console.error('Run this helper with: npm run setup');
  process.exit(1);
}
// The npm CLI is executed by Node directly: no platform-dependent shell syntax.
const install = spawnSync(process.execPath, [npmCLI, 'ci', '--no-audit', '--no-fund'], {
  stdio: 'inherit',
  env: process.env,
});
if (install.error || install.status !== 0) {
  console.error(install.error?.message || 'Dependency installation failed.');
  process.exit(install.status || 1);
}
try {
  copyFileSync('.env.example', '.env.local', constants.COPYFILE_EXCL);
  console.log('Created .env.local in demo mode. Add provider keys there only if you want live AI/search.');
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
  console.log('Kept your existing .env.local unchanged.');
}
console.log('Setup complete. Run npm run dev, then open http://localhost:3000');
