import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool, transaction } from "./index.js";
export async function migrate() {
  await transaction(async (c) => {
    await c.query("SELECT pg_advisory_xact_lock(73842612)");
    await c.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const dir = fileURLToPath(new URL("./migrations/", import.meta.url));
    for (const name of (await readdir(dir))
      .filter((x) => x.endsWith(".sql"))
      .sort()) {
      if (
        (await c.query("SELECT 1 FROM schema_migrations WHERE name=$1", [name]))
          .rowCount
      )
        continue;
      await c.query(await readFile(dir + name, "utf8"));
      await c.query("INSERT INTO schema_migrations(name) VALUES($1)", [name]);
    }
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    await migrate();
    console.log("Database migrations complete.");
  } finally {
    await pool.end();
  }
}
