// JWT signing + verification via `jose` (Web Crypto API — Bun-native, no Node crypto dep).
// Uses TextEncoder to convert string secrets to Uint8Array as jose requires.

import { envAuthConfig as env } from "../env/auth.env";
import { SignJWT, jwtVerify } from "jose";
import { AppError } from "@packages/utils/errors.utils";
import type { JwtAccessPayload, JwtRefreshPayload } from "@/types/auth";

// ── Secret key helpers ────────────────────────────────────────────────────────

const encodeSecret = (secret: string): Uint8Array => new TextEncoder().encode(secret);

const accessSecret = encodeSecret(env.JWT_ACCESS_SECRET);
const refreshSecret = encodeSecret(env.JWT_REFRESH_SECRET);

// ── Duration parser ───────────────────────────────────────────────────────────
// jose accepts duration strings like '15m', '365d' directly in setExpirationTime

// ── Access token ──────────────────────────────────────────────────────────────

/**
 * Signs a new access token. Generates a fresh jti automatically.
 * Caller provides sub, email, role — jti is injected here.
 */
export const signAccessToken = async (payload: Omit<JwtAccessPayload, "jti">): Promise<string> => {
  const jti = crypto.randomUUID();
  return new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(accessSecret);
};

export const verifyAccessToken = async (token: string): Promise<JwtAccessPayload> => {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    // Narrow unknown jose payload to our typed shape
    return payload as unknown as JwtAccessPayload;
  } catch {
    throw AppError.unauthorized("Session expired, please login again");
  }
};

// ── Refresh token ─────────────────────────────────────────────────────────────

/**
 * Signs a new refresh token.
 * jti here is the session row ID — used for revocation lookup.
 */
export const signRefreshToken = async (payload: JwtRefreshPayload): Promise<string> => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_REFRESH_EXPIRES_IN)
    .sign(refreshSecret);
};

export const verifyRefreshToken = async (token: string): Promise<JwtRefreshPayload> => {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload as unknown as JwtRefreshPayload;
  } catch {
    throw AppError.unauthorized("Session expired, please login again");
  }
};
