import { eq } from "drizzle-orm";
import { db } from "./db";
import { changes, controls } from "../db/schema";

export type ApplyResult = { ok: boolean; error?: string };

function bumpVersion(version: string): string {
  const match = version.match(/^(\d+)(?:\.(\d+))?/);
  if (!match) return version;
  const major = Number(match[1]);
  const minor = match[2] !== undefined ? Number(match[2]) : 0;
  return `${major}.${minor + 1}`;
}

export async function applyChange(changeId: number): Promise<ApplyResult> {
  const change = await db.query.changes.findFirst({
    where: (c, { eq: _eq }) => _eq(c.id, changeId),
  });
  if (!change) return { ok: false, error: "Change not found." };
  if (change.reviewed) return { ok: false, error: "Change already reviewed." };

  const control = await db.query.controls.findFirst({
    where: (c, { eq: _eq }) => _eq(c.id, change.controlId),
  });
  if (!control) return { ok: false, error: "Control not found." };

  const now = new Date();

  if (change.type === "updated") {
    await db
      .update(controls)
      .set({
        title: change.newTitle ?? control.title,
        description: change.newDescription ?? control.description,
        domain: change.newDomain ?? control.domain,
        version: bumpVersion(control.version),
        validFrom: change.discoveredAt,
      })
      .where(eq(controls.id, control.id));
  } else if (change.type === "retired") {
    await db
      .update(controls)
      .set({ validTo: change.discoveredAt })
      .where(eq(controls.id, control.id));
  }

  await db
    .update(changes)
    .set({ reviewed: true, publishedAt: now })
    .where(eq(changes.id, change.id));

  return { ok: true };
}

export async function dismissChange(changeId: number): Promise<ApplyResult> {
  const change = await db.query.changes.findFirst({
    where: (c, { eq: _eq }) => _eq(c.id, changeId),
  });
  if (!change) return { ok: false, error: "Change not found." };
  if (change.reviewed) return { ok: false, error: "Change already reviewed." };

  await db
    .update(changes)
    .set({ reviewed: true, publishedAt: new Date() })
    .where(eq(changes.id, change.id));

  return { ok: true };
}
