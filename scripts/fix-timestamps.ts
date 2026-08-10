import { createClient } from "@libsql/client";
import "dotenv/config";

const url = process.env.DATABASE_URL ?? "file:./compliance.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(authToken ? { url, authToken } : { url });

// Every integer timestamp column. Values stored in seconds (a 10-digit epoch)
// are converted to milliseconds so they match drizzle's timestamp_ms mapping.
// Values already in ms (> 1e12) and NULLs are left untouched, so this is safe to re-run.
const COLUMNS: [string, string][] = [
  ["frameworks", "last_updated"],
  ["frameworks", "created_at"],
  ["controls", "valid_from"],
  ["controls", "valid_to"],
  ["controls", "created_at"],
  ["changes", "discovered_at"],
  ["changes", "published_at"],
  ["sources", "last_checked_at"],
  ["sources", "created_at"],
  ["subscribers", "created_at"],
  ["posts", "created_at"],
];

async function main() {
  for (const [table, column] of COLUMNS) {
    const result = await client.execute(
      `UPDATE ${table} SET ${column} = ${column} * 1000
       WHERE ${column} IS NOT NULL AND ${column} BETWEEN 1000000000 AND 999999999999`
    );
    const n = Number(result.rowsAffected);
    if (n > 0) console.log(`${table}.${column}: converted ${n} row(s) from seconds to ms`);
  }
  console.log(`Done. Target: ${url.includes("turso") ? "Turso" : "local file"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
