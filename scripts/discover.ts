import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { frameworks, sources } from "../db/schema";
import { searchWeb } from "../lib/search";
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

function isRss(url: string): boolean {
  return /\.(rss|xml)(\?|#|$)/i.test(url) || /rss|feed|atom/i.test(url);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not set — discovery needs the DB.");
    return;
  }

  const slugFilter = getArg("framework");
  const limit = Math.min(Number(getArg("limit") ?? 3) || 3, 8);
  const dryRun = hasFlag("dry-run");

  const all = await db.query.frameworks.findMany({
    orderBy: (f, { asc }) => [asc(f.slug)],
  });
  const targets = slugFilter ? all.filter((f) => f.slug === slugFilter) : all;

  if (targets.length === 0) {
    console.log("No frameworks matched.");
    return;
  }

  console.log(
    `Discovery mode: ${targets.length} framework(s), ${limit} result(s) each${dryRun ? " (dry run)" : ""}`
  );

  let pagesFetched = 0;
  let controlsAdded = 0;
  let changesAdded = 0;
  let errors = 0;

  for (const fw of targets) {
    const query = `${fw.name} ${fw.issuer} controls and requirements latest version`;
    console.log(`\n=== ${fw.name} (${fw.slug}) ===`);
    console.log(`Searching: "${query}"`);

    let urls: string[];
    try {
      urls = (await searchWeb(query)).slice(0, limit);
    } catch (e) {
      errors++;
      console.error(`  ! search failed: ${(e as Error).message}`);
      continue;
    }

    if (urls.length === 0) {
      console.log("  - no search results");
      continue;
    }

    const known = new Set(
      (
        await db.select({ url: sources.url }).from(sources).where(eq(sources.frameworkId, fw.id))
      ).map((r) => r.url)
    );
    if (fw.sourceUrl) known.add(fw.sourceUrl);

    const candidates = urls.filter((u) => !known.has(u));

    console.log(`  found ${urls.length} results, ${candidates.length} new`);

    for (const url of candidates) {
      console.log(`\n  -> ${url}`);
      pagesFetched++;
      if (dryRun) continue;

      await sleep(1200);
      try {
        const raw = await fetchSourceContent({
          name: fw.name,
          url,
          type: isRss(url) ? "rss" : "html",
          frameworkSlug: fw.slug,
        });
        const parsed = await parseWithAi(raw);
        const stats = await ingestParsed(fw.id, parsed, url);
        controlsAdded += stats.controlsAdded;
        changesAdded += stats.changesAdded;
        console.log(`    controls +${stats.controlsAdded}, changes +${stats.changesAdded}`);

        await db
          .insert(sources)
          .values({
            name: `${fw.name} (discovered)`,
            url,
            type: isRss(url) ? "rss" : "html",
            frameworkId: fw.id,
          })
          .onConflictDoNothing();
        await db
          .update(frameworks)
          .set({ lastUpdated: new Date() })
          .where(eq(frameworks.id, fw.id));
      } catch (e) {
        errors++;
        console.error(`    ! failed: ${(e as Error).message}`);
      }
    }
  }

  console.log(
    `\nDone. pages fetched: ${pagesFetched}, controls added: ${controlsAdded}, changes added: ${changesAdded}, errors: ${errors}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
