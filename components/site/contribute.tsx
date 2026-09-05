'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Reveal, useInView } from '@/lib/reveal';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const LINES = [
  { text: '$ git clone https://github.com/pfoundation/ocInsights.git', out: false },
  { text: '$ cd ocInsights && make install-plugin', out: false },
  { text: '# restart opencode, then open', out: false },
  { text: '$ open http://127.0.0.1:4173/', out: false },
  { text: '→ your card is ready', out: true },
  { text: '$ make contribute-preview && make contribute', out: false },
  { text: '→ pooled into the ranking', out: true },
];

const STEPS = [
  ['Run it locally', 'Clone ocInsights, make install-plugin, open the deck — your card is computed where the work happened.'],
  ['Check your card', 'One number per model and per planner → builder pair.'],
  [
    'Share the numbers',
    'One history is anecdote; pooled histories are evidence. Run make contribute — twenty fields per cycle, nothing else.',
  ],
] as const;

function Terminal() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [chars, setChars] = useState(0);
  const total = LINES.reduce((t, l) => t + l.text.length + 1, 0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setChars(total);
      return;
    }
    const id = setInterval(() => {
      setChars((c) => {
        if (c >= total) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, 14);
    return () => clearInterval(id);
  }, [inView, total]);

  let used = 0;
  return (
    <div ref={ref}>
      <Card className="bg-[var(--shell-deep)]">
        <CardContent className="p-5">
          <div className="mb-3 flex gap-1.5" aria-hidden>
            <span className="bg-muted-foreground/40 inline-block size-2.5" />
            <span className="bg-muted-foreground/40 inline-block size-2.5" />
            <span className="bg-primary inline-block size-2.5" />
          </div>
          <div className="min-h-[148px] font-mono text-[13px] leading-7">
            {LINES.map((l, i) => {
              const start = used;
              used += l.text.length + 1;
              const slice = l.text.slice(0, Math.max(0, Math.min(l.text.length, chars - start)));
              const done = chars - start >= l.text.length;
              return (
                <p key={i} className={l.out ? 'text-[var(--chart-2)]' : ''}>
                  {slice}
                  {!done && chars - start >= 0 && <span className="caret-blink">▍</span>}
                </p>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function Contribute() {
  return (
    <section id="contribute" className="bg-blueprint scroll-mt-12">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 py-16 md:grid-cols-2">
        <Reveal>
          <p className="font-mono text-xs text-primary">contribute</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Make the ranking yours to trust</h2>
          <ol className="mt-6 space-y-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-2xl font-semibold text-primary">{i + 1}</span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild>
              <a href="https://github.com/pfoundation/ocInsights#contributing-your-data" target="_blank" rel="noreferrer">
                Share your numbers
                <ArrowUpRight />
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://github.com/pfoundation/ocInsights" target="_blank" rel="noreferrer">
                ocInsights on GitHub
                <ArrowUpRight />
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            Twenty fields per cycle — day, models, turns, edits, cost, shipping. No paths, prompts, session ids or projects. Preview with
            make contribute-preview before anything leaves your machine.
          </p>
        </Reveal>
        <Terminal />
      </div>
    </section>
  );
}
