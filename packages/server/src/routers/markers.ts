import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "../db/index.js";
import { categories, maps, markers } from "../db/schema.js";
import { publicProcedure, router } from "../trpc/init.js";

const idSchema = z.number().int().positive();
const nameSchema = z.string().trim().min(1).max(200);
const imageSchema = z.string().regex(/^[a-f0-9]{16}\.(?:png|jpg|webp)$/);

export const markersRouter = router({
  // Lean rows for the map layer and list; descriptions come from `get`.
  list: publicProcedure
    .input(z.object({ mapId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db
        .select({
          id: markers.id,
          name: markers.name,
          categoryId: markers.categoryId,
          subcategoryId: markers.subcategoryId,
          x: markers.x,
          y: markers.y,
          icon: markers.icon,
        })
        .from(markers)
        .where(eq(markers.mapId, input.mapId))
        .all(),
    ),
  get: publicProcedure
    .input(z.object({ id: idSchema }))
    .query(({ ctx, input }) => getMarker(ctx.db, input.id)),
  create: publicProcedure
    .input(
      z.object({
        mapId: z.string(),
        categoryId: idSchema,
        subcategoryId: idSchema.nullish(),
        name: nameSchema,
        description: z.string().max(20_000).default(""),
        image: imageSchema.nullish(),
        x: z.number(),
        y: z.number(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const map = ctx.db
        .select()
        .from(maps)
        .where(eq(maps.id, input.mapId))
        .get();
      if (!map)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `map ${input.mapId} not found`,
        });
      assertInside(map, input.x, input.y);
      assertCategoryPair(ctx.db, input.categoryId, input.subcategoryId ?? null);
      return ctx.db
        .insert(markers)
        .values({
          mapId: input.mapId,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId ?? null,
          name: input.name,
          description: input.description,
          image: input.image ?? null,
          x: input.x,
          y: input.y,
          source: "user",
        })
        .returning()
        .get();
    }),
  update: publicProcedure
    .input(
      z.object({
        id: idSchema,
        categoryId: idSchema.optional(),
        subcategoryId: idSchema.nullish(),
        name: nameSchema.optional(),
        description: z.string().max(20_000).optional(),
        image: imageSchema.nullish(),
        x: z.number().optional(),
        y: z.number().optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const existing = getMarker(ctx.db, input.id);
      const { id, ...changes } = input;
      const categoryId = changes.categoryId ?? existing.categoryId;
      const subcategoryId =
        changes.subcategoryId === undefined
          ? existing.subcategoryId
          : changes.subcategoryId;
      assertCategoryPair(ctx.db, categoryId, subcategoryId);
      if (changes.x !== undefined || changes.y !== undefined) {
        const map = ctx.db
          .select()
          .from(maps)
          .where(eq(maps.id, existing.mapId))
          .get();
        if (map)
          assertInside(map, changes.x ?? existing.x, changes.y ?? existing.y);
      }
      return ctx.db
        .update(markers)
        .set({ ...changes, subcategoryId })
        .where(eq(markers.id, id))
        .returning()
        .get();
    }),
  delete: publicProcedure
    .input(z.object({ id: idSchema }))
    .mutation(({ ctx, input }) => {
      getMarker(ctx.db, input.id);
      ctx.db.delete(markers).where(eq(markers.id, input.id)).run();
      return { id: input.id };
    }),
});

function getMarker(db: Db, id: number) {
  const row = db.select().from(markers).where(eq(markers.id, id)).get();
  if (!row)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `marker ${id} not found`,
    });
  return row;
}

function assertInside(
  map: { width: number; height: number },
  x: number,
  y: number,
) {
  if (x < 0 || y < 0 || x > map.width || y > map.height) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "position is outside the map",
    });
  }
}

// categoryId must be a root; subcategoryId, when given, must be one of its children.
function assertCategoryPair(
  db: Db,
  categoryId: number,
  subcategoryId: number | null,
) {
  const root = db
    .select()
    .from(categories)
    .where(eq(categories.id, categoryId))
    .get();
  if (!root || root.parentId !== null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "categoryId must be a top-level category",
    });
  }
  if (subcategoryId !== null) {
    const sub = db
      .select()
      .from(categories)
      .where(eq(categories.id, subcategoryId))
      .get();
    if (!sub || sub.parentId !== root.id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "subcategory does not belong to the category",
      });
    }
  }
}
