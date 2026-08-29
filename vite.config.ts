import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Custom Vite plugin to handle /api/* endpoints in local development
function apiDevPlugin() {
  return {
    name: "api-dev-server",
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url ? new URL(req.url, `http://${req.headers.host || "localhost"}`) : null;
        if (!url || !url.pathname.startsWith("/api/")) {
          return next();
        }

        // Bridge res.status and res.json for Express/Vercel-style handlers
        res.status = (code: number) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data: any) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(data));
          return res;
        };

        // Parse query params into req.query
        req.query = Object.fromEntries(url.searchParams.entries());

        // Parse JSON body if present
        if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
          let body = "";
          req.on("data", (chunk: any) => {
            body += chunk;
          });
          await new Promise<void>((resolve) => req.on("end", () => resolve()));
          try {
            req.body = body ? JSON.parse(body) : {};
          } catch {
            req.body = body;
          }
        }

        try {
          const pathname = url.pathname;
          if (pathname === "/api/components" || pathname === "/api/components/") {
            const { default: handler } = await import("./api/components/index.ts");
            return await handler(req, res);
          }

          if (pathname.startsWith("/api/components/")) {
            const id = pathname.replace("/api/components/", "").replace(/\/$/, "");
            req.query.id = id;
            const { default: handler } = await import("./api/components/[id].ts");
            return await handler(req, res);
          }

          if (pathname === "/api/generate" || pathname === "/api/generate/") {
            const { default: handler } = await import("./api/generate.ts");
            return await handler(req, res);
          }

          if (pathname === "/api/inspiration" || pathname === "/api/inspiration/") {
            const { default: handler } = await import("./api/inspiration.ts");
            return await handler(req, res);
          }

          if (pathname === "/api/gifs" || pathname === "/api/gifs/") {
            const { default: handler } = await import("./api/gifs.ts");
            return await handler(req, res);
          }

          next();
        } catch (error: any) {
          console.error("Vite API dev middleware error:", error);
          res.status(500).json({ error: error.message || "Internal Dev Server Error" });
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables (including non-VITE_ for server dev) into process.env
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), apiDevPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
