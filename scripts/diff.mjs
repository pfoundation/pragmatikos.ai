#!/usr/bin/env node
// Cell-by-cell diff: pragma data/sample.json (famCombo view) vs the
// ocProductivity deck's #otable at deck defaults (family, planner→builder
// combos, weighted, all time, small filter off) — the exact configuration
// scripts/sample.ts mirrors. Usage: bun scripts/diff.mjs
// Fails loudly on any cell outside display-rounding tolerance.
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pw = await import('playwright').catch(() => import('/home/ubuntu/dev/datastudio/node_modules/playwright/index.mjs'));
const deck = path.resolve(new URL('../../ocProductivity/opencode_time_full.html', import.meta.url).pathname);
const sample = JSON.parse(readFileSync(new URL('../data/sample.json', import.meta.url)));

const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('file://' + deck);
await page.locator('#loading').waitFor({ state: 'detached', timeout: 8000 });
await page.waitForTimeout(300);
// The deck opens on min–max; sample.json mirrors the relative computation,
// so force the deck to relative before reading its table.
await page.locator('#oscale [data-s=relative]').click();
await page.waitForTimeout(300);

const fails = [];
const check = (name, ok, detail = '') => {
  if (!ok) fails.push(`${name}${detail ? ' — ' + detail : ''}`);
};
check('deck renders clean', errors.length === 0, errors.slice(0, 3).join(' | '));

// otable columns: Name Judged Hours Overall Out Cost Prec Disc Eff Lat Shipr One Ttss Hps Dpss Eerrp Abortp Verp Ept LatAx
const COLS = [
  ['judged', 1, 0.51],
  ['overall', 3, 0.51],
  ['Outcome', 4, 0.51],
  ['Cost', 5, 0.51],
  ['Precision', 6, 0.51],
  ['Discipline', 7, 0.51],
  ['Efficiency', 8, 0.51],
  ['Latency', 9, 0.51],
  ['shipr', 10, 0.51],
  ['oneshot', 11, 0.51],
  ['ttss', 12, 0.06],
  ['hps', 13, 0.06],
  ['dpss', 14, 0.01],
  ['eerrp', 15, 0.06],
  ['abortp', 16, 0.06],
  ['verp', 17, 0.51],
  ['ept', 18, 0.06],
  ['lat', 19, 0.06],
];
const num = (t) => (t === '—' ? null : parseFloat(t.replace(/[$%*]/g, '')));
const rows = await page.locator('#otb tr:not([data-unr])').evaluateAll((rs) => rs.map((r) => [...r.children].map((td) => td.innerText)));
const deckByLabel = new Map(rows.map((r) => [r[0], r]));
const sampGroups = sample.views.famCombo.groups;

check('same group count', rows.length === sampGroups.length, `deck ${rows.length}, sample ${sampGroups.length}`);
for (const g of sampGroups) {
  const r = deckByLabel.get(g.label);
  check(`group present: ${g.label}`, !!r);
  if (!r) continue;
  const want = {
    judged: g.hjudged,
    overall: g.scoreAdj,
    Outcome: g.tiersAdj.Outcome,
    Cost: g.tiersAdj.Cost,
    Precision: g.tiersAdj.Precision,
    Discipline: g.tiersAdj.Discipline,
    Efficiency: g.tiersAdj.Efficiency,
    Latency: g.tiersAdj.Latency,
    ...g.adj,
  };
  for (const [k, i, tol] of COLS) {
    const d = num(r[i]);
    const s = want[k];
    const bothNull = (d === null || Number.isNaN(d)) && s === null;
    const ok = bothNull || (d !== null && !Number.isNaN(d) && s !== null && Math.abs(d - s) <= tol);
    check(`${g.label} :: ${k}`, ok, `deck ${r[i]}, sample ${s}`);
  }
  const deckStarred = ['Outcome', 'Cost', 'Precision', 'Discipline', 'Efficiency', 'Latency']
    .filter((_, ti) => r[4 + ti].includes('*'))
    .sort()
    .join(',');
  check(`${g.label} :: imputed flags`, deckStarred === [...g.imputed].sort().join(','), `deck [${deckStarred}], sample [${g.imputed}]`);
}

// meta totals vs the deck summary line
const osum = await page.locator('#osum').innerText();
const m = osum.match(/([\d,]+) judged cycles.*→ ([\d,]+) shipped/);
check(
  'meta judged/shipped',
  !!m && +m[1].replace(/,/g, '') === sample.meta.judged && +m[2].replace(/,/g, '') === sample.meta.shipped,
  osum.slice(0, 140),
);

await browser.close();
if (fails.length) {
  console.log(`DIFF FAIL:\n${fails.map((f) => '  - ' + f).join('\n')}`);
  process.exit(1);
}
console.log(`diff: ${sampGroups.length} groups × ${COLS.length} cells match, imputed flags agree, meta agrees`);
