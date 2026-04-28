import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

// ✅ Load environment variables from .env file
// ✅ Define schema with defaults and transformations
const envConfigSchema = z.object({
  REDIS_URL: z.url().trim().default("redis-url"),
  REDIS_TOKEN: z.string().default("redis-token"),
  REDIS_CONNECTION_ON: z.boolean().default(false),
});

// ✅ Validate process.env safely
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid redis environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

// ✅ Export validated config
export const envRedisConfig = Object.freeze(parsed.data);

// ✅ Optional: Export type (for type-safe config)
export type EnvRedisConfig = z.infer<typeof envConfigSchema>;
