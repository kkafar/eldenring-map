import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createContext, publicProcedure, router } from "./trpc";
import cors from 'cors';
import { z } from 'zod';
import { UserSchema } from './schemas';

const appRouter = router({
  ping: publicProcedure
    .query(async () => {
      console.log("Received 'ping' request");
      const response = { data: "pong" };
      return response;
    }),
  createUser: publicProcedure
    .input(z.object({
      userName: z.string(),
    }))
    .mutation(async (opts) => {
      console.log("Received 'createUser' request");
      const { input, ctx } = opts;
      ctx.db.insertUser({ name: input.userName });
    }),
  listUsers: publicProcedure
    .query(async (opts) => {
      console.log("Received 'listUsers' request");
      const { ctx } = opts;
      const userArray = await ctx.db.listUsers();
      return { data: userArray };
    }),
  listUserProfiles: publicProcedure
    .input(UserSchema)
    .query(async (opts) => {
      console.log("Received 'listUserProfiles' request");
      const { ctx, input } = opts;
      return { data: await ctx.db.listUserProfiles({ name: input.name }) };
    }),
  private_resetDatabase: publicProcedure
    .query(async (opts) => {
      console.log("Received 'private_resetDatabase' request");
      const { ctx } = opts;
      ctx.db.reset();
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

