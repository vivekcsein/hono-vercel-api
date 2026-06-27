import { z } from "zod";

// ✅ Load environment variables from .env file
// ✅ Define schema with defaults and transformations
const envConfigSchema = z.object({
  DATABASE_URL: z.url().trim().default("postgresql://user:password@localhost:5432/mydb"),
});

// ✅ Validate process.env safely
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid database environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

// ✅ Export validated config
export const envDBConfig = Object.freeze(parsed.data);

// ✅ Optional: Export type
export type EnvDBConfig = z.infer<typeof envConfigSchema>;
