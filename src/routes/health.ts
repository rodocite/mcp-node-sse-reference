import { IncomingMessage, ServerResponse } from "node:http";

/**
 * Handler for health check endpoint
 */
export async function healthCheckHandler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  res.writeHead(200, { "Content-Type": "text/plain" }).end("pong");
}
