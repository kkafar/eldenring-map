import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { publicProcedure, router } from "./trpc";
import cors from 'cors';

const appRouter = router({
  ping: publicProcedure
    .query(async () => {
      const response = { data: "pong" };
      return response;
    }),
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
});

console.log("Will be running server on port 8088");

server.listen(8088);
