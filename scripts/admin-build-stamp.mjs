import { writeFileSync } from "node:fs";
const environment = process.env.VITE_APP_ENV;
const api = process.env.VITE_API_URL;
if (
  process.env.RENDER === "true" &&
  (!["development", "stagging", "production"].includes(environment) ||
    !api?.startsWith("https://"))
)
  throw new Error(
    "Set VITE_APP_ENV and HTTPS VITE_API_URL on the admin static site.",
  );
writeFileSync(
  "dist/admin/release.json",
  JSON.stringify({
    environment: environment || "development",
    release: process.env.RENDER_GIT_COMMIT || process.env.GITHUB_SHA || "local",
  }),
);
