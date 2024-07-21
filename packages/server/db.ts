console.log("Creating database");

import { Database } from "sqlite3";
import { User } from "./types";

function initDatabase(db: Database) {
  console.log("Initializing database");
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (user_name TEXT PRIMARY KEY);");
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_name TEXT NOT NULL,
        profile_name TEXT NOT NULL,
        PRIMARY KEY (user_name, profile_name),
        FOREIGN KEY (user_name)
          REFERENCES users (user_name)
            ON UPDATE CASCADE
            ON DELETE CASCADE
    );`);
    db.run(`
      CREATE TABLE IF NOT EXISTS marker_visited (
        user_name TEXT NOT NULL,
        profile_name TEXT NOT NULL,
        marker_id INTEGER NOT NULL,
        PRIMARY KEY (user_name, profile_name, marker_id),
        FOREIGN KEY (user_name, profile_name)
          REFERENCES profiles (user_name, profile_name)
            ON UPDATE CASCADE
            ON DELETE CASCADE
    );`)
  });
}

export class DatabaseProxy {
  conn: Database;

  constructor(conn: Database) {
    this.conn = conn;
  }

  insertUser(user: User) {
    this.conn.run("INSERT INTO users (user_name) VALUES (?);", user.name);
  }
}

export function createConnection(): DatabaseProxy {
  const instance = new Database('./data/main.db3');
  initDatabase(instance);
  return new DatabaseProxy(instance);
}

