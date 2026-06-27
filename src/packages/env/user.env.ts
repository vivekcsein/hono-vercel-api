import { z } from "zod";

import { UserRoles, UserRolesValues } from "../configs/roles.config";
import { emailRules, passwordRules, fullnameRules } from "../configs/schemas.config";

// ✅ Schema uses the actual env var names (with NEXT_PUBLIC_ prefix)
const envConfigSchema = z.object({
  DEFAULT_USER_ID: z.string().default("default-user-1"),
  DEFAULT_USER_FULLNAME: fullnameRules.default("John Doe"),
  DEFAULT_USER_EMAIL: emailRules.default("johndoe@gmail.com"),
  DEFAULT_USER_PASSWORD: passwordRules.default("johndoe#1234"),
  DEFAULT_USER_AVATAR_URL: z.string().default(""),
  DEFAULT_USER_ROLE: z.enum(UserRolesValues).default(UserRoles.USER),
  DEFAULT_USER_STATUS: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

// ✅ Validate process.env
const parsed = envConfigSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `❌ Invalid default User environment variables:\n${parsed.error.issues
      .map((i) => `• ${i.path.join(".")}: ${i.message}`)
      .join("\n")}`,
  );
}

// ✅ Map validated vars to clean keys
export const envDefaultUserConfig = Object.freeze(parsed.data);

// ✅ Optional: Type-safe config
export type EnvDefaultUserConfig = typeof envDefaultUserConfig;
