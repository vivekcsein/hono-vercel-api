import { envAppConfig } from "@/packages/env/app.env";
import { HealthResponse } from "@/packages/schemas/health.schema";

export const getHealthStatus = (): HealthResponse => ({
  status: "ok",
  message: "Server is running",
  timestamp: new Date().toISOString(),
  env: envAppConfig.NODE_ENV,
});
