import { z } from "zod";

// ✅ Load environment variables from .env file
// ✅ Define schema with defaults and transformations
const envConfigSchema = z.object({
  CLIENT_ORIGIN: z.url().trim().default("http://localhost:3000"),
  CLIENT_API_ORIGIN: z.url().trim().default("http://localhost:3000/api"),
});

// ✅ Validate process.env safely
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid client environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

// ✅ Export validated config
export const envClientConfig = Object.freeze(parsed.data);

// ✅ Optional: Export type
export type EnvClientConfig = z.infer<typeof envConfigSchema>;
