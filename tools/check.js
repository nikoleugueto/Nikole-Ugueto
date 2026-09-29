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

// Matches a project URL wherever it appears — quoted, in a url(), or as one
// entry among many in a srcset, which is comma-and-newline separated and was
// invisible to the previous pattern.
const URL_RE = /(\/(?:assets|src|content)\/[A-Za-z0-9._\/-]+\.[A-Za-z0-9]+)/g;
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
for (const mod of ['content/worlds.js', 'content/case-studies.js', 'content/pages.js',
                   'content/lifeworx.js', 'content/castillo.js', 'content/ceramic.js']) {
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
let artManifest = null;
try {
  artManifest = JSON.parse(readFileSync(join(root, 'assets/img/art.manifest.json'), 'utf8'));
} catch { /* optional */ }

if (worldsMod) {
  // Each world needs its scene at every width the srcset offers.
  for (const w of worldsMod.worlds) {
    const piece = artManifest?.[`world-${w.id}`];
    if (!piece) { note(`no art manifest entry for world-${w.id}`); continue; }
    for (const width of piece.widths) {
      need(`/assets/img/${width.file}`, `${w.name} scene @${width.w}px`);
    }
  }
  worldsMod.journeyBeats.forEach((_, i) =>
    need(`/assets/img/journey-${i + 1}.webp`, 'journey beat portrait'));
}
const pagesMod = loaded['content/pages.js'];

/* The case-study figures are `{ name, widths }` scattered through a nested
   object, and the views build their srcsets from a template. Walk the content
   model for them rather than keeping a list here that would drift. */
const figures = (node, out = []) => {
  if (Array.isArray(node)) node.forEach((n) => figures(n, out));
  else if (node && typeof node === 'object') {
    if (typeof node.name === 'string' && Array.isArray(node.widths)) out.push(node);
    else Object.values(node).forEach((n) => figures(n, out));
  }
  return out;
};
const lwMod = loaded['content/lifeworx.js'];
const chgMod = loaded['content/castillo.js'];
const cpsMod = loaded['content/ceramic.js'];
const lwShots = (lwMod ? figures(lwMod.lifeworx) : [])
  .concat(chgMod ? figures(chgMod.castillo) : [])
  .concat(cpsMod ? figures(cpsMod.ceramic) : []);
for (const f of lwShots) {
  for (const w of f.widths) need(`/assets/img/${f.name}-${w}.webp`, `case-study figure ${f.name} @${w}px`);
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
  worldsMod.journeyBeats.forEach((_, i) => collect(`journey-${i + 1}.webp`));
}
for (const f of lwShots) f.widths.forEach((w) => collect(`${f.name}-${w}.webp`));
// Every width the art pipeline produced counts as referenced: the srcset that
// uses them is built from a template, so the literal filenames never appear.
try {
  const art = JSON.parse(readFileSync(join(root, 'assets/img/art.manifest.json'), 'utf8'));
  for (const piece of Object.values(art)) {
    for (const w of piece.widths) collect(w.file);
  }
} catch { /* manifest is optional */ }

/* The creative archive's prints live in their own folder: each image lists
   the widths it was exported at, and every one of them must exist. */
const archiveFiles = new Set();
if (pagesMod?.archive?.pieces) {
  for (const p of pagesMod.archive.pieces) {
    for (const im of [p.img, ...p.extras]) {
      for (const w of im.widths) {
        need(`/assets/img/archive/${im.base}-${w}.jpg`, `archive print ${im.base} @${w}px`);
        archiveFiles.add(`${im.base}-${w}.jpg`);
      }
    }
  }
}

/* The About page's tool logos: every one the content names must exist, and
   the folder holds nothing else. */
const toolFiles = new Set();
for (const t of pagesMod?.about?.tools?.list || []) {
  const file = t.file || (t.logo && `${t.logo}.svg`);
  if (!file) continue;
  need(`/assets/img/tools/${file}`, `tool logo ${t.name}`);
  toolFiles.add(file);
}

let orphanBytes = 0;
for (const f of readdirSync(join(root, 'assets/img'))) {
  // Build notes and the art manifest describe the pipeline; they are not art.
  if (f.endsWith('.meta.json') || f.endsWith('.manifest.json')) continue;
  if (f === 'tools') {
    for (const g of readdirSync(join(root, 'assets/img/tools'))) {
      if (!toolFiles.has(g)) note(`orphaned asset  assets/img/tools/${g}  (nothing references it)`);
    }
    continue;
  }
  if (f === 'archive') {
    for (const g of readdirSync(join(root, 'assets/img/archive'))) {
      if (!archiveFiles.has(g) && !referenced.has(g)) note(`orphaned asset  assets/img/archive/${g}  (nothing references it)`);
    }
    continue;
  }
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
