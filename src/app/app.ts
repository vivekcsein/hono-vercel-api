import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";

const createApp = (): Hono => {
  const app = new Hono();

  // ── Global middleware ──────────────────────────────────────────
  app.use("*", requestId());
  app.use("*", logger());
  app.use("*", secureHeaders());
  app.use(
    "*",
    cors({
      origin: "*",
      credentials: true,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    }),
  );

  app.get("/", (c) => {
    return c.text("Hello World!");
  });

  app.get("/health", (c) => {
    return c.json({ status: "ok" });
  });

  // ── Mount future routes here ───────────────────────────────────
  // import usersRoute from '@app/api/users/route'
  // app.route('/api/users', usersRoute)

  // ── Error handler ──────────────────────────────────────────────
  app.onError((err, c) => {
    return c.json({ error: err.message }, 500);
  });

  app.notFound((c) => {
    return c.json({ error: `Route ${c.req.path} not found` }, 404);
  });

  return app;
};

export default createApp;
