console.log("Creating database");

import { Database } from "sqlite3";
import { DBProfilesRow, Profile, User } from "./types";
import mockUsers from './data/mock-users.json';
import mockProfiles from './data/mock-profiles.json';

const DB_PATH = './data/main.db3';

function initDatabase(db: Database) {
  console.log("Initializing database");
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (name TEXT PRIMARY KEY);");
    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        user_name TEXT NOT NULL,
        profile_name TEXT NOT NULL,
        PRIMARY KEY (user_name, profile_name),
        FOREIGN KEY (user_name)
          REFERENCES users (name)
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
    );`);
  });
}

export class DatabaseProxy {
  conn: Database;

  constructor(conn: Database) {
    this.conn = conn;
  }

  insertUser(user: User) {
    this.conn.run("INSERT INTO users (name) VALUES (?);", user.name);
  }

  async listUsers(): Promise<Array<User>> {
    return new Promise((resolve, reject)  => {
      this.conn.all("SELECT * FROM users;", function (err, rows: Array<User>) {
        if (err != null) {
          reject(err);
        }
        resolve(rows);
      });
    })
  }

  async listUserProfiles(user: User): Promise<Array<Profile>> {
    return new Promise((resolve, reject) => {
      this.conn.all("SELECT * FROM profiles WHERE user_name = ?;", user.name, function (err, rows: Array<DBProfilesRow>) {
        if (err != null) {
          reject(err);
        }
        resolve(rows.map(row => ({ name: row.profile_name })));
      })
    });
  }

  _clearDatabase() {
    console.log("Removing all records from 'users' table");
    this.conn.run("DELETE FROM users;");
  }

  _fillWithMockData() {
    console.log("Filling database with mock data");
    const stmt1 = this.conn.prepare("INSERT INTO users (name) VALUES (?);");
    mockUsers.forEach(user => {
      stmt1.run(user.userName);
    });
    stmt1.finalize();

    const stmt2 = this.conn.prepare("INSERT INTO profiles (user_name, profile_name) VALUES (?,?);")
    mockUsers.forEach(user => {
      mockProfiles.forEach(profileName => {
        stmt2.run(user.userName, profileName);
      });
    });
    stmt2.finalize();
  }

  reset() {
    this._clearDatabase();
    this._fillWithMockData();
  }
}

export function createConnection(): DatabaseProxy {
  const instance = new Database(DB_PATH);
  initDatabase(instance);
  return new DatabaseProxy(instance);
}

