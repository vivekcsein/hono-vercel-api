import "@vercel/node";
import type { Hono } from "hono";
import createApp from "./src/app/app";

// ── Types ──────────────────────────────────────────────────────────────────────
type AppInstance = Hono;

// ── Singleton boot state ───────────────────────────────────────────────────────
let _app: AppInstance | null = null;
let _bootError: Error | null = null;
let _booting: Promise<AppInstance> | null = null;

// ── Helpers ────────────────────────────────────────────────────────────────────
const jsonResponse = (body: Record<string, unknown>, status: number): globalThis.Response => {
  return new globalThis.Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

const isDev = (): boolean => process.env["NODE_ENV"] !== "production";

const log = {
  info: (msg: string): void => {
    process.stdout.write(`[INFO] ${msg}\n`);
  },
  error: (msg: string): void => {
    process.stderr.write(`[ERROR] ${msg}\n`);
  },
};

// ── Boot ───────────────────────────────────────────────────────────────────────
const boot = (): Promise<AppInstance> => {
  if (_booting) return _booting;

  _booting = Promise.resolve()
    .then(() => createApp())
    .then((app) => {
      _app = app;
      _booting = null;
      log.info("App booted successfully");
      return app;
    })
    .catch((err: unknown) => {
      _bootError = err instanceof Error ? err : new Error(String(err));
      _booting = null;
      log.error(`Fatal startup error: ${_bootError.message}`);
      throw _bootError;
    });

  return _booting;
};

// ── Vercel handler ─────────────────────────────────────────────────────────────
export default {
  async fetch(req: globalThis.Request): Promise<globalThis.Response> {
    // Warm path
    if (_app) {
      return _app.fetch(req);
    }

    // Boot failure path
    if (_bootError) {
      log.error(`Rejecting request — app failed to boot: ${_bootError.message}`);
      return jsonResponse(
        {
          status: "error",
          message: "Service unavailable. Application failed to initialize.",
          ...(isDev() && { detail: _bootError.message }),
        },
        503,
      );
    }

    // Cold start path
    try {
      const app = await boot();
      return app.fetch(req);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown boot error";
      log.error(`Boot threw during cold start: ${message}`);
      return jsonResponse(
        {
          status: "error",
          message: "Service unavailable.",
          ...(isDev() && { detail: message }),
        },
        503,
      );
    }
  },
};
