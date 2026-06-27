// src/types/global.d.ts
// Extends Hono's ContextVariableMap so ctx.var.user is fully typed everywhere.
// Import this file is not required — TypeScript picks it up via tsconfig include.

import type { HonoVariables } from "./api.d";

declare module "hono" {
  interface ContextVariableMap extends HonoVariables {}
}
