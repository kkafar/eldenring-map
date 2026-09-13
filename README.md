# Elden Ring Map

Personal companion for Elden Ring playthroughs: an interactive map with markers for
locations, items, enemies and NPCs, per-profile discovered/collected tracking, notes,
filters and search. Single user, runs locally.

## Stack

- `packages/client`: Vite, React 19, TanStack Router + Query, tRPC client, Leaflet with a
  custom pixel CRS and an own canvas marker layer, Tailwind 4.
- `packages/server`: Node, Hono, tRPC, Drizzle ORM on SQLite (better-sqlite3).

## Setup

Requires Node 22+ and pnpm. The map images and the marker seed JSON are not in git; they
are expected under `packages/client/src/{assets,data}` (see `CLAUDE.md` for the layout).

```sh
pnpm install
pnpm --filter server import:assets    # copies tiles, icons, source maps and seed JSON into the server
pnpm --filter server import:markers   # imports the marker seed into the database (idempotent)
pnpm dev                              # client on http://localhost:3000, server on :8088
```

Optional: `pnpm --filter server tiles:generate <mapId> <source.png>` re-cuts a tile pyramid
with libvips (black padding), e.g. for `underground` from `storage/maps/m1-underground.png`.

## Everyday commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Runs both packages with hot reload |
| `pnpm typecheck` / `pnpm lint` / `pnpm format` | TypeScript, ESLint, Prettier |
| `pnpm test` | Server unit and router tests (vitest) |
| `pnpm build && pnpm start` | Production build; the server serves the built client on :8088 |
| `pnpm --filter server db:generate` | Generates a migration after editing `src/db/schema.ts` |

## Where things live

- Runtime data (gitignored): `packages/server/storage/` — tiles, icons, source maps,
  uploads, `main.db3`.
- Seed data (gitignored): `packages/server/seed/markers/`; calibration constants:
  `packages/server/seed/calibration.overworld.json`.
- Plan and decisions: `.claude/plans/elden-ring-map.md`.
