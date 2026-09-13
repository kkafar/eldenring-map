// Copies the map tiles, icons, source map images and seed JSON from the client's
// untracked asset directories into packages/server/storage and packages/server/seed.
// Usage: pnpm --filter server import:assets [path/to/client/src]
import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "../config.js";

const packageRoot = fileURLToPath(new URL("../..", import.meta.url));
const source = path.resolve(process.argv[2] ?? path.join(packageRoot, "..", "client", "src"));

const jobs: Array<[relativeSource: string, destination: string]> = [
  ["assets/m0-overworld-tiled", path.join(config.dataDir, "tiles", "overworld")],
  ["assets/m0-overworld-tiled/blank.png", path.join(config.dataDir, "tiles", "blank.png")],
  ["assets/icons", path.join(config.dataDir, "icons")],
  ["assets/maps/m0-overworld.png", path.join(config.dataDir, "maps", "m0-overworld.png")],
  ["assets/maps/m1-underground.png", path.join(config.dataDir, "maps", "m1-underground.png")],
  ["data/items.json", path.join(packageRoot, "seed", "markers", "items.json")],
  ["data/categories.json", path.join(packageRoot, "seed", "markers", "categories.json")],
];

for (const [relativeSource, destination] of jobs) {
  const from = path.join(source, relativeSource);
  await stat(from); // throws with a clear ENOENT if the source is missing
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(from, destination, { recursive: true, force: false, errorOnExist: false });
  console.log(`copied ${relativeSource} -> ${path.relative(packageRoot, destination)}`);
}
