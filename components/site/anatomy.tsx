'use client';

import { Reveal } from '@/lib/reveal';
import { AXES, TIERS } from '@/lib/score';

const RULES = [
  [
    'Pool-relative',
    'Every axis is a log distance to the pooled average — log odds for rates — on a fixed ×4 span, so ×2 and ÷2 sit the same distance from the line.',
  ],
  ['Evidence-weighted', 'Small groups shrink toward the pool with k = 10 pseudo-cycles. A two-cycle fluke nearly vanishes.'],
  [
    'Failure lowers the rate',
    'Unshipped cycles stay in the ship-rate denominator, so few-turn dead ends can never look good. Turns, hours and dollars are priced per shipped cycle.',
  ],
] as const;

const shortOf = (k: string): string => AXES.find((a) => a.key === k)?.short ?? k;

export function Anatomy() {
  return (
    <section id="anatomy" className="scroll-mt-12">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs text-primary">how the score works</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Six tiers, ten axes, one weighted mean</h2>
        </Reveal>
        <div className="mt-6 grid items-start gap-8 md:grid-cols-[7fr_4fr]">
          <div className="flex flex-col gap-1.5">
            {TIERS.map((t, i) => (
              <Reveal key={t.key} delay={i * 70} y={16}>
                <div className="bg-card border-border border border-l-4 px-3 py-2.5" style={{ borderLeftColor: t.color }}>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm font-semibold">{t.label}</p>
                    <div className="ml-auto flex items-baseline gap-4">
                      <p className="text-muted-foreground hidden font-mono text-[11px] sm:block">{t.question}</p>
                      <p className="text-muted-foreground font-mono text-xs">
                        <span className="sr-only">weight </span>
                        {t.weight}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">{t.desc}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {t.axes.map((k) => (
                      <span key={k} className="border-border border px-1.5 py-0.5 font-mono text-[11px]">
                        {shortOf(k)}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {RULES.map(([title, body], i) => (
              <Reveal key={title} delay={120 + i * 70} y={16}>
                <div className="border-primary bg-card border p-4">
                  <p className="font-mono text-sm font-semibold text-primary">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
