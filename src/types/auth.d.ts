// src/types/auth.d.ts
// Shared types. Snake_case field names mirror the frontend contract exactly.
// FROZEN — do not rename, re-case, or restructure without updating the frontend.

export type UserRole = "USER" | "ADMIN";

// Exact shape returned in every auth response — omits password_hash
export type User = {
  id: string;
  email: string;
  fullname: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string; // ISO 8601 string
  updated_at: string; // ISO 8601 string
};

export type Session = {
  expires_at: number; // Unix ms timestamp
  expires_in: number; // days
};

// Generic success envelope — data fields spread at root, not nested under "data"
export type ApiSuccess<T> = { success: true; message: string } & T;

// Error envelope matching frontend ApiError type exactly
export type ApiError = {
  success: false;
  message: string;
  statusCode: number;
};

// JWT payloads — typed so verifyToken callers get narrowed results
export type JwtAccessPayload = {
  sub: string; // user UUID
  email: string;
  role: UserRole;
  jti: string; // unique token ID
};

export type JwtRefreshPayload = {
  sub: string; // user UUID
  jti: string; // session row ID — used for revocation lookup
};

// Hono context variable map — injected by authenticate middleware
export type HonoVariables = {
  user: JwtAccessPayload;
};
