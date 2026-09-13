import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { maps } from "../db/schema.js";
import { publicProcedure, router } from "../trpc/init.js";

export const mapsRouter = router({
  list: publicProcedure.query(({ ctx }) => ctx.db.select().from(maps).all()),
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      const row = ctx.db.select().from(maps).where(eq(maps.id, input.id)).get();
      if (!row)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `map ${input.id} not found`,
        });
      return row;
    }),
});
