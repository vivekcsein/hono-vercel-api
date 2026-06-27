// Simple in-memory rate limiter — no Redis dependency.
// 10 requests per IP per 15-minute window. Resets automatically after window expires.
// NOTE: this resets on server restart. For multi-instance deployments, replace with Redis.

import { createMiddleware } from "hono/factory";
import { AppError } from "@packages/utils/errors.utils";

type RateLimitEntry = {
  count: number;
  resetAt: number; // Unix ms timestamp when the window resets
};

const WINDOW_MS = 15 * 60 * 1_000; // 15 minutes
const MAX_REQUESTS = 10;

// Keyed by IP address string
const store = new Map<string, RateLimitEntry>();

export const rateLimiter = createMiddleware(async (c, next) => {
  // Hono provides the client IP via the CF-Connecting-IP header behind a proxy,
  // or falls back to the raw remote address.
  const ip =
    c.req.header("CF-Connecting-IP") ??
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
    c.req.header("X-Real-IP") ??
    "unknown";

  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    // First request in window or window has expired — reset
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    throw AppError.tooManyRequests("Too many requests, please try again later");
  }

  entry.count += 1;
  return next();
});
