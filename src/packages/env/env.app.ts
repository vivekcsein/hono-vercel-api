import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

// ✅ Schema uses the actual env var names (with NEXT_PUBLIC_ prefix)
const envConfigSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Backend 2026"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("1.0.0"),
  NEXT_PUBLIC_APP_HOST: z.string().default("localhost"),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_PORT: z
    .string()
    .default("7164")
    .transform((val) => Number(val)),
  API_PATH: z.string().default("/api"),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"), //15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default("10"), //10 requests per windowMs
  LOG_DIR: z.string().default("logs"),
  LOG_LEVEL: z.string().default("info"),
});

// ✅ Validate process.env
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid app environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

// ✅ Map validated vars to clean keys
export const envAppConfig = Object.freeze({
  APP_NAME: parsed.data.NEXT_PUBLIC_APP_NAME,
  APP_VERSION: parsed.data.NEXT_PUBLIC_APP_VERSION,
  APP_HOST: parsed.data.NEXT_PUBLIC_APP_HOST,
  NODE_ENV: parsed.data.NEXT_PUBLIC_APP_ENV,
  APP_PORT: parsed.data.NEXT_PUBLIC_APP_PORT,
  API_PATH: parsed.data.API_PATH,
  RATE_LIMIT_WINDOW_MS: parsed.data.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: parsed.data.RATE_LIMIT_MAX_REQUESTS,
  LOG_DIR: parsed.data.LOG_DIR,
  LOG_LEVEL: parsed.data.LOG_LEVEL,
});

// ✅ Optional: Type-safe config
export type EnvAppConfig = typeof envAppConfig;
