'use client';

import { AXES, famFill, meta, position, STRIP_AXES, views, type AxisKey, type ScoreGroup } from '@/lib/score';
import { useSharedHot } from '@/lib/hot';
import { useMemo, useState } from 'react';

/** Deck overall-radar labels, tier order. */
const LABELS: Record<AxisKey, string> = {
  shipr: 'Ship %',
  oneshot: 'One-shot %',
  ttss: 'Turns/ship',
  hps: 'Hours/ship',
  dpss: '$/ship',
  eerrp: 'Tool errors',
  abortp: 'Aborts',
  verp: 'Verified %',
  ept: 'Edits/turn',
  lat: 'Time/step',
};

/** Same geometry and normalisation as the deck's overall radar (relative-to-pool scale). */
const CX = 300;
const CY = 245;
const R = 180;
const N = AXES.length;
const BAND_N = 2;

const pt = (i: number, f: number): [number, number] => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [CX + R * f * Math.cos(a), CY + R * f * Math.sin(a)];
};
const f1 = (n: number): string => n.toFixed(1);

/** Greens first like STRIP_AXES; then lat↔ttss so Time/step sits where Turns/ship was. */
const DISP = (() => {
  const a = [...STRIP_AXES];
  const i = a.findIndex((x) => x.key === 'lat');
  const j = a.findIndex((x) => x.key === 'ttss');
  if (i >= 0 && j >= 0) [a[i], a[j]] = [a[j], a[i]];
  return a;
})();
const rim = DISP.map((_, i) => pt(i, 1));
const mid = (i: number): [number, number] => {
  const a = rim[i];
  const b = rim[(i + 1) % N];
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
};
const kite = (i: number): string => {
  const v = rim[i];
  const p = mid((i - 1 + N) % N);
  const n = mid(i);
  return `M${CX},${CY}L${f1(p[0])},${f1(p[1])}L${f1(v[0])},${f1(v[1])}L${f1(n[0])},${f1(n[1])} Z`;
};

export function Radar() {
  const view = views.famCombo;
  const groups = useMemo(
    () =>
      view.groups
        .filter((g) => g.hjudged >= meta.minJudged && g.scoreAdj !== null)
        .sort((a, b) => b.hjudged - a.hjudged)
        .slice(0, 8)
        .sort((a, b) => (b.scoreAdj ?? -1) - (a.scoreAdj ?? -1)),
    [view],
  );
  const [hot, setHot] = useState<string | null>(null);
  const [sharedHot] = useSharedHot();
  const effHot = hot ?? groups.find((g) => g.label === sharedHot)?.id ?? null;

  const norm = (g: ScoreGroup, k: AxisKey): number | null => {
    const q = position(g.adj[k], view.pool[k], k);
    // Better outward: no mirroring, so a vertex near the rim is better on every spoke.
    return q === null ? null : 0.06 + (0.88 * (q + 1)) / 2;
  };

  const ring = (f: number): string => `${AXES.map((_, i) => `${i ? 'L' : 'M'}${f1(pt(i, f)[0])},${f1(pt(i, f)[1])}`).join(' ')} Z`;
  const poolPt = pt(0, 0.5);
  const show = groups.find((g) => g.id === effHot) ?? groups[0];

  return (
    <div>
      <svg
        viewBox="0 0 600 470"
        className="h-auto w-full"
        role="img"
        aria-label="Radar of the top family pairings: ten axes, higher-is-better first, middle ring is the pool, outward is better"
        onMouseLeave={() => setHot(null)}
      >
        {DISP.map((a, i) => (
          <path
            key={`bg-${a.key}`}
            d={kite(i)}
            fill={a.hi ? 'var(--chart-2)' : 'var(--chart-5)'}
            fillOpacity={0.07}
            style={{ pointerEvents: 'none' }}
            data-bg={a.hi ? 'hi' : 'lo'}
          />
        ))}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <path
            key={f}
            d={ring(f)}
            fill="none"
            stroke="var(--foreground)"
            opacity={f === 1 ? 0.25 : 0.12}
            style={{ pointerEvents: 'none' }}
          />
        ))}
        <text x={f1(poolPt[0])} y={f1(poolPt[1] - 5)} textAnchor="middle" fontSize={10} fill="var(--foreground)" opacity={0.6}>
          pool
        </text>
        {DISP.map((a, i) => {
          const q = pt(i, 1);
          const o = pt(i, 1.16);
          const primary = i < BAND_N;
          return (
            <g key={a.key} style={{ pointerEvents: 'none' }}>
              <line
                x1={CX}
                y1={CY}
                x2={f1(q[0])}
                y2={f1(q[1])}
                stroke={a.hi ? 'var(--chart-2)' : 'var(--chart-5)'}
                opacity={primary ? 0.35 : 0.2}
              />
              <text
                x={f1(o[0])}
                y={f1(o[1] + 4)}
                textAnchor="middle"
                fontSize={12}
                fill={a.hi ? 'var(--chart-2)' : 'var(--chart-5)'}
                opacity={1}
                fontWeight={primary ? 600 : undefined}
                fontFamily="Inconsolata, monospace"
                data-dir={a.hi ? 'hi' : 'lo'}
              >
                {LABELS[a.key]}
              </text>
            </g>
          );
        })}
        {groups.map((g, gi) => {
          const def = DISP.map((a, ai) => {
            const f = norm(g, a.key);
            return f === null ? null : pt(ai, f);
          });
          const pts = def.filter((q): q is [number, number] => q !== null);
          const emph = groups.length > 1 ? 1 - (0.72 * gi) / (groups.length - 1) : 1;
          const op = effHot !== null && effHot !== g.id ? 0.12 : effHot === g.id ? 1 : emph;
          const col = famFill(g.hue);
          return (
            <g key={g.id}>
              <title>{`${g.label} — score ${g.scoreAdj?.toFixed(0) ?? '—'} / 100`}</title>
              {pts.length >= 3 && (
                <path
                  d={`${pts.map((q, i) => `${i ? 'L' : 'M'}${f1(q[0])},${f1(q[1])}`).join(' ')} Z`}
                  fill={col}
                  fillOpacity={0.12}
                  stroke={col}
                  strokeWidth={1.5}
                  style={{ opacity: op, cursor: 'pointer', transition: 'opacity 200ms ease' }}
                  onMouseEnter={() => setHot(g.id)}
                />
              )}
              {def.map((q, ai) =>
                q === null ? null : (
                  <circle
                    key={ai}
                    cx={f1(q[0])}
                    cy={f1(q[1])}
                    r={3.5}
                    fill={col}
                    stroke="var(--card)"
                    strokeWidth={1}
                    style={{ opacity: op, cursor: 'pointer', transition: 'opacity 200ms ease' }}
                    onMouseEnter={() => setHot(g.id)}
                  />
                ),
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 flex items-center justify-center gap-2 text-center font-mono text-xs">
        {show && (
          <>
            <span className="inline-block size-2.5" style={{ background: famFill(show.hue) }} />
            <span>
              {show.label} · {show.scoreAdj?.toFixed(0) ?? '—'} / 100
            </span>
          </>
        )}
      </p>
    </div>
  );
}
