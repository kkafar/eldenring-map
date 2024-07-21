import { DatabaseProxy } from "./db"

export type Context = {
  db: DatabaseProxy,
}

export type User = {
  name: string,
}

