import { Reveal } from '@/lib/reveal';
import { contributorCount, fmtInt, meta, plural, rankedFamPairCount, topFamPairShare } from '@/lib/score';

// Revisit this prose once the pool is no longer small and lopsided (roughly: contributors in the
// dozens, or the largest pairing's share under half). The numbers below are live; the framing is not.
const poolSentence =
  typeof meta.judged === 'number' && contributorCount !== null && topFamPairShare !== null
    ? `${fmtInt(meta.judged)} cycles from ${contributorCount} ${plural(contributorCount, 'contributor', 'contributors')}, across ${rankedFamPairCount} family pairings — ${topFamPairShare}% of them from one pairing.`
    : 'A small pool, unevenly spread across pairings.';

const SHORTFALLS: Array<[string, string]> = [
  [
    'Observational, not controlled',
    'The developers who run one pairing are not the developers who run another, and they are not working the same tasks. Skill, repo and task difficulty can move a score as much as the models do. “Ranked by what ships” is a correlation. Read it as one.',
  ],
  [
    'Small, and uneven',
    `${poolSentence} Groups near the ten-cycle floor are shrunk toward the pool, which guards against flukes but does not stand in for evidence. Two scores a point or two apart are a tie.`,
  ],
  ['Self-selected', 'Everyone in the pool installed a plugin and left sharing on. The ranking says nothing about developers who did not.'],
  [
    'Shipped is a floor, not a grade',
    'A commit means the work landed. It does not mean it survived review, was never reverted, or was any good.',
  ],
];

const RESPONSES: Array<[string, string]> = [
  [
    'More histories',
    'Every new contributor puts the same pairings in front of different developers, repos and tasks. That is what lets a pairing’s effect separate from the developer’s. The scale and the shrinkage were built for a bigger pool; the pool is what is missing.',
  ],
  [
    'If that is not enough',
    'The pool has one thing going for it: everyone in it is a developer running OpenCode on real work — the population this ranking is for. That does not fix the task and skill mix, but a different approach can start from it. If more histories do not settle the picture, the method changes, and this page will say what changed.',
  ],
];

export function Caveats() {
  return (
    <section id="caveats" className="scroll-mt-12">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <p className="font-mono text-xs text-primary">where it falls short</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">A hypothesis to try, not a verdict</h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            Pragmatikos reads sessions after the fact. Nobody assigned pairings to developers or tasks, so the ranking says which setups
            shipped for the people who ran them — not which setup would ship for you. Here is where that bites, and what we intend to do
            about it.
          </p>
        </Reveal>
        <div className="mt-6 grid items-start gap-8 md:grid-cols-[7fr_4fr]">
          <div className="flex flex-col gap-3">
            {SHORTFALLS.map(([title, body], i) => (
              <Reveal key={title} delay={i * 70} y={16}>
                <div className="border-border bg-card border p-4">
                  <p className="font-mono text-sm font-semibold">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {RESPONSES.map(([title, body], i) => (
              <Reveal key={title} delay={120 + i * 70} y={16}>
                <div className="border-primary bg-card border p-4">
                  <p className="font-mono text-sm font-semibold text-primary">{title}</p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{body}</p>
                  {title === 'More histories' && (
                    <a href="#contribute" className="mt-2 inline-block text-sm underline underline-offset-4 hover:opacity-80">
                      Share your sessions →
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
