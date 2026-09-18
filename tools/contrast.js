#!/usr/bin/env node
/**
 * Contrast audit.
 *
 * Reads the ink and surface tokens straight out of src/styles/tokens.css and
 * checks every text ink against every light surface it can land on. Exits
 * non-zero if any text token fails WCAG AA, so a colour change that quietly
 * breaks legibility gets caught rather than shipped.
 *
 * --ink-quiet is excluded on purpose: it is documented as decorative-only
 * (aria-hidden separators, hairlines, tick marks) and is checked at 3:1.
 *
 * Run:  node tools/contrast.js
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const css = readFileSync(join(root, 'src/styles/tokens.css'), 'utf8');

const token = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9A-Fa-f]{6})`));
  if (!m) throw new Error(`token --${name} not found`);
  return m[1];
};

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => (c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = (h) => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// Inks that carry real text, and every light surface they can sit on.
const TEXT_INKS = ['ink', 'ink-soft', 'ink-muted', 'focus'];
const SURFACES = ['paper-warm', 'paper-mid', 'paper-flat'];
const DOC = '#EFEDEA';                       // the document surface in views.css

let failed = 0;
const pad = (s, n) => String(s).padEnd(n);

console.log('\nWCAG AA — text inks (need 4.5:1)\n');
console.log(pad('ink', 12) + [...SURFACES, 'document'].map((s) => pad(s, 13)).join(''));
console.log('-'.repeat(12 + 13 * 4));

for (const ink of TEXT_INKS) {
  let row = pad(ink, 12);
  for (const s of [...SURFACES.map(token), DOC]) {
    const r = ratio(token(ink), s);
    const ok = r >= 4.5;
    if (!ok) failed++;
    row += pad(`${r.toFixed(2)}${ok ? '' : '  FAIL'}`, 13);
  }
  console.log(row);
}

console.log('\nDecorative only (need 3:1, must never carry text)\n');
for (const s of [...SURFACES.map(token), DOC]) {
  const r = ratio(token('ink-quiet'), s);
  if (r < 3) failed++;
  console.log(`  ink-quiet on ${pad(s, 10)} ${r.toFixed(2)}${r >= 3 ? '' : '  FAIL'}`);
}

console.log(failed ? `\n${failed} failure(s)\n` : '\nAll pass.\n');
process.exit(failed ? 1 : 0);
