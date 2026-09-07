// Shared overall-score math for scripts/sample.ts (local data.json) and
// scripts/pool.ts (pooled contributions). Mirrors the ocInsights deck's
// overall card (OVERALL_CFG) exactly — ten axes in six weighted tiers, log-odds
// for rates, k=10 evidence weighting on a fixed ±2 span. The ship rate divides
// by ship-judged cycles (tshipe 0); pending (1) and unshippable (2) cycles
// stay in process axes only. When the deck changes, port here; never invent
// scoring — redirect methodology changes to ocInsights first.
export const MIN_JUDGED = 10;
export const TK = 10;
export const SPAN = 2;

export type AxisKey = 'shipr' | 'oneshot' | 'ttss' | 'hps' | 'dpss' | 'eerrp' | 'abortp' | 'verp' | 'ept' | 'lat';
export const AXES: AxisKey[] = ['shipr', 'oneshot', 'ttss', 'hps', 'dpss', 'eerrp', 'abortp', 'verp', 'ept', 'lat'];
type Kind = 'ratio' | 'odds' | 'err';
const HI: Record<AxisKey, boolean> = {
  shipr: true,
  oneshot: true,
  ttss: false,
  hps: false,
  dpss: false,
  eerrp: false,
  abortp: false,
  verp: true,
  ept: true,
  lat: false,
};
const KIND: Record<AxisKey, Kind> = {
  shipr: 'odds',
  oneshot: 'odds',
  ttss: 'ratio',
  hps: 'ratio',
  dpss: 'ratio',
  eerrp: 'err',
  abortp: 'err',
  verp: 'odds',
  ept: 'ratio',
  lat: 'ratio',
};
const EV: Record<AxisKey, string> = {
  shipr: 'hshipJudged',
  oneshot: 'hshipped',
  ttss: 'hshipped',
  hps: 'hshipped',
  dpss: 'hshippedCosted',
  eerrp: 'hjudged',
  abortp: 'hjudged',
  verp: 'hjudged',
  ept: 'hjudged',
  lat: 'hjudged',
};
const TIERS: { name: string; w: number; axes: AxisKey[] }[] = [
  { name: 'Outcome', w: 30, axes: ['shipr', 'oneshot'] },
  { name: 'Cost', w: 20, axes: ['ttss', 'hps', 'dpss'] },
  { name: 'Precision', w: 15, axes: ['eerrp', 'abortp'] },
  { name: 'Discipline', w: 15, axes: ['verp'] },
  { name: 'Efficiency', w: 10, axes: ['ept'] },
  { name: 'Latency', w: 10, axes: ['lat'] },
];
export const WEIGHTS = TIERS.map((t) => t.w).join('/');

const HUES: Record<string, number> = {
  'claude-opus': 55,
  'claude-sonnet': 160,
  'claude-haiku': 120,
  'claude-fable': 320,
  grok: 30,
  gpt: 240,
  gemini: 200,
  minimax: 280,
  deepseek: 90,
  'muse-spark': 350,
};

export function familyOf(model: string): string {
  const m = model.match(/^(claude-(?:opus|sonnet|haiku|fable)|grok|gpt|gemini|minimax|deepseek|muse-spark|big-pickle)/);
  return m ? m[1] : model;
}

export function hueOf(family: string): number {
  if (family in HUES) return HUES[family];
  let h = 0;
  for (const c of family) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function wmed(pairs: [number, number][]): number | null {
  const s = pairs.filter(([v]) => v !== null && v !== undefined).sort((x, y) => x[0] - y[0]);
  const t = s.reduce((n, x) => n + x[1], 0);
  let c = 0;
  for (const [v, w] of s) {
    c += w;
    if (c >= t / 2) return v;
  }
  return null;
}

function relOf(v: number | null, pp: number | null, k: AxisKey): number | null {
  if (v === null || v === undefined || pp === null || pp === undefined) return null;
  const hi = HI[k];
  const kind = KIND[k];
  if (kind === 'ratio') {
    if (v <= 0 || pp <= 0) return null;
    return Math.log2(hi ? v / pp : pp / v);
  }
  if (kind === 'odds') {
    if (pp <= 0 || pp >= 100) return null;
    if (v === pp) return 0;
    const o1 = v <= 0 ? 0 : v >= 100 ? Infinity : v / (100 - v);
    const o2 = pp / (100 - pp);
    if (o1 === 0) return hi ? -Infinity : Infinity;
    if (o1 === Infinity) return hi ? Infinity : -Infinity;
    return Math.log2(hi ? o1 / o2 : o2 / o1);
  }
  if (kind === 'err') {
    if (pp <= 0) return null;
    if (v === pp) return 0;
    if (v <= 0) return hi ? -Infinity : Infinity;
    return Math.log2(hi ? v / pp : pp / v);
  }
  return null;
}

export interface Acc {
  hu: number;
  ha: number;
  hjudged: number;
  hshipJudged: number;
  hshipped: number;
  hshippedCosted: number;
  huShip: number;
  hedits: number;
  heditsShip: number;
  hteerr: number;
  hcost: number;
  hcostShip: number;
  hhrs: number;
  hhrsShip: number;
  hver: number;
  habort: number;
  hone: number;
  latBag: [number, number][];
}

function blank(): Acc {
  return {
    hu: 0,
    ha: 0,
    hjudged: 0,
    hshipJudged: 0,
    hshipped: 0,
    hshippedCosted: 0,
    huShip: 0,
    hedits: 0,
    heditsShip: 0,
    hteerr: 0,
    hcost: 0,
    hcostShip: 0,
    hhrs: 0,
    hhrsShip: 0,
    hver: 0,
    habort: 0,
    hone: 0,
    latBag: [],
  };
}

const NUMKEYS = [
  'hu',
  'ha',
  'hjudged',
  'hshipJudged',
  'hshipped',
  'hshippedCosted',
  'huShip',
  'hedits',
  'heditsShip',
  'hteerr',
  'hcost',
  'hcostShip',
  'hhrs',
  'hhrsShip',
  'hver',
  'habort',
  'hone',
] as const;

// One top-level cycle's score facts, from either source. Phases are null when
// absent (a phase counts only when both its model and provider are known).
export type CycleFacts = {
  model: string;
  prov: string;
  variant: string;
  isBuild: boolean;
  top: boolean;
  pm: string | null;
  pp: string | null;
  pv: string | null;
  bm: string | null;
  bp: string | null;
  bv: string | null;
  hversion: string;
  u: number;
  a: number;
  tedits: number;
  tpaths: number;
  teerr: number;
  tcost: number;
  tship: number;
  tshipe: number;
  thrs: number;
  tver: number;
  tabort: number;
  latmed: number;
};

export type ProdRow = Acc & { m: string; p: string; v: string };
export type ComboRow = Acc & { pm: string; bm: string };

export function isJudged(f: CycleFacts): boolean {
  return f.top && f.a > 0 && f.tedits > 0 && f.tpaths > 0;
}

function addCycle(e: Acc, f: CycleFacts): void {
  e.hu += f.u;
  e.ha += f.a;
  e.hjudged += 1;
  if (f.tshipe === 0) e.hshipJudged += 1;
  e.hedits += f.tedits;
  e.hteerr += f.teerr;
  e.hcost += f.tcost;
  e.hhrs += f.thrs;
  e.hver += f.tver ? 1 : 0;
  e.habort += f.tabort ? 1 : 0;
  if (f.latmed >= 0) e.latBag.push([f.latmed, f.a || 1]);
  if (f.tship) {
    e.hshipped += 1;
    if (f.tcost > 0) e.hshippedCosted += 1;
    e.huShip += f.u;
    e.heditsShip += f.tedits;
    e.hhrsShip += f.thrs;
    e.hcostShip += f.tcost;
    if (f.u === 1 || (f.pm !== null && f.u <= 2)) e.hone += 1;
  }
}

// Level 1 (off): h* sums keyed by the parent session's model|prov|variant|isBuild.
// Level 1 (combo): h* sums keyed by the cycle's own planner→builder pair;
// cycles need both phases.
export function accumulate(rows: Iterable<CycleFacts>): {
  prod: Map<string, ProdRow>;
  combo: Map<string, ComboRow>;
} {
  const prod = new Map<string, ProdRow>();
  const combo = new Map<string, ComboRow>();
  for (const f of rows) {
    if (!isJudged(f)) continue;
    const k = `${f.model}|${f.prov}|${f.variant}|${f.isBuild ? 1 : 0}`;
    let e = prod.get(k);
    if (!e) {
      e = { ...blank(), latBag: [] as [number, number][], m: f.model, p: f.prov, v: f.variant };
      prod.set(k, e);
    }
    addCycle(e, f);
    if (f.pm === null || f.bm === null) continue;
    const ck = `${f.pm}|${f.pp}|${f.pv}|${f.bm}|${f.bp}|${f.bv}`;
    let c = combo.get(ck);
    if (!c) {
      c = { ...blank(), latBag: [] as [number, number][], pm: f.pm, bm: f.bm };
      combo.set(ck, c);
    }
    addCycle(c, f);
  }
  return { prod, combo };
}

// Level 2: fold intermediate rows into labelled groups, derive the ten axes.
function groupUp<T extends Acc>(rows: Iterable<T>, keyOf: (r: T) => { key: string; hue: number }) {
  const G = new Map<string, { acc: Acc; latbag: [number, number][]; hue: number }>();
  for (const r of rows) {
    const { key, hue } = keyOf(r);
    const g = G.get(key) ?? { acc: blank(), latbag: [] as [number, number][], hue };
    G.set(key, g);
    for (const k of NUMKEYS) {
      (g.acc[k] as number) += r[k] as unknown as number;
    }
    g.latbag.push(...r.latBag);
  }
  const out: {
    key: string;
    hue: number;
    acc: Acc;
    latbag: [number, number][];
    raw: Record<AxisKey, number | null>;
  }[] = [];
  for (const [key, g] of G) {
    // Deck parity: pool and scores are computed over ranked groups only
    // (hjudged >= MIN_JUDGED, deck default, small filter off). Smaller
    // groups stay out of the sample entirely — the deck lists them dimmed.
    if (g.acc.hjudged < MIN_JUDGED) continue;
    const a = g.acc;
    out.push({
      key,
      hue: g.hue,
      acc: a,
      latbag: g.latbag,
      raw: {
        shipr: a.hshipJudged ? (100 * a.hshipped) / a.hshipJudged : null,
        oneshot: a.hshipped ? (100 * a.hone) / a.hshipped : null,
        ttss: a.hshipped ? a.huShip / a.hshipped : null,
        hps: a.hshipped ? a.hhrsShip / a.hshipped : null,
        dpss: a.hcostShip > 0 && a.hshippedCosted ? a.hcostShip / a.hshippedCosted : null,
        eerrp: a.hedits > 0 ? (100 * a.hteerr) / a.hedits : null,
        abortp: (100 * a.habort) / a.hjudged,
        verp: (100 * a.hver) / a.hjudged,
        ept: a.hu > 0 ? a.hedits / a.hu : null,
        lat: wmed(g.latbag),
      },
    });
  }
  return out;
}

function poolOf(groups: { acc: Acc; latbag: [number, number][] }[]): Record<AxisKey, number | null> {
  const S = (k: (typeof NUMKEYS)[number]) => groups.reduce((t, g) => t + (g.acc[k] as unknown as number), 0);
  const dv = (a: number, b: number) => (b > 0 ? a / b : null);
  const cb = groups.filter((g) => g.acc.hcostShip > 0);
  return {
    shipr: dv(100 * S('hshipped'), S('hshipJudged')),
    oneshot: dv(100 * S('hone'), S('hshipped')),
    ttss: dv(S('huShip'), S('hshipped')),
    hps: dv(S('hhrsShip'), S('hshipped')),
    dpss: dv(
      cb.reduce((t, g) => t + g.acc.hcostShip, 0),
      cb.reduce((t, g) => t + g.acc.hshippedCosted, 0),
    ),
    eerrp: dv(100 * S('hteerr'), S('hedits')),
    abortp: dv(100 * S('habort'), S('hjudged')),
    verp: dv(100 * S('hver'), S('hjudged')),
    ept: dv(S('hedits'), S('hu')),
    lat: wmed(groups.flatMap((g) => g.latbag)),
  };
}

type G = {
  key: string;
  hue: number;
  acc: Acc;
  latbag: [number, number][];
  raw: Record<AxisKey, number | null>;
};
function finish(groups: G[], labelOf: (key: string) => string) {
  const pool = poolOf(groups);
  const adjOf = (g: G) => {
    const o = {} as Record<AxisKey, number | null>;
    for (const k of AXES) {
      const raw = g.raw[k];
      const pp = pool[k];
      const n = (g.acc[EV[k] as keyof Acc] as unknown as number) || 0;
      o[k] = raw === null || pp === null ? null : (n * raw + TK * pp) / (n + TK);
    }
    return o;
  };
  const posOf = (v: number | null, k: AxisKey) => {
    if (v === null || v === undefined) return null;
    const r = relOf(v, pool[k], k);
    if (r === null) return null;
    return (Math.min(1, Math.max(-1, r / SPAN)) + 1) / 2;
  };
  const scoreOf = (vals: Record<AxisKey, number | null>) => {
    let num = 0;
    let den = 0;
    const tiers = {} as Record<string, number>;
    const imputed: string[] = [];
    for (const t of TIERS) {
      const vs = t.axes.map((k) => posOf(vals[k], k)).filter((v) => v !== null) as number[];
      const m = vs.length ? vs.reduce((x, y) => x + y, 0) / vs.length : 0.5;
      tiers[t.name] = 100 * m;
      if (!vs.length) imputed.push(t.name);
      num += t.w * m;
      den += t.w;
    }
    return { score: den ? (100 * num) / den : null, tiers, imputed };
  };
  const rows = groups.map((g) => {
    const adj = adjOf(g);
    const ev = {} as Record<AxisKey, number>;
    for (const k of AXES) ev[k] = (g.acc[EV[k] as keyof Acc] as unknown as number) || 0;
    const sRaw = scoreOf(g.raw);
    const sAdj = scoreOf(adj);
    return {
      id: g.key,
      label: labelOf(g.key),
      hue: g.hue,
      hjudged: g.acc.hjudged,
      hshipped: g.acc.hshipped,
      hshipJudged: g.acc.hshipJudged,
      raw: { ...g.raw },
      adj: { ...adj },
      ev,
      tiers: { ...sRaw.tiers },
      tiersAdj: { ...sAdj.tiers },
      imputed: sRaw.imputed,
      score: sRaw.score,
      scoreAdj: sAdj.score,
    };
  });
  rows.forEach((r, i) => {
    r.id = `g${i}`;
  });
  return {
    groups: rows.sort((a, b) => (b.scoreAdj ?? -1) - (a.scoreAdj ?? -1)),
    pool: { ...pool },
    span: SPAN,
  };
}

export type ViewInput = {
  prod: Map<string, ProdRow>;
  combo: Map<string, ComboRow>;
};

export type SampleMeta = {
  generated: string;
  start: string;
  end: string;
  judged: number;
  shipped: number;
  shipJudged: number;
  pending: number;
  impossible: number;
  contributors?: number;
  /** Contribution contract version from pragma.cycles. Absent on sample.json. */
  schema?: number;
  minJudged: number;
  evidenceK: number;
  weights: string;
  /** Same counts over all judged cycles (no both-phases requirement), for the off-view diff. */
  off?: { judged: number; shipped: number; shipJudged: number; pending: number; impossible: number };
};

export function buildOutput(input: ViewInput, meta: SampleMeta) {
  const modelGroups = groupUp(input.prod.values(), (r) => ({
    key: r.m,
    hue: hueOf(familyOf(r.m)),
  }));
  const famGroups = groupUp(input.prod.values(), (r) => {
    const f = familyOf(r.m);
    return { key: f, hue: hueOf(f) };
  });
  const effortGroups = groupUp(input.prod.values(), (r) => ({
    key: `${r.m} (${r.v})`,
    hue: hueOf(familyOf(r.m)),
  }));
  const comboGroups = groupUp(input.combo.values(), (r) => ({
    key: `${r.pm}→${r.bm}`,
    hue: hueOf(familyOf(r.bm)),
  }));
  const famComboGroups = groupUp(input.combo.values(), (r) => {
    const key = `${familyOf(r.pm)}→${familyOf(r.bm)}`;
    return { key, hue: hueOf(familyOf(r.bm)) };
  });
  return {
    meta: { ...meta },
    views: {
      model: finish(modelGroups, (k) => k),
      family: finish(famGroups, (k) => k),
      modelEffort: finish(effortGroups, (k) => k),
      modelCombo: finish(comboGroups, (k) => k.split('→').join(' → ')),
      famCombo: finish(famComboGroups, (k) => k.split('→').join(' → ')),
    },
  };
}
