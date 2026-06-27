// Hono middleware: reads access_token cookie → verifies → sets ctx.var.user.
// Throws AppError.unauthorized() on any failure — errorHandler sends the 401.

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { AppError } from "../utils/errors.utils";
import { verifyAccessToken } from "../utils/jwt.utils";

export const authenticate = createMiddleware(async (c, next) => {
  const token = getCookie(c, "access_token");

  if (!token) {
    throw AppError.unauthorized("Authentication required");
  }

  // verifyAccessToken throws AppError.unauthorized() on invalid/expired token
  const payload = await verifyAccessToken(token);

  // Inject typed user into Hono context — available as c.var.user downstream
  c.set("user", payload);

  await next();
});
