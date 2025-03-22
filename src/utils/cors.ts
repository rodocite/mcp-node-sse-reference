import { IncomingMessage, ServerResponse } from "node:http";

/**
 * Handle CORS headers for the request
 */
export function setCorsHeaders(
  req: IncomingMessage,
  res: ServerResponse
): void {
  if (req.headers.origin) {
    try {
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    } catch (error) {
      console.error("Error setting CORS headers:", error);
    }
  }
}

/**
 * Handle preflight OPTIONS requests
 */
export function handleOptionsRequest(
  req: IncomingMessage,
  res: ServerResponse
): void {
  setCorsHeaders(req, res);
  res.writeHead(204);
  res.end();
}
