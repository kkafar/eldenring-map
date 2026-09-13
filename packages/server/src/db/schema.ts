import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

const now = () => new Date();
const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(now);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(now)
    .$onUpdateFn(now);

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: createdAt(),
});

export const profiles = sqliteTable(
  "profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("profiles_user_name_idx").on(t.userId, t.name)],
);

export const maps = sqliteTable("maps", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  tileSize: integer("tile_size").notNull(),
  minZoom: integer("min_zoom").notNull(),
  maxZoom: integer("max_zoom").notNull(),
});

// Two levels: rows with parent_id NULL are roots (Location, Item, Enemy, NPC),
// rows with a parent are subcategories. Depth is enforced in application code.
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    parentId: integer("parent_id").references(
      (): AnySQLiteColumn => categories.id,
      {
        onDelete: "restrict",
      },
    ),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    icon: text("icon"),
    color: text("color"),
    doneVerb: text("done_verb").notNull().default("done"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("categories_parent_idx").on(t.parentId)],
);

export const markers = sqliteTable(
  "markers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mapId: text("map_id")
      .notNull()
      .references(() => maps.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    subcategoryId: integer("subcategory_id").references(() => categories.id),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    image: text("image"),
    icon: text("icon"),
    // Native pixels of the full-resolution map image, y downward.
    x: real("x").notNull(),
    y: real("y").notNull(),
    source: text("source", { enum: ["import", "user"] }).notNull(),
    sourceId: text("source_id"),
    // Original source coordinates, kept so a recalibration is a single UPDATE.
    sourceX: real("source_x"),
    sourceY: real("source_y"),
    wikiUrl: text("wiki_url"),
    // NULL = shared marker; reserved for per-user private markers later.
    ownerUserId: integer("owner_user_id").references(() => users.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("markers_source_idx").on(t.source, t.sourceId),
    index("markers_map_category_idx").on(t.mapId, t.categoryId),
  ],
);

// Row present = done for that profile; the verb comes from the category.
export const markerProgress = sqliteTable(
  "marker_progress",
  {
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    markerId: integer("marker_id")
      .notNull()
      .references(() => markers.id, { onDelete: "cascade" }),
    doneAt: integer("done_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    primaryKey({ columns: [t.profileId, t.markerId] }),
    index("marker_progress_marker_idx").on(t.markerId),
  ],
);

export const notes = sqliteTable(
  "notes",
  {
    profileId: integer("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    markerId: integer("marker_id")
      .notNull()
      .references(() => markers.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [primaryKey({ columns: [t.profileId, t.markerId] })],
);
