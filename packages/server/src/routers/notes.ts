import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { notes } from "../db/schema.js";
import { assertProfileOwned } from "../trpc/guards.js";
import { publicProcedure, router } from "../trpc/init.js";

const idSchema = z.number().int().positive();

export const notesRouter = router({
  list: publicProcedure
    .input(z.object({ profileId: idSchema }))
    .query(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      return ctx.db
        .select({
          markerId: notes.markerId,
          body: notes.body,
          updatedAt: notes.updatedAt,
        })
        .from(notes)
        .where(eq(notes.profileId, input.profileId))
        .all();
    }),
  // One note per profile and marker; an empty body deletes it.
  upsert: publicProcedure
    .input(
      z.object({
        profileId: idSchema,
        markerId: idSchema,
        body: z.string().max(20_000),
      }),
    )
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      const where = and(
        eq(notes.profileId, input.profileId),
        eq(notes.markerId, input.markerId),
      );
      if (input.body.trim() === "") {
        ctx.db.delete(notes).where(where).run();
        return null;
      }
      return ctx.db
        .insert(notes)
        .values({
          profileId: input.profileId,
          markerId: input.markerId,
          body: input.body,
        })
        .onConflictDoUpdate({
          target: [notes.profileId, notes.markerId],
          set: { body: input.body, updatedAt: new Date() },
        })
        .returning()
        .get();
    }),
  delete: publicProcedure
    .input(z.object({ profileId: idSchema, markerId: idSchema }))
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.profileId, ctx.userId);
      ctx.db
        .delete(notes)
        .where(
          and(
            eq(notes.profileId, input.profileId),
            eq(notes.markerId, input.markerId),
          ),
        )
        .run();
      return { markerId: input.markerId };
    }),
});
