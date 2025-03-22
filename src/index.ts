/**
 * MCP Reference Server
 *
 * This server provides:
 * 1. HTTP endpoints for health checks
 * 2. SSE-based MCP protocol support
 * 3. Various tools accessible via MCP
 */

import { Router } from "./server/router";
import { HttpServer } from "./server/http-server";
import { healthCheckHandler } from "./routes/health";
import { sseConnectionHandler, sseMessagesHandler } from "./routes/sse";
import { initializeMcpServer } from "./mcp";

// Initialize MCP server with tools
initializeMcpServer();

// Configure routes
const router = new Router();

// Health check route
router.get("/ping", healthCheckHandler);

// SSE routes
router.get("/sse", sseConnectionHandler);
router.post("/messages*", sseMessagesHandler);

// Create and start the server
const server = new HttpServer(router);
server.start(3001);

// Handle process termination
process.on("SIGINT", () => {
  console.log("Server shutting down...");
  process.exit(0);
});

console.log("Server initialized and routes configured");
