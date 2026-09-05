'use client';

import { AXES, TIERS } from '@/lib/score';
import { useEffect, useRef, useState } from 'react';

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
  const outer = useRef<HTMLDivElement | null>(null);
  const [p, setP] = useState(0);
  const [spread, setSpread] = useState(110);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setP(1);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = outer.current;
      if (!el) return;
      const vh = window.innerHeight;
      setSpread(vh < 720 ? 84 : 110);
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - vh);
      setP(Math.min(1, Math.max(0, -rect.top / total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="anatomy" className="scroll-mt-12">
      <div ref={outer} className="relative h-[220svh]">
        <div className="sticky top-[50px] flex h-[calc(100svh-50px)] items-center overflow-hidden">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-6 md:grid-cols-[7fr_4fr]">
            <div>
              <p className="font-mono text-xs text-primary">how the score works · scroll to explode</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Six tiers, ten axes, one weighted mean</h2>
              <div className="relative mt-4 h-[560px] max-h-[62svh] min-h-[440px]">
                <div className="absolute top-1/2 right-0 left-0 border-t border-dashed border-muted-foreground opacity-60" />
                <span className="text-muted-foreground absolute top-1/2 -translate-y-1/2 right-0 font-mono text-[11px]">pool</span>
                {TIERS.map((t, i) => (
                  <div
                    key={t.key}
                    className="bg-card border-border absolute right-0 left-0 border border-l-4 p-3"
                    style={{
                      borderLeftColor: t.color,
                      top: '50%',
                      transform: `translateY(calc(-50% + ${(i - 2.5) * (34 + p * (spread - 34))}px))`,
                      boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                      zIndex: TIERS.length - i,
                    }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{t.label}</p>
                      <p className="text-muted-foreground hidden font-mono text-[11px] sm:block">{t.question}</p>
                    </div>
                    <div style={{ opacity: Math.min(1, Math.max(0, (p - 0.2) / 0.35)) }}>
                      <p className="text-muted-foreground mt-0.5 text-xs">{t.desc}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {t.axes.map((k) => (
                          <span key={k} className="border-border border px-1.5 py-0.5 font-mono text-[11px]">
                            {shortOf(k)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden flex-col gap-3 md:flex">
              {RULES.map(([title, body]) => (
                <div key={title} className="border-primary bg-card border p-4">
                  <p className="font-mono text-sm font-semibold text-primary">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-14 md:hidden">
        <div className="flex flex-col gap-3">
          {RULES.map(([title, body]) => (
            <div key={title} className="border-primary bg-card border p-4">
              <p className="font-mono text-sm font-semibold text-primary">{title}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
