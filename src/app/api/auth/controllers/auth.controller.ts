// Thin Hono handlers. Single responsibility: validate body → call service → set cookies → respond.
// NO business logic here. All logic lives in auth.service.ts.

import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import type { ApiSuccess } from "@/types/auth";
import { AppError } from "@packages/utils/errors.utils";
import * as authService from "../services/auth.services.local";
import { signUpSchema, signInSchema } from "@packages/schemas/auth.schemas";
import { setAuthCookies, clearAuthCookies } from "@packages/configs/cookies.config";

// ── POST /api/auth/signup ──────────────────────────────────────────────────────

export const signUpHandler = async (c: Context): Promise<Response> => {
  const body: unknown = await c.req.json();
  const parsed = signUpSchema.safeParse(body);

  if (!parsed.success) {
    // Let errorHandler format the ZodError
    throw parsed.error;
  }

  const { user, session, accessToken, refreshToken } = await authService.signUp(parsed.data);

  setAuthCookies(c, accessToken, refreshToken);

  const response: ApiSuccess<{ user: typeof user; session: typeof session }> = {
    success: true,
    message: "Account created successfully",
    user,
    session,
  };

  return c.json(response, 201);
};

// ── POST /api/auth/signin ──────────────────────────────────────────────────────

export const signInHandler = async (c: Context): Promise<Response> => {
  const body: unknown = await c.req.json();
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    throw parsed.error;
  }

  const { user, session, accessToken, refreshToken } = await authService.signIn(parsed.data);

  setAuthCookies(c, accessToken, refreshToken);

  const response: ApiSuccess<{ user: typeof user; session: typeof session }> = {
    success: true,
    message: "Login successful",
    user,
    session,
  };

  return c.json(response, 200);
};

// ── POST /api/auth/signout ─────────────────────────────────────────────────────
// Requires authenticate middleware — c.var.user is guaranteed to be set

export const signOutHandler = async (c: Context): Promise<Response> => {
  const { sub: userId, jti } = c.var.user;

  await authService.signOut(userId, jti);

  clearAuthCookies(c);

  const response: ApiSuccess<Record<never, never>> = {
    success: true,
    message: "Logged out successfully",
  };

  return c.json(response, 200);
};

// ── POST /api/auth/refresh ─────────────────────────────────────────────────────

export const refreshHandler = async (c: Context): Promise<Response> => {
  const refreshToken = getCookie(c, "refresh_token");

  if (!refreshToken) {
    throw AppError.unauthorized("Session expired, please login again");
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await authService.refreshTokens(refreshToken);

  setAuthCookies(c, accessToken, newRefreshToken);

  const response: ApiSuccess<Record<never, never>> = {
    success: true,
    message: "Token refreshed",
  };

  return c.json(response, 200);
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────────
// Requires authenticate middleware — c.var.user is guaranteed to be set

export const getMeHandler = async (c: Context): Promise<Response> => {
  const { sub: userId } = c.var.user;

  const user = await authService.getMe(userId);

  const response: ApiSuccess<{ user: typeof user }> = {
    success: true,
    message: "User fetched successfully",
    user,
  };

  return c.json(response, 200);
};
