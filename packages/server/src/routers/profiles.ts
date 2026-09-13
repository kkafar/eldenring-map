import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/index.js";
import { profiles } from "../db/schema.js";
import { assertProfileOwned } from "../trpc/guards.js";
import { publicProcedure, router } from "../trpc/init.js";

const nameSchema = z.string().trim().min(1).max(80);
const idSchema = z.number().int().positive();

export const profilesRouter = router({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, ctx.userId))
      .orderBy(asc(profiles.createdAt), asc(profiles.id))
      .all(),
  ),
  create: publicProcedure
    .input(z.object({ name: nameSchema }))
    .mutation(({ ctx, input }) => {
      assertNameFree(ctx.db, ctx.userId, input.name);
      return ctx.db
        .insert(profiles)
        .values({ userId: ctx.userId, name: input.name })
        .returning()
        .get();
    }),
  rename: publicProcedure
    .input(z.object({ id: idSchema, name: nameSchema }))
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.id, ctx.userId);
      assertNameFree(ctx.db, ctx.userId, input.name, input.id);
      return ctx.db
        .update(profiles)
        .set({ name: input.name })
        .where(eq(profiles.id, input.id))
        .returning()
        .get();
    }),
  delete: publicProcedure
    .input(z.object({ id: idSchema }))
    .mutation(({ ctx, input }) => {
      assertProfileOwned(ctx.db, input.id, ctx.userId);
      ctx.db.delete(profiles).where(eq(profiles.id, input.id)).run();
      return { id: input.id };
    }),
});

function assertNameFree(
  db: Db,
  userId: number,
  name: string,
  exceptId?: number,
) {
  const existing = db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.userId, userId), eq(profiles.name, name)))
    .get();
  if (existing && existing.id !== exceptId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `a profile named "${name}" already exists`,
    });
  }
}
