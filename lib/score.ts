import pool from '@/data/pool.json';

export type AxisKey = 'shipr' | 'oneshot' | 'ttss' | 'hps' | 'dpss' | 'eerrp' | 'abortp' | 'verp' | 'ept' | 'lat';

export type AxisKind = 'ratio' | 'odds' | 'err';

/** Fixed log span: ±2 from pool (×4 / ÷4) on every axis. */
export const SPAN = 2;

export interface AxisMeta {
  key: AxisKey;
  label: string;
  short: string;
  hi: boolean;
  kind: AxisKind;
  tier: string;
  format: (v: number) => string;
}

export const AXES: AxisMeta[] = [
  { key: 'shipr', label: 'Ship rate', short: 'Ship %', hi: true, kind: 'odds', tier: 'outcome', format: (v) => `${v.toFixed(0)}%` },
  {
    key: 'oneshot',
    label: 'One-shot rate',
    short: 'One-shot %',
    hi: true,
    kind: 'odds',
    tier: 'outcome',
    format: (v) => `${v.toFixed(0)}%`,
  },
  { key: 'ttss', label: 'Turns per ship', short: 'Turns/ship', hi: false, kind: 'ratio', tier: 'cost', format: (v) => v.toFixed(1) },
  { key: 'hps', label: 'Hours per ship', short: 'Hours/ship', hi: false, kind: 'ratio', tier: 'cost', format: (v) => v.toFixed(1) },
  { key: 'dpss', label: 'Dollars per ship', short: '$/ship', hi: false, kind: 'ratio', tier: 'cost', format: (v) => `$${v.toFixed(2)}` },
  { key: 'eerrp', label: 'Edit errors', short: 'Edit err %', hi: false, kind: 'err', tier: 'precision', format: (v) => `${v.toFixed(1)}%` },
  { key: 'abortp', label: 'Aborts', short: 'Abort %', hi: false, kind: 'err', tier: 'precision', format: (v) => `${v.toFixed(1)}%` },
  {
    key: 'verp',
    label: 'Verified cycles',
    short: 'Verified %',
    hi: true,
    kind: 'odds',
    tier: 'discipline',
    format: (v) => `${v.toFixed(0)}%`,
  },
  { key: 'ept', label: 'Edits per turn', short: 'Edits/turn', hi: true, kind: 'ratio', tier: 'efficiency', format: (v) => v.toFixed(1) },
  { key: 'lat', label: 'Seconds per step', short: 's/step', hi: false, kind: 'ratio', tier: 'latency', format: (v) => v.toFixed(1) },
];

export interface TierMeta {
  key: string;
  label: string;
  desc: string;
  question: string;
  axes: AxisKey[];
  weight: number;
  color: string;
}

export const TIERS: TierMeta[] = [
  {
    key: 'outcome',
    label: 'Outcome',
    desc: 'Ship rate and one-shot rate (prompt plus approval).',
    question: 'Does the work land?',
    axes: ['shipr', 'oneshot'],
    weight: 30,
    color: 'var(--chart-1)',
  },
  {
    key: 'cost',
    label: 'Cost of a ship',
    desc: 'Turns, hours and dollars per shipped cycle.',
    question: 'What does a landed outcome cost?',
    axes: ['ttss', 'hps', 'dpss'],
    weight: 20,
    color: 'var(--chart-5)',
  },
  {
    key: 'precision',
    label: 'Precision',
    desc: 'Edit errors and human interventions.',
    question: 'Does it act on what it read?',
    axes: ['eerrp', 'abortp'],
    weight: 15,
    color: 'var(--chart-4)',
  },
  {
    key: 'discipline',
    label: 'Discipline',
    desc: 'Share of cycles verified after the last edit.',
    question: 'Does it check its work?',
    axes: ['verp'],
    weight: 15,
    color: 'var(--chart-2)',
  },
  {
    key: 'efficiency',
    label: 'Efficiency',
    desc: 'Edits per human turn.',
    question: 'How much per turn?',
    axes: ['ept'],
    weight: 10,
    color: 'var(--chart-3)',
  },
  {
    key: 'latency',
    label: 'Latency',
    desc: 'Median seconds per assistant step.',
    question: 'How long is each step?',
    axes: ['lat'],
    weight: 10,
    color: 'var(--muted-foreground)',
  },
];

export const tierOf = (key: AxisKey): TierMeta => TIERS.find((t) => t.axes.includes(key))!;

/** Strip order: more-is-better axes first, then fewer-is-better, tier order kept inside each block. */
export const STRIP_AXES: AxisMeta[] = [...AXES.filter((a) => a.hi), ...AXES.filter((a) => !a.hi)];

export type ScoreGroup = {
  id: string;
  label: string;
  hue: number;
  hjudged: number;
  hshipped: number;
  raw: Record<AxisKey, number | null>;
  adj: Record<AxisKey, number | null>;
  ev: Record<AxisKey, number>;
  tiers: Record<string, number>;
  tiersAdj: Record<string, number>;
  imputed: string[];
  score: number | null;
  scoreAdj: number | null;
};

export type ScoreView = {
  groups: ScoreGroup[];
  pool: Record<AxisKey, number | null>;
  span: number;
};

export type ViewKey = 'model' | 'family' | 'modelCombo' | 'famCombo';

export const views = pool.views as unknown as Record<ViewKey, ScoreView>;
export const meta = pool.meta;

/** Render stamp, sliced without locale APIs so SSR and client agree. */
export const generatedLabel =
  typeof meta.generated === 'string' && meta.generated.length >= 16
    ? `${meta.generated.slice(0, 10)} ${meta.generated.slice(11, 16)} UTC`
    : 'unknown';

export type GroupKey = 'model' | 'family';

export const GROUP_LABELS: Record<GroupKey, string> = {
  model: 'Models',
  family: 'Families',
};

const intFmt = new Intl.NumberFormat('en-US');
export const fmtInt = (v: number): string => intFmt.format(v);

/** Series color keyed to model-family hues. */
export const famFill = (hue: number): string => `hsl(${hue} 60% 45%)`;

export function familyOf(model: string): string {
  const m = model.match(/^(claude-(?:opus|sonnet|haiku|fable)|grok|gpt|gemini|minimax|deepseek|muse-spark|big-pickle)/);
  return m ? m[1] : model;
}

/** Map a model-pair label to its family-pair label so views can cross-highlight. */
export function toFamPairLabel(label: string): string {
  const parts = label.split(' → ');
  if (parts.length !== 2) return label;
  return `${familyOf(parts[0])} → ${familyOf(parts[1])}`;
}

/** Pool-relative position of a value, −1..1 clamped, better-is-positive. Ratios, log odds for rates. */
export function position(v: number | null, pool: number | null, key: AxisKey): number | null {
  if (v === null || v === undefined || pool === null || pool === undefined) return null;
  const { hi, kind } = AXES.find((a) => a.key === key)!;
  let r: number | null;
  if (kind === 'ratio') {
    if (v <= 0 || pool <= 0) return null;
    r = Math.log2(hi ? v / pool : pool / v);
  } else if (kind === 'odds') {
    if (pool <= 0 || pool >= 100) return null;
    if (v === pool) r = 0;
    else {
      const o1 = v <= 0 ? 0 : v >= 100 ? Infinity : v / (100 - v);
      const o2 = pool / (100 - pool);
      if (o1 === 0) r = hi ? -Infinity : Infinity;
      else if (o1 === Infinity) r = hi ? Infinity : -Infinity;
      else r = Math.log2(hi ? o1 / o2 : o2 / o1);
    }
  } else {
    if (pool <= 0) return null;
    if (v === pool) r = 0;
    else if (v <= 0) r = hi ? -Infinity : Infinity;
    else r = Math.log2(hi ? v / pool : pool / v);
  }
  if (r === null) return null;
  return Math.min(1, Math.max(-1, r / SPAN));
}
