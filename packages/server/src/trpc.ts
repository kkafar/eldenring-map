import { initTRPC } from "@trpc/server";
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getDataStoreProviderInstance } from './db';

import { Context } from "./types";


export async function createContext(_: CreateNextContextOptions): Promise<Context> {
  return {
    db: getDataStoreProviderInstance().getDataStore()
  }
}

const trpc = initTRPC.context<Context>().create();

export const router = trpc.router;
export const publicProcedure = trpc.procedure;

