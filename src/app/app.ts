import { Hono } from "hono";
import { cors } from "hono/cors";
import * as dotenv from "dotenv";
import { logger } from "hono/logger";
import { readFileSync } from "node:fs";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { envClientConfig } from "../packages/env/client.env";
import { pathConfig } from "../packages/configs/path.config";
import { errorHandler } from "../packages/utils/handlers.utils";
import { notFoundHandler } from "../packages/middlewares/notFound";

// routes
import healthRouter from "./api/health/health.routes";
import staticRouter from "./api/static/static.routes";
import authRouter from "./api/auth/routes/auth.routes";

const createApp = async () => {
  dotenv.config();

  // ── Hono app ───────────────────────────────────────────────────────────────────
  const app = new Hono();

  // ── Global middleware ─────────────────────────────────────────────────────────

  app.use("*", requestId());
  app.use("*", logger());
  app.use("*", secureHeaders());
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

  // ── Static file roots (register BEFORE auth routes) ──────────────────────────
  app.route("/", staticRouter); // handles /static/* and /views/*

  // ──Home Route ───────────────────────────────────────────────────────────────────
  // ── Homepage — served at GET / ────────────────────────────────────────────────
  // readFileSync is fine here: file is read once at startup, not per-request.
  // For hot-reload in dev, move the read inside the handler (slight perf tradeoff).
  const homepage = readFileSync(pathConfig.htmlPages.homepage, "utf-8");
  app.get("/", (c) => c.html(homepage));

  // ── Routers ───────────────────────────────────────────────────────────────────
  app.route("/api/auth", authRouter);

  // ── Health check ──────────────────────────────────────────────────────────────
  app.route("/health", healthRouter);

  // ── 404 catch-all ─────────────────────────────────────────────────────────────
  app.notFound(notFoundHandler); // ← smart 404 handler

  return app;
};

export default createApp;
