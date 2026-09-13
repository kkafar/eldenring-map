import { LOCAL_USER_ID } from "../trpc/context.js";
import { ROOT_CATEGORIES } from "../lib/taxonomy.js";
import type { Db } from "./index.js";
import { eq } from "drizzle-orm";
import { categories, maps, profiles, users } from "./schema.js";

// Idempotent defaults applied at every boot: the local user with one profile,
// the overworld map and the four root categories.
export function seedDefaults(db: Db) {
  db.insert(users)
    .values({ id: LOCAL_USER_ID, name: "local" })
    .onConflictDoNothing()
    .run();
  if (
    !db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, LOCAL_USER_ID))
      .get()
  ) {
    db.insert(profiles)
      .values({ userId: LOCAL_USER_ID, name: "Playthrough 1" })
      .run();
  }
  db.insert(maps)
    .values([
      {
        id: "overworld",
        name: "The Lands Between",
        width: 9728,
        height: 9216,
        tileSize: 256,
        minZoom: 0,
        maxZoom: 6,
      },
      {
        id: "underground",
        name: "Underground",
        width: 9728,
        height: 9216,
        tileSize: 256,
        minZoom: 0,
        maxZoom: 6,
      },
    ])
    .onConflictDoNothing()
    .run();
  db.insert(categories)
    .values(
      Object.entries(ROOT_CATEGORIES).map(([slug, root]) => ({
        slug,
        name: root.name,
        icon: root.icon,
        doneVerb: root.doneVerb,
        sortOrder: root.sortOrder,
      })),
    )
    .onConflictDoNothing()
    .run();
}
