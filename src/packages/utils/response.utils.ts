import type { Context } from "hono";

export const ok = <T>(c: Context, data: T, status = 200) =>
  c.json({ success: true, data }, status as 200);

export const err = (c: Context, message: string, status = 500) =>
  c.json({ success: false, error: message }, status as 500);
