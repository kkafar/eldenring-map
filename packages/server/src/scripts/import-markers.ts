// Imports the source marker JSON into the database.
// Usage: pnpm --filter server import:markers [--dry-run] [--overwrite] [--wiki-base <url>]
//   --dry-run    run against an in-memory database and print statistics only
//   --overwrite  refresh already imported markers from the JSON (default: skip existing)
//   --wiki-base  base URL for relative wiki links; defaults to seed/markers/source.json
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import { config } from "../config.js";
import { migrateDatabase, openDatabase, type Db } from "../db/index.js";

type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
import { categories, maps, markers } from "../db/schema.js";
import { seedDefaults } from "../db/seed.js";
import { htmlToMarkdown, resolveHref } from "../lib/markdown.js";
import { classify, slugify, type RootSlug } from "../lib/taxonomy.js";
import {
  cleanName,
  iconBasename,
  parseCoordinate,
  toPixels,
  type Calibration,
} from "../lib/transform.js";

interface SourceItem {
  id: number;
  category: string;
  name: string;
  image: string;
  pageLink?: string;
  x: string;
  y: string;
  description: string;
}

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const overwrite = argv.includes("--overwrite");
const wikiBase = argValue("--wiki-base") ?? readSourceConfig()?.wikiBaseUrl;

const markersDir = path.join(config.seedDir, "markers");
const items = readJson<SourceItem[]>(path.join(markersDir, "items.json"));
const calibration = readJson<Calibration>(path.join(config.seedDir, "calibration.overworld.json"));

const db = openDatabase(dryRun ? ":memory:" : path.join(config.dataDir, "main.db3"));
migrateDatabase(db, config.migrationsDir);
seedDefaults(db);

const map = db.select().from(maps).where(eq(maps.id, calibration.mapId)).get();
if (!map) throw new Error(`map ${calibration.mapId} is not seeded`);
const roots = new Map(
  db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .all()
    .map((row) => [row.slug as RootSlug, row]),
);

const stats = { inserted: 0, updated: 0, skipped: 0, outOfBounds: 0 };
const bbox = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
const subcategoryIds = new Map<string, number>();

db.transaction((tx) => {
  for (const item of items) {
    const lat = parseCoordinate(item.x);
    const lng = parseCoordinate(item.y);
    const { x, y } = toPixels(calibration, lat, lng);
    bbox.minX = Math.min(bbox.minX, x);
    bbox.minY = Math.min(bbox.minY, y);
    bbox.maxX = Math.max(bbox.maxX, x);
    bbox.maxY = Math.max(bbox.maxY, y);
    if (x < 0 || y < 0 || x > map.width || y > map.height) {
      stats.outOfBounds += 1;
      console.warn(`out of bounds, skipped: #${item.id} ${cleanName(item.name)} -> (${x}, ${y})`);
      continue;
    }

    const classification = classify(item.category, iconBasename(item.image));
    const root = roots.get(classification.root);
    if (!root) throw new Error(`root category ${classification.root} is not seeded`);
    const subcategoryId = ensureSubcategory(
      tx,
      root.id,
      root.doneVerb,
      classification.root,
      classification.subcategory,
      classification.icon,
    );

    const values = {
      mapId: map.id,
      categoryId: root.id,
      subcategoryId,
      name: cleanName(item.name),
      description: htmlToMarkdown(item.description ?? "", { baseUrl: wikiBase }),
      icon: classification.markerIcon ?? null,
      x,
      y,
      source: "import" as const,
      sourceId: String(item.id),
      sourceX: lat,
      sourceY: lng,
      wikiUrl: item.pageLink ? (resolveHref(item.pageLink, wikiBase) ?? null) : null,
    };

    const existing = tx
      .select({ id: markers.id })
      .from(markers)
      .where(and(eq(markers.source, "import"), eq(markers.sourceId, values.sourceId)))
      .get();
    if (!existing) {
      tx.insert(markers).values(values).run();
      stats.inserted += 1;
    } else if (overwrite) {
      tx.update(markers).set(values).where(eq(markers.id, existing.id)).run();
      stats.updated += 1;
    } else {
      stats.skipped += 1;
    }
  }
});

console.log(
  `${dryRun ? "[dry run] " : ""}markers: ${stats.inserted} inserted, ${stats.updated} updated, ` +
    `${stats.skipped} skipped (existing), ${stats.outOfBounds} out of bounds; ` +
    `subcategories: ${subcategoryIds.size}; ` +
    `pixel bbox x ${bbox.minX.toFixed(0)}..${bbox.maxX.toFixed(0)} y ${bbox.minY.toFixed(0)}..${bbox.maxY.toFixed(0)} ` +
    `(map ${map.width}x${map.height})` +
    (wikiBase ? "" : "; no wiki base URL: relative wiki links were reduced to text"),
);

function ensureSubcategory(
  tx: Tx,
  parentId: number,
  doneVerb: string,
  rootSlug: RootSlug,
  name: string,
  icon: string,
): number {
  const slug = `${rootSlug}-${slugify(name)}`;
  const cached = subcategoryIds.get(slug);
  if (cached !== undefined) return cached;
  const existing = tx.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug)).get();
  const id =
    existing?.id ??
    tx
      .insert(categories)
      .values({ parentId, slug, name, icon, doneVerb, sortOrder: 100 })
      .returning({ id: categories.id })
      .get().id;
  subcategoryIds.set(slug, id);
  return id;
}

function argValue(flag: string): string | undefined {
  const index = argv.indexOf(flag);
  if (index >= 0) return argv[index + 1];
  const inline = argv.find((arg) => arg.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function readSourceConfig(): { wikiBaseUrl?: string } | undefined {
  const file = path.join(config.seedDir, "markers", "source.json");
  return existsSync(file) ? readJson<{ wikiBaseUrl?: string }>(file) : undefined;
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, "utf8")) as T;
}
