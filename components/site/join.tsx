import { Button } from '@/components/ui/button';
import { Reveal } from '@/lib/reveal';

export function Join() {
  return (
    <section id="join" className="bg-primary text-primary-foreground scroll-mt-12">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <p className="font-mono text-xs opacity-80">join in</p>
          <p className="mt-2 max-w-3xl text-xl font-semibold tracking-tight md:text-2xl">
            This is a first answer, not the final one. It&apos;s built from the sessions developers have shared so far. The more histories
            in the pool, the harder the ranking gets to argue with.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button variant="secondary" size="lg" asChild>
              <a href="#contribute">Share your sessions</a>
            </Button>
            <a href="#anatomy" className="text-sm underline underline-offset-4 hover:opacity-80">
              How the score works →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
