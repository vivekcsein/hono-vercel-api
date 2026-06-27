import { Hono } from "hono";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";
import { readFileSync } from "node:fs";
import { envClientConfig } from "@/packages/env/client.env";
import { pathConfig } from "@/packages/configs/path.config";
import { errorHandler } from "@/packages/utils/handlers.utils";

// routes
import staticRouter from "./api/static/static.routes";
import authRouter from "./api/auth/routes/auth.routes";
import { notFoundHandler } from "@/packages/middlewares/notFound";

const createApp = async () => {
  dotenv.config();

  // ── Hono app ───────────────────────────────────────────────────────────────────
  const app = new Hono();

  // ── Global middleware ─────────────────────────────────────────────────────────
  app.use(
    "*",
    cors({
      origin: envClientConfig.CLIENT_ORIGIN,
      credentials: true, // Required: allows the browser to send httpOnly cookies cross-origin
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  // ── Global error handler ──────────────────────────────────────────────────────
  // Must be registered via onError — not as middleware — for Hono's error propagation to work

  app.onError(errorHandler);

  // ──Home Route ───────────────────────────────────────────────────────────────────

  // ── Static file roots (register BEFORE auth routes) ──────────────────────────

  app.route("/", staticRouter); // handles /static/* and /views/*

  // ── Homepage — served at GET / ────────────────────────────────────────────────
  // readFileSync is fine here: file is read once at startup, not per-request.
  // For hot-reload in dev, move the read inside the handler (slight perf tradeoff).

  const homepage = readFileSync(pathConfig.htmlPages.homepage, "utf-8");

  app.get("/", (c) => c.html(homepage));

  // ── Routers ───────────────────────────────────────────────────────────────────
  app.route("/api/auth", authRouter);

  // ── Health check ──────────────────────────────────────────────────────────────

  app.get("/health", (c) =>
    c.json(
      {
        status: "ok",
        timestamp: Date.now(),
        env: process.env.NODE_ENV,
      },
      200,
    ),
  );

  // ── 404 catch-all ─────────────────────────────────────────────────────────────

  app.notFound(notFoundHandler); // ← smart 404 handler

  return app;
};

export default createApp;
