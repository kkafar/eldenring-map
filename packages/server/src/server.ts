import { serve } from "@hono/node-server";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createApp } from "./app.js";
import { config } from "./config.js";
import { migrateDatabase, openDatabase } from "./db/index.js";
import { seedDefaults } from "./db/seed.js";

mkdirSync(config.dataDir, { recursive: true });
const db = openDatabase(path.join(config.dataDir, "main.db3"));
migrateDatabase(db, config.migrationsDir);
seedDefaults(db);

const app = createApp(db, config.dataDir, config.clientDist);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`server listening on http://localhost:${info.port}`);
});
