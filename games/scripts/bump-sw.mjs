// Gera a VERSION do service worker a partir do commit atual (Fase 9).
//
// Cada build com um commit novo "reseta" o cache do PWA automaticamente —
// nada de esquecer de trocar a versão na mão. Se não houver git (build local
// solto), usa um carimbo de tempo (determinístico o bastante para invalidar).

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const swPath = fileURLToPath(new URL('../public/sw.js', import.meta.url));

let version;
try {
  version = `v${execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()}`;
} catch {
  version = `v${Date.now().toString(36)}`;
}

const original = readFileSync(swPath, 'utf8');
const RE = /const VERSION = 'v[^']+';/;
if (!RE.test(original)) {
  console.error('[bump-sw] padrão "const VERSION = ..." não encontrado em public/sw.js');
  process.exit(1);
}
// Substitui sempre — mesmo que o hash não mude (rebuild do mesmo commit),
// a operação é idempotente.
const next = original.replace(RE, `const VERSION = '${version}';`);
writeFileSync(swPath, next);
console.log(`[bump-sw] VERSION → ${version}`);