import * as Bun from "bun";
import createApp from "./app";
import { envAppConfig } from "@/packages/env/app.env";

const startServer = async (): Promise<void> => {
  try {
    const app = await createApp();

    // ── Server startup ────────────────────────────────────────────────────────────
    const server = Bun.serve({
      port: envAppConfig.APP_PORT,
      fetch: app.fetch,
    });

    if (envAppConfig.NODE_ENV === "development") {
      console.log(`🚀 Server running on port http://localhost:${server.port}`);
      console.log(`📚 API docs available at http://localhost:${server.port}/api/documentation`);
    }

    // Graceful shutdown: drain the DB connection pool on SIGINT / SIGTERM
    const shutdown = async (): Promise<void> => {
      console.log("\n🔌 Shutting down gracefully…");
      // await pool.end()
      process.exit(0);
    };

    process.on("SIGINT", () => {
      void shutdown();
    });
    process.on("SIGTERM", () => {
      void shutdown();
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
};

void startServer();
