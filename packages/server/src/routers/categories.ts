import { TRPCError } from "@trpc/server";
import { asc, eq, or } from "drizzle-orm";
import { readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../config.js";
import type { Db } from "../db/index.js";
import { categories, markers } from "../db/schema.js";
import { slugify } from "../lib/taxonomy.js";
import { publicProcedure, router } from "../trpc/init.js";

const idSchema = z.number().int().positive();
const nameSchema = z.string().trim().min(1).max(80);
const iconSchema = z.string().regex(/^[A-Za-z0-9_-]+\.png$/);
const verbSchema = z.string().trim().min(1).max(40);

export const categoriesRouter = router({
  // Flat list; the client builds the two-level tree from parentId.
  list: publicProcedure.query(({ ctx }) =>
    ctx.db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.name))
      .all(),
  ),
  // Icon files available for categories and markers.
  icons: publicProcedure.query(() =>
    readdirSync(path.join(config.dataDir, "icons"))
      .filter((file) => file.endsWith(".png"))
      .sort(),
  ),
  create: publicProcedure
    .input(
      z.object({
        name: nameSchema,
        parentId: idSchema.nullish(),
        icon: iconSchema.nullish(),
        doneVerb: verbSchema.optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const parent = input.parentId
        ? getCategory(ctx.db, input.parentId)
        : null;
      if (parent && parent.parentId !== null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "only two category levels are allowed",
        });
      }
      return ctx.db
        .insert(categories)
        .values({
          parentId: parent?.id ?? null,
          slug: uniqueSlug(
            ctx.db,
            parent
              ? `${parent.slug}-${slugify(input.name)}`
              : slugify(input.name),
          ),
          name: input.name,
          icon: input.icon ?? null,
          doneVerb: input.doneVerb ?? parent?.doneVerb ?? "done",
          sortOrder: parent ? 100 : 50,
        })
        .returning()
        .get();
    }),
  update: publicProcedure
    .input(
      z.object({
        id: idSchema,
        name: nameSchema.optional(),
        icon: iconSchema.nullish(),
        doneVerb: verbSchema.optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      getCategory(ctx.db, input.id);
      const { id, ...changes } = input;
      return ctx.db
        .update(categories)
        .set(changes)
        .where(eq(categories.id, id))
        .returning()
        .get();
    }),
  delete: publicProcedure
    .input(z.object({ id: idSchema }))
    .mutation(({ ctx, input }) => {
      getCategory(ctx.db, input.id);
      const child = ctx.db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.parentId, input.id))
        .get();
      const used = ctx.db
        .select({ id: markers.id })
        .from(markers)
        .where(
          or(
            eq(markers.categoryId, input.id),
            eq(markers.subcategoryId, input.id),
          ),
        )
        .get();
      if (child || used) {
        throw new TRPCError({
          code: "CONFLICT",
          message: child
            ? "delete or move its subcategories first"
            : "markers still use this category; reassign them first",
        });
      }
      ctx.db.delete(categories).where(eq(categories.id, input.id)).run();
      return { id: input.id };
    }),
});

function getCategory(db: Db, id: number) {
  const row = db.select().from(categories).where(eq(categories.id, id)).get();
  if (!row)
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `category ${id} not found`,
    });
  return row;
}

function uniqueSlug(db: Db, base: string): string {
  const taken = new Set(
    db
      .select({ slug: categories.slug })
      .from(categories)
      .all()
      .map((row) => row.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1)
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}
