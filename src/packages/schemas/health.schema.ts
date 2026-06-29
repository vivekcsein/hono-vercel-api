import { z } from "zod";

export const healthSchema = z.object({
  status: z.enum(["ok", "error"]),
  message: z.string(),
  timestamp: z.string(),
  env: z.string(),
});

export type HealthResponse = z.infer<typeof healthSchema>;
