import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { parse } from "yaml";
import { spawnSync } from "node:child_process";
import mapping from "../config/environments.json";
test("three branches map to isolated environments and mobile application identifiers", () => {
  assert.deepEqual(Object.keys(mapping), ["development", "stagging", "main"]);
  assert.equal(new Set(Object.values(mapping).map((x) => x.appId)).size, 3);
});
test("Render services cannot auto-deploy another environment", () => {
  const b = parse(readFileSync("render.yaml", "utf8"));
  assert.equal(b.services.length, 6);
  assert.equal(b.databases.length, 3);
  for (const s of b.services) {
    assert.equal(s.autoDeployTrigger, "off");
    const target = mapping[s.branch as keyof typeof mapping];
    assert.ok(target);
    assert.ok(s.name.includes(target.environment));
    assert.equal(s.envVars[0].fromGroup, "servicetones-" + target.environment);
  }
});
test("promotion guard rejects direct development-to-main changes", () => {
  const r = spawnSync(process.execPath, ["scripts/ci-target.mjs"], {
    env: {
      ...process.env,
      EVENT_NAME: "pull_request",
      HEAD_BRANCH: "development",
      BASE_BRANCH: "main",
    },
    encoding: "utf8",
  });
  assert.notEqual(r.status, 0);
  const valid = spawnSync(process.execPath, ["scripts/ci-target.mjs"], {
    env: {
      ...process.env,
      EVENT_NAME: "pull_request",
      HEAD_BRANCH: "stagging",
      BASE_BRANCH: "main",
    },
    encoding: "utf8",
  });
  assert.equal(valid.status, 0);
});
test("release deployment depends on validation, and mobile depends on matching web release", () => {
  const w = parse(readFileSync(".github/workflows/release.yml", "utf8"));
  assert.equal(w.jobs.web.needs, "validate");
  assert.deepEqual(w.jobs.ios.needs, ["validate", "web"]);
  assert.deepEqual(w.jobs.android.needs, ["validate", "web"]);
  assert.equal(w.permissions.contents, "read");
});
