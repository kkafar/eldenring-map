import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolves to packages/server whether running from src/ (tsx) or dist/ (node).
export const packageRoot = fileURLToPath(new URL("..", import.meta.url));

export const config = {
  port: Number(process.env.PORT ?? 8088),
  dataDir: process.env.DATA_DIR ?? path.join(packageRoot, "storage"),
  clientDist:
    process.env.CLIENT_DIST ?? path.join(packageRoot, "..", "client", "dist"),
  migrationsDir: path.join(packageRoot, "drizzle"),
  seedDir: path.join(packageRoot, "seed"),
} as const;
