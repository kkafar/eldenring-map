import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Context, Hono } from "hono";
import { contentTypeFor } from "./upload.js";

const IMMUTABLE = "public, max-age=31536000, immutable";
const NO_CACHE = "no-cache";
const STATIC_TYPES: Record<string, string> = {
  html: "text/html; charset=utf-8",
  js: "text/javascript",
  css: "text/css",
  json: "application/json",
  map: "application/json",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpeg",
  ico: "image/x-icon",
  txt: "text/plain; charset=utf-8",
  woff: "font/woff",
  woff2: "font/woff2",
};

// Tiles and icons are immutable files under the data directory. Route parameter
// patterns admit only safe path segments, so the resolved path cannot escape its root.
export function registerStaticRoutes(app: Hono, dataDir: string) {
  app.get("/tiles/blank.png", (c) =>
    sendFile(c, path.join(dataDir, "tiles", "blank.png"), "image/png"),
  );
  app.get(
    "/tiles/:mapId{[a-z0-9-]+}/:z{[0-9]{1,2}}/:y{[0-9]{1,4}}/:x{[0-9]{1,4}\\.jpg}",
    (c) => {
      const { mapId, z, y, x } = c.req.param();
      return sendFile(
        c,
        path.join(dataDir, "tiles", mapId, z, y, x),
        "image/jpeg",
      );
    },
  );
  app.get("/icons/:file{[A-Za-z0-9_-]+\\.png}", (c) =>
    sendFile(c, path.join(dataDir, "icons", c.req.param("file")), "image/png"),
  );
  app.get("/uploads/:file{[a-f0-9]{16}\\.(?:png|jpg|webp)}", (c) => {
    const file = c.req.param("file");
    return sendFile(
      c,
      path.join(dataDir, "uploads", file),
      contentTypeFor(file) ?? "application/octet-stream",
    );
  });
}

async function sendFile(
  c: Context,
  file: string,
  contentType: string,
  cacheControl = IMMUTABLE,
) {
  try {
    const data = await readFile(file);
    return c.body(data, 200, {
      "Content-Type": contentType,
      "Cache-Control": cacheControl,
    });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return c.notFound();
    throw err;
  }
}

// Production only: serves the built client with an SPA fallback to index.html.
// Register last so API and asset routes keep precedence.
export function registerClientRoutes(app: Hono, clientDist: string) {
  const root = path.resolve(clientDist);
  const index = path.join(root, "index.html");
  app.get("*", async (c) => {
    const requested = path.resolve(
      root,
      "." + decodeURIComponent(new URL(c.req.url).pathname),
    );
    const ext = path.extname(requested).slice(1);
    // Anything that looks like a file is served only from inside dist, never from index.html.
    if (ext) {
      if (!requested.startsWith(root + path.sep)) return c.notFound();
      const cache = requested.includes(`${path.sep}assets${path.sep}`)
        ? IMMUTABLE
        : NO_CACHE;
      return sendFile(
        c,
        requested,
        STATIC_TYPES[ext] ?? "application/octet-stream",
        cache,
      );
    }
    return sendFile(c, index, STATIC_TYPES["html"]!, NO_CACHE);
  });
}
