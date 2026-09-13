import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import type { Db } from "./db/index.js";
import { existsSync } from "node:fs";
import path from "node:path";
import { registerClientRoutes, registerStaticRoutes } from "./http/static.js";
import { registerUploadRoute } from "./http/upload.js";
import { appRouter } from "./routers/index.js";
import { createContextFactory } from "./trpc/context.js";

export function createApp(db: Db, dataDir: string, clientDist?: string) {
  const app = new Hono();

  app.get("/api/health", (c) => c.json({ ok: true }));
  registerStaticRoutes(app, dataDir);
  registerUploadRoute(app, dataDir);
  app.use(
    "/api/trpc/*",
    trpcServer({
      router: appRouter,
      createContext: createContextFactory(db),
      endpoint: "/api/trpc",
    }),
  );

  if (clientDist && existsSync(path.join(clientDist, "index.html"))) {
    registerClientRoutes(app, clientDist);
  }

  return app;
}
