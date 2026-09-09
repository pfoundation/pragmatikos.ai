# Pragmatikos

The product site and pooled scorecard for [Pragmatikos](https://pragmatikos.ai), helping individual developers choose the planner → builder setup for their coding agent.

Benchmarks test models on controlled tasks. Pragmatikos looks at real developer sessions and asks which setups actually **ship**: the AI's edits landed in a git commit.

The site combines interactive rankings, a radar comparison of family pairings, an explanation of the scoring, and instructions for contributing sessions through ocInsights. Rankings are observational and come from a small, self-selected pool; treat them as a hypothesis to try.

## Stack

- Next.js 16 App Router, React 19, and TypeScript.
- Tailwind CSS v4, Radix UI primitives, and hand-drawn SVG charts and illustrations.
- P Foundation design language: square geometry, burnt amber, IBM Plex Sans, and Inconsolata.
- Bun for package management and data scripts.
- Fully static export to `out/`, deployed to GitHub Pages.

## Run locally

Install Bun and Node.js 20.9 or later, then:

```sh
git clone https://github.com/pfoundation/pragmatikos.ai.git
cd pragmatikos.ai
bun install
bun run dev
```

Open [localhost:3000](http://localhost:3000).

The committed `data/pool.json` supplies the site's data. Local development and a normal build work without ClickHouse credentials or a sibling ocInsights checkout.

To preview the production export:

```sh
bun run build
bun run serve
```

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the development server. |
| `bun run build` | Build the static site into `out/` using the committed pool. |
| `bun run serve` | Serve the contents of `out/` locally. |
| `bun run pool` | Fetch contributed cycles from ClickHouse and regenerate `data/pool.json`. |
| `bun run update` | Refresh the pool, then build the static export. |
| `bun run sample` | Generate local `data/sample.json` from `../ocInsights/data.json`. |
| `bun run diff` | Compare the local sample with the ocInsights deck's overall table. |

## Data workflow

### Refresh the published pool

Copy the environment template:

```sh
cp .env.local.example .env.local
```

Fill in the reader credentials in `.env.local`. Bun loads this gitignored file automatically.

| Variable | Purpose |
| --- | --- |
| `CLICKHOUSE_URL` | ClickHouse HTTP endpoint. |
| `CLICKHOUSE_USER` | Read-only account, normally `pragma_reader`. |
| `CLICKHOUSE_PASSWORD` | Password for that account. |

Keep these credentials server-side; do not prefix them with `NEXT_PUBLIC_`.

```sh
bun run update
```

`scripts/pool.ts` excludes retracted contributions, applies the shared scoring code, and writes `data/pool.json`. The snapshot records its UTC generation time, contribution schema version, and contributor count. The refresh fails if the pool contains mixed or unsupported schema versions.

Review and commit the refreshed `data/pool.json` to publish it with the site. Published JSON must contain no file paths, author names, prompts, session IDs, or session contents; check for `/home`, `ses_`, and author names before publishing.

### Verify scoring against ocInsights

The local parity check requires:

- A sibling `../ocInsights/` checkout with a current `data.json` extraction.
- The matching generated deck at `../ocInsights/opencode_time_full.html`.
- An importable Playwright package and its Chromium browser. Playwright is not declared in this project's dependencies; `scripts/diff.mjs` also has a workspace-specific fallback.

```sh
bun run sample
bun run diff
```

Run this check before publishing. It compares the family-pair and model-plus-effort-pair views cell by cell against the deck's `otable`, with the deck forced to relative mode. Scores, displayed axes, imputed-tier flags, and summary totals must agree within display-rounding tolerance.

`data/sample.json` is gitignored and used for this check. The deployed site reads `data/pool.json`. Once multiple contributors are in the pool, the pooled rankings legitimately differ from one developer's deck; compare the deck with the local sample.

## How it works

The scoring source of truth is the ocInsights deck's overall card, `OVERALL_CFG`. This repository mirrors it in `scripts/lib/scoring.ts`, shared by the pool and sample generators. Methodology changes belong in ocInsights first, then are ported here and verified with `bun run diff`.

Ten axes are combined into six weighted tiers:

| Tier | Weight | Axes |
| --- | --- | --- |
| Outcome | 30% | Ship rate, one-shot rate |
| Cost | 20% | Turns, hours, and dollars per ship |
| Precision | 15% | Tool errors, aborts |
| Discipline | 15% | Verified cycles |
| Efficiency | 10% | Edits per turn |
| Latency | 10% | Time per step |

- Scores are relative to the pool on a fixed ±2 log₂ span, using log odds for rates and evidence weighting with `k = 10`.
- Only groups with at least 10 judged cycles are ranked; the comparison pool is computed over eligible groups.
- The scorecard ranks planner → builder pairs, defaults to **Families**, and also offers **Models** and **Model + Effort** when the snapshot contains those views. Rankings are always evidence-weighted.
- The radar places better values farther outward. Strips keep their raw direction, with color indicating whether more or less is better.

## Project layout

| Path | Contents |
| --- | --- |
| `app/page.tsx` | Landing-page composition and section order. |
| `app/layout.tsx` | Root layout and page metadata. |
| `app/globals.css` | Semantic design tokens, typography, themes, and scene animations. |
| `components/site/` | Hero, rankings, radar, explanations, and contribution flow. |
| `components/ui/` | Shared UI primitives. |
| `lib/score.ts` | Pool access, score types, axis metadata, and display helpers. |
| `lib/reveal.tsx` | Scroll reveals and animation hooks. |
| `lib/hot.tsx` | Shared chart and scorecard highlighting state. |
| `data/pool.json` | Committed snapshot used by the site. |
| `scripts/` | Pool refresh, sample generation, parity check, and shared scoring math. |
| `.github/workflows/` | Static deployment and manual pool-refresh workflows. |

## Deployment

[`pages.yml`](.github/workflows/pages.yml) installs dependencies, runs `bun run build`, and deploys `out/` to GitHub Pages on pushes to `master`. It also supports manual runs and reuse by the refresh workflow.

[`refresh.yml`](.github/workflows/refresh.yml) is manually triggered. It reads the `CLICKHOUSE_URL`, `CLICKHOUSE_USER`, and `CLICKHOUSE_PASSWORD` repository secrets, refreshes the pool, checks for local paths and session IDs, commits the result, and invokes the Pages workflow for `master`.

The default build serves from the domain root. For a subpath deployment, set `NEXT_PUBLIC_BASE_PATH` at build time:

```sh
NEXT_PUBLIC_BASE_PATH=/pragmatikos.ai bun run build
```

## Development notes

- Follow [AGENTS.md](AGENTS.md) for positioning, page order, data rules, and coding conventions.
- Use two-space indentation, single quotes, semantic color tokens, and square corners.
- Use IBM Plex Sans for copy and Inconsolata for machine values.
- Prefer server components; use client components for interactions and animations. Motion must respect `prefers-reduced-motion`.
- Show volume counts at pool level, keeping them off individual ranked rows.

### Access over the LAN

If the page loads over a LAN address but controls do not respond, check the HMR websocket. Next.js can block it when the origin is missing from `allowedDevOrigins` in `next.config.ts`.

Add extra hosts with the comma-separated `NEXT_ALLOWED_DEV_ORIGINS` variable, then restart the dev server:

```sh
NEXT_ALLOWED_DEV_ORIGINS=192.168.1.50,dev.example.test bun run dev
```
