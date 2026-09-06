import { Button } from '@/components/ui/button';
import { Reveal } from '@/lib/reveal';
import { Radar } from './radar';

export function Hero () {
  return (
    <section className="border-border border-b">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-20">
        <Reveal>
          <p className="font-mono text-xs text-primary">For OpenCode 2.0</p>
          <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">Benchmarks pass tests. You ship code.</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed md:text-base">
            A benchmark is a clean task, a hidden test and a single model. Real work is a messy repo, your tools, your steering — and
            increasingly one model planning while another builds. Pragmatikos scores that: every model and every planner → builder pairing,
            on real sessions, by what actually shipped — landed in a git commit.
          </p>
          <p className="text-muted-foreground mt-3 font-mono text-xs">Rankings below are pooled from real developer sessions.</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <a href="#score">See the rankings</a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#contribute">Contribute data</a>
            </Button>
          </div>
        </Reveal>
        <Reveal delay={ 150 } y={ 12 }>
          <Radar />
        </Reveal>
      </div>
    </section>
  );
}
