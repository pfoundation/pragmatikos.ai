'use client';

import { AXES, famFill, meta, position, views, type AxisKey, type ScoreGroup } from '@/lib/score';
import { useSharedHot } from '@/lib/hot';
import { useMemo, useState } from 'react';

/** Deck overall-radar labels, tier order. */
const LABELS: Record<AxisKey, string> = {
  shipr: 'Higher ship %',
  oneshot: 'Higher one-shot %',
  ttss: 'Fewer turns/ship',
  hps: 'Fewer hours/ship',
  dpss: 'Fewer $/ship',
  eerrp: 'Fewer edit errors',
  abortp: 'Fewer aborts',
  verp: 'Higher verified %',
  ept: 'More edits/turn',
  lat: 'Faster steps',
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
        aria-label="Radar of the top family pairings: ten axes, middle ring is the pool, outward is better"
        onMouseLeave={() => setHot(null)}
      >
        <path
          d={`M${CX},${CY}${Array.from({ length: BAND_N }, (_, i) => `L${f1(pt(i, 1)[0])},${f1(pt(i, 1)[1])}`).join('')} Z`}
          fill="var(--primary)"
          fillOpacity={0.07}
          style={{ pointerEvents: 'none' }}
        />
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
        {AXES.map((a, i) => {
          const q = pt(i, 1);
          const o = pt(i, 1.16);
          const primary = i < BAND_N;
          return (
            <g key={a.key} style={{ pointerEvents: 'none' }}>
              <line x1={CX} y1={CY} x2={f1(q[0])} y2={f1(q[1])} stroke="var(--foreground)" opacity={primary ? 0.3 : 0.12} />
              <text
                x={f1(o[0])}
                y={f1(o[1] + 4)}
                textAnchor="middle"
                fontSize={12}
                fill={primary ? 'var(--primary)' : 'var(--foreground)'}
                opacity={primary ? 1 : 0.75}
                fontWeight={primary ? 600 : undefined}
                fontFamily="Inconsolata, monospace"
              >
                {LABELS[a.key]}
              </text>
            </g>
          );
        })}
        {groups.map((g, gi) => {
          const def = AXES.map((a, ai) => {
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
