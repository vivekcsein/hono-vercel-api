// Smart 404 handler registered via app.notFound().
//
// Routing logic:
//   /api/*  → JSON ApiError  { success: false, message, statusCode: 404 }
//   /*      → 404.html with the requested path injected into #requested-path
//
// The HTML template contains the literal placeholder __REQUESTED_PATH__ which
// is replaced at response time — no templating engine needed.

import { readFileSync } from "node:fs";
import type { Context } from "hono";
import type { ApiError } from "@/types/auth";
import { pathConfig } from "../configs/path.config";

// ── Load template once at startup (zero disk I/O per request) ─────────────────
const notFoundHtml = readFileSync(pathConfig.htmlPages.notFound, "utf-8");

// ── Placeholder written into the HTML template ────────────────────────────────
const PATH_PLACEHOLDER = "__REQUESTED_PATH__";

// ── Handler ───────────────────────────────────────────────────────────────────

export const notFoundHandler = (c: Context): Response => {
  const pathname = new URL(c.req.url).pathname;

  // Any path that starts with /api → generic JSON response.
  // This covers /api/auth/notfound, /api/users/xyz, /api/anything.
  if (pathname.startsWith("/api")) {
    const body: ApiError = {
      success: false,
      message: `Route ${c.req.method} ${pathname} not found`,
      statusCode: 404,
    };
    return c.json(body, 404);
  }

  // All other paths (browser navigation, direct URL entry) → HTML 404 page.
  // Sanitize the path before injecting it into HTML to prevent reflected XSS.
  const safePath = sanitizePath(pathname);
  const html = notFoundHtml.replace(PATH_PLACEHOLDER, safePath);

  return c.html(html, 404);
};

// ── XSS sanitizer ─────────────────────────────────────────────────────────────
// The path is injected inside a <span> in HTML context — escape the five
// dangerous HTML characters. This is sufficient for text-node injection.
// Never use this for injection into attributes, scripts, or style blocks.

const sanitizePath = (raw: string): string =>
  raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
