import { type Request, type Response, type NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// 404 Not Found Handler
export const NotFoundHandler = (req: Request, res: Response): void => {
  const acceptsJson = req.accepts("json");
  const acceptsHtml = req.accepts("html");

  const message = `Route ${req.originalUrl} not found`;

  res.status(404);

  if (acceptsJson) {
    res.json({ success: false, message });
  } else if (acceptsHtml) {
    res.type("html").send(`<h1>404 - ${message}</h1>`);
  } else {
    res.type("text").send(`Error 404: ${message}`);
  }
};

// Centralized Error Handler
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction // unused in production
): void => {
  const isDev = process.env.NODE_ENV === "development";

  const statusCode = error.statusCode ?? 500;
  let message = error.message ?? "Internal Server Error";

  // Specific error overrides
  switch (error.name) {
    case "SequelizeValidationError":
      message = "Validation error";
      break;
    case "SequelizeUniqueConstraintError":
      message = "Resource already exists";
      break;
    case "JsonWebTokenError":
      message = "Invalid token";
      break;
    case "TokenExpiredError":
      message = "Token expired";
      break;
  }

  // Optional: Use external logger here
  if (isDev) {
    console.error("Error Details:", {
      message: error.message,
      stack: error.stack,
      statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && {
      stack: error.stack,
      error: error.name,
    }),
  });
};

// Async wrapper for route handlers
export const asyncHandler = <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
};
