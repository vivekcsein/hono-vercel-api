// import { v4 as uuidv4 } from "uuid";
// import type { Request, Response, NextFunction } from "express";

// // By using declaration merging, we can extend the Express Request interface
// // to include our custom 'requestId' property. This makes it available
// // to other middlewares and request handlers in a type-safe way.
// declare global {
//   namespace Express {
//     export interface Request {
//       requestId: string;
//     }
//   }
// }

// /**
//  * Express middleware to assign a unique ID to each incoming request.
//  * It checks for an existing 'x-request-id' header. If not found, a new
//  * UUID is generated. The ID is attached to both the response header
//  * and the request object for downstream use.
//  *
//  * @param req - The Express request object.
//  * @param res - The Express response object.
//  * @param next - The next middleware function in the stack.
//  */
// const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
//   // Check for an existing request ID in the headers, otherwise generate a new one.
//   const incomingId = req.headers["x-request-id"];
//   const requestId =
//     typeof incomingId === "string" && incomingId.trim() !== ""
//       ? incomingId
//       : uuidv4();

//   // Set the request ID on the response header for client-side tracking.
//   res.setHeader("X-Request-ID", requestId);

//   // Attach the request ID to the Express request object.
//   // This is now type-safe thanks to the declaration merging above.
//   req.requestId = requestId;

//   next();
// };

// export default requestIdMiddleware;
