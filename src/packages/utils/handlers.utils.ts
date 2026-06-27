// Global Hono onError handler. Maps all thrown errors → ApiError envelope.
// Never leaks stack traces, DB internals, or untyped messages in production.

import { ZodError } from "zod";
import type { Context } from "hono";
import type { ApiError } from "@/types/auth";
import { AppError } from "@packages/utils/errors.utils";

export const errorHandler = (error: unknown, c: Context): Response => {
  // ── Operational AppError ─────────────────────────────────────────────────
  if (error instanceof AppError) {
    const body: ApiError = {
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    };
    return c.json(body, error.statusCode as Parameters<typeof c.json>[1]);
  }

  // ── Zod validation error ─────────────────────────────────────────────────
  if (error instanceof ZodError) {
    // Extract the first human-readable issue — don't expose raw Zod internals
    const firstIssue = error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation failed";

    const body: ApiError = {
      success: false,
      message,
      statusCode: 422,
    };
    return c.json(body, 422);
  }

  // ── Unhandled / programming error ────────────────────────────────────────
  // Log the real error server-side but never send it to the client
  console.error("[UnhandledError]", error);

  const body: ApiError = {
    success: false,
    message: "Internal server error",
    statusCode: 500,
  };
  return c.json(body, 500);
};
