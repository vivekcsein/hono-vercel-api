// Thin wrappers around @node-rs/argon2 (Bun-compatible native bindings).
// Pure functions — no side effects, no imports beyond argon2 and errors.

import { hash, verify } from "@node-rs/argon2";
import { AppError } from "@packages/utils/errors.utils";

/**
 * Hashes a plaintext password with Argon2id.
 * Default options from @node-rs/argon2 are production-safe (memory: 65536, iterations: 3).
 */
export const hashPassword = async (plain: string): Promise<string> => {
  try {
    return await hash(plain);
  } catch (error: unknown) {
    console.error("[argon2] hashPassword failed:", error);
    throw new AppError("Password processing failed", 500, false);
  }
};

/**
 * Verifies a plaintext password against an Argon2id hash.
 * Returns true if match, false if not — never throws on mismatch.
 */
export const verifyPassword = async (storedHash: string, plain: string): Promise<boolean> => {
  try {
    return await verify(storedHash, plain);
  } catch (error: unknown) {
    console.error("[argon2] verifyPassword failed:", error);
    throw new AppError("Password verification failed", 500, false);
  }
};
