'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Reveal } from '@/lib/reveal';
import { useSharedHot } from '@/lib/hot';
import {
  AXES,
  GROUP_LABELS,
  SPAN,
  STRIP_AXES,
  TIERS,
  VIEW_FOR_GROUP,
  contributorCount,
  famFill,
  fmtInt,
  generatedLabel,
  impossibleCount,
  meta,
  pendingCount,
  plural,
  position,
  shipJudgedCount,
  tierOf,
  toFamPairLabel,
  views,
  type AxisKey,
  type GroupKey,
  type ScoreGroup,
  type ViewKey,
} from '@/lib/score';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const valOf = (g: ScoreGroup, k: AxisKey): number | null => g.adj[k];
const scoreOf = (g: ScoreGroup): number | null => g.scoreAdj;

const W = 640;
const PLOT_L = 110;
const PLOT_R = 600;
const POOL_X = (PLOT_L + PLOT_R) / 2;
const RH = 46;
const TOP = 8;
const BOT = 42;
const N_HI = STRIP_AXES.filter((a) => a.hi).length;

function Strips({
  groups,
  view,
  hot,
  setHot,
}: {
  groups: ScoreGroup[];
  view: (typeof views)[ViewKey];
  hot: string | null;
  setHot: (id: string | null) => void;
}) {
  const maxEv = useMemo(() => {
    const o = {} as Record<AxisKey, number>;
    for (const a of AXES) o[a.key] = Math.max(1, ...groups.map((g) => g.ev[a.key]));
    return o;
  }, [groups]);
  const B1_TOP = TOP;
  const B1_BOT = B1_TOP + N_HI * RH;
  const B2_TOP = B1_BOT;
  const B2_BOT = B2_TOP + (STRIP_AXES.length - N_HI) * RH;
  const H = B2_BOT + BOT;
  const rowY = (i: number): number => (i < N_HI ? B1_TOP + i * RH + RH / 2 : B2_TOP + (i - N_HI) * RH + RH / 2);
  const xOf = (g: ScoreGroup, k: AxisKey): number | null => {
    const hi = AXES.find((a) => a.key === k)!.hi;
    const p = position(valOf(g, k), view.pool[k], k);
    if (p === null) return null;
    const q = hi ? p : -p;
    return POOL_X + q * ((PLOT_R - PLOT_L) / 2);
  };
  const hotG = groups.find((g) => g.id === hot) ?? null;
  const hotPts = hotG
    ? STRIP_AXES.map((a, i) => {
        const x = xOf(hotG, a.key);
        return x === null ? null : `${x.toFixed(1)},${rowY(i)}`;
      }).filter(Boolean)
    : [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Pool-relative strips: more-is-better axes, then fewer-is-better axes"
      onMouseLeave={() => setHot(null)}
    >
      <rect x={PLOT_L} y={TOP} width={PLOT_R - PLOT_L} height={B1_BOT - TOP} fill="var(--chart-2)" opacity={0.07} />
      <rect x={PLOT_L} y={B1_BOT} width={PLOT_R - PLOT_L} height={B2_BOT - B1_BOT} fill="var(--chart-5)" opacity={0.07} />
      <text
        x={PLOT_R + 22}
        y={(B1_TOP + B1_BOT) / 2}
        textAnchor="middle"
        fontSize={11}
        fill="var(--foreground)"
        fontFamily="Inconsolata, monospace"
        transform={`rotate(90 ${PLOT_R + 22} ${(B1_TOP + B1_BOT) / 2})`}
      >
        Higher is better
      </text>
      <text
        x={PLOT_R + 22}
        y={(B2_TOP + B2_BOT) / 2}
        textAnchor="middle"
        fontSize={11}
        fill="var(--foreground)"
        fontFamily="Inconsolata, monospace"
        transform={`rotate(90 ${PLOT_R + 22} ${(B2_TOP + B2_BOT) / 2})`}
      >
        Lower is better
      </text>
      <line x1={0} x2={W} y1={B1_BOT} y2={B1_BOT} stroke="var(--foreground)" opacity={0.35} />
      <line x1={POOL_X} x2={POOL_X} y1={B1_TOP} y2={B1_BOT} stroke="var(--foreground)" opacity={0.45} />
      <line x1={POOL_X} x2={POOL_X} y1={B2_TOP} y2={B2_BOT} stroke="var(--foreground)" opacity={0.45} />
      {STRIP_AXES.map((a, i) => {
        const y = rowY(i);
        return (
          <g key={a.key}>
            <line x1={PLOT_L} x2={PLOT_R} y1={y} y2={y} stroke="var(--foreground)" opacity={0.14} />
            <text x={PLOT_L - 10} y={y + 4} textAnchor="end" fontSize={12} fill="var(--foreground)" fontFamily="Inconsolata, monospace">
              {a.short}
            </text>
          </g>
        );
      })}
      {[-2, -1, 0, 1, 2].map((q) => (
        <text
          key={q}
          x={POOL_X + (q / SPAN) * ((PLOT_R - PLOT_L) / 2)}
          y={H - 24}
          textAnchor="middle"
          fontSize={11}
          fill="var(--muted-foreground)"
          fontFamily="Inconsolata, monospace"
        >
          {q === 0 ? 'pool' : q < 0 ? `×${(2 ** q).toFixed(q === -1 ? 1 : 2)}` : `×${2 ** q}`}
        </text>
      ))}
      <text x={PLOT_L} y={H - 8} fontSize={11} fill="var(--muted-foreground)" fontFamily="Inconsolata, monospace">
        ← lower
      </text>
      <text x={PLOT_R} y={H - 8} textAnchor="end" fontSize={11} fill="var(--muted-foreground)" fontFamily="Inconsolata, monospace">
        higher →
      </text>
      {hotPts.length >= 2 && (
        <polyline points={hotPts.join(' ')} fill="none" stroke={famFill(hotG!.hue)} strokeWidth={1.5} opacity={0.55} />
      )}
      {groups.map((g) =>
        STRIP_AXES.map((a, i) => {
          const x = xOf(g, a.key);
          if (x === null) return null;
          const v = valOf(g, a.key);
          const dim = hot !== null && hot !== g.id;
          return (
            <g key={`${g.id}-${a.key}`}>
              <title>{`${g.label} — ${a.label}: ${v === null ? '—' : a.format(v)} (pool ${view.pool[a.key] === null ? '—' : a.format(view.pool[a.key]!)})`}</title>
              <circle
                cx={POOL_X}
                cy={rowY(i)}
                r={(2.5 + 4 * Math.sqrt(g.ev[a.key] / maxEv[a.key])).toFixed(1)}
                fill={famFill(g.hue)}
                style={{
                  transform: `translateX(${(x - POOL_X).toFixed(1)}px)`,
                  transition: 'transform 500ms ease, opacity 200ms ease',
                  opacity: dim ? 0.15 : hot === g.id ? 1 : 0.9,
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHot(g.id)}
              />
            </g>
          );
        }),
      )}
    </svg>
  );
}

function Breakdown({ group, view }: { group: ScoreGroup; view: (typeof views)[ViewKey] }) {
  const tiers = TIERS.map((t) => {
    const ps = t.axes
      .map((k) => {
        const a = AXES.find((x) => x.key === k)!;
        const v = valOf(group, k);
        const p = position(v, view.pool[k], k);
        return { a, v, p, c: p === null ? null : (p + 1) / 2 };
      })
      .filter((p) => p.c !== null);
    const m = ps.length ? ps.reduce((s, p) => s + p.c!, 0) / ps.length : 0.5;
    return { t, ps, m, imputed: !ps.length };
  });
  const wSum = TIERS.reduce((s, t) => s + t.weight, 0);
  return (
    <div className="border-border mt-4 border p-4">
      <p className="font-mono text-xs">
        <span className="mr-2 inline-block size-2.5 align-[-1px]" style={{ background: famFill(group.hue) }} />
        {group.label} · score {scoreOf(group)?.toFixed(0) ?? '—'} / 100
      </p>
      {tiers.map(({ t, ps, m, imputed }) => (
        <div key={t.key} className="mt-3">
          <p className="font-mono text-[11px]">
            <span style={{ color: t.color }}>
              {t.label} · weight {t.weight}
            </span>{' '}
            <span className="text-muted-foreground">
              → {(100 * m).toFixed(0)}
              {imputed ? ' (no data, scored as pool)' : ''}
            </span>
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">{t.desc}</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ps.map(({ a, v, c }) => (
              <div
                key={a.key}
                className="border-border border p-2"
                title={`${a.label}: ${v === null ? '—' : a.format(v)} · pool ${view.pool[a.key] === null ? '—' : a.format(view.pool[a.key]!)}`}
              >
                <p className="truncate font-mono text-[11px]" style={{ color: tierOf(a.key).color }}>
                  {a.short}
                </p>
                <p className="mt-0.5 font-mono text-sm">{v === null ? '—' : a.format(v)}</p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-snug">{a.desc}</p>
                <div className="bg-muted relative mt-1.5 h-1.5">
                  <div className="bg-muted-foreground absolute top-0 h-full w-px" style={{ left: '50%' }} />
                  <div
                    className="absolute top-[-2px] size-2.5 rounded-none"
                    style={{ left: `calc(${((a.hi ? c! : 1 - c!) * 100).toFixed(1)}% - 5px)`, background: tierOf(a.key).color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <p className="text-muted-foreground mt-3 font-mono text-xs">
        score = Σ weight·tier / {wSum} = ({tiers.map((x) => `${x.t.weight}·${(100 * x.m).toFixed(0)}`).join(' + ')}) / {wSum}
      </p>
    </div>
  );
}

/** Human-friendly age of a timestamp: "just now", "3 hours ago", "2 days ago"... */
const ageLabel = (iso: string, now: number): string => {
  const s = Math.max(0, Math.floor((now - Date.parse(iso)) / 1000));
  if (Number.isNaN(s)) return generatedLabel;
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  if (d < 30) {
    const w = Math.floor(d / 7);
    return `${w} week${w === 1 ? '' : 's'} ago`;
  }
  const mo = Math.floor(d / 30.44);
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`;
  const y = Math.floor(mo / 12);
  return `${y} year${y === 1 ? '' : 's'} ago`;
};

/**
 * Pool stamp as a relative age. Renders the absolute label until mounted so the
 * static prerender and the first client render agree (no hydration mismatch).
 */
function LastUpdate() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const rel = now === null ? null : ageLabel(meta.generated, now);
  return (
    <time dateTime={meta.generated} title={rel === null || rel === generatedLabel ? undefined : generatedLabel} className="font-mono">
      {rel ?? generatedLabel}
    </time>
  );
}

export function Scorecard() {
  const [group, setGroup] = useState<GroupKey>('family');
  const [hot, setHot] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState(false);
  const viewKey: ViewKey = VIEW_FOR_GROUP[group];
  const view = views[viewKey];
  const [, setSharedHot] = useSharedHot();
  const setHotBoth = (id: string | null): void => {
    setHot(id);
    if (id === null) {
      setSharedHot(null);
      return;
    }
    const g = ranked.find((r) => r.id === id);
    setSharedHot(g ? (viewKey === 'famCombo' ? g.label : toFamPairLabel(g.label)) : null);
  };
  const ranked = useMemo(
    () => view.groups.filter((g) => g.hjudged >= meta.minJudged).sort((a, b) => (scoreOf(b) ?? -1) - (scoreOf(a) ?? -1)),
    [view],
  );
  const selG = ranked.find((g) => g.id === sel) ?? ranked[0];

  return (
    <section id="score" className="bg-blueprint border-border scroll-mt-12 border-b">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-primary">the rankings</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Models and pairings, ranked by what ships</h2>
              <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
                Did the work land in a commit, how many nudges did it take, how clean was it, what did it cost. Scored on real sessions, not
                lab tasks. <b>Scores are expected to change as more data is contributed.</b>
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline">
                Last update <LastUpdate />
              </Badge>
              <p
                tabIndex={0}
                className="group relative mt-1 ml-auto w-fit cursor-help font-mono text-xs text-muted-foreground underline decoration-dotted underline-offset-4"
              >
                {fmtInt(meta.judged)} Cycles<sup>*</sup>
                {contributorCount !== null && (
                  <>
                    {' '}
                    · {contributorCount} {plural(contributorCount, 'contributor', 'contributors')}
                  </>
                )}
                <span className="absolute top-full right-0 z-30 mt-2 hidden w-64 border border-border bg-popover p-3 text-left font-sans text-xs font-normal leading-snug text-popover-foreground no-underline group-focus:block group-hover:block">
                  Each cycle is one plan phase plus the build that followed it: the planner and builder models behind it, with turns, edits,
                  cost and shipping.
                  {shipJudgedCount !== null && pendingCount !== null && impossibleCount !== null && (
                    <>
                      {' '}
                      Of these, {fmtInt(shipJudgedCount)} are ship-judged ({fmtInt(pendingCount)} pending, {fmtInt(impossibleCount)}{' '}
                      unshippable).
                    </>
                  )}
                  {contributorCount !== null && (
                    <>
                      {' '}
                      Shared by {contributorCount} {plural(contributorCount, 'contributor', 'contributors')}.
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>
        </Reveal>
        <Card className="mt-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-xs">Group by</span>
                <Tabs
                  value={group}
                  onValueChange={(v) => {
                    setGroup(v as GroupKey);
                    setHot(null);
                    setSel(null);
                  }}
                >
                  <TabsList>
                    {(Object.keys(GROUP_LABELS) as GroupKey[])
                      .filter((k) => views[VIEW_FOR_GROUP[k]])
                      .map((k) => (
                        <TabsTrigger key={k} value={k}>
                          {GROUP_LABELS[k]}
                        </TabsTrigger>
                      ))}
                  </TabsList>
                </Tabs>
              </div>
            </div>
            <div className="mt-4 grid gap-6 xl:grid-cols-[5fr_7fr]" onMouseLeave={() => setHotBoth(null)}>
              <div>
                {ranked.map((g, i) => {
                  const s = scoreOf(g);
                  const dim = hot !== null && hot !== g.id;
                  const selected = selG?.id === g.id && breakdown;
                  return (
                    <div
                      key={g.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={selected}
                      className="grid cursor-pointer grid-cols-[1.75rem_minmax(0,1fr)_2.75rem] items-center gap-2 border-b border-border/60 px-1 py-1.5 last:border-0"
                      style={{
                        opacity: dim ? 0.35 : 1,
                        transition: 'opacity 200ms ease',
                        background: selected ? 'color-mix(in srgb, var(--primary) 12%, transparent)' : undefined,
                      }}
                      onMouseEnter={() => setHotBoth(g.id)}
                      onClick={() => {
                        setSel(g.id);
                        setBreakdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSel(g.id);
                          setBreakdown(true);
                        }
                      }}
                      title={`${g.label}: ${s === null ? '—' : `${s.toFixed(0)} / 100`} — click to show the breakdown`}
                    >
                      <span className="text-muted-foreground font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate font-mono text-xs">
                            <span className="mr-2 inline-block size-2 align-[-1px]" style={{ background: famFill(g.hue) }} />
                            {g.label}
                          </span>
                        </div>
                        <div className="bg-muted mt-1 h-2">
                          <div
                            className="h-full"
                            style={{ width: `${s ?? 0}%`, background: famFill(g.hue), transition: 'width 500ms ease' }}
                          />
                        </div>
                      </div>
                      <span className="text-right font-mono text-sm font-semibold">{s === null ? '—' : s.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
              <Strips groups={ranked} view={view} hot={hot} setHot={setHotBoth} />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setBreakdown((a) => !a)} aria-expanded={breakdown}>
                Breakdown
                <ChevronDown className={breakdown ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </Button>
            </div>
            {breakdown && selG && <Breakdown group={selG} view={view} />}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
