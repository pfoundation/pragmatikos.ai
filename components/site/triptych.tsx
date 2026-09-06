'use client';

import { useInView } from '@/lib/reveal';

const MONO = 'Inconsolata, monospace';

function LabScene ( { play }: { play: boolean; } ) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={ `anim h-auto w-full ${ play ? 'play' : '' }` }
      role="img"
      aria-label="A task card passing a hidden test"
    >
      <rect x={ 40 } y={ 30 } width={ 280 } height={ 150 } fill="var(--card)" stroke="var(--border)" strokeWidth={ 1.5 } />
      <text x={ 58 } y={ 58 } fontSize={ 13 } fill="var(--foreground)" fontFamily={ MONO }>
        task_0042.py
      </text>
      { [ 0, 1, 2 ].map( ( i ) => (
        <rect
          key={ i }
          x={ 58 }
          y={ 76 + i * 24 }
          width={ 244 - i * 52 }
          height={ 9 }
          fill="var(--muted-foreground)"
          opacity={ 0.35 }
          className="growx"
          style={ { '--d': `${ 200 + i * 180 }ms` } as React.CSSProperties }
        />
      ) ) }
      <rect
        x={ 40 }
        y={ 196 }
        width={ 280 }
        height={ 40 }
        fill="none"
        stroke="var(--muted-foreground)"
        strokeWidth={ 1.5 }
        strokeDasharray="6 4"
        className="fadein"
        style={ { '--d': '800ms' } as React.CSSProperties }
      />
      <text
        x={ 58 }
        y={ 221 }
        fontSize={ 13 }
        fill="var(--muted-foreground)"
        fontFamily={ MONO }
        className="fadein"
        style={ { '--d': '800ms' } as React.CSSProperties }
      >
        hidden test · unseen
      </text>
      <path
        d="M 258 196 L 278 218 L 308 182"
        fill="none"
        stroke="var(--chart-2)"
        strokeWidth={ 6 }
        className="draw"
        style={ { '--len': 80, '--d': '1100ms' } as React.CSSProperties }
      />
      <g className="fadein" style={ { '--d': '1500ms' } as React.CSSProperties }>
        <rect x={ 218 } y={ 238 } width={ 102 } height={ 30 } fill="none" stroke="var(--primary)" strokeWidth={ 2 } transform="rotate(-4 269 253)" />
        <text
          x={ 269 }
          y={ 259 }
          textAnchor="middle"
          fontSize={ 15 }
          fontWeight={ 600 }
          fill="var(--primary)"
          fontFamily={ MONO }
          transform="rotate(-4 269 253)"
        >
          PASS
        </text>
      </g>
    </svg>
  );
}

const BARS = [
  { label: 'Model A', w: 250, tok: '24T', tag: '$0.03' },
  { label: 'Model B', w: 185, tok: '12T', tag: null },
  { label: 'Model C', w: 140, tok: '9T', tag: null },
  { label: 'Model D', w: 88, tok: '3T', tag: null },
];

function CrowdScene ( { play }: { play: boolean; } ) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={ `anim h-auto w-full ${ play ? 'play' : '' }` }
      role="img"
      aria-label="Token ranking led by the cheapest model"
    >
      <text x={ 20 } y={ 30 } fontSize={ 12 } fill="var(--muted-foreground)" fontFamily={ MONO }>
        tokens this week
      </text>
      { BARS.map( ( b, i ) => (
        <g key={ b.label }>
          <text x={ 20 } y={ 70 + i * 52 } fontSize={ 12 } fill="var(--foreground)" fontFamily={ MONO }>
            { b.label }
          </text>
          <rect
            x={ 20 }
            y={ 80 + i * 52 }
            width={ b.w }
            height={ 22 }
            fill={ i === 0 ? 'var(--primary)' : 'var(--muted-foreground)' }
            opacity={ i === 0 ? 0.9 : 0.45 }
            className="growx"
            style={ { '--d': `${ 200 + i * 200 }ms` } as React.CSSProperties }
          />
          <text
            x={ 30 + b.w }
            y={ 97 + i * 52 }
            fontSize={ 12 }
            fill="var(--muted-foreground)"
            fontFamily={ MONO }
            className="fadein"
            style={ { '--d': `${ 500 + i * 200 }ms` } as React.CSSProperties }
          >
            { b.tok }
          </text>
          { b.tag && (
            <g className="fadein" style={ { '--d': '1100ms' } as React.CSSProperties }>
              <rect x={ 200 } y={ 52 } width={ 118 } height={ 24 } fill="var(--card)" stroke="var(--primary)" strokeWidth={ 1.5 } />
              <text x={ 259 } y={ 69 } textAnchor="middle" fontSize={ 12 } fill="var(--primary)" fontFamily={ MONO }>
                { b.tag } / session
              </text>
              <line x1={ 259 } y1={ 76 } x2={ 259 } y2={ 80 } stroke="var(--primary)" strokeWidth={ 1.5 } />
              <circle
                cx={ 259 }
                cy={ 91 }
                r={ 5 }
                fill="none"
                stroke="var(--primary)"
                strokeWidth={ 2 }
                className="pulse-dot"
                style={ { '--d': '1100ms' } as React.CSSProperties }
              />
            </g>
          ) }
        </g>
      ) ) }
    </svg>
  );
}

function RecorderScene ( { play }: { play: boolean; } ) {
  return (
    <svg
      viewBox="0 0 360 280"
      className={ `anim h-auto w-full ${ play ? 'play' : '' }` }
      role="img"
      aria-label="Session record correlated with commits that confirm shipping"
    >
      <text x={ 20 } y={ 30 } fontSize={ 12 } fill="var(--muted-foreground)" fontFamily={ MONO }>
        session record
      </text>
      <text x={ 216 } y={ 30 } fontSize={ 12 } fill="var(--muted-foreground)" fontFamily={ MONO }>
        commits · confirmation
      </text>
      { [ 52, 84, 118, 150, 182 ].map( ( y, i ) => (
        <line
          key={ y }
          x1={ 20 }
          x2={ 52 }
          y1={ y }
          y2={ y }
          stroke="var(--muted-foreground)"
          strokeWidth={ 3 }
          className="fadein"
          style={ { '--d': `${ 200 + i * 160 }ms` } as React.CSSProperties }
        />
      ) ) }
      <line
        x1={ 250 }
        y1={ 40 }
        x2={ 250 }
        y2={ 250 }
        stroke="var(--border)"
        strokeWidth={ 3 }
        className="draw"
        style={ { '--len': 220, '--d': '200ms' } as React.CSSProperties }
      />
      <path
        d="M 250 118 C 250 150, 180 132, 180 164 L 180 182"
        fill="none"
        stroke="var(--border)"
        strokeWidth={ 3 }
        className="draw"
        style={ { '--len': 120, '--d': '700ms' } as React.CSSProperties }
      />
      { [
        { y: 70, d: 500, hot: false },
        { y: 118, d: 800, hot: false },
        { y: 182, d: 1100, hot: true },
        { y: 230, d: 1350, hot: false },
      ].map( ( c ) => (
        <g key={ c.y }>
          <circle
            cx={ 250 }
            cy={ c.y }
            r={ c.hot ? 9 : 6.5 }
            fill={ c.hot ? 'var(--primary)' : 'var(--card)' }
            stroke={ c.hot ? 'var(--primary)' : 'var(--muted-foreground)' }
            strokeWidth={ 2.5 }
            className="pop"
            style={ { '--d': `${ c.d }ms` } as React.CSSProperties }
          />
          { c.hot && (
            <circle
              cx={ 250 }
              cy={ c.y }
              r={ 15 }
              fill="none"
              stroke="var(--primary)"
              strokeWidth={ 1.5 }
              className="pulse-dot"
              style={ { '--d': `${ c.d }ms` } as React.CSSProperties }
            />
          ) }
        </g>
      ) ) }
      <circle
        cx={ 180 }
        cy={ 164 }
        r={ 6 }
        fill="var(--card)"
        stroke="var(--muted-foreground)"
        strokeWidth={ 2.5 }
        className="pop"
        style={ { '--d': '1000ms' } as React.CSSProperties }
      />
      <path
        d="M 56 150 L 236 178"
        stroke="var(--primary)"
        strokeWidth={ 1.5 }
        strokeDasharray="4 3"
        className="draw"
        style={ { '--len': 200, '--d': '1300ms' } as React.CSSProperties }
      />
      <text
        x={ 272 }
        y={ 186 }
        fontSize={ 12 }
        fill="var(--primary)"
        fontFamily={ MONO }
        className="fadein"
        style={ { '--d': '1500ms' } as React.CSSProperties }
      >
        shipped
      </text>
      <text
        x={ 20 }
        y={ 262 }
        fontSize={ 12 }
        fill="var(--muted-foreground)"
        fontFamily={ MONO }
        className="fadein"
        style={ { '--d': '1600ms' } as React.CSSProperties }
      >
        correlated: record × commits
      </text>
    </svg>
  );
}

const PANELS = [
  {
    kicker: 'question 01 · the lab',
    title: 'Benchmarks ask: how capable is this model?',
    body: 'SWE-bench, Terminal-bench, Aider, LMArena. Controlled tasks, hidden tests, preference votes — the best way to compare models on equal footing and know each model’s ceiling.',
    signal: 'pass rate · votes',
    blind: 'One model, a clean task, nobody steering.',
    Scene: LabScene,
    bg: 'bg-card',
  },
  {
    kicker: 'question 02 · the crowd',
    title: 'Usage rankings ask: what is the market using?',
    body: 'OpenCode Data, OpenRouter Ranking. Tokens, users, retention, dollars per session — the best way to see adoption and where the mix is shifting.',
    signal: 'tokens · users · $/session',
    blind: 'Popular is not productive — and still one model at a time.',
    Scene: CrowdScene,
    bg: 'bg-muted',
  },
  {
    kicker: 'question 03 · the recorder',
    title: 'Pragmatikos asks: what ships in real work?',
    body: 'Turns, phases, edits and errors from real sessions, correlated with what shipped. The one instrument that scores the setups developers actually run.',
    signal: 'session record × shipped outcomes',
    blind: 'Anything it never saw. Observational, not a benchmark.',
    Scene: RecorderScene,
    bg: 'bg-card',
  },
];

function Panel ( { p }: { p: ( typeof PANELS )[ number ]; } ) {
  const [ ref, inView ] = useInView<HTMLDivElement>( 0.55 );
  return (
    <div className="h-[150svh]">
      <div ref={ ref } className={ `border-border sticky top-[50px] flex h-[calc(100svh-50px)] items-center overflow-hidden border-y ${ p.bg }` }>
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-6 md:grid-cols-2 md:gap-10">
          <div>
            <p className="font-mono text-xs text-primary">{ p.kicker }</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-4xl">{ p.title }</h3>
            <p className="text-muted-foreground mt-4 max-w-lg leading-relaxed">{ p.body }</p>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="font-mono text-muted-foreground w-20 shrink-0 text-xs">signal</dt>
                <dd className="font-mono text-xs">{ p.signal }</dd>
              </div>
              <div className="flex gap-3">
                <dt className="font-mono text-muted-foreground w-20 shrink-0 text-xs">blind spot</dt>
                <dd className="text-sm">{ p.blind }</dd>
              </div>
            </dl>
          </div>
          <div className="mx-auto w-full max-w-[300px] md:max-w-md">
            <p.Scene play={ inView } />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Triptych () {
  return (
    <section id="why" className="scroll-mt-12">
      <div className="mx-auto max-w-6xl px-6 pt-16 pb-4">
        <p className="font-mono text-xs text-primary">why it exists</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Three questions. Three instruments.</h2>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
          The first two are useful and stay useful. Developers choosing a model and a workflow are missing the third answer.
        </p>
      </div>
      { PANELS.map( ( p ) => (
        <Panel key={ p.kicker } p={ p } />
      ) ) }
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <p className="text-2xl font-semibold tracking-tight md:text-4xl">Capable. Popular. Effective.</p>
          <p className="mt-3 text-sm md:text-base">Only one of them has a row for the setup you actually run.</p>
        </div>
      </div>
    </section>
  );
}
