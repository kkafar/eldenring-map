// Cuts a {z}/{y}/{x}.jpg tile pyramid (Google layout, 256 px, black padding) from a
// source map image with libvips. Replaces storage/tiles/<mapId> atomically.
// Usage: pnpm --filter server tiles:generate <mapId> <source image>
//   e.g. pnpm --filter server tiles:generate overworld storage/maps/m0-overworld.png
import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { config } from "../config.js";

const [mapId, source] = process.argv.slice(2);
if (!mapId || !source) {
  console.error("usage: tiles:generate <mapId> <source image>");
  process.exit(1);
}

const target = path.join(config.dataDir, "tiles", mapId);
const staging = `${target}.staging`;
rmSync(staging, { recursive: true, force: true });

console.log(`cutting ${source} -> ${target}`);
execFileSync(
  "vips",
  ["dzsave", source, staging, "--layout", "google", "--tile-size", "256", "--overlap", "0", "--suffix", ".jpg[Q=85]", "--background", "0"],
  { stdio: "inherit" },
);

if (existsSync(target)) renameSync(target, `${target}.previous`);
renameSync(staging, target);
rmSync(`${target}.previous`, { recursive: true, force: true });
console.log("done");
