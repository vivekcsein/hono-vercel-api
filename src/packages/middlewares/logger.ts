/**
 * @module logger
 * @description Enterprise-grade structured logger built on Winston.
 *   - Outputs JSON in production, colourised text in development.
 *   - Exposes a child-logger factory for per-module context.
 */

import * as fs from "node:fs";
import * as path from "node:path";

import winston from "winston";
import { envAppConfig } from "../env/env.app";

const { combine, timestamp, errors, json, colorize, printf, metadata } = winston.format;

// ─── Ensure log directory exists ──────────────────────────────────────────────

const logDir = path.resolve(process.cwd(), envAppConfig.LOG_DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ─── Custom formats ───────────────────────────────────────────────────────────

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : "";
    return `${String(ts)} [${level}] ${String(message)}${stack ? `\n${String(stack)}` : ""}${metaStr}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  metadata({ fillExcept: ["message", "level", "timestamp", "label"] }),
  json()
);

// ─── Transport configuration ──────────────────────────────────────────────────

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: envAppConfig.NODE_ENV === "production" ? prodFormat : devFormat,
  }),
];

if (envAppConfig.NODE_ENV !== "test") {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: prodFormat,
      maxsize: 10_485_760, // 10 MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: prodFormat,
      maxsize: 10_485_760,
      maxFiles: 10,
    })
  );
}

// ─── Root logger ──────────────────────────────────────────────────────────────

export const logger = winston.createLogger({
  level: envAppConfig.LOG_LEVEL,
  silent: envAppConfig.NODE_ENV === "test",
  transports,
  exitOnError: false,
});

// ─── Child logger factory ─────────────────────────────────────────────────────

/**
 * Creates a scoped child logger that prefixes every message with the module
 * label, making it easy to filter logs by subsystem.
 */
export function createLogger(moduleName: string): winston.Logger {
  return logger.child({ module: moduleName });
}
