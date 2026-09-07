'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Reveal, useInView } from '@/lib/reveal';
import { contribSchema } from '@/lib/score';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Display copy of CONTRIB_COLS in ocInsights/plugin/contribute.ts
// (mirrored by pragmaServer/src/validate.ts). A schema bump must update both.
const FIELDS = [
  'cycle_key',
  'day',
  'model',
  'prov',
  'role',
  'pm',
  'pp',
  'bm',
  'bp',
  'u',
  'a',
  'tedits',
  'tpaths',
  'teerr',
  'tcost',
  'tship',
  'thrs',
  'tver',
  'tabort',
  'latmed',
] as const;

const FACTS = [
  ['On by default', 'First send a few minutes after opencode is quiet, then every six hours, only rows that changed.'],
  ['Twenty fields, nothing else', 'No paths, prompts, session ids or hostnames. Preview stays on your machine.'],
] as const;

const STAGES = [
  { label: 'Your sessions', hint: 'local record' },
  { label: '25 fields', hint: 'one row / cycle' },
  { label: 'POST /v1/contribute', hint: contribSchema !== null ? `schema v${contribSchema}` : 'the 25 fields' },
  { label: 'The pool', hint: 'dedup' },
  { label: 'This page', hint: 'pairings ranked' },
] as const;

const MONO = 'Inconsolata, monospace';
const BOX_W = 168;
const BOX_H = 64;
const BOX_Y = 40;
const XS = [40, 253, 466, 679, 892] as const;

function Pipeline() {
  const [ref, inView] = useInView<HTMLDivElement>(0.35);
  return (
    <div ref={ref}>
      <svg
        viewBox="0 0 1100 160"
        className={`anim mt-6 hidden h-auto w-full md:block ${inView ? 'play' : ''}`}
        role="img"
        aria-label="Contribution path: your sessions, twenty-five fields per cycle, POST /v1/contribute, the pool, this page"
      >
        {STAGES.map((s, i) => {
          const x = XS[i];
          const last = i === STAGES.length - 1;
          const first = i === 0;
          return (
            <g key={s.label}>
              {i > 0 ? (
                <line
                  x1={XS[i - 1] + BOX_W}
                  y1={BOX_Y + BOX_H / 2}
                  x2={x}
                  y2={BOX_Y + BOX_H / 2}
                  stroke="var(--border)"
                  strokeWidth={1.5}
                  className="draw"
                  style={{ '--len': 45, '--d': `${80 + (i - 1) * 140}ms` } as React.CSSProperties}
                />
              ) : null}
              <text
                x={x + BOX_W / 2}
                y={BOX_Y - 12}
                textAnchor="middle"
                fontSize={11}
                fill="var(--primary)"
                fontFamily={MONO}
                className="fadein"
                style={{ '--d': `${i * 140}ms` } as React.CSSProperties}
              >
                {i + 1}
              </text>
              <g className="pop" style={{ '--d': `${i * 140}ms` } as React.CSSProperties}>
                <rect
                  x={x}
                  y={BOX_Y}
                  width={BOX_W}
                  height={BOX_H}
                  fill={last ? 'var(--primary)' : 'var(--card)'}
                  fillOpacity={last ? 0.08 : 1}
                  stroke={first || last ? 'var(--primary)' : 'var(--border)'}
                  strokeWidth={1.5}
                />
                <text
                  x={x + BOX_W / 2}
                  y={BOX_Y + 28}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--foreground)"
                  fontFamily={MONO}
                >
                  {s.label}
                </text>
                <text x={x + BOX_W / 2} y={BOX_Y + 48} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)" fontFamily={MONO}>
                  {s.hint}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
      <ol className="mt-6 space-y-4 md:hidden">
        {STAGES.map((s, i) => (
          <li key={s.label} className="flex gap-4">
            <span className="font-mono text-2xl font-semibold text-primary">{i + 1}</span>
            <div>
              <p className="font-semibold">{s.label}</p>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{s.hint}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ContributionFlow() {
  const [open, setOpen] = useState(false);
  return (
    <section id="contribution-flow" aria-labelledby="contribution-flow-toggle" className="border-border scroll-mt-12 border-t">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex justify-center">
          <Button
            id="contribution-flow-toggle"
            variant="outline"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="contribution-flow-panel"
          >
            <span className="font-mono text-xs">how a contribution flows{contribSchema !== null ? ` · schema v${contribSchema}` : ''}</span>
            <ChevronDown className={`transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        {open ? (
          <div id="contribution-flow-panel" role="region" aria-labelledby="contribution-flow-heading" className="pt-10">
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-xs text-primary">how a contribution flows</p>
                {contribSchema !== null ? (
                  <Badge variant="outline" className="font-mono">
                    schema v{contribSchema}
                  </Badge>
                ) : null}
              </div>
              <h2 id="contribution-flow-heading" className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                From your machine to this page
              </h2>
              <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
                The plugin reads your local sessions and sends twenty-five fields per cycle: day, models, effort, harness, turns, edits,
                cost, shipping. This page only ranks the pool.
              </p>
            </Reveal>
            <Pipeline />
            <div className="mt-6 flex flex-wrap gap-1.5">
              {FIELDS.map((f) => (
                <span key={f} className="border-border border px-1.5 py-0.5 font-mono text-[11px]">
                  {f}
                </span>
              ))}
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {FACTS.map(([title, body], i) => (
                <Reveal key={title} delay={i * 80} y={16}>
                  <div className="border-border bg-card h-full border p-4">
                    <p className="font-mono text-sm font-semibold">{title}</p>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
