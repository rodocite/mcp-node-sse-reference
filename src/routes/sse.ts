import { IncomingMessage, ServerResponse } from "node:http";
import {
  getMcpServer,
  createSseTransport,
  getTransport,
  removeTransport,
} from "../mcp";

/**
 * Handle SSE connection setup
 */
export async function sseConnectionHandler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const transport = createSseTransport("/messages", res);

  res.on("close", async () => {
    // When the client disconnects, we only need to remove their specific transport
    // rather than closing the entire MCP server
    removeTransport(transport.sessionId);
    console.log(`Client disconnected: ${transport.sessionId}`);
  });

  try {
    await getMcpServer().connect(transport);
    await transport.send({
      jsonrpc: "2.0",
      method: "sse/connection",
      params: { message: "SSE Connection established" },
    });
  } catch (err) {
    console.error("Error connecting to server:", err);
    if (!res.writableEnded) {
      res.writeHead(500).end("Error connecting to server");
    }
  }
}

/**
 * Handle incoming messages for an established SSE connection
 */
export async function sseMessagesHandler(
  req: IncomingMessage,
  res: ServerResponse,
  url: string
): Promise<void> {
  // The sessionId is initially created when a client connects through sseConnectionHandler
  // and createSseTransport generates a unique ID for that connection.
  // Clients must include this same sessionId in the URL of subsequent requests
  // so the server knows which specific connection they're referring to.
  const urlObj = url.startsWith("http")
    ? new URL(url)
    : new URL(url, `http://${req.headers.host || "localhost"}`);

  const sessionId = urlObj.searchParams.get("sessionId");

  if (!sessionId) {
    res.writeHead(400).end("No sessionId");
    return;
  }

  const activeTransport = getTransport(sessionId);
  if (!activeTransport) {
    res.writeHead(400).end("No active transport");
    return;
  }

  try {
    await activeTransport.handlePostMessage(req, res);
  } catch (err) {
    console.error("Error handling message:", err);
    if (!res.writableEnded) {
      res.writeHead(500).end("Internal server error");
    }
  }
}
