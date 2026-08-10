import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const frameworks = sqliteTable("frameworks", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  issuer: text("issuer").notNull(),
  sourceUrl: text("source_url"),
  lastUpdated: integer("last_updated", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
});

export const controls = sqliteTable(
  "controls",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    frameworkId: integer("framework_id")
      .notNull()
      .references(() => frameworks.id, { onDelete: "cascade" }),
    controlId: text("control_id").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    domain: text("domain"),
    version: text("version").notNull().default("1.0"),
    validFrom: integer("valid_from", { mode: "timestamp_ms" }).notNull().defaultNow(),
    validTo: integer("valid_to", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
  },
  (t) => [index("controls_framework_idx").on(t.frameworkId)]
);

export const changes = sqliteTable(
  "changes",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    controlId: integer("control_id")
      .notNull()
      .references(() => controls.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // new | updated | retired
    summary: text("summary").notNull(),
    diffText: text("diff_text"),
    newTitle: text("new_title"),
    newDescription: text("new_description"),
    newDomain: text("new_domain"),
    sourceUrl: text("source_url"),
    discoveredAt: integer("discovered_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
    reviewed: integer("reviewed", { mode: "boolean" }).notNull().default(false),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  },
  (t) => [index("changes_control_idx").on(t.controlId)]
);

export const sources = sqliteTable("sources", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // rss | html | email
  frameworkId: integer("framework_id").references(() => frameworks.id),
  lastCheckedAt: integer("last_checked_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
});

export const subscribers = sqliteTable("subscribers", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  frameworkIds: text("framework_ids", { mode: "json" }).$type<number[]>().default([]),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
});

export const posts = sqliteTable("posts", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: integer("published_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().defaultNow(),
});

export type Framework = typeof frameworks.$inferSelect;
export type Control = typeof controls.$inferSelect;
export type Change = typeof changes.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Post = typeof posts.$inferSelect;
