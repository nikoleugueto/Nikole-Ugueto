#!/usr/bin/env node
/**
 * Preflight.
 *
 * Catches the class of mistake that only shows up in a browser: an asset path
 * that points at nothing, a stylesheet that was never linked, a content module
 * that throws on import. Exits non-zero so it can gate a deploy.
 *
 * Run:  node tools/check.js
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, relative } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const problems = [];
const note = (m) => problems.push(m);

/* --- every root-absolute URL in the markup and the JS must resolve --------- */
const walk = (dir, out = []) => {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (e === 'node_modules' || e.startsWith('.')) continue;
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
};

const sources = walk(join(root, 'src'))
  .concat(walk(join(root, 'content')))
  .concat([join(root, 'index.html')]);

const URL_RE = /["'(](\/(?:assets|src|content)\/[^"')\s]+)["')]/g;
let checked = 0;

for (const file of sources) {
  const text = readFileSync(file, 'utf8');
  for (const [, url] of text.matchAll(URL_RE)) {
    // Templated paths (`/assets/img/world-${id}.webp`) can't be resolved
    // literally; the per-family checks below cover them instead.
    if (url.includes('${')) continue;
    checked++;
    if (!existsSync(join(root, url))) {
      note(`missing asset  ${url}\n    referenced by ${relative(root, file)}`);
    }
  }
}

/* --- relative asset paths are a trap on nested routes --------------------- */
const html = readFileSync(join(root, 'index.html'), 'utf8');
for (const [, attr] of html.matchAll(/(?:src|href)="((?!https?:|mailto:|data:|#|\/)[^"]+)"/g)) {
  note(`relative URL in index.html: "${attr}" — nested routes resolve it against the wrong directory`);
}

/* --- every stylesheet on disk should actually be linked ------------------- */
for (const f of readdirSync(join(root, 'src/styles'))) {
  if (f.endsWith('.css') && !html.includes(`/src/styles/${f}`)) {
    note(`stylesheet never linked: src/styles/${f}`);
  }
}

/* --- content modules must import cleanly ---------------------------------- */
const loaded = {};
for (const mod of ['content/worlds.js', 'content/case-studies.js', 'content/pages.js']) {
  try {
    loaded[mod] = await import(pathToFileURL(join(root, mod)).href);
  } catch (e) {
    note(`content module failed to import: ${mod}\n    ${e.message}`);
  }
}

/* --- templated asset families, expanded from the content model ------------ */
const need = (url, why) => {
  checked++;
  if (!existsSync(join(root, url))) note(`missing asset  ${url}  (${why})`);
};

const worldsMod = loaded['content/worlds.js'];
if (worldsMod) {
  for (const w of worldsMod.worlds) {
    need(`/assets/img/world-${w.id}.webp`, `scene for the ${w.name} world`);
  }
  worldsMod.journeyBeats.forEach((_, i) =>
    need(`/assets/img/journey-${i + 1}.webp`, 'journey beat portrait'));
}
const pagesMod = loaded['content/pages.js'];
if (pagesMod) {
  pagesMod.about.process.steps.forEach((_, i) =>
    need(`/assets/img/process-${i + 1}.webp`, 'process step disc'));
}

/* --- every case study must belong to a world that exists ------------------ */
const csMod = loaded['content/case-studies.js'];
if (csMod && worldsMod) {
  const ids = new Set(worldsMod.worlds.map((w) => w.id));
  for (const c of Object.values(csMod.caseStudies)) {
    if (!ids.has(c.world)) note(`case study "${c.id}" points at unknown world "${c.world}"`);
  }
}

/* --- generated images nothing points at ----------------------------------- */
const referenced = new Set();
const collect = (u) => referenced.add(u.split('/').pop());
for (const file of sources) {
  for (const [, url] of readFileSync(file, 'utf8').matchAll(URL_RE)) collect(url);
}
// templated families, expanded the same way as above
if (worldsMod) {
  worldsMod.worlds.forEach((w) => collect(`world-${w.id}.webp`));
  worldsMod.journeyBeats.forEach((_, i) => collect(`journey-${i + 1}.webp`));
}
if (pagesMod) pagesMod.about.process.steps.forEach((_, i) => collect(`process-${i + 1}.webp`));

let orphanBytes = 0;
for (const f of readdirSync(join(root, 'assets/img'))) {
  if (f.endsWith('.meta.json')) continue;          // build notes, not shipped art
  if (!referenced.has(f)) {
    const bytes = statSync(join(root, 'assets/img', f)).size;
    orphanBytes += bytes;
    note(`orphaned asset  assets/img/${f}  (${(bytes / 1024).toFixed(1)} KB, nothing references it)`);
  }
}

/* --- report --------------------------------------------------------------- */
console.log(`\nchecked ${checked} asset references across ${sources.length} files`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):\n`);
  problems.forEach((p) => console.log(`  • ${p}`));
  console.log('');
  process.exit(1);
}
console.log('No problems found.\n');
