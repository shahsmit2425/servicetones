import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { ZodError } from "zod";
import { env, publicConfig, validateDeployment } from "./config.js";
import { api } from "./api.js";
import { webhooks } from "./webhooks.js";
import { publicProfiles } from "./repository.js";
import { pool } from "./db/index.js";
import { categories } from "../shared/domain.js";
if (env.NODE_ENV === "production") validateDeployment();
if (env.SENTRY_DSN)
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    release: env.RENDER_GIT_COMMIT,
    sendDefaultPii: false,
    beforeSend(event) {
      delete event.user;
      delete event.request;
      delete event.breadcrumbs;
      return event;
    },
  });
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
const origins = new Set([
  ...env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()),
  env.SITE_URL,
]);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://*.firebaseapp.com",
          "https://*.sentry.io",
          "https://*.ingest.us.sentry.io",
          "https://*.ingest.de.sentry.io",
          "https://*.r2.cloudflarestorage.com",
          ...(env.NODE_ENV === "development"
            ? ["ws://127.0.0.1:*", "ws://localhost:*"]
            : []),
        ],
        imgSrc: ["'self'", "data:", "https:"],
        frameSrc: [
          "https://*.firebaseapp.com",
          "https://*.google.com",
          "https://appleid.apple.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  }),
);
app.use(
  cors({
    origin(origin, cb) {
      cb(null, !origin || origins.has(origin));
    },
  }),
);
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 240,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use("/api/webhooks", webhooks);
app.use("/api", api);
app.use("/api", (_q, r) =>
  r.status(404).json({ error: "Endpoint not found." }),
);
app.use((req, res, next) => {
  if (env.APP_ENV !== "production" || req.path.startsWith("/app"))
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});
app.get("/robots.txt", (_q, r) =>
  r
    .type("text/plain")
    .send(
      env.APP_ENV === "production"
        ? "User-agent: *\nAllow: /\nDisallow: /app\nDisallow: /api\nSitemap: " +
            env.SITE_URL +
            "/sitemap.xml\n"
        : "User-agent: *\nDisallow: /\n",
    ),
);
app.get("/sitemap.xml", async (_q, r) => {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const paths =
    env.APP_ENV === "production"
      ? [
          "/",
          ...categories.map((c) => "/services/" + c.toLowerCase()),
          ...(await publicProfiles()).map(
            (p) => "/professionals/" + encodeURIComponent(p.id),
          ),
        ]
      : [];
  r.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      paths
        .map((p) => "<url><loc>" + esc(env.SITE_URL + p) + "</loc></url>")
        .join("") +
      "</urlset>",
  );
});
let vite: import("vite").ViteDevServer | undefined;
if (env.NODE_ENV !== "production") {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
} else app.use(express.static("dist/client", { index: false, maxAge: "1h" }));
app.use(async (req, res, next) => {
  if (req.method !== "GET") return next();
  try {
    const pathName = req.path;
    const profileId = pathName.startsWith("/professionals/")
      ? decodeURIComponent(pathName.slice("/professionals/".length))
      : undefined;
    const profile = profileId
      ? (await publicProfiles(profileId))[0]
      : undefined;
    const mod = vite
      ? await vite.ssrLoadModule("/src/entry-server.tsx")
      : await import(
          pathToFileURL(path.resolve("dist/server/entry-server.js")).href
        );
    const page = mod.renderPage(pathName, publicConfig, profile);
    let template = await readFile(
      vite ? "index.html" : "dist/client/index.html",
      "utf8",
    );
    if (vite)
      template = await vite.transformIndexHtml(req.originalUrl, template);
    res
      .status(page.status)
      .type("html")
      .send(
        template
          .replace("<!--head-->", page.head)
          .replace("<!--app-->", page.html)
          .replace("<!--bootstrap-->", page.bootstrap),
      );
  } catch (e) {
    next(e);
  }
});
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    const e = error as { status?: number; message?: string; code?: string };
    const status =
      error instanceof ZodError
        ? 400
        : e.code === "23505"
          ? 409
          : e.code === "22P02"
            ? 400
            : e.status || 500;
    const message =
      error instanceof ZodError
        ? error.issues[0]?.message
        : e.code === "23505"
          ? "This action has already been completed."
          : status < 500
            ? e.message
            : "The service is temporarily unavailable. Please try again.";
    if (status >= 500) {
      console.error("Request failed", e.code || "internal");
      Sentry.captureException(error);
    }
    res.status(status).json({ error: message });
  },
);
const http = app.listen(env.PORT, "0.0.0.0", () =>
  console.log("ServiceTones: " + env.SITE_URL),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    http.close(() => {
      void pool.end().then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10000).unref();
  });
