import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import type { Db } from "../db/index.js";
import { profiles } from "../db/schema.js";

// Every profile-scoped procedure goes through here, so multi-user later only
// needs a real userId in the context. Unowned profiles read as not found.
export function assertProfileOwned(db: Db, profileId: number, userId: number) {
  const row = db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .get();
  if (!row)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `profile ${profileId} not found`,
    });
}
