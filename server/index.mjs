import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createApp } from "./app.mjs";
const database = process.env.DATABASE_PATH || "data/servicetones.sqlite";
mkdirSync(dirname(database), { recursive: true });
const instance = createApp({
  database,
  ...(process.env.ALLOWED_ORIGINS
    ? { origins: process.env.ALLOWED_ORIGINS.split(",") }
    : {}),
});
instance.http.listen(Number(process.env.PORT) || 3001, "0.0.0.0", () =>
  console.log(`ServiceTones API: http://localhost:${process.env.PORT || 3001}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    await instance.close();
    process.exit(0);
  });
