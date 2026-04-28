import path from "path";
import express, { type Request, type Response } from "express";

// Middlewares
import compression from "compression";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./packages/middlewares/cors";
import { createLogger } from "./packages/middlewares/logger";
import helmetMiddleware from "./packages/middlewares/helmet";
import { generalLimiter } from "./packages/middlewares/rateLimit";
import { NotFoundHandler, errorHandler } from "./packages/utils/NotFoundHandler";

// Routes
import supabaseTestRoutes from "./api/test/test.supabase";

const log = createLogger("app");

const createApp = async (): Promise<express.Express> => {
  const app = express();

  // 🔐 Security headers
  app.use(helmetMiddleware);

  // 🧊 Compression for faster responses
  app.use(compression());

  // 🍪 Cookie and CORS
  app.use(corsMiddleware);
  app.use(cookieParser());

  // 📦 Body parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // if (process.env.NODE_ENV === "development") {
  //   app.use(httpLogger);
  // }

  // ─── HTTP request logging ─────────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      log.http("Request completed", {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${Date.now() - start}ms`,
        // requestId: req.requestId || undefined,
        ip: req.ip,
      });
    });
    next();
  });

  // 🚦 Rate limiter BEFORE routes
  app.use(generalLimiter);

  // 🧱 Static assets
  const viewsPath = path.join(process.cwd(), "public", "views");
  app.use(express.static(viewsPath, { maxAge: "1d", etag: true }));

  // 🛣️ Routes
  app.get(["/", "/index", "/index.html"], (_req: Request, res: Response) => {
    res.type("html").sendFile(path.join(viewsPath, "index.html"));
  });

  app.use("/api/test", supabaseTestRoutes);

  // 🩺 Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: Math.floor(process.uptime()),
      version: process.env["npm_package_version"] ?? "1.0.0",
    });
  });

  // 🧹 Catch-all 404 and error handler
  app.use(NotFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
