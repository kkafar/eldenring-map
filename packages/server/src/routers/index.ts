import { router } from "../trpc/init.js";
import { categoriesRouter } from "./categories.js";
import { mapsRouter } from "./maps.js";
import { markersRouter } from "./markers.js";
import { notesRouter } from "./notes.js";
import { profilesRouter } from "./profiles.js";
import { progressRouter } from "./progress.js";

export const appRouter = router({
  maps: mapsRouter,
  categories: categoriesRouter,
  markers: markersRouter,
  profiles: profilesRouter,
  progress: progressRouter,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
