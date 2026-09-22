import fs from "node:fs";
const {
  RENDER_API_KEY,
  RENDER_SERVICE_ID,
  RENDER_WORKER_SERVICE_ID,
  GITHUB_SHA,
  GITHUB_REF_NAME,
  SITE_URL,
} = process.env;
for (const key of [
  "RENDER_API_KEY",
  "RENDER_SERVICE_ID",
  "RENDER_WORKER_SERVICE_ID",
  "GITHUB_SHA",
  "GITHUB_REF_NAME",
  "SITE_URL",
])
  if (!process.env[key])
    throw new Error("Missing GitHub environment configuration: " + key);
const mapping = JSON.parse(fs.readFileSync("config/environments.json", "utf8"));
if (!mapping[GITHUB_REF_NAME]) throw new Error("Unmapped deployment branch.");
const base = "https://api.render.com/v1";
async function api(path, body) {
  const r = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + RENDER_API_KEY,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  if (!r.ok) throw new Error("Render API request failed: " + r.status);
  return r.json();
}
async function deploy(id) {
  const service = await api("/services/" + id);
  if (service.branch !== GITHUB_REF_NAME)
    throw new Error("Render service branch does not match the pushed branch.");
  const deployed = await api("/services/" + id + "/deploys", {
    commitId: GITHUB_SHA,
    clearCache: "do_not_clear",
  });
  console.log("Waiting for Render deployment " + deployed.id);
  for (let attempt = 0; attempt < 120; attempt++) {
    const d = await api("/services/" + id + "/deploys/" + deployed.id);
    if (d.status === "live") {
      console.log("Render deployment is live.");
      return;
    }
    if (
      ["build_failed", "update_failed", "canceled", "deactivated"].includes(
        d.status,
      )
    )
      throw new Error("Render deployment failed: " + d.status);
    await new Promise((r) => setTimeout(r, 10000));
  }
  throw new Error("Render deployment timed out.");
}
await deploy(RENDER_SERVICE_ID);
const response = await fetch(SITE_URL.replace(/\/$/, "") + "/api/health", {
  signal: AbortSignal.timeout(30000),
});
if (!response.ok) throw new Error("Deployed health check failed.");
const health = await response.json();
if (
  health.release !== GITHUB_SHA ||
  health.environment !== mapping[GITHUB_REF_NAME].environment
)
  throw new Error("Deployed release/environment does not match this build.");
await deploy(RENDER_WORKER_SERVICE_ID);
