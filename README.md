# Compliance Wiki

A single source of truth for compliance frameworks, their controls, and every change across the industry. AI-assisted collection, human-reviewed publishing, newsletter digests.

**Live site:** https://compliance-wiki-three.vercel.app/ · **34 frameworks · 1,559 controls · 85 monitored sources · live change log**

**Roadmap:** see [ROADMAP.md](ROADMAP.md) for the plan to add org-level compliance assessments, evidence integrations, and monitoring.

## Stack (100% free tier)
- **Next.js 16** (App Router, Turbopack) — hosted on Vercel (free)
- **SQLite/libsql** via Drizzle ORM — Turso (free tier)
- **GitHub Actions** — every-other-day AI collection job (free)
- **Groq** (llama-3.3-70b) — free AI extraction
- **Serper** — free web search for source discovery
- **Resend / Buttondown** — newsletter digests (optional)

## Quick start

```bash
npm install

# 1. Create a free Turso DB (turso.tech), then copy .env.example to .env and set:
#    DATABASE_URL=libsql://your-db-org.turso.io
#    TURSO_AUTH_TOKEN=<turso db tokens create>
#    AI_API_KEY=<groq key>  SEARCH_API_KEY=<serper key>

npm run db:push      # create tables
npm run db:seed      # load all frameworks + sample controls
npm run db:backfill  # upsert curated control catalogs for every framework
npm run dev          # http://localhost:3000
```

## Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Import the repo in the Vercel dashboard (vercel.com/new) — framework auto-detected.
3. Add these Environment Variables (Production + Preview): `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AI_PROVIDER=openai-compatible`, `AI_BASE_URL=https://api.groq.com/openai/v1`, `AI_MODEL=llama-3.3-70b-versatile`, `AI_API_KEY`, `SEARCH_PROVIDER=serper`, `SEARCH_API_KEY`.
4. Deploy — every push to the default branch auto-deploys.

## Curated control catalogs

The base control set for every framework lives in `db/catalogs/*.ts` (community-curated; verify against official sources). Run `npm run db:backfill` after seeding to upsert these catalogs into the `controls` table — it inserts missing controls, updates titles/descriptions/domains for existing ones, and bumps each framework's `lastUpdated`. Use `--framework <slug>` for a single framework or `--dry-run` to preview.

## Collection pipeline

```bash
npm run collect     # fetch sources -> AI extract -> save changes (needs AI_API_KEY)
npm run discover    # search the web for new sources and extract (needs AI_API_KEY)
```

`collect.ts` iterates the `sources` table (seeded from `db/seed.ts`) rather than hardcoded URLs. In production, `.github/workflows/collect.yml` runs this every other day at 03:00 UTC. It stores results in the `changes` table flagged as `unreviewed`; confirm or dismiss them on the **/changes** page (Apply/Dismiss buttons), then the newsletter digest picks them up.

For the workflow to run on GitHub, add repo **Secrets**: `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AI_API_KEY`, `SEARCH_API_KEY`; and **Variables**: `AI_PROVIDER`, `AI_MODEL`, `AI_BASE_URL`, `SEARCH_PROVIDER`.

## Scripts
| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:push` | Create/update tables from schema |
| `npm run db:seed` | Seed frameworks, sample controls, and sources |
| `npm run db:backfill` | Upsert curated control catalogs into `controls` |
| `npm run collect` | Run the AI collection job once |
| `npm run discover` | Discover new sources for frameworks |
| `npm run lint` | ESLint |

## Structure
```
app/                 Next.js pages (home, frameworks, controls, changes, subscribe)
app/changes/         Review queue: Apply/Dismiss AI-discovered changes
db/schema.ts         Drizzle schema (frameworks, controls, changes, sources, subscribers, posts)
db/seed.ts           Seed data for all 34 frameworks
db/catalogs/         Curated control catalogs per framework (backfilled by db:backfill)
lib/data.ts          Read helpers for pages
lib/ai.ts            AI extraction (OpenAI / Gemini / Ollama / compatible)
lib/ingest.ts        Staging of new/updated/retired controls into `changes`
lib/apply.ts         Apply/dismiss change records
lib/fetch.ts         RSS + HTML fetchers
scripts/collect.ts   Daily collection job (iterates DB sources)
scripts/backfill.ts  Upsert curated catalogs into the controls table
.github/workflows/collect.yml  Scheduled CI job
```

## Adding a framework
No code changes needed — just add an entry to `db/seed.ts` (a source is created automatically), then add a matching catalog in `db/catalogs/` and run `npm run db:backfill`.
