# Elden Ring Map

Personal web app for tracking Elden Ring playthroughs on an interactive map: markers for
locations / items / enemies, per-profile discovered/collected state, notes, filters, search.
Single user on localhost for now; data model and API are designed to grow to multi-user and
remote deployment later.

## Read first

- Product brief and requirements: `local.notes/goals.md` (gitignored, exists only on this machine)
- Notes on the pre-existing PoC: `local.notes/existing-structure.md` (gitignored)
- Implementation plan, decisions and open problems: `.claude/plans/elden-ring-map.md`

The plan is the source of truth for architecture decisions. When a problem in its section 5 is
decided, update its status there. When implementation diverges from the plan, update the plan.

## Layout

pnpm workspace with two packages:

- `packages/client`: Vite 7 + React 19 + TanStack Router (file routes) + TanStack Query + tRPC client
  + Tailwind 4 with hand-rolled Material 3 tokens in `src/styles/`.
- `packages/server`: Node + tRPC. Being rewritten to Hono + Drizzle ORM + better-sqlite3 (see plan).
- `scripts/`: Python helpers. `scrape.py` produced the marker data, `tileimg.py` cuts map tiles.

## Data (not in git)

- Marker data: `packages/client/src/data/items.json`, 3,131 records in 22 source categories.
  Coordinates are strings in the source map's Leaflet `CRS.Simple` lat/lng: `x` is lat (north–south,
  more negative = further south), `y` is lng (west–east). They are not image pixels; a calibration
  step maps them (plan, section 4.3).
- Images: `packages/client/src/assets/` (811 MB). The useful parts are
  `m0-overworld-tiled/{z}/{y}/{x}.jpg` (256 px JPEG pyramid, z0–z6, z6 = native 9728×9216,
  libvips `dzsave --layout google`), `maps/m0-overworld.png` and `maps/m1-underground.png`
  (9728×9216 sources), and `icons/` (103 game icons). Everything else there is a redundant re-cut.
- Planned home once Phase 0 lands: `packages/server/storage/` (tiles, maps, icons, uploads, db) and
  `packages/server/seed/` (seed JSON, calibration, taxonomy).
- Canonical marker coordinates inside the app: native pixels of the full-resolution map, y down.

## Commands (current PoC, change with Phase 0)

- `pnpm --filter client dev` runs Vite on :3000; `pnpm --filter server dev` runs tRPC on :8088.
- Root `pnpm dev` is broken until Phase 0 fixes the root scripts.

## Working conventions

- Research the repo with subagents and keep only their conclusions in the main context.
- Keep changes surgical and minimal; no speculative abstractions or unrequested features.
