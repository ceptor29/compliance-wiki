import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { frameworks, controls } from "../db/schema";
import { catalogs } from "../db/catalogs";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function withBusyRetry<T>(fn: () => Promise<T>, attempts = 10): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const locked = (e as Error).message.includes("SQLITE_BUSY") || (e as Error).message.includes("database is locked");
      if (!locked || i >= attempts - 1) throw e;
      await sleep(200 * (i + 1));
    }
  }
}

async function main() {
  const slugFilter = process.argv.includes("--framework")
    ? process.argv[process.argv.indexOf("--framework") + 1]
    : undefined;
  const dryRun = process.argv.includes("--dry-run");

  const allFrameworks = await db.query.frameworks.findMany({
    orderBy: (f, { asc }) => [asc(f.slug)],
  });
  const bySlug = new Map(allFrameworks.map((f) => [f.slug, f]));

  const targetSlugs = slugFilter ? [slugFilter] : Object.keys(catalogs);
  const missing: string[] = [];
  const totals = { inserted: 0, updated: 0, unchanged: 0, frameworksTouched: 0 };

  for (const slug of targetSlugs) {
    const catalog = catalogs[slug];
    if (!catalog) {
      console.log(`- ${slug}: no catalog`);
      continue;
    }
    const fw = bySlug.get(slug);
    if (!fw) {
      missing.push(slug);
      console.log(`- ${slug}: framework not in DB (run npm run db:seed)`);
      continue;
    }

    const existing = await db.query.controls.findMany({
      where: (c, { eq: _eq }) => _eq(c.frameworkId, fw.id),
    });
    const byControlId = new Map(existing.map((c) => [c.controlId, c]));

    let inserted = 0;
    let updated = 0;
    let unchanged = 0;

    for (const cc of catalog.controls) {
      const cur = byControlId.get(cc.controlId);
      if (!cur) {
        if (!dryRun) {
          await withBusyRetry(() =>
            db.insert(controls).values({
              frameworkId: fw.id,
              controlId: cc.controlId,
              title: cc.title,
              description: cc.description,
              domain: cc.domain ?? null,
              version: catalog.version ?? "1.0",
            })
          );
        }
        inserted++;
        continue;
      }
      const changed =
        cur.title !== cc.title ||
        cur.description !== cc.description ||
        (cur.domain ?? null) !== (cc.domain ?? null);
      if (changed) {
        if (!dryRun) {
          await withBusyRetry(() =>
            db
              .update(controls)
              .set({
                title: cc.title,
                description: cc.description,
                domain: cc.domain ?? null,
                version: catalog.version ?? cur.version,
              })
              .where(eq(controls.id, cur.id))
          );
        }
        updated++;
      } else {
        unchanged++;
      }
    }

    if (!dryRun && (inserted > 0 || updated > 0)) {
      await withBusyRetry(() =>
        db.update(frameworks).set({ lastUpdated: new Date() }).where(eq(frameworks.id, fw.id))
      );
      totals.frameworksTouched++;
    }

    totals.inserted += inserted;
    totals.updated += updated;
    totals.unchanged += unchanged;
    console.log(
      `${dryRun ? "[dry-run] " : ""}- ${slug}: catalog ${catalog.controls.length} controls, ` +
        `inserted ${inserted}, updated ${updated}, unchanged ${unchanged}`
    );
  }

  console.log(`\nDone. inserted ${totals.inserted}, updated ${totals.updated}, unchanged ${totals.unchanged}, frameworks touched ${totals.frameworksTouched}.`);
  if (missing.length) {
    console.log(`Frameworks missing from DB (run npm run db:seed): ${missing.join(", ")}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
