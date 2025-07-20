import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/.";
import { User, Profile } from "../types";
import { DataStore } from "./data-store";
import { profilesTable, usersTable } from "./schema/sqlite";
import { eq, getTableColumns } from "drizzle-orm";

export function createDrizzleAdapter() {
  // This uses libsql (look at the module its imported from)
  const libsqlClient = createClient({ url: process.env.DB_FILE_NAME! });
  const drizzleAdapter = drizzle({ client: libsqlClient });
  return drizzleAdapter;
}

export type LibSQLDriverType = ReturnType<typeof createDrizzleAdapter>;

export class DataStoreSqliteImpl implements DataStore {
  private driver: LibSQLDriverType;

  constructor(driver: LibSQLDriverType) {
    this.driver = driver;
  }

  createUser(user: User): void {
    this.driver.insert(usersTable).values(user).onConflictDoNothing();
  }

  async fetchUsers(): Promise<User[]> {
    const result = await this.driver.select(getTableColumns(usersTable)).from(usersTable);
    return result;
  }

  async fetchUserProfiles(user: User): Promise<Profile[]> {
    const result = await this.driver
      .select(getTableColumns(profilesTable))
      .from(profilesTable)
      .where(eq(profilesTable.userName, user.name));
    return result.map(fullProfile => ({ name: fullProfile.profileName }));
  }
}
