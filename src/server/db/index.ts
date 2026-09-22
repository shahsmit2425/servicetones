import pg from "pg";
import { env } from "../config.js";
const databaseUrl = env.DATABASE_URL ? new URL(env.DATABASE_URL) : null;
if (
  env.DATABASE_SSL === "render-internal" &&
  (!databaseUrl ||
    !/^dpg-[a-z0-9-]+$/.test(databaseUrl.hostname) ||
    process.env.RENDER !== "true")
)
  throw new Error(
    "render-internal TLS is only allowed for Render private database hosts on Render.",
  );
// pg connection-string TLS parameters override the ssl object; keep one authoritative policy.
for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert"])
  databaseUrl?.searchParams.delete(key);
export const pool = new pg.Pool({
  connectionString: databaseUrl?.toString(),
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  ssl:
    env.DATABASE_SSL === "disable"
      ? false
      : {
          rejectUnauthorized: env.DATABASE_SSL !== "render-internal",
          ...(env.DATABASE_CA_CERT
            ? { ca: env.DATABASE_CA_CERT.replace(/\\n/g, "\n") }
            : {}),
        },
});
export async function transaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    const result = await fn(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export function camel<T = Record<string, unknown>>(
  row: Record<string, unknown>,
): T {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
      v instanceof Date ? v.toISOString() : v,
    ]),
  ) as T;
}
