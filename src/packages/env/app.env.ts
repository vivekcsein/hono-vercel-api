import { z } from "zod";

// ✅ Schema uses the actual env var names (with NEXT_PUBLIC_ prefix)
const envConfigSchema = z.object({
  APP_NAME: z.string().default("Enterprise Hono Backend"),
  APP_VERSION: z.string().default("1.0.0"),
  APP_DESCRIPTION: z.string().default("Production-ready Hono backend"),
  APP_HOST: z.string().default("localhost"),
  APP_PORT: z.coerce.number().default(7164),
  API_PATH: z.string().default("/api"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  APP_SECRET: z
    .string()
    .min(10, "APP_SECRET must be at least 10 characters")
    .default("super-secret-key"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), //15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100), //10 requests per windowMs

  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),

  ENABLE_REDIS: z.coerce.boolean().default(false),
  ENABLE_SMTP: z.coerce.boolean().default(false),
  ENABLE_SWAGGER: z.coerce.boolean().default(true),
  ENABLE_RATE_LIMIT: z.coerce.boolean().default(true),
  ENABLE_REQUEST_LOGGING: z.coerce.boolean().default(true),
});

// ✅ Validate process.env
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid app environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

// ✅ Map validated vars to clean keys
export const envAppConfig = Object.freeze({
  APP_NAME: parsed.data.APP_NAME,
  APP_VERSION: parsed.data.APP_VERSION,
  APP_HOST: parsed.data.APP_HOST,
  APP_PORT: parsed.data.APP_PORT,
  API_PATH: parsed.data.API_PATH,
  NODE_ENV: parsed.data.NODE_ENV,
  APP_SECRET: parsed.data.APP_SECRET,
  RATE_LIMIT_WINDOW_MS: parsed.data.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: parsed.data.RATE_LIMIT_MAX_REQUESTS,
  LOG_LEVEL: parsed.data.LOG_LEVEL,
  ENABLE_REDIS: parsed.data.ENABLE_REDIS,
  ENABLE_SMTP: parsed.data.ENABLE_SMTP,
  ENABLE_SWAGGER: parsed.data.ENABLE_SWAGGER,
  ENABLE_RATE_LIMIT: parsed.data.ENABLE_RATE_LIMIT,
  ENABLE_REQUEST_LOGGING: parsed.data.ENABLE_REQUEST_LOGGING,
});

// ✅ Optional: Type-safe config
export type EnvAppConfig = typeof envAppConfig;
