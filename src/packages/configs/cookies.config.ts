// Hono cookie helpers. Security flags are HARDCODED per the frontend contract —
// never pass flags as arguments; callers cannot weaken them accidentally.

import type { Context } from "hono";
import { envAppConfig } from "../env/app.env";
import { setCookie, deleteCookie } from "hono/cookie";

const isProduction = envAppConfig.NODE_ENV === "production";

// ── Token lifetimes in seconds (match JWT expiry) ─────────────────────────────
const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 365 * 24 * 60 * 60; // 365 days

/**
 * Sets access_token + refresh_token httpOnly cookies.
 * Cookie flags conform exactly to the frontend cookie strategy.
 */
export const setAuthCookies = (c: Context, accessToken: string, refreshToken: string): void => {
  const sharedOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax" as const,
    path: "/",
  };

  setCookie(c, "access_token", accessToken, {
    ...sharedOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  setCookie(c, "refresh_token", refreshToken, {
    ...sharedOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
};

/**
 * Clears both auth cookies by setting maxAge to 0.
 * Must use identical path/domain as the set call or the browser ignores it.
 */
export const clearAuthCookies = (c: Context): void => {
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "Lax" as const,
    path: "/",
    maxAge: 0,
  };

  deleteCookie(c, "access_token", clearOptions);
  deleteCookie(c, "refresh_token", clearOptions);
};
