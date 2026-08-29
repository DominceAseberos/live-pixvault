import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { ApiRequest, ApiResponse, QueryValue } from "./lib/api.ts";

interface DevApiRequest extends IncomingMessage {
  query?: Record<string, QueryValue>;
  body?: unknown;
}

interface DevApiResponse extends ServerResponse {
  status(code: number): DevApiResponse;
  json(payload: unknown): DevApiResponse;
}

async function parseBody(req: DevApiRequest): Promise<void> {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method ?? "")) return;
  let body = "";
  for await (const chunk of req) {
    body += String(chunk);
    if (body.length > 64_000) throw new Error("Request body exceeds the 64 KB local development limit.");
  }
  if (!body) {
    req.body = {};
    return;
  }
  try {
    req.body = JSON.parse(body) as unknown;
  } catch {
    req.body = body;
  }
}

function apiDevPlugin(): Plugin {
  return {
    name: "pixvault-api-dev-server",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (incoming, outgoing, next) => {
        const req = incoming as DevApiRequest;
        const res = outgoing as DevApiResponse;
        const url = req.url ? new URL(req.url, `http://${req.headers.host || "localhost"}`) : null;
        if (!url || !url.pathname.startsWith("/api/")) return next();

        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (payload: unknown) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(payload));
          return res;
        };
        req.query = Object.fromEntries(url.searchParams.entries());

        try {
          await parseBody(req);
          const pathname = url.pathname.replace(/\/$/, "") || "/";
          let handler: ((request: ApiRequest, response: ApiResponse) => Promise<unknown>) | undefined;

          if (pathname === "/api/components") {
            handler = (await import("./api/components/index.ts")).default;
          } else if (pathname.startsWith("/api/components/")) {
            req.query.id = pathname.slice("/api/components/".length);
            handler = (await import("./api/components/[id].ts")).default;
          } else if (pathname === "/api/generate") {
            handler = (await import("./api/generate.ts")).default;
          } else if (pathname === "/api/inspiration") {
            handler = (await import("./api/inspiration.ts")).default;
          } else if (pathname === "/api/gifs") {
            handler = (await import("./api/gifs.ts")).default;
          }

          if (!handler) return next();
          await handler(req as ApiRequest, res as ApiResponse);
        } catch (error) {
          console.error("Vite API dev middleware error:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: error instanceof Error ? error.message : "Internal development server error" });
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [react(), apiDevPlugin()],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  };
});
