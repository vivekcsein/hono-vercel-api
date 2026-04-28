import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

// ✅ Load environment variables from .env file
// ✅ Define schema with defaults and transformations
const envConfigSchema = z.object({
  SMTP_URL: z.string().default("smtp.gmail.com"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_SERVICE: z.string().default("Gmail"),
  SMTP_USER: z.string().default("your-email@gmail.com"),
  SMTP_PASSWORD: z.string().default("your-app-password"),
  SMTP_PORT: z.number().default(465),
});

// ✅ Validate process.env safely
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid nodemailer environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`
  );
}

// ✅ Export validated config
export const envNodemailerConfig = Object.freeze(parsed.data);

// ✅ Optional: Export type (for type-safe config)
export type EnvNodemailerConfig = z.infer<typeof envConfigSchema>;
