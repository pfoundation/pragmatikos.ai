# AGENTS.md — pragma (Pragmatikos site)

Product site for Pragmatikos, the overall-score reporting tool. The visitor lands on a why-first hero, then the rankings with pooled example output, then an invitation to add their sessions. The site introduces the tool; it is not a showcase of personal data.

## Positioning

- Audience is the individual developer picking a model for their agent, not a team lead.
- The pitch is two ideas: benchmarks measure a different thing than real work, and real setups are planner → builder pairs, not single models.
- "Ship" is the outcome word: the AI's work landed in a git commit. Define it once per surface, never assume it.
- Marketing sections sell the answer (which setups ship), never the method. Technical detail (axes, tiers, log scale, evidence weighting) is confined to How it works.

## Page order

- Hero (benchmarks score models, you run setups + deck-style radar of the top family pairings) → Rankings (planner → builder pairs, Group by Model/Family, default Families, always evidence-weighted) → Join band → Why → Proof → How it works → Two records → Contribute.

## Stack

- Next.js 16 (App Router), React 19, Tailwind v4 (`@tailwindcss/postcss`), Bun
- `output: 'export'` — fully static, deployed to GitHub Pages (`.github/workflows/pages.yml`)
- PF design system as brand DNA (square, burnt amber, Plex Sans + Inconsolata, semantic tokens); creative layer in `app/globals.css` (blueprint grids, SVG scene animations) goes beyond the console kit
- Charts and illustrations: hand-drawn SVG (no chart library), series colors `var(--chart-1)`…`var(--chart-5)`

## Conventions

- 2-space indent, single quotes, `importOrder` relative-last (see `.prettierrc`)
- `font-sans` (IBM Plex Sans) for copy, `font-mono` (Inconsolata) for every machine value
- Everything square (`--radius: 0`); semantic tokens only, no hard-coded palette colors
- Sentence-case copy, no emoji, no lorem ipsum
- Server components by default; `"use client"` for animated/interactive sections
- Motion: scroll-driven reveals via `lib/reveal.tsx` (`Reveal`, `useInView`, `useCountUp`); every animation has a `prefers-reduced-motion` final state, and scene CSS is scoped under `.anim` so reduced-motion kills it at once

## Data

- This site has no methodology of its own: `scripts/sample.ts` mirrors the ocProductivity deck's overall card (`OVERALL_CFG`) exactly — ten axes in six weighted tiers (Outcome 30 / Cost 20 / Precision 15 / Discipline 15 / Efficiency 10 / Latency 10), log-odds for rates, k=10 evidence weighting on a fixed ±2 span. When the deck changes, port; never invent scoring here — redirect methodology changes to ocProductivity first.
- `data/pool.json` is committed and ships with the site. Refresh with `bun run update` (`pool` then `build`):
  `pool` pulls the contributions from ClickHouse (`pragma_reader` creds in gitignored `.env.local`,
  auto-loaded by bun) and stamps `meta.generated` (ISO UTC, shown on the rankings badge) plus
  `meta.contributors` (kept in the JSON, never displayed — the UI shows no volume counts).
- `data/sample.json` is gitignored local output: `bun run sample` rebuilds it from
  `../ocProductivity/data.json` for the methodology check, and `bun run diff` compares it cell-by-cell
  against the deck's `otable` with the deck forced to relative (must pass before publishing). Both share
  the math in `scripts/lib/scoring.ts`, and with a sole-member pool the two agree to display rounding.
  Never diff `pool.json` against the deck once a second contributor lands — they legitimately diverge.
  Four views: `model`, `family`, `modelCombo`, `famCombo`.
- Display is relative-to-pool on a fixed ±2 span, exactly as computed; `sample.json` carries the canonical values the deck diff verifies.
- Labels use real model ids; file paths, author names, prompts and session contents must never appear — grep the JSON for `/home`, author names and `ses_` before publishing.
- The UI shows no volume counts (no sessions/hours/repos anywhere). Only groups with ≥ 10 judged cycles (`minJudged`) are ranked or shown; pool and scores are computed over those ranked groups, matching the deck default.

## Commands

```bash
bun install
bun run sample   # rebuild data/sample.json from local ocProductivity (dev / methodology check)
bun run pool     # rebuild data/pool.json from the pooled contributions (ClickHouse, needs reader creds)
bun run update   # pool + build: refresh the shipped data and rebuild the export
bun run diff     # verify sample.json against the deck's otable (must pass)
bun run dev      # local dev server
bun run build    # static export to out/
bun run serve    # serve the export locally
```

## Dev server over LAN

`next.config.ts` sets `allowedDevOrigins` (LAN IP + `127.0.0.1`, extras via `NEXT_ALLOWED_DEV_ORIGINS`). Loading dev from an unlisted origin makes Next block the HMR websocket, and React then never hydrates — every client control (theme toggle, tabs) silently does nothing with zero errors. If the page loads but nothing is clickable, check the HMR connection first. Config change requires a dev server restart.
