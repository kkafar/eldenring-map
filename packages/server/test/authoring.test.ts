import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { config } from "../src/config.js";
import { migrateDatabase, openDatabase, type Db } from "../src/db/index.js";
import { seedDefaults } from "../src/db/seed.js";
import { appRouter } from "../src/routers/index.js";

let db: Db;
let caller: ReturnType<typeof appRouter.createCaller>;
let app: ReturnType<typeof createApp>;
let rootId: number;

beforeAll(() => {
  db = openDatabase(":memory:");
  migrateDatabase(db, config.migrationsDir);
  seedDefaults(db);
  caller = appRouter.createCaller({ db, userId: 1 });
  app = createApp(db, mkdtempSync(path.join(tmpdir(), "eldenring-test-")));
});

describe("categories", () => {
  it("creates two levels, refuses a third, and protects used categories", async () => {
    const roots = (await caller.categories.list()).filter(
      (c) => c.parentId === null,
    );
    rootId = roots.find((c) => c.slug === "location")!.id;
    const sub = await caller.categories.create({
      name: "Secret Spot",
      parentId: rootId,
    });
    expect(sub.slug).toBe("location-secret-spot");
    expect(sub.doneVerb).toBe("discovered");
    await expect(
      caller.categories.create({ name: "Deeper", parentId: sub.id }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    const dup = await caller.categories.create({
      name: "Secret Spot",
      parentId: rootId,
    });
    expect(dup.slug).toBe("location-secret-spot-2");
    await caller.categories.delete({ id: dup.id });
    await expect(
      caller.categories.delete({ id: rootId }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    const renamed = await caller.categories.update({
      id: sub.id,
      name: "Hidden Spot",
      icon: "location-cave.png",
    });
    expect(renamed.name).toBe("Hidden Spot");
  });
});

describe("markers authoring", () => {
  it("creates, updates, moves and deletes a marker with validation", async () => {
    const sub = (await caller.categories.list()).find(
      (c) => c.slug === "location-secret-spot",
    )!;
    await expect(
      caller.markers.create({
        mapId: "overworld",
        categoryId: sub.id,
        name: "x",
        x: 1,
        y: 1,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.markers.create({
        mapId: "overworld",
        categoryId: rootId,
        name: "x",
        x: 99_999,
        y: 1,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const created = await caller.markers.create({
      mapId: "overworld",
      categoryId: rootId,
      subcategoryId: sub.id,
      name: "My spot",
      description: "**mine**",
      x: 100,
      y: 200,
    });
    expect(created.source).toBe("user");
    const moved = await caller.markers.update({
      id: created.id,
      x: 300,
      subcategoryId: null,
    });
    expect(moved.x).toBe(300);
    expect(moved.subcategoryId).toBeNull();
    await expect(caller.categories.delete({ id: sub.id })).resolves.toEqual({
      id: sub.id,
    });
    await caller.markers.delete({ id: created.id });
    await expect(caller.markers.get({ id: created.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("upload route", () => {
  it("stores a PNG under its content hash and rejects other content", async () => {
    const png = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3,
    ]);
    const form = new FormData();
    form.append("file", new File([png], "pic.png", { type: "image/png" }));
    const res = await app.request("/api/upload", {
      method: "POST",
      body: form,
    });
    expect(res.status).toBe(200);
    const json = (await res.json()) as { filename: string; url: string };
    expect(json.filename).toMatch(/^[a-f0-9]{16}\.png$/);
    const served = await app.request(json.url);
    expect(served.status).toBe(200);
    expect(served.headers.get("content-type")).toBe("image/png");

    const bad = new FormData();
    bad.append(
      "file",
      new File([new TextEncoder().encode("hello")], "x.png", {
        type: "image/png",
      }),
    );
    expect(
      (await app.request("/api/upload", { method: "POST", body: bad })).status,
    ).toBe(415);
    expect((await app.request("/uploads/../etc/passwd")).status).toBe(404);
  });
});
