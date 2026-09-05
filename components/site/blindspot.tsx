'use client';

import { Reveal, useCountUp, useInView } from '@/lib/reveal';
import { meta, views, type ScoreGroup } from '@/lib/score';

const MONO = 'Inconsolata, monospace';

type Node = { x: number; y: number; t: 'you' | 'reply' | 'plan' | 'commit' | 'dead'; label?: string };

const leftNodes = (turns: number): Node[] => [
  { x: 230, y: 30, t: 'you', label: 'turn 1' },
  { x: 165, y: 88, t: 'reply' },
  { x: 295, y: 88, t: 'reply' },
  { x: 230, y: 142, t: 'plan', label: 'plan' },
  { x: 140, y: 200, t: 'reply' },
  { x: 230, y: 200, t: 'reply' },
  { x: 320, y: 200, t: 'reply' },
  { x: 230, y: 258, t: 'you', label: `turn ${turns}` },
  { x: 230, y: 318, t: 'commit', label: 'shipped' },
];
const LEFT_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [3, 4],
  [3, 5],
  [3, 6],
  [4, 7],
  [5, 7],
  [6, 7],
  [7, 8],
];

const rightNodes = (turns: number): Node[] => [
  { x: 690, y: 30, t: 'you', label: 'turn 1' },
  { x: 600, y: 86, t: 'reply' },
  { x: 690, y: 86, t: 'reply' },
  { x: 780, y: 86, t: 'reply' },
  { x: 635, y: 144, t: 'you', label: `turn ${Math.round(turns * 0.3)}` },
  { x: 745, y: 144, t: 'reply' },
  { x: 580, y: 206, t: 'reply' },
  { x: 680, y: 206, t: 'you', label: `turn ${Math.round(turns * 0.7)}` },
  { x: 785, y: 206, t: 'reply' },
  { x: 690, y: 268, t: 'you', label: `turn ${turns}` },
  { x: 690, y: 322, t: 'dead', label: 'unshipped' },
];
const RIGHT_EDGES: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [1, 4],
  [2, 4],
  [2, 5],
  [3, 5],
  [4, 6],
  [4, 7],
  [5, 7],
  [5, 8],
  [6, 9],
  [7, 9],
  [8, 9],
  [9, 10],
];

function TreeNode({ n, d }: { n: Node; d: number }) {
  const style = { '--d': `${d}ms` } as React.CSSProperties;
  if (n.t === 'you') {
    return (
      <g className="pop" style={style}>
        <rect x={n.x - 8} y={n.y - 8} width={16} height={16} fill="var(--primary)" />
        {n.label && (
          <text x={n.x + 16} y={n.y + 4} fontSize={12} fill="var(--muted-foreground)" fontFamily={MONO}>
            {n.label}
          </text>
        )}
      </g>
    );
  }
  if (n.t === 'reply') {
    return (
      <circle cx={n.x} cy={n.y} r={7} fill="var(--card)" stroke="var(--muted-foreground)" strokeWidth={2} className="pop" style={style} />
    );
  }
  if (n.t === 'plan') {
    return (
      <g className="pop" style={style}>
        <circle cx={n.x} cy={n.y} r={10} fill="none" stroke="var(--primary)" strokeWidth={2} strokeDasharray="4 3" />
        {n.label && (
          <text x={n.x + 18} y={n.y + 4} fontSize={12} fill="var(--primary)" fontFamily={MONO}>
            {n.label}
          </text>
        )}
      </g>
    );
  }
  if (n.t === 'commit') {
    return (
      <g>
        <circle cx={n.x} cy={n.y} r={16} fill="none" stroke="var(--chart-2)" strokeWidth={1.5} className="pulse-dot" style={style} />
        <g className="pop" style={style}>
          <rect x={n.x - 9} y={n.y - 9} width={18} height={18} fill="var(--chart-2)" />
          {n.label && (
            <text x={n.x + 20} y={n.y + 4} fontSize={12} fontWeight={600} fill="var(--chart-2)" fontFamily={MONO}>
              {n.label}
            </text>
          )}
        </g>
      </g>
    );
  }
  return (
    <g className="pop" style={style} opacity={0.7}>
      <line x1={n.x - 7} y1={n.y - 7} x2={n.x + 7} y2={n.y + 7} stroke="var(--muted-foreground)" strokeWidth={2.5} />
      <line x1={n.x - 7} y1={n.y + 7} x2={n.x + 7} y2={n.y - 7} stroke="var(--muted-foreground)" strokeWidth={2.5} />
      {n.label && (
        <text x={n.x + 18} y={n.y + 4} fontSize={12} fill="var(--muted-foreground)" fontFamily={MONO}>
          {n.label}
        </text>
      )}
    </g>
  );
}

function Tree({ nodes, edges, offset }: { nodes: Node[]; edges: [number, number][]; offset: number }) {
  return (
    <g>
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="var(--border)"
          strokeWidth={1.5}
          className="draw"
          style={{ '--len': 90, '--d': `${offset + i * 70}ms` } as React.CSSProperties}
        />
      ))}
      {nodes.map((n, i) => (
        <TreeNode key={i} n={n} d={offset + 150 + i * 90} />
      ))}
    </g>
  );
}

/** Same builder under two planners with the widest ship-rate spread. */
function storyPair(): [ScoreGroup, ScoreGroup] {
  const eligible = views.modelCombo.groups.filter((g) => g.hjudged >= meta.minJudged);
  const byBuild = new Map<string, ScoreGroup[]>();
  for (const g of eligible) {
    const build = g.label.split(' → ')[1] ?? g.label;
    const list = byBuild.get(build) ?? [];
    list.push(g);
    byBuild.set(build, list);
  }
  let best: [ScoreGroup, ScoreGroup] | null = null;
  let spread = -1;
  for (const list of byBuild.values()) {
    const planners = new Set(list.map((g) => g.label));
    if (planners.size < 2) continue;
    const sorted = [...list].sort((a, b) => (b.raw.shipr ?? 0) - (a.raw.shipr ?? 0));
    const s = (sorted[0].raw.shipr ?? 0) - (sorted[sorted.length - 1].raw.shipr ?? 0);
    if (s > spread) {
      spread = s;
      best = [sorted[0], sorted[sorted.length - 1]];
    }
  }
  return best ?? [views.modelCombo.groups[0], views.modelCombo.groups[1]];
}

export function Blindspot() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  const [good, bad] = storyPair();
  const turnsA = Math.round(good.raw.ttss ?? 0);
  const turnsB = Math.round(bad.raw.ttss ?? 0);
  const left = useCountUp(turnsA, inView, 1400);
  const right = useCountUp(turnsB, inView, 2000);
  const chips: [string, string][] = [
    ['ship rate', `${good.raw.shipr?.toFixed(0)}% vs ${bad.raw.shipr?.toFixed(0)}%`],
    ['turns to ship', `${good.raw.ttss?.toFixed(1)} vs ${bad.raw.ttss?.toFixed(1)}`],
    ['same builder', `${((good.raw.shipr ?? 0) / Math.max(bad.raw.shipr ?? 1, 0.01)).toFixed(1)}× the ship rate`],
  ];

  return (
    <section id="proof" className="bg-card border-border scroll-mt-12 border-y">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs text-primary">the blind spot both miss</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Same builder. Different planner. Opposite results.</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            The build model is identical. One planner got it to a commit in a few turns; the other burned dozens and shipped nothing. A
            model ranking can&apos;t see this. A pairing ranking can.
          </p>
        </Reveal>
        <div ref={ref} className="mt-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-center">
              <p className="truncate font-mono text-sm">{good.label}</p>
              <p className="font-mono mt-1 text-4xl font-semibold text-[var(--chart-2)]">
                {Math.round(left)}
                <span className="text-muted-foreground text-lg"> turns</span>
              </p>
            </div>
            <div className="text-center">
              <p className="truncate font-mono text-sm">{bad.label}</p>
              <p className="text-muted-foreground font-mono mt-1 text-4xl font-semibold">
                {Math.round(right)}
                <span className="text-lg"> turns</span>
              </p>
            </div>
          </div>
          <svg
            viewBox="0 0 920 360"
            className={`anim mt-2 h-auto w-full ${inView ? 'play' : ''}`}
            role="img"
            aria-label={`Two runs: one planned reaching a commit in ${turnsA} turns, one unplanned sprawling over ${turnsB} turns unshipped`}
          >
            <line x1={460} y1={10} x2={460} y2={350} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 4" />
            <Tree nodes={leftNodes(turnsA)} edges={LEFT_EDGES} offset={0} />
            <Tree nodes={rightNodes(turnsB)} edges={RIGHT_EDGES} offset={500} />
          </svg>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {chips.map(([k, v]) => (
              <span
                key={k}
                className="bg-secondary text-secondary-foreground max-w-full px-2.5 py-1 text-center font-mono text-xs leading-relaxed"
              >
                {k}: {v}
              </span>
            ))}
          </div>
          <p className="text-muted-foreground mt-4 text-center font-mono text-xs">
            Real sessions. Unshipped work counts against the model.
          </p>
        </div>
      </div>
    </section>
  );
}
