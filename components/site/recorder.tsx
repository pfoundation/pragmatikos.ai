'use client';

import { Reveal, useInView } from '@/lib/reveal';

const MONO = 'Inconsolata, monospace';

const TICKS_A = [120, 150, 185, 215, 250, 285];
const TICKS_B = [410, 445, 480, 515, 550];
const TURNS = [120, 205, 290];

export function Recorder() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);

  return (
    <section id="recorder" className="bg-card border-border scroll-mt-12 border-y">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs text-primary">two records, correlated</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">The session record comes first</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            Every turn, plan and build phase, edit, tool error and dollar is read from the agent&apos;s own record — that is where every
            axis is measured. Commits only decide which cycles count as shipped: a window from the previous commit, file overlap decides
            credit, active-but-absent sessions advised only.
          </p>
        </Reveal>
        <div ref={ref} className="mt-6">
          <svg
            viewBox="0 0 900 320"
            className={`anim h-auto w-full ${inView ? 'play' : ''}`}
            role="img"
            aria-label="Session record with turns and edits correlated against commit windows"
          >
            <text x={20} y={30} fontSize={12} fill="var(--muted-foreground)" fontFamily={MONO}>
              session record
            </text>
            <text x={660} y={30} fontSize={12} fill="var(--muted-foreground)" fontFamily={MONO}>
              plan → build phases
            </text>
            <g className="fadein" style={{ '--d': '600ms' } as React.CSSProperties}>
              <rect x={648} y={42} width={58} height={24} fill="none" stroke="var(--primary)" strokeWidth={1.5} strokeDasharray="4 3" />
              <text x={677} y={58} textAnchor="middle" fontSize={11} fill="var(--primary)" fontFamily={MONO}>
                plan
              </text>
              <rect x={712} y={42} width={62} height={24} fill="none" stroke="var(--muted-foreground)" strokeWidth={1.5} />
              <text x={743} y={58} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)" fontFamily={MONO}>
                build
              </text>
            </g>
            {TURNS.map((x, i) => (
              <rect
                key={x}
                x={x - 7}
                y={44}
                width={14}
                height={14}
                fill="var(--primary)"
                className="pop"
                style={{ '--d': `${150 + i * 140}ms` } as React.CSSProperties}
              />
            ))}
            <text
              x={120}
              y={76}
              fontSize={11}
              fill="var(--primary)"
              fontFamily={MONO}
              className="fadein"
              style={{ '--d': '500ms' } as React.CSSProperties}
            >
              human turns
            </text>
            {TICKS_A.map((x, i) => (
              <line
                key={x}
                x1={x}
                x2={x}
                y1={92}
                y2={118}
                stroke="var(--primary)"
                strokeWidth={4}
                className="fadein"
                style={{ '--d': `${350 + i * 100}ms` } as React.CSSProperties}
              />
            ))}
            {TICKS_B.map((x, i) => (
              <line
                key={x}
                x1={x}
                x2={x}
                y1={92}
                y2={118}
                stroke="var(--muted-foreground)"
                strokeWidth={4}
                opacity={0.5}
                className="fadein"
                style={{ '--d': `${450 + i * 100}ms` } as React.CSSProperties}
              />
            ))}
            <text
              x={120}
              y={136}
              fontSize={11}
              fill="var(--primary)"
              fontFamily={MONO}
              className="fadein"
              style={{ '--d': '950ms' } as React.CSSProperties}
            >
              edits · same files
            </text>
            <text
              x={410}
              y={136}
              fontSize={11}
              fill="var(--muted-foreground)"
              fontFamily={MONO}
              className="fadein"
              style={{ '--d': '950ms' } as React.CSSProperties}
            >
              edits · other files
            </text>
            <text x={20} y={184} fontSize={12} fill="var(--muted-foreground)" fontFamily={MONO}>
              commits · confirmation
            </text>
            <rect
              x={100}
              y={196}
              width={260}
              height={56}
              fill="var(--primary)"
              opacity={0.08}
              className="growx"
              style={{ '--d': '1000ms' } as React.CSSProperties}
            />
            <rect
              x={390}
              y={196}
              width={270}
              height={56}
              fill="var(--muted-foreground)"
              opacity={0.08}
              className="growx"
              style={{ '--d': '1150ms' } as React.CSSProperties}
            />
            <rect
              x={336}
              y={208}
              width={26}
              height={26}
              fill="var(--primary)"
              className="pop"
              style={{ '--d': '1350ms' } as React.CSSProperties}
            />
            <circle
              cx={349}
              cy={221}
              r={20}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={1.5}
              className="pulse-dot"
              style={{ '--d': '1350ms' } as React.CSSProperties}
            />
            <rect
              x={634}
              y={208}
              width={26}
              height={26}
              fill="var(--card)"
              stroke="var(--muted-foreground)"
              strokeWidth={2}
              className="pop"
              style={{ '--d': '1500ms' } as React.CSSProperties}
            />
            <text
              x={100}
              y={272}
              fontSize={11}
              fill="var(--primary)"
              fontFamily={MONO}
              className="fadein"
              style={{ '--d': '1600ms' } as React.CSSProperties}
            >
              C1 · file overlap → credit
            </text>
            <text
              x={390}
              y={272}
              fontSize={11}
              fill="var(--muted-foreground)"
              fontFamily={MONO}
              className="fadein"
              style={{ '--d': '1700ms' } as React.CSSProperties}
            >
              C2 · advised only → no credit
            </text>
            {[
              [185, 349],
              [250, 349],
            ].map(([x1, x2], i) => (
              <line
                key={i}
                x1={x1}
                x2={x2}
                y1={122}
                y2={204}
                stroke="var(--primary)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                className="draw"
                style={{ '--len': 110, '--d': `${1450 + i * 150}ms` } as React.CSSProperties}
              />
            ))}
            <line x1={60} x2={860} y1={292} y2={292} stroke="var(--border)" strokeWidth={1} />
            {['t−6h', 't−3h', 't'].map((t, i) => (
              <text
                key={t}
                x={100 + i * 260}
                y={292}
                textAnchor="middle"
                dy={-6}
                fontSize={11}
                fill="var(--muted-foreground)"
                fontFamily={MONO}
              >
                {t}
              </text>
            ))}
          </svg>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
            <span className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
              <span className="inline-block h-3 w-1 bg-[var(--primary)]" /> edit landed in commit
            </span>
            <span className="text-muted-foreground flex items-center gap-2 font-mono text-xs">
              <span className="bg-muted-foreground inline-block h-3 w-1 opacity-50" /> active, touched nothing → advised only
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
