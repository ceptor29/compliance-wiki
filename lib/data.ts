import { eq, desc, gt, count } from "drizzle-orm";
import { db } from "./db";
import { frameworks, controls, changes, sources } from "../db/schema";

export async function getAllFrameworks() {
  return db.select().from(frameworks).orderBy(frameworks.name);
}

export async function getFrameworkBySlug(slug: string) {
  return db.query.frameworks.findFirst({ where: (f, { eq }) => eq(f.slug, slug) });
}

export async function getControlsForFramework(frameworkId: number) {
  return db.select().from(controls).where(eq(controls.frameworkId, frameworkId));
}

export async function getFrameworkControls(slug: string) {
  const framework = await getFrameworkBySlug(slug);
  if (!framework) return null;
  const controlList = await getControlsForFramework(framework.id);
  return { framework, controls: controlList };
}

export async function getControlById(id: number) {
  const control = await db.query.controls.findFirst({ where: (c, { eq }) => eq(c.id, id) });
  if (!control) return null;
  const framework = await getFrameworkBySlug(
    (await db.select().from(frameworks).where(eq(frameworks.id, control.frameworkId)))[0]?.slug ?? ""
  );
  const changeList = await db
    .select()
    .from(changes)
    .where(eq(changes.controlId, id))
    .orderBy(desc(changes.discoveredAt));
  return { control, framework, changes: changeList };
}

export async function getRecentChanges(limit = 20) {
  return db
    .select({
      id: changes.id,
      type: changes.type,
      summary: changes.summary,
      diffText: changes.diffText,
      newTitle: changes.newTitle,
      newDescription: changes.newDescription,
      newDomain: changes.newDomain,
      discoveredAt: changes.discoveredAt,
      reviewed: changes.reviewed,
      controlId: changes.controlId,
      controlIdText: controls.controlId,
      controlTitle: controls.title,
      frameworkId: controls.frameworkId,
      frameworkSlug: frameworks.slug,
      frameworkName: frameworks.name,
    })
    .from(changes)
    .innerJoin(controls, eq(changes.controlId, controls.id))
    .innerJoin(frameworks, eq(controls.frameworkId, frameworks.id))
    .orderBy(desc(changes.discoveredAt))
    .limit(limit);
}

export async function getFrameworkSources(slug: string) {
  const framework = await getFrameworkBySlug(slug);
  if (!framework) return null;
  const src = await db.select().from(sources).where(eq(sources.frameworkId, framework.id));
  return { framework, sources: src };
}

export async function getDashboardStats() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [frameworkCount, controlCount, sourcesCount, changesThisWeek] =
    await Promise.all([
      db.select().from(frameworks),
      db.select().from(controls),
      db.select().from(sources),
      db.select().from(changes).where(gt(changes.discoveredAt, weekAgo)),
    ]);

  return {
    frameworkCount: frameworkCount.length,
    controlCount: controlCount.length,
    sourceCount: sourcesCount.length,
    changesThisWeek: changesThisWeek.length,
  };
}

export async function getMostChangedFrameworks(limit = 5) {
  return db
    .select({
      frameworkSlug: frameworks.slug,
      frameworkName: frameworks.name,
      frameworkIssuer: frameworks.issuer,
      changeCount: count(changes.id),
    })
    .from(changes)
    .innerJoin(controls, eq(changes.controlId, controls.id))
    .innerJoin(frameworks, eq(controls.frameworkId, frameworks.id))
    .groupBy(frameworks.id)
    .orderBy(desc(count(changes.id)))
    .limit(limit);
}
