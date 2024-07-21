import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext, publicProcedure, router } from "./trpc";
import cors from 'cors';
import { z } from 'zod';

const appRouter = router({
  ping: publicProcedure
    .query(async () => {
      const response = { data: "pong" };
      return response;
    }),
  createUser: publicProcedure
    .input(z.object({
      userName: z.string(),
    }))
    .mutation(async (opts) => {
      const { input, ctx } = opts;
      ctx.db.insertUser({ name: input.userName });
    })
});

export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext,
});

console.log("Will be running server on port 8088");

server.listen(8088);

