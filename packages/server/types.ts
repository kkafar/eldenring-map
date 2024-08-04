import { z } from "zod"
import { DatabaseProxy } from "./db"
import { UserSchema } from "./schemas"

export type Context = {
  db: DatabaseProxy,
}

export type User = z.infer<typeof UserSchema>;

export type Profile = {
  name: string,
}

export type DBUsersRow = {
  name: string,
}

export type DBProfilesRow = {
  user_name: string,
  profile_name: string,
}

export type ResponsePayload<T> = {
  data: T,
}

