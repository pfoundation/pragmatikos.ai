// Pulls the pooled contribution cycles from ClickHouse and writes
// data/pool.json, the file the site ships. The pool holds one row per
// contributed top-level cycle (see ../pragmaServer); retracted installs are
// excluded. Scoring is shared (./lib/scoring.ts), so a sole-member pool must
// reproduce the local sample to display rounding — prove with
// `bun run sample && bun run diff`.
// Creds come from .env.local (gitignored, auto-loaded by bun) or the
// environment: CLICKHOUSE_URL, CLICKHOUSE_USER (pragma_reader),
// CLICKHOUSE_PASSWORD.
import { existsSync } from 'node:fs';

import { accumulate, buildOutput, isJudged, MIN_JUDGED, TK, WEIGHTS, type CycleFacts } from './lib/scoring.ts';

const OUT = new URL('../data/pool.json', import.meta.url);

function must(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`pool: set ${name}`);
    process.exit(1);
  }
  return v;
}

const url = must('CLICKHOUSE_URL').replace(/\/+$/, '');
const user = must('CLICKHOUSE_USER');
const pass = must('CLICKHOUSE_PASSWORD');

async function ch(query: string): Promise<string> {
  const res = await fetch(`${url}/?query=${encodeURIComponent(query)}`, {
    headers: { 'X-ClickHouse-User': user, 'X-ClickHouse-Key': pass },
  });
  if (!res.ok) {
    console.error(`pool: query failed status=${res.status}\n${(await res.text()).slice(0, 500)}`);
    process.exit(1);
  }
  return res.text();
}

async function main() {
  const rows = await ch(
    `SELECT model, prov, role, pm, pp, bm, bp, u, a, tedits, tpaths, teerr,
      tcost, tship, thrs, tver, tabort, latmed, day
    FROM pragma.cycles FINAL
    WHERE install_id NOT IN (SELECT install_id FROM pragma.retractions)
    ORDER BY day, model, prov, role FORMAT JSONEachRow`,
  );
  const facts: CycleFacts[] = [];
  let dayMin = '9999';
  let dayMax = '0000';
  for (const line of rows.split('\n')) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);
    // A phase counts only when both its model and provider are known,
    // matching the extractor (which always records them as a pair).
    const pm = r.pm && r.pp ? (r.pm as string) : null;
    const bm = r.bm && r.bp ? (r.bm as string) : null;
    facts.push({
      model: r.model,
      prov: r.prov,
      isBuild: r.role === 2,
      top: true,
      pm,
      pp: pm ? (r.pp as string) : null,
      bm,
      bp: bm ? (r.bp as string) : null,
      u: r.u,
      a: r.a,
      tedits: r.tedits,
      tpaths: r.tpaths,
      teerr: r.teerr,
      tcost: r.tcost,
      tship: r.tship,
      thrs: r.thrs,
      tver: r.tver,
      tabort: r.tabort,
      latmed: r.latmed,
    });
    if (r.day < dayMin) dayMin = r.day;
    if (r.day > dayMax) dayMax = r.day;
  }
  if (!facts.length) {
    console.error('pool: no rows in the pool');
    process.exit(1);
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

  const installs = await ch(
    `SELECT uniqExact(install_id) AS n FROM pragma.cycles FINAL
    WHERE install_id NOT IN (SELECT install_id FROM pragma.retractions) FORMAT JSONEachRow`,
  );
  const contributors = JSON.parse(installs).n as number;
  const out = buildOutput(
    { prod, combo },
    {
      generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      start: dayMin,
      end: dayMax,
      judged,
      shipped,
      contributors,
      minJudged: MIN_JUDGED,
      evidenceK: TK,
      weights: WEIGHTS,
    },
  );
  let prev = '';
  if (existsSync(OUT)) {
    try {
      const dj = judged - (((await Bun.file(OUT).json()).meta?.judged ?? judged) as number);
      prev = `, judged ${dj >= 0 ? '+' : ''}${dj} vs previous`;
    } catch {
      // Unreadable previous file: overwrite silently.
    }
  }
  await Bun.write(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(
    `pool: ${facts.length} cycles from ${contributors} contributor(s)${prev}, generated ${out.meta.generated}, ` +
      `model=${out.views.model.groups.length} family=${out.views.family.groups.length} ` +
      `modelCombo=${out.views.modelCombo.groups.length} famCombo=${out.views.famCombo.groups.length} -> ${decodeURIComponent(OUT.pathname)}`,
  );
}

await main();
