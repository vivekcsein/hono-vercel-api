// libs/middlewares/httpLogger.ts
import morgan from "morgan";
// import type { Request, Response } from "express";

// Use 'dev' format for concise colored output
export const httpLogger = morgan("dev");

// Optional: custom format for more control
// export const httpLogger = morgan(':method :url :status :res[content-length] - :response-time ms');
