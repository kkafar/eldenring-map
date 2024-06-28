import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { publicProcedure, router } from "./trpc";

const appRouter = router({
  ping: publicProcedure
    .query(async () => {
      const response = { data: "pong" };
      return response;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

server.listen(8088);

