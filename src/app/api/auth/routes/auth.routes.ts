// Hono router for all /auth/* endpoints.
// Middleware is applied per-route — not globally — to keep public routes unprotected.

import { Hono } from "hono";
import { rateLimiter } from "@/packages/middlewares/rateLimiter";
import { authenticate } from "@/packages/middlewares/authenticate";

import {
  signUpHandler,
  signInHandler,
  signOutHandler,
  refreshHandler,
  getMeHandler,
} from "../controllers/auth.controller";

const authRouter = new Hono();

// Rate-limited public routes
authRouter.post("/signup", rateLimiter, signUpHandler);
authRouter.post("/signin", rateLimiter, signInHandler);

// Requires a valid session
authRouter.post("/signout", authenticate, signOutHandler);

// No rate limiter on refresh — it's already authenticated via httpOnly cookie
authRouter.post("/refresh", refreshHandler);

// Requires a valid session
authRouter.get("/me", authenticate, getMeHandler);

export default authRouter;
