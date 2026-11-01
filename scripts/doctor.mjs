import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadEnvFile } from 'node:process';
import { checkNode } from './runtime.mjs';
checkNode();
// Load settings just for this diagnostic; never print values or keys.
if (existsSync('.env.local')) loadEnvFile('.env.local');
console.log(`Node ${process.version}: supported`);
try { createRequire(import.meta.url).resolve('next/package.json'); console.log('Next.js dependencies: installed'); }
catch { console.error('Dependencies missing. Run npm run setup.'); process.exitCode = 1; }
for (const [label, provider, value, key] of [
  ['AI', 'LLM_PROVIDER', 'openai', 'LLM_API_KEY'],
  ['Research', 'SEARCH_PROVIDER', 'tavily', 'SEARCH_API_KEY'],
]) {
  const enabled = process.env[provider] === value;
  const present = Boolean(process.env[key]?.trim());
  console.log(`${label}: ${enabled && present ? 'configured (not connectivity-tested)' : enabled ? `missing ${key}; demo fallback will be used` : 'demo / disabled'}`);
}
console.log('Voice: browser service; test microphone manually in Chrome. Text practice always available.');
