// Copy Kairo's scene from the sibling `kairo` repo into public/kairo, so the hero can embed him.
// Kairo lives in his own repo; run `npm run sync:kairo` after changing him there.
//   KAIRO_DIR=/path/to/kairo npm run sync:kairo   to use another checkout
import { cp, rm, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const from = path.resolve(process.env.KAIRO_DIR ?? path.join(root, '..', 'kairo'));
const to = path.join(root, 'public', 'kairo');

// only what the scene needs at runtime, plus the model's license
const FILES = ['index.html', 'kairo.json', 'src', 'model/kairo.vrm', 'LICENSE-MODEL.md'];

try { await stat(path.join(from, 'index.html')); }
catch { console.error(`Kairo not found at ${from}. Set KAIRO_DIR to his repo.`); process.exit(1); }

await rm(to, { recursive: true, force: true });
await mkdir(path.join(to, 'model'), { recursive: true });
for (const f of FILES) await cp(path.join(from, f), path.join(to, f), { recursive: true });
console.log(`Synced Kairo from ${from} -> public/kairo`);
