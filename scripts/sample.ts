// Reads ../ocProductivity/data.json and writes example overall-score rows.
// Scoring lives in ./lib/scoring.ts (shared with pool.ts); this file only
// adapts the deck's SESS/CYC rows to CycleFacts.
// Labels use real model ids; no file paths, author names, prompts or session
// contents are ever emitted.
import { existsSync } from 'node:fs';

import { accumulate, buildOutput, isJudged, MIN_JUDGED, TK, WEIGHTS, type CycleFacts } from './lib/scoring.ts';

const SRC = new URL('../../ocProductivity/data.json', import.meta.url);
const OUT = new URL('../data/sample.json', import.meta.url);

type Row = (number | string)[];

async function main() {
  if (!existsSync(SRC)) {
    console.error(`sample: ${decodeURIComponent(SRC.pathname)} not found; run ocProductivity extract first`);
    process.exit(1);
  }
  const d = await Bun.file(SRC).json();
  const SC: Record<string, number> = {};
  (d.SESS_COLS as string[]).forEach((c, i) => (SC[c] = i));
  const CC: Record<string, number> = {};
  (d.CYC_COLS as string[]).forEach((c, i) => (CC[c] = i));
  const SESS = d.SESS as Row[];
  const CYC = d.CYC as Row[];
  const models: string[] = d.IDX.model;
  const provs: string[] = d.IDX.prov;

  const need = (cols: Record<string, number>, names: string[], what: string) => {
    for (const n of names)
      if (cols[n] === undefined) {
        console.error(`sample: ${what} column ${n} missing; re-run ocProductivity extract`);
        process.exit(1);
      }
  };
  need(SC, ['child', 'model', 'prov', 'role'], 'SESS');
  need(
    CC,
    ['sess', 'a', 'u', 'tedits', 'tpaths', 'teerr', 'tcost', 'tship', 'thrs', 'tver', 'tabort', 'latmed', 'pm', 'pp', 'bm', 'bp'],
    'CYC',
  );

  const facts: CycleFacts[] = [];
  for (const c of CYC) {
    const s = SESS[c[CC.sess] as number];
    const pm = c[CC.pm] as number;
    const pp = c[CC.pp] as number;
    const bm = c[CC.bm] as number;
    const bp = c[CC.bp] as number;
    facts.push({
      model: models[s[SC.model] as number],
      prov: provs[s[SC.prov] as number],
      isBuild: (s[SC.role] as number) === 2,
      top: !(s[SC.child] as number),
      pm: pm >= 0 ? models[pm] : null,
      pp: pp >= 0 ? provs[pp] : null,
      bm: bm >= 0 ? models[bm] : null,
      bp: bp >= 0 ? provs[bp] : null,
      u: c[CC.u] as number,
      a: c[CC.a] as number,
      tedits: c[CC.tedits] as number,
      tpaths: c[CC.tpaths] as number,
      teerr: c[CC.teerr] as number,
      tcost: c[CC.tcost] as number,
      tship: c[CC.tship] as number,
      thrs: c[CC.thrs] as number,
      tver: c[CC.tver] as number,
      tabort: c[CC.tabort] as number,
      latmed: c[CC.latmed] as number,
    });
  }
  const { prod, combo } = accumulate(facts);

  let judged = 0;
  let shipped = 0;
  for (const f of facts) {
    if (f.pm === null || f.bm === null) continue;
    if (!isJudged(f)) continue;
    judged += 1;
    if (f.tship) shipped += 1;
  }

  const out = buildOutput(
    { prod, combo },
    {
      generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      start: d.meta.start,
      end: d.meta.end,
      judged,
      shipped,
      minJudged: MIN_JUDGED,
      evidenceK: TK,
      weights: WEIGHTS,
    },
  );
  await Bun.write(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(
    `sample: model=${out.views.model.groups.length} family=${out.views.family.groups.length} modelCombo=${out.views.modelCombo.groups.length} famCombo=${out.views.famCombo.groups.length} -> ${decodeURIComponent(OUT.pathname)}`,
  );
}

await main();
