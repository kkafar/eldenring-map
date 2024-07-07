console.log("Creating database");

import { Database } from "sqlite3";

function initDatabase(db: Database) {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS test (userId INTEGER)");
  });
}

export function createConnection(): Database {
  const instance = new Database('./data/main.db3');
  initDatabase(instance);
  return instance;
}

