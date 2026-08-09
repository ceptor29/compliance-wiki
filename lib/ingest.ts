import { db } from "./db";
import { controls, changes } from "../db/schema";
import type { ParsedFramework } from "./ai";

const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

function windowAgo() {
  return new Date(Date.now() - DEDUPE_WINDOW_MS);
}

function sameText(a: string | null | undefined, b: string | null | undefined) {
  return (a ?? "") === (b ?? "");
}

async function findControl(frameworkId: number, controlId: string) {
  return db.query.controls.findFirst({
    where: (ctrl, { and: _and, eq: _eq }) =>
      _and(_eq(ctrl.frameworkId, frameworkId), _eq(ctrl.controlId, controlId)),
  });
}

async function findUnreviewedChange(
  controlId: number,
  type: string,
  matcher: (row: typeof changes.$inferSelect) => boolean
) {
  const recent = await db.query.changes.findMany({
    where: (row, { and: _and, eq: _eq, gte: _gte }) =>
      _and(_eq(row.controlId, controlId), _eq(row.type, type), _eq(row.reviewed, false), _gte(row.discoveredAt, windowAgo())),
  });
  return recent.find(matcher);
}

export async function ingestParsed(
  frameworkId: number,
  parsed: ParsedFramework,
  sourceUrl: string
): Promise<{ controlsAdded: number; changesAdded: number }> {
  let controlsAdded = 0;
  let changesAdded = 0;

  for (const c of parsed.controls) {
    const existing = await findControl(frameworkId, c.controlId);

    if (!existing) {
      const [inserted] = await db
        .insert(controls)
        .values({
          frameworkId,
          controlId: c.controlId,
          title: c.title,
          description: c.description,
          domain: c.domain ?? null,
        })
        .returning();
      controlsAdded++;

      await db.insert(changes).values({
        controlId: inserted.id,
        type: "new",
        summary: `New control "${c.controlId} — ${c.title}" was added.`,
        sourceUrl,
        reviewed: true,
        publishedAt: new Date(),
      });
      changesAdded++;
      continue;
    }

    const changed =
      existing.title !== c.title ||
      existing.description !== c.description ||
      !sameText(existing.domain, c.domain);

    if (!changed) continue;

    const dup = await findUnreviewedChange(
      existing.id,
      "updated",
      (row) =>
        row.newTitle === c.title &&
        row.newDescription === c.description &&
        row.newDomain === (c.domain ?? null)
    );
    if (dup) continue;

    const diffText = JSON.stringify({
      oldTitle: existing.title,
      oldDescription: existing.description,
      oldDomain: existing.domain,
    });

    await db.insert(changes).values({
      controlId: existing.id,
      type: "updated",
      summary: `Updated content for "${c.controlId} — ${c.title}".`,
      diffText,
      newTitle: c.title,
      newDescription: c.description,
      newDomain: c.domain ?? null,
      sourceUrl,
    });
    changesAdded++;
  }

  for (const ch of parsed.changes ?? []) {
    const control = await findControl(frameworkId, ch.controlId);
    if (!control) continue;

    const dup = await findUnreviewedChange(
      control.id,
      ch.type,
      (row) => row.summary === ch.summary
    );
    if (dup) continue;

    await db.insert(changes).values({
      controlId: control.id,
      type: ch.type,
      summary: ch.summary,
      sourceUrl,
    });
    changesAdded++;
  }

  return { controlsAdded, changesAdded };
}
