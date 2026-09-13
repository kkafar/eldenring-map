import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

export function openDatabase(file: string) {
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  sqlite.pragma("synchronous = NORMAL");
  return drizzle(sqlite, { schema });
}

export type Db = ReturnType<typeof openDatabase>;

export function migrateDatabase(db: Db, migrationsFolder: string) {
  migrate(db, { migrationsFolder });
}
