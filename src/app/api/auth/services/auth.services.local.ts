// Version 1 — local in-memory DB (Map-based).
// All function signatures, return shapes, and error messages are IDENTICAL
// to the production Hono + Drizzle backend so the frontend contract never breaks.
// Swap the repository imports when migrating to Postgres — nothing else changes.

import { User, Session } from "@/types/auth";
import { AppError } from "@/packages/utils/errors.utils";
import { SignUpBody, SignInBody } from "@/packages/schemas/auth.schemas";
import { hashPassword, verifyPassword } from "@/packages/utils/argon.utils";

import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/packages/utils/jwt.utils";

import {
  findUserByEmail,
  createUser,
  getUserPassword,
  findUserById,
  updateUserPassword,
} from "@/packages/repository/local.repository";

// ── Constants ─────────────────────────────────────────────────────────────────

const REFRESH_EXPIRES_DAYS = 365;
const REFRESH_EXPIRES_MS = REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1_000;

// ── In-memory session store ───────────────────────────────────────────────────
// Mirrors the `sessions` table from the production DB.
// Key: refresh_jti  Value: SessionRecord

type SessionRecord = {
  id: string;
  user_id: string;
  refresh_jti: string;
  expires_at: number; // Unix ms
  is_revoked: boolean;
  created_at: Date;
};

// Module-level singleton — survives hot-reloads in dev, resets on process restart
const sessionStore = new Map<string, SessionRecord>();

// ── Private helpers ───────────────────────────────────────────────────────────

/**
 * Maps a User row → the frontend User DTO shape.
 * Omits any internal fields. FROZEN — must match the backend contract exactly.
 */
const toUserDto = (user: User): User => ({
  id: user.id,
  email: user.email,
  fullname: user.fullname,
  role: user.role,
  is_verified: user.is_verified,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

type TokenPair = {
  accessToken: string;
  refreshToken: string;
  refreshJti: string;
  session: Session;
};

/**
 * Generates a fresh access + refresh token pair and writes the session record.
 * Identical logic to the production service — only the persistence target differs.
 */
const generateTokensAndSession = async (
  userId: string,
  email: string,
  role: User["role"],
): Promise<TokenPair> => {
  const refreshJti = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const expiresAt = Date.now() + REFRESH_EXPIRES_MS;

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: userId, email, role }),
    signRefreshToken({ sub: userId, jti: refreshJti }),
  ]);

  // Persist to in-memory session store
  sessionStore.set(refreshJti, {
    id: sessionId,
    user_id: userId,
    refresh_jti: refreshJti,
    expires_at: expiresAt,
    is_revoked: false,
    created_at: new Date(),
  });

  const session: Session = {
    expires_at: expiresAt,
    expires_in: REFRESH_EXPIRES_DAYS,
  };

  return { accessToken, refreshToken, refreshJti, session };
};

// ── Public service functions ──────────────────────────────────────────────────

export const signUp = async (
  body: SignUpBody,
): Promise<{ user: User; session: Session; accessToken: string; refreshToken: string }> => {
  try {
    // 1. Email uniqueness check
    const existing = findUserByEmail(body.email);
    if (existing) {
      throw AppError.conflict("Email already registered");
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(body.password);

    // 3. Build and persist user
    const now = new Date().toISOString();
    const newUser: User = {
      id: crypto.randomUUID(),
      email: body.email.toLowerCase().trim(),
      fullname: body.fullname?.trim() || "",
      role: "USER",
      is_verified: false,
      created_at: now,
      updated_at: now,
    };

    await createUser({ user: newUser, hashedPassword });

    // 4. Generate tokens + session
    const { accessToken, refreshToken, session } = await generateTokensAndSession(
      newUser.id,
      newUser.email,
      newUser.role,
    );

    return { user: toUserDto(newUser), session, accessToken, refreshToken };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[signUp]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

export const signIn = async (
  body: SignInBody,
): Promise<{ user: User; session: Session; accessToken: string; refreshToken: string }> => {
  try {
    // 1. Lookup user — HARD: same error for unknown email AND wrong password
    const user = findUserByEmail(body.email);
    if (!user) {
      throw AppError.unauthorized("Invalid credentials");
    }

    // 2. Verify password — same message, never reveal which field failed
    const storedHash = getUserPassword(user.id);
    if (!storedHash) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const passwordValid = await verifyPassword(storedHash, body.password);
    if (!passwordValid) {
      throw AppError.unauthorized("Invalid credentials");
    }

    // 3. Generate tokens + session
    const { accessToken, refreshToken, session } = await generateTokensAndSession(
      user.id,
      user.email,
      user.role,
    );

    return { user: toUserDto(user), session, accessToken, refreshToken };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[signIn]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

export const signOut = async (userId: string, sessionJti: string): Promise<void> => {
  try {
    // Mark the session as revoked — mirrors `UPDATE sessions SET is_revoked = true`
    const record = sessionStore.get(sessionJti);
    if (record) {
      sessionStore.set(sessionJti, { ...record, is_revoked: true });
    }

    // Cleanup: evict all sessions belonging to this user (mirrors Drizzle delete by user_id)
    for (const [jti, session] of sessionStore.entries()) {
      if (session.user_id === userId) {
        sessionStore.delete(jti);
      }
    }
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[signOut]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

export const refreshTokens = async (
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; session: Session }> => {
  try {
    // 1. Verify JWT signature + expiry
    const payload = await verifyRefreshToken(refreshToken);

    // 2. Look up session by jti
    const sessionRecord = sessionStore.get(payload.jti);
    if (!sessionRecord || sessionRecord.is_revoked) {
      throw AppError.unauthorized("Session expired, please login again");
    }

    // 3. Lookup user to rebuild the access token payload
    const user = findUserById(payload.sub);
    if (!user) {
      throw AppError.unauthorized("Session expired, please login again");
    }

    // 4. Revoke old session before issuing new one (rotation — prevents replay)
    sessionStore.delete(payload.jti);

    // 5. Issue rotated token pair
    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      session,
    } = await generateTokensAndSession(user.id, user.email, user.role);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, session };
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[refreshTokens]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

export const getMe = async (userId: string): Promise<User> => {
  try {
    const user = findUserById(userId);
    if (!user) {
      throw AppError.unauthorized("User not found");
    }
    return toUserDto(user);
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[getMe]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
}: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  try {
    const user = findUserById(userId);
    if (!user) {
      throw AppError.unauthorized("User not found");
    }

    const storedHash = getUserPassword(userId);
    if (!storedHash) {
      throw AppError.unauthorized("User not found");
    }

    const isValid = await verifyPassword(storedHash, currentPassword);
    if (!isValid) {
      // Same message pattern — never say "current password is wrong"
      throw AppError.unauthorized("Invalid credentials");
    }

    const newHash = await hashPassword(newPassword);
    await updateUserPassword({ userId, hashedPassword: newHash });
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    console.error("[changePassword]", error);
    throw new AppError("Unexpected error occurred", 500, false);
  }
};

// ── Dev/test utility — never expose via HTTP ──────────────────────────────────

/** Wipes the session store. Used by test runners between test cases. */
export const _clearSessionStore = (): void => {
  sessionStore.clear();
};

/** Returns a snapshot of active sessions. Useful in tests. */
export const _getSessionCount = (): number => sessionStore.size;
