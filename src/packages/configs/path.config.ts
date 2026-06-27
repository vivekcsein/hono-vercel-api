// src/packages/configs/path.config.ts
// Single source of truth for every filesystem path in the project.
// Import this instead of hand-rolling path.join() anywhere else.
//
// File-serving roots:
//   /static/*  → public/assets  (images, icons, fonts, downloads — cache-friendly)
//   /views/*   → src/assets/html  (HTML fragments served by the API)
//   /           → src/assets/html/homepage.html  (root landing page)
//
// Why two roots?
//   `src/assets` holds SOURCE HTML/CSS/JS — rendered by Hono, version-controlled.
//   `public/assets` holds BINARY STATIC FILES — images, icons — served with long
//    cache TTLs and no processing. Keep them separate so a build step can hash
//    public assets without touching HTML templates.

import { join as nodeJoin } from "node:path";

// process.cwd() is the project root when Bun starts src/app.ts
const ROOT = process.cwd();

// Helper: always forward-slash, cross-platform safe via Node's path.join
const join = (...paths: string[]): string => nodeJoin(...paths);

// ── Source paths (TypeScript / template source) ───────────────────────────────

const SRC = join(ROOT, "src");
const ASSETS_SRC = join(SRC, "assets");

// ── Public paths (static binary assets — images, icons, fonts) ───────────────

const PUBLIC = join(ROOT, "public");
const ASSETS_PUBLIC = join(PUBLIC, "assets");

// ── Fully-typed, immutable path registry ─────────────────────────────────────

export const pathConfig = {
  // ── Project root ────────────────────────────────────────────────────────────
  root: ROOT,

  // ── Source tree ─────────────────────────────────────────────────────────────
  src: SRC,

  // ── HTML templates served by Hono (c.html / serveStatic) ────────────────────
  // URL: GET /views/*  →  src/assets/html/*
  html: join(ASSETS_SRC, "html"),
  //   Specific pages (import directly for c.html() responses)
  htmlPages: {
    homepage: join(ASSETS_SRC, "html", "homepage.html"),
    notFound: join(ASSETS_SRC, "html", "404.html"),
    error: join(ASSETS_SRC, "html", "error.html"),
  },

  // ── CSS / JS co-located with templates ──────────────────────────────────────
  // URL: GET /views/css/*  →  src/assets/css/*
  css: join(ASSETS_SRC, "css"),
  // URL: GET /views/js/*   →  src/assets/js/*
  js: join(ASSETS_SRC, "js"),

  // ── Public binary assets (cache-friendly, no processing) ────────────────────
  public: PUBLIC,
  assets: ASSETS_PUBLIC,
  // URL: GET /static/images/*  →  public/assets/images/*
  images: join(ASSETS_PUBLIC, "images"),
  // URL: GET /static/icons/*   →  public/assets/icons/*
  icons: join(ASSETS_PUBLIC, "icons"),
  // URL: GET /static/fonts/*   →  public/assets/fonts/*
  fonts: join(ASSETS_PUBLIC, "fonts"),
  // URL: GET /static/downloads/* →  public/assets/downloads/*
  downloads: join(ASSETS_PUBLIC, "downloads"),
} as const;

// ── URL prefix map (mirrors the route mounts in app.ts) ───────────────────────
// Use these when building absolute URLs in HTML templates or API responses.
// Keep in sync with the serveStatic mounts in src/modules/static/static.routes.ts

export const urlPrefixes = {
  static: "/static", // public binary assets
  views: "/views", // HTML/CSS/JS templates
  images: "/static/images",
  icons: "/static/icons",
  fonts: "/static/fonts",
  downloads: "/static/downloads",
} as const;

// ── Helper: build a public URL for a static asset ─────────────────────────────

export const staticUrl = (relativePath: string): string =>
  `${urlPrefixes.static}/${relativePath.replace(/^\//, "")}`;

export const imageUrl = (filename: string): string => `${urlPrefixes.images}/${filename}`;

export const iconUrl = (filename: string): string => `${urlPrefixes.icons}/${filename}`;
