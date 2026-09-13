import type { Db } from "../db/index.js";

// Single local user until authentication exists; auth later only changes how userId is derived.
export const LOCAL_USER_ID = 1;

// A type alias (not an interface) so it is assignable to the adapter's Record<string, unknown>.
export type Context = {
  db: Db;
  userId: number;
};

export function createContextFactory(db: Db) {
  return (): Context => ({ db, userId: LOCAL_USER_ID });
}
