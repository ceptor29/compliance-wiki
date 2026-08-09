import "dotenv/config";
import { eq, isNotNull, and } from "drizzle-orm";
import { db } from "../lib/db";
import { sources, frameworks } from "../db/schema";
import { fetchSourceContent } from "../lib/fetch";
import { parseWithAi } from "../lib/ai";
import { ingestParsed } from "../lib/ingest";

const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
}

function hasFlag(name: string): boolean {
  return args.includes(`--${name}`);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set — skipping collection. (Local-only dry run for now.)");
    console.log("Run: npm run db:push && npm run db:seed, then set DATABASE_URL.");
    return;
  }

  const frameworkSlug = getArg("framework");
  const limit = Number(getArg("limit") ?? 0) || 0;
  const sleepMs = Number(getArg("sleep") ?? 1200) || 0;
  const skipAi = hasFlag("skip-ai");

  let frameworkIdFilter: number | undefined;
  if (frameworkSlug) {
    const fw = await db.query.frameworks.findFirst({
      where: (f, { eq: _eq }) => _eq(f.slug, frameworkSlug!),
    });
    if (!fw) {
      console.log(`Framework "${frameworkSlug}" not found.`);
      return;
    }
    frameworkIdFilter = fw.id;
  }

  const allSources = await db
    .select()
    .from(sources)
    .where(
      frameworkIdFilter
        ? and(eq(sources.frameworkId, frameworkIdFilter), isNotNull(sources.frameworkId))
        : isNotNull(sources.frameworkId)
    )
    .orderBy(sources.frameworkId);

  const rows = limit ? allSources.slice(0, limit) : allSources;
  console.log(`Collecting ${rows.length} source(s) from the DB sources table.`);

  const slugById = new Map<number, string>();
  for (const fw of await db.select().from(frameworks)) slugById.set(fw.id, fw.slug);

  let processed = 0;
  let controlsAdded = 0;
  let changesCreated = 0;
  let errors = 0;

  for (const src of rows) {
    const type = (src.type as "rss" | "html") || "html";
    console.log(`\n[${src.name}] ${src.url} (${type})`);

    try {
      const rawText = await fetchSourceContent({
        name: src.name,
        url: src.url,
        type,
        frameworkSlug: src.frameworkId ? slugById.get(src.frameworkId) : undefined,
      });

      if (skipAi) {
        console.log("  (skip-ai) fetched only, not parsed");
        await db.update(sources).set({ lastCheckedAt: new Date() }).where(eq(sources.id, src.id));
        processed++;
        continue;
      }

      const parsed = await parseWithAi(rawText);
      processed++;

      if (src.frameworkId == null) {
        console.log("  ! source has no framework — skipping ingestion");
        await db.update(sources).set({ lastCheckedAt: new Date() }).where(eq(sources.id, src.id));
        continue;
      }

      const stats = await ingestParsed(src.frameworkId, parsed, src.url);
      controlsAdded += stats.controlsAdded;
      changesCreated += stats.changesAdded;
      if (stats.controlsAdded > 0) console.log(`  + ${stats.controlsAdded} new controls`);
      if (stats.changesAdded > 0) console.log(`  ~ ${stats.changesAdded} changes`);

      await db.update(sources).set({ lastCheckedAt: new Date() }).where(eq(sources.id, src.id));
    } catch (e) {
      errors++;
      console.error(`  ! failed: ${(e as Error).message}`);
    }

    if (sleepMs) await new Promise((r) => setTimeout(r, sleepMs));
  }

  console.log(
    `\nDone. Sources: ${rows.length}, processed: ${processed}, controls added: ${controlsAdded}, changes: ${changesCreated}, errors: ${errors}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
