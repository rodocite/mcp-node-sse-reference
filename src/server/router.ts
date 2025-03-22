import { IncomingMessage, ServerResponse } from "node:http";

type RouteHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  url: string
) => Promise<void>;

interface Route {
  method: string;
  path: string | RegExp;
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];

  /**
   * Register a GET route handler
   */
  get(path: string | RegExp, handler: RouteHandler): Router {
    this.routes.push({ method: "GET", path, handler });
    return this;
  }

  /**
   * Register a POST route handler
   */
  post(path: string | RegExp, handler: RouteHandler): Router {
    this.routes.push({ method: "POST", path, handler });
    return this;
  }

  /**
   * Register route handlers for all methods
   */
  all(path: string | RegExp, handler: RouteHandler): Router {
    this.routes.push({ method: "ALL", path, handler });
    return this;
  }

  /**
   * Find matching route and execute handler
   */
  async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<boolean> {
    const { method, url } = req;

    if (!url || !method) {
      return false;
    }

    for (const route of this.routes) {
      // Check if method matches
      if (route.method !== "ALL" && route.method !== method) {
        continue;
      }

      // Check if path matches
      let isMatch = false;
      if (typeof route.path === "string") {
        if (route.path === "*") {
          isMatch = true;
        } else if (route.path.endsWith("*")) {
          const prefix = route.path.slice(0, -1);
          isMatch = url.startsWith(prefix);
        } else {
          isMatch = route.path === url;
        }
      } else if (route.path instanceof RegExp) {
        isMatch = route.path.test(url);
      }

      if (isMatch) {
        await route.handler(req, res, url);
        return true;
      }
    }

    return false;
  }
}
