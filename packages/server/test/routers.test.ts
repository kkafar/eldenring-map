import { beforeAll, describe, expect, it } from "vitest";
import { config } from "../src/config.js";
import { migrateDatabase, openDatabase, type Db } from "../src/db/index.js";
import { categories, markers } from "../src/db/schema.js";
import { seedDefaults } from "../src/db/seed.js";
import { appRouter } from "../src/routers/index.js";

let db: Db;
let caller: ReturnType<typeof appRouter.createCaller>;
let stranger: ReturnType<typeof appRouter.createCaller>;
let markerId: number;

beforeAll(() => {
  db = openDatabase(":memory:");
  migrateDatabase(db, config.migrationsDir);
  seedDefaults(db);
  caller = appRouter.createCaller({ db, userId: 1 });
  stranger = appRouter.createCaller({ db, userId: 2 });
  const root = db
    .select()
    .from(categories)
    .all()
    .find((c) => c.slug === "location")!;
  markerId = db
    .insert(markers)
    .values({
      mapId: "overworld",
      categoryId: root.id,
      name: "Test grace",
      x: 1,
      y: 2,
      source: "user",
    })
    .returning({ id: markers.id })
    .get().id;
});

describe("seed", () => {
  it("creates the overworld map, four roots and one profile", async () => {
    expect((await caller.maps.get({ id: "overworld" })).width).toBe(9728);
    const roots = (await caller.categories.list()).filter(
      (c) => c.parentId === null,
    );
    expect(roots.map((c) => c.slug).sort()).toEqual([
      "enemy",
      "item",
      "location",
      "npc",
    ]);
    expect((await caller.profiles.list()).map((p) => p.name)).toEqual([
      "Playthrough 1",
    ]);
  });
});

describe("markers", () => {
  it("lists lean rows and rejects unknown ids", async () => {
    const list = await caller.markers.list({ mapId: "overworld" });
    expect(list).toHaveLength(1);
    expect(Object.keys(list[0]!).sort()).toEqual(
      ["categoryId", "icon", "id", "name", "subcategoryId", "x", "y"].sort(),
    );
    await expect(caller.markers.get({ id: 999 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("profiles, progress and notes", () => {
  it("scopes profiles to the user and rejects duplicate names", async () => {
    const created = await caller.profiles.create({ name: "NG+" });
    await expect(caller.profiles.create({ name: "NG+" })).rejects.toMatchObject(
      { code: "CONFLICT" },
    );
    expect(await stranger.profiles.list()).toEqual([]);
    await expect(
      stranger.progress.list({ profileId: created.id }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await caller.profiles.rename({ id: created.id, name: "NG+2" });
    await caller.profiles.delete({ id: created.id });
    expect((await caller.profiles.list()).map((p) => p.name)).toEqual([
      "Playthrough 1",
    ]);
  });

  it("toggles progress per profile", async () => {
    const [profile] = await caller.profiles.list();
    const profileId = profile!.id;
    await caller.progress.set({ profileId, markerId, done: true });
    await caller.progress.set({ profileId, markerId, done: true });
    expect(
      (await caller.progress.list({ profileId })).map((p) => p.markerId),
    ).toEqual([markerId]);
    await caller.progress.set({ profileId, markerId, done: false });
    expect(await caller.progress.list({ profileId })).toEqual([]);
    await caller.progress.setMany({
      profileId,
      markerIds: [markerId],
      done: true,
    });
    expect(await caller.progress.list({ profileId })).toHaveLength(1);
  });

  it("keeps one note per marker and deletes it on empty body", async () => {
    const [profile] = await caller.profiles.list();
    const profileId = profile!.id;
    await caller.notes.upsert({ profileId, markerId, body: "first" });
    await caller.notes.upsert({ profileId, markerId, body: "second" });
    expect((await caller.notes.list({ profileId })).map((n) => n.body)).toEqual(
      ["second"],
    );
    await caller.notes.upsert({ profileId, markerId, body: "   " });
    expect(await caller.notes.list({ profileId })).toEqual([]);
  });
});
