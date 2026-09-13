import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/index.js";
import { markerProgress } from "../db/schema.js";
import { assertProfileOwned } from "../trpc/guards.js";
import { publicProcedure, router } from "../trpc/init.js";

const idSchema = z.number().int().positive();

export const progressRouter = router({
  list: publicProcedure
    .input(z.object({ profileId: idSchema }))
    .query(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      return ctx.db
        .select({
          markerId: markerProgress.markerId,
          doneAt: markerProgress.doneAt,
        })
        .from(markerProgress)
        .where(eq(markerProgress.profileId, input.profileId))
        .all();
    }),
  set: publicProcedure
    .input(
      z.object({ profileId: idSchema, markerId: idSchema, done: z.boolean() }),
    )
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      setDone(ctx.db, input.profileId, input.markerId, input.done);
      return { markerId: input.markerId, done: input.done };
    }),
  setMany: publicProcedure
    .input(
      z.object({
        profileId: idSchema,
        markerIds: z.array(idSchema).max(5000),
        done: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      ctx.db.transaction((tx) => {
        for (const markerId of input.markerIds)
          setDone(tx, input.profileId, markerId, input.done);
      });
      return { count: input.markerIds.length, done: input.done };
    }),
});

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

function setDone(
  db: Db | Tx,
  profileId: number,
  markerId: number,
  done: boolean,
) {
  if (done) {
    db.insert(markerProgress)
      .values({ profileId, markerId })
      .onConflictDoNothing()
      .run();
  } else {
    db.delete(markerProgress)
      .where(
        and(
          eq(markerProgress.profileId, profileId),
          eq(markerProgress.markerId, markerId),
        ),
      )
      .run();
  }
}
