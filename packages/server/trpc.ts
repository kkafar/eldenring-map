import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

import { Context } from "./types";
import { createConnection } from "./db";


export async function createContext(_: CreateNextContextOptions): Promise<Context> {
  return {
    db: createConnection()
  }
}

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

