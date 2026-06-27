// src/modules/static/static.routes.ts
// Mounts two separate static-file roots:
//
//   GET /static/*  → public/assets/   (images, icons, fonts — long TTL cache)
//   GET /views/*   → src/assets/      (HTML templates, CSS, JS — short TTL or no-cache)
//
// These are registered BEFORE auth middleware in app.ts so they never require cookies.

import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const staticRouter = new Hono();

// ── /static/* → public/assets ─────────────────────────────────────────────────
// Binary assets: images, icons, fonts, downloads.
// Long cache TTL — content-addressed filenames recommended in production.

staticRouter.use(
  "/static/*",
  async (c, next) => {
    // Cache-Control: 30 days for production, no-cache for dev
    const isProduction = process.env["NODE_ENV"] === "production";
    c.header(
      "Cache-Control",
      isProduction
        ? "public, max-age=2592000, immutable" // 30 days
        : "no-cache, no-store",
    );
    await next();
  },
  serveStatic({
    // Hono's serveStatic `root` is relative to process.cwd()
    root: "./public/assets",
    // Strip the /static prefix before resolving the file path
    rewriteRequestPath: (path) => path.replace(/^\/static/, ""),
  }),
);

// ── /views/* → src/assets ─────────────────────────────────────────────────────
// HTML templates, co-located CSS/JS.
// No caching in dev; short TTL in production so deploys take effect quickly.

staticRouter.use(
  "/views/*",
  async (c, next) => {
    const isProduction = process.env["NODE_ENV"] === "production";
    c.header(
      "Cache-Control",
      isProduction
        ? "public, max-age=300" // 5 minutes
        : "no-cache, no-store",
    );
    await next();
  },
  serveStatic({
    root: "./src/assets",
    rewriteRequestPath: (path) => path.replace(/^\/views/, ""),
  }),
);

// ── 404 handler for static misses ────────────────────────────────────────────
// Only fires when a /static/* or /views/* path resolves to no file.

staticRouter.notFound((c) =>
  c.json({ success: false, message: "Static asset not found", statusCode: 404 }, 404),
);

export default staticRouter;
