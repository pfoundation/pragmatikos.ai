#!/usr/bin/env node
// Cell-by-cell diff: pragma data/sample.json vs the ocInsights deck's #otable
// at two configurations scripts/sample.ts mirrors: famCombo at deck defaults
// (family, planner→builder combos, weighted, all time, small filter off) and
// modelEffort (model + effort grouping, role off). Usage: bun scripts/diff.mjs
// Fails loudly on any cell outside display-rounding tolerance.
import path from 'node:path';
import { readFileSync } from 'node:fs';

const pw = await import('playwright').catch(() => import('/home/ubuntu/dev/datastudio/node_modules/playwright/index.mjs'));
const deck = path.resolve(new URL('../../ocInsights/opencode_time_full.html', import.meta.url).pathname);
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

async function checkView(tag, sampGroups, wantMeta) {
  const rows = await page.locator('#otb tr:not([data-unr])').evaluateAll((rs) => rs.map((r) => [...r.children].map((td) => td.innerText)));
  const deckByLabel = new Map(rows.map((r) => [r[0], r]));
  check(`${tag}: same group count`, rows.length === sampGroups.length, `deck ${rows.length}, sample ${sampGroups.length}`);
  for (const g of sampGroups) {
    const r = deckByLabel.get(g.label);
    check(`${tag}: group present: ${g.label}`, !!r);
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
      check(`${tag}: ${g.label} :: ${k}`, ok, `deck ${r[i]}, sample ${s}`);
    }
    const deckStarred = ['Outcome', 'Cost', 'Precision', 'Discipline', 'Efficiency', 'Latency']
      .filter((_, ti) => r[4 + ti].includes('*'))
      .sort()
      .join(',');
    check(`${tag}: ${g.label} :: imputed flags`, deckStarred === [...g.imputed].sort().join(','), `deck [${deckStarred}], sample [${g.imputed}]`);
  }

  // meta totals vs the deck summary line
  const osum = await page.locator('#osum').innerText();
  const m = osum.match(/([\d,]+) judged cycles.*?([\d,]+) ship-judged \((\d+) pending, (\d+) unshippable\) .*→ ([\d,]+) shipped/);
  check(
    `${tag}: meta judged/ship-judged/shipped`,
    !!m &&
      +m[1].replace(/,/g, '') === wantMeta.judged &&
      +m[2].replace(/,/g, '') === wantMeta.shipJudged &&
      +m[3] === wantMeta.pending &&
      +m[4] === wantMeta.impossible &&
      +m[5].replace(/,/g, '') === wantMeta.shipped,
    osum.slice(0, 180),
  );
  return sampGroups.length;
}

const n1 = await checkView('famCombo', sample.views.famCombo.groups, sample.meta);
// Effort view: model + effort grouping with role off (per-session grouping,
// the configuration sample.modelEffort mirrors).
await page.locator('#ogroup [data-g=effort]').click();
await page.locator('#orole [data-r=off]').click();
await page.waitForTimeout(300);
const n2 = await checkView('modelEffort', sample.views.modelEffort.groups, sample.meta.off);

await browser.close();
if (fails.length) {
  console.log(`DIFF FAIL:\n${fails.map((f) => '  - ' + f).join('\n')}`);
  process.exit(1);
}
console.log(`diff: famCombo ${n1} + modelEffort ${n2} groups × ${COLS.length} cells match, imputed flags agree, meta agrees`);
